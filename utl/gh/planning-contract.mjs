import { createHash } from "node:crypto";

export const EVIDENCE_ONLY_MESSAGE = "evidence only: applicable identity/schema/closed-value/recorded-fact consistency; grants or proves no Ready, implementation, acceptance, Done, priority, transition, publication, or mutation authority.";

export const KINDS = Object.freeze(["roadmap", "epic", "story", "standalone"]);
export const STATUS_OPTIONS = Object.freeze([
  Object.freeze({ name: "Backlog", color: "GRAY", description: "Captured for consideration; material preparation has not started." }),
  Object.freeze({ name: "Refinement", color: "BLUE", description: "Active contract preparation; neither implementation nor authorization." }),
  Object.freeze({ name: "Ready", color: "PURPLE", description: "Explicitly authorized by the Product Owner and queued for execution." }),
  Object.freeze({ name: "In progress", color: "YELLOW", description: "Activated from Ready and actively implemented." }),
  Object.freeze({ name: "Paused", color: "ORANGE", description: "Intentionally suspended with a recorded return condition." }),
  Object.freeze({ name: "In review", color: "PINK", description: "Implementation complete and awaiting the required gate." }),
  Object.freeze({ name: "Done", color: "GREEN", description: "Accepted, remotely available when required, and closed." }),
]);

export const DIAGNOSTIC_REGISTRY = Object.freeze({
  INPUT_MALFORMED: 2,
  PLAN_DIGEST_MISMATCH: 2,
  KIND_UNSUPPORTED: 2,
  KIND_EXPECTATION_MISMATCH: 2,
  EXPECTED_STATUS_REQUIRED: 2,
  GATE_SECTION_COUNT: 1,
  GATE_FIELD_MISSING: 1,
  GATE_FIELD_DUPLICATE: 1,
  GATE_VALUE_UNSUPPORTED: 1,
  GATE_DEPENDENCY_CONTRADICTION: 1,
  PAUSE_SECTION_COUNT: 1,
  PAUSE_FIELD_MISSING: 1,
  PAUSE_FIELD_DUPLICATE: 1,
  PAUSE_VALUE_UNSUPPORTED: 1,
  PAUSE_STALE: 1,
  STATUS_UNSUPPORTED: 1,
  KIND_APPLICABILITY_MISMATCH: 1,
  EXPECTED_STATUS_MISMATCH: 1,
  STATUS_FACT_CONTRADICTION: 1,
  ISSUE_STATE_CONTRADICTION: 1,
  NON_EPIC_AUTHORITY_CLAIM: 1,
  REPOSITORY_ID_MISMATCH: 2,
  PROJECT_ID_MISMATCH: 2,
  ISSUE_ID_MISMATCH: 2,
  ITEM_ID_MISMATCH: 2,
  STATUS_FIELD_ID_MISMATCH: 2,
  PROJECT_ITEM_DUPLICATE: 2,
  PAGINATION_INCOMPLETE: 2,
  PROVIDER_INACCESSIBLE: 2,
  IDENTITY_AMBIGUOUS: 2,
  OBSERVATION_LIMIT: 2,
  OBSERVATION_DRIFT: 2,
});

const owners = Object.freeze({
  input: "operator-input",
  issue: "issue-content",
  policy: "project-policy",
  provider: "provider-observation",
});
const requirementsValues = new Set(["not started", "in progress", "approved"]);
const conformanceValues = new Set(["not run", "failed", "passed"]);
const readyValues = new Set(["not granted", "granted"]);
const implementationValues = new Set(["no", "yes"]);
const pauseOrigins = new Set(["Refinement", "Ready", "In progress", "In review"]);
const optionByName = new Map(STATUS_OPTIONS.map((option) => [option.name, option]));
const applicable = Object.freeze({
  roadmap: new Set(["Backlog", "In progress", "Paused", "In review", "Done"]),
  epic: new Set(STATUS_OPTIONS.map(({ name }) => name)),
  story: new Set(STATUS_OPTIONS.map(({ name }) => name)),
  standalone: new Set(STATUS_OPTIONS.map(({ name }) => name)),
});
const planEntryFields = Object.freeze(["kind", "repositoryId", "projectId", "issueId", "itemId", "statusFieldId", "status", "relationIds"]);
const expectedFields = new Set([...planEntryFields, "planDigest", "approvalEvidenceRef"]);

function jsonType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function digest(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const bytes = Buffer.byteLength(text ?? "", "utf8");
  const hash = createHash("sha256").update(text ?? "").digest("hex");
  return `digest:sha256:${hash}/bytes:${bytes}`;
}

function pair(left, right, allowed = new Set()) {
  const safe = (value) => allowed.has(value) ? value : `sha256:${digest(value).slice(14, 78)}`;
  return `pair:${safe(left)}/${safe(right)}`;
}

function issueSubject(input) {
  const number = input?.issue?.number;
  return Number.isSafeInteger(number) && number > 0 ? `issue:#${number}` : "issue:#0";
}

function projectSubject(input) {
  const id = input?.project?.id;
  return `project:${createHash("sha256").update(typeof id === "string" ? id : "").digest("hex")}`;
}

function diagnostic(code, owner, subject, field, observed) {
  if (!(code in DIAGNOSTIC_REGISTRY)) throw new Error(`unregistered diagnostic: ${code}`);
  return Object.freeze({ code, owner, subject, field, observed });
}

function resultFor(diagnostics) {
  const unique = new Map();
  for (const item of diagnostics) {
    unique.set(JSON.stringify([item.code, item.owner, item.subject, item.field, item.observed]), item);
  }
  const sorted = [...unique.values()].sort((left, right) =>
    Buffer.compare(Buffer.from(`${left.code}\0${left.subject}\0${left.field}`), Buffer.from(`${right.code}\0${right.subject}\0${right.field}`)),
  );
  return Object.freeze({ ok: false, diagnostics: Object.freeze(sorted) });
}

export function diagnosticExit(result) {
  if (result.ok) return 0;
  return result.diagnostics.some(({ code }) => DIAGNOSTIC_REGISTRY[code] === 2) ? 2 : 1;
}

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function fingerprintObservation(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

export function computePlanDigest(expected) {
  const preimage = Object.fromEntries(planEntryFields.map((field) => [field, expected[field]]));
  return `sha256:${createHash("sha256").update(canonicalJson(preimage), "utf8").digest("hex")}`;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function stageOne(input) {
  const diagnostics = [];
  if (!isRecord(input)) {
    return [diagnostic("INPUT_MALFORMED", owners.input, "input", "$", `type:${jsonType(input)}`)];
  }
  for (const key of ["runtime", "expected", "issue", "project", "window"]) {
    if (!isRecord(input[key])) diagnostics.push(diagnostic("INPUT_MALFORMED", owners.input, "input", key, `type:${jsonType(input[key])}`));
  }
  if (diagnostics.length) return diagnostics;

  const expectedKeys = Object.keys(input.expected);
  for (const key of expectedKeys) {
    if (!expectedFields.has(key)) diagnostics.push(diagnostic("INPUT_MALFORMED", owners.input, "input", `expected.${key}`, `type:${jsonType(input.expected[key])}`));
  }
  for (const key of expectedFields) {
    if (key === "status" && input.expected.kind !== "epic" && !Object.hasOwn(input.expected, key)) continue;
    if (!Object.hasOwn(input.expected, key)) diagnostics.push(diagnostic("INPUT_MALFORMED", owners.input, "input", `expected.${key}`, "type:undefined"));
  }
  if (diagnostics.length) return diagnostics;

  if (input.expected.kind !== "epic" && !Object.hasOwn(input.expected, "status")) {
    return [diagnostic("EXPECTED_STATUS_REQUIRED", owners.input, "input", "expected.status", "presence:missing")];
  }

  const requiredStrings = [
    ["runtime.kind", input.runtime.kind], ["expected.kind", input.expected.kind],
    ["expected.repositoryId", input.expected.repositoryId], ["expected.projectId", input.expected.projectId],
    ["expected.issueId", input.expected.issueId], ["expected.itemId", input.expected.itemId],
    ["expected.statusFieldId", input.expected.statusFieldId], ["expected.status", input.expected.status],
    ["expected.approvalEvidenceRef", input.expected.approvalEvidenceRef], ["issue.id", input.issue.id],
    ["issue.state", input.issue.state], ["issue.body", input.issue.body], ["issue.updatedAt", input.issue.updatedAt],
    ["project.repositoryId", input.project.repositoryId], ["project.id", input.project.id],
    ["project.itemId", input.project.itemId], ["project.statusFieldId", input.project.statusFieldId],
    ["window.startFingerprint", input.window.startFingerprint], ["window.endFingerprint", input.window.endFingerprint],
  ];
  for (const [path, value] of requiredStrings) {
    if (typeof value !== "string" || value.length === 0) diagnostics.push(diagnostic("INPUT_MALFORMED", owners.input, "input", path, `type:${jsonType(value)}`));
  }
  if (typeof input.expected.planDigest !== "string" || !/^sha256:[0-9a-f]{64}$/u.test(input.expected.planDigest)) diagnostics.push(diagnostic("INPUT_MALFORMED", owners.input, "input", "expected.planDigest", `type:${jsonType(input.expected.planDigest)}`));
  if (!Array.isArray(input.expected.relationIds) || !input.expected.relationIds.every((value) => typeof value === "string" && value.length > 0)) diagnostics.push(diagnostic("INPUT_MALFORMED", owners.input, "input", "expected.relationIds", `type:${jsonType(input.expected.relationIds)}`));
  if (!Number.isSafeInteger(input.issue.number) || input.issue.number <= 0) diagnostics.push(diagnostic("INPUT_MALFORMED", owners.input, "input", "issue.number", `type:${jsonType(input.issue.number)}`));
  if (!isRecord(input.project.status)) diagnostics.push(diagnostic("INPUT_MALFORMED", owners.input, "input", "project.status", `type:${jsonType(input.project.status)}`));
  if (typeof input.window.paginationComplete !== "boolean") diagnostics.push(diagnostic("INPUT_MALFORMED", owners.input, "input", "window.paginationComplete", `type:${jsonType(input.window.paginationComplete)}`));
  if (diagnostics.length) return diagnostics;

  const expectedKind = input.expected.kind;
  const runtimeKind = input.runtime.kind;
  const computedPlanDigest = computePlanDigest(input.expected);
  if (input.expected.planDigest !== computedPlanDigest) diagnostics.push(diagnostic("PLAN_DIGEST_MISMATCH", owners.input, "input", "expected.planDigest", pair(input.expected.planDigest, computedPlanDigest, new Set([input.expected.planDigest, computedPlanDigest]))));
  if (!KINDS.includes(expectedKind)) diagnostics.push(diagnostic("KIND_UNSUPPORTED", owners.input, "input", "expected.kind", digest(expectedKind)));
  if (!KINDS.includes(runtimeKind)) diagnostics.push(diagnostic("KIND_UNSUPPORTED", owners.input, "input", "runtime.kind", digest(runtimeKind)));
  if (KINDS.includes(expectedKind) && KINDS.includes(runtimeKind) && runtimeKind !== expectedKind) diagnostics.push(diagnostic("KIND_EXPECTATION_MISMATCH", owners.input, "input", "kind", pair(runtimeKind, expectedKind, new Set(KINDS))));
  return diagnostics;
}

function stageTwo(input) {
  const diagnostics = [];
  const provider = input.window.provider ?? {};
  if (provider.inaccessible === true) diagnostics.push(diagnostic("PROVIDER_INACCESSIBLE", owners.provider, "observation", "provider", "constant:redacted"));
  if (Number.isInteger(provider.identityCandidates) && provider.identityCandidates !== 1) diagnostics.push(diagnostic("IDENTITY_AMBIGUOUS", owners.provider, "observation", "identity", `count:${provider.identityCandidates}`));
  if (Number.isInteger(provider.projectItemCount) && provider.projectItemCount > 1) diagnostics.push(diagnostic("PROJECT_ITEM_DUPLICATE", owners.provider, "observation", "projectItem", `count:${provider.projectItemCount}`));
  if (input.window.paginationComplete !== true) diagnostics.push(diagnostic("PAGINATION_INCOMPLETE", owners.provider, "observation", "connection", `component:${input.window.incompleteConnection ?? "unknown"}`));
  if (isRecord(input.window.limit)) diagnostics.push(diagnostic("OBSERVATION_LIMIT", owners.provider, "observation", "limit", `limit:${input.window.limit.component}:${input.window.limit.seen}/${input.window.limit.max}`));
  if (diagnostics.length) return diagnostics;
  const comparisons = [
    ["REPOSITORY_ID_MISMATCH", "repositoryId", input.project.repositoryId, input.expected.repositoryId],
    ["PROJECT_ID_MISMATCH", "projectId", input.project.id, input.expected.projectId],
    ["ISSUE_ID_MISMATCH", "issueId", input.issue.id, input.expected.issueId],
    ["ITEM_ID_MISMATCH", "itemId", input.project.itemId, input.expected.itemId],
    ["STATUS_FIELD_ID_MISMATCH", "statusFieldId", input.project.statusFieldId, input.expected.statusFieldId],
  ];
  for (const [code, field, actual, expected] of comparisons) {
    if (actual !== expected) diagnostics.push(diagnostic(code, owners.provider, "observation", field, pair(actual, expected)));
  }
  if (input.window.startFingerprint !== input.window.endFingerprint) diagnostics.push(diagnostic("OBSERVATION_DRIFT", owners.provider, "observation", "fingerprint", "component:observation"));
  return diagnostics;
}

function sectionBodies(body, heading) {
  const sourceLines = body.split(/\r\n?|\n/u);
  const lines = [];
  let fence = null;
  for (const line of sourceLines) {
    const opening = line.match(/^ {0,3}(`{3,}|~{3,})/u);
    const marker = opening?.[1];
    const info = opening === null ? undefined : line.slice(opening[0].length);
    if (fence === null) {
      if (marker !== undefined && (marker[0] !== "`" || !info.includes("`"))) fence = { character: marker[0], length: marker.length };
      else lines.push(line);
      continue;
    }
    const closing = line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/u)?.[1];
    if (closing !== undefined && closing[0] === fence.character && closing.length >= fence.length) fence = null;
  }
  const sections = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index] !== heading) continue;
    const section = [];
    for (index += 1; index < lines.length && !/^##\s/u.test(lines[index]); index += 1) section.push(lines[index]);
    sections.push(section);
    index -= 1;
  }
  return sections;
}

function parseFields(section, names) {
  return Object.fromEntries(names.map((name) => {
    const prefix = `- ${name}:`;
    const values = section.filter((line) => line.startsWith(prefix)).map((line) => line.slice(prefix.length).trim());
    return [name, values];
  }));
}

function gatePredicate(status, facts) {
  const prerequisites = facts.requirements === "approved" && facts.stories === "approved" && facts.conformance === "passed";
  const authority = facts.ready === "granted" && facts.implementation === "yes";
  if (status === "Backlog") return !authority && facts.requirements !== "in progress" && facts.stories !== "in progress";
  if (status === "Refinement") return !authority && (facts.requirements === "in progress" || facts.stories === "in progress" || (facts.requirements === "approved" && facts.stories === "approved" && ["not run", "failed"].includes(facts.conformance)));
  if (["Ready", "In progress", "In review", "Done"].includes(status)) return prerequisites && authority;
  return false;
}

function stageThree(input) {
  const diagnostics = [];
  const status = input.project.status;
  const canonical = optionByName.get(status.name);
  if (!canonical || status.color !== canonical.color || status.description !== canonical.description) {
    diagnostics.push(diagnostic("STATUS_UNSUPPORTED", owners.policy, projectSubject(input), "status.option", digest(status)));
    return diagnostics;
  }
  if (!applicable[input.expected.kind].has(status.name)) diagnostics.push(diagnostic("KIND_APPLICABILITY_MISMATCH", owners.policy, issueSubject(input), "status", pair(input.expected.kind, status.name, new Set([...KINDS, ...STATUS_OPTIONS.map(({ name }) => name)]))));
  if (input.expected.kind !== "epic" && status.name !== input.expected.status) diagnostics.push(diagnostic("EXPECTED_STATUS_MISMATCH", owners.policy, issueSubject(input), "status", pair(status.name, input.expected.status, new Set(STATUS_OPTIONS.map(({ name }) => name)))));
  const expectedState = status.name === "Done" ? "CLOSED" : "OPEN";
  if (input.issue.state !== expectedState) diagnostics.push(diagnostic("ISSUE_STATE_CONTRADICTION", owners.policy, issueSubject(input), "state/status", pair(input.issue.state, status.name, new Set(["OPEN", "CLOSED", ...STATUS_OPTIONS.map(({ name }) => name)]))));
  return diagnostics;
}

function stageFourEpic(input) {
  const diagnostics = [];
  const subject = issueSubject(input);
  const body = input.issue.body;
  const gateSections = sectionBodies(body, "## Epic gate facts");
  if (gateSections.length !== 1) return [diagnostic("GATE_SECTION_COUNT", owners.issue, subject, "Epic gate facts", `count:${gateSections.length}`)];
  const names = ["Requirements refinement", "Story decomposition", "Planning Conformance", "Ready decision", "Implementation authority"];
  const fields = parseFields(gateSections[0], names);
  for (const name of names) {
    if (fields[name].length === 0) diagnostics.push(diagnostic("GATE_FIELD_MISSING", owners.issue, subject, name, "count:0"));
    if (fields[name].length > 1) diagnostics.push(diagnostic("GATE_FIELD_DUPLICATE", owners.issue, subject, name, `count:${fields[name].length}`));
  }
  if (diagnostics.length) return diagnostics;
  const allowed = [requirementsValues, requirementsValues, conformanceValues, readyValues, implementationValues];
  names.forEach((name, index) => {
    if (!allowed[index].has(fields[name][0])) diagnostics.push(diagnostic("GATE_VALUE_UNSUPPORTED", owners.issue, subject, name, digest(fields[name][0])));
  });
  if (diagnostics.length) return diagnostics;
  const facts = Object.freeze({ requirements: fields[names[0]][0], stories: fields[names[1]][0], conformance: fields[names[2]][0], ready: fields[names[3]][0], implementation: fields[names[4]][0] });
  const dependencyValid =
    (!(["in progress", "approved"].includes(facts.stories)) || facts.requirements === "approved") &&
    (!(["failed", "passed"].includes(facts.conformance)) || (facts.requirements === "approved" && facts.stories === "approved")) &&
    ((facts.ready === "granted") === (facts.implementation === "yes")) &&
    (!(facts.ready === "granted" || facts.implementation === "yes") || (facts.requirements === "approved" && facts.stories === "approved" && facts.conformance === "passed"));
  if (!dependencyValid) return [diagnostic("GATE_DEPENDENCY_CONTRADICTION", owners.issue, subject, "gate tuple", digest(facts))];

  const status = input.project.status.name;
  const pauses = sectionBodies(body, "## Pause facts");
  let pauseFacts = null;
  if (status === "Paused") {
    if (pauses.length !== 1) return [diagnostic("PAUSE_SECTION_COUNT", owners.issue, subject, "Pause facts", `count:${pauses.length}`)];
    const pauseNames = ["Paused from", "Pause reason", "Resume condition"];
    const pauseFields = parseFields(pauses[0], pauseNames);
    for (const name of pauseNames) {
      if (pauseFields[name].length === 0) diagnostics.push(diagnostic("PAUSE_FIELD_MISSING", owners.issue, subject, name, "count:0"));
      if (pauseFields[name].length > 1) diagnostics.push(diagnostic("PAUSE_FIELD_DUPLICATE", owners.issue, subject, name, `count:${pauseFields[name].length}`));
    }
    if (diagnostics.length) return diagnostics;
    for (const name of pauseNames) {
      const value = pauseFields[name][0];
      if ((name === "Paused from" && !pauseOrigins.has(value)) || (name !== "Paused from" && value.trim().length === 0)) diagnostics.push(diagnostic("PAUSE_VALUE_UNSUPPORTED", owners.issue, subject, name, digest(value)));
    }
    if (diagnostics.length) return diagnostics;
    pauseFacts = Object.freeze({ from: pauseFields["Paused from"][0], reasonDigest: digest(pauseFields["Pause reason"][0]), conditionDigest: digest(pauseFields["Resume condition"][0]) });
    if (!gatePredicate(pauseFacts.from, facts)) diagnostics.push(diagnostic("STATUS_FACT_CONTRADICTION", owners.policy, subject, "status/facts", digest({ status, from: pauseFacts.from, facts })));
  } else {
    if (pauses.length > 0) diagnostics.push(diagnostic("PAUSE_STALE", owners.issue, subject, "Pause facts", `count:${pauses.length}`));
    if (!gatePredicate(status, facts)) diagnostics.push(diagnostic("STATUS_FACT_CONTRADICTION", owners.policy, subject, "status/facts", digest({ status, facts })));
  }
  return diagnostics.length ? diagnostics : { facts, pauseFacts };
}

function stageFourNonEpic(input) {
  const diagnostics = [];
  const requestedClaim = input.runtime.requestedClaim;
  const authorityEffect = input.runtime.authorityEffect;
  if ((requestedClaim !== undefined && requestedClaim !== "plan-status-only") || (authorityEffect !== undefined && authorityEffect !== "none")) {
    diagnostics.push(diagnostic("NON_EPIC_AUTHORITY_CLAIM", owners.input, "input", "requestedClaim", `enum:${requestedClaim === "epic-contract-consistency" ? requestedClaim : "authority-request"}`));
  }
  const status = input.project.status.name;
  const pauses = sectionBodies(input.issue.body, "## Pause facts");
  if (status === "Paused") {
    if (pauses.length !== 1) diagnostics.push(diagnostic("PAUSE_SECTION_COUNT", owners.issue, issueSubject(input), "Pause facts", `count:${pauses.length}`));
    else {
      const fields = parseFields(pauses[0], ["Paused from", "Pause reason", "Resume condition"]);
      for (const name of Object.keys(fields)) {
        if (fields[name].length === 0) diagnostics.push(diagnostic("PAUSE_FIELD_MISSING", owners.issue, issueSubject(input), name, "count:0"));
        else if (fields[name].length > 1) diagnostics.push(diagnostic("PAUSE_FIELD_DUPLICATE", owners.issue, issueSubject(input), name, `count:${fields[name].length}`));
      }
      if (!diagnostics.length) {
        const from = fields["Paused from"][0];
        if (!pauseOrigins.has(from)) diagnostics.push(diagnostic("PAUSE_VALUE_UNSUPPORTED", owners.issue, issueSubject(input), "Paused from", digest(from)));
        else if (input.expected.kind === "roadmap" && !["In progress", "In review"].includes(from)) diagnostics.push(diagnostic("KIND_APPLICABILITY_MISMATCH", owners.policy, issueSubject(input), "status", pair(input.expected.kind, from, new Set([...KINDS, ...pauseOrigins]))));
        for (const name of ["Pause reason", "Resume condition"]) if (fields[name][0].trim().length === 0) diagnostics.push(diagnostic("PAUSE_VALUE_UNSUPPORTED", owners.issue, issueSubject(input), name, digest(fields[name][0])));
      }
    }
  } else if (pauses.length > 0) diagnostics.push(diagnostic("PAUSE_STALE", owners.issue, issueSubject(input), "Pause facts", `count:${pauses.length}`));
  return diagnostics;
}

export function validatePlanningObservation(input) {
  for (const stage of [stageOne, stageTwo, stageThree]) {
    const diagnostics = stage(input);
    if (diagnostics.length) return resultFor(diagnostics);
  }
  const kind = input.expected.kind;
  let facts = null;
  let pauseFacts = null;
  if (kind === "epic") {
    const outcome = stageFourEpic(input);
    if (Array.isArray(outcome)) return resultFor(outcome);
    ({ facts, pauseFacts } = outcome);
  } else {
    const diagnostics = stageFourNonEpic(input);
    if (diagnostics.length) return resultFor(diagnostics);
  }
  const status = input.project.status.name;
  return Object.freeze({
    ok: true,
    value: Object.freeze({
      kind,
      claim: kind === "epic" ? "epic-contract-consistency" : "plan-status-only",
      authorityEffect: "none",
      status,
      gateFacts: facts,
      pauseFacts,
      fingerprint: fingerprintObservation({ kind, status, issue: input.issue.id, item: input.project.itemId, facts, pauseFacts }),
    }),
  });
}

export function rejectEvidenceConversion(result, requestedEffect) {
  return Object.freeze({
    ok: false,
    authorityEffect: "none",
    requestedEffect,
    evidenceAccepted: result?.ok === true,
    commands: Object.freeze([]),
    calls: Object.freeze([]),
    reason: EVIDENCE_ONLY_MESSAGE,
  });
}

export function providerDiagnostic(code, field, observed) {
  return resultFor([diagnostic(code, owners.provider, "observation", field, observed)]);
}
