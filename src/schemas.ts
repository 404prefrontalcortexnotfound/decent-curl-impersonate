import { StringEnum } from "@earendil-works/pi-ai";
import { Type } from "typebox";

const SensitiveHeaders = Type.Record(Type.String(), Type.String(), {
  description: "HTTP header values. Authorization and Cookie values are sensitive and must not be disclosed.",
});

const Query = Type.Record(Type.String(), Type.Unknown(), {
  description: "URL query values may contain sensitive API keys or tokens and are not returned in Pi metadata.",
});

const Authentication = Type.Union([
  Type.Object({
    type: StringEnum(["basic"] as const),
    username: Type.String({ description: "Basic-auth username; treat as sensitive." }),
    password: Type.String({ description: "Sensitive Basic-auth password. Never disclose it." }),
  }, { additionalProperties: false }),
  Type.Object({
    type: StringEnum(["bearer"] as const),
    token: Type.String({ description: "Sensitive Bearer token. Never disclose it." }),
  }, { additionalProperties: false }),
], { description: "Sensitive authentication credentials." });

const MultipartPart = Type.Union([
  Type.Object({
    path: Type.String({ description: "Upload path. The uploaded file contents are sensitive and are never returned in details." }),
    filename: Type.Optional(Type.String()),
    content_type: Type.Optional(Type.String()),
    value: Type.Optional(Type.Never()),
  }, { additionalProperties: false }),
  Type.Object({
    value: Type.String({ description: "Multipart text value; may be sensitive." }),
    content_type: Type.Optional(Type.String()),
    path: Type.Optional(Type.Never()),
    filename: Type.Optional(Type.Never()),
  }, { additionalProperties: false }),
]);

const NoBody = Type.Object({
  json: Type.Optional(Type.Never()),
  form: Type.Optional(Type.Never()),
  content: Type.Optional(Type.Never()),
  multipart: Type.Optional(Type.Never()),
});
const JsonBody = Type.Object({
  json: Type.Unknown({ description: "JSON request body; may contain sensitive data." }),
  form: Type.Optional(Type.Never()),
  content: Type.Optional(Type.Never()),
  multipart: Type.Optional(Type.Never()),
});
const FormBody = Type.Object({
  form: Type.Record(Type.String(), Type.Unknown(), { description: "Form request body; values may be sensitive." }),
  json: Type.Optional(Type.Never()),
  content: Type.Optional(Type.Never()),
  multipart: Type.Optional(Type.Never()),
});
const ContentBody = Type.Object({
  content: Type.String({ description: "Raw text request body; may be sensitive." }),
  json: Type.Optional(Type.Never()),
  form: Type.Optional(Type.Never()),
  multipart: Type.Optional(Type.Never()),
});
const MultipartBody = Type.Object({
  multipart: Type.Record(Type.String(), MultipartPart, {
    description: "Multipart fields and file uploads; values and uploaded file contents may be sensitive.",
  }),
  json: Type.Optional(Type.Never()),
  form: Type.Optional(Type.Never()),
  content: Type.Optional(Type.Never()),
});

const RequestOptions = {
  url: Type.String({ description: "HTTP or HTTPS URL. Do not embed credentials in the URL." }),
  method: Type.Optional(Type.String({ description: "Arbitrary HTTP method (default GET)." })),
  query: Type.Optional(Query),
  headers: Type.Optional(SensitiveHeaders),
  auth: Type.Optional(Authentication),
  profile: Type.Optional(Type.String({ description: "Installed curl_cffi browser profile." })),
  http_version: Type.Optional(StringEnum(["auto", "1.1", "2", "3"] as const, {
    description: "HTTP protocol preference.",
    default: "auto",
  })),
  proxy: Type.Optional(Type.String({
    description: "Sensitive proxy URL. Proxy usernames and passwords must not be disclosed.",
  })),
  allow_redirects: Type.Optional(Type.Union([Type.Boolean(), Type.Literal("safe")])),
  max_redirects: Type.Optional(Type.Integer({ minimum: 0 })),
  timeout: Type.Optional(Type.Number({ minimum: 0 })),
  retries: Type.Optional(Type.Integer({ minimum: 0 })),
  verify: Type.Optional(Type.Boolean({ description: "Whether to verify TLS certificates." })),
  session_id: Type.Optional(Type.String()),
};

export const RequestParameters = Type.Intersect([
  Type.Object(RequestOptions),
  Type.Union([NoBody, JsonBody, FormBody, ContentBody, MultipartBody]),
]);

export const DownloadParameters = Type.Object({
  url: RequestOptions.url,
  query: RequestOptions.query,
  headers: RequestOptions.headers,
  auth: RequestOptions.auth,
  profile: RequestOptions.profile,
  http_version: RequestOptions.http_version,
  proxy: RequestOptions.proxy,
  allow_redirects: RequestOptions.allow_redirects,
  max_redirects: RequestOptions.max_redirects,
  timeout: RequestOptions.timeout,
  retries: RequestOptions.retries,
  verify: RequestOptions.verify,
  session_id: RequestOptions.session_id,
  path: Type.Optional(Type.String({ description: "Destination path. A private temporary path is used when omitted." })),
  overwrite: Type.Optional(Type.Boolean({ default: false })),
}, { additionalProperties: false });

export const SessionParameters = Type.Object({
  action: StringEnum(["create", "list", "close"] as const, {
    description: "Session action.",
  }),
  session_id: Type.Optional(Type.String({ description: "Required for close." })),
  profile: Type.Optional(Type.String({ description: "Default browser profile for a created session." })),
}, { additionalProperties: false });

export const WebSocketParameters = Type.Object({
  action: StringEnum(["connect", "send", "receive", "close"] as const, {
    description: "WebSocket action.",
  }),
  websocket_id: Type.Optional(Type.String()),
  url: Type.Optional(Type.String({ description: "WebSocket URL for connect." })),
  headers: Type.Optional(SensitiveHeaders),
  profile: Type.Optional(Type.String()),
  proxy: RequestOptions.proxy,
  verify: RequestOptions.verify,
  session_id: RequestOptions.session_id,
  message: Type.Optional(Type.String({ description: "Text message to send; may be sensitive." })),
  data_base64: Type.Optional(Type.String({ description: "Base64 binary message to send; may be sensitive." })),
  timeout: Type.Optional(Type.Number({ minimum: 0 })),
  code: Type.Optional(Type.Integer({ minimum: 0, maximum: 65535 })),
  reason: Type.Optional(Type.String()),
}, { additionalProperties: false });

export const ProfilesParameters = Type.Object({
  action: StringEnum(["list", "fingerprint"] as const, {
    description: "List installed profiles or run a public fingerprint diagnostic.",
  }),
  profile: Type.Optional(Type.String({ description: "Browser profile for fingerprint diagnostics." })),
  url: Type.Optional(Type.String({ description: "Optional public fingerprint endpoint." })),
}, { additionalProperties: false });
