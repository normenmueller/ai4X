import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { ProjectionFailure, loadPolicyProjection, validatePolicyProjection } from "./projection.mjs";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO_ROOT = path.resolve(HERE, "..", "..", "..");
const GENERATED = path.join(REPO_ROOT, ".ai4x", "generated", "assurance", "session-hygiene-policy.json");

test("authoritative Dhall facts typecheck and generated projection is fresh", () => {
  for (const subject of [
    ".ai4x/coordination/collaboration.dhall",
    ".ai4x/operations/session-hygiene.dhall",
    "util/repository/session-hygiene/projection.dhall",
  ]) {
    const result = spawnSync("dhall", ["type", "--file", subject, "--no-cache"], { cwd: REPO_ROOT, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
  }
  const check = spawnSync("node", ["util/repository/session-hygiene/publish-projection.mjs", "--check"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  assert.equal(check.status, 0, check.stderr);
  assert.match(check.stdout, /projection is current/);
});

test("ordinary loader consumes inert JSON and rejects source digest drift", () => {
  const loaded = loadPolicyProjection({ repositoryRoot: REPO_ROOT, projectionPath: GENERATED });
  assert.equal(loaded.resources.minimumFreeBytes, 32_212_254_720);

  const temp = mkdtempSync(path.join(os.tmpdir(), "ai4x-projection-"));
  try {
    const coordination = path.join(temp, ".ai4x", "coordination");
    const operations = path.join(temp, ".ai4x", "operations");
    const generated = path.join(temp, ".ai4x", "generated", "assurance");
    mkdirSync(coordination, { recursive: true });
    mkdirSync(operations, { recursive: true });
    mkdirSync(generated, { recursive: true });
    writeFileSync(path.join(coordination, "collaboration.dhall"), readFileSync(path.join(REPO_ROOT, ".ai4x", "coordination", "collaboration.dhall")));
    writeFileSync(path.join(operations, "session-hygiene.dhall"), `${readFileSync(path.join(REPO_ROOT, ".ai4x", "operations", "session-hygiene.dhall"), "utf8")}\n-- drift\n`);
    const copiedProjection = path.join(generated, "session-hygiene-policy.json");
    writeFileSync(copiedProjection, readFileSync(GENERATED));
    assert.throws(
      () => loadPolicyProjection({ repositoryRoot: temp, projectionPath: copiedProjection }),
      (error) => error instanceof ProjectionFailure && error.code === "SH-PROJECTION-STALE",
    );
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("projection schema rejects an unmatched above-one approval", () => {
  const projection = JSON.parse(readFileSync(GENERATED, "utf8"));
  projection.collaboration.writeCapableAssignmentLimit = {
    maximum: 2,
    aboveOneApproval: { decisionReference: "M121-OTHER", approvedMaximum: 3 },
  };
  assert.throws(
    () => validatePolicyProjection(projection),
    (error) => error instanceof ProjectionFailure && error.code === "SH-PROJECTION-INVALID",
  );
});

test("ordinary projection loader cannot invoke Dhall or a child process", () => {
  const source = readFileSync(path.join(HERE, "projection.mjs"), "utf8");
  assert.doesNotMatch(source, /node:child_process|spawnSync\(|execFile(?:Sync)?\(|dhall text/);
});
