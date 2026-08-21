import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { CODEX_MANAGED_DELEGATION_PROFILE_DIGEST } from "./codex-managed-delegation.mjs";
import { MeasurementFailure, measureCodexRequest } from "./measure-codex.mjs";

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "ai4x-session-measure-"));
  const projectRoot = path.join(root, "project");
  const codexHome = path.join(root, "codex");
  const sessions = path.join(codexHome, "sessions", "2026", "08", "21");
  mkdirSync(path.join(projectRoot, ".git"), { recursive: true });
  mkdirSync(sessions, { recursive: true });
  const parentSessionId = "019c-session-parent";
  const childAgentId = "019c-agent-child";
  const parentRolloutPath = path.join(sessions, `rollout-${parentSessionId}.jsonl`);
  const childRolloutPath = path.join(sessions, `rollout-${childAgentId}.jsonl`);
  writeFileSync(parentRolloutPath, "parent secret bytes");
  writeFileSync(childRolloutPath, "child secret bytes");
  return { root, projectRoot, codexHome, parentSessionId, childAgentId, parentRolloutPath, childRolloutPath };
}

function request(fx, overrides = {}) {
  return {
    schemaVersion: "ai4x.codex-session-measurement-request/v2",
    provider: "codex",
    providerVersion: "0.149.0",
    lifecycle: "before-delegation",
    issue: "#154",
    cwd: fx.projectRoot,
    projectRoot: fx.projectRoot,
    ...overrides,
  };
}

function withParentPath(fx, overrides = {}) {
  return request(fx, {
    parentSessionId: fx.parentSessionId,
    parentRolloutPath: fx.parentRolloutPath,
    codexHome: fx.codexHome,
    ...overrides,
  });
}

function measure(fx, measurementRequest, overrides = {}) {
  return measureCodexRequest(measurementRequest, {
    trustedProjectRoot: fx.projectRoot,
    trustedCodexHome: fx.codexHome,
    nowMilliseconds: () => 1_000_000,
    ...overrides,
  });
}

function failureCode(action) {
  try {
    action();
  } catch (error) {
    assert.ok(error instanceof MeasurementFailure);
    return error.code;
  }
  return null;
}

test("host release is exact telemetry and path absence is a truthful non-blocking diagnostic", () => {
  const fx = fixture();
  try {
    for (const providerVersion of ["0.147.0", "0.148.0", "0.149.0", "9.0.0-next"]) {
      const result = measure(fx, request(fx, { providerVersion }));
      assert.equal(result.binding.providerVersion, providerVersion);
      assert.equal(result.binding.providerVersionAuthority, "telemetry-only");
      assert.equal(result.binding.profileDigest, CODEX_MANAGED_DELEGATION_PROFILE_DIGEST);
      assert.deepEqual(result.rolloutDiagnostic.parent, { state: "unavailable" });
      assert.deepEqual(result.rolloutDiagnostic.child, { state: "not-created" });
      assert.ok(result.freeBytes > 0);
    }
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

test("unavailable child path remains truthful during activity and at stop", () => {
  const fx = fixture();
  try {
    assert.deepEqual(measure(fx, request(fx, { lifecycle: "active-interval" })).rolloutDiagnostic.child, { state: "unavailable" });
    assert.deepEqual(measure(fx, request(fx, { lifecycle: "subagent-stop" })).rolloutDiagnostic.child, { state: "unavailable" });
    assert.deepEqual(measure(fx, request(fx, { lifecycle: "handoff-boundary" })).rolloutDiagnostic.child, { state: "not-applicable" });
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

test("measures only exact provider-supplied parent and stop-child paths without leaking content or paths", () => {
  const fx = fixture();
  try {
    const parentBefore = readFileSync(fx.parentRolloutPath);
    const parent = measure(fx, withParentPath(fx));
    assert.deepEqual(parent.rolloutDiagnostic.parent, { state: "satisfied", bytes: parentBefore.length });

    const stopped = measure(fx, withParentPath(fx, {
      lifecycle: "subagent-stop",
      childAgentId: fx.childAgentId,
      childRolloutPath: fx.childRolloutPath,
    }));
    assert.deepEqual(stopped.rolloutDiagnostic.child, { state: "satisfied", bytes: Buffer.byteLength("child secret bytes") });
    assert.doesNotMatch(JSON.stringify(stopped), /parent secret|child secret|sessions|rollout-|\.jsonl/);
    assert.deepEqual(readFileSync(fx.parentRolloutPath), parentBefore);
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

test("rejects partial caller path claims and child paths outside SubagentStop", () => {
  const fx = fixture();
  try {
    assert.equal(failureCode(() => measure(fx, request(fx, { parentSessionId: fx.parentSessionId }))), "SH-MEASURE-MISSING-FIELD");
    assert.equal(failureCode(() => measure(fx, request(fx, { parentRolloutPath: fx.parentRolloutPath }))), "SH-MEASURE-MISSING-FIELD");
    assert.equal(failureCode(() => measure(fx, request(fx, { childAgentId: fx.childAgentId, childRolloutPath: fx.childRolloutPath }))), "SH-MEASURE-INVALID-LIFECYCLE");
    assert.equal(failureCode(() => measure(fx, request(fx, { providerVersion: "" }))), "SH-MEASURE-MISSING-FIELD");
    assert.equal(failureCode(() => measure(fx, request(fx, { providerIdentity: "caller-shaped" }))), "SH-MEASURE-INVALID-REQUEST");
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

test("unsafe exact paths become failed diagnostics while project binding still fails closed", () => {
  const fx = fixture();
  try {
    const symlinkPath = path.join(path.dirname(fx.parentRolloutPath), `link-${fx.parentSessionId}.jsonl`);
    symlinkSync(fx.parentRolloutPath, symlinkPath);
    assert.deepEqual(measure(fx, withParentPath(fx, { parentRolloutPath: symlinkPath })).rolloutDiagnostic.parent, { state: "failed", code: "SH-MEASURE-TERMINAL-SYMLINK" });

    const escaped = path.join(fx.root, `rollout-${fx.parentSessionId}.jsonl`);
    writeFileSync(escaped, "foreign");
    assert.deepEqual(measure(fx, withParentPath(fx, { parentRolloutPath: escaped })).rolloutDiagnostic.parent, { state: "failed", code: "SH-MEASURE-PATH-ESCAPE" });
    assert.deepEqual(measure(fx, withParentPath(fx, { parentRolloutPath: path.join(path.dirname(fx.parentRolloutPath), `missing-${fx.parentSessionId}.jsonl`) })).rolloutDiagnostic.parent, { state: "failed", code: "SH-MEASURE-MISSING-FILE" });
    assert.deepEqual(measure(fx, withParentPath(fx, { parentSessionId: "wrong-id" })).rolloutDiagnostic.parent, { state: "failed", code: "SH-MEASURE-ID-MISMATCH" });
    assert.equal(failureCode(() => measure(fx, request(fx, { cwd: fx.root }))), "SH-MEASURE-PROJECT-BINDING");
    assert.deepEqual(measure(fx, withParentPath(fx, { codexHome: fx.root })).rolloutDiagnostic.parent, { state: "failed", code: "SH-MEASURE-PATH-ESCAPE" });
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

test("detects exact path identity change across descriptor measurement", () => {
  const fx = fixture();
  try {
    let parentCalls = 0;
    const deps = {
      lstatSync(subject) {
        const stat = fsForTest.lstatSync(subject, { bigint: true });
        if (subject === fx.parentRolloutPath) parentCalls += 1;
        return subject === fx.parentRolloutPath && parentCalls === 2
          ? new Proxy(stat, { get: (target, property) => property === "ino" ? target.ino + 1n : Reflect.get(target, property, target) })
          : stat;
      },
    };
    assert.deepEqual(measure(fx, withParentPath(fx), deps).rolloutDiagnostic.parent, { state: "failed", code: "SH-MEASURE-IDENTITY-CHANGED" });
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

test("production adapter has no write, cleanup, process, path-search, or release-allowlist surface", () => {
  const source = readFileSync(new URL("./measure-codex.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /writeFile|appendFile|unlink|rmSync|rmdir|archive|child_process|spawn|execFile|process\.kill|readdir|glob/);
  assert.doesNotMatch(source, /SUPPORTED_VERSION|0\.147\.0|0\.148\.0|0\.149\.0/);
  assert.match(source, /O_NOFOLLOW/);
  assert.match(source, /CODEX_MANAGED_DELEGATION_PROFILE_DIGEST/);
});

import * as fsForTest from "node:fs";
