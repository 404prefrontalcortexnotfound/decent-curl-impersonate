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
import { createToolDefinitions, type WorkerCaller } from "../src/tools.js";

class RecordingWorker implements WorkerCaller {
  calls: Array<{ operation: string; params: Record<string, unknown>; signal?: AbortSignal }> = [];
  result: unknown = { ok: true };

  async call(operation: any, params: Record<string, unknown>, signal?: AbortSignal): Promise<unknown> {
    this.calls.push({ operation, params, signal });
    return this.result;
  }
}

function descriptions(schema: unknown): string[] {
  if (!schema || typeof schema !== "object") return [];
  const record = schema as Record<string, unknown>;
  return [
    ...(typeof record.description === "string" ? [record.description] : []),
    ...Object.values(record).flatMap(descriptions),
  ];
}

const executionContext = { cwd: process.cwd() } as any;

async function execute(tool: any, params: Record<string, unknown>, signal?: AbortSignal) {
  return tool.execute("call-1", params, signal, undefined, executionContext);
}

describe("Pi tool schemas", () => {
  test("creates all five native Pi tools", () => {
    const names = createToolDefinitions(new RecordingWorker()).map((tool) => tool.name);
    expect(names).toEqual([
      "decent_curl_request",
      "decent_curl_download",
      "decent_curl_session",
      "decent_curl_websocket",
      "decent_curl_profiles",
    ]);
  });

  test("accepts documented request and download inputs", () => {
    expect(Value.Check(RequestParameters as any, {
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
      timeout: 10,
      retries: 2,
      verify: true,
      session_id: "session-1",
    })).toBe(true);
    expect(Value.Check(DownloadParameters as any, {
      url: "https://example.test/archive",
      path: "/tmp/archive.bin",
      overwrite: false,
      profile: "firefox",
    })).toBe(true);
  });

  test("keeps request body choices mutually exclusive", () => {
    const base = { url: "https://example.test" };
    expect(Value.Check(RequestParameters as any, { ...base, json: {} })).toBe(true);
    expect(Value.Check(RequestParameters as any, { ...base, form: { a: "b" } })).toBe(true);
    expect(Value.Check(RequestParameters as any, { ...base, content: "raw" })).toBe(true);
    expect(Value.Check(RequestParameters as any, {
      ...base,
      multipart: { upload: { path: "/tmp/file.txt" } },
    })).toBe(true);
    expect(Value.Check(RequestParameters as any, { ...base, json: {}, content: "raw" })).toBe(false);
  });

  test("accepts documented session, websocket, and profiles inputs", () => {
    expect(Value.Check(SessionParameters as any, { action: "create", profile: "safari" })).toBe(true);
    expect(Value.Check(SessionParameters as any, { action: "close", session_id: "session-1" })).toBe(true);
    expect(Value.Check(WebSocketParameters as any, {
      action: "connect",
      url: "wss://example.test/socket",
      headers: { cookie: "secret" },
      profile: "chrome",
    })).toBe(true);
    expect(Value.Check(WebSocketParameters as any, {
      action: "send",
      websocket_id: "socket-1",
      message: "hello",
    })).toBe(true);
    expect(Value.Check(ProfilesParameters as any, { action: "fingerprint", profile: "chrome" })).toBe(true);
  });

  test("marks secret-bearing schema fields as sensitive", () => {
    const text = descriptions([
      RequestParameters,
      DownloadParameters,
      WebSocketParameters,
    ]).join(" ").toLowerCase();
    for (const secretField of ["authorization", "cookie", "password", "token", "proxy", "sensitive"]) {
      expect(text).toContain(secretField);
    }
  });

  test("warns that query values are sensitive and omitted from Pi metadata", () => {
    const queryDescription = (DownloadParameters as any).properties.query.description;
    expect(queryDescription).toBe(
      "URL query values may contain sensitive API keys or tokens and are not returned in Pi metadata.",
    );
  });

  test("uses finite string enums for every action", () => {
    for (const schema of [SessionParameters, WebSocketParameters, ProfilesParameters]) {
      const action = (schema as any).properties.action;
      expect(action.type).toBe("string");
      expect(Array.isArray(action.enum)).toBe(true);
      expect(action.enum.length).toBeGreaterThan(0);
      expect(action.anyOf).toBeUndefined();
    }
  });
});

describe("Pi tool dispatch", () => {
  test("dispatches request and exposes only the response body plus non-secret details", async () => {
    const worker = new RecordingWorker();
    worker.result = {
      body: "response text",
      status: 200,
      url: "https://example.test/final",
      headers: { "content-type": "text/plain", "set-cookie": "secret-cookie" },
      cookies: [{ name: "sid", domain: "example.test", value: "secret-cookie" }],
      profile: "chrome",
    };
    const request = createToolDefinitions(worker)[0];
    const result = await execute(request, { url: "https://example.test", headers: { authorization: "secret" } });

    expect(worker.calls[0]).toMatchObject({ operation: "request.execute", params: { url: "https://example.test" } });
    expect(result.content).toEqual([{ type: "text", text: "response text" }]);
    expect(JSON.stringify(result.details)).not.toContain("secret");
    expect(result.details).toMatchObject({ status: 200, profile: "chrome" });
  });

  test("sanitizes request result URLs without changing response content", async () => {
    const worker = new RecordingWorker();
    worker.result = {
      body: "unchanged response",
      status: 200,
      url: "https://user:password@example.test/final?api_key=key-S3CR3T&token=token-S3CR3T",
    };

    const result = await execute(createToolDefinitions(worker)[0], { url: "https://example.test" });

    expect(result.content).toEqual([{ type: "text", text: "unchanged response" }]);
    expect(result.details.url).toBe("https://example.test/final");
    expect(JSON.stringify(result.details)).not.toContain("S3CR3T");
    expect(JSON.stringify(result.details)).not.toContain("user:password");
  });

  test("sanitizes download result URLs without changing download content", async () => {
    const worker = new RecordingWorker();
    worker.result = {
      path: "/tmp/archive.bin",
      size: 42,
      status: 200,
      url: "https://user:password@example.test/archive?api_key=key-S3CR3T&token=token-S3CR3T",
    };

    const result = await execute(createToolDefinitions(worker)[1], { url: "https://example.test/archive" });

    expect(result.content).toEqual([{ type: "text", text: "Downloaded to /tmp/archive.bin (42 bytes)" }]);
    expect(result.details.url).toBe("https://example.test/archive");
    expect(JSON.stringify(result.details)).not.toContain("S3CR3T");
    expect(JSON.stringify(result.details)).not.toContain("user:password");
  });

  test("dispatches download and profile operations", async () => {
    const worker = new RecordingWorker();
    const tools = createToolDefinitions(worker);
    await execute(tools[1], { url: "https://example.test/file" });
    await execute(tools[4], { action: "list" });
    await execute(tools[4], { action: "fingerprint", profile: "chrome" });

    expect(worker.calls.map(({ operation }) => operation)).toEqual([
      "download.execute",
      "profiles.list",
      "diagnostic.fingerprint",
    ]);
  });

  test("dispatches finite session and websocket actions without forwarding action", async () => {
    const worker = new RecordingWorker();
    const tools = createToolDefinitions(worker);
    await execute(tools[2], { action: "create", profile: "chrome" });
    await execute(tools[2], { action: "list" });
    await execute(tools[2], { action: "close", session_id: "session-1" });
    await execute(tools[3], { action: "connect", url: "wss://example.test" });
    await execute(tools[3], { action: "send", websocket_id: "socket-1", message: "hello" });
    await execute(tools[3], { action: "receive", websocket_id: "socket-1" });
    await execute(tools[3], { action: "close", websocket_id: "socket-1" });

    expect(worker.calls.map(({ operation }) => operation)).toEqual([
      "session.create",
      "session.list",
      "session.close",
      "websocket.connect",
      "websocket.send",
      "websocket.receive",
      "websocket.close",
    ]);
    expect(worker.calls.every(({ params }) => !("action" in params))).toBe(true);
  });
});

describe("extension lifecycle and commands", () => {
  test("registers tools and commands without starting the worker, then stops on shutdown", async () => {
    const tools: any[] = [];
    const commands = new Map<string, any>();
    const events = new Map<string, any>();
    let calls = 0;
    let stops = 0;
    const worker: ExtensionWorker = {
      async call() {
        calls += 1;
        return { profiles: [], families: [] };
      },
      async stop() {
        stops += 1;
      },
    };
    const pi = {
      registerTool(tool: any) { tools.push(tool); },
      registerCommand(name: string, command: any) { commands.set(name, command); },
      on(name: string, handler: any) { events.set(name, handler); },
    } as any;

    registerDecentCurlExtension(pi, { worker, packageRoot: "/package", pythonCommand: "/package/.venv/bin/python" });

    expect(tools).toHaveLength(5);
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
    const worker = { call: async () => ({}), stop: async () => {} };
    registerDecentCurlExtension(pi, {
      worker,
      packageRoot: "/package root",
      pythonCommand: "/package root/.venv/bin/python",
      runVisible: async (command, args, cwd) => { invocations.push({ command, args, cwd }); },
    });

    await commands.get("decent-curl-setup").handler("", {
      ui: { notify: (...args: unknown[]) => notifications.push(args) },
    });

    expect(invocations).toEqual([{
      command: "uv",
      args: ["sync", "--frozen", "--python", "3.13"],
      cwd: "/package root",
    }]);
    expect(notifications.flat().join(" ")).toContain("complete");
  });

  test("reports package, environment, curl versions, and profile count without starting the worker", async () => {
    const commands = new Map<string, any>();
    const notifications: any[] = [];
    let workerCalls = 0;
    const captures: any[] = [];
    const pi = {
      registerTool() {},
      registerCommand(name: string, command: any) { commands.set(name, command); },
      on() {},
    } as any;
    const worker = { call: async () => { workerCalls += 1; return {}; }, stop: async () => {} };
    registerDecentCurlExtension(pi, {
      worker,
      packageRoot: "/package",
      pythonCommand: "/package/.venv/bin/python",
      packageVersion: "0.1.0-test",
      runCapture: async (command, args, cwd) => {
        captures.push({ command, args, cwd });
        return JSON.stringify({ python: "3.13.5", curl_cffi: "0.15.0", libcurl: "libcurl/8.15.0", profile_count: 27 });
      },
    });

    await commands.get("decent-curl-status").handler("", {
      ui: { notify: (...args: unknown[]) => notifications.push(args) },
    });

    expect(workerCalls).toBe(0);
    expect(captures[0]).toMatchObject({ command: "/package/.venv/bin/python", cwd: "/package" });
    const status = notifications.flat().join(" ");
    expect(status).toContain("0.1.0-test");
    expect(status).toContain("/package/.venv/bin/python");
    expect(status).toContain("0.15.0");
    expect(status).toContain("libcurl/8.15.0");
    expect(status).toContain("27");
  });
});

describe("response-body truncation and secure spill files", () => {
  test("does not truncate bodies exactly at the 50 KB or 2,000-line boundaries", async () => {
    const worker = new RecordingWorker();
    const request = createToolDefinitions(worker)[0];

    const byteBoundary = "b".repeat(DEFAULT_MAX_BYTES);
    worker.result = { body: byteBoundary, status: 200 };
    const byteResult = await execute(request, { url: "https://example.test" });
    expect(byteResult.content[0].text).toBe(byteBoundary);
    expect(byteResult.details.fullOutputPath).toBeUndefined();

    const lineBoundary = Array.from({ length: DEFAULT_MAX_LINES }, (_, index) => `line-${index + 1}`).join("\n");
    worker.result = { body: lineBoundary, status: 200 };
    const lineResult = await execute(request, { url: "https://example.test" });
    expect(lineResult.content[0].text).toBe(lineBoundary);
    expect(lineResult.details.fullOutputPath).toBeUndefined();
  });

  test("uses head truncation at 2,000 lines and writes the full body to a 0600 file", async () => {
    const worker = new RecordingWorker();
    const body = Array.from({ length: DEFAULT_MAX_LINES + 1 }, (_, index) => `line-${index + 1}`).join("\n");
    worker.result = { body, status: 200 };
    const result = await execute(createToolDefinitions(worker)[0], { url: "https://example.test" });
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
    const result = await execute(createToolDefinitions(worker)[0], { url: "https://example.test" });
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
