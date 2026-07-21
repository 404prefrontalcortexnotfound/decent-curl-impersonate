import { describe, expect, test } from "bun:test";
import { Value } from "@sinclair/typebox/value";

import {
  WorkerFailureSchema,
  WorkerRequestSchema,
  WorkerResponseSchema,
  WorkerSuccessSchema,
  type WorkerOperation,
} from "../src/protocol.js";

const operations = [
  "profiles.list",
  "request.execute",
  "download.execute",
  "session.create",
  "session.list",
  "session.close",
  "websocket.connect",
  "websocket.send",
  "websocket.receive",
  "websocket.close",
  "diagnostic.fingerprint",
  "system.shutdown",
] as const satisfies readonly WorkerOperation[];

describe("worker response envelopes", () => {
  test("accepts only complete success responses", () => {
    expect(Value.Check(WorkerSuccessSchema, { id: "request-1", ok: true, result: {} })).toBe(true);
    expect(Value.Check(WorkerSuccessSchema, { ok: true, result: {} })).toBe(false);
    expect(Value.Check(WorkerSuccessSchema, { id: "request-1", result: {} })).toBe(false);
    expect(Value.Check(WorkerSuccessSchema, { id: "request-1", ok: true })).toBe(false);
  });

  test("accepts only complete structured failure responses", () => {
    const failure = {
      id: "request-2",
      ok: false,
      error: {
        code: "network_error",
        message: "request failed",
        retryable: true,
        metadata: { status: 503 },
      },
    };

    expect(Value.Check(WorkerFailureSchema, failure)).toBe(true);
    expect(Value.Check(WorkerResponseSchema, failure)).toBe(true);
    expect(Value.Check(WorkerFailureSchema, { ...failure, id: undefined })).toBe(false);
    expect(Value.Check(WorkerFailureSchema, { ...failure, ok: true })).toBe(false);
    expect(Value.Check(WorkerFailureSchema, { id: "request-2", ok: false })).toBe(false);
    expect(
      Value.Check(WorkerFailureSchema, {
        ...failure,
        error: { code: "network_error", message: "request failed" },
      }),
    ).toBe(false);
  });
});

describe("worker operations", () => {
  for (const operation of operations) {
    test(`accepts ${operation}`, () => {
      expect(
        Value.Check(WorkerRequestSchema, {
          id: "request-3",
          operation,
          params: {},
        }),
      ).toBe(true);
    });
  }

  test("rejects unknown operations", () => {
    expect(
      Value.Check(WorkerRequestSchema, {
        id: "request-4",
        operation: "ftp.execute",
        params: {},
      }),
    ).toBe(false);
  });
});
