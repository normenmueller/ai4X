import assert from "node:assert/strict";
import test from "node:test";
import { evaluateSessionHygiene } from "./evaluate.mjs";

function policy(overrides = {}) {
  return {
    schemaVersion: "ai4x.session-hygiene-projection/v1",
    authorityStatus: "mechanically-derived-inert-projection",
    provenance: { generator: "util/repository/session-hygiene/publish-projection.mjs", sources: [] },
    collaboration: {
      assignmentClassification: "assignment-effects-and-granted-authority",
      writeCapableAssignmentLimit: { maximum: 1, aboveOneApproval: null },
      zeroLimitBehavior: "block-delegated-write-capable-spawn-only",
      observeAllDelegatedAgents: true,
      collaborationTopologyCapped: false,
      contextInheritance: {
        defaultMode: "none",
        boundedPositiveRequiresRationale: true,
        fullHistoryRequiresExactPoDecision: true,
      },
      ...overrides.collaboration,
    },
    resources: {
      minimumFreeBytes: 32_212_254_720,
      unexplainedFreeSpaceDecreaseBytes: 1_073_741_824,
      maximumObservationAgeSeconds: 300,
      abnormalSingleRolloutGrowthBytes: 268_435_456,
      ...overrides.resources,
    },
  };
}

function input(overrides = {}) {
  const value = {
    schemaVersion: "ai4x.session-hygiene-evaluation/v1",
    repositoryRoot: "/work/ai4X",
    issue: "#121",
    lifecycle: "before-delegation",
    nowEpochSeconds: 1_000,
    observation: {
      observedAtEpochSeconds: 900,
      repositoryRoot: "/work/ai4X",
      freeBytes: 40_000_000_000,
      parentRolloutBytes: 10_000,
      childRollout: { state: "not-created" },
      binding: {
        provider: "codex",
        providerVersion: "0.147.0",
        sessionIdPresent: true,
        parentPathValidated: true,
        cwdMatchesProject: true,
      },
    },
    previousObservation: null,
    delegation: {
      active: false,
      activeAssignments: [],
      requestedAssignment: {
        id: "writer-1",
        roleName: "requirements-specialist",
        allowedEffects: ["modify-repository"],
        grantedAuthority: "write",
        ownedPaths: ["util/repository/session-hygiene/"],
      },
      activeAgentOwnedPaths: [],
      contextInheritance: { mode: "none" },
    },
    explanations: { freeSpaceDecrease: null, parentGrowth: null, childGrowth: null },
    essentialEvidence: [],
  };
  const merged = {
    ...value,
    ...overrides,
    delegation: { ...value.delegation, ...overrides.delegation },
    explanations: { ...value.explanations, ...overrides.explanations },
  };
  merged.observation = overrides.observation === null
    ? null
    : { ...value.observation, ...overrides.observation };
  return merged;
}

function codes(result) {
  return result.diagnostics.map(({ code }) => code);
}

function durable(locator = "https://github.com/normenmueller/ai4X/issues/121") {
  return { kind: "github", locator };
}

test("allows a fresh, bound observation and one write-capable delegated Assignment", () => {
  const result = evaluateSessionHygiene(policy(), input());
  assert.equal(result.decision, "allow");
  assert.deepEqual(result.diagnostics, []);
});

test("classifies by effects and authority rather than role name", () => {
  const specialist = (id, roleName) => ({
    id,
    roleName,
    allowedEffects: ["read-repository", "review"],
    grantedAuthority: "read-only",
    ownedPaths: [],
  });
  const result = evaluateSessionHygiene(policy(), input({
    delegation: {
      active: true,
      requestedAssignment: specialist("review-3", "implementation-agent"),
      activeAssignments: [
        specialist("review-1", "writer"),
        specialist("review-2", "requirements-specialist"),
      ],
    },
  }));
  assert.equal(result.decision, "allow");
});

test("fails closed for absent, ambiguous, or contradictory Assignment effects", () => {
  for (const requestedAssignment of [
    { id: "missing", roleName: "reviewer", grantedAuthority: "read-only", ownedPaths: [] },
    { id: "unknown", roleName: "reviewer", allowedEffects: ["mystery"], grantedAuthority: "read-only", ownedPaths: [] },
    { id: "contradictory", roleName: "reviewer", allowedEffects: ["modify-repository"], grantedAuthority: "read-only", ownedPaths: [] },
  ]) {
    const result = evaluateSessionHygiene(policy(), input({ delegation: { requestedAssignment } }));
    assert.equal(result.decision, "block");
    assert.ok(codes(result).includes("SH-ASSIGNMENT-EFFECTS-AMBIGUOUS"));
  }
});

test("enforces the active plus requested write-capable Assignment maximum", () => {
  const activeWriter = input().delegation.requestedAssignment;
  const result = evaluateSessionHygiene(policy(), input({
    delegation: { active: true, activeAssignments: [activeWriter] },
  }));
  assert.ok(codes(result).includes("SH-WRITE-ASSIGNMENT-LIMIT"));
});

test("a zero limit permits direct implementation but blocks delegated write-capable spawn", () => {
  const zeroPolicy = policy({ collaboration: { writeCapableAssignmentLimit: { maximum: 0, aboveOneApproval: null } } });
  const direct = evaluateSessionHygiene(zeroPolicy, input({ delegation: { requestedAssignment: null } }));
  const delegated = evaluateSessionHygiene(zeroPolicy, input());
  assert.equal(direct.decision, "allow");
  assert.ok(codes(delegated).includes("SH-WRITE-ASSIGNMENT-LIMIT"));
});

test("a maximum above one requires an exact matching PO decision", () => {
  const invalid = policy({ collaboration: {
    writeCapableAssignmentLimit: {
      maximum: 2,
      aboveOneApproval: { decisionReference: "M121-X", approvedMaximum: 3 },
    },
  } });
  assert.ok(codes(evaluateSessionHygiene(invalid, input())).includes("SH-DELEGATION-LIMIT-APPROVAL"));

  const valid = policy({ collaboration: {
    writeCapableAssignmentLimit: {
      maximum: 2,
      aboveOneApproval: { decisionReference: "M121-EXACT", approvedMaximum: 2 },
    },
  } });
  assert.equal(evaluateSessionHygiene(valid, input()).decision, "allow");
});

test("blocks ownership overlap between the active agent and a delegated writer", () => {
  const result = evaluateSessionHygiene(policy(), input({
    delegation: { activeAgentOwnedPaths: ["util/repository/session-hygiene/evaluate.mjs"] },
  }));
  assert.ok(codes(result).includes("SH-PRIMARY-OWNERSHIP-OVERLAP"));
});

test("requires rationale for bounded inheritance and exact PO authority for full history", () => {
  const bounded = evaluateSessionHygiene(policy(), input({
    delegation: { contextInheritance: { mode: "bounded", turnCount: 3, rationale: "" } },
  }));
  assert.ok(codes(bounded).includes("SH-CONTEXT-BOUNDED-RATIONALE"));

  const full = evaluateSessionHygiene(policy(), input({
    delegation: { contextInheritance: { mode: "all", poDecisionReference: "" } },
  }));
  assert.ok(codes(full).includes("SH-CONTEXT-FULL-HISTORY"));
});

test("blocks missing, stale, malformed, and foreign observations with distinct diagnostics", () => {
  const missing = evaluateSessionHygiene(policy(), input({ observation: null }));
  assert.ok(codes(missing).includes("SH-OBSERVATION-MISSING"));

  const stale = evaluateSessionHygiene(policy(), input({ observation: { observedAtEpochSeconds: 699 } }));
  assert.ok(codes(stale).includes("SH-OBSERVATION-STALE"));

  const malformed = evaluateSessionHygiene(policy(), input({ observation: { freeBytes: -1 } }));
  assert.ok(codes(malformed).includes("SH-OBSERVATION-MALFORMED"));

  const foreign = evaluateSessionHygiene(policy(), input({ observation: { repositoryRoot: "/work/foreign" } }));
  assert.ok(codes(foreign).includes("SH-OBSERVATION-FOREIGN-REPOSITORY"));
});

test("blocks low free space and unexplained threshold-equal decrease", () => {
  const low = evaluateSessionHygiene(policy(), input({ observation: { freeBytes: 32_212_254_719 } }));
  assert.ok(codes(low).includes("SH-FREE-SPACE-LOW"));

  const decrease = evaluateSessionHygiene(policy(), input({
    previousObservation: { repositoryRoot: "/work/ai4X", freeBytes: 41_073_741_824, parentRolloutBytes: 10_000 },
    observation: { freeBytes: 40_000_000_000 },
  }));
  assert.ok(codes(decrease).includes("SH-FREE-SPACE-DECREASE"));

  const explained = evaluateSessionHygiene(policy(), input({
    previousObservation: { repositoryRoot: "/work/ai4X", freeBytes: 41_073_741_824, parentRolloutBytes: 10_000 },
    observation: { freeBytes: 40_000_000_000 },
    explanations: { freeSpaceDecrease: durable() },
  }));
  assert.equal(explained.decision, "allow");
});

test("blocks unexplained parent and completed-child threshold-equal growth", () => {
  const parent = evaluateSessionHygiene(policy(), input({
    previousObservation: { repositoryRoot: "/work/ai4X", freeBytes: 40_000_000_000, parentRolloutBytes: 10_000 },
    observation: { parentRolloutBytes: 268_445_456 },
  }));
  assert.ok(codes(parent).includes("SH-PARENT-ROLLOUT-GROWTH"));

  const child = evaluateSessionHygiene(policy(), input({
    lifecycle: "subagent-stop",
    delegation: { requestedAssignment: null },
    observation: { childRollout: { state: "measured", bytes: 268_435_456 } },
  }));
  assert.ok(codes(child).includes("SH-CHILD-ROLLOUT-GROWTH"));
});

test("accepts pending child path during activity and requires it at SubagentStop", () => {
  const activeSpecialist = {
    id: "review-active",
    roleName: "implementation-agent",
    allowedEffects: ["read-repository", "review"],
    grantedAuthority: "read-only",
    ownedPaths: [],
  };
  const active = evaluateSessionHygiene(policy(), input({
    lifecycle: "active-interval",
    delegation: { active: true, activeAssignments: [activeSpecialist], requestedAssignment: null },
    observation: { childRollout: { state: "pending-provider-path" } },
  }));
  assert.equal(active.decision, "allow");

  const stopped = evaluateSessionHygiene(policy(), input({
    lifecycle: "subagent-stop",
    delegation: { requestedAssignment: null },
    observation: { childRollout: { state: "pending-provider-path" } },
  }));
  assert.ok(codes(stopped).includes("SH-CHILD-PATH-MISSING"));
});

test("requires durable evidence at completion and handoff boundaries", () => {
  for (const essentialEvidence of [
    [],
    [{ kind: "file", locator: "/tmp/result.json" }],
    [{ kind: "file", locator: ".ai4x/local/session-scratch/121/result.md" }],
  ]) {
    const result = evaluateSessionHygiene(policy(), input({
      lifecycle: "handoff-boundary",
      observation: { childRollout: { state: "not-applicable" } },
      delegation: { requestedAssignment: null },
      essentialEvidence,
    }));
    assert.ok(codes(result).includes("SH-EVIDENCE-NOT-DURABLE"));
  }
  const result = evaluateSessionHygiene(policy(), input({
    lifecycle: "after-issue-completion",
    observation: { childRollout: { state: "not-applicable" } },
    delegation: { requestedAssignment: null },
    essentialEvidence: [durable()],
  }));
  assert.equal(result.decision, "allow");
});

test("does not mutate policy or evaluation input", () => {
  const subjectPolicy = policy();
  const subjectInput = input();
  const beforePolicy = structuredClone(subjectPolicy);
  const beforeInput = structuredClone(subjectInput);
  evaluateSessionHygiene(subjectPolicy, subjectInput);
  assert.deepEqual(subjectPolicy, beforePolicy);
  assert.deepEqual(subjectInput, beforeInput);
});
