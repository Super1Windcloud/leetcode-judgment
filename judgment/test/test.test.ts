import { expect, test, describe } from 'vitest';
import WebSocket from 'ws';
import { encode, decode } from '@msgpack/msgpack';
import { readFileSync } from 'fs';
import { join } from 'path';

const URL = process.env.URL || 'ws://localhost:8500/api/v1/ws/execute';
const sec = 1e9;
const KiB = 1024;
const MiB = 1024 * KiB;
const CHUNK_SIZE = 16 * KiB;
const SIGKILL = 9;

interface Request {
    language: string;
    code: Uint8Array;
    custom_runner?: Uint8Array;
    input: Uint8Array;
    arguments: Uint8Array[];
    options: Uint8Array[];
    timeout: number;
}

interface DoneResponse {
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

type Response = 
    | { Stdout: Uint8Array }
    | { Stderr: Uint8Array }
    | { Done: DoneResponse };

function toBytes(x: string | Uint8Array | number[] | undefined): Uint8Array {
    if (x === undefined) return new Uint8Array();
    if (typeof x === 'string') return new TextEncoder().encode(x);
    if (Array.isArray(x)) return new Uint8Array(x);
    return x;
}

function createRequest(params: {
    code: string | Uint8Array;
    custom_runner?: string | Uint8Array;
    input?: string | Uint8Array;
    options?: (string | Uint8Array)[];
    arguments?: (string | Uint8Array)[];
    language?: string;
    timeout?: number;
}): Uint8Array {
    const req: Request = {
        language: params.language || 'bash',
        code: toBytes(params.code),
        custom_runner: params.custom_runner ? toBytes(params.custom_runner) : undefined,
        input: toBytes(params.input),
        arguments: (params.arguments || []).map(toBytes),
        options: (params.options || []).map(toBytes),
        timeout: params.timeout ?? 60,
    };
    return encode(req);
}

const connect = (): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(URL);
        ws.on('open', () => resolve(ws));
        ws.on('error', reject);
    });
};

const recv = (ws: WebSocket): Promise<Response> => {
    return new Promise((resolve, reject) => {
        ws.once('message', (data) => {
            if (Buffer.isBuffer(data)) {
                resolve(decode(data) as Response);
            } else {
                reject(new Error('Expected binary message'));
            }
        });
        ws.once('error', reject);
        ws.once('close', (code, reason) => reject(new Error(`Closed: ${code} ${reason}`)));
    });
};

describe('Judgment System Tests', () => {
    test('test_noop', async () => {
        const ws = await connect();
        ws.close();
    });

    test('test_basic_execution', async () => {
        const ws = await connect();
        ws.send(createRequest({code: ''}));
        const r = await recv(ws);
        
        expect(r).toHaveProperty('Done');
        const done = (r as { Done: DoneResponse }).Done;
        
        expect(done.real).toBeLessThan(0.1 * sec);
        expect(done.max_mem).toBeGreaterThan(1000);
        expect(done.max_mem).toBeLessThan(100_000);
        expect(done.status_type).toBe('exited');
        expect(done.status_value).toBe(0);
        ws.close();
    });

    test('test_stdout', async () => {
        const ws = await connect();
        ws.send(createRequest({code: 'echo hello'}));
        const r1 = await recv(ws);
        expect(r1).toEqual({ Stdout: new TextEncoder().encode('hello\n') });
        const r2 = await recv(ws);
        expect(r2).toHaveProperty('Done');
        ws.close();
    });

    test('test_stderr', async () => {
        const ws = await connect();
        ws.send(createRequest({code: 'echo hello >&2'}));
        const r1 = await recv(ws);
        expect(r1).toEqual({ Stderr: new TextEncoder().encode('hello\n') });
        const r2 = await recv(ws);
        expect(r2).toHaveProperty('Done');
        ws.close();
    });

    test('test_stdin', async () => {
        const ws = await connect();
        ws.send(createRequest({code: 'rev', input: 'hello'}));
        const r1 = await recv(ws);
        expect(r1).toEqual({ Stdout: new TextEncoder().encode('olleh') });
        const r2 = await recv(ws);
        expect(r2).toHaveProperty('Done');
        ws.close();
    });

    test('test_custom_runner', async () => {
        const ws = await connect();
        ws.send(createRequest({
            code: 'hello',
            custom_runner: 'rev /ATO/code'
        }));
        const r1 = await recv(ws);
        expect(new TextDecoder().decode((r1 as { Stdout: Uint8Array }).Stdout)).toBe('olleh');
        const r2 = await recv(ws);
        expect(r2).toHaveProperty('Done');
        ws.close();
    });

    test('test_timeout', async () => {
        const ws = await connect();
        ws.send(createRequest({code: 'sleep 3', timeout: 1}));
        const r = await recv(ws);
        const done = (r as { Done: DoneResponse }).Done;
        expect(done.timed_out).toBe(true);
        expect(done.status_type).toBe('killed');
        expect(done.status_value).toBe(SIGKILL);
        ws.close();
    });

    test('test_kill', async () => {
        const ws = await connect();
        ws.send(createRequest({code: 'sleep 3'}));
        // Wait a bit
        await new Promise(r => setTimeout(r, 500));
        ws.send(encode('Kill'));
        const r = await recv(ws);
        const done = (r as { Done: DoneResponse }).Done;
        expect(done.status_type).toBe('killed');
        expect(done.status_value).toBe(SIGKILL);
        ws.close();
    });

    test('test_tmp', async () => {
        const ws = await connect();
        ws.send(createRequest({code: 'touch /tmp/foo; ls /tmp'}));
        const r1 = await recv(ws);
        expect(new TextDecoder().decode((r1 as { Stdout: Uint8Array }).Stdout)).toBe('foo\n');
        ws.close();
    });
});

describe('Hello World Tests', () => {
    const languages = JSON.parse(readFileSync(join(__dirname, '../languages.json'), 'utf8'));
    
    for (const [id, lang] of Object.entries(languages) as [string, any][]) {
        if (lang.hello_world) {
            test(`Hello World: ${id}`, async () => {
                const ws = await connect();
                ws.send(createRequest({
                    ...lang.hello_world,
                    language: id
                }));
                
                let output = '';
                let done = false;
                while (!done) {
                    const r = await recv(ws);
                    if ('Stdout' in r) {
                        output += new TextDecoder().decode(r.Stdout);
                    } else if ('Done' in r) {
                        done = true;
                    }
                }
                expect(output).toBe(lang.hello_world.output);
                ws.close();
            }, 30000); // Higher timeout for some languages
        }
    }
});
