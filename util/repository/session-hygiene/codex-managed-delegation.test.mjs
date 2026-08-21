import assert from "node:assert/strict";
import {
  mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { sha256 as sourceSha256 } from "./projection.mjs";

import {
  CODEX_MANAGED_DELEGATION_INTENT_SCHEMA,
  CODEX_MANAGED_DELEGATION_PROFILE,
  CODEX_MANAGED_DELEGATION_PROFILE_DIGEST,
  DelegationFailure,
  assessCodexManagedDelegationPreflight,
  delegationAssignmentDigest,
  delegationEvidenceDigest,
  observeCodexManagedRepositoryBinding,
  requiredCapabilities,
} from "./codex-managed-delegation.mjs";

const REPOSITORY_ROOT = realpathSync(path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
));
const REPOSITORY_BINDING = observeCodexManagedRepositoryBinding();
const POLICY = JSON.parse(readFileSync(
  path.join(REPOSITORY_ROOT, ".ai4x/generated/assurance/session-hygiene-policy.json"),
  "utf8",
));
const TASK = "Review the exact immutable candidate.";
const HANDOFF = "Exact durable bounded handoff.";
const NOW = Math.floor(Date.now() / 1_000);
const digest = (character) => `sha256:${character.repeat(64)}`;

function assignment(overrides = {}, task = TASK) {
  const value = {
    id: "review-154",
    grantedAuthority: "read-only",
    allowedEffects: ["read-repository", "review"],
    ownedPaths: [],
    context: { mode: "bounded", turnCount: 1, rationale: "Exact durable review handoff." },
    ...overrides,
  };
  return { ...value, digest: delegationAssignmentDigest({ assignment: value, task }) };
}

function intent(overrides = {}) {
  const value = {
    schemaVersion: CODEX_MANAGED_DELEGATION_INTENT_SCHEMA,
    profileId: CODEX_MANAGED_DELEGATION_PROFILE.id,
    profileDigest: CODEX_MANAGED_DELEGATION_PROFILE_DIGEST,
    issue: "#154",
    repositoryRoot: REPOSITORY_ROOT,
    cwd: REPOSITORY_ROOT,
    lifecycle: "before-delegation",
    timestampEpochSeconds: NOW,
    nonce: "nonce-154-review-0002",
    handoffDigest: delegationEvidenceDigest(HANDOFF),
    assignment: assignment(),
    resource: { minimumFreeBytes: POLICY.resources.minimumFreeBytes },
    review: {
      independent: true,
      candidate: {
        headOid: REPOSITORY_BINDING.headOid,
      },
      maximumVerdicts: 1,
    },
    transition: null,
  };
  return {
    ...value,
    ...overrides,
    assignment: overrides.assignment ?? value.assignment,
    resource: { ...value.resource, ...overrides.resource },
    review: overrides.review === null ? null : {
      ...value.review,
      ...overrides.review,
      candidate: { ...value.review.candidate, ...overrides.review?.candidate },
    },
  };
}

function preflight(overrides = {}) {
  return {
    intent: overrides.intent ?? intent(),
    task: overrides.task ?? TASK,
    handoff: overrides.handoff ?? HANDOFF,
    ...overrides,
  };
}

function code(error) {
  assert.ok(error instanceof DelegationFailure);
  return error.code;
}

async function withForeignSelfIssuedRepository(run) {
  const root = mkdtempSync(path.join(os.tmpdir(), "ai4x-delegation-foreign-"));
  mkdirSync(path.join(root, ".git"));
  const collaborationSource = "foreign self-issued collaboration authority\n";
  const resourceSource = "foreign self-issued resource authority\n";
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

test("profile is closed, release-neutral, and leaves admission at the direct host boundary", () => {
  assert.equal(CODEX_MANAGED_DELEGATION_PROFILE.schemaVersion, "ai4x.delegation-profile/v1");
  assert.equal(CODEX_MANAGED_DELEGATION_PROFILE.id, "codex-managed-delegation/v1");
  assert.equal(CODEX_MANAGED_DELEGATION_PROFILE.providerIdentityIngress, "host-native-boundary-only");
  assert.equal(CODEX_MANAGED_DELEGATION_PROFILE.repositoryObservation, "module-root-and-git-head");
  assert.equal(CODEX_MANAGED_DELEGATION_PROFILE.repositoryAssuranceAuthority, "none");
  assert.equal(CODEX_MANAGED_DELEGATION_PROFILE.hostAdmissionAuthority, "direct-provider-parent-only");
  assert.match(CODEX_MANAGED_DELEGATION_PROFILE_DIGEST, /^sha256:[0-9a-f]{64}$/u);
  assert.doesNotMatch(JSON.stringify(CODEX_MANAGED_DELEGATION_PROFILE), /0\.14[789]\.0|providerVersion/u);
  assert.deepEqual(requiredCapabilities({ authority: "read-only", independentReview: true, bootstrap: false }), [
    "managed-delegation/v1", "bounded-context/v1", "assignment-authority/v1",
    "project-binding/v1", "repository-free-space/v1", "review-independence/v1",
  ]);
});

test("F154-B-01 stays closed: repository code cannot ingest provider results or authorize delegation", () => {
  const result = assessCodexManagedDelegationPreflight(preflight());
  assert.equal(result.decision, "local-observations-complete");
  assert.equal(result.delegationAuthorized, false);
  assert.equal(result.hostAdmission, "blocked-until-direct-provider-boundary");
  assert.equal(result.providerIdentity, null);
  assert.equal(result.verdict, null);
  assert.equal(result.authorityEffect, "none");
  assert.equal(result.detachedAuthority, "none");
  assert.throws(
    () => assessCodexManagedDelegationPreflight({ ...preflight(), providerResult: { taskIdentity: "invented" } }),
    (error) => code(error) === "SH-DELEGATION-EVIDENCE-INVALID",
  );
  const source = readFileSync(new URL("./codex-managed-delegation.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /invokeNative|source:\s*["']direct-native-result|providerResult/u);
});

test("F154-B-02: project and candidate bind to the executing module repository and actual git HEAD", async () => {
  const result = assessCodexManagedDelegationPreflight(preflight());
  assert.deepEqual(result.repositoryBinding, REPOSITORY_BINDING);
  assert.equal(result.repositoryBinding.repositoryRoot, REPOSITORY_ROOT);

  await withForeignSelfIssuedRepository(async (foreignRoot) => {
    assert.throws(
      () => assessCodexManagedDelegationPreflight(preflight({
        intent: intent({ repositoryRoot: foreignRoot, cwd: foreignRoot }),
      })),
      (error) => code(error) === "SH-DELEGATION-PROJECT-BINDING",
    );
  });
  assert.throws(
    () => assessCodexManagedDelegationPreflight(preflight({
      intent: intent({ review: { candidate: { headOid: "0".repeat(40) } } }),
    })),
    (error) => code(error) === "SH-DELEGATION-CANDIDATE-DRIFT",
  );
  assert.throws(
    () => assessCodexManagedDelegationPreflight(preflight({ task: "Different task." })),
    (error) => code(error) === "SH-DELEGATION-ASSIGNMENT-DIGEST",
  );
  assert.throws(
    () => assessCodexManagedDelegationPreflight(preflight({ handoff: "Different handoff." })),
    (error) => code(error) === "SH-DELEGATION-HANDOFF-DIGEST",
  );

  const handoffWithTransportLf = `${HANDOFF}\n`;
  const newlineIntent = intent({ handoffDigest: delegationEvidenceDigest(handoffWithTransportLf) });
  assert.equal(
    assessCodexManagedDelegationPreflight(preflight({
      intent: newlineIntent,
      handoff: handoffWithTransportLf,
    })).handoffDigest,
    newlineIntent.handoffDigest,
  );
});

test("common local observations reject profile, project, context, resource, and freshness drift", () => {
  const cases = [
    [intent({ schemaVersion: "ai4x.codex-managed-delegation-intent/v2" }), "SH-DELEGATION-INTENT-INVALID"],
    [intent({ profileId: "unknown/v9" }), "SH-DELEGATION-INTENT-INVALID"],
    [intent({ profileDigest: digest("0") }), "SH-DELEGATION-INTENT-INVALID"],
    [intent({ cwd: path.join(REPOSITORY_ROOT, "util") }), "SH-DELEGATION-PROJECT-BINDING"],
    [intent({ timestampEpochSeconds: NOW - 301 }), "SH-DELEGATION-INTENT-INVALID"],
    [intent({ nonce: "" }), "SH-DELEGATION-INTENT-INVALID"],
    [intent({ handoffDigest: "missing" }), "SH-DELEGATION-INTENT-INVALID"],
    [intent({ resource: { minimumFreeBytes: Number.MAX_SAFE_INTEGER } }), "SH-DELEGATION-RESOURCE-BINDING"],
    [intent({ assignment: assignment({ context: { mode: "bounded", turnCount: 0, rationale: "" } }) }), "SH-DELEGATION-CONTEXT-INVALID"],
  ];
  for (const [subjectIntent, expected] of cases) {
    assert.throws(
      () => assessCodexManagedDelegationPreflight(preflight({ intent: subjectIntent })),
      (error) => code(error) === expected,
    );
  }
});

test("F154-B-03: requested ownership is repository-contained and symlink-safe; topology remains a host check", () => {
  const writeAssignment = assignment({
    grantedAuthority: "write", allowedEffects: ["modify-repository"],
    ownedPaths: ["util/repository/session-hygiene"],
  });
  const writeResult = assessCodexManagedDelegationPreflight(preflight({
    intent: intent({ assignment: writeAssignment, review: null }),
  }));
  assert.equal(writeResult.delegationAuthorized, false);
  assert.ok(writeResult.requiredHostChecks.includes("complete-active-assignment-topology"));
  assert.ok(writeResult.requiredHostChecks.includes("requested-ownership-containment-recheck-at-start"));
  assert.ok(writeResult.requiredHostChecks.includes("accepted-writer-limit-against-complete-topology"));
  assert.ok(writeResult.requiredHostChecks.includes("all-writer-and-parent-ownership-nonoverlap"));

  for (const ownedPath of ["../../outside-authority", "/tmp/outside", ".", "util//bad"]) {
    const invalid = assignment({
      grantedAuthority: "write", allowedEffects: ["modify-repository"], ownedPaths: [ownedPath],
    });
    assert.throws(
      () => assessCodexManagedDelegationPreflight(preflight({
        intent: intent({ assignment: invalid, review: null }),
      })),
      (error) => code(error) === "SH-DELEGATION-OWNERSHIP-INVALID",
    );
  }

  const localBase = path.join(REPOSITORY_ROOT, ".ai4x/local");
  mkdirSync(localBase, { recursive: true });
  const ownedFixture = mkdtempSync(path.join(localBase, "ownership-test-"));
  const outside = mkdtempSync(path.join(os.tmpdir(), "ai4x-owned-outside-"));
  const escape = path.join(ownedFixture, "escape");
  symlinkSync(outside, escape);
  try {
    const symlinked = assignment({
      grantedAuthority: "write",
      allowedEffects: ["modify-repository"],
      ownedPaths: [path.relative(REPOSITORY_ROOT, escape)],
    });
    assert.throws(
      () => assessCodexManagedDelegationPreflight(preflight({
        intent: intent({ assignment: symlinked, review: null }),
      })),
      (error) => code(error) === "SH-DELEGATION-OWNERSHIP-INVALID",
    );
  } finally {
    rmSync(ownedFixture, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
});

test("F154-B-04: repository code refuses caller-shaped replay/topology assurance and leaves durable checks unresolved", () => {
  for (const extra of [
    { replayEvidence: { durableEvidence: { kind: "github", locator: "https://example.invalid/invented" } } },
    { activeAssignments: [], activeAgentOwnedPaths: [] },
  ]) {
    assert.throws(
      () => assessCodexManagedDelegationPreflight({ ...preflight(), ...extra }),
      (error) => code(error) === "SH-DELEGATION-EVIDENCE-INVALID",
    );
  }
  const first = assessCodexManagedDelegationPreflight(preflight());
  const second = assessCodexManagedDelegationPreflight(preflight());
  assert.equal(first.delegationAuthorized, false);
  assert.equal(second.delegationAuthorized, false);
  assert.ok(first.requiredHostChecks.includes("authenticated-durable-replay-state"));
  assert.ok(first.requiredHostChecks.includes("author-and-prior-reviewer-exclusion"));
  assert.ok(first.requiredHostChecks.includes("durable-nonce-consumption"));
  assert.equal(Object.hasOwn(first, "excludedReviewerIdentities"), false);
  assert.equal(Object.hasOwn(first, "durableEvidence"), false);
});

test("F154-B-05: bootstrap matrix keeps every unverified host fact blocking and rejects reviewer remediation", () => {
  const transition = {
    predecessorProfileDigest: digest("d"),
    successorProfileDigest: CODEX_MANAGED_DELEGATION_PROFILE_DIGEST,
  };
  const result = assessCodexManagedDelegationPreflight(preflight({
    intent: intent({ transition }),
  }));
  assert.equal(result.profileTransition.successorProfileDigest, CODEX_MANAGED_DELEGATION_PROFILE_DIGEST);
  assert.equal(result.delegationAuthorized, false);
  for (const required of [
    "direct-provider-task-identity",
    "same-identity-at-stop",
    "complete-active-assignment-topology",
    "authenticated-durable-replay-state",
    "author-and-prior-reviewer-exclusion",
    "exact-provider-candidate-tree-and-nonmutation-recheck",
    "read-only-repository-and-remote-nonmutation",
    "exactly-one-verdict",
    "durable-nonce-consumption",
  ]) assert.ok(result.requiredHostChecks.includes(required));

  for (const invalid of [
    { predecessorProfileDigest: CODEX_MANAGED_DELEGATION_PROFILE_DIGEST, successorProfileDigest: CODEX_MANAGED_DELEGATION_PROFILE_DIGEST },
    { predecessorProfileDigest: digest("d"), successorProfileDigest: digest("e") },
  ]) {
    assert.throws(
      () => assessCodexManagedDelegationPreflight(preflight({ intent: intent({ transition: invalid }) })),
      (error) => code(error) === "SH-DELEGATION-TRANSITION-INVALID",
    );
  }
  const remediation = assignment({
    grantedAuthority: "write", allowedEffects: ["modify-repository"],
    ownedPaths: ["util/repository/session-hygiene"],
  });
  assert.throws(
    () => assessCodexManagedDelegationPreflight(preflight({
      intent: intent({ assignment: remediation }),
    })),
    (error) => code(error) === "SH-DELEGATION-INDEPENDENCE",
  );

  const source = readFileSync(new URL("./codex-managed-delegation.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /decision:\s*["']policy-satisfied|replayEvidence|activeAssignments|activeAgentOwnedPaths|durableEvidence/u);
});

test("local observation is non-mutating and exposes no write, process, provider, or discovery surface", () => {
  const subject = preflight();
  const before = structuredClone(subject);
  assessCodexManagedDelegationPreflight(subject);
  assert.deepEqual(subject, before);
  assert.equal(Object.isFrozen(subject.intent), false);
  const source = readFileSync(new URL("./codex-managed-delegation.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /node:child_process|spawnSync|execFile|\bcodex\s|\bresume\b|readdir|glob|unlink|rmSync|writeFile|appendFile/u);
});
