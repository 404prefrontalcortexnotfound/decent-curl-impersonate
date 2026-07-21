import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import { WorkerClient, resolvePythonCommand } from "./worker-client.js";
import { createToolDefinitions, type WorkerCaller } from "./tools.js";

const PACKAGE_VERSION = "0.1.0";
const STATUS_SCRIPT = [
  "import json, platform",
  "import curl_cffi",
  "from curl_cffi import Curl",
  "from curl_cffi.requests import BrowserType",
  "curl = Curl()",
  "libcurl = curl.version().decode('utf-8', 'replace')",
  "curl.close()",
  "print(json.dumps({'python': platform.python_version(), 'curl_cffi': curl_cffi.__version__, 'libcurl': libcurl, 'profile_count': len(BrowserType.__members__)}))",
].join("; ");

export interface ExtensionWorker extends WorkerCaller {
  stop(): Promise<void>;
}

export interface ExtensionDependencies {
  worker?: ExtensionWorker;
  packageRoot?: string;
  pythonCommand?: string;
  packageVersion?: string;
  runVisible?: (command: string, args: string[], cwd: string) => Promise<void>;
  runCapture?: (command: string, args: string[], cwd: string) => Promise<string>;
}

export function registerDecentCurlExtension(
  pi: ExtensionAPI,
  dependencies: ExtensionDependencies = {},
): void {
  const packageRoot = dependencies.packageRoot
    ?? resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const pythonCommand = dependencies.pythonCommand ?? resolvePythonCommand(packageRoot);
  const worker = dependencies.worker ?? new WorkerClient({ cwd: packageRoot });
  const runVisible = dependencies.runVisible ?? runCommandVisible;
  const runCapture = dependencies.runCapture ?? runCommandCapture;
  const packageVersion = dependencies.packageVersion ?? PACKAGE_VERSION;

  for (const tool of createToolDefinitions(worker)) pi.registerTool(tool);

  pi.registerCommand("decent-curl-setup", {
    description: "Create the frozen package-local Python 3.13 environment",
    handler: async (_args, ctx) => {
      ctx.ui.notify("Running decent-curl setup visibly with uv...", "info");
      try {
        await runVisible("uv", ["sync", "--frozen", "--python", "3.13", "--no-dev"], packageRoot);
        ctx.ui.notify("decent-curl setup complete.", "info");
      } catch {
        ctx.ui.notify("decent-curl setup failed. See the visible uv output above.", "error");
      }
    },
  });

  pi.registerCommand("decent-curl-status", {
    description: "Report extension, Python, curl_cffi, libcurl, and profile status",
    handler: async (_args, ctx) => {
      try {
        const output = await runCapture(pythonCommand, ["-c", STATUS_SCRIPT], packageRoot);
        const status = parseStatus(output);
        ctx.ui.notify([
          `decent-curl-impersonate ${packageVersion}`,
          `Python environment: ${pythonCommand}`,
          `Python version: ${status.python}`,
          `curl_cffi: ${status.curl_cffi}`,
          `libcurl: ${status.libcurl}`,
          `Available profiles: ${status.profile_count}`,
        ].join("\n"), "info");
      } catch {
        ctx.ui.notify([
          `decent-curl-impersonate ${packageVersion}`,
          `Python environment unavailable: ${pythonCommand}`,
          "Run /decent-curl-setup to create the frozen environment.",
        ].join("\n"), "warning");
      }
    },
  });

  pi.on("session_shutdown", async () => {
    await worker.stop();
  });
}

export default function decentCurlExtension(pi: ExtensionAPI): void {
  registerDecentCurlExtension(pi);
}

interface StatusResult {
  python: string;
  curl_cffi: string;
  libcurl: string;
  profile_count: number;
}

function parseStatus(output: string): StatusResult {
  const parsed: unknown = JSON.parse(output.trim());
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid status");
  const value = parsed as Record<string, unknown>;
  if (
    typeof value.python !== "string"
    || typeof value.curl_cffi !== "string"
    || typeof value.libcurl !== "string"
    || typeof value.profile_count !== "number"
  ) throw new Error("Invalid status");
  return value as unknown as StatusResult;
}

function runCommandVisible(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, { cwd, stdio: "inherit", shell: false });
    child.once("error", () => rejectRun(new Error("Setup command failed to start")));
    child.once("exit", (code) => {
      if (code === 0) resolveRun();
      else rejectRun(new Error("Setup command failed"));
    });
  });
}

function runCommandCapture(command: string, args: string[], cwd: string): Promise<string> {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, { cwd, stdio: ["ignore", "pipe", "ignore"], shell: false });
    const chunks: Buffer[] = [];
    let size = 0;
    child.stdout.on("data", (chunk: Buffer) => {
      size += chunk.byteLength;
      if (size <= 1024 * 1024) chunks.push(chunk);
      else child.kill();
    });
    child.once("error", () => rejectRun(new Error("Status command failed to start")));
    child.once("exit", (code) => {
      if (code === 0 && size <= 1024 * 1024) resolveRun(Buffer.concat(chunks).toString("utf8"));
      else rejectRun(new Error("Status command failed"));
    });
  });
}
