import { canonicalJson, fingerprintObservation, providerDiagnostic } from "./planning-contract.mjs";

const FIELD_VALUE_SELECTION = `
  __typename
  ... on ProjectV2ItemFieldUserValue {
    field { ... on ProjectV2FieldCommon { id } }
    users(first: $pageSize) { nodes { id } pageInfo { hasNextPage endCursor } }
  }
  ... on ProjectV2ItemFieldRepositoryValue {
    field { ... on ProjectV2FieldCommon { id } }
    repository { id }
  }
  ... on ProjectV2ItemFieldLabelValue {
    field { ... on ProjectV2FieldCommon { id } }
    labels(first: $pageSize) { nodes { id } pageInfo { hasNextPage endCursor } }
  }
  ... on ProjectV2ItemFieldTextValue {
    id
    field { ... on ProjectV2FieldCommon { id } }
    text
  }
  ... on ProjectV2ItemFieldSingleSelectValue {
    id
    field { ... on ProjectV2FieldCommon { id } }
    name
    optionId
  }`;

export const QUERY_DOCUMENTS = Object.freeze({
  start: `query PlanningObservationStart($repositoryId: ID!, $issueId: ID!, $projectId: ID!, $itemId: ID!, $statusFieldId: ID!, $pageSize: Int!) {
    repository: node(id: $repositoryId) { __typename id ... on Repository { nameWithOwner } }
    issue: node(id: $issueId) { id ... on Issue { number state body updatedAt } }
    project: node(id: $projectId) { id ... on ProjectV2 {
      items(first: $pageSize) { nodes { id content { __typename ... on Issue { id } ... on PullRequest { id } ... on DraftIssue { id } } } pageInfo { hasNextPage endCursor } }
      fields(first: $pageSize) { nodes { ... on ProjectV2FieldCommon { id name } ... on ProjectV2SingleSelectField { options { id name color description } } } pageInfo { hasNextPage endCursor } }
    } }
    item: node(id: $itemId) { id ... on ProjectV2Item { content { __typename ... on Issue { id } } fieldValues(first: $pageSize) { edges { cursor node { ${FIELD_VALUE_SELECTION} } } pageInfo { hasNextPage endCursor } } } }
    statusField: node(id: $statusFieldId) { id ... on ProjectV2SingleSelectField { name options { id name color description } } }
  }`,
  items: `query PlanningObservationItems($projectId: ID!, $cursor: String!, $pageSize: Int!) {
    project: node(id: $projectId) { ... on ProjectV2 { items(first: $pageSize, after: $cursor) { nodes { id content { __typename ... on Issue { id } ... on PullRequest { id } ... on DraftIssue { id } } } pageInfo { hasNextPage endCursor } } } }
  }`,
  fields: `query PlanningObservationFields($projectId: ID!, $cursor: String!, $pageSize: Int!) {
    project: node(id: $projectId) { ... on ProjectV2 { fields(first: $pageSize, after: $cursor) { nodes { ... on ProjectV2FieldCommon { id name } ... on ProjectV2SingleSelectField { options { id name color description } } } pageInfo { hasNextPage endCursor } } } }
  }`,
  values: `query PlanningObservationValues($itemId: ID!, $cursor: String!, $pageSize: Int!) {
    item: node(id: $itemId) { ... on ProjectV2Item { fieldValues(first: $pageSize, after: $cursor) { edges { cursor node { ${FIELD_VALUE_SELECTION} } } pageInfo { hasNextPage endCursor } } } }
  }`,
  userMembers: `query PlanningObservationUserMembers($itemId: ID!, $valueAfter: String, $memberCursor: String!, $pageSize: Int!) {
    item: node(id: $itemId) { ... on ProjectV2Item { fieldValues(first: 1, after: $valueAfter) { edges { cursor node { __typename ... on ProjectV2ItemFieldUserValue { field { ... on ProjectV2FieldCommon { id } } users(first: $pageSize, after: $memberCursor) { nodes { id } pageInfo { hasNextPage endCursor } } } } } } } }
  }`,
  labelMembers: `query PlanningObservationLabelMembers($itemId: ID!, $valueAfter: String, $memberCursor: String!, $pageSize: Int!) {
    item: node(id: $itemId) { ... on ProjectV2Item { fieldValues(first: 1, after: $valueAfter) { edges { cursor node { __typename ... on ProjectV2ItemFieldLabelValue { field { ... on ProjectV2FieldCommon { id } } labels(first: $pageSize, after: $memberCursor) { nodes { id } pageInfo { hasNextPage endCursor } } } } } } } }
  }`,
  end: `query PlanningObservationEnd($repositoryId: ID!, $issueId: ID!, $projectId: ID!, $itemId: ID!, $statusFieldId: ID!, $pageSize: Int!) {
    repository: node(id: $repositoryId) { __typename id }
    issue: node(id: $issueId) { id ... on Issue { number state body updatedAt } }
    project: node(id: $projectId) { id ... on ProjectV2 {
      items(first: $pageSize) { nodes { id content { __typename ... on Issue { id } ... on PullRequest { id } ... on DraftIssue { id } } } pageInfo { hasNextPage endCursor } }
      fields(first: $pageSize) { nodes { ... on ProjectV2FieldCommon { id name } ... on ProjectV2SingleSelectField { options { id name color description } } } pageInfo { hasNextPage endCursor } }
    } }
    item: node(id: $itemId) { id ... on ProjectV2Item { content { __typename ... on Issue { id } } fieldValues(first: $pageSize) { edges { cursor node { ${FIELD_VALUE_SELECTION} } } pageInfo { hasNextPage endCursor } } } }
    statusField: node(id: $statusFieldId) { id ... on ProjectV2SingleSelectField { name options { id name color description } } }
  }`,
});

const DEFAULT_LIMITS = Object.freeze({ pageSize: 100, pages: 100, items: 10_000, fields: 1_000, values: 1_000, users: 1_000, labels: 1_000, bodyBytes: 1_000_000 });

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

async function exhaustConnection({ transport, query, variables, initial, component, nodePath, limitName, limit, pageLimit, cursorName = "cursor" }) {
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
    const response = await request(transport, query, { ...variables, [cursorName]: connection.pageInfo.endCursor });
    if (!response.ok) return response;
    connection = nodePath(response.value);
  }
}

async function exhaustFieldValues({ transport, initial, itemId, limits, component }) {
  const values = [];
  const cursors = new Set();
  let connection = initial;
  let pages = 0;
  let valueAfter = null;
  for (;;) {
    pages += 1;
    const closure = pageFailure(component, connection?.pageInfo);
    if (closure) return closure;
    if (!Array.isArray(connection.edges)) return inaccessible();
    if (values.length + connection.edges.length > limits.values) return providerDiagnostic("OBSERVATION_LIMIT", "limit", `limit:values:${values.length + connection.edges.length}/${limits.values}`);
    for (const edge of connection.edges) {
      if (!isRecord(edge) || typeof edge.cursor !== "string" || edge.cursor.length === 0 || !isRecord(edge.node)) return inaccessible();
      if (cursors.has(edge.cursor)) return providerDiagnostic("IDENTITY_AMBIGUOUS", "identity", "count:2");
      cursors.add(edge.cursor);
      values.push({ node: edge.node, locator: { after: valueAfter, cursor: edge.cursor } });
      valueAfter = edge.cursor;
    }
    if (!connection.pageInfo.hasNextPage) return { ok: true, value: values };
    if (connection.edges.length > 0 && valueAfter !== connection.pageInfo.endCursor) return providerDiagnostic("PAGINATION_INCOMPLETE", "connection", `component:${component}`);
    valueAfter = connection.pageInfo.endCursor;
    if (pages >= limits.pages) return providerDiagnostic("OBSERVATION_LIMIT", "limit", `limit:pages:${pages}/${limits.pages}`);
    const response = await request(transport, QUERY_DOCUMENTS.values, { itemId, cursor: connection.pageInfo.endCursor, pageSize: limits.pageSize });
    if (!response.ok) return response;
    connection = response.value.item?.fieldValues;
  }
}

function nestedMemberConnection(data, locator, typename, fieldId, connectionName) {
  const edges = data.item?.fieldValues?.edges;
  if (!Array.isArray(edges) || edges.length !== 1) return undefined;
  const [edge] = edges;
  if (!isRecord(edge) || edge.cursor !== locator.cursor || edge.node?.__typename !== typename || edge.node?.field?.id !== fieldId) return undefined;
  return edge.node[connectionName];
}

function memberIds(nodes) {
  if (!nodes.every((member) => isRecord(member) && typeof member.id === "string" && member.id.length > 0)) return inaccessible();
  const ids = nodes.map(({ id }) => id).sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)));
  for (let index = 0; index < ids.length;) {
    let next = index + 1;
    while (next < ids.length && ids[next] === ids[index]) next += 1;
    if (next - index > 1) return providerDiagnostic("IDENTITY_AMBIGUOUS", "identity", `count:${next - index}`);
    index = next;
  }
  return { ok: true, value: ids };
}

async function exhaustNestedMembers({ transport, entry, limits, prefix, typename, connectionName, query, limitName }) {
  const fieldId = entry.node.field?.id;
  if (typeof fieldId !== "string" || fieldId.length === 0 || !isRecord(entry.node[connectionName])) return inaccessible();
  const members = await exhaustConnection({
    transport,
    query,
    variables: { itemId: entry.itemId, valueAfter: entry.locator.after, pageSize: limits.pageSize },
    initial: entry.node[connectionName],
    component: `${prefix}-${limitName}-members`,
    nodePath: (data) => nestedMemberConnection(data, entry.locator, typename, fieldId, connectionName),
    limitName,
    limit: limits[limitName],
    pageLimit: limits.pages,
    cursorName: "memberCursor",
  });
  if (!members.ok) return members;
  return memberIds(members.value);
}

async function normalizeFieldValues(transport, entries, itemId, limits, prefix) {
  const values = [];
  for (const located of entries) {
    const entry = { ...located, itemId };
    const value = entry.node;
    const fieldId = value.field?.id;
    if (typeof value.__typename !== "string" || typeof fieldId !== "string" || fieldId.length === 0) return inaccessible();
    if (value.__typename === "ProjectV2ItemFieldUserValue") {
      const users = await exhaustNestedMembers({ transport, entry, limits, prefix, typename: value.__typename, connectionName: "users", query: QUERY_DOCUMENTS.userMembers, limitName: "users" });
      if (!users.ok) return users;
      values.push({ valueType: value.__typename, fieldId, userIds: users.value });
    } else if (value.__typename === "ProjectV2ItemFieldRepositoryValue") {
      if (typeof value.repository?.id !== "string" || value.repository.id.length === 0) return inaccessible();
      values.push({ valueType: value.__typename, fieldId, repositoryId: value.repository.id });
    } else if (value.__typename === "ProjectV2ItemFieldLabelValue") {
      const labels = await exhaustNestedMembers({ transport, entry, limits, prefix, typename: value.__typename, connectionName: "labels", query: QUERY_DOCUMENTS.labelMembers, limitName: "labels" });
      if (!labels.ok) return labels;
      values.push({ valueType: value.__typename, fieldId, labelIds: labels.value });
    } else if (value.__typename === "ProjectV2ItemFieldTextValue") {
      if (typeof value.id !== "string" || value.id.length === 0 || !Object.hasOwn(value, "text") || (value.text !== null && typeof value.text !== "string")) return inaccessible();
      values.push({ valueType: value.__typename, fieldId, valueIdentity: value.id, text: value.text });
    } else if (value.__typename === "ProjectV2ItemFieldSingleSelectValue") {
      if ([value.id, value.name, value.optionId].some((part) => typeof part !== "string" || part.length === 0)) return inaccessible();
      values.push({ valueType: value.__typename, fieldId, valueIdentity: value.id, name: value.name, optionId: value.optionId });
    } else {
      return inaccessible();
    }
  }
  const identities = values.map(({ fieldId }) => canonicalJson(fieldId)).sort();
  for (let index = 0; index < identities.length;) {
    let next = index + 1;
    while (next < identities.length && identities[next] === identities[index]) next += 1;
    if (next - index > 1) return providerDiagnostic("IDENTITY_AMBIGUOUS", "identity", `count:${next - index}`);
    index = next;
  }
  return { ok: true, value: values };
}

function selectedStatus(values, fieldId) {
  return values.filter((value) => value.fieldId === fieldId && value.valueType === "ProjectV2ItemFieldSingleSelectValue");
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
  const valueRecords = values.map((value) => structuredClone(value))
    .sort((left, right) => Buffer.compare(Buffer.from(canonicalJson(left)), Buffer.from(canonicalJson(right))));
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

function validClosureNodes(items, fields) {
  return items.every((entry) => typeof entry?.id === "string" && typeof entry?.content?.id === "string") &&
    fields.every((field) => typeof field?.id === "string" && typeof field?.name === "string" && (field.options === undefined || (Array.isArray(field.options) && field.options.every((option) => [option?.id, option?.name, option?.color, option?.description].every((value) => typeof value === "string")))));
}

function validateClosure({ items, fields, values, item, expected, end = false }) {
  if (!validClosureNodes(items, fields)) return inaccessible();
  const fieldIds = fields.map(({ id }) => id).sort();
  for (let index = 1; index < fieldIds.length; index += 1) {
    if (fieldIds[index] === fieldIds[index - 1]) return providerDiagnostic("IDENTITY_AMBIGUOUS", "identity", "count:2");
  }
  const boundItems = items.filter((candidate) => candidate.content.id === expected.issueId);
  if (boundItems.length > 1) return providerDiagnostic("PROJECT_ITEM_DUPLICATE", "projectItem", `count:${boundItems.length}`);
  if (boundItems.length !== 1) return providerDiagnostic("IDENTITY_AMBIGUOUS", "identity", `count:${boundItems.length}`);
  const itemIds = items.map(({ id }) => id).sort();
  for (let index = 1; index < itemIds.length; index += 1) {
    if (itemIds[index] === itemIds[index - 1]) return providerDiagnostic("IDENTITY_AMBIGUOUS", "identity", "count:2");
  }
  for (const field of fields) {
    const optionIds = (field.options ?? []).map(({ id }) => id).sort();
    for (let index = 1; index < optionIds.length; index += 1) {
      if (optionIds[index] === optionIds[index - 1]) return providerDiagnostic("IDENTITY_AMBIGUOUS", "identity", "count:2");
    }
  }
  if (boundItems[0].id !== expected.itemId) return identityResult("ITEM_ID_MISMATCH", "itemId", boundItems[0].id, expected.itemId);
  if (item.content?.id !== expected.issueId) return end ? providerDiagnostic("IDENTITY_AMBIGUOUS", "identity", "count:0") : identityResult("ISSUE_ID_MISMATCH", "issueId", item.content?.id, expected.issueId);
  const matchingFields = fields.filter((field) => field.id === expected.statusFieldId);
  if (matchingFields.length !== 1) return providerDiagnostic("IDENTITY_AMBIGUOUS", "identity", `count:${matchingFields.length}`);
  if (!values.every(({ fieldId }) => fieldIds.includes(fieldId))) return inaccessible();
  const selected = selectedStatus(values, expected.statusFieldId);
  if (selected.length !== 1) return providerDiagnostic("IDENTITY_AMBIGUOUS", "identity", `count:${selected.length}`);
  const matchingOptions = (matchingFields[0].options ?? []).filter((option) => option.id === selected[0].optionId);
  if (matchingOptions.length !== 1) return providerDiagnostic("IDENTITY_AMBIGUOUS", "identity", `count:${matchingOptions.length}`);
  if (matchingOptions[0].name !== selected[0].name) return inaccessible();
  return { ok: true, value: { selected: selected[0], selectedOption: matchingOptions[0], summary: closureSummary(items, fields, values, item.id, matchingFields[0].id, selected[0]) } };
}

async function enumerateClosure(transport, data, expected, limits, prefix) {
  const [items, fields, valueEntries] = await Promise.all([
    exhaustConnection({ transport, query: QUERY_DOCUMENTS.items, variables: { projectId: expected.projectId, pageSize: limits.pageSize }, initial: data.project.items, component: `${prefix}-project-items`, nodePath: (page) => page.project?.items, limitName: "items", limit: limits.items, pageLimit: limits.pages }),
    exhaustConnection({ transport, query: QUERY_DOCUMENTS.fields, variables: { projectId: expected.projectId, pageSize: limits.pageSize }, initial: data.project.fields, component: `${prefix}-project-fields`, nodePath: (page) => page.project?.fields, limitName: "fields", limit: limits.fields, pageLimit: limits.pages }),
    exhaustFieldValues({ transport, initial: data.item.fieldValues, itemId: expected.itemId, limits, component: `${prefix}-item-field-values` }),
  ]);
  for (const result of [items, fields, valueEntries]) if (!result.ok) return result;
  const values = await normalizeFieldValues(transport, valueEntries.value, expected.itemId, limits, prefix);
  if (!values.ok) return values;
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
  if (repository.__typename !== "Repository") return inaccessible();
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
  if (endData.repository.__typename !== "Repository") return inaccessible();
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
