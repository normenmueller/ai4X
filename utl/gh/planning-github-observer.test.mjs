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

function standaloneEnvelope() {
  return { runtime: structuredClone(fixtures.baseStandalone.runtime), expected: structuredClone(fixtures.baseStandalone.expected) };
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
  const connection = { nodes, pageInfo: { hasNextPage, endCursor } };
  Object.defineProperty(connection, "edges", {
    enumerable: true,
    get() {
      return this.nodes.map((node, index) => ({
        cursor: index === this.nodes.length - 1 && typeof this.pageInfo.endCursor === "string"
          ? this.pageInfo.endCursor
          : `cursor:${index}:${node.id ?? node.field?.id ?? node.__typename ?? "node"}`,
        node,
      }));
    },
  });
  return connection;
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

function optionalValue(kind, memberIds = ["M_1", "M_2"]) {
  const definitions = {
    User: {
      field: { id: "PVTF_users", name: "Users" },
      value: { __typename: "ProjectV2ItemFieldUserValue", field: { id: "PVTF_users" }, users: page(memberIds.map((id) => ({ id }))) },
    },
    Repository: {
      field: { id: "PVTF_repository", name: "Repository" },
      value: { __typename: "ProjectV2ItemFieldRepositoryValue", field: { id: "PVTF_repository" }, repository: { id: "R_value" } },
    },
    Label: {
      field: { id: "PVTF_labels", name: "Labels" },
      value: { __typename: "ProjectV2ItemFieldLabelValue", field: { id: "PVTF_labels" }, labels: page(memberIds.map((id) => ({ id: `L_${id}` }))) },
    },
    PullRequest: {
      field: { id: "PVTF_pull_requests", name: "Linked pull requests" },
      value: { __typename: "ProjectV2ItemFieldPullRequestValue", field: { id: "PVTF_pull_requests" }, pullRequests: page(memberIds.map((id) => ({ id: `PR_${id}` }))) },
    },
    Text: {
      field: { id: "PVTF_text", name: "Text" },
      value: { __typename: "ProjectV2ItemFieldTextValue", id: "PVTFV_text", field: { id: "PVTF_text" }, text: null },
    },
  };
  return structuredClone(definitions[kind]);
}

function addOptionalValue(snapshot, kind, memberIds) {
  const definition = optionalValue(kind, memberIds);
  snapshot.project.fields.nodes.push(definition.field);
  snapshot.item.fieldValues.nodes.push(definition.value);
  return definition.value;
}

function addMixedSupportedValues(snapshot, reverse = false) {
  const fields = [
    { id: "PVTF_users", name: "Users" },
    { id: "PVTF_repository", name: "Repository" },
    { id: "PVTF_labels", name: "Labels" },
    { id: "PVTF_pull_requests", name: "Linked pull requests" },
    { id: "PVTF_text", name: "Text" },
  ];
  const memberIds = reverse ? ["M_2", "M_1"] : ["M_1", "M_2"];
  const values = [
    { __typename: "ProjectV2ItemFieldUserValue", field: { id: "PVTF_users" }, users: page(memberIds.map((id) => ({ id }))) },
    { __typename: "ProjectV2ItemFieldRepositoryValue", field: { id: "PVTF_repository" }, repository: { id: "R_value" } },
    { __typename: "ProjectV2ItemFieldLabelValue", field: { id: "PVTF_labels" }, labels: page(memberIds.map((id) => ({ id: `L_${id}` }))) },
    { __typename: "ProjectV2ItemFieldPullRequestValue", field: { id: "PVTF_pull_requests" }, pullRequests: page(memberIds.map((id) => ({ id: `PR_${id}` }))) },
    { __typename: "ProjectV2ItemFieldTextValue", id: "PVTFV_text", field: { id: "PVTF_text" }, text: null },
  ];
  snapshot.project.fields.nodes.push(...(reverse ? fields.reverse() : fields));
  snapshot.item.fieldValues.nodes.push(...(reverse ? values.reverse() : values));
}

function edgePage(entries, hasNextPage = false, endCursor = null) {
  return { edges: entries, pageInfo: { hasNextPage, endCursor } };
}

function nestedMemberData(value, valueCursor, connectionName, connection, overrides = {}) {
  return {
    item: {
      fieldValues: {
        edges: [{
          cursor: valueCursor,
          node: {
            __typename: value.__typename,
            field: { id: value.field.id },
            [connectionName]: connection,
            ...overrides,
          },
        }],
      },
    },
  };
}

function transportFixture(overrides = {}) {
  const calls = [];
  const option = statusOption();
  const start = {
    repository: { __typename: "Repository", id: "R_repo" },
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
    repository: { __typename: "Repository", id: "R_repo" },
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
    if (query === QUERY_DOCUMENTS.userMembers || query === QUERY_DOCUMENTS.labelMembers || query === QUERY_DOCUMENTS.pullRequestMembers) {
      const memberPage = overrides.memberPages?.[variables.memberCursor];
      if (memberPage !== undefined) return { data: memberPage };
    }
    throw new Error("unexpected query");
  };
  return { transport, calls, start, end };
}

function expectCode(result, code, forbidden = []) {
  assert.equal(result.ok, false);
  assert.deepEqual(result.diagnostics.map((item) => item.code), [code]);
  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes("SECRET_PROVIDER_PAYLOAD"), false);
  for (const marker of forbidden) assert.equal(serialized.includes(marker), false);
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
  addMixedSupportedValues(fixture.start);
  addMixedSupportedValues(fixture.end, true);
  const observed = await observePlanning(expectedEnvelope(), { transport: fixture.transport });
  assert.equal(observed.ok, true, JSON.stringify(observed));
  assert.equal(fixture.calls.length, 2);
  assert.deepEqual(fixture.calls.map(({ query }) => query), [QUERY_DOCUMENTS.start, QUERY_DOCUMENTS.end]);
  const verdict = validatePlanningObservation(observed.value);
  assert.equal(verdict.ok, true, JSON.stringify(verdict));
  assert.equal(verdict.value.claim, "epic-contract-consistency");
  assert.equal(verdict.value.authorityEffect, "none");
});

test("each supported field-value variant uses only its minimal provider projection", async () => {
  for (const kind of ["SingleSelect", "User", "Repository", "Label", "PullRequest", "Text"]) {
    const fixture = transportFixture();
    if (kind !== "SingleSelect") {
      addOptionalValue(fixture.start, kind);
      addOptionalValue(fixture.end, kind);
    }
    const observed = await observePlanning(expectedEnvelope(), { transport: fixture.transport });
    assert.equal(observed.ok, true, `${kind}: ${JSON.stringify(observed)}`);
  }
});

test("synthetic #128-shaped mixed closure remains Backlog evidence without workflow authority", async () => {
  const fixture = transportFixture();
  fixture.start.issue.number = 128;
  fixture.end.issue.number = 128;
  fixture.start.issue.body = fixtures.baseStandalone.issue.body;
  fixture.end.issue.body = fixtures.baseStandalone.issue.body;
  addMixedSupportedValues(fixture.start);
  addMixedSupportedValues(fixture.end, true);
  const observed = await observePlanning(standaloneEnvelope(), { transport: fixture.transport });
  assert.equal(observed.ok, true, JSON.stringify(observed));
  const verdict = validatePlanningObservation(observed.value);
  assert.equal(verdict.ok, true, JSON.stringify(verdict));
  assert.deepEqual({ claim: verdict.value.claim, status: verdict.value.status, authorityEffect: verdict.value.authorityEffect }, {
    claim: "plan-status-only",
    status: "Backlog",
    authorityEffect: "none",
  });
  assert.doesNotMatch(JSON.stringify(verdict), /"(?:command|transition|mutation|calls?)"/iu);
});

test("canonical sorting independently tolerates top-level and nested-member reordering", async () => {
  const cases = [
    ["top-level", (end) => {
      end.project.items.nodes.reverse();
      end.project.fields.nodes.reverse();
      end.item.fieldValues.nodes.reverse();
    }],
    ["User members", (end) => { end.item.fieldValues.nodes.find(({ __typename }) => __typename === "ProjectV2ItemFieldUserValue").users.nodes.reverse(); }],
    ["Label members", (end) => { end.item.fieldValues.nodes.find(({ __typename }) => __typename === "ProjectV2ItemFieldLabelValue").labels.nodes.reverse(); }],
    ["PullRequest members", (end) => { end.item.fieldValues.nodes.find(({ __typename }) => __typename === "ProjectV2ItemFieldPullRequestValue").pullRequests.nodes.reverse(); }],
  ];
  for (const [name, reorder] of cases) {
    const fixture = transportFixture();
    addMixedSupportedValues(fixture.start);
    addMixedSupportedValues(fixture.end);
    fixture.start.project.items.nodes.push(projectItem("PVTI_other", "I_other"));
    fixture.end.project.items.nodes.push(projectItem("PVTI_other", "I_other"));
    reorder(fixture.end);
    const result = await observePlanning(expectedEnvelope(), { transport: fixture.transport });
    assert.equal(result.ok, true, `${name}: ${JSON.stringify(result)}`);
    assert.equal(result.value.window.startFingerprint, result.value.window.endFingerprint);
  }
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

test("outer values and nested User, Label, and PullRequest members paginate independently at both window endpoints", async () => {
  const fixture = transportFixture();
  function configure(snapshot, prefix) {
    const definitions = [optionalValue("User"), optionalValue("Repository"), optionalValue("Label"), optionalValue("PullRequest"), optionalValue("Text")];
    snapshot.project.fields.nodes.push(...definitions.map(({ field }) => field));
    const user = definitions[0].value;
    const label = definitions[2].value;
    const pullRequest = definitions[3].value;
    user.users = page([{ id: "M_1" }], true, `${prefix}-users-1`);
    label.labels = page([{ id: "L_M_1" }], true, `${prefix}-labels-1`);
    pullRequest.pullRequests = page([{ id: "PR_M_1" }], true, `${prefix}-pull-requests-1`);
    snapshot.item.fieldValues = page([statusValue()], true, `${prefix}-values-1`);
    const continuation = page(definitions.map(({ value }) => value));
    return { continuation, user, label, pullRequest };
  }
  const start = configure(fixture.start, "start");
  const end = configure(fixture.end, "end");
  const valuePages = {
    "start-values-1": start.continuation,
    "end-values-1": end.continuation,
  };
  const startUserCursor = start.continuation.edges.find(({ node }) => node === start.user).cursor;
  const startLabelCursor = start.continuation.edges.find(({ node }) => node === start.label).cursor;
  const endUserCursor = end.continuation.edges.find(({ node }) => node === end.user).cursor;
  const endLabelCursor = end.continuation.edges.find(({ node }) => node === end.label).cursor;
  const startPullRequestCursor = start.continuation.edges.find(({ node }) => node === start.pullRequest).cursor;
  const endPullRequestCursor = end.continuation.edges.find(({ node }) => node === end.pullRequest).cursor;
  const memberPages = {
    "start-users-1": nestedMemberData(start.user, startUserCursor, "users", page([{ id: "M_2" }])),
    "end-users-1": nestedMemberData(end.user, endUserCursor, "users", page([{ id: "M_2" }])),
    "start-labels-1": nestedMemberData(start.label, startLabelCursor, "labels", page([{ id: "L_M_2" }])),
    "end-labels-1": nestedMemberData(end.label, endLabelCursor, "labels", page([{ id: "L_M_2" }])),
    "start-pull-requests-1": nestedMemberData(start.pullRequest, startPullRequestCursor, "pullRequests", page([{ id: "PR_M_2" }])),
    "end-pull-requests-1": nestedMemberData(end.pullRequest, endPullRequestCursor, "pullRequests", page([{ id: "PR_M_2" }])),
  };
  const wrapped = transportFixture({ start: fixture.start, end: fixture.end, valuePages, memberPages });
  const result = await observePlanning(expectedEnvelope(), { transport: wrapped.transport });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.deepEqual(
    wrapped.calls.filter(({ variables }) => variables.cursor).map(({ variables }) => variables.cursor).sort(),
    ["end-values-1", "start-values-1"],
  );
  assert.deepEqual(
    wrapped.calls.filter(({ variables }) => variables.memberCursor).map(({ variables }) => variables.memberCursor).sort(),
    ["end-labels-1", "end-pull-requests-1", "end-users-1", "start-labels-1", "start-pull-requests-1", "start-users-1"],
  );
});

test("canonical closure sorting makes provider enumeration order irrelevant", async () => {
  const fixture = transportFixture();
  const backlog = statusOption();
  const refinement = statusOption("Refinement");
  const otherItem = projectItem("PVTI_other", "I_other");
  const otherField = { id: "PVTF_other", name: "Other" };
  const otherValue = { __typename: "ProjectV2ItemFieldTextValue", id: "PVTFV_other", field: { id: "PVTF_other" }, text: null };
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

test("malformed required members and unsupported variants fail closed with one redacted diagnostic", async () => {
  const cases = [
    ["User field", { __typename: "ProjectV2ItemFieldUserValue", field: {}, users: page([]) }],
    ["User connection", { __typename: "ProjectV2ItemFieldUserValue", field: { id: "PVTF_bad" } }],
    ["Repository identity", { __typename: "ProjectV2ItemFieldRepositoryValue", field: { id: "PVTF_bad" }, repository: { id: "" } }],
    ["Label connection", { __typename: "ProjectV2ItemFieldLabelValue", field: { id: "PVTF_bad" }, labels: null }],
    ["PullRequest connection", { __typename: "ProjectV2ItemFieldPullRequestValue", field: { id: "PVTF_bad" }, pullRequests: null }],
    ["Text value identity", { __typename: "ProjectV2ItemFieldTextValue", field: { id: "PVTF_bad" }, text: null }],
    ["Text presence", { __typename: "ProjectV2ItemFieldTextValue", id: "PVTFV_bad", field: { id: "PVTF_bad" } }],
    ["Text type", { __typename: "ProjectV2ItemFieldTextValue", id: "PVTFV_bad", field: { id: "PVTF_bad" }, text: { secret: "SECRET_TEXT_TYPE" } }],
    ["SingleSelect option", { __typename: "ProjectV2ItemFieldSingleSelectValue", id: "PVTFV_bad", field: { id: "PVTF_bad" }, name: "Bad" }],
    ["unknown variant", { __typename: "ProjectV2ItemFieldIterationValue_SECRET_UNKNOWN", field: { id: "PVTF_bad" } }],
  ];
  for (const [name, value] of cases) {
    const fixture = transportFixture();
    fixture.start.project.fields.nodes.push({ id: "PVTF_bad", name: "Bad" });
    fixture.start.item.fieldValues.nodes.push(value);
    const result = await observePlanning(expectedEnvelope(), { transport: fixture.transport });
    assert.doesNotThrow(() => expectCode(result, "PROVIDER_INACCESSIBLE", ["SECRET_TEXT_TYPE", "SECRET_UNKNOWN"]), name);
  }
});

test("outer field-value pagination fails on missing cursor, locator truncation, repeated cursor, and limits", async () => {
  const missingCursor = transportFixture();
  missingCursor.start.item.fieldValues = edgePage([{ cursor: "value-1", node: statusValue() }], true, null);
  expectCode(await observePlanning(expectedEnvelope(), { transport: missingCursor.transport }), "PAGINATION_INCOMPLETE");

  const truncated = transportFixture();
  truncated.start.item.fieldValues = edgePage([{ cursor: "value-1", node: statusValue() }], true, "different-end-cursor");
  expectCode(await observePlanning(expectedEnvelope(), { transport: truncated.transport }), "PAGINATION_INCOMPLETE");

  const repeated = transportFixture();
  const text = optionalValue("Text");
  repeated.start.project.fields.nodes.push(text.field);
  repeated.start.item.fieldValues = edgePage([{ cursor: "shared-cursor", node: statusValue() }], true, "shared-cursor");
  const repeatedTransport = transportFixture({
    start: repeated.start,
    end: repeated.end,
    valuePages: { "shared-cursor": edgePage([{ cursor: "shared-cursor", node: text.value }]) },
  });
  expectCode(await observePlanning(expectedEnvelope(), { transport: repeatedTransport.transport }), "IDENTITY_AMBIGUOUS");

  const capped = transportFixture();
  addOptionalValue(capped.start, "Text");
  expectCode(await observePlanning(expectedEnvelope(), { transport: capped.transport, limits: { values: 1 } }), "OBSERVATION_LIMIT");
});

test("nested member pagination fails on incomplete closure, member limits, duplicates, and locator drift", async () => {
  for (const kind of ["User", "Label", "PullRequest"]) {
    const connectionName = kind === "User" ? "users" : kind === "Label" ? "labels" : "pullRequests";
    const limitName = connectionName;

    const missingCursor = transportFixture();
    const missingValue = addOptionalValue(missingCursor.start, kind);
    missingValue[connectionName] = page([], true, null);
    expectCode(await observePlanning(expectedEnvelope(), { transport: missingCursor.transport }), "PAGINATION_INCOMPLETE");

    const pageCapped = transportFixture();
    const cappedValue = addOptionalValue(pageCapped.start, kind);
    cappedValue[connectionName] = page([], true, `${kind}-next`);
    expectCode(await observePlanning(expectedEnvelope(), { transport: pageCapped.transport, limits: { pages: 1 } }), "OBSERVATION_LIMIT");

    const memberCapped = transportFixture();
    addOptionalValue(memberCapped.start, kind, ["duplicate-cap", "over-cap"]);
    expectCode(await observePlanning(expectedEnvelope(), { transport: memberCapped.transport, limits: { [limitName]: 1 } }), "OBSERVATION_LIMIT");

    const duplicate = transportFixture();
    addOptionalValue(duplicate.start, kind, ["same", "same"]);
    expectCode(await observePlanning(expectedEnvelope(), { transport: duplicate.transport }), "IDENTITY_AMBIGUOUS");

    const locator = transportFixture();
    const locatorValue = addOptionalValue(locator.start, kind);
    locatorValue[connectionName] = page([], true, `${kind}-locator-next`);
    const valueCursor = locator.start.item.fieldValues.edges.at(-1).cursor;
    const drifted = nestedMemberData(locatorValue, `wrong-${valueCursor}`, connectionName, page([]));
    const locatorTransport = transportFixture({
      start: locator.start,
      end: locator.end,
      memberPages: { [`${kind}-locator-next`]: drifted },
    });
    expectCode(await observePlanning(expectedEnvelope(), { transport: locatorTransport.transport }), "PAGINATION_INCOMPLETE");
  }
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

test("missing or wrong repository type fails redacted at both observation endpoints", async () => {
  const cases = [
    ["start", "missing"],
    ["start", "wrong"],
    ["end", "missing"],
    ["end", "wrong"],
  ];
  for (const [endpoint, condition] of cases) {
    const fixture = transportFixture();
    const marker = `SECRET_${endpoint.toUpperCase()}_${condition.toUpperCase()}_REPOSITORY_TYPE`;
    fixture[endpoint].repository.nameWithOwner = marker;
    if (condition === "missing") delete fixture[endpoint].repository.__typename;
    else fixture[endpoint].repository.__typename = marker;
    expectCode(
      await observePlanning(expectedEnvelope(), { transport: fixture.transport }),
      "PROVIDER_INACCESSIBLE",
      [marker],
    );
  }
});

test("duplicate selected Status and values bound to an unreturned field fail closed", async () => {
  const duplicateStatus = transportFixture();
  duplicateStatus.start.item.fieldValues.nodes.push({ ...statusValue(), id: "PVTFV_duplicate_status" });
  expectCode(await observePlanning(expectedEnvelope(), { transport: duplicateStatus.transport }), "IDENTITY_AMBIGUOUS");

  const unknownField = transportFixture();
  unknownField.start.item.fieldValues.nodes.push({
    __typename: "ProjectV2ItemFieldTextValue",
    id: "PVTFV_unbound",
    field: { id: "PVTF_unreturned" },
    text: null,
  });
  expectCode(await observePlanning(expectedEnvelope(), { transport: unknownField.transport }), "PROVIDER_INACCESSIBLE");
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
    (end) => {
      const refinement = statusOption("Refinement");
      end.project.fields.nodes[0].options.push(refinement);
      end.item.fieldValues.nodes[0].name = refinement.name;
      end.item.fieldValues.nodes[0].optionId = refinement.id;
    },
    (end) => { end.project.fields.nodes[0].options[0].description = "moved"; },
    (end) => { end.project.fields.nodes[0].options.push(statusOption("Refinement")); },
    (end) => { end.project.items.nodes.push(projectItem("PVTI_other", "I_other")); },
    (end) => { end.project.fields.nodes.push({ id: "PVTF_other", name: "Other" }); },
    (end) => {
      end.project.fields.nodes.push({ id: "PVTF_other", name: "Other" });
      end.item.fieldValues.nodes.push({ __typename: "ProjectV2ItemFieldTextValue", id: "PVTFV_other", field: { id: "PVTF_other" }, text: null });
    },
  ];
  for (const mutate of mutations) {
    const fixture = transportFixture();
    mutate(fixture.end);
    expectCode(await observePlanning(expectedEnvelope(), { transport: fixture.transport }), "OBSERVATION_DRIFT");
  }
});

test("semantic movement in every supported field-value variant is observation drift", async () => {
  const cases = [
    ["User", (value) => { value.users.nodes.push({ id: "M_3" }); }],
    ["Repository", (value) => { value.repository.id = "R_moved"; }],
    ["Label", (value) => { value.labels.nodes.push({ id: "L_M_3" }); }],
    ["PullRequest", (value) => { value.pullRequests.nodes.push({ id: "PR_M_3" }); }],
    ["Text", (value) => { value.text = "moved"; }],
  ];
  for (const [kind, mutate] of cases) {
    const fixture = transportFixture();
    addOptionalValue(fixture.start, kind);
    const endValue = addOptionalValue(fixture.end, kind);
    mutate(endValue);
    expectCode(await observePlanning(expectedEnvelope(), { transport: fixture.transport }), "OBSERVATION_DRIFT");
  }

  const singleSelect = transportFixture();
  const refinement = statusOption("Refinement");
  singleSelect.end.project.fields.nodes[0].options.push(refinement);
  singleSelect.end.item.fieldValues.nodes[0].name = refinement.name;
  singleSelect.end.item.fieldValues.nodes[0].optionId = refinement.id;
  expectCode(await observePlanning(expectedEnvelope(), { transport: singleSelect.transport }), "OBSERVATION_DRIFT");
});

test("field-value payloads and mismatched identities remain redacted in diagnostics", async () => {
  const textDrift = transportFixture();
  const startText = addOptionalValue(textDrift.start, "Text");
  const endText = addOptionalValue(textDrift.end, "Text");
  startText.text = "SECRET_START_TEXT_PAYLOAD";
  endText.text = "SECRET_END_TEXT_PAYLOAD";
  expectCode(
    await observePlanning(expectedEnvelope(), { transport: textDrift.transport }),
    "OBSERVATION_DRIFT",
    ["SECRET_START_TEXT_PAYLOAD", "SECRET_END_TEXT_PAYLOAD"],
  );

  const mismatch = transportFixture();
  mismatch.start.repository.id = "SECRET_REPOSITORY_ID";
  expectCode(
    await observePlanning(expectedEnvelope(), { transport: mismatch.transport }),
    "REPOSITORY_ID_MISMATCH",
    ["SECRET_REPOSITORY_ID", "R_repo"],
  );
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
