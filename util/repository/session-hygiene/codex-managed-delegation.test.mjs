import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  CODEX_MANAGED_DELEGATION_PROFILE,
  CODEX_MANAGED_DELEGATION_PROFILE_DIGEST,
  DelegationFailure,
  createCodexManagedDelegationRuntime,
  requiredCapabilities,
} from "./codex-managed-delegation.mjs";

const digest = (character) => `sha256:${character.repeat(64)}`;

function assignment(overrides = {}) {
  return {
    id: "review-154",
    digest: digest("a"),
    grantedAuthority: "read-only",
    allowedEffects: ["read-repository", "review"],
    ownedPaths: [],
    context: { mode: "bounded", turnCount: 1, rationale: "Exact durable review handoff." },
    ...overrides,
  };
}

function intent(overrides = {}) {
  const value = {
    schemaVersion: "ai4x.codex-managed-delegation-intent/v1",
    profileId: CODEX_MANAGED_DELEGATION_PROFILE.id,
    profileDigest: CODEX_MANAGED_DELEGATION_PROFILE_DIGEST,
    issue: "#154",
    repositoryRoot: "/work/ai4X",
    cwd: "/work/ai4X",
    lifecycle: "before-delegation",
    timestampEpochSeconds: 900,
    nonce: "nonce-154-review-0001",
    handoffDigest: digest("b"),
    assignment: assignment(),
    resource: { observedAtEpochSeconds: 900, freeBytes: 40_000_000_000, minimumFreeBytes: 32_212_254_720 },
    review: {
      independent: true,
      candidateDigest: digest("c"),
      excludedAuthorIdentities: ["/root/author"],
      maximumVerdicts: 1,
    },
    transition: null,
  };
  return {
    ...value,
    ...overrides,
    assignment: { ...value.assignment, ...overrides.assignment },
    resource: { ...value.resource, ...overrides.resource },
    review: overrides.review === null ? null : { ...value.review, ...overrides.review },
  };
}

function nativeResult(overrides = {}) {
  return {
    start: { taskIdentity: "/root/reviewer-154", state: "started" },
    stop: { taskIdentity: "/root/reviewer-154", state: "completed" },
    verdicts: ["PASS"],
    ...overrides,
  };
}

function runtime({ result = nativeResult(), before = "repo:r1/remote:g1", after = before } = {}) {
  const observations = [];
  return {
    observations,
    subject: createCodexManagedDelegationRuntime({
      invokeNative: async () => result,
      observeReadOnlyState: async (phase) => {
        observations.push(phase);
        return phase === "before" ? before : after;
      },
      nowEpochSeconds: () => 1_000,
    }),
  };
}

function code(error) {
  assert.ok(error instanceof DelegationFailure);
  return error.code;
}

test("profile is closed, release-neutral, and has exact conditional capabilities", () => {
  assert.equal(CODEX_MANAGED_DELEGATION_PROFILE.schemaVersion, "ai4x.delegation-profile/v1");
  assert.equal(CODEX_MANAGED_DELEGATION_PROFILE.id, "codex-managed-delegation/v1");
  assert.match(CODEX_MANAGED_DELEGATION_PROFILE_DIGEST, /^sha256:[0-9a-f]{64}$/);
  assert.doesNotMatch(JSON.stringify(CODEX_MANAGED_DELEGATION_PROFILE), /0\.14[789]\.0|providerVersion/);

  assert.deepEqual(requiredCapabilities({ authority: "read-only", independentReview: true, bootstrap: false }), [
    "managed-delegation/v1", "bounded-context/v1", "assignment-authority/v1",
    "project-binding/v1", "repository-free-space/v1", "review-independence/v1",
  ]);
  assert.deepEqual(requiredCapabilities({ authority: "write", independentReview: false, bootstrap: false }).at(-1), "writer-ownership/v1");
  assert.deepEqual(requiredCapabilities({ authority: "read-only", independentReview: true, bootstrap: true }).at(-1), "profile-transition/v1");
});

test("binds one direct native result, records not-exposed permissions, and proves read-only nonmutation", async () => {
  const { subject, observations } = runtime();
  const projection = await subject.run({ intent: intent(), task: "Review exact candidate." });
  assert.equal(projection.providerIdentity.taskIdentity, "/root/reviewer-154");
  assert.equal(projection.providerIdentity.source, "direct-native-result");
  assert.equal(projection.providerPermissions, "not-exposed");
  assert.equal(projection.authorityEffect, "none");
  assert.equal(projection.detachedAuthority, "none");
  assert.equal(projection.verdict, "PASS");
  assert.deepEqual(observations, ["before", "after"]);
  assert.doesNotMatch(JSON.stringify(projection), /\/work\/ai4X|Exact durable review handoff/);
});

test("rejects caller-shaped provider evidence and unknown intent fields", async () => {
  const { subject } = runtime();
  await assert.rejects(
    subject.run({ intent: { ...intent(), providerResult: nativeResult() }, task: "x" }),
    (error) => code(error) === "SH-DELEGATION-INTENT-INVALID",
  );
});

test("common admission matrix rejects profile, project, context, disk, handoff, and freshness drift", async () => {
  const cases = [
    [intent({ profileId: "unknown/v9" }), "SH-DELEGATION-INTENT-INVALID"],
    [intent({ profileDigest: digest("0") }), "SH-DELEGATION-INTENT-INVALID"],
    [intent({ cwd: "/work/foreign" }), "SH-DELEGATION-INTENT-INVALID"],
    [intent({ timestampEpochSeconds: 699 }), "SH-DELEGATION-INTENT-INVALID"],
    [intent({ nonce: "" }), "SH-DELEGATION-INTENT-INVALID"],
    [intent({ handoffDigest: "missing" }), "SH-DELEGATION-INTENT-INVALID"],
    [intent({ resource: { observedAtEpochSeconds: 699 } }), "SH-DELEGATION-INTENT-INVALID"],
    [intent({ resource: { freeBytes: 1 } }), "SH-DELEGATION-INTENT-INVALID"],
    [intent({ assignment: { context: { mode: "bounded", turnCount: 0, rationale: "" } } }), "SH-DELEGATION-CONTEXT-INVALID"],
    [intent({ assignment: { context: {
      mode: "all", turnCount: 0, rationale: "Exact exceptional reproduction.",
      poDecisionReference: "M154-FULL-01", approvedIssue: "#999", task: "reproduce",
    } } }), "SH-DELEGATION-CONTEXT-INVALID"],
  ];
  for (const [subjectIntent, expected] of cases) {
    await assert.rejects(runtime().subject.run({ intent: subjectIntent, task: "x" }), (error) => code(error) === expected);
  }

  const fullHistory = intent({ assignment: { context: {
    mode: "all", turnCount: 0, rationale: "Exact exceptional reproduction.",
    poDecisionReference: "M154-FULL-01", approvedIssue: "#154", task: "reproduce",
  } } });
  assert.equal((await runtime().subject.run({ intent: fullHistory, task: "x" })).verdict, "PASS");
});

test("missing or malformed direct native result blocks without detached fallback", async () => {
  for (const result of [null, {}, { start: {}, stop: {}, verdicts: [] }]) {
    await assert.rejects(
      runtime({ result }).subject.run({ intent: intent(), task: "x" }),
      (error) => ["SH-DELEGATION-NATIVE-RESULT-INVALID", "SH-DELEGATION-IDENTITY-MISSING"].includes(code(error)),
    );
  }
});

test("fails closed for read-only mutation and exposed permission contradiction", async () => {
  await assert.rejects(
    runtime({ after: "repo:r2/remote:g1" }).subject.run({ intent: intent(), task: "x" }),
    (error) => code(error) === "SH-DELEGATION-READONLY-MUTATION",
  );
  await assert.rejects(
    runtime({ result: nativeResult({ permissions: { repositoryWrite: true } }) }).subject.run({ intent: intent(), task: "x" }),
    (error) => code(error) === "SH-DELEGATION-PERMISSION-CONTRADICTION",
  );
});

test("rejects missing, mismatched, authoring, replayed, and multi-verdict native results", async () => {
  const cases = [
    [nativeResult({ start: { state: "started" } }), "SH-DELEGATION-IDENTITY-MISSING"],
    [nativeResult({ stop: { taskIdentity: "/root/other", state: "completed" } }), "SH-DELEGATION-LIFECYCLE-MISMATCH"],
    [nativeResult({ start: { taskIdentity: "/root/author", state: "started" }, stop: { taskIdentity: "/root/author", state: "completed" } }), "SH-DELEGATION-INDEPENDENCE"],
    [nativeResult({ verdicts: ["PASS", "FAIL"] }), "SH-DELEGATION-VERDICT-COUNT"],
  ];
  for (const [result, expected] of cases) {
    await assert.rejects(runtime({ result }).subject.run({ intent: intent(), task: "x" }), (error) => code(error) === expected);
  }

  const { subject } = runtime();
  await subject.run({ intent: intent(), task: "x" });
  await assert.rejects(subject.run({ intent: intent(), task: "x" }), (error) => code(error) === "SH-DELEGATION-NONCE-REPLAY");
});

test("writing requires exact ownership and compatible exposed permissions without read-only snapshots", async () => {
  const writeIntent = intent({
    assignment: {
      grantedAuthority: "write",
      allowedEffects: ["modify-repository"],
      ownedPaths: ["util/repository/session-hygiene/"],
    },
    review: null,
  });
  const { subject, observations } = runtime({ result: nativeResult({ permissions: { repositoryWrite: true }, verdicts: [] }) });
  const projection = await subject.run({ intent: writeIntent, task: "Implement bounded paths." });
  assert.equal(projection.verdict, null);
  assert.deepEqual(observations, []);

  await assert.rejects(
    runtime({ result: nativeResult({ verdicts: [] }) }).subject.run({
      intent: intent({ assignment: { grantedAuthority: "write", allowedEffects: ["modify-repository"], ownedPaths: [] }, review: null }),
      task: "x",
    }),
    (error) => code(error) === "SH-DELEGATION-ASSIGNMENT-INVALID",
  );
});

test("bootstrap binds non-circular predecessor/successor lineage and immutable candidate", async () => {
  const transition = { predecessorProfileDigest: digest("d"), successorProfileDigest: CODEX_MANAGED_DELEGATION_PROFILE_DIGEST };
  const projection = await runtime().subject.run({ intent: intent({ transition }), task: "Review successor profile." });
  assert.equal(projection.profileTransition.successorProfileDigest, CODEX_MANAGED_DELEGATION_PROFILE_DIGEST);

  for (const invalid of [
    { predecessorProfileDigest: CODEX_MANAGED_DELEGATION_PROFILE_DIGEST, successorProfileDigest: CODEX_MANAGED_DELEGATION_PROFILE_DIGEST },
    { predecessorProfileDigest: digest("d"), successorProfileDigest: digest("e") },
  ]) {
    await assert.rejects(
      runtime().subject.run({ intent: intent({ transition: invalid }), task: "x" }),
      (error) => code(error) === "SH-DELEGATION-TRANSITION-INVALID",
    );
  }
});

test("runtime does not mutate or freeze parent intent or direct provider result", async () => {
  const subjectIntent = intent({ transition: { predecessorProfileDigest: digest("d"), successorProfileDigest: CODEX_MANAGED_DELEGATION_PROFILE_DIGEST } });
  const result = nativeResult({ permissions: { repositoryWrite: false } });
  const beforeIntent = structuredClone(subjectIntent);
  const beforeResult = structuredClone(result);
  await runtime({ result }).subject.run({ intent: subjectIntent, task: "x" });
  assert.deepEqual(subjectIntent, beforeIntent);
  assert.deepEqual(result, beforeResult);
  assert.equal(Object.isFrozen(subjectIntent.transition), false);
  assert.equal(Object.isFrozen(result.permissions), false);
});

test("runtime contains no CLI launch, resume, path discovery, or mutation surface", () => {
  const source = readFileSync(new URL("./codex-managed-delegation.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /node:child_process|spawnSync|execFile|\bcodex\s|\bresume\b|readdir|glob|unlink|rmSync|writeFile|appendFile/);
});
