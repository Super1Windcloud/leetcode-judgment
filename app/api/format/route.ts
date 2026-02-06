import { type NextRequest, NextResponse } from "next/server";
import { exec } from "node:child_process";

export async function POST(req: NextRequest) {
  try {
    const { language, code } = await req.json();

    if (!language || typeof code !== "string") {
      return NextResponse.json(
        { error: "Language and code are required" },
        { status: 400 },
      );
    }

    let cmd = "";
    const args: string[] = [];

    switch (language.toLowerCase()) {
      case "c":
      case "cpp":
      case "csharp":
      case "java":
        cmd = "clang-format";
        args.push("-style=Google");
        break;
      case "go":
        cmd = "gofmt";
        break;
      case "python":
        cmd = "black";
        // - reads from stdin, 2>/dev/null to suppress stderr (or handle in callback)
        // black outputs to stdout when - is used.
        args.push("-"); 
        break;
      case "rust":
        cmd = "rustfmt";
        // rustfmt reads from stdin by default if no args, and emits to stdout
        break;
      case "php":
        // PHP-CS-Fixer is complex to use via stdin/stdout for snippets without config.
        // Fallback to client-side or no-op.
        return NextResponse.json({ formatted: code });
      default:
        // Language not supported by backend formatter
        return NextResponse.json({ formatted: code });
    }

    // Wrap execution in a promise
    const formatted = await new Promise<string>((resolve, reject) => {
      const child = exec(
        `${cmd} ${args.join(" ")}`,
        { timeout: 5000 }, // 5s timeout
        (error, stdout, stderr) => {
          if (error) {
            // Distinguish between command not found and execution error (syntax)
            // But for now, any error is a failure to format.
            // console.warn(`Formatter ${cmd} failed:`, stderr || error.message);
            reject(error);
          } else {
            resolve(stdout);
          }
        },
      );

      if (child.stdin) {
        child.stdin.write(code);
        child.stdin.end();
      }
    });

    return NextResponse.json({ formatted });
  } catch (error) {
    console.error("Format API Error:", error);
    // Return error status so frontend can fallback to simple indentation
    return NextResponse.json(
      { error: "Formatting failed" },
      { status: 500 },
    );
  }
}
