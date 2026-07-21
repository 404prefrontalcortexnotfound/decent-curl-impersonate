#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const [manifestPath] = process.argv.slice(2);
if (!manifestPath) throw new Error("usage: node scripts/verify-package.mjs <npm-pack-json>");

const parsed = JSON.parse(await readFile(manifestPath, "utf8"));
if (!Array.isArray(parsed) || parsed.length !== 1 || !Array.isArray(parsed[0]?.files)) {
  throw new Error("npm pack JSON must describe exactly one package and its files");
}

const packageRoot = process.cwd();
const files = parsed[0].files.map((entry) => entry.path).sort();
const required = [
  "LICENSE",
  "README.md",
  "THIRD_PARTY_NOTICES.md",
  "dist/index.js",
  "package.json",
  "pyproject.toml",
  "python/decent_curl_impersonate/__init__.py",
  "python/decent_curl_impersonate/__main__.py",
  "python/decent_curl_impersonate/engine.py",
  "python/decent_curl_impersonate/protocol.py",
  "python/decent_curl_impersonate/worker.py",
  "upstream/curl_cffi.lock.json",
  "upstream/curl_impersonate.lock.json",
  "uv.lock",
];
const allowed = [
  /^(LICENSE|README\.md|THIRD_PARTY_NOTICES\.md|package\.json|pyproject\.toml|uv\.lock)$/,
  /^dist\/[^/]+\.js$/,
  /^python\/decent_curl_impersonate\/[^/]+\.py$/,
  /^upstream\/(curl_cffi|curl_impersonate)\.lock\.json$/,
];

const unexpected = files.filter((path) => !allowed.some((pattern) => pattern.test(path)));
const missing = required.filter((path) => !files.includes(path));
if (unexpected.length) throw new Error(`unexpected package files: ${unexpected.join(", ")}`);
if (missing.length) throw new Error(`missing package files: ${missing.join(", ")}`);

const packageJson = JSON.parse(await readFile(resolve(packageRoot, "package.json"), "utf8"));
const lifecycleHooks = ["preinstall", "install", "postinstall", "prepublish", "prepare"]
  .filter((name) => Object.hasOwn(packageJson.scripts ?? {}, name));
if (lifecycleHooks.length) {
  throw new Error(`install/publication lifecycle hooks are forbidden: ${lifecycleHooks.join(", ")}`);
}

const forbidden = [
  { label: "developer home path", pattern: /(?:\/Users\/|[A-Za-z]:\\Users\\)/ },
  { label: "worktree path", pattern: /\.worktrees\// },
  { label: "private development owner", pattern: /404prefrontalcortexnotfound/i },
  { label: "private development repository", pattern: /github\.com\/[^"'\s]+\/decent-curl-impersonate(?:\.git)?/i },
];
for (const path of files) {
  const content = await readFile(resolve(packageRoot, path));
  if (content.includes(0)) continue;
  const text = content.toString("utf8");
  for (const { label, pattern } of forbidden) {
    if (pattern.test(text)) throw new Error(`${label} found in package file ${path}`);
  }
}

console.log(`verified ${files.length} intended package files; no private paths, private repository URLs, tests, environments, or lifecycle hooks`);
