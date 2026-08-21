import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { sha256 as sourceSha256 } from "./projection.mjs";

import {
  CODEX_MANAGED_DELEGATION_PROFILE,
  CODEX_MANAGED_DELEGATION_PROFILE_DIGEST,
  DelegationFailure,
  assessCodexManagedDelegationPreflight,
  delegationAssignmentDigest,
  delegationEvidenceDigest,
  requiredCapabilities,
} from "./codex-managed-delegation.mjs";

const digest = (character) => `sha256:${character.repeat(64)}`;
const TASK = "Review the exact immutable candidate.";
const HANDOFF = "Exact durable bounded handoff.";
const NOW = Math.floor(Date.now() / 1_000);

function assignment(overrides = {}) {
  const value = {
    id: "review-154",
    grantedAuthority: "read-only",
    allowedEffects: ["read-repository", "review"],
    ownedPaths: [],
    context: { mode: "bounded", turnCount: 1, rationale: "Exact durable review handoff." },
    ...overrides,
  };
  return { ...value, digest: delegationAssignmentDigest({ assignment: value, task: TASK }) };
}

function intent(repositoryRoot, overrides = {}) {
  const value = {
    schemaVersion: "ai4x.codex-managed-delegation-intent/v2",
    profileId: CODEX_MANAGED_DELEGATION_PROFILE.id,
    profileDigest: CODEX_MANAGED_DELEGATION_PROFILE_DIGEST,
    issue: "#154",
    repositoryRoot,
    cwd: repositoryRoot,
    lifecycle: "before-delegation",
    timestampEpochSeconds: NOW,
    nonce: "nonce-154-review-0001",
    handoffDigest: delegationEvidenceDigest(HANDOFF),
    assignment: assignment(),
    resource: { minimumFreeBytes: 1 },
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
    assignment: overrides.assignment ?? value.assignment,
    resource: { ...value.resource, ...overrides.resource },
    review: overrides.review === null ? null : { ...value.review, ...overrides.review },
  };
}

function replay(overrides = {}) {
  return {
    schemaVersion: "ai4x.delegation-replay-evidence/v1",
    consumedNonceDigests: [],
    priorReviewerIdentities: [],
    durableEvidence: { kind: "github", locator: "https://github.com/normenmueller/ai4X/issues/154" },
    ...overrides,
  };
}

function preflight(repositoryRoot, overrides = {}) {
  const subjectIntent = overrides.intent ?? intent(repositoryRoot);
  return {
    intent: subjectIntent,
    task: TASK,
    handoff: HANDOFF,
    candidateDigestAfterHandoff: subjectIntent.review === null ? null : digest("c"),
    activeAssignments: [],
    activeAgentOwnedPaths: [],
    replayEvidence: replay(),
    ...overrides,
  };
}

async function withRepository(run) {
  const root = mkdtempSync(path.join(os.tmpdir(), "ai4x-delegation-"));
  mkdirSync(path.join(root, ".git"));
  const collaborationSource = "test collaboration authority\n";
  const resourceSource = "test resource authority\n";
  mkdirSync(path.join(root, ".ai4x/coordination"), { recursive: true });
  mkdirSync(path.join(root, ".ai4x/operations"), { recursive: true });
  mkdirSync(path.join(root, ".ai4x/generated/assurance"), { recursive: true });
  writeFileSync(path.join(root, ".ai4x/coordination/collaboration.dhall"), collaborationSource);
  writeFileSync(path.join(root, ".ai4x/operations/session-hygiene.dhall"), resourceSource);
  writeFileSync(path.join(root, ".ai4x/generated/assurance/session-hygiene-policy.json"), `${JSON.stringify({
    schemaVersion: "ai4x.session-hygiene-projection/v1",
    authorityStatus: "mechanically-derived-inert-projection",
    provenance: {
      generator: "util/repository/session-hygiene/publish-projection.mjs",
      sources: [
        { path: ".ai4x/coordination/collaboration.dhall", sha256: sourceSha256(collaborationSource) },
        { path: ".ai4x/operations/session-hygiene.dhall", sha256: sourceSha256(resourceSource) },
      ],
    },
    collaboration: {
      assignmentClassification: "assignment-effects-and-granted-authority",
      writeCapableAssignmentLimit: { maximum: 1, aboveOneApproval: null },
      zeroLimitBehavior: "block-delegated-write-capable-spawn-only",
      observeAllDelegatedAgents: true,
      collaborationTopologyCapped: false,
      contextInheritance: {
        defaultMode: "none", boundedPositiveRequiresRationale: true,
        fullHistoryRequiresExactPoDecision: true, fullHistoryApproval: null,
      },
    },
    resources: {
      minimumFreeBytes: 1, unexplainedFreeSpaceDecreaseBytes: 1,
      maximumObservationAgeSeconds: 300, abnormalSingleRolloutGrowthBytes: 1,
    },
  }, null, 2)}\n`);
  try {
    return await run(realpathSync(root));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function code(error) {
  assert.ok(error instanceof DelegationFailure);
  return error.code;
}

test("profile is closed, release-neutral, and separates host truth from repository assurance", () => {
  assert.equal(CODEX_MANAGED_DELEGATION_PROFILE.schemaVersion, "ai4x.delegation-profile/v1");
  assert.equal(CODEX_MANAGED_DELEGATION_PROFILE.id, "codex-managed-delegation/v1");
  assert.equal(CODEX_MANAGED_DELEGATION_PROFILE.providerIdentityIngress, "host-native-boundary-only");
  assert.equal(CODEX_MANAGED_DELEGATION_PROFILE.repositoryAssuranceAuthority, "none");
  assert.match(CODEX_MANAGED_DELEGATION_PROFILE_DIGEST, /^sha256:[0-9a-f]{64}$/u);
  assert.doesNotMatch(JSON.stringify(CODEX_MANAGED_DELEGATION_PROFILE), /0\.14[789]\.0|providerVersion/u);
  assert.deepEqual(requiredCapabilities({ authority: "read-only", independentReview: true, bootstrap: false }), [
    "managed-delegation/v1", "bounded-context/v1", "assignment-authority/v1",
    "project-binding/v1", "repository-free-space/v1", "review-independence/v1",
  ]);
});

test("F154-B-01: repository preflight cannot invoke or authenticate caller-shaped provider results", async () => {
  await withRepository(async (root) => {
    const result = assessCodexManagedDelegationPreflight(preflight(root));
    assert.equal(result.decision, "policy-satisfied");
    assert.equal(result.providerAdmission, "required-at-host-native-boundary");
    assert.equal(result.providerIdentity, null);
    assert.equal(result.verdict, null);
    assert.equal(result.authorityEffect, "none");
    assert.equal(result.detachedAuthority, "none");
    assert.deepEqual(result.requiredHostChecks, [
      "direct-provider-task-identity", "same-identity-at-stop",
      "author-and-prior-reviewer-exclusion", "candidate-and-nonmutation-recheck",
      "exactly-one-verdict", "durable-nonce-consumption",
    ]);
    assert.throws(
      () => assessCodexManagedDelegationPreflight({ ...preflight(root), providerResult: { taskIdentity: "invented" } }),
      (error) => code(error) === "SH-DELEGATION-EVIDENCE-INVALID",
    );
  });
  const source = readFileSync(new URL("./codex-managed-delegation.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /invokeNative|source:\s*["']direct-native-result|providerResult/u);
});

test("F154-B-02: real repository, task, handoff, candidate, and measured resource are composed", async () => {
  await withRepository(async (root) => {
    assert.equal(assessCodexManagedDelegationPreflight(preflight(root)).repositoryRoot, root);
    assert.throws(
      () => assessCodexManagedDelegationPreflight(preflight(path.join(root, "missing"))),
      (error) => code(error) === "SH-DELEGATION-PROJECT-BINDING",
    );
    assert.throws(
      () => assessCodexManagedDelegationPreflight(preflight(root, { task: "Different task." })),
      (error) => code(error) === "SH-DELEGATION-ASSIGNMENT-DIGEST",
    );
    assert.throws(
      () => assessCodexManagedDelegationPreflight(preflight(root, { handoff: "Different handoff." })),
      (error) => code(error) === "SH-DELEGATION-HANDOFF-DIGEST",
    );
    assert.throws(
      () => assessCodexManagedDelegationPreflight(preflight(root, { candidateDigestAfterHandoff: digest("d") })),
      (error) => code(error) === "SH-DELEGATION-CANDIDATE-DRIFT",
    );
    assert.throws(
      () => assessCodexManagedDelegationPreflight(preflight(root, { intent: intent(root, { resource: { minimumFreeBytes: Number.MAX_SAFE_INTEGER } }) })),
      (error) => code(error) === "SH-DELEGATION-RESOURCE-BINDING",
    );
  });
});

test("common admission rejects profile, project, context, handoff, and freshness drift", async () => {
  await withRepository(async (root) => {
    const cases = [
      [intent(root, { profileId: "unknown/v9" }), "SH-DELEGATION-INTENT-INVALID"],
      [intent(root, { profileDigest: digest("0") }), "SH-DELEGATION-INTENT-INVALID"],
      [intent(root, { cwd: path.join(root, "foreign") }), "SH-DELEGATION-PROJECT-BINDING"],
      [intent(root, { timestampEpochSeconds: NOW - 301 }), "SH-DELEGATION-INTENT-INVALID"],
      [intent(root, { nonce: "" }), "SH-DELEGATION-INTENT-INVALID"],
      [intent(root, { handoffDigest: "missing" }), "SH-DELEGATION-INTENT-INVALID"],
      [intent(root, { assignment: assignment({ context: { mode: "bounded", turnCount: 0, rationale: "" } }) }), "SH-DELEGATION-CONTEXT-INVALID"],
    ];
    for (const [subjectIntent, expected] of cases) {
      assert.throws(
        () => assessCodexManagedDelegationPreflight(preflight(root, { intent: subjectIntent })),
        (error) => code(error) === expected,
      );
    }
  });
});

test("F154-B-03: writing requires contained paths, exact limit, and no parent or writer overlap", async () => {
  await withRepository(async (root) => {
    const writeAssignment = assignment({
      grantedAuthority: "write", allowedEffects: ["modify-repository"],
      ownedPaths: ["util/repository/session-hygiene"],
    });
    const writeIntent = intent(root, { assignment: writeAssignment, review: null });
    assert.equal(assessCodexManagedDelegationPreflight(preflight(root, { intent: writeIntent })).decision, "policy-satisfied");

    for (const ownedPath of ["../../outside-authority", "/tmp/outside", ".", "util//bad"]) {
      const invalid = assignment({ grantedAuthority: "write", allowedEffects: ["modify-repository"], ownedPaths: [ownedPath] });
      assert.throws(
        () => assessCodexManagedDelegationPreflight(preflight(root, { intent: intent(root, { assignment: invalid, review: null }) })),
        (error) => code(error) === "SH-DELEGATION-OWNERSHIP-INVALID",
      );
    }
    assert.throws(
      () => assessCodexManagedDelegationPreflight(preflight(root, {
        intent: writeIntent, activeAgentOwnedPaths: ["util/repository/session-hygiene/evaluate.mjs"],
      })),
      (error) => code(error) === "SH-DELEGATION-OWNERSHIP-OVERLAP",
    );
    assert.throws(
      () => assessCodexManagedDelegationPreflight(preflight(root, {
        intent: writeIntent,
        activeAssignments: [{
          id: "other-writer", grantedAuthority: "write",
          allowedEffects: ["modify-repository"], ownedPaths: ["util/repository"],
        }],
      })),
      (error) => code(error) === "SH-DELEGATION-OWNERSHIP-OVERLAP",
    );
    assert.throws(
      () => assessCodexManagedDelegationPreflight(preflight(root, {
        intent: writeIntent,
        activeAssignments: [{
          id: "other-writer", grantedAuthority: "write",
          allowedEffects: ["modify-repository"], ownedPaths: ["src"],
        }],
      })),
      (error) => code(error) === "SH-DELEGATION-WRITER-LIMIT",
    );
  });
});

test("F154-B-04: durable replay and prior-reviewer evidence survive assurance instances", async () => {
  await withRepository(async (root) => {
    const first = assessCodexManagedDelegationPreflight(preflight(root));
    assert.throws(
      () => assessCodexManagedDelegationPreflight(preflight(root, {
        replayEvidence: replay({ consumedNonceDigests: [first.nonceDigest] }),
      })),
      (error) => code(error) === "SH-DELEGATION-NONCE-REPLAY",
    );
    const prior = assessCodexManagedDelegationPreflight(preflight(root, {
      replayEvidence: replay({ priorReviewerIdentities: ["/root/reviewer-previous"] }),
    }));
    assert.deepEqual(prior.excludedReviewerIdentities, ["/root/author", "/root/reviewer-previous"]);
    assert.throws(
      () => assessCodexManagedDelegationPreflight(preflight(root, {
        replayEvidence: replay({ durableEvidence: { kind: "file", locator: "/tmp/nonce.json" } }),
      })),
      (error) => code(error) === "SH-DELEGATION-REPLAY-EVIDENCE",
    );
  });
});

test("F154-B-05: bootstrap and review matrices reject lineage drift and remediation authority", async () => {
  await withRepository(async (root) => {
    const transition = {
      predecessorProfileDigest: digest("d"),
      successorProfileDigest: CODEX_MANAGED_DELEGATION_PROFILE_DIGEST,
    };
    assert.equal(assessCodexManagedDelegationPreflight(preflight(root, {
      intent: intent(root, { transition }),
    })).profileTransition.successorProfileDigest, CODEX_MANAGED_DELEGATION_PROFILE_DIGEST);
    for (const invalid of [
      { predecessorProfileDigest: CODEX_MANAGED_DELEGATION_PROFILE_DIGEST, successorProfileDigest: CODEX_MANAGED_DELEGATION_PROFILE_DIGEST },
      { predecessorProfileDigest: digest("d"), successorProfileDigest: digest("e") },
    ]) {
      assert.throws(
        () => assessCodexManagedDelegationPreflight(preflight(root, { intent: intent(root, { transition: invalid }) })),
        (error) => code(error) === "SH-DELEGATION-TRANSITION-INVALID",
      );
    }
    const remediation = assignment({
      grantedAuthority: "write", allowedEffects: ["modify-repository"],
      ownedPaths: ["util/repository/session-hygiene"],
    });
    assert.throws(
      () => assessCodexManagedDelegationPreflight(preflight(root, { intent: intent(root, { assignment: remediation }) })),
      (error) => code(error) === "SH-DELEGATION-INDEPENDENCE",
    );
  });
});

test("preflight does not mutate or freeze caller inputs and exposes no mutation surface", async () => {
  await withRepository(async (root) => {
    const subject = preflight(root);
    const before = structuredClone(subject);
    assessCodexManagedDelegationPreflight(subject);
    assert.deepEqual(subject, before);
    assert.equal(Object.isFrozen(subject.intent), false);
  });
  const source = readFileSync(new URL("./codex-managed-delegation.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /node:child_process|spawnSync|execFile|\bcodex\s|\bresume\b|readdir|glob|unlink|rmSync|writeFile|appendFile/u);
});
