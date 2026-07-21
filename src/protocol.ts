import { type Static, Type } from "@sinclair/typebox";

export const WorkerOperationSchema = Type.Union([
  Type.Literal("profiles.list"),
  Type.Literal("request.execute"),
  Type.Literal("download.execute"),
  Type.Literal("session.create"),
  Type.Literal("session.list"),
  Type.Literal("session.close"),
  Type.Literal("websocket.connect"),
  Type.Literal("websocket.send"),
  Type.Literal("websocket.receive"),
  Type.Literal("websocket.close"),
  Type.Literal("diagnostic.fingerprint"),
  Type.Literal("system.shutdown"),
]);

export type WorkerOperation = Static<typeof WorkerOperationSchema>;

export const WorkerRequestSchema = Type.Object(
  {
    id: Type.String(),
    operation: WorkerOperationSchema,
    params: Type.Record(Type.String(), Type.Unknown()),
  },
  { additionalProperties: false },
);

export type WorkerRequest = Static<typeof WorkerRequestSchema>;

export const WorkerErrorSchema = Type.Object(
  {
    code: Type.String(),
    message: Type.String(),
    retryable: Type.Boolean(),
    metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  },
  { additionalProperties: false },
);

export type WorkerError = Static<typeof WorkerErrorSchema>;

export const WorkerSuccessSchema = Type.Object(
  {
    id: Type.String(),
    ok: Type.Literal(true),
    result: Type.Unknown(),
  },
  { additionalProperties: false },
);

export type WorkerSuccess = Static<typeof WorkerSuccessSchema>;

export const WorkerFailureSchema = Type.Object(
  {
    id: Type.String(),
    ok: Type.Literal(false),
    error: WorkerErrorSchema,
  },
  { additionalProperties: false },
);

export type WorkerFailure = Static<typeof WorkerFailureSchema>;

export const WorkerResponseSchema = Type.Union([
  WorkerSuccessSchema,
  WorkerFailureSchema,
]);

export type WorkerResponse = Static<typeof WorkerResponseSchema>;
