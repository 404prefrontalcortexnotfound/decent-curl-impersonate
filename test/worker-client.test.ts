import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { WorkerClient, resolvePythonCommand } from "../src/worker-client.js";

const fixture = join(import.meta.dir, "fixtures", "fake-worker.ts");
const clients: WorkerClient[] = [];
const temporaryDirectories: string[] = [];

function client(mode = "normal", stateFile?: string): WorkerClient {
  const instance = new WorkerClient({
    command: process.execPath,
    args: [fixture],
    env: {
      ...process.env,
      FAKE_WORKER_MODE: mode,
      ...(stateFile ? { FAKE_WORKER_STATE_FILE: stateFile } : {}),
    },
    shutdownTimeoutMs: 1_000,
  });
  clients.push(instance);
  return instance;
}

async function statePath(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "decent-curl-worker-test-"));
  temporaryDirectories.push(directory);
  return join(directory, "state.txt");
}

afterEach(async () => {
  await Promise.all(clients.splice(0).map((instance) => instance.stop()));
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
});

describe("WorkerClient", () => {
  test("resolves the configured Python command before the package-local environment", () => {
    const previous = process.env.DECENT_CURL_PYTHON;
    try {
      process.env.DECENT_CURL_PYTHON = "/custom/python";
      expect(resolvePythonCommand("/package")).toBe("/custom/python");
      delete process.env.DECENT_CURL_PYTHON;
      expect(resolvePythonCommand("/package")).toBe(
        process.platform === "win32"
          ? join("/package", ".venv", "Scripts", "python.exe")
          : join("/package", ".venv", "bin", "python"),
      );
    } finally {
      if (previous === undefined) delete process.env.DECENT_CURL_PYTHON;
      else process.env.DECENT_CURL_PYTHON = previous;
    }
  });

  test("correlates responses that arrive out of order", async () => {
    const worker = client();
    const slow = worker.call("profiles.list", { value: "slow", delay: 50 });
    const fast = worker.call("profiles.list", { value: "fast", delay: 0 });

    await expect(fast).resolves.toEqual({ value: "fast" });
    await expect(slow).resolves.toEqual({ value: "slow" });
  });

  test("rejects malformed worker output without echoing parameters", async () => {
    const worker = client("malformed");
    const secret = "should-never-appear";

    await expect(worker.call("request.execute", { secret })).rejects.toThrow("malformed");
    try {
      await worker.call("request.execute", { secret });
    } catch (error) {
      expect(String(error)).not.toContain(secret);
    }
  });

  test("maps unknown worker error codes without echoing their value", async () => {
    const worker = client("secret-error-code");

    try {
      await worker.call("request.execute", {});
      throw new Error("expected worker call to fail");
    } catch (error) {
      expect(error).toMatchObject({
        name: "WorkerCallError",
        code: "worker_error",
        retryable: false,
      });
      expect(String(error)).toBe("WorkerCallError: Worker operation failed (worker_error)");
      expect(String(error)).not.toContain("token-S3CR3T");
    }
  });

  test("rejects a cancelled call and ignores its later response", async () => {
    const worker = client();
    const controller = new AbortController();
    const pending = worker.call("profiles.list", { value: "late", delay: 100 }, controller.signal);
    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    await expect(worker.call("profiles.list", { value: "next" })).resolves.toEqual({ value: "next" });
  });

  test("shuts the worker down gracefully and stop is idempotent", async () => {
    const path = await statePath();
    const worker = client("normal", path);
    await worker.start();

    await worker.stop();
    await worker.stop();

    expect(await readFile(path, "utf8")).toBe("start\nshutdown\n");
  });

  test("restarts once after a worker crash", async () => {
    const path = await statePath();
    const worker = client("crash-once", path);

    await expect(worker.call("profiles.list", { control: "crash" })).rejects.toThrow("exited");
    await expect(worker.call("profiles.list", { value: "restarted" })).resolves.toEqual({ value: "restarted" });

    expect((await readFile(path, "utf8")).match(/start/g)).toHaveLength(2);
  });

  test("rejects calls after the restarted worker also crashes", async () => {
    const path = await statePath();
    const worker = client("always-crash", path);

    await expect(worker.call("profiles.list", { control: "crash" })).rejects.toThrow("exited");
    await expect(worker.call("profiles.list", { control: "crash" })).rejects.toThrow("exited");
    await expect(worker.call("profiles.list", { value: "no-third-start" })).rejects.toThrow("repeatedly");

    expect((await readFile(path, "utf8")).match(/start/g)).toHaveLength(2);
  });

  test("rejects every pending call when the worker exits", async () => {
    const worker = client("always-crash");
    const first = worker.call("profiles.list", { control: "wait" });
    const second = worker.call("profiles.list", { control: "wait" });
    const crash = worker.call("profiles.list", { control: "crash" });

    const outcomes = await Promise.allSettled([first, second, crash]);
    expect(outcomes.every((outcome) => outcome.status === "rejected")).toBe(true);
    for (const outcome of outcomes) {
      if (outcome.status === "rejected") expect(String(outcome.reason)).not.toContain("control");
    }
  });
});
