import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import fixtures from "./planning-contract.fixtures.json" with { type: "json" };
import {
  canonicalJson,
  computePlanDigest,
  DIAGNOSTIC_REGISTRY,
  diagnosticExit,
  EVIDENCE_ONLY_MESSAGE,
  KINDS,
  rejectEvidenceConversion,
  STATUS_OPTIONS,
  validatePlanningObservation,
} from "./planning-contract.mjs";

const sensitive = ["SECRET_BODY_MARKER", "SECRET_PAUSE_REASON", "ghp_secret_token", "SECRET_PROVIDER_PAYLOAD"];
const statusOptions = new Map(STATUS_OPTIONS.map((option) => [option.name, option]));

function clone(value) {
  return structuredClone(value);
}

function epic() {
  return clone(fixtures.baseEpic);
}

function standalone() {
  return clone(fixtures.baseStandalone);
}

function bindPlan(input) {
  input.expected.planDigest = computePlanDigest(input.expected);
  return input;
}

function setStatus(input, name) {
  input.project.status = clone(statusOptions.get(name));
  input.expected.status = name;
  input.issue.state = name === "Done" ? "CLOSED" : "OPEN";
  return bindPlan(input);
}

function epicAt(name) {
  const input = setStatus(epic(), name);
  input.issue.body = fixtures.gateBodies[name];
  return input;
}

function pause(input, from, reason = "Observable suspension reason.", condition = "Issue #109 is Done.") {
  input.issue.body += `\n## Pause facts\n\n- Paused from: ${from}\n- Pause reason: ${reason}\n- Resume condition: ${condition}\n`;
  setStatus(input, "Paused");
  return input;
}

function diagnosticOf(input, code) {
  const result = validatePlanningObservation(input);
  assert.equal(result.ok, false, `${code} fixture unexpectedly passed`);
  const found = result.diagnostics.find((item) => item.code === code);
  assert.ok(found, `${code} absent from ${JSON.stringify(result.diagnostics)}`);
  return { result, found };
}

function assertPass(input, claim) {
  const result = validatePlanningObservation(input);
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.value.claim, claim);
  assert.equal(result.value.authorityEffect, "none");
  return result;
}

function hashProject(id) {
  return createHash("sha256").update(id).digest("hex");
}

const triggerCases = [
  {
    code: "INPUT_MALFORMED", owner: "operator-input", subject: "input", field: "$", observed: "type:null",
    trigger: () => null, near: () => epic(),
  },
  {
    code: "PLAN_DIGEST_MISMATCH", owner: "operator-input", subject: "input", field: "expected.planDigest", observed: /^pair:sha256:[0-9a-f]{64}\/sha256:[0-9a-f]{64}$/u,
    trigger: () => { const input = epic(); input.expected.planDigest = `sha256:${"0".repeat(64)}`; return input; }, near: () => epic(),
  },
  {
    code: "KIND_UNSUPPORTED", owner: "operator-input", subject: "input", field: "expected.kind", observed: /^digest:sha256:[0-9a-f]{64}\/bytes:\d+$/u,
    trigger: () => { const input = epic(); input.expected.kind = "SECRET_BODY_MARKER"; return bindPlan(input); }, near: () => epic(),
  },
  {
    code: "KIND_EXPECTATION_MISMATCH", owner: "operator-input", subject: "input", field: "kind", observed: "pair:standalone/epic",
    trigger: () => { const input = epic(); input.runtime.kind = "standalone"; return input; }, near: () => epic(),
  },
  {
    code: "EXPECTED_STATUS_REQUIRED", owner: "operator-input", subject: "input", field: "expected.status", observed: "presence:missing",
    trigger: () => { const input = standalone(); delete input.expected.status; return input; }, near: () => standalone(),
  },
  {
    code: "GATE_SECTION_COUNT", owner: "issue-content", subject: "issue:#102", field: "Epic gate facts", observed: "count:0",
    trigger: () => { const input = epic(); input.issue.body = "SECRET_BODY_MARKER"; return input; }, near: () => epic(),
  },
  {
    code: "GATE_FIELD_MISSING", owner: "issue-content", subject: "issue:#102", field: "Requirements refinement", observed: "count:0",
    trigger: () => { const input = epic(); input.issue.body = input.issue.body.replace("- Requirements refinement: not started\n", ""); return input; }, near: () => epic(),
  },
  {
    code: "GATE_FIELD_DUPLICATE", owner: "issue-content", subject: "issue:#102", field: "Requirements refinement", observed: "count:2",
    trigger: () => { const input = epic(); input.issue.body += "- Requirements refinement: not started\nSECRET_BODY_MARKER"; return input; }, near: () => epic(),
  },
  {
    code: "GATE_VALUE_UNSUPPORTED", owner: "issue-content", subject: "issue:#102", field: "Requirements refinement", observed: /^digest:sha256:[0-9a-f]{64}\/bytes:\d+$/u,
    trigger: () => { const input = epic(); input.issue.body = input.issue.body.replace("not started", "SECRET_BODY_MARKER"); return input; }, near: () => epic(),
  },
  {
    code: "GATE_DEPENDENCY_CONTRADICTION", owner: "issue-content", subject: "issue:#102", field: "gate tuple", observed: /^digest:sha256:[0-9a-f]{64}\/bytes:\d+$/u,
    trigger: () => { const input = epic(); input.issue.body = input.issue.body.replace("Story decomposition: not started", "Story decomposition: in progress"); return input; }, near: () => epic(),
  },
  {
    code: "PAUSE_SECTION_COUNT", owner: "issue-content", subject: "issue:#102", field: "Pause facts", observed: "count:0",
    trigger: () => setStatus(epicAt("Refinement"), "Paused"), near: () => pause(epicAt("Refinement"), "Refinement"),
  },
  {
    code: "PAUSE_FIELD_MISSING", owner: "issue-content", subject: "issue:#102", field: "Pause reason", observed: "count:0",
    trigger: () => { const input = pause(epicAt("Refinement"), "Refinement"); input.issue.body = input.issue.body.replace("- Pause reason: Observable suspension reason.\n", ""); return input; }, near: () => pause(epicAt("Refinement"), "Refinement"),
  },
  {
    code: "PAUSE_FIELD_DUPLICATE", owner: "issue-content", subject: "issue:#102", field: "Pause reason", observed: "count:2",
    trigger: () => { const input = pause(epicAt("Refinement"), "Refinement"); input.issue.body += "- Pause reason: SECRET_PAUSE_REASON\n"; return input; }, near: () => pause(epicAt("Refinement"), "Refinement"),
  },
  {
    code: "PAUSE_VALUE_UNSUPPORTED", owner: "issue-content", subject: "issue:#102", field: "Pause reason", observed: /^digest:sha256:[0-9a-f]{64}\/bytes:0$/u,
    trigger: () => pause(epicAt("Refinement"), "Refinement", ""), near: () => pause(epicAt("Refinement"), "Refinement", "x"),
  },
  {
    code: "PAUSE_STALE", owner: "issue-content", subject: "issue:#102", field: "Pause facts", observed: "count:1",
    trigger: () => { const input = epicAt("Refinement"); input.issue.body += "\n## Pause facts\nSECRET_PAUSE_REASON"; return input; }, near: () => epicAt("Refinement"),
  },
  {
    code: "STATUS_UNSUPPORTED", owner: "project-policy", subject: `project:${hashProject("P_project")}`, field: "status.option", observed: /^digest:sha256:[0-9a-f]{64}\/bytes:\d+$/u,
    trigger: () => { const input = epic(); input.project.status.description = "SECRET_BODY_MARKER"; return input; }, near: () => epic(),
  },
  {
    code: "KIND_APPLICABILITY_MISMATCH", owner: "project-policy", subject: "issue:#109", field: "status", observed: "pair:roadmap/Refinement",
    trigger: () => { const input = setStatus(standalone(), "Refinement"); input.runtime.kind = "roadmap"; input.expected.kind = "roadmap"; return bindPlan(input); }, near: () => { const input = standalone(); input.runtime.kind = "roadmap"; input.expected.kind = "roadmap"; return bindPlan(input); },
  },
  {
    code: "EXPECTED_STATUS_MISMATCH", owner: "project-policy", subject: "issue:#109", field: "status", observed: "pair:Backlog/Ready",
    trigger: () => { const input = standalone(); input.expected.status = "Ready"; return bindPlan(input); }, near: () => standalone(),
  },
  {
    code: "STATUS_FACT_CONTRADICTION", owner: "project-policy", subject: "issue:#102", field: "status/facts", observed: /^digest:sha256:[0-9a-f]{64}\/bytes:\d+$/u,
    trigger: () => setStatus(epic(), "In progress"), near: () => epicAt("In progress"),
  },
  {
    code: "ISSUE_STATE_CONTRADICTION", owner: "project-policy", subject: "issue:#102", field: "state/status", observed: "pair:CLOSED/Backlog",
    trigger: () => { const input = epic(); input.issue.state = "CLOSED"; return input; }, near: () => epic(),
  },
  {
    code: "NON_EPIC_AUTHORITY_CLAIM", owner: "operator-input", subject: "input", field: "requestedClaim", observed: "enum:epic-contract-consistency",
    trigger: () => { const input = standalone(); input.runtime.requestedClaim = "epic-contract-consistency"; return input; }, near: () => standalone(),
  },
  ...[
    ["REPOSITORY_ID_MISMATCH", "repositoryId", "project", "repositoryId", "WRONG"],
    ["PROJECT_ID_MISMATCH", "projectId", "project", "id", "WRONG"],
    ["ISSUE_ID_MISMATCH", "issueId", "issue", "id", "WRONG"],
    ["ITEM_ID_MISMATCH", "itemId", "project", "itemId", "WRONG"],
    ["STATUS_FIELD_ID_MISMATCH", "statusFieldId", "project", "statusFieldId", "WRONG"],
  ].map(([code, field, ownerKey, property, value]) => ({
    code, owner: "provider-observation", subject: "observation", field, observed: /^pair:sha256:[0-9a-f]{64}\/sha256:[0-9a-f]{64}$/u,
    trigger: () => { const input = epic(); input[ownerKey][property] = value; return input; }, near: () => epic(),
  })),
  {
    code: "PROJECT_ITEM_DUPLICATE", owner: "provider-observation", subject: "observation", field: "projectItem", observed: "count:2",
    trigger: () => { const input = epic(); input.window.provider.projectItemCount = 2; return input; }, near: () => epic(),
  },
  {
    code: "PAGINATION_INCOMPLETE", owner: "provider-observation", subject: "observation", field: "connection", observed: "component:project-items",
    trigger: () => { const input = epic(); input.window.paginationComplete = false; input.window.incompleteConnection = "project-items"; return input; }, near: () => epic(),
  },
  {
    code: "PROVIDER_INACCESSIBLE", owner: "provider-observation", subject: "observation", field: "provider", observed: "constant:redacted",
    trigger: () => { const input = epic(); input.window.provider.inaccessible = true; input.window.provider.raw = "SECRET_PROVIDER_PAYLOAD"; return input; }, near: () => epic(),
  },
  {
    code: "IDENTITY_AMBIGUOUS", owner: "provider-observation", subject: "observation", field: "identity", observed: "count:0",
    trigger: () => { const input = epic(); input.window.provider.identityCandidates = 0; return input; }, near: () => epic(),
  },
  {
    code: "OBSERVATION_LIMIT", owner: "provider-observation", subject: "observation", field: "limit", observed: "limit:items:101/100",
    trigger: () => { const input = epic(); input.window.limit = { component: "items", seen: 101, max: 100 }; return input; }, near: () => epic(),
  },
  {
    code: "OBSERVATION_DRIFT", owner: "provider-observation", subject: "observation", field: "fingerprint", observed: "component:observation",
    trigger: () => { const input = epic(); input.window.endFingerprint = "moved"; return input; }, near: () => epic(),
  },
];

test("the diagnostic registry is the exact closed 32-code architecture registry", () => {
  assert.equal(Object.keys(DIAGNOSTIC_REGISTRY).length, 32);
  assert.deepEqual(Object.keys(DIAGNOSTIC_REGISTRY).sort(), triggerCases.map(({ code }) => code).sort());
});

for (const fixture of triggerCases) {
  test(`${fixture.code} has one exact trigger, adversarial near-miss, exit, and redaction`, () => {
    const { result, found } = diagnosticOf(fixture.trigger(), fixture.code);
    assert.equal(found.owner, fixture.owner);
    assert.equal(found.subject, fixture.subject);
    assert.equal(found.field, fixture.field);
    if (fixture.observed instanceof RegExp) assert.match(found.observed, fixture.observed);
    else assert.equal(found.observed, fixture.observed);
    assert.equal(diagnosticExit(result), DIAGNOSTIC_REGISTRY[fixture.code]);
    const nearResult = validatePlanningObservation(fixture.near());
    assert.equal(nearResult.ok || !nearResult.diagnostics.some(({ code }) => code === fixture.code), true);
    const serialized = canonicalJson(result);
    for (const secret of sensitive) assert.equal(serialized.includes(secret), false, `${fixture.code} leaked ${secret}`);
  });
}

test("canonical Plan digest shape, preimage binding, and approval-reference neutrality are exact", () => {
  const valid = epic();
  assert.equal(valid.expected.planDigest, computePlanDigest(valid.expected));
  assertPass(valid, "epic-contract-consistency");

  for (const invalidDigest of ["opaque-arbitrary-string", `SHA256:${"0".repeat(64)}`, `sha256:${"A".repeat(64)}`, `sha256:${"0".repeat(63)}`]) {
    const malformed = epic();
    malformed.expected.planDigest = invalidDigest;
    const { found } = diagnosticOf(malformed, "INPUT_MALFORMED");
    assert.equal(found.field, "expected.planDigest");
  }
  const badRelations = epic();
  badRelations.expected.relationIds = "not-an-array";
  assert.equal(diagnosticOf(badRelations, "INPUT_MALFORMED").found.field, "expected.relationIds");
  const additional = epic();
  additional.expected.unbound = "SECRET_BODY_MARKER";
  assert.equal(diagnosticOf(additional, "INPUT_MALFORMED").found.field, "expected.unbound");
  const missingApproval = epic();
  delete missingApproval.expected.approvalEvidenceRef;
  assert.equal(diagnosticOf(missingApproval, "INPUT_MALFORMED").found.field, "expected.approvalEvidenceRef");
  const emptyApproval = epic();
  emptyApproval.expected.approvalEvidenceRef = "";
  assert.equal(diagnosticOf(emptyApproval, "INPUT_MALFORMED").found.field, "expected.approvalEvidenceRef");

  const mutations = {
    kind(input) { input.expected.kind = "story"; input.runtime.kind = "story"; },
    repositoryId(input) { input.expected.repositoryId = "R_changed"; },
    projectId(input) { input.expected.projectId = "P_changed"; },
    issueId(input) { input.expected.issueId = "I_changed"; },
    itemId(input) { input.expected.itemId = "PVTI_changed"; },
    statusFieldId(input) { input.expected.statusFieldId = "PVTF_changed"; },
    status(input) { input.expected.status = "Ready"; },
    relationIds(input) { input.expected.relationIds.push("REL_changed"); },
  };
  for (const [field, mutate] of Object.entries(mutations)) {
    const input = epic();
    const declared = input.expected.planDigest;
    mutate(input);
    const { found } = diagnosticOf(input, "PLAN_DIGEST_MISMATCH");
    assert.equal(found.field, "expected.planDigest", field);
    assert.match(found.observed, /^pair:sha256:[0-9a-f]{64}\/sha256:[0-9a-f]{64}$/u);
    assert.equal(input.expected.planDigest, declared);
  }

  const approvalOnly = epic();
  const digestBefore = approvalOnly.expected.planDigest;
  approvalOnly.expected.approvalEvidenceRef = "unverified-reference";
  assert.equal(computePlanDigest(approvalOnly.expected), digestBefore);
  const approvalResult = assertPass(approvalOnly, "epic-contract-consistency");
  assert.equal(approvalResult.value.authorityEffect, "none");

  const orderedRelations = epic();
  orderedRelations.expected.relationIds = ["REL_a", "REL_b"];
  const forward = computePlanDigest(orderedRelations.expected);
  orderedRelations.expected.relationIds.reverse();
  assert.notEqual(computePlanDigest(orderedRelations.expected), forward);
});

test("Plan digest and kind mismatch aggregate independently before dispatch", () => {
  const input = epic();
  input.expected.kind = "story";
  const result = validatePlanningObservation(input);
  assert.equal(result.ok, false);
  assert.deepEqual(result.diagnostics.map(({ code }) => code), ["KIND_EXPECTATION_MISMATCH", "PLAN_DIGEST_MISMATCH"]);
  assert.equal("value" in result, false);
});

test("Epic lifecycle accepts every state and every permitted pause origin", () => {
  for (const status of ["Backlog", "Refinement", "Ready", "In progress", "In review", "Done"]) assertPass(epicAt(status), "epic-contract-consistency");
  for (const from of ["Refinement", "Ready", "In progress", "In review"]) assertPass(pause(epicAt(from), from, "SECRET_PAUSE_REASON", "Issue #109 is Done."), "epic-contract-consistency");
});

test("every canonical gate and pause field fails with its own stable field identity", () => {
  const gateFields = ["Requirements refinement", "Story decomposition", "Planning Conformance", "Ready decision", "Implementation authority"];
  for (const field of gateFields) {
    const missing = epic();
    const line = missing.issue.body.split("\n").find((value) => value.startsWith(`- ${field}:`));
    missing.issue.body = missing.issue.body.replace(`${line}\n`, "");
    assert.equal(diagnosticOf(missing, "GATE_FIELD_MISSING").found.field, field);

    const duplicate = epic();
    duplicate.issue.body += `${line}\n`;
    assert.equal(diagnosticOf(duplicate, "GATE_FIELD_DUPLICATE").found.field, field);

    const unsupported = epic();
    unsupported.issue.body = unsupported.issue.body.replace(line, `- ${field}: SECRET_BODY_MARKER`);
    assert.equal(diagnosticOf(unsupported, "GATE_VALUE_UNSUPPORTED").found.field, field);
  }

  for (const field of ["Paused from", "Pause reason", "Resume condition"]) {
    const valid = pause(epicAt("Refinement"), "Refinement");
    const line = valid.issue.body.split("\n").find((value) => value.startsWith(`- ${field}:`));
    const missing = clone(valid);
    missing.issue.body = missing.issue.body.replace(`${line}\n`, "");
    assert.equal(diagnosticOf(missing, "PAUSE_FIELD_MISSING").found.field, field);

    const duplicate = clone(valid);
    duplicate.issue.body += `${line}\n`;
    assert.equal(diagnosticOf(duplicate, "PAUSE_FIELD_DUPLICATE").found.field, field);

    const unsupported = clone(valid);
    unsupported.issue.body = unsupported.issue.body.replace(line, `- ${field}: ${field === "Paused from" ? "SECRET_BODY_MARKER" : ""}`);
    assert.equal(diagnosticOf(unsupported, "PAUSE_VALUE_UNSUPPORTED").found.field, field);
  }

  const duplicateGateSection = epic();
  duplicateGateSection.issue.body += duplicateGateSection.issue.body;
  assert.equal(diagnosticOf(duplicateGateSection, "GATE_SECTION_COUNT").found.observed, "count:2");
  const duplicatePauseSection = pause(epicAt("Refinement"), "Refinement");
  duplicatePauseSection.issue.body += "\n## Pause facts\n- Paused from: Refinement\n- Pause reason: x\n- Resume condition: y\n";
  assert.equal(diagnosticOf(duplicatePauseSection, "PAUSE_SECTION_COUNT").found.observed, "count:2");
});

test("planning activity and every unsatisfied Ready prerequisite reject Ready or delivery In progress", () => {
  const planningAsDelivery = setStatus(epic(), "In progress");
  planningAsDelivery.issue.body = planningAsDelivery.issue.body.replace("Requirements refinement: not started", "Requirements refinement: in progress");
  diagnosticOf(planningAsDelivery, "STATUS_FACT_CONTRADICTION");

  const prerequisiteMutations = [
    ["Requirements refinement: approved", "Requirements refinement: not started"],
    ["Story decomposition: approved", "Story decomposition: not started"],
    ["Planning Conformance: passed", "Planning Conformance: not run"],
    ["Ready decision: granted", "Ready decision: not granted"],
    ["Implementation authority: yes", "Implementation authority: no"],
  ];
  for (const status of ["Ready", "In progress"]) {
    for (const [from, to] of prerequisiteMutations) {
      const input = epicAt(status);
      input.issue.body = input.issue.body.replace(from, to);
      const result = validatePlanningObservation(input);
      assert.equal(result.ok, false);
      assert.equal(result.diagnostics.some(({ code }) => ["GATE_DEPENDENCY_CONTRADICTION", "STATUS_FACT_CONTRADICTION"].includes(code)), true);
      assert.equal("value" in result, false);
    }
  }
});

test("all non-Epic kinds accept only their applicable exact Plan-bound states", () => {
  const states = {
    roadmap: ["Backlog", "In progress", "In review", "Done"],
    story: ["Backlog", "Refinement", "Ready", "In progress", "In review", "Done"],
    standalone: ["Backlog", "Refinement", "Ready", "In progress", "In review", "Done"],
  };
  for (const [kind, allowed] of Object.entries(states)) {
    for (const status of allowed) {
      const input = setStatus(standalone(), status);
      input.runtime.kind = kind;
      input.expected.kind = kind;
      bindPlan(input);
      assertPass(input, "plan-status-only");
    }
  }
  for (const kind of ["story", "standalone"]) {
    const input = pause(setStatus(standalone(), "In progress"), "In progress");
    input.runtime.kind = kind;
    input.expected.kind = kind;
    bindPlan(input);
    assertPass(input, "plan-status-only");
  }
  const roadmapPaused = pause(setStatus(standalone(), "In review"), "In review");
  roadmapPaused.runtime.kind = "roadmap";
  roadmapPaused.expected.kind = "roadmap";
  bindPlan(roadmapPaused);
  assertPass(roadmapPaused, "plan-status-only");

  const invalidRoadmapOrigin = pause(setStatus(standalone(), "In review"), "Refinement");
  invalidRoadmapOrigin.runtime.kind = "roadmap";
  invalidRoadmapOrigin.expected.kind = "roadmap";
  bindPlan(invalidRoadmapOrigin);
  diagnosticOf(invalidRoadmapOrigin, "KIND_APPLICABILITY_MISMATCH");
  const unknownOrigin = pause(setStatus(standalone(), "In progress"), "SECRET_BODY_MARKER");
  diagnosticOf(unknownOrigin, "PAUSE_VALUE_UNSUPPORTED");
});

test("all 12 unequal runtime/expected kind substitutions fail before dispatch", () => {
  for (const expectedKind of KINDS) {
    for (const runtimeKind of KINDS) {
      if (runtimeKind === expectedKind) continue;
      const input = expectedKind === "epic" ? epic() : standalone();
      input.expected.kind = expectedKind;
      input.runtime.kind = runtimeKind;
      bindPlan(input);
      const result = validatePlanningObservation(input);
      assert.deepEqual(result.diagnostics.map(({ code }) => code), ["KIND_EXPECTATION_MISMATCH"]);
      assert.equal("value" in result, false);
    }
  }
});

test("every non-Epic kind rejects an Epic claim before any authority inference", () => {
  for (const kind of ["roadmap", "story", "standalone"]) {
    const input = standalone();
    input.runtime.kind = kind;
    input.expected.kind = kind;
    bindPlan(input);
    input.runtime.requestedClaim = "epic-contract-consistency";
    diagnosticOf(input, "NON_EPIC_AUTHORITY_CLAIM");
  }
});

test("#102 normalization is valid only before the Paused transition and with the exact activation pause facts", () => {
  const normalized = epicAt("Refinement");
  assertPass(normalized, "epic-contract-consistency");
  const paused = pause(normalized, "Refinement", "Lifecycle/governance sequencing suspends #102.", "Issues #109, #128, #121, #131, and #122 are all Done.");
  assertPass(paused, "epic-contract-consistency");
  const unnormalized = pause(epic(), "Refinement");
  diagnosticOf(unnormalized, "STATUS_FACT_CONTRADICTION");
});

test("resume returns first to the recorded state and removes stale Pause facts", () => {
  const resumed = epicAt("Refinement");
  assertPass(resumed, "epic-contract-consistency");
  const stale = clone(resumed);
  stale.issue.body += "\n## Pause facts\n- Paused from: Refinement\n- Pause reason: x\n- Resume condition: y\n";
  diagnosticOf(stale, "PAUSE_STALE");
});

test("success cannot be converted into any authority or mutation for any terminal-looking status", () => {
  const effects = ["Ready", "implementation", "acceptance", "Done", "priority", "transition", "publication", "mutation"];
  for (const status of ["Ready", "In progress", "In review", "Done"]) {
    const success = assertPass(epicAt(status), "epic-contract-consistency");
    for (const effect of effects) {
      const rejected = rejectEvidenceConversion(success, effect);
      assert.equal(rejected.ok, false);
      assert.equal(rejected.authorityEffect, "none");
      assert.deepEqual(rejected.commands, []);
      assert.deepEqual(rejected.calls, []);
      assert.equal(rejected.reason, EVIDENCE_ONLY_MESSAGE);
    }
  }
});

test("first-failing-stage aggregation, deduplication, sorting, and exit precedence are deterministic", () => {
  const input = epic();
  input.project.repositoryId = "wrong";
  input.project.id = "wrong";
  input.window.endFingerprint = "moved";
  input.issue.body = "SECRET_BODY_MARKER";
  const first = validatePlanningObservation(input);
  const second = validatePlanningObservation(clone(input));
  assert.equal(canonicalJson(first), canonicalJson(second));
  assert.deepEqual(first.diagnostics.map(({ code }) => code), ["OBSERVATION_DRIFT", "PROJECT_ID_MISMATCH", "REPOSITORY_ID_MISMATCH"]);
  assert.equal(first.diagnostics.some(({ code }) => code === "GATE_SECTION_COUNT"), false);
  assert.equal(diagnosticExit(first), 2);
});

test("the canonical policy preserves exact activation order and recovery Receipt closure", () => {
  const policy = readFileSync(new URL("../../adm/gdl/planning-workflow.md", import.meta.url), "utf8");
  let last = -1;
  for (let index = 0; index <= 7; index += 1) {
    const position = policy.indexOf(`\`A${index}\``, last + 1);
    assert.ok(position > last, `A${index} missing or out of order`);
    last = position;
  }
  for (const state of ["completed", "rolled back", "preserved", "failed", "pending"]) assert.match(policy, new RegExp(`\\b${state}\\b`, "u"));
  assert.match(policy, /Reverse only an exact still-observed\s+mutation, in reverse dependency order/u);
  assert.match(policy, /separately PO-approved,\s+digest-bound forward-Recovery Plan/u);
});
