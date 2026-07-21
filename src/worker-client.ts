import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Value } from "@sinclair/typebox/value";

import {
  WorkerResponseSchema,
  type WorkerOperation,
  type WorkerResponse,
} from "./protocol.js";

const DEFAULT_DIAGNOSTIC_BYTES = 16 * 1024;
const MAX_PROTOCOL_LINE_BYTES = 10 * 1024 * 1024;
const DEFAULT_SHUTDOWN_TIMEOUT_MS = 2_000;
const STABLE_WORKER_ERROR_CODES = new Set([
  "destination_exists",
  "duplicate_request_id",
  "file_error",
  "internal_error",
  "invalid_destination",
  "invalid_params",
  "invalid_profile",
  "invalid_request",
  "invalid_upload",
  "invalid_url",
  "malformed_json",
  "network_error",
  "request_cancelled",
  "timeout",
  "unknown_operation",
  "unknown_session",
  "unknown_websocket",
  "worker_error",
]);

export interface WorkerClientOptions {
  command?: string;
  args?: string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  maxDiagnosticBytes?: number;
  shutdownTimeoutMs?: number;
}

interface PendingCall {
  resolve: (result: unknown) => void;
  reject: (error: Error) => void;
  removeAbortListener?: () => void;
}

export class WorkerCallError extends Error {
  readonly code: string;
  readonly retryable: boolean;

  constructor(code: string, retryable: boolean) {
    super(`Worker operation failed (${safeCode(code)})`);
    this.name = "WorkerCallError";
    this.code = safeCode(code);
    this.retryable = retryable;
  }
}

export class WorkerClient {
  private readonly command: string;
  private readonly args: string[];
  private readonly cwd: string;
  private readonly env: NodeJS.ProcessEnv;
  private readonly maxDiagnosticBytes: number;
  private readonly shutdownTimeoutMs: number;
  private child?: ChildProcessWithoutNullStreams;
  private startPromise?: Promise<void>;
  private stopPromise?: Promise<void>;
  private pending = new Map<string, PendingCall>();
  private stdoutBuffer = "";
  private diagnosticTail = Buffer.alloc(0);
  private crashCount = 0;
  private failedPermanently = false;
  private stopping = false;

  constructor(options: WorkerClientOptions = {}) {
    const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
    this.command = options.command ?? resolvePythonCommand(packageRoot);
    this.args = options.args ? [...options.args] : ["-m", "decent_curl_impersonate"];
    this.cwd = options.cwd ?? packageRoot;
    this.env = options.env ?? process.env;
    this.maxDiagnosticBytes = options.maxDiagnosticBytes ?? DEFAULT_DIAGNOSTIC_BYTES;
    this.shutdownTimeoutMs = options.shutdownTimeoutMs ?? DEFAULT_SHUTDOWN_TIMEOUT_MS;
  }

  async start(): Promise<void> {
    if (this.child) return;
    if (this.stopping) throw new Error("Worker is shutting down");
    if (this.failedPermanently) throw new Error("Worker exited repeatedly and will not restart");
    if (this.startPromise) return this.startPromise;

    this.startPromise = new Promise<void>((resolveStart, rejectStart) => {
      const child = spawn(this.command, this.args, {
        cwd: this.cwd,
        env: this.env,
        stdio: ["pipe", "pipe", "pipe"],
      });
      this.child = child;
      this.stdoutBuffer = "";
      this.diagnosticTail = Buffer.alloc(0);

      let spawned = false;
      child.once("spawn", () => {
        spawned = true;
        resolveStart();
      });
      child.once("error", () => {
        const error = new Error("Worker process failed to start");
        if (!spawned) rejectStart(error);
        this.handleUnexpectedExit(child, error);
      });
      child.once("exit", (code, signal) => {
        const suffix = signal ? ` (${signal})` : code === null ? "" : ` (code ${code})`;
        this.handleUnexpectedExit(child, new Error(`Worker process exited${suffix}`));
      });
      child.stdout.setEncoding("utf8");
      child.stdout.on("data", (chunk: string) => this.handleStdout(child, chunk));
      child.stderr.on("data", (chunk: Buffer) => this.captureDiagnostic(chunk));
    }).finally(() => {
      this.startPromise = undefined;
    });

    return this.startPromise;
  }

  async call(
    operation: WorkerOperation,
    params: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<unknown> {
    if (signal?.aborted) throw cancellationError();
    await this.start();
    if (signal?.aborted) throw cancellationError();
    const child = this.child;
    if (!child) throw new Error("Worker process exited before the operation started");
    return this.send(child, operation, params, signal);
  }

  async stop(): Promise<void> {
    if (this.stopPromise) return this.stopPromise;
    this.stopPromise = this.stopInternal().finally(() => {
      this.stopPromise = undefined;
    });
    return this.stopPromise;
  }

  private async stopInternal(): Promise<void> {
    const child = this.child;
    if (!child) {
      this.resetAfterStop();
      return;
    }

    this.stopping = true;
    try {
      const shutdown = this.send(child, "system.shutdown", {}, undefined);
      await withTimeout(shutdown, this.shutdownTimeoutMs);
      await this.waitForExit(child, this.shutdownTimeoutMs);
    } catch {
      if (child.exitCode === null && child.signalCode === null) child.kill();
      await this.waitForExit(child, this.shutdownTimeoutMs).catch(() => undefined);
    } finally {
      if (this.child === child) this.child = undefined;
      this.rejectAll(new Error("Worker stopped"));
      this.resetAfterStop();
    }
  }

  private resetAfterStop(): void {
    this.stopping = false;
    this.crashCount = 0;
    this.failedPermanently = false;
    this.stdoutBuffer = "";
    this.diagnosticTail = Buffer.alloc(0);
  }

  private send(
    child: ChildProcessWithoutNullStreams,
    operation: WorkerOperation,
    params: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<unknown> {
    const id = randomUUID();
    return new Promise((resolveCall, rejectCall) => {
      const pending: PendingCall = { resolve: resolveCall, reject: rejectCall };
      if (signal) {
        const onAbort = () => {
          const active = this.pending.get(id);
          if (!active) return;
          this.pending.delete(id);
          active.removeAbortListener?.();
          rejectCall(cancellationError());
        };
        signal.addEventListener("abort", onAbort, { once: true });
        pending.removeAbortListener = () => signal.removeEventListener("abort", onAbort);
      }
      this.pending.set(id, pending);

      const payload = JSON.stringify({ id, operation, params });
      child.stdin.write(`${payload}\n`, (error) => {
        if (!error) return;
        const active = this.pending.get(id);
        if (!active) return;
        this.pending.delete(id);
        active.removeAbortListener?.();
        active.reject(new Error("Unable to send operation to worker"));
      });
    });
  }

  private handleStdout(child: ChildProcessWithoutNullStreams, chunk: string): void {
    if (this.child !== child) return;
    this.stdoutBuffer += chunk;
    if (Buffer.byteLength(this.stdoutBuffer) > MAX_PROTOCOL_LINE_BYTES && !this.stdoutBuffer.includes("\n")) {
      this.protocolFailure(child);
      return;
    }

    let newline = this.stdoutBuffer.indexOf("\n");
    while (newline !== -1) {
      const line = this.stdoutBuffer.slice(0, newline).replace(/\r$/, "");
      this.stdoutBuffer = this.stdoutBuffer.slice(newline + 1);
      if (line.length > 0 && !this.handleLine(line)) {
        this.protocolFailure(child);
        return;
      }
      newline = this.stdoutBuffer.indexOf("\n");
    }
  }

  private handleLine(line: string): boolean {
    let response: WorkerResponse;
    try {
      const value: unknown = JSON.parse(line);
      if (!Value.Check(WorkerResponseSchema, value)) return false;
      response = value;
    } catch {
      return false;
    }

    const pending = this.pending.get(response.id);
    if (!pending) return true;
    this.pending.delete(response.id);
    pending.removeAbortListener?.();
    if (response.ok) pending.resolve(response.result);
    else pending.reject(new WorkerCallError(response.error.code, response.error.retryable));
    return true;
  }

  private protocolFailure(child: ChildProcessWithoutNullStreams): void {
    this.handleUnexpectedExit(child, new Error("Worker emitted malformed output"));
    if (child.exitCode === null && child.signalCode === null) child.kill();
  }

  private handleUnexpectedExit(child: ChildProcessWithoutNullStreams, error: Error): void {
    if (this.child !== child) return;
    this.child = undefined;
    this.stdoutBuffer = "";
    this.rejectAll(error);
    if (!this.stopping) {
      this.crashCount += 1;
      if (this.crashCount >= 2) this.failedPermanently = true;
    }
  }

  private rejectAll(error: Error): void {
    const calls = [...this.pending.values()];
    this.pending.clear();
    for (const pending of calls) {
      pending.removeAbortListener?.();
      pending.reject(error);
    }
  }

  private captureDiagnostic(chunk: Buffer): void {
    if (this.maxDiagnosticBytes <= 0) return;
    this.diagnosticTail = Buffer.concat([this.diagnosticTail, chunk]);
    if (this.diagnosticTail.byteLength > this.maxDiagnosticBytes) {
      this.diagnosticTail = this.diagnosticTail.subarray(
        this.diagnosticTail.byteLength - this.maxDiagnosticBytes,
      );
    }
  }

  private async waitForExit(child: ChildProcessWithoutNullStreams, timeoutMs: number): Promise<void> {
    if (child.exitCode !== null || child.signalCode !== null || this.child !== child) return;
    await withTimeout(
      new Promise<void>((resolveExit) => child.once("exit", () => resolveExit())),
      timeoutMs,
    );
  }
}

export function resolvePythonCommand(packageRoot: string): string {
  const configured = process.env.DECENT_CURL_PYTHON;
  if (configured) return configured;
  const candidate = process.platform === "win32"
    ? resolve(packageRoot, ".venv", "Scripts", "python.exe")
    : resolve(packageRoot, ".venv", "bin", "python");
  return candidate;
}

function cancellationError(): DOMException {
  return new DOMException("Worker call cancelled", "AbortError");
}

function safeCode(code: string): string {
  return STABLE_WORKER_ERROR_CODES.has(code) ? code : "worker_error";
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Worker operation timed out")), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
