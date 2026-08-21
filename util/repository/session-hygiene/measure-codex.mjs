#!/usr/bin/env node

import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
  statfsSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CODEX_MANAGED_DELEGATION_PROFILE,
  CODEX_MANAGED_DELEGATION_PROFILE_DIGEST,
} from "./codex-managed-delegation.mjs";

const REQUEST_SCHEMA = "ai4x.codex-session-measurement-request/v2";
const RESULT_SCHEMA = "ai4x.codex-session-observation/v2";
const REQUEST_KEYS = new Set([
  "schemaVersion", "provider", "providerVersion", "lifecycle", "issue", "cwd", "projectRoot",
  "parentSessionId", "parentRolloutPath", "childAgentId", "childRolloutPath", "codexHome",
]);
const LIFECYCLES = new Set(["before-delegation", "active-interval", "subagent-stop", "after-issue-completion", "handoff-boundary"]);

export class MeasurementFailure extends Error {
  constructor(code, message) {
    super(message);
    this.name = "MeasurementFailure";
    this.code = code;
  }
}

function fail(code, message) {
  throw new MeasurementFailure(code, message);
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0 && value.trim() === value;
}

function safeRealpath(subject, io, code) {
  try {
    return io.realpathSync(subject);
  } catch (error) {
    fail(code, `required path is unavailable: ${error.code ?? "unknown"}`);
  }
}

function isWithin(root, subject) {
  const relative = path.relative(root, subject);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function sameIdentity(left, right) {
  return left.dev === right.dev && left.ino === right.ino && left.mode === right.mode;
}

function measureExactFile(subject, expectedId, sessionsRoot, io) {
  let before;
  try {
    before = io.lstatSync(subject, { bigint: true });
  } catch (error) {
    fail(error.code === "ENOENT" ? "SH-MEASURE-MISSING-FILE" : "SH-MEASURE-UNSAFE-PATH", "exact rollout path is unavailable");
  }
  if (before.isSymbolicLink()) fail("SH-MEASURE-TERMINAL-SYMLINK", "terminal rollout component is a symbolic link");
  if (!before.isFile()) fail("SH-MEASURE-UNSAFE-PATH", "exact rollout path is not a regular file");

  const resolved = safeRealpath(subject, io, "SH-MEASURE-MISSING-FILE");
  if (!isWithin(sessionsRoot, resolved)) fail("SH-MEASURE-PATH-ESCAPE", "exact rollout path escapes the supported session root");
  if (!path.basename(resolved).includes(expectedId)) fail("SH-MEASURE-ID-MISMATCH", "rollout path does not bind the provider identity");

  let descriptor;
  try {
    descriptor = io.openSync(subject, constants.O_RDONLY | constants.O_NOFOLLOW);
    const opened = io.fstatSync(descriptor, { bigint: true });
    const after = io.lstatSync(subject, { bigint: true });
    if (!sameIdentity(before, opened) || !sameIdentity(opened, after)) fail("SH-MEASURE-IDENTITY-CHANGED", "rollout identity changed during measurement");
    if (opened.size > BigInt(Number.MAX_SAFE_INTEGER)) fail("SH-MEASURE-SIZE-UNSAFE", "rollout size exceeds the safe integer boundary");
    return Number(opened.size);
  } catch (error) {
    if (error instanceof MeasurementFailure) throw error;
    fail("SH-MEASURE-UNSAFE-PATH", `rollout descriptor could not be measured: ${error.code ?? "unknown"}`);
  } finally {
    if (descriptor !== undefined) {
      try {
        io.closeSync(descriptor);
      } catch {
        fail("SH-MEASURE-DESCRIPTOR-CLOSE", "rollout descriptor could not be closed safely");
      }
    }
  }
}

function diskFreeBytes(projectRoot, io) {
  let stats;
  try {
    stats = io.statfsSync(projectRoot, { bigint: true });
  } catch (error) {
    fail("SH-MEASURE-DISK-UNAVAILABLE", `disk observation failed: ${error.code ?? "unknown"}`);
  }
  const value = stats.bavail * stats.bsize;
  if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < 0n) fail("SH-MEASURE-SIZE-UNSAFE", "free-space value exceeds the safe integer boundary");
  return Number(value);
}

function diagnoseExactFile(subject, expectedId, sessionsRoot, setupFailure, io) {
  if (setupFailure !== null) return Object.freeze({ state: "failed", code: setupFailure });
  try {
    return Object.freeze({ state: "satisfied", bytes: measureExactFile(subject, expectedId, sessionsRoot, io) });
  } catch (error) {
    if (error instanceof MeasurementFailure) return Object.freeze({ state: "failed", code: error.code });
    return Object.freeze({ state: "failed", code: "SH-MEASURE-UNSAFE-PATH" });
  }
}

const DEFAULT_IO = Object.freeze({ closeSync, fstatSync, lstatSync, openSync, realpathSync, statfsSync });

export function measureCodexRequest(request, overrides = {}) {
  const io = { ...DEFAULT_IO, ...overrides };
  if (!request
    || typeof request !== "object"
    || Array.isArray(request)
    || request.schemaVersion !== REQUEST_SCHEMA
    || Object.keys(request).some((key) => !REQUEST_KEYS.has(key))) {
    fail("SH-MEASURE-INVALID-REQUEST", "measurement request schema is invalid");
  }
  if (request.provider !== "codex") fail("SH-MEASURE-UNSUPPORTED-PROVIDER", "provider is unsupported");
  if (!nonEmpty(request.providerVersion)) fail("SH-MEASURE-MISSING-FIELD", "provider version telemetry is absent");
  if (!LIFECYCLES.has(request.lifecycle)) fail("SH-MEASURE-INVALID-LIFECYCLE", "lifecycle is unsupported");
  for (const field of ["issue", "cwd", "projectRoot"]) {
    if (!nonEmpty(request[field])) fail("SH-MEASURE-MISSING-FIELD", `required field is absent: ${field}`);
  }
  if (!/^#[1-9][0-9]*$/.test(request.issue)) fail("SH-MEASURE-INVALID-REQUEST", "Issue identity is invalid");

  const projectRoot = safeRealpath(request.projectRoot, io, "SH-MEASURE-PROJECT-BINDING");
  const cwd = safeRealpath(request.cwd, io, "SH-MEASURE-PROJECT-BINDING");
  const trustedProjectRoot = safeRealpath(overrides.trustedProjectRoot ?? process.cwd(), io, "SH-MEASURE-PROJECT-BINDING");
  if (cwd !== projectRoot || projectRoot !== trustedProjectRoot) fail("SH-MEASURE-PROJECT-BINDING", "hook working directory does not match the trusted project root");
  let gitMarker;
  try {
    gitMarker = io.lstatSync(path.join(projectRoot, ".git"), { bigint: true });
  } catch {
    fail("SH-MEASURE-PROJECT-BINDING", "project root lacks a repository binding");
  }
  if (!gitMarker.isDirectory() && !gitMarker.isFile()) fail("SH-MEASURE-PROJECT-BINDING", "project root repository binding is unsupported");

  const parentIdentitySupplied = request.parentSessionId !== undefined;
  const parentPathSupplied = request.parentRolloutPath !== undefined;
  const childIdentitySupplied = request.childAgentId !== undefined;
  const childPathSupplied = request.childRolloutPath !== undefined;
  if (parentIdentitySupplied !== parentPathSupplied || childIdentitySupplied !== childPathSupplied) {
    fail("SH-MEASURE-MISSING-FIELD", "exact rollout identity and path must be supplied together");
  }
  if (parentIdentitySupplied && (!nonEmpty(request.parentSessionId)
      || !/^[A-Za-z0-9][A-Za-z0-9-]{7,127}$/.test(request.parentSessionId))) {
    fail("SH-MEASURE-ID-MISMATCH", "parent session identity is malformed");
  }
  if (childIdentitySupplied && (!nonEmpty(request.childAgentId)
      || !/^[A-Za-z0-9][A-Za-z0-9-]{7,127}$/.test(request.childAgentId))) {
    fail("SH-MEASURE-ID-MISMATCH", "child agent identity is malformed");
  }
  if (childIdentitySupplied && request.lifecycle !== "subagent-stop") {
    fail("SH-MEASURE-INVALID-LIFECYCLE", "child rollout measurement is only accepted at SubagentStop");
  }

  let sessionsRoot;
  let rolloutSetupFailure = null;
  if (parentIdentitySupplied || childIdentitySupplied) {
    if (!nonEmpty(request.codexHome)) fail("SH-MEASURE-MISSING-FIELD", "Codex home is required for exact rollout measurement");
    try {
      const codexHome = safeRealpath(request.codexHome, io, "SH-MEASURE-PATH-ESCAPE");
      const trustedCodexHome = safeRealpath(overrides.trustedCodexHome ?? process.env.CODEX_HOME ?? path.join(os.homedir(), ".codex"), io, "SH-MEASURE-PATH-ESCAPE");
      if (codexHome !== trustedCodexHome) fail("SH-MEASURE-PATH-ESCAPE", "request does not match the trusted Codex home");
      sessionsRoot = safeRealpath(path.join(trustedCodexHome, "sessions"), io, "SH-MEASURE-PATH-ESCAPE");
    } catch (error) {
      rolloutSetupFailure = error instanceof MeasurementFailure ? error.code : "SH-MEASURE-PATH-ESCAPE";
    }
  }

  const parent = parentIdentitySupplied
    ? diagnoseExactFile(request.parentRolloutPath, request.parentSessionId, sessionsRoot, rolloutSetupFailure, io)
    : Object.freeze({ state: "unavailable" });
  let child;
  if (request.lifecycle === "before-delegation") child = { state: "not-created" };
  else if (["active-interval", "subagent-stop"].includes(request.lifecycle)) {
    child = childIdentitySupplied
      ? diagnoseExactFile(request.childRolloutPath, request.childAgentId, sessionsRoot, rolloutSetupFailure, io)
      : { state: "unavailable" };
  } else child = { state: "not-applicable" };

  return Object.freeze({
    schemaVersion: RESULT_SCHEMA,
    lifecycle: request.lifecycle,
    issue: request.issue,
    repositoryRoot: projectRoot,
    observedAtEpochSeconds: Math.floor((overrides.nowMilliseconds?.() ?? Date.now()) / 1000),
    freeBytes: diskFreeBytes(projectRoot, io),
    rolloutDiagnostic: Object.freeze({ parent, child: Object.freeze(child) }),
    binding: Object.freeze({
      provider: "codex",
      providerVersion: request.providerVersion,
      providerVersionAuthority: "telemetry-only",
      profileId: CODEX_MANAGED_DELEGATION_PROFILE.id,
      profileDigest: CODEX_MANAGED_DELEGATION_PROFILE_DIGEST,
      cwdMatchesProject: true,
    }),
  });
}

function main() {
  let request;
  try {
    request = JSON.parse(readFileSync(0, "utf8"));
    process.stdout.write(`${JSON.stringify(measureCodexRequest(request))}\n`);
    return 0;
  } catch (error) {
    const code = error instanceof MeasurementFailure ? error.code : "SH-MEASURE-INVALID-REQUEST";
    process.stderr.write(`[session-hygiene|${code}]: measurement failed\n`);
    return 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = main();

export const CODEX_MEASUREMENT_REQUEST_SCHEMA = REQUEST_SCHEMA;
export const CODEX_MEASUREMENT_RESULT_SCHEMA = RESULT_SCHEMA;
