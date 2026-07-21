import { appendFileSync, existsSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";

interface RequestMessage {
  id: string;
  operation: string;
  params: Record<string, unknown>;
}

const mode = process.env.FAKE_WORKER_MODE ?? "normal";
const stateFile = process.env.FAKE_WORKER_STATE_FILE;

if (stateFile) appendFileSync(stateFile, "start\n");

const lines = createInterface({ input: process.stdin });

function respond(message: unknown): void {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

lines.on("line", (line) => {
  const request = JSON.parse(line) as RequestMessage;

  if (request.operation === "system.shutdown") {
    if (stateFile) appendFileSync(stateFile, "shutdown\n");
    respond({ id: request.id, ok: true, result: { shutdown: true } });
    setImmediate(() => process.exit(0));
    return;
  }

  if (mode === "malformed") {
    process.stdout.write("not-json\n");
    return;
  }

  if (request.params.control === "wait") return;

  if (request.params.control === "crash") {
    if (mode === "crash-once" && stateFile && !existsSync(`${stateFile}.crashed`)) {
      writeFileSync(`${stateFile}.crashed`, "yes");
      process.exit(17);
    }
    if (mode === "always-crash") process.exit(18);
  }

  const delay = typeof request.params.delay === "number" ? request.params.delay : 0;
  setTimeout(() => {
    respond({
      id: request.id,
      ok: true,
      result: { value: request.params.value ?? "ok" },
    });
  }, delay);
});
