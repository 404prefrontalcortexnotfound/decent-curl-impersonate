import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { WorkerClient } from "../src/worker-client.js";

const packageRoot = resolve(import.meta.dir, "..");
const python = process.platform === "win32"
  ? join(packageRoot, ".venv", "Scripts", "python.exe")
  : join(packageRoot, ".venv", "bin", "python");

let worker: WorkerClient;
let server: ReturnType<typeof Bun.serve>;
let temporaryDirectory: string;
let activeWebSockets = 0;

beforeAll(async () => {
  server = Bun.serve({
    port: 0,
    hostname: "127.0.0.1",
    fetch(request, bunServer) {
      const url = new URL(request.url);
      if (url.pathname === "/ws") {
        if (bunServer.upgrade(request, { data: undefined })) return undefined;
        return new Response("upgrade failed", { status: 400 });
      }
      if (url.pathname === "/cookie/set") {
        return new Response("set", {
          headers: { "Set-Cookie": "session=contract-secret; Path=/" },
        });
      }
      if (url.pathname === "/cookie/check") {
        return Response.json({ seen: request.headers.get("cookie")?.includes("contract-secret") === true });
      }
      if (url.pathname === "/download") {
        return new Response("contract-download", {
          headers: { "Content-Type": "application/octet-stream" },
        });
      }
      if (url.pathname === "/slow") {
        return new Promise((resolveResponse) => {
          setTimeout(() => resolveResponse(new Response("late")), 500);
        });
      }
      return request.text().then((body) => Response.json({
        method: request.method,
        query: Object.fromEntries(url.searchParams),
        body,
      }));
    },
    websocket: {
      open() {
        activeWebSockets += 1;
      },
      message(socket, message) {
        socket.send(message);
      },
      close() {
        activeWebSockets -= 1;
      },
    },
  });
  temporaryDirectory = await mkdtemp(join(tmpdir(), "decent-curl-contract-"));
  worker = new WorkerClient({
    command: python,
    cwd: packageRoot,
    shutdownTimeoutMs: 2_000,
  });
});

afterAll(async () => {
  await worker.stop();
  server.stop(true);
  await rm(temporaryDirectory, { recursive: true, force: true });
});

function endpoint(path: string): string {
  return `http://127.0.0.1:${server.port}${path}`;
}

describe("Bun to package-local Python worker contract", () => {
  test("profiles, requests, sessions, downloads, cancellation, and WebSockets", async () => {
    const profiles = await worker.call("profiles.list", {}) as { profiles: string[] };
    expect(profiles.profiles.length).toBeGreaterThan(0);

    const get = await worker.call("request.execute", {
      url: endpoint("/echo"),
      query: { contract: "yes" },
    }) as { status: number; body: string };
    expect(get.status).toBe(200);
    expect(JSON.parse(get.body)).toMatchObject({ method: "GET", query: { contract: "yes" } });

    const post = await worker.call("request.execute", {
      method: "POST",
      url: endpoint("/echo"),
      json: { answer: 42 },
    }) as { body: string };
    expect(JSON.parse(JSON.parse(post.body).body)).toEqual({ answer: 42 });

    const created = await worker.call("session.create", {}) as { session_id: string };
    const sessionId = created.session_id;
    const setCookie = await worker.call("request.execute", {
      url: endpoint("/cookie/set"),
      session_id: sessionId,
    });
    expect(JSON.stringify(setCookie)).not.toContain("contract-secret");
    const reused = await worker.call("request.execute", {
      url: endpoint("/cookie/check"),
      session_id: sessionId,
    }) as { body: string };
    expect(JSON.parse(reused.body)).toEqual({ seen: true });
    await worker.call("session.close", { session_id: sessionId });

    const destination = join(temporaryDirectory, "download.bin");
    const download = await worker.call("download.execute", {
      url: endpoint("/download"),
      path: destination,
    }) as { path: string; size: number };
    expect(download.path).toBe(await realpath(destination));
    expect(download.size).toBe(17);
    expect(await readFile(destination, "utf8")).toBe("contract-download");

    const controller = new AbortController();
    const slow = worker.call("request.execute", { url: endpoint("/slow") }, controller.signal);
    controller.abort();
    await expect(slow).rejects.toMatchObject({ name: "AbortError" });

    const connected = await worker.call("websocket.connect", {
      url: `ws://127.0.0.1:${server.port}/ws`,
    }) as { websocket_id: string };
    await worker.call("websocket.send", {
      websocket_id: connected.websocket_id,
      message: "contract-echo",
    });
    await expect(worker.call("websocket.receive", {
      websocket_id: connected.websocket_id,
      timeout: 1,
    })).resolves.toEqual({
      websocket_id: connected.websocket_id,
      message_type: "text",
      message: "contract-echo",
    });
    expect(activeWebSockets).toBe(1);
    await worker.stop();
    for (let attempt = 0; attempt < 100 && activeWebSockets !== 0; attempt += 1) {
      await Bun.sleep(10);
    }
    expect(activeWebSockets).toBe(0);
  }, 15_000);
});
