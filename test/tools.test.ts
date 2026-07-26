import { describe, expect, test } from "bun:test";
import { readFile, rm, stat } from "node:fs/promises";
import { dirname, isAbsolute } from "node:path";
import { DEFAULT_MAX_BYTES, DEFAULT_MAX_LINES } from "@earendil-works/pi-coding-agent";
import { Value } from "typebox/value";

import {
  DownloadParameters,
  ProfilesParameters,
  RequestParameters,
  SessionParameters,
  WebSocketParameters,
} from "../src/schemas.js";
import { registerDecentCurlExtension, type ExtensionWorker } from "../src/index.js";
import { createToolDefinition, type WorkerCaller } from "../src/tools.js";

class RecordingWorker implements WorkerCaller {
  calls: Array<{ operation: string; params: Record<string, unknown>; signal?: AbortSignal }> = [];
  result: unknown = { ok: true };

  async call(operation: any, params: Record<string, unknown>, signal?: AbortSignal): Promise<unknown> {
    this.calls.push({ operation, params, signal });
    return this.result;
  }
}

const executionContext = { cwd: process.cwd() } as any;

async function execute(tool: any, operation: unknown, args?: unknown, signal?: AbortSignal) {
  const params = args === undefined ? { operation } : { operation, args };
  return tool.execute("call-1", params, signal, undefined, executionContext);
}

function promptBytes(tool: any, provider: "openai" | "anthropic"): number {
  const parameters = provider === "openai"
    ? tool.parameters
    : {
        type: "object",
        properties: tool.parameters.properties ?? {},
        required: tool.parameters.required ?? [],
      };
  const providerTool = provider === "openai"
    ? { name: tool.name, description: tool.description, parameters }
    : { name: tool.name, description: tool.description, input_schema: parameters };
  return Buffer.byteLength(JSON.stringify(providerTool), "utf8");
}

const minimumArgs = {
  request: { url: "https://example.test" },
  download: { url: "https://example.test/file" },
  "session.create": {},
  "session.list": {},
  "session.close": { session_id: "session-1" },
  "websocket.connect": { url: "wss://example.test/socket" },
  "websocket.send": { websocket_id: "socket-1", message: "hello" },
  "websocket.receive": { websocket_id: "socket-1" },
  "websocket.close": { websocket_id: "socket-1" },
  "profiles.list": {},
  "profiles.fingerprint": {},
} as const;

const dispatchCases = [
  ["request", "request.execute"],
  ["download", "download.execute"],
  ["session.create", "session.create"],
  ["session.list", "session.list"],
  ["session.close", "session.close"],
  ["websocket.connect", "websocket.connect"],
  ["websocket.send", "websocket.send"],
  ["websocket.receive", "websocket.receive"],
  ["websocket.close", "websocket.close"],
  ["profiles.list", "profiles.list"],
  ["profiles.fingerprint", "diagnostic.fingerprint"],
] as const;

describe("compact Pi gateway contract", () => {
  test("creates one decent_curl tool with only operation and args", () => {
    const tool = createToolDefinition(new RecordingWorker());
    expect(tool.name).toBe("decent_curl");
    expect(Object.keys((tool.parameters as any).properties).sort()).toEqual(["args", "operation"]);
    expect((tool.parameters as any).properties.operation.type).toBe("string");
    expect((tool.parameters as any).properties.operation.enum).toBeUndefined();
  });

  test.each(dispatchCases)("dispatches %s to %s without forwarding action", async (operation, expected) => {
    const worker = new RecordingWorker();
    await execute(createToolDefinition(worker), operation, minimumArgs[operation]);

    expect(worker.calls).toHaveLength(1);
    expect(worker.calls[0]).toMatchObject({ operation: expected, params: minimumArgs[operation] });
    expect(worker.calls[0].params.action).toBeUndefined();
  });

  test("returns a safe error for an unknown operation without echoing args", async () => {
    const worker = new RecordingWorker();
    const result = await execute(createToolDefinition(worker), "request.typo", {
      headers: { authorization: "Bearer SECRET" },
    });

    expect(worker.calls).toHaveLength(0);
    const serialized = JSON.stringify(result);
    expect(serialized).toContain("Valid operations");
    expect(serialized).not.toContain("SECRET");
    expect(serialized).not.toContain("Received arguments");
  });

  test.each([
    ["unknown request field", "request", { url: "https://example.test", action: "close" }],
    ["multiple request bodies", "request", { url: "https://example.test", json: {}, content: "raw" }],
    ["invalid session arguments", "session.list", { profile: "chrome" }],
    ["missing session close ID", "session.close", {}],
    ["invalid WebSocket arguments", "websocket.receive", { websocket_id: "socket-1", message: "wrong" }],
    ["invalid profile arguments", "profiles.list", { profile: "chrome" }],
  ])("rejects %s before worker dispatch", async (_name, operation, args) => {
    const worker = new RecordingWorker();
    const result = await execute(createToolDefinition(worker), operation, args);

    expect(worker.calls).toHaveLength(0);
    expect((result as any).details.errors.length).toBeGreaterThan(0);
  });

  test("validation errors contain only path and message and never rejected values", async () => {
    const worker = new RecordingWorker();
    const result = await execute(createToolDefinition(worker), "request", {
      url: "https://example.test",
      headers: { authorization: ["SECRET"] },
      unexpected: "SECRET",
    });

    expect(worker.calls).toHaveLength(0);
    const errors = (result as any).details.errors as Array<Record<string, unknown>>;
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.every((error) => Object.keys(error).sort().join(",") === "message,path")).toBe(true);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("SECRET");
    expect(serialized).not.toContain("Received arguments");
  });

  test("warns about every model-visible secret category and documents direct-use shapes", () => {
    const description = createToolDefinition(new RecordingWorker()).description.toLowerCase();
    for (const phrase of [
      "headers",
      "authentication",
      "proxies",
      "query values",
      "request bodies",
      "upload content",
      "outbound websocket messages",
      "basic",
      "bearer",
      "multipart",
      "allow_redirects",
      "mutually exclusive",
    ]) expect(description).toContain(phrase);
  });

  test("keeps both provider prompt forms within the 2,500-byte budget", () => {
    const tool = createToolDefinition(new RecordingWorker());
    const openai = promptBytes(tool, "openai");
    const anthropic = promptBytes(tool, "anthropic");
    const old = { openai: 8178, anthropic: 4705 };
    const message = `old=${JSON.stringify(old)} new=${JSON.stringify({ openai, anthropic })}`;

    expect(Math.max(openai, anthropic), message).toBeLessThanOrEqual(2_500);
  });

  test("tracked distribution registers only the compact model-facing name", async () => {
    const distribution = await readFile(new URL("../dist/index.js", import.meta.url), "utf8");
    expect(distribution).toContain('name: "decent_curl"');
    for (const legacyName of [
      "decent_curl_request",
      "decent_curl_download",
      "decent_curl_session",
      "decent_curl_websocket",
      "decent_curl_profiles",
    ]) expect(distribution).not.toContain(legacyName);
  });
});

describe("operation schemas and preserved worker inputs", () => {
  test("flattens requests, rejects unknown fields, and leaves body exclusivity to the gateway", () => {
    expect((RequestParameters as any).allOf).toBeUndefined();
    expect((RequestParameters as any).additionalProperties).toBe(false);
    expect(Value.Check(RequestParameters as any, { url: "https://example.test", unknown: true })).toBe(false);
    expect(Value.Check(RequestParameters as any, {
      url: "https://example.test",
      json: {},
      content: "raw",
    })).toBe(true);
  });

  test("accepts all documented request and download shapes", async () => {
    const accepted: Array<[keyof typeof minimumArgs, Record<string, unknown>]> = [
      ["request", {
        url: "https://example.test/items",
        method: "POST",
        query: { page: 2 },
        headers: { authorization: "Bearer secret" },
        json: { hello: "world" },
        auth: { type: "bearer", token: "secret" },
        profile: "chrome",
        http_version: "2",
        proxy: "http://user:pass@proxy.test",
        allow_redirects: "safe",
        max_redirects: 3,
        timeout: 10,
        retries: 2,
        verify: true,
        session_id: "session-1",
      }],
      ["request", {
        url: "https://example.test/items",
        auth: { type: "basic", username: "user", password: "secret" },
        form: { answer: "forty two" },
      }],
      ["request", { url: "https://example.test/items", content: "raw" }],
      ["request", { url: "https://example.test/items", content_base64: "cmF3AA==" }],
      ["request", {
        url: "https://example.test/items",
        multipart: {
          description: { value: "sample", content_type: "text/plain" },
          attachment: { path: "/tmp/file.txt", filename: "file.txt", content_type: "text/plain" },
        },
      }],
      ["download", {
        url: "https://example.test/archive",
        query: { token: "secret" },
        headers: { authorization: "Bearer secret" },
        auth: { type: "bearer", token: "secret" },
        profile: "firefox",
        http_version: "3",
        proxy: "http://proxy.test",
        allow_redirects: true,
        max_redirects: 2,
        timeout: 30,
        retries: 1,
        verify: false,
        session_id: "session-1",
        path: "/tmp/archive.bin",
        overwrite: true,
      }],
    ];

    for (const [operation, args] of accepted) {
      const worker = new RecordingWorker();
      await execute(createToolDefinition(worker), operation, args);
      expect(worker.calls, `${operation}: ${JSON.stringify(args)}`).toHaveLength(1);
    }
  });

  test("accepts documented session, WebSocket, profile, and fingerprint shapes", async () => {
    const accepted: Array<[keyof typeof minimumArgs, Record<string, unknown>]> = [
      ["session.create", { profile: "safari" }],
      ["session.list", {}],
      ["session.close", { session_id: "session-1" }],
      ["websocket.connect", {
        url: "wss://example.test/socket",
        headers: { cookie: "secret" },
        profile: "chrome",
        proxy: "http://proxy.test",
        verify: true,
        session_id: "session-1",
        timeout: 10,
      }],
      ["websocket.send", { websocket_id: "socket-1", message: "hello", timeout: 1 }],
      ["websocket.send", { websocket_id: "socket-1", data_base64: "YmluYXJ5", timeout: 1 }],
      ["websocket.receive", { websocket_id: "socket-1", timeout: 1 }],
      ["websocket.close", { websocket_id: "socket-1", code: 1000, reason: "done" }],
      ["profiles.list", {}],
      ["profiles.fingerprint", { profile: "chrome", url: "https://example.test/fingerprint" }],
    ];

    for (const [operation, args] of accepted) {
      const worker = new RecordingWorker();
      await execute(createToolDefinition(worker), operation, args);
      expect(worker.calls, `${operation}: ${JSON.stringify(args)}`).toHaveLength(1);
    }
  });

  test("keeps finite string enums in the authoritative action schemas", () => {
    for (const schema of [SessionParameters, WebSocketParameters, ProfilesParameters]) {
      const action = (schema as any).properties.action;
      expect(action.type).toBe("string");
      expect(Array.isArray(action.enum)).toBe(true);
      expect(action.enum.length).toBeGreaterThan(0);
      expect(action.anyOf).toBeUndefined();
    }
    expect(Value.Check(DownloadParameters as any, { url: "https://example.test" })).toBe(true);
  });
});

describe("gateway result shaping and privacy", () => {
  test("exposes only the request body and non-secret details", async () => {
    const worker = new RecordingWorker();
    worker.result = {
      body: "response text",
      status: 200,
      url: "https://example.test/final",
      headers: { "content-type": "text/plain", "set-cookie": "secret-cookie" },
      cookies: [{ name: "sid", domain: "example.test", value: "secret-cookie" }],
      profile: "chrome",
    };
    const result = await execute(createToolDefinition(worker), "request", {
      url: "https://example.test",
      headers: { authorization: "secret" },
    });

    expect(worker.calls[0]).toMatchObject({
      operation: "request.execute",
      params: { url: "https://example.test", headers: { authorization: "secret" } },
    });
    expect(result.content).toEqual([{ type: "text", text: "response text" }]);
    expect(JSON.stringify(result.details)).not.toContain("secret");
    expect(result.details).toMatchObject({ status: 200, profile: "chrome" });
  });

  test("sanitizes request and download result URLs", async () => {
    const worker = new RecordingWorker();
    worker.result = {
      body: "unchanged response",
      status: 200,
      url: "https://user:password@example.test/final?api_key=key-S3CR3T",
    };
    const request = await execute(createToolDefinition(worker), "request", { url: "https://example.test" });
    expect(request.content).toEqual([{ type: "text", text: "unchanged response" }]);
    expect(request.details.url).toBe("https://example.test/final");
    expect(JSON.stringify(request.details)).not.toContain("S3CR3T");
    expect(JSON.stringify(request.details)).not.toContain("user:password");

    worker.result = {
      path: "/tmp/archive.bin",
      size: 42,
      status: 200,
      url: "https://user:password@example.test/archive?token=token-S3CR3T",
    };
    const download = await execute(createToolDefinition(worker), "download", { url: "https://example.test/archive" });
    expect(download.content).toEqual([{ type: "text", text: "Downloaded to /tmp/archive.bin (42 bytes)" }]);
    expect(download.details.url).toBe("https://example.test/archive");
    expect(JSON.stringify(download.details)).not.toContain("S3CR3T");
    expect(JSON.stringify(download.details)).not.toContain("user:password");
  });

  test("preserves session, WebSocket, profiles, and fingerprint renderers", async () => {
    const worker = new RecordingWorker();
    const tool = createToolDefinition(worker);

    worker.result = { sessions: [{ session_id: "session-1", profile: "chrome", cookie: "SECRET" }] };
    const sessions = await execute(tool, "session.list", {});
    expect(sessions.details).toEqual({ sessions: [{ session_id: "session-1", profile: "chrome" }] });

    worker.result = { websocket_id: "socket-1", message_type: "text", message: "received text" };
    const websocket = await execute(tool, "websocket.receive", { websocket_id: "socket-1" });
    expect(websocket.content).toEqual([{ type: "text", text: "received text" }]);

    worker.result = { profiles: ["chrome", "firefox"], families: ["chrome", "firefox"] };
    const profiles = await execute(tool, "profiles.list", {});
    expect(profiles.details).toEqual({ profile_count: 2, families: ["chrome", "firefox"] });

    worker.result = { body: "fingerprint body", status: 200 };
    const fingerprint = await execute(tool, "profiles.fingerprint", {});
    expect(fingerprint.content).toEqual([{ type: "text", text: "fingerprint body" }]);
  });
});

describe("extension lifecycle and commands", () => {
  test("registers one tool and commands without starting the worker, then stops on shutdown", async () => {
    const tools: any[] = [];
    const commands = new Map<string, any>();
    const events = new Map<string, any>();
    let calls = 0;
    let stops = 0;
    const worker: ExtensionWorker = {
      async call() { calls += 1; return { profiles: [], families: [] }; },
      async stop() { stops += 1; },
    };
    const pi = {
      registerTool(tool: any) { tools.push(tool); },
      registerCommand(name: string, command: any) { commands.set(name, command); },
      on(name: string, handler: any) { events.set(name, handler); },
    } as any;

    registerDecentCurlExtension(pi, { worker, packageRoot: "/package", pythonCommand: "/package/.venv/bin/python" });

    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe("decent_curl");
    expect([...commands.keys()]).toEqual(["decent-curl-setup", "decent-curl-status"]);
    expect(calls).toBe(0);
    expect(stops).toBe(0);
    await events.get("session_shutdown")({}, {});
    await events.get("session_shutdown")({}, {});
    expect(stops).toBe(2);
  });

  test("runs frozen Python 3.13 setup visibly", async () => {
    const invocations: any[] = [];
    const notifications: any[] = [];
    const commands = new Map<string, any>();
    const pi = {
      registerTool() {},
      registerCommand(name: string, command: any) { commands.set(name, command); },
      on() {},
    } as any;
    registerDecentCurlExtension(pi, {
      worker: { call: async () => ({}), stop: async () => {} },
      packageRoot: "/package root",
      pythonCommand: "/package root/.venv/bin/python",
      runVisible: async (command, args, cwd) => { invocations.push({ command, args, cwd }); },
    });

    await commands.get("decent-curl-setup").handler("", {
      ui: { notify: (...args: unknown[]) => notifications.push(args) },
    });
    expect(invocations).toEqual([{
      command: "uv",
      args: ["sync", "--frozen", "--python", "3.13", "--no-dev"],
      cwd: "/package root",
    }]);
    expect(notifications.flat().join(" ")).toContain("complete");
  });

  test("default status version matches the 0.2.0 package version", async () => {
    const packageMetadata = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
    const commands = new Map<string, any>();
    const notifications: any[] = [];
    const pi = {
      registerTool() {},
      registerCommand(name: string, command: any) { commands.set(name, command); },
      on() {},
    } as any;
    registerDecentCurlExtension(pi, {
      worker: { call: async () => ({}), stop: async () => {} },
      packageRoot: "/package",
      pythonCommand: "/package/.venv/bin/python",
      runCapture: async () => JSON.stringify({
        python: "3.13.5",
        curl_cffi: "0.15.0",
        libcurl: "libcurl/8.15.0",
        profile_count: 27,
      }),
    });

    await commands.get("decent-curl-status").handler("", {
      ui: { notify: (...args: unknown[]) => notifications.push(args) },
    });
    expect(packageMetadata.version).toBe("0.2.0");
    expect(notifications.flat().join(" ")).toContain(`decent-curl-impersonate ${packageMetadata.version}`);
  });

  test("reports package, environment, curl versions, and profile count", async () => {
    const commands = new Map<string, any>();
    const notifications: any[] = [];
    const captures: any[] = [];
    let workerCalls = 0;
    const pi = {
      registerTool() {},
      registerCommand(name: string, command: any) { commands.set(name, command); },
      on() {},
    } as any;
    registerDecentCurlExtension(pi, {
      worker: { call: async () => { workerCalls += 1; return {}; }, stop: async () => {} },
      packageRoot: "/package",
      pythonCommand: "/package/.venv/bin/python",
      packageVersion: "0.1.0-test",
      runCapture: async (command, args, cwd) => {
        captures.push({ command, args, cwd });
        return JSON.stringify({
          python: "3.13.5",
          curl_cffi: "0.15.0",
          libcurl: "libcurl/8.15.0",
          profile_count: 27,
        });
      },
    });

    await commands.get("decent-curl-status").handler("", {
      ui: { notify: (...args: unknown[]) => notifications.push(args) },
    });
    const status = notifications.flat().join(" ");
    expect(workerCalls).toBe(0);
    expect(captures[0]).toMatchObject({ command: "/package/.venv/bin/python", cwd: "/package" });
    expect(status).toContain("0.1.0-test");
    expect(status).toContain("/package/.venv/bin/python");
    expect(status).toContain("0.15.0");
    expect(status).toContain("libcurl/8.15.0");
    expect(status).toContain("27");
  });
});

describe("response-body truncation and secure spill files", () => {
  test("does not truncate bodies at the 50 KB or 2,000-line boundaries", async () => {
    const worker = new RecordingWorker();
    const tool = createToolDefinition(worker);

    const byteBoundary = "b".repeat(DEFAULT_MAX_BYTES);
    worker.result = { body: byteBoundary, status: 200 };
    const byteResult = await execute(tool, "request", { url: "https://example.test" });
    expect(byteResult.content[0].text).toBe(byteBoundary);
    expect(byteResult.details.fullOutputPath).toBeUndefined();

    const lineBoundary = Array.from({ length: DEFAULT_MAX_LINES }, (_, index) => `line-${index + 1}`).join("\n");
    worker.result = { body: lineBoundary, status: 200 };
    const lineResult = await execute(tool, "request", { url: "https://example.test" });
    expect(lineResult.content[0].text).toBe(lineBoundary);
    expect(lineResult.details.fullOutputPath).toBeUndefined();
  });

  test("uses head truncation at 2,000 lines and writes a private spill file", async () => {
    const worker = new RecordingWorker();
    const body = Array.from({ length: DEFAULT_MAX_LINES + 1 }, (_, index) => `line-${index + 1}`).join("\n");
    worker.result = { body, status: 200 };
    const result = await execute(createToolDefinition(worker), "request", { url: "https://example.test" });
    const path = result.details.fullOutputPath as string;

    try {
      expect(result.content[0].text).toContain("line-1\n");
      expect(result.content[0].text).not.toContain(`line-${DEFAULT_MAX_LINES + 1}`);
      expect(result.content[0].text).toContain("Full response body saved to:");
      expect(result.content[0].text).toContain(path);
      expect(isAbsolute(path)).toBe(true);
      expect(await readFile(path, "utf8")).toBe(body);
      expect((await stat(path)).mode & 0o777).toBe(0o600);
      expect((await stat(dirname(path))).mode & 0o777).toBe(0o700);
    } finally {
      if (path) await rm(dirname(path), { recursive: true, force: true });
    }
  });

  test("spills a body over 50 KB and includes a full-output notice", async () => {
    const worker = new RecordingWorker();
    const body = `${"x".repeat(DEFAULT_MAX_BYTES)}\nremainder`;
    worker.result = { body, status: 200 };
    const result = await execute(createToolDefinition(worker), "request", { url: "https://example.test" });
    const path = result.details.fullOutputPath as string;

    try {
      expect(result.content[0].text).toContain("Output truncated");
      expect(result.content[0].text).toContain(path);
      expect(await readFile(path, "utf8")).toBe(body);
      expect((await stat(path)).mode & 0o777).toBe(0o600);
    } finally {
      if (path) await rm(dirname(path), { recursive: true, force: true });
    }
  });
});
