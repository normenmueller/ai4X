import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import fixtures from "./planning-contract.fixtures.json" with { type: "json" };
import { canonicalJson, EVIDENCE_ONLY_MESSAGE, validatePlanningObservation } from "./planning-contract.mjs";
import * as observerModule from "./planning-github-observer.mjs";
import { observePlanning, QUERY_DOCUMENTS } from "./planning-github-observer.mjs";

const roots = [];
test.after(() => {
  for (const root of roots) rmSync(root, { force: true, recursive: true });
});

function expectedEnvelope() {
  return { runtime: structuredClone(fixtures.baseEpic.runtime), expected: structuredClone(fixtures.baseEpic.expected) };
}

function statusOption(name = "Backlog") {
  const options = {
    Backlog: { id: "O_backlog", name: "Backlog", color: "GRAY", description: "Captured for consideration; material preparation has not started." },
    Refinement: { id: "O_refinement", name: "Refinement", color: "BLUE", description: "Active contract preparation; neither implementation nor authorization." },
  };
  return options[name];
}

function issue(overrides = {}) {
  return {
    id: "I_issue",
    number: 102,
    state: "OPEN",
    body: fixtures.baseEpic.issue.body,
    updatedAt: "2026-08-14T00:00:00Z",
    ...overrides,
  };
}

function page(nodes, hasNextPage = false, endCursor = null) {
  return { nodes, pageInfo: { hasNextPage, endCursor } };
}

function projectItem(id = "PVTI_item", contentId = "I_issue") {
  return { id, content: { __typename: "Issue", id: contentId } };
}

function projectField(option = statusOption()) {
  return { id: "PVTF_status", name: "Status", options: [option] };
}

function statusValue(name = "Backlog", option = statusOption()) {
  return { __typename: "ProjectV2ItemFieldSingleSelectValue", id: "PVTFV_status", name, optionId: option.id, field: { id: "PVTF_status" } };
}

function transportFixture(overrides = {}) {
  const calls = [];
  const option = statusOption();
  const start = {
    repository: { id: "R_repo" },
    issue: issue(),
    project: {
      id: "P_project",
      items: page([projectItem()]),
      fields: page([projectField(option)]),
    },
    item: {
      id: "PVTI_item",
      content: { __typename: "Issue", id: "I_issue" },
      fieldValues: page([statusValue("Backlog", option)]),
    },
    statusField: { id: "PVTF_status", name: "Status", options: [structuredClone(option)] },
  };
  const end = {
    repository: { id: "R_repo" },
    issue: issue(),
    project: { id: "P_project", items: page([projectItem()]), fields: page([projectField(structuredClone(option))]) },
    item: {
      id: "PVTI_item",
      content: { __typename: "Issue", id: "I_issue" },
      fieldValues: page([statusValue("Backlog", option)]),
    },
    statusField: { id: "PVTF_status", name: "Status", options: [structuredClone(option)] },
  };
  Object.assign(start, overrides.start ?? {});
  Object.assign(end, overrides.end ?? {});
  const transport = async ({ query, variables }) => {
    calls.push({ query, variables: structuredClone(variables) });
    if (overrides.throwError) throw new Error("SECRET_PROVIDER_PAYLOAD");
    if (overrides.graphqlError) return { errors: [{ message: "SECRET_PROVIDER_PAYLOAD" }] };
    if (query === QUERY_DOCUMENTS.start) return { data: start };
    if (query === QUERY_DOCUMENTS.end) return { data: end };
    if (query === QUERY_DOCUMENTS.items) return { data: { project: { items: overrides.itemPages?.[variables.cursor] ?? overrides.itemsPage ?? page([]) } } };
    if (query === QUERY_DOCUMENTS.fields) return { data: { project: { fields: overrides.fieldPages?.[variables.cursor] ?? overrides.fieldsPage ?? page([]) } } };
    if (query === QUERY_DOCUMENTS.values) return { data: { item: { fieldValues: overrides.valuePages?.[variables.cursor] ?? overrides.valuesPage ?? page([]) } } };
    throw new Error("unexpected query");
  };
  return { transport, calls, start, end };
}

function expectCode(result, code) {
  assert.equal(result.ok, false);
  assert.deepEqual(result.diagnostics.map((item) => item.code), [code]);
  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes("SECRET_PROVIDER_PAYLOAD"), false);
}

function runCli(mode, flag, input) {
  return spawnSync(process.execPath, ["utl/gh/planning-verify.mjs", mode, flag, input], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8",
    env: { ...process.env, GH_TOKEN: "" },
  });
}

function assertClosedInputFailure(result, forbidden) {
  const expected = {
    evidence: EVIDENCE_ONLY_MESSAGE,
    result: {
      ok: false,
      diagnostics: [{
        code: "INPUT_MALFORMED",
        owner: "operator-input",
        subject: "input",
        field: "$",
        observed: "type:null",
      }],
    },
  };
  assert.equal(result.status, 2);
  assert.equal(result.stdout, `${canonicalJson(expected)}\n`);
  assert.equal(result.stderr, `${EVIDENCE_ONLY_MESSAGE}\n`);
  assert.deepEqual(JSON.parse(result.stdout), expected);
  assert.doesNotMatch(result.stdout, /"commands?"|"calls?"/u);
  for (const value of forbidden) {
    assert.equal(result.stdout.includes(value), false);
    assert.equal(result.stderr.includes(value), false);
  }
}

test("observer exports only read APIs and every constant GraphQL document is a query", () => {
  assert.deepEqual(Object.keys(observerModule).sort(), ["QUERY_DOCUMENTS", "createGithubTransport", "observePlanning"]);
  for (const document of Object.values(QUERY_DOCUMENTS)) {
    assert.match(document, /^query\s/u);
    assert.doesNotMatch(document, /\bmutation\b/iu);
    assert.doesNotMatch(document, /fieldValueByName/u);
  }
  for (const name of Object.keys(observerModule)) assert.doesNotMatch(name, /apply|mutat|transition|write|update|delete|createissue/iu);
});

test("complete stable observation binds every identity and validates without network or credentials", async () => {
  const fixture = transportFixture();
  const observed = await observePlanning(expectedEnvelope(), { transport: fixture.transport });
  assert.equal(observed.ok, true, JSON.stringify(observed));
  assert.equal(fixture.calls.length, 2);
  assert.deepEqual(fixture.calls.map(({ query }) => query), [QUERY_DOCUMENTS.start, QUERY_DOCUMENTS.end]);
  const verdict = validatePlanningObservation(observed.value);
  assert.equal(verdict.ok, true, JSON.stringify(verdict));
  assert.equal(verdict.value.claim, "epic-contract-consistency");
  assert.equal(verdict.value.authorityEffect, "none");
});

test("start and end independently enumerate stable multipage closures", async () => {
  const fixture = transportFixture();
  fixture.start.project.items = page([], true, "items-1");
  fixture.start.project.fields = page([], true, "fields-1");
  fixture.start.item.fieldValues = page([], true, "values-1");
  fixture.end.project.items = page([], true, "end-items-1");
  fixture.end.project.fields = page([], true, "end-fields-1");
  fixture.end.item.fieldValues = page([], true, "end-values-1");
  const option = statusOption();
  const wrapped = transportFixture({
    start: fixture.start,
    end: fixture.end,
    itemPages: { "items-1": page([projectItem()]), "end-items-1": page([projectItem()]) },
    fieldPages: { "fields-1": page([projectField(option)]), "end-fields-1": page([projectField(option)]) },
    valuePages: { "values-1": page([statusValue("Backlog", option)]), "end-values-1": page([statusValue("Backlog", option)]) },
  });
  const result = await observePlanning(expectedEnvelope(), { transport: wrapped.transport });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(wrapped.calls.length, 8);
  assert.deepEqual(new Set(wrapped.calls.filter(({ variables }) => variables.cursor).map(({ variables }) => variables.cursor)), new Set(["items-1", "fields-1", "values-1", "end-items-1", "end-fields-1", "end-values-1"]));
});

test("canonical closure sorting makes provider enumeration order irrelevant", async () => {
  const fixture = transportFixture();
  const backlog = statusOption();
  const refinement = statusOption("Refinement");
  const otherItem = projectItem("PVTI_other", "I_other");
  const otherField = { id: "PVTF_other", name: "Other" };
  const otherValue = { __typename: "ProjectV2ItemFieldTextValue", id: "PVTFV_other", field: { id: "PVTF_other" } };
  fixture.start.project.items.nodes.push(otherItem);
  fixture.start.project.fields.nodes[0].options.push(refinement);
  fixture.start.project.fields.nodes.push(otherField);
  fixture.start.item.fieldValues.nodes.push(otherValue);
  fixture.end.project.items.nodes = [structuredClone(otherItem), projectItem()];
  fixture.end.project.fields.nodes = [structuredClone(otherField), { ...projectField(backlog), options: [structuredClone(refinement), structuredClone(backlog)] }];
  fixture.end.item.fieldValues.nodes = [structuredClone(otherValue), statusValue()];
  const result = await observePlanning(expectedEnvelope(), { transport: fixture.transport });
  assert.equal(result.ok, true, JSON.stringify(result));
});

test("pagination without a closing cursor fails distinctly", async () => {
  const fixture = transportFixture();
  fixture.start.project.items = page([], true, null);
  expectCode(await observePlanning(expectedEnvelope(), { transport: fixture.transport }), "PAGINATION_INCOMPLETE");
});

test("provider error payloads and transport exceptions fail inaccessible and remain redacted", async () => {
  expectCode(await observePlanning(expectedEnvelope(), { transport: transportFixture({ graphqlError: true }).transport }), "PROVIDER_INACCESSIBLE");
  expectCode(await observePlanning(expectedEnvelope(), { transport: transportFixture({ throwError: true }).transport }), "PROVIDER_INACCESSIBLE");
});

test("identity mismatch, duplicate binding, zero binding, and field ambiguity fail closed", async () => {
  const mismatches = [
    ["repository", "id", "REPOSITORY_ID_MISMATCH"],
    ["project", "id", "PROJECT_ID_MISMATCH"],
    ["issue", "id", "ISSUE_ID_MISMATCH"],
    ["item", "id", "ITEM_ID_MISMATCH"],
    ["statusField", "id", "STATUS_FIELD_ID_MISMATCH"],
  ];
  for (const [owner, field, code] of mismatches) {
    const mismatch = transportFixture();
    mismatch.start[owner][field] = "WRONG";
    expectCode(await observePlanning(expectedEnvelope(), { transport: mismatch.transport }), code);
  }

  const duplicate = transportFixture();
  duplicate.start.project.items.nodes.push(projectItem("PVTI_duplicate"));
  expectCode(await observePlanning(expectedEnvelope(), { transport: duplicate.transport }), "PROJECT_ITEM_DUPLICATE");

  const absent = transportFixture();
  absent.start.project.items.nodes = [];
  expectCode(await observePlanning(expectedEnvelope(), { transport: absent.transport }), "IDENTITY_AMBIGUOUS");

  const fieldDuplicate = transportFixture();
  fieldDuplicate.start.project.fields.nodes.push(projectField());
  expectCode(await observePlanning(expectedEnvelope(), { transport: fieldDuplicate.transport }), "IDENTITY_AMBIGUOUS");

  const wrongItemContent = transportFixture();
  wrongItemContent.start.item.content.id = "WRONG";
  expectCode(await observePlanning(expectedEnvelope(), { transport: wrongItemContent.transport }), "ISSUE_ID_MISMATCH");
});

test("configured item, page, and body ceilings stop before incomplete evidence can validate", async () => {
  const items = transportFixture();
  items.start.project.items.nodes.push(projectItem("other", "other"));
  expectCode(await observePlanning(expectedEnvelope(), { transport: items.transport, limits: { items: 1 } }), "OBSERVATION_LIMIT");

  const pages = transportFixture();
  pages.start.project.items = page([], true, "more");
  expectCode(await observePlanning(expectedEnvelope(), { transport: pages.transport, limits: { pages: 1 } }), "OBSERVATION_LIMIT");

  const body = transportFixture();
  expectCode(await observePlanning(expectedEnvelope(), { transport: body.transport, limits: { bodyBytes: 10 } }), "OBSERVATION_LIMIT");
});

test("ordinary end body, state, selected-status, or complete schema movement is observation drift", async () => {
  const mutations = [
    (end) => { end.issue.updatedAt = "2026-08-14T00:00:01Z"; },
    (end) => { end.issue.body += "moved"; },
    (end) => { end.issue.state = "CLOSED"; },
    (end) => { end.item.fieldValues.nodes[0].name = "Refinement"; },
    (end) => { end.project.fields.nodes[0].options[0].description = "moved"; },
    (end) => { end.project.fields.nodes[0].options.push(statusOption("Refinement")); },
    (end) => { end.project.items.nodes.push(projectItem("PVTI_other", "I_other")); },
    (end) => { end.project.fields.nodes.push({ id: "PVTF_other", name: "Other" }); },
    (end) => { end.item.fieldValues.nodes.push({ __typename: "ProjectV2ItemFieldTextValue", id: "PVTFV_other", field: { id: "PVTF_other" } }); },
  ];
  for (const mutate of mutations) {
    const fixture = transportFixture();
    mutate(fixture.end);
    expectCode(await observePlanning(expectedEnvelope(), { transport: fixture.transport }), "OBSERVATION_DRIFT");
  }
});

test("end closure reruns duplicate and ambiguity checks before drift", async () => {
  const duplicate = transportFixture();
  duplicate.end.issue.updatedAt = "2026-08-14T00:00:01Z";
  duplicate.end.project.items.nodes.push(projectItem("PVTI_duplicate"));
  expectCode(await observePlanning(expectedEnvelope(), { transport: duplicate.transport }), "PROJECT_ITEM_DUPLICATE");

  const missingItem = transportFixture();
  missingItem.end.project.items.nodes = [];
  expectCode(await observePlanning(expectedEnvelope(), { transport: missingItem.transport }), "IDENTITY_AMBIGUOUS");

  const missingField = transportFixture();
  missingField.end.project.fields.nodes = [];
  expectCode(await observePlanning(expectedEnvelope(), { transport: missingField.transport }), "IDENTITY_AMBIGUOUS");

  const missingOption = transportFixture();
  missingOption.end.project.fields.nodes[0].options = [];
  expectCode(await observePlanning(expectedEnvelope(), { transport: missingOption.transport }), "IDENTITY_AMBIGUOUS");

  const missingStatus = transportFixture();
  missingStatus.end.item.fieldValues.nodes = [];
  expectCode(await observePlanning(expectedEnvelope(), { transport: missingStatus.transport }), "IDENTITY_AMBIGUOUS");

  const wrongContent = transportFixture();
  wrongContent.end.item.content.id = "I_other";
  expectCode(await observePlanning(expectedEnvelope(), { transport: wrongContent.transport }), "IDENTITY_AMBIGUOUS");
});

test("end pagination and caps fail before duplicate or drift evaluation", async () => {
  const incomplete = transportFixture();
  incomplete.end.issue.updatedAt = "2026-08-14T00:00:01Z";
  incomplete.end.project.items = page([projectItem(), projectItem("PVTI_duplicate")], true, null);
  expectCode(await observePlanning(expectedEnvelope(), { transport: incomplete.transport }), "PAGINATION_INCOMPLETE");

  const capped = transportFixture();
  capped.end.issue.updatedAt = "2026-08-14T00:00:01Z";
  capped.end.project.items.nodes.push(projectItem("PVTI_duplicate"));
  expectCode(await observePlanning(expectedEnvelope(), { transport: capped.transport, limits: { items: 1 } }), "OBSERVATION_LIMIT");
});

test("snapshot CLI emits canonical JSON, exact evidence disclaimer, and no command", () => {
  const root = mkdtempSync(join(tmpdir(), "ai4x-planning-cli-"));
  roots.push(root);
  const input = join(root, "snapshot.json");
  writeFileSync(input, JSON.stringify(fixtures.baseEpic));
  const result = spawnSync(process.execPath, ["utl/gh/planning-verify.mjs", "snapshot", "--input", input], { cwd: new URL("../..", import.meta.url), encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, `${EVIDENCE_ONLY_MESSAGE}\n`);
  const output = JSON.parse(result.stdout);
  assert.equal(output.evidence, EVIDENCE_ONLY_MESSAGE);
  assert.equal(output.result.value.authorityEffect, "none");
  assert.equal("command" in output, false);

  const apply = spawnSync(process.execPath, ["utl/gh/planning-verify.mjs", "apply", "--input", input], { cwd: new URL("../..", import.meta.url), encoding: "utf8" });
  assert.equal(apply.status, 2);
  assert.match(apply.stderr, /^usage:/u);
  assert.equal(apply.stdout, "");
});

test("snapshot and live CLI redact every malformed JSON marker class into one closed input diagnostic", () => {
  const root = mkdtempSync(join(tmpdir(), "ai4x-planning-cli-malformed-"));
  roots.push(root);
  const cases = [
    ["snapshot", "--input", "SECRET_BODY_MARKER"],
    ["live", "--expected", "TOKEN_MARKER"],
    ["snapshot", "--input", "PAUSE_PROSE_MARKER"],
    ["live", "--expected", "PROVIDER_PAYLOAD_MARKER"],
  ];
  for (const [mode, flag, marker] of cases) {
    const input = join(root, `${mode}-${marker}.json`);
    writeFileSync(input, `{"value":"${marker}"`);
    assertClosedInputFailure(runCli(mode, flag, input), [marker, input, "Unexpected token", "JSON"]);
  }
});

test("near-valid and truncated JSON fail closed without parser prose", () => {
  const root = mkdtempSync(join(tmpdir(), "ai4x-planning-cli-near-json-"));
  roots.push(root);
  const cases = [
    ["snapshot", "--input", "near-valid.json", "{\"runtime\":{},}"],
    ["live", "--expected", "truncated.json", "{\"runtime\":{"],
  ];
  for (const [mode, flag, name, bytes] of cases) {
    const input = join(root, name);
    writeFileSync(input, bytes);
    assertClosedInputFailure(runCli(mode, flag, input), [bytes, input, "Unexpected", "position", "JSON"]);
  }
});

test("snapshot and live CLI redact missing or unreadable requested input paths", () => {
  const root = mkdtempSync(join(tmpdir(), "ai4x-planning-cli-read-failure-"));
  roots.push(root);
  const missing = join(root, "RAW_REQUESTED_PATH_MARKER-missing.json");
  const unreadable = join(root, "RAW_REQUESTED_PATH_MARKER-directory");
  const directoryResult = mkdtempSync(unreadable);
  assertClosedInputFailure(runCli("snapshot", "--input", missing), [missing, "RAW_REQUESTED_PATH_MARKER", "ENOENT"]);
  assertClosedInputFailure(runCli("live", "--expected", directoryResult), [directoryResult, "RAW_REQUESTED_PATH_MARKER", "EISDIR"]);
});
