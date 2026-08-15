import { fingerprintObservation, providerDiagnostic } from "./planning-contract.mjs";

export const QUERY_DOCUMENTS = Object.freeze({
  start: `query PlanningObservationStart($repositoryId: ID!, $issueId: ID!, $projectId: ID!, $itemId: ID!, $statusFieldId: ID!, $pageSize: Int!) {
    repository: node(id: $repositoryId) { id ... on Repository { nameWithOwner } }
    issue: node(id: $issueId) { id ... on Issue { number state body updatedAt } }
    project: node(id: $projectId) { id ... on ProjectV2 {
      items(first: $pageSize) { nodes { id content { __typename ... on Issue { id } ... on PullRequest { id } ... on DraftIssue { id } } } pageInfo { hasNextPage endCursor } }
      fields(first: $pageSize) { nodes { ... on ProjectV2FieldCommon { id name } ... on ProjectV2SingleSelectField { options { id name color description } } } pageInfo { hasNextPage endCursor } }
    } }
    item: node(id: $itemId) { id ... on ProjectV2Item { content { __typename ... on Issue { id } } fieldValues(first: $pageSize) { nodes { __typename ... on ProjectV2ItemFieldValueCommon { id field { ... on ProjectV2FieldCommon { id } } } ... on ProjectV2ItemFieldSingleSelectValue { name optionId } } pageInfo { hasNextPage endCursor } } } }
    statusField: node(id: $statusFieldId) { id ... on ProjectV2SingleSelectField { name options { id name color description } } }
  }`,
  items: `query PlanningObservationItems($projectId: ID!, $cursor: String!, $pageSize: Int!) {
    project: node(id: $projectId) { ... on ProjectV2 { items(first: $pageSize, after: $cursor) { nodes { id content { __typename ... on Issue { id } ... on PullRequest { id } ... on DraftIssue { id } } } pageInfo { hasNextPage endCursor } } } }
  }`,
  fields: `query PlanningObservationFields($projectId: ID!, $cursor: String!, $pageSize: Int!) {
    project: node(id: $projectId) { ... on ProjectV2 { fields(first: $pageSize, after: $cursor) { nodes { ... on ProjectV2FieldCommon { id name } ... on ProjectV2SingleSelectField { options { id name color description } } } pageInfo { hasNextPage endCursor } } } }
  }`,
  values: `query PlanningObservationValues($itemId: ID!, $cursor: String!, $pageSize: Int!) {
    item: node(id: $itemId) { ... on ProjectV2Item { fieldValues(first: $pageSize, after: $cursor) { nodes { __typename ... on ProjectV2ItemFieldValueCommon { id field { ... on ProjectV2FieldCommon { id } } } ... on ProjectV2ItemFieldSingleSelectValue { name optionId } } pageInfo { hasNextPage endCursor } } } }
  }`,
  end: `query PlanningObservationEnd($repositoryId: ID!, $issueId: ID!, $projectId: ID!, $itemId: ID!, $statusFieldId: ID!, $pageSize: Int!) {
    repository: node(id: $repositoryId) { id }
    issue: node(id: $issueId) { id ... on Issue { number state body updatedAt } }
    project: node(id: $projectId) { id ... on ProjectV2 {
      items(first: $pageSize) { nodes { id content { __typename ... on Issue { id } ... on PullRequest { id } ... on DraftIssue { id } } } pageInfo { hasNextPage endCursor } }
      fields(first: $pageSize) { nodes { ... on ProjectV2FieldCommon { id name } ... on ProjectV2SingleSelectField { options { id name color description } } } pageInfo { hasNextPage endCursor } }
    } }
    item: node(id: $itemId) { id ... on ProjectV2Item { content { __typename ... on Issue { id } } fieldValues(first: $pageSize) { nodes { __typename ... on ProjectV2ItemFieldValueCommon { id field { ... on ProjectV2FieldCommon { id } } } ... on ProjectV2ItemFieldSingleSelectValue { name optionId } } pageInfo { hasNextPage endCursor } } } }
    statusField: node(id: $statusFieldId) { id ... on ProjectV2SingleSelectField { name options { id name color description } } }
  }`,
});

const DEFAULT_LIMITS = Object.freeze({ pageSize: 100, pages: 100, items: 10_000, fields: 1_000, values: 1_000, bodyBytes: 1_000_000 });

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function inaccessible() {
  return providerDiagnostic("PROVIDER_INACCESSIBLE", "provider", "constant:redacted");
}

async function request(transport, query, variables) {
  try {
    const response = await transport({ query, variables });
    if (!isRecord(response) || (Array.isArray(response.errors) && response.errors.length > 0) || !isRecord(response.data)) return inaccessible();
    return { ok: true, value: response.data };
  } catch {
    return inaccessible();
  }
}

function pageFailure(component, pageInfo) {
  if (!isRecord(pageInfo) || typeof pageInfo.hasNextPage !== "boolean") return providerDiagnostic("PAGINATION_INCOMPLETE", "connection", `component:${component}`);
  if (pageInfo.hasNextPage && (typeof pageInfo.endCursor !== "string" || pageInfo.endCursor.length === 0)) return providerDiagnostic("PAGINATION_INCOMPLETE", "connection", `component:${component}`);
  return null;
}

async function exhaustConnection({ transport, query, variables, initial, component, nodePath, limitName, limit, pageLimit }) {
  const nodes = [];
  let connection = initial;
  let pages = 0;
  for (;;) {
    pages += 1;
    const closure = pageFailure(component, connection?.pageInfo);
    if (closure) return closure;
    if (!Array.isArray(connection.nodes)) return inaccessible();
    if (nodes.length + connection.nodes.length > limit) return providerDiagnostic("OBSERVATION_LIMIT", "limit", `limit:${limitName}:${nodes.length + connection.nodes.length}/${limit}`);
    nodes.push(...connection.nodes);
    if (!connection.pageInfo.hasNextPage) return { ok: true, value: nodes };
    if (pages >= pageLimit) return providerDiagnostic("OBSERVATION_LIMIT", "limit", `limit:pages:${pages}/${pageLimit}`);
    const response = await request(transport, query, { ...variables, cursor: connection.pageInfo.endCursor });
    if (!response.ok) return response;
    connection = nodePath(response.value);
  }
}

function selectedStatus(values, fieldId) {
  return values.filter((value) => value?.field?.id === fieldId && value?.__typename === "ProjectV2ItemFieldSingleSelectValue" && typeof value.name === "string" && typeof value.optionId === "string");
}

function compareTuple(left, right, fields) {
  for (const field of fields) {
    const order = Buffer.compare(Buffer.from(left[field]), Buffer.from(right[field]));
    if (order !== 0) return order;
  }
  return 0;
}

function closureSummary(items, fields, values, itemId, statusFieldId, statusValue) {
  const itemRecords = items.map((entry) => ({ itemId: entry.id, contentId: entry.content.id }))
    .sort((left, right) => compareTuple(left, right, ["itemId", "contentId"]));
  const fieldRecords = fields.map((field) => ({
    fieldId: field.id,
    name: field.name,
    options: (field.options ?? []).map((option) => ({ optionId: option.id, name: option.name, color: option.color, description: option.description }))
      .sort((left, right) => compareTuple(left, right, ["optionId", "name"])),
  })).sort((left, right) => compareTuple(left, right, ["fieldId", "name"]));
  const valueRecords = values.map((value) => ({ fieldId: value.field.id, valueType: value.__typename, valueIdentity: value.id }))
    .sort((left, right) => compareTuple(left, right, ["fieldId", "valueType", "valueIdentity"]));
  return {
    items: itemRecords,
    fields: fieldRecords,
    values: valueRecords,
    selectedStatus: { itemId, statusFieldId, optionId: statusValue.optionId, name: statusValue.name },
  };
}

function stableProjection({ repository, issue, project, closure }) {
  return {
    repositoryId: repository.id,
    issue: { id: issue.id, number: issue.number, state: issue.state, body: issue.body, updatedAt: issue.updatedAt },
    projectId: project.id,
    closure,
  };
}

function identityResult(code, field, actual, expected) {
  const hash = (value) => `sha256:${fingerprintObservation(value)}`;
  return providerDiagnostic(code, field, `pair:${hash(actual)}/${hash(expected)}`);
}

function validClosureNodes(items, fields, values) {
  return items.every((entry) => typeof entry?.id === "string" && typeof entry?.content?.id === "string") &&
    fields.every((field) => typeof field?.id === "string" && typeof field?.name === "string" && (field.options === undefined || (Array.isArray(field.options) && field.options.every((option) => [option?.id, option?.name, option?.color, option?.description].every((value) => typeof value === "string"))))) &&
    values.every((value) => typeof value?.id === "string" && typeof value?.__typename === "string" && typeof value?.field?.id === "string");
}

function validateClosure({ items, fields, values, item, expected, end = false }) {
  if (!validClosureNodes(items, fields, values)) return inaccessible();
  const boundItems = items.filter((candidate) => candidate.content.id === expected.issueId);
  if (boundItems.length > 1) return providerDiagnostic("PROJECT_ITEM_DUPLICATE", "projectItem", `count:${boundItems.length}`);
  if (boundItems.length !== 1) return providerDiagnostic("IDENTITY_AMBIGUOUS", "identity", `count:${boundItems.length}`);
  if (boundItems[0].id !== expected.itemId) return identityResult("ITEM_ID_MISMATCH", "itemId", boundItems[0].id, expected.itemId);
  if (item.content?.id !== expected.issueId) return end ? providerDiagnostic("IDENTITY_AMBIGUOUS", "identity", "count:0") : identityResult("ISSUE_ID_MISMATCH", "issueId", item.content?.id, expected.issueId);
  const matchingFields = fields.filter((field) => field.id === expected.statusFieldId);
  if (matchingFields.length !== 1) return providerDiagnostic("IDENTITY_AMBIGUOUS", "identity", `count:${matchingFields.length}`);
  const selected = selectedStatus(values, expected.statusFieldId);
  if (selected.length !== 1) return providerDiagnostic("IDENTITY_AMBIGUOUS", "identity", `count:${selected.length}`);
  const matchingOptions = (matchingFields[0].options ?? []).filter((option) => option.id === selected[0].optionId);
  if (matchingOptions.length !== 1) return providerDiagnostic("IDENTITY_AMBIGUOUS", "identity", `count:${matchingOptions.length}`);
  return { ok: true, value: { selected: selected[0], selectedOption: matchingOptions[0], summary: closureSummary(items, fields, values, item.id, matchingFields[0].id, selected[0]) } };
}

async function enumerateClosure(transport, data, expected, limits, prefix) {
  const [items, fields, values] = await Promise.all([
    exhaustConnection({ transport, query: QUERY_DOCUMENTS.items, variables: { projectId: expected.projectId, pageSize: limits.pageSize }, initial: data.project.items, component: `${prefix}-project-items`, nodePath: (page) => page.project?.items, limitName: "items", limit: limits.items, pageLimit: limits.pages }),
    exhaustConnection({ transport, query: QUERY_DOCUMENTS.fields, variables: { projectId: expected.projectId, pageSize: limits.pageSize }, initial: data.project.fields, component: `${prefix}-project-fields`, nodePath: (page) => page.project?.fields, limitName: "fields", limit: limits.fields, pageLimit: limits.pages }),
    exhaustConnection({ transport, query: QUERY_DOCUMENTS.values, variables: { itemId: expected.itemId, pageSize: limits.pageSize }, initial: data.item.fieldValues, component: `${prefix}-item-field-values`, nodePath: (page) => page.item?.fieldValues, limitName: "values", limit: limits.values, pageLimit: limits.pages }),
  ]);
  for (const result of [items, fields, values]) if (!result.ok) return result;
  return { ok: true, value: { items: items.value, fields: fields.value, values: values.value } };
}

export async function observePlanning(expectedEnvelope, options) {
  if (!isRecord(options) || typeof options.transport !== "function") return inaccessible();
  const expected = expectedEnvelope?.expected;
  const runtime = expectedEnvelope?.runtime;
  if (!isRecord(expected) || !isRecord(runtime)) return inaccessible();
  const limits = Object.freeze({ ...DEFAULT_LIMITS, ...(options.limits ?? {}) });
  const variables = {
    repositoryId: expected.repositoryId,
    issueId: expected.issueId,
    projectId: expected.projectId,
    itemId: expected.itemId,
    statusFieldId: expected.statusFieldId,
    pageSize: limits.pageSize,
  };
  const start = await request(options.transport, QUERY_DOCUMENTS.start, variables);
  if (!start.ok) return start;
  const { repository, issue, project, item, statusField } = start.value;
  if (![repository, issue, project, item, statusField].every(isRecord)) return inaccessible();
  if (Buffer.byteLength(issue.body ?? "", "utf8") > limits.bodyBytes) return providerDiagnostic("OBSERVATION_LIMIT", "limit", `limit:body-bytes:${Buffer.byteLength(issue.body ?? "", "utf8")}/${limits.bodyBytes}`);

  const identityChecks = [
    ["REPOSITORY_ID_MISMATCH", "repositoryId", repository.id, expected.repositoryId],
    ["PROJECT_ID_MISMATCH", "projectId", project.id, expected.projectId],
    ["ISSUE_ID_MISMATCH", "issueId", issue.id, expected.issueId],
    ["ITEM_ID_MISMATCH", "itemId", item.id, expected.itemId],
    ["STATUS_FIELD_ID_MISMATCH", "statusFieldId", statusField.id, expected.statusFieldId],
  ];
  for (const [code, field, actual, wanted] of identityChecks) if (actual !== wanted) return identityResult(code, field, actual, wanted);

  const startEnumeration = await enumerateClosure(options.transport, { project, item }, expected, limits, "start");
  if (!startEnumeration.ok) return startEnumeration;
  const startClosure = validateClosure({ ...startEnumeration.value, item, expected });
  if (!startClosure.ok) return startClosure;
  const startProjection = stableProjection({ repository, issue, project, closure: startClosure.value.summary });
  const startFingerprint = fingerprintObservation(startProjection);
  const end = await request(options.transport, QUERY_DOCUMENTS.end, variables);
  if (!end.ok) return end;
  const endData = end.value;
  if (![endData.repository, endData.issue, endData.project, endData.item, endData.statusField].every(isRecord)) return inaccessible();
  for (const [code, field, actual, wanted] of [
    ["REPOSITORY_ID_MISMATCH", "repositoryId", endData.repository.id, expected.repositoryId],
    ["PROJECT_ID_MISMATCH", "projectId", endData.project.id, expected.projectId],
    ["ISSUE_ID_MISMATCH", "issueId", endData.issue.id, expected.issueId],
    ["ITEM_ID_MISMATCH", "itemId", endData.item.id, expected.itemId],
    ["STATUS_FIELD_ID_MISMATCH", "statusFieldId", endData.statusField.id, expected.statusFieldId],
  ]) if (actual !== wanted) return identityResult(code, field, actual, wanted);
  if (Buffer.byteLength(endData.issue.body ?? "", "utf8") > limits.bodyBytes) return providerDiagnostic("OBSERVATION_LIMIT", "limit", `limit:body-bytes:${Buffer.byteLength(endData.issue.body ?? "", "utf8")}/${limits.bodyBytes}`);
  const endEnumeration = await enumerateClosure(options.transport, endData, expected, limits, "end");
  if (!endEnumeration.ok) return endEnumeration;
  const endClosure = validateClosure({ ...endEnumeration.value, item: endData.item, expected, end: true });
  if (!endClosure.ok) return endClosure;
  const endProjection = stableProjection({ repository: endData.repository, issue: endData.issue, project: endData.project, closure: endClosure.value.summary });
  const endFingerprint = fingerprintObservation(endProjection);
  if (startFingerprint !== endFingerprint) return providerDiagnostic("OBSERVATION_DRIFT", "fingerprint", "component:observation");

  const selectedOption = startClosure.value.selectedOption;
  return {
    ok: true,
    value: {
      runtime: structuredClone(runtime),
      expected: structuredClone(expected),
      issue: { id: issue.id, number: issue.number, state: issue.state, body: issue.body, updatedAt: issue.updatedAt },
      project: { repositoryId: repository.id, id: project.id, itemId: item.id, statusFieldId: statusField.id, status: { name: selectedOption.name, color: selectedOption.color, description: selectedOption.description } },
      window: { paginationComplete: true, startFingerprint, endFingerprint, provider: { identityCandidates: 1, projectItemCount: 1 } },
    },
  };
}

export function createGithubTransport({ token, endpoint = "https://api.github.com/graphql", fetchImpl = globalThis.fetch }) {
  if (typeof token !== "string" || token.length === 0 || typeof fetchImpl !== "function") throw new TypeError("A token and fetch implementation are required.");
  return async ({ query, variables }) => {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: { authorization: `bearer ${token}`, "content-type": "application/json", "user-agent": "ai4x-planning-observer" },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) throw new Error("GitHub observation failed.");
    return response.json();
  };
}
