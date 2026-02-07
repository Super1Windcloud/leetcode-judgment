mod constants;
mod languages;
mod network;
mod sandbox;

use crate::{constants::*, languages::*, sandbox::invoke};
use nix::sys::signal::{SigHandler, Signal, signal};
use serde::{Deserialize, Serialize, de::DeserializeOwned};
use serde_bytes::ByteBuf;
use std::io::{BufRead, BufReader, Read, Write};
use std::net::{SocketAddr, TcpListener, TcpStream};
use std::process::{Command, Stdio};
use tungstenite as ws;
use tungstenite::handshake::server as http;
use tungstenite::http::StatusCode;
use tungstenite::protocol::WebSocketConfig;

fn get_bind_address() -> SocketAddr {
    use std::str::FromStr;
    SocketAddr::from_str(&std::env::var("JD_BIND").unwrap_or_else(|e| {
        if let std::env::VarError::NotUnicode(_) = e {
            panic!("$JD_BIND is invalid Unicode")
        }
        "[::]:8500".to_string()
    }))
    .expect("$JD_BIND is not a valid address")
}

/// analogous to std::thread::spawn but forks a full new process instead of a thread
fn fork_spawn<F>(f: F)
where
    F: FnOnce(),
    F: 'static,
{
    use nix::unistd::{ForkResult, fork};
    // this is safe as long as the program only has one thread so far
    match unsafe { fork() }.unwrap() {
        ForkResult::Parent { .. } => {}
        ForkResult::Child => {
            f();
            std::process::exit(0);
        }
    }
}

fn main() {
    // tell the kernel not to keep zombie processes around
    // see waitpid(2) § NOTES and https://elixir.bootlin.com/linux/v6.1.2/source/kernel/signal.c#L2089
    // this is safe because there was no previous signal handler function
    unsafe { signal(Signal::SIGCHLD, SigHandler::SigIgn) }.unwrap();

    let addr = get_bind_address();
    eprintln!("Starting JD server on {addr}...");
    let server = TcpListener::bind(addr).unwrap();
    for connection in server.incoming() {
        if let Ok(conn) = connection {
            fork_spawn(move || handle_ws(conn));
        }
    }
}

#[derive(Deserialize)]
struct FormatRequest {
    language: String,
    code: String,
}

#[derive(Serialize)]
struct FormatResponse {
    formatted: Option<String>,
    error: Option<String>,
}

fn format_code(language: &str, code: &str) -> (Option<String>, Option<String>) {
    eprintln!("Formatting language: '{}'", language);
    let mut cmd = match language.to_lowercase().as_str() {
        "c" | "cpp" | "c++" | "csharp" | "java" => {
            let mut c = Command::new("clang-format");
            c.arg("-style=Google");
            c
        }
        "go" => Command::new("gofmt"),
        "python" | "py" => {
            let mut c = Command::new("python3");
            c.arg("-m");
            c.arg("black");
            c.arg("-");
            c.arg("-q");
            c
        }
        "rust" => {
            let mut c = Command::new("rustfmt");
            c.arg("--edition");
            c.arg("2021");
            c
        }
        "php" => {
            // php-cs-fixer is very picky about stdin, use a temp file approach
            let temp_dir = std::env::temp_dir();
            let temp_file = temp_dir.join(format!("format_{}.php", uuid::Uuid::new_v4()));
            if let Err(e) = std::fs::write(&temp_file, code) {
                return (None, Some(format!("Failed to write temp file: {}", e)));
            }
            
            let mut c = Command::new("php-cs-fixer");
            c.arg("fix");
            c.arg(&temp_file);
            c.arg("--rules=@PSR12");
            c.arg("--using-cache=no");
            c.arg("-q");
            c.arg("--no-interaction");
            
            let output = match c.output() {
                Ok(o) => o,
                Err(e) => {
                    let _ = std::fs::remove_file(&temp_file);
                    return (None, Some(e.to_string()));
                }
            };
            
            let formatted = if output.status.success() || output.status.code() == Some(8) {
                std::fs::read_to_string(&temp_file).ok()
            } else {
                None
            };
            
            let error = if formatted.is_none() {
                Some(String::from_utf8_lossy(&output.stderr).to_string())
            } else {
                None
            };
            
            let _ = std::fs::remove_file(&temp_file);
            return (formatted, error);
        }
        _ => {
            eprintln!("No formatter for: {}", language);
            return (Some(code.to_string()), None);
        },
    };

    cmd.stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let mut child = match cmd.spawn() {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Failed to spawn formatter: {}", e);
            return (None, Some(e.to_string()));
        }
    };

    if let Some(mut stdin) = child.stdin.take() {
        if let Err(e) = stdin.write_all(code.as_bytes()) {
            eprintln!("Failed to write to formatter stdin: {}", e);
        }
    }

    let output = match child.wait_with_output() {
        Ok(o) => o,
        Err(e) => {
            eprintln!("Failed to wait for formatter: {}", e);
            return (None, Some(e.to_string()));
        }
    };

    if output.status.success() {
        (
            Some(String::from_utf8_lossy(&output.stdout).to_string()),
            None,
        )
    } else {
        let err_msg = String::from_utf8_lossy(&output.stderr).to_string();
        eprintln!("Formatter failed with status {}: {}", output.status, err_msg);
        (
            None,
            Some(err_msg),
        )
    }
}

fn handle_format_api(mut connection: TcpStream) {
    let mut reader = BufReader::new(connection.try_clone().unwrap());
    let mut line = String::new();
    let mut content_length = 0;

    loop {
        line.clear();
        match reader.read_line(&mut line) {
            Ok(0) => return,
            Ok(_) => {
                if line == "\r\n" {
                    break;
                }
                if line.to_lowercase().starts_with("content-length:") {
                    if let Some(val) = line.split(':').nth(1) {
                        content_length = val.trim().parse().unwrap_or(0);
                    }
                }
            }
            Err(_) => return,
        }
    }

    if content_length == 0 {
        return;
    }

    let mut body = vec![0u8; content_length];
    if reader.read_exact(&mut body).is_err() {
        return;
    }

    let req: FormatRequest = match serde_json::from_slice(&body) {
        Ok(v) => v,
        Err(_) => return,
    };

    let (formatted, error) = format_code(&req.language, &req.code);
    let resp = FormatResponse { formatted, error };
    let resp_json = serde_json::to_string(&resp).unwrap();

    let response = format!(
        "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
        resp_json.len(),
        resp_json
    );

    let _ = connection.write_all(response.as_bytes());
    let _ = connection.flush();
}

fn handle_ws(mut connection: TcpStream) {
    // 立即设置超时，防止恶意连接或慢速连接卡住进程
    let _ = connection.set_read_timeout(Some(std::time::Duration::from_secs(5)));

    // tell the kernel that we now *do* care about our child processes
    unsafe { signal(Signal::SIGCHLD, SigHandler::SigDfl) }.unwrap();

    // 尝试读取请求头以区分普通的 HTTP 请求和 WebSocket 请求
    let mut buffer = [0; 4096];
    let n = match connection.peek(&mut buffer) {
        Ok(n) => n,
        Err(e) => {
            eprintln!("Peek failed or timed out: {e}");
            return;
        }
    };
    let request_str = String::from_utf8_lossy(&buffer[..n]);
    let request_lower = request_str.to_lowercase();

    if let Some(first_line) = request_str.lines().next() {
        eprintln!("Incoming request: {}", first_line);
    }

    if request_str.starts_with("POST /api/format ") {
        handle_format_api(connection);
        return;
    }

    // 如果是访问 /test 的普通 GET 请求
    if request_str.starts_with("GET /test ") {
        use std::io::Write;
        let html = include_str!("test-console.html");
        let response = format!(
            "HTTP/1.1 200 OK\r\n\
             Content-Type: text/html; charset=utf-8\r\n\
             Content-Length: {}\r\n\
             Connection: close\r\n\
             \r\n\
             {}",
            html.len(),
            html
        );
        let _ = connection.write_all(response.as_bytes());
        let _ = connection.flush();
        return;
    }

    // 对于其他非 WebSocket 升级的普通 HTTP 请求，返回 404
    if request_str.starts_with("GET ") && !request_lower.contains("upgrade: websocket") {
        use std::io::Write;
        let response = "HTTP/1.1 404 Not Found\r\n\
                        Content-Type: text/plain\r\n\
                        Connection: close\r\n\
                        \r\n\
                        Not Found. Visit /test for the console.";
        let _ = connection.write_all(response.as_bytes());
        let _ = connection.flush();
        return;
    }

    // 否则，交给 tungstenite 处理 WebSocket 握手
    use std::os::fd::AsRawFd;
    let connection_fd = connection.as_raw_fd();
    let mut config = WebSocketConfig::default();
    config.max_message_size = Some(MAX_REQUEST_SIZE);
    let websocket =
        match tungstenite::accept_hdr_with_config(connection, handle_headers, Some(config)) {
            Ok(ws) => ws,
            Err(e) => {
                // 如果是 favicon 或随机探测，不打印错误以保持日志整洁
                if !request_str.contains("favicon") {
                    eprintln!("WebSocket handshake failed: {e}");
                }
                return;
            }
        };
    let mut connection = Connection(websocket);

    // 握手成功后，将读取超时设置为更长的时间（例如 1 小时），允许用户在界面停留
    let _ = connection
        .0
        .get_ref()
        .set_read_timeout(Some(std::time::Duration::from_secs(3600)));

    loop {
        use std::borrow::Cow;
        use tungstenite::protocol::frame::{CloseFrame, coding::CloseCode};

        fn close<'a>(
            connection: &mut Connection,
            code: CloseCode,
            reason: impl Into<Cow<'a, str>>,
        ) -> Result<(), ws::Error> {
            let frame = CloseFrame {
                code,
                reason: reason.into(),
            };
            connection.0.close(Some(frame))
        }

        let closed = match handle_request(&mut connection, connection_fd) {
            Ok(()) => continue, // don't close
            Err(Error::ClientWentAway) => connection.0.close(None),
            Err(Error::TooLarge(size)) => close(
                &mut connection,
                CloseCode::Size,
                format!(
                    "received message of size {size}, greater than size limit {MAX_REQUEST_SIZE}"
                ),
            ),
            Err(Error::UnsupportedData) => close(
                &mut connection,
                CloseCode::Unsupported,
                "expected a binary message",
            ),
            Err(Error::PolicyViolation(e)) => close(
                &mut connection,
                CloseCode::Policy,
                format!("invalid request: {e}"),
            ),
            Err(Error::InternalError(e)) => {
                eprintln!("{e}");
                close(&mut connection, CloseCode::Error, e)
            }
        };
        match closed {
            Ok(()) | Err(ws::Error::ConnectionClosed) => (),
            Err(e) => {
                // can't do anything but log it
                eprintln!("error closing websocket: {e}")
            }
        }
        break;
    }
    /* loop {
        match connection.0.write_pending() {
            Ok(()) => continue,
            Err(ws::Error::ConnectionClosed) => break,
            Err(e) => panic!("{e}"),
        }
    } */
}

fn handle_headers(
    request: &http::Request,
    response: http::Response,
) -> Result<http::Response, http::ErrorResponse> {
    if request.uri() == "/test" {
        let response = http::Response::builder()
            .status(StatusCode::OK)
            .header("Content-Type", "text/html; charset=utf-8")
            .body(Some(include_str!("test-console.html").to_string()))
            .unwrap();
        Err(response)
    } else if request.uri() != "/api/v1/ws/execute" {
        let response = http::Response::builder()
            .status(StatusCode::NOT_FOUND)
            .body(Some(
                "the only supported API URL is /api/v1/ws/execute, or try /test for the console"
                    .to_string(),
            ))
            .unwrap();
        Err(response)
    } else {
        Ok(response)
    }
}

#[derive(Serialize)]
enum StreamResponse {
    Stdout(ByteBuf),
    Stderr(ByteBuf),
    Done {
        timed_out: bool,
        stdout_truncated: bool,
        stderr_truncated: bool,
        status_type: &'static str,
        status_value: i32,
        real: i64,
        kernel: i64,
        user: i64,
        max_mem: i64,
        waits: i64,
        preemptions: i64,
        major_page_faults: i64,
        minor_page_faults: i64,
        input_ops: i64,
        output_ops: i64,
    },
}

#[allow(dead_code)]
#[derive(Debug, Deserialize)]
pub struct Request {
    pub language: String,
    pub code: ByteBuf,
    #[serde(default /* = None */)]
    pub custom_runner: Option<ByteBuf>,
    pub input: ByteBuf,
    pub arguments: Vec<ByteBuf>,
    pub options: Vec<ByteBuf>,
    #[serde(default = "default_timeout")]
    pub timeout: i32,
}

fn default_timeout() -> i32 {
    60
}

#[derive(Debug)]
pub enum Error {
    ClientWentAway,
    TooLarge(usize),
    UnsupportedData,
    PolicyViolation(String),
    InternalError(String),
}

/// like the ? postfix operator, but formats errors to strings
macro_rules! check {
    ($x:expr, $f:literal $(, $($a:expr),+)? $(,)?) => {
        $x.map_err(|e| Error::InternalError(format!($f, $($($a,)*)? e)))?
    };
    ($x:expr $(,)?) => {
        $x.map_err(|e| Error::InternalError(e.to_string()))?
    }
}

pub(crate) use check;

fn handle_request(connection: &mut Connection, connection_fd: i32) -> Result<(), Error> {
    let request = connection.read_message()?;
    let language = validate(&request)?;
    invoke(&request, language, connection, connection_fd)
}

fn validate(request: &Request) -> Result<&Language, Error> {
    if request.timeout < 1 || request.timeout > 60 {
        return Err(Error::PolicyViolation(format!(
            "timeout not in range 1-60: {}",
            request.timeout
        )));
    }
    for arg in request.options.iter().chain(request.arguments.iter()) {
        if arg.contains(&0) {
            return Err(Error::PolicyViolation(
                "argument contains null byte".to_string(),
            ));
        }
    }
    if let Some(l) = LANGUAGES.get(&request.language) {
        Ok(l)
    } else {
        Err(Error::PolicyViolation(format!(
            "no such language: {}",
            &request.language
        )))
    }
}

#[derive(Debug, Deserialize)]
pub enum ControlMessage {
    Kill,
}

#[derive(Debug)]
pub struct Connection(ws::WebSocket<TcpStream>);

impl Connection {
    pub fn read_message<T: DeserializeOwned>(&mut self) -> Result<T, Error> {
        let message = match self.0.read_message() {
            Ok(ws::Message::Binary(b)) => b,
            Ok(ws::Message::Close(_)) | Err(ws::Error::ConnectionClosed) => {
                return Err(Error::ClientWentAway);
            }
            Ok(_) => return Err(Error::UnsupportedData),
            Err(ws::Error::Capacity(ws::error::CapacityError::MessageTooLong { size, .. })) => {
                return Err(Error::TooLarge(size));
            }
            Err(e) => {
                let e = format!("error reading request: {e}");
                return Err(Error::InternalError(e));
            }
        };
        let cursor = std::io::Cursor::new(&message);
        let mut de = rmp_serde::Deserializer::new(cursor);
        match <T as Deserialize>::deserialize(&mut de) {
            Ok(r) => {
                let read_pos = de.get_ref().position() as usize;
                if read_pos != message.len() {
                    Err(Error::PolicyViolation("found extra data".to_string()))
                } else {
                    Ok(r)
                }
            }
            Err(e) => Err(Error::PolicyViolation(e.to_string())),
        }
    }

    pub fn output_message<T: Serialize>(&mut self, message: T) -> Result<(), Error> {
        let encoded_message = check!(
            rmp_serde::to_vec_named(&message),
            "error encoding output message: {}"
        );
        match self.0.write_message(ws::Message::Binary(encoded_message)) {
            Ok(()) => Ok(()),
            Err(ws::Error::ConnectionClosed) => Err(Error::ClientWentAway),
            Err(e) => Err(Error::InternalError(format!(
                "error writing output message: {e}"
            ))),
        }
    }
}
