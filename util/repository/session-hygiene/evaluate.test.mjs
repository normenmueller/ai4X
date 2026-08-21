import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { evaluateRestartBoundary, evaluateSessionHygiene } from "./evaluate.mjs";
import { sha256 } from "./projection.mjs";

const COLLABORATION_SOURCE = "test collaboration authority\n";
const RESOURCE_SOURCE = "test resource authority\n";

function policy(overrides = {}) {
  return {
    schemaVersion: "ai4x.session-hygiene-projection/v1",
    authorityStatus: "mechanically-derived-inert-projection",
    provenance: {
      generator: "util/repository/session-hygiene/publish-projection.mjs",
      sources: [
        { path: ".ai4x/coordination/collaboration.dhall", sha256: sha256(COLLABORATION_SOURCE) },
        { path: ".ai4x/operations/session-hygiene.dhall", sha256: sha256(RESOURCE_SOURCE) },
      ],
    },
    collaboration: {
      assignmentClassification: "assignment-effects-and-granted-authority",
      writeCapableAssignmentLimit: { maximum: 1, aboveOneApproval: null },
      zeroLimitBehavior: "block-delegated-write-capable-spawn-only",
      observeAllDelegatedAgents: true,
      collaborationTopologyCapped: false,
      ...overrides.collaboration,
      contextInheritance: {
        defaultMode: "none",
        boundedPositiveRequiresRationale: true,
        fullHistoryRequiresExactPoDecision: true,
        fullHistoryApproval: null,
        ...overrides.collaboration?.contextInheritance,
      },
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
      schemaVersion: "ai4x.codex-session-observation/v1",
      lifecycle: "before-delegation",
      issue: "#121",
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
    : {
        ...value.observation,
        lifecycle: overrides.observation?.lifecycle ?? merged.lifecycle,
        issue: overrides.observation?.issue ?? merged.issue,
        ...overrides.observation,
      };
  return merged;
}

function codes(result) {
  return result.diagnostics.map(({ code }) => code);
}

function durable(locator = "https://github.com/normenmueller/ai4X/issues/121") {
  return { kind: "github", locator };
}

function evaluate(subjectPolicy, subjectInput, { staleSource = false } = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), "ai4x-session-evaluate-"));
  const projectionPath = path.join(root, ".ai4x/generated/assurance/session-hygiene-policy.json");
  try {
    mkdirSync(path.join(root, ".ai4x/coordination"), { recursive: true });
    mkdirSync(path.join(root, ".ai4x/operations"), { recursive: true });
    mkdirSync(path.dirname(projectionPath), { recursive: true });
    writeFileSync(path.join(root, ".ai4x/coordination/collaboration.dhall"), staleSource ? "drifted\n" : COLLABORATION_SOURCE);
    writeFileSync(path.join(root, ".ai4x/operations/session-hygiene.dhall"), RESOURCE_SOURCE);
    writeFileSync(projectionPath, `${JSON.stringify(subjectPolicy, null, 2)}\n`);
    return evaluateSessionHygiene({ repositoryRoot: root, projectionPath, input: subjectInput });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("allows a fresh, bound observation and one write-capable delegated Assignment", () => {
  const result = evaluate(policy(), input());
  assert.equal(result.decision, "allow");
  assert.deepEqual(result.diagnostics, []);
});

test("accepts exactly the closed Codex version set through evaluation", () => {
  const binding = (providerVersion) => ({
    provider: "codex",
    providerVersion,
    sessionIdPresent: true,
    parentPathValidated: true,
    cwdMatchesProject: true,
  });
  for (const providerVersion of ["0.147.0", "0.148.0"]) {
    assert.equal(evaluate(policy(), input({ observation: { binding: binding(providerVersion) } })).decision, "allow");
  }
  for (const providerVersion of ["0.146.0", "0.147.1", "0.149.0"]) {
    const result = evaluate(policy(), input({ observation: { binding: binding(providerVersion) } }));
    assert.ok(codes(result).includes("SH-OBSERVATION-BINDING-INVALID"));
  }
});

test("ordinary evaluation rejects incomplete, manipulated, and stale projection provenance", () => {
  const incomplete = policy();
  incomplete.provenance.sources = [];
  assert.deepEqual(codes(evaluate(incomplete, input())), ["SH-PROJECTION-INVALID"]);

  const manipulated = policy();
  manipulated.provenance.generator = "foreign-generator";
  assert.deepEqual(codes(evaluate(manipulated, input())), ["SH-PROJECTION-INVALID"]);

  assert.deepEqual(codes(evaluate(policy(), input(), { staleSource: true })), ["SH-PROJECTION-STALE"]);
});

test("classifies by effects and authority rather than role name", () => {
  const specialist = (id, roleName) => ({
    id,
    roleName,
    allowedEffects: ["read-repository", "review"],
    grantedAuthority: "read-only",
    ownedPaths: [],
  });
  const result = evaluate(policy(), input({
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
    const result = evaluate(policy(), input({ delegation: { requestedAssignment } }));
    assert.equal(result.decision, "block");
    assert.ok(codes(result).includes("SH-ASSIGNMENT-EFFECTS-AMBIGUOUS"));
  }
});

test("enforces the active plus requested write-capable Assignment maximum", () => {
  const activeWriter = input().delegation.requestedAssignment;
  const result = evaluate(policy(), input({
    delegation: { active: true, activeAssignments: [activeWriter] },
  }));
  assert.ok(codes(result).includes("SH-WRITE-ASSIGNMENT-LIMIT"));
});

test("a zero limit permits direct implementation but blocks delegated write-capable spawn", () => {
  const zeroPolicy = policy({ collaboration: { writeCapableAssignmentLimit: { maximum: 0, aboveOneApproval: null } } });
  const direct = evaluate(zeroPolicy, input({ delegation: { requestedAssignment: null } }));
  const delegated = evaluate(zeroPolicy, input());
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
  assert.ok(codes(evaluate(invalid, input())).includes("SH-DELEGATION-LIMIT-APPROVAL"));

  const valid = policy({ collaboration: {
    writeCapableAssignmentLimit: {
      maximum: 2,
      aboveOneApproval: { decisionReference: "M121-EXACT", approvedMaximum: 2 },
    },
  } });
  assert.equal(evaluate(valid, input()).decision, "allow");
});

test("blocks ownership overlap between the active agent and a delegated writer", () => {
  const result = evaluate(policy(), input({
    delegation: { activeAgentOwnedPaths: ["util/repository/session-hygiene/evaluate.mjs"] },
  }));
  assert.ok(codes(result).includes("SH-PRIMARY-OWNERSHIP-OVERLAP"));
});

test("requires rationale for bounded inheritance and exact PO authority for full history", () => {
  const bounded = evaluate(policy(), input({
    delegation: { contextInheritance: { mode: "bounded", turnCount: 3, rationale: "" } },
  }));
  assert.ok(codes(bounded).includes("SH-CONTEXT-BOUNDED-RATIONALE"));

  const full = evaluate(policy(), input({
    delegation: { contextInheritance: { mode: "all", poDecisionReference: "" } },
  }));
  assert.ok(codes(full).includes("SH-CONTEXT-FULL-HISTORY"));
});

test("full-history inheritance requires an exact authority-bound decision tuple", () => {
  const approval = {
    decisionReference: "M121-FULL-01",
    issue: "#121",
    task: "bounded-review-reproduction",
    rationale: "The exact failure cannot be represented safely by a bounded handoff.",
  };
  const approvedPolicy = policy({ collaboration: { contextInheritance: { fullHistoryApproval: approval } } });
  const exactContext = {
    mode: "all",
    poDecisionReference: approval.decisionReference,
    approvedIssue: approval.issue,
    task: approval.task,
    rationale: approval.rationale,
  };
  assert.equal(evaluate(approvedPolicy, input({ delegation: { contextInheritance: exactContext } })).decision, "allow");

  const fabricated = evaluate(policy(), input({ delegation: { contextInheritance: {
    ...exactContext,
    poDecisionReference: "FAKE-DECISION",
  } } }));
  assert.ok(codes(fabricated).includes("SH-CONTEXT-FULL-HISTORY"));

  for (const [field, value] of [
    ["poDecisionReference", "M121-OTHER"],
    ["approvedIssue", "#999"],
    ["task", "other-task"],
    ["rationale", "other rationale"],
  ]) {
    const result = evaluate(approvedPolicy, input({
      delegation: { contextInheritance: { ...exactContext, [field]: value } },
    }));
    assert.ok(codes(result).includes("SH-CONTEXT-FULL-HISTORY"));
  }
});

test("blocks missing, stale, malformed, and foreign observations with distinct diagnostics", () => {
  const missing = evaluate(policy(), input({ observation: null }));
  assert.ok(codes(missing).includes("SH-OBSERVATION-MISSING"));

  const stale = evaluate(policy(), input({ observation: { observedAtEpochSeconds: 699 } }));
  assert.ok(codes(stale).includes("SH-OBSERVATION-STALE"));

  const malformed = evaluate(policy(), input({ observation: { freeBytes: -1 } }));
  assert.ok(codes(malformed).includes("SH-OBSERVATION-MALFORMED"));

  const foreign = evaluate(policy(), input({ observation: { repositoryRoot: "/work/foreign" } }));
  assert.ok(codes(foreign).includes("SH-OBSERVATION-FOREIGN-REPOSITORY"));
});

test("binds every observation to the exact schema, Issue, and lifecycle", () => {
  for (const schemaVersion of [undefined, "foreign.schema/v9"]) {
    const result = evaluate(policy(), input({ observation: { schemaVersion } }));
    assert.ok(codes(result).includes("SH-OBSERVATION-SCHEMA-INVALID"));
  }
  for (const issue of [undefined, "#999"]) {
    const result = evaluate(policy(), input({ observation: { issue } }));
    assert.ok(codes(result).includes("SH-OBSERVATION-ISSUE-MISMATCH"));
  }
  for (const lifecycle of [undefined, "active-interval", "subagent-stop", "after-issue-completion", "handoff-boundary"]) {
    const result = evaluate(policy(), input({ observation: { lifecycle } }));
    assert.ok(codes(result).includes("SH-OBSERVATION-LIFECYCLE-MISMATCH"));
  }
});

test("blocks low free space and unexplained threshold-equal decrease", () => {
  const low = evaluate(policy(), input({ observation: { freeBytes: 32_212_254_719 } }));
  assert.ok(codes(low).includes("SH-FREE-SPACE-LOW"));

  const decrease = evaluate(policy(), input({
    previousObservation: { repositoryRoot: "/work/ai4X", freeBytes: 41_073_741_824, parentRolloutBytes: 10_000 },
    observation: { freeBytes: 40_000_000_000 },
  }));
  assert.ok(codes(decrease).includes("SH-FREE-SPACE-DECREASE"));

  const explained = evaluate(policy(), input({
    previousObservation: { repositoryRoot: "/work/ai4X", freeBytes: 41_073_741_824, parentRolloutBytes: 10_000 },
    observation: { freeBytes: 40_000_000_000 },
    explanations: { freeSpaceDecrease: durable() },
  }));
  assert.equal(explained.decision, "allow");
});

test("blocks unexplained parent and completed-child threshold-equal growth", () => {
  const parent = evaluate(policy(), input({
    previousObservation: { repositoryRoot: "/work/ai4X", freeBytes: 40_000_000_000, parentRolloutBytes: 10_000 },
    observation: { parentRolloutBytes: 268_445_456 },
  }));
  assert.ok(codes(parent).includes("SH-PARENT-ROLLOUT-GROWTH"));

  const child = evaluate(policy(), input({
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
  const active = evaluate(policy(), input({
    lifecycle: "active-interval",
    delegation: { active: true, activeAssignments: [activeSpecialist], requestedAssignment: null },
    observation: { childRollout: { state: "pending-provider-path" } },
  }));
  assert.equal(active.decision, "allow");

  const stopped = evaluate(policy(), input({
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
    const result = evaluate(policy(), input({
      lifecycle: "handoff-boundary",
      observation: { childRollout: { state: "not-applicable" } },
      delegation: { requestedAssignment: null },
      essentialEvidence,
    }));
    assert.ok(codes(result).includes("SH-EVIDENCE-NOT-DURABLE"));
  }
  const result = evaluate(policy(), input({
    lifecycle: "after-issue-completion",
    observation: { childRollout: { state: "not-applicable" } },
    delegation: { requestedAssignment: null },
    essentialEvidence: [durable()],
  }));
  assert.equal(result.decision, "allow");
});

test("restart trigger matrix is closed across effective, inert, mixed, and unmerged changes", () => {
  const effective = [
    "constitution-safety",
    "agents-roles",
    "delegation-collaboration",
    "governance-lifecycle-authority-routing-work-management",
    "host-bootstrap-configuration",
    "tracked-ai-host-facade",
    "capability-context-selection",
  ];
  const inert = ["inert-documentation", "test-evidence-output", "generated-projection", "local-scratch"];
  const boundary = (overrides = {}) => ({
    schemaVersion: "ai4x.session-hygiene-restart-evaluation/v1",
    merged: true,
    safeBoundary: true,
    compactDurableHandoffVerified: true,
    startMode: "fresh-without-resume",
    changeClasses: ["agents-roles"],
    ...overrides,
  });

  for (const kind of effective) {
    const result = evaluateRestartBoundary(boundary({ changeClasses: [kind] }));
    assert.equal(result.restartRequired, true, kind);
    assert.equal(result.decision, "allow", kind);
  }
  for (const kind of inert) {
    const result = evaluateRestartBoundary(boundary({ changeClasses: [kind], startMode: "not-started" }));
    assert.equal(result.restartRequired, false, kind);
    assert.equal(result.decision, "allow", kind);
  }

  assert.equal(evaluateRestartBoundary(boundary({
    changeClasses: ["generated-projection", "delegation-collaboration"],
  })).restartRequired, true);
  assert.equal(evaluateRestartBoundary(boundary({ merged: false })).restartRequired, false);
  assert.deepEqual(codes(evaluateRestartBoundary(boundary({ changeClasses: ["unknown"] }))), ["SH-RESTART-INPUT-INVALID"]);
  assert.deepEqual(codes(evaluateRestartBoundary(boundary({ extra: true }))), ["SH-RESTART-INPUT-INVALID"]);
});

test("required restart blocks until the safe boundary, durable handoff, and without-resume start are exact", () => {
  const boundary = {
    schemaVersion: "ai4x.session-hygiene-restart-evaluation/v1",
    merged: true,
    safeBoundary: false,
    compactDurableHandoffVerified: false,
    startMode: "resume",
    changeClasses: ["governance-lifecycle-authority-routing-work-management"],
  };
  const result = evaluateRestartBoundary(boundary);
  assert.equal(result.restartRequired, true);
  assert.equal(result.decision, "block");
  assert.deepEqual(codes(result), [
    "SH-RESTART-SAFE-BOUNDARY",
    "SH-RESTART-HANDOFF",
    "SH-RESTART-WITHOUT-RESUME",
  ]);
});

test("does not mutate policy or evaluation input", () => {
  const subjectPolicy = policy();
  const subjectInput = input();
  const beforePolicy = structuredClone(subjectPolicy);
  const beforeInput = structuredClone(subjectInput);
  evaluate(subjectPolicy, subjectInput);
  assert.deepEqual(subjectPolicy, beforePolicy);
  assert.deepEqual(subjectInput, beforeInput);
});
