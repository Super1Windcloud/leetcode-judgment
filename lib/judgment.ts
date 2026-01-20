import { decode, encode } from "@msgpack/msgpack";

export interface DoneResponse {
	timed_out: boolean;
	stdout_truncated: boolean;
	stderr_truncated: boolean;
	status_type: string;
	status_value: number;
	real: number;
	kernel: number;
	user: number;
	max_mem: number;
	waits: number;
	preemptions: number;
	major_page_faults: number;
	minor_page_faults: number;
	input_ops: number;
	output_ops: number;
}

export type JudgmentResponse =
	| { Stdout: Uint8Array }
	| { Stderr: Uint8Array }
	| { Done: DoneResponse };

export interface ExecuteRequest {
	language: string;
	code: string;
	input?: string;
	timeout?: number;
}

const DEFAULT_WS_URL = "ws://localhost:8500/api/v1/ws/execute";

export class JudgmentClient {
	private ws: WebSocket | null = null;
	private url: string;

	constructor(url: string = DEFAULT_WS_URL) {
		this.url = url;
	}

	async execute(
		params: ExecuteRequest,
		onMessage: (msg: JudgmentResponse) => void,
	): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				const ws = new WebSocket(this.url);
				this.ws = ws;
				ws.binaryType = "arraybuffer";

				ws.onopen = () => {
					const req = {
						language: params.language,
						code: new TextEncoder().encode(params.code),
						input: new TextEncoder().encode(params.input || ""),
						arguments: [],
						options: [],
						timeout: params.timeout || 10,
					};
					ws.send(encode(req));
				};

				ws.onmessage = (event: MessageEvent) => {
					const data = new Uint8Array(event.data);
					const decoded = decode(data) as JudgmentResponse;
					onMessage(decoded);

					if ("Done" in decoded) {
						ws.close();
						resolve();
					}
				};

				ws.onerror = (error) => {
					console.error("Judgment WebSocket error:", error);
					reject(error);
				};

				ws.onclose = () => {
					this.ws = null;
				};
			} catch (error) {
				reject(error);
			}
		});
	}

	kill() {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(encode("Kill"));
		}
	}
}
