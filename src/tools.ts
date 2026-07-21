import { chmod, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  DEFAULT_MAX_BYTES,
  DEFAULT_MAX_LINES,
  formatSize,
  truncateHead,
  type ToolDefinition,
} from "@earendil-works/pi-coding-agent";

import type { WorkerOperation } from "./protocol.js";
import {
  DownloadParameters,
  ProfilesParameters,
  RequestParameters,
  SessionParameters,
  WebSocketParameters,
} from "./schemas.js";

export interface WorkerCaller {
  call(
    operation: WorkerOperation,
    params: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<unknown>;
}

type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  details: Record<string, unknown>;
};

export function createToolDefinitions(worker: WorkerCaller): ToolDefinition<any, Record<string, unknown>>[] {
  return [
    {
      name: "decent_curl_request",
      label: "Browser HTTP request",
      description: "Make an HTTP request using curl_cffi browser impersonation. Response bodies are returned as text. Authorization, Cookie, proxy credentials, request bodies, and upload contents are sensitive and excluded from result details.",
      parameters: RequestParameters,
      async execute(_id, params, signal): Promise<ToolResult> {
        const result = asRecord(await worker.call("request.execute", asRecord(params), signal));
        return responseResult(result);
      },
    },
    {
      name: "decent_curl_download",
      label: "Browser HTTP download",
      description: "Stream an HTTP download to a private file using browser impersonation. Authorization, Cookie, and proxy credentials are sensitive and excluded from result details.",
      parameters: DownloadParameters,
      async execute(_id, params, signal): Promise<ToolResult> {
        const result = asRecord(await worker.call("download.execute", asRecord(params), signal));
        const details = pick(result, ["path", "size", "content_type", "status", "url", "profile", "sha256"]);
        const path = typeof details.path === "string" ? details.path : "unknown path";
        const size = typeof details.size === "number" ? ` (${details.size} bytes)` : "";
        return { content: [{ type: "text", text: `Downloaded to ${path}${size}` }], details };
      },
    },
    {
      name: "decent_curl_session",
      label: "Browser HTTP session",
      description: "Create, list, or close named in-memory HTTP sessions. Cookie values and credentials are sensitive and are never returned.",
      parameters: SessionParameters,
      async execute(_id, params, signal): Promise<ToolResult> {
        const { action, ...operationParams } = params as Record<string, unknown> & { action: "create" | "list" | "close" };
        const result = asRecord(await worker.call(`session.${action}`, operationParams, signal));
        const details = sessionDetails(result);
        return { content: [{ type: "text", text: JSON.stringify(details, null, 2) }], details };
      },
    },
    {
      name: "decent_curl_websocket",
      label: "Browser WebSocket",
      description: "Connect, send, receive, or close a browser-impersonated WebSocket. Authorization, Cookie, proxy credentials, and outbound messages are sensitive and excluded from result details.",
      parameters: WebSocketParameters,
      async execute(_id, params, signal): Promise<ToolResult> {
        const { action, ...operationParams } = params as Record<string, unknown> & {
          action: "connect" | "send" | "receive" | "close";
        };
        const result = asRecord(await worker.call(`websocket.${action}`, operationParams, signal));
        return websocketResult(action, result);
      },
    },
    {
      name: "decent_curl_profiles",
      label: "Browser profiles",
      description: "List installed curl_cffi browser profiles or run a public fingerprint diagnostic.",
      parameters: ProfilesParameters,
      async execute(_id, params, signal): Promise<ToolResult> {
        const { action, ...operationParams } = params as Record<string, unknown> & { action: "list" | "fingerprint" };
        const operation = action === "list" ? "profiles.list" : "diagnostic.fingerprint";
        const result = asRecord(await worker.call(operation, operationParams, signal));
        if (action === "fingerprint" && typeof result.body === "string") return responseResult(result);
        const profiles = stringArray(result.profiles);
        const families = stringArray(result.families);
        const details = { profile_count: profiles.length, families };
        return {
          content: [{ type: "text", text: JSON.stringify({ profiles, families }, null, 2) }],
          details,
        };
      },
    },
  ];
}

async function responseResult(result: Record<string, unknown>): Promise<ToolResult> {
  const details = pick(result, [
    "status",
    "reason",
    "url",
    "elapsed_ms",
    "http_version",
    "profile",
    "body_encoding",
  ]);
  const headers = safeHeaders(result.headers);
  if (Object.keys(headers).length > 0) details.headers = headers;
  const cookies = safeCookies(result.cookies);
  if (cookies.length > 0) details.cookies = cookies;

  const body = typeof result.body === "string" ? result.body : "";
  const truncation = truncateHead(body, {
    maxBytes: DEFAULT_MAX_BYTES,
    maxLines: DEFAULT_MAX_LINES,
  });
  let text = truncation.content;
  if (truncation.truncated) {
    const directory = await mkdtemp(join(tmpdir(), "decent-curl-response-"));
    await chmod(directory, 0o700);
    const fullOutputPath = join(directory, "response-body.txt");
    await writeFile(fullOutputPath, body, { encoding: "utf8", flag: "wx", mode: 0o600 });
    await chmod(fullOutputPath, 0o600);
    details.fullOutputPath = fullOutputPath;
    details.truncation = {
      truncatedBy: truncation.truncatedBy,
      totalLines: truncation.totalLines,
      totalBytes: truncation.totalBytes,
      outputLines: truncation.outputLines,
      outputBytes: truncation.outputBytes,
    };
    text += `\n\n[Output truncated: showing ${truncation.outputLines} of ${truncation.totalLines} lines`;
    text += ` (${formatSize(truncation.outputBytes)} of ${formatSize(truncation.totalBytes)}).`;
    text += ` Full response body saved to: ${fullOutputPath}]`;
  }
  return { content: [{ type: "text", text }], details };
}

function sessionDetails(result: Record<string, unknown>): Record<string, unknown> {
  const details = pick(result, ["session_id", "profile", "closed"]);
  if (Array.isArray(result.sessions)) {
    details.sessions = result.sessions.map((entry) => pick(asRecord(entry), ["session_id", "profile"]));
  }
  return details;
}

function websocketResult(action: string, result: Record<string, unknown>): ToolResult {
  const details = pick(result, ["websocket_id", "connected", "closed", "message_type", "code", "reason"]);
  let text: string;
  if (action === "receive" && typeof result.message === "string") text = result.message;
  else if (action === "receive" && typeof result.data_base64 === "string") text = result.data_base64;
  else text = JSON.stringify(details, null, 2);
  return { content: [{ type: "text", text }], details };
}

function pick(record: Record<string, unknown>, keys: readonly string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const value = record[key];
    if (value === null || ["string", "number", "boolean"].includes(typeof value)) result[key] = value;
  }
  return result;
}

function safeHeaders(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const sensitive = new Set(["authorization", "cookie", "proxy-authorization", "set-cookie"]);
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      ([name, headerValue]) => !sensitive.has(name.toLowerCase()) && typeof headerValue === "string",
    ),
  ) as Record<string, string>;
}

function safeCookies(value: unknown): Array<{ name: string; domain: string }> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const cookie = asRecord(entry);
    return typeof cookie.name === "string" && typeof cookie.domain === "string"
      ? [{ name: cookie.name, domain: cookie.domain }]
      : [];
  });
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}
