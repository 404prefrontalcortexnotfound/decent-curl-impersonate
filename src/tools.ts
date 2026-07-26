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

import { Type } from "typebox";
import { Value } from "typebox/value";

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

const GatewayParameters = Type.Object({
  operation: Type.String(),
  args: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
}, { additionalProperties: false });

const OPERATION_TABLE = {
  request: {
    workerOperation: "request.execute",
    schema: RequestParameters,
    allowed: Object.keys(RequestParameters.properties),
    required: ["url"],
    renderer: "response",
  },
  download: {
    workerOperation: "download.execute",
    schema: DownloadParameters,
    allowed: Object.keys(DownloadParameters.properties),
    required: ["url"],
    renderer: "download",
  },
  "session.create": {
    workerOperation: "session.create",
    action: "create",
    schema: SessionParameters,
    allowed: ["profile"],
    required: [],
    renderer: "session",
  },
  "session.list": {
    workerOperation: "session.list",
    action: "list",
    schema: SessionParameters,
    allowed: [],
    required: [],
    renderer: "session",
  },
  "session.close": {
    workerOperation: "session.close",
    action: "close",
    schema: SessionParameters,
    allowed: ["session_id"],
    required: ["session_id"],
    renderer: "session",
  },
  "websocket.connect": {
    workerOperation: "websocket.connect",
    action: "connect",
    schema: WebSocketParameters,
    allowed: ["url", "headers", "profile", "proxy", "verify", "session_id", "timeout"],
    required: ["url"],
    renderer: "websocket",
  },
  "websocket.send": {
    workerOperation: "websocket.send",
    action: "send",
    schema: WebSocketParameters,
    allowed: ["websocket_id", "message", "data_base64", "timeout"],
    required: ["websocket_id"],
    renderer: "websocket",
  },
  "websocket.receive": {
    workerOperation: "websocket.receive",
    action: "receive",
    schema: WebSocketParameters,
    allowed: ["websocket_id", "timeout"],
    required: ["websocket_id"],
    renderer: "websocket",
  },
  "websocket.close": {
    workerOperation: "websocket.close",
    action: "close",
    schema: WebSocketParameters,
    allowed: ["websocket_id", "code", "reason"],
    required: ["websocket_id"],
    renderer: "websocket",
  },
  "profiles.list": {
    workerOperation: "profiles.list",
    action: "list",
    schema: ProfilesParameters,
    allowed: [],
    required: [],
    renderer: "profiles",
  },
  "profiles.fingerprint": {
    workerOperation: "diagnostic.fingerprint",
    action: "fingerprint",
    schema: ProfilesParameters,
    allowed: ["profile", "url"],
    required: [],
    renderer: "response",
  },
} as const;

type GatewayOperation = keyof typeof OPERATION_TABLE;
type ValidationError = { path: string; message: string };

const VALID_OPERATIONS = Object.keys(OPERATION_TABLE) as GatewayOperation[];
const GATEWAY_DESCRIPTION = [
  "Browser-impersonated HTTP gateway. Select operation and put its fields in args.",
  "Operations: request (url required; method/query/headers/auth/profile/http_version/proxy/allow_redirects/max_redirects/timeout/retries/verify/session_id; one mutually exclusive body: json, form, content, content_base64, or multipart), download (url plus request transport fields/path/overwrite), session.create/list/close, websocket.connect/send/receive/close, profiles.list, profiles.fingerprint.",
  "Authentication: {type:'basic',username,password} or {type:'bearer',token}. Multipart parts are {path,filename?,content_type?} files or {value,content_type?} values. allow_redirects may be true, false, or 'safe'. WebSocket send uses exactly one of message or data_base64.",
  "Headers, authentication, proxies, query values, request bodies, upload content, and outbound WebSocket messages may contain secrets: never disclose them.",
].join(" ");

export function createToolDefinition(worker: WorkerCaller): ToolDefinition<any, Record<string, unknown>> {
  return {
    name: "decent_curl",
    label: "Browser HTTP gateway",
    description: GATEWAY_DESCRIPTION,
    parameters: GatewayParameters,
    async execute(_id, params, signal): Promise<ToolResult> {
      const envelope = asRecord(params);
      const operation = envelope.operation;
      if (!isGatewayOperation(operation)) return unknownOperationResult();

      const envelopeErrors = safeSchemaErrors(GatewayParameters, params);
      if (envelopeErrors.length > 0) return validationResult(envelopeErrors);
      const args = envelope.args === undefined ? {} : asRecord(envelope.args);
      const spec = OPERATION_TABLE[operation];
      const candidate = "action" in spec ? { ...args, action: spec.action } : args;
      const errors = [
        ...safeSchemaErrors(spec.schema, candidate, "/args"),
        ...operationErrors(operation, args, spec.allowed, spec.required),
      ];
      if (errors.length > 0) return validationResult(errors);

      const result = asRecord(await worker.call(spec.workerOperation as WorkerOperation, args, signal));
      return renderResult(spec.renderer, operation, result);
    },
  };
}

function isGatewayOperation(value: unknown): value is GatewayOperation {
  return typeof value === "string" && Object.hasOwn(OPERATION_TABLE, value);
}

function safeSchemaErrors(schema: any, candidate: unknown, prefix = ""): ValidationError[] {
  return [...Value.Errors(schema, candidate)].map((error) => ({
    path: `${prefix}${error.instancePath}`,
    message: error.message,
  }));
}

function operationErrors(
  operation: GatewayOperation,
  args: Record<string, unknown>,
  allowed: readonly string[],
  required: readonly string[],
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (Object.keys(args).some((key) => !allowed.includes(key))) {
    errors.push({ path: "/args", message: "contains a field not valid for this operation" });
  }
  for (const key of required) {
    if (!(key in args) || args[key] === "") errors.push({ path: `/args/${key}`, message: "is required" });
  }
  if (operation === "request") {
    const bodies = ["json", "form", "content", "content_base64", "multipart"]
      .filter((key) => args[key] !== undefined && args[key] !== null);
    if (bodies.length > 1) errors.push({ path: "/args", message: "request bodies are mutually exclusive" });
  }
  if (operation === "websocket.send") {
    const payloads = ["message", "data_base64"].filter((key) => args[key] !== undefined && args[key] !== null);
    if (payloads.length !== 1) errors.push({ path: "/args", message: "exactly one WebSocket message is required" });
  }
  return errors;
}

function unknownOperationResult(): ToolResult {
  const text = `Unknown operation. Valid operations: ${VALID_OPERATIONS.join(", ")}`;
  return { content: [{ type: "text", text }], details: { valid_operations: VALID_OPERATIONS } };
}

function validationResult(errors: ValidationError[]): ToolResult {
  return {
    content: [{ type: "text", text: `Invalid arguments:\n${JSON.stringify(errors, null, 2)}` }],
    details: { errors },
  };
}

async function renderResult(
  renderer: "response" | "download" | "session" | "websocket" | "profiles",
  operation: GatewayOperation,
  result: Record<string, unknown>,
): Promise<ToolResult> {
  if (renderer === "response") return responseResult(result);
  if (renderer === "download") {
    const details = pick(result, ["path", "size", "content_type", "status", "url", "profile", "sha256"]);
    sanitizeUrlMetadata(details);
    const path = typeof details.path === "string" ? details.path : "unknown path";
    const size = typeof details.size === "number" ? ` (${details.size} bytes)` : "";
    return { content: [{ type: "text", text: `Downloaded to ${path}${size}` }], details };
  }
  if (renderer === "session") {
    const details = sessionDetails(result);
    return { content: [{ type: "text", text: JSON.stringify(details, null, 2) }], details };
  }
  if (renderer === "websocket") return websocketResult(operation.split(".")[1], result);

  const profiles = stringArray(result.profiles);
  const families = stringArray(result.families);
  const details = { profile_count: profiles.length, families };
  return {
    content: [{ type: "text", text: JSON.stringify({ profiles, families }, null, 2) }],
    details,
  };
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
  sanitizeUrlMetadata(details);
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

function sanitizeUrlMetadata(details: Record<string, unknown>): void {
  if (typeof details.url !== "string") return;
  try {
    const url = new URL(details.url);
    details.url = `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    delete details.url;
  }
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
