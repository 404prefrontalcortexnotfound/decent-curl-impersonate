import { expect, test } from "bun:test";
import { join, resolve } from "node:path";

import { WorkerClient } from "../src/worker-client.js";

const runLive = process.env.DECENT_CURL_LIVE_TESTS === "1";
const liveTest = runLive ? test : test.skip;

liveTest("a dynamically discovered Chrome profile produces fingerprint fields", async () => {
  const packageRoot = resolve(import.meta.dir, "..");
  const python = process.platform === "win32"
    ? join(packageRoot, ".venv", "Scripts", "python.exe")
    : join(packageRoot, ".venv", "bin", "python");
  const worker = new WorkerClient({ command: python, cwd: packageRoot });
  try {
    const profiles = await worker.call("profiles.list", {}) as { profiles: string[] };
    const profile = profiles.profiles.find((candidate) => candidate.startsWith("chrome"));
    expect(profile).toBeDefined();

    const response = await worker.call("request.execute", {
      url: "https://tls.browserleaks.com/json",
      profile,
      timeout: 30,
    }) as { status: number; body: string };
    expect(response.status).toBe(200);

    const fingerprint = JSON.parse(response.body) as Record<string, unknown>;
    expect(typeof fingerprint.user_agent).toBe("string");
    expect((fingerprint.user_agent as string).length).toBeGreaterThan(0);
    const familyFields = ["ja3_hash", "ja3_text", "ja4", "ja4_r"]
      .filter((key) => typeof fingerprint[key] === "string" && (fingerprint[key] as string).length > 0);
    expect(familyFields.length).toBeGreaterThan(0);
  } finally {
    await worker.stop();
  }
}, 45_000);
