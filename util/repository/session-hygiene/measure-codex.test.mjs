import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { MeasurementFailure, measureCodexRequest } from "./measure-codex.mjs";

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "ai4x-session-measure-"));
  const projectRoot = path.join(root, "project");
  const codexHome = path.join(root, "codex");
  const sessions = path.join(codexHome, "sessions", "2026", "08", "18");
  mkdirSync(path.join(projectRoot, ".git"), { recursive: true });
  mkdirSync(sessions, { recursive: true });
  const sessionId = "019c-session-parent";
  const agentId = "019c-agent-child";
  const parentPath = path.join(sessions, `rollout-${sessionId}.jsonl`);
  const childPath = path.join(sessions, `rollout-${agentId}.jsonl`);
  writeFileSync(parentPath, "parent secret bytes");
  writeFileSync(childPath, "child secret bytes");
  return { root, projectRoot, codexHome, sessionId, agentId, parentPath, childPath };
}

function request(fx, overrides = {}) {
  return {
    schemaVersion: "ai4x.codex-session-measurement-request/v1",
    provider: "codex",
    providerVersion: "0.147.0",
    lifecycle: "before-delegation",
    issue: "#121",
    sessionId: fx.sessionId,
    transcriptPath: fx.parentPath,
    cwd: fx.projectRoot,
    projectRoot: fx.projectRoot,
    codexHome: fx.codexHome,
    ...overrides,
  };
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

test("measures both accepted versions exactly without returning a path or transcript content", () => {
  const fx = fixture();
  try {
    const before = readFileSync(fx.parentPath);
    for (const providerVersion of ["0.147.0", "0.148.0"]) {
      const result = measure(fx, request(fx, { providerVersion }));
      assert.equal(result.parentRolloutBytes, before.length);
      assert.equal(result.childRollout.state, "not-created");
      assert.equal(result.binding.providerVersion, providerVersion);
      assert.equal(result.binding.parentPathValidated, true);
      assert.equal(result.observedAtEpochSeconds, 1_000);
      assert.ok(result.freeBytes > 0);
      assert.doesNotMatch(JSON.stringify(result), /parent secret|sessions|rollout-|\.jsonl/);
    }
    assert.deepEqual(readFileSync(fx.parentPath), before);
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

test("reports pending child path during activity and measures only provider path at stop", () => {
  const fx = fixture();
  try {
    const active = measure(fx, request(fx, { lifecycle: "active-interval" }));
    assert.deepEqual(active.childRollout, { state: "pending-provider-path" });

    const stopped = measure(fx, request(fx, {
      lifecycle: "subagent-stop",
      agentId: fx.agentId,
      agentTranscriptPath: fx.childPath,
    }));
    assert.deepEqual(stopped.childRollout, { state: "measured", bytes: Buffer.byteLength("child secret bytes") });
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

test("fails closed below, between, and above the exact accepted version set", () => {
  const fx = fixture();
  try {
    for (const providerVersion of ["0.146.0", "0.147.1", "0.149.0"]) {
      assert.equal(
        failureCode(() => measure(fx, request(fx, { providerVersion }))),
        "SH-MEASURE-UNSUPPORTED-VERSION",
      );
    }
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

test("fails closed for project mismatch", () => {
  const fx = fixture();
  try {
    assert.equal(failureCode(() => measure(fx, request(fx, { cwd: fx.root }))), "SH-MEASURE-PROJECT-BINDING");
    assert.equal(failureCode(() => measure(fx, request(fx, { cwd: fx.root, projectRoot: fx.root }))), "SH-MEASURE-PROJECT-BINDING");
    assert.equal(failureCode(() => measure(fx, request(fx, { codexHome: fx.root }))), "SH-MEASURE-PATH-ESCAPE");
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

test("rejects terminal symlink, allowlist escape, missing path, and ID mismatch distinctly", () => {
  const fx = fixture();
  try {
    const symlinkPath = path.join(path.dirname(fx.parentPath), `link-${fx.sessionId}.jsonl`);
    symlinkSync(fx.parentPath, symlinkPath);
    assert.equal(failureCode(() => measure(fx, request(fx, { transcriptPath: symlinkPath }))), "SH-MEASURE-TERMINAL-SYMLINK");

    const escaped = path.join(fx.root, `rollout-${fx.sessionId}.jsonl`);
    writeFileSync(escaped, "foreign");
    assert.equal(failureCode(() => measure(fx, request(fx, { transcriptPath: escaped }))), "SH-MEASURE-PATH-ESCAPE");

    assert.equal(failureCode(() => measure(fx, request(fx, { transcriptPath: path.join(path.dirname(fx.parentPath), `missing-${fx.sessionId}.jsonl`) }))), "SH-MEASURE-MISSING-FILE");
    assert.equal(failureCode(() => measure(fx, request(fx, { sessionId: "wrong-id" }))), "SH-MEASURE-ID-MISMATCH");
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

test("detects path identity change across descriptor measurement", () => {
  const fx = fixture();
  try {
    let parentCalls = 0;
    const deps = {
      lstatSync(subject) {
        const stat = (awaitImportFs()).lstatSync(subject, { bigint: true });
        if (subject === fx.parentPath) parentCalls += 1;
        return subject === fx.parentPath && parentCalls === 2
          ? new Proxy(stat, { get: (target, property) => property === "ino" ? target.ino + 1n : Reflect.get(target, property, target) })
          : stat;
      },
    };
    assert.equal(failureCode(() => measure(fx, request(fx), deps)), "SH-MEASURE-IDENTITY-CHANGED");
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
});

test("production adapter exposes no write, cleanup, archive, process, or signal surface", () => {
  const source = readFileSync(new URL("./measure-codex.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /writeFile|appendFile|unlink|rmSync|rmdir|archive|child_process|spawn|execFile|process\.kill/);
  assert.match(source, /O_NOFOLLOW/);
});

function awaitImportFs() {
  // Kept in the test boundary so production exposes no dynamic or process surface.
  return globalThis.__ai4xFsForTest;
}

import * as fsForTest from "node:fs";
globalThis.__ai4xFsForTest = fsForTest;
