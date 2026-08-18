const AXES = Object.freeze(["level", "kind", "topic", "aspect", "signal"]);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COLOR_PATTERN = /^[0-9A-F]{6}$/;
const MAX_DESCRIPTION_LENGTH = 100;

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireClosedKeys(value, expected, subject) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    throw new Error(`${subject} keys must be exactly: ${wanted.join(", ")}`);
  }
}

export function labelRecordsFromConfig(config) {
  if (!isRecord(config)) {
    throw new Error("labels must be a map");
  }
  requireClosedKeys(config, AXES, "label axes");

  const records = [];
  for (const axis of AXES) {
    const entry = config[axis];
    if (!isRecord(entry)) {
      throw new Error(`label axis '${axis}' must be a map`);
    }
    const entryKeys = Object.keys(entry);
    if (!entryKeys.includes("color") || !entryKeys.includes("values") || entryKeys.some((key) => !["color", "values", "overrides"].includes(key))) {
      throw new Error(`label axis '${axis}' keys must be color, values, and optional overrides`);
    }

    if (typeof entry.color !== "string" || !COLOR_PATTERN.test(entry.color)) {
      throw new Error(`label axis '${axis}' color must be six uppercase hexadecimal characters`);
    }
    if (!isRecord(entry.values) || Object.keys(entry.values).length === 0) {
      throw new Error(`label axis '${axis}' values must be a non-empty map`);
    }
    const overrides = entry.overrides ?? {};
    if (!isRecord(overrides)) {
      throw new Error(`label axis '${axis}' overrides must be a map`);
    }
    for (const [slug, color] of Object.entries(overrides)) {
      if (!Object.hasOwn(entry.values, slug)) {
        throw new Error(`label axis '${axis}' overrides unknown value '${slug}'`);
      }
      if (typeof color !== "string" || !COLOR_PATTERN.test(color)) {
        throw new Error(`label '${axis}:${slug}' override must be six uppercase hexadecimal characters`);
      }
      if (color === entry.color) {
        throw new Error(`label '${axis}:${slug}' override must differ from its axis color`);
      }
    }

    for (const [slug, description] of Object.entries(entry.values)) {
      if (!SLUG_PATTERN.test(slug)) {
        throw new Error(`label axis '${axis}' contains invalid value '${slug}'`);
      }
      if (typeof description !== "string" || description.trim() !== description || description.length === 0) {
        throw new Error(`label '${axis}:${slug}' requires a non-empty, trimmed description`);
      }
      if (description.length > MAX_DESCRIPTION_LENGTH) {
        throw new Error(`label '${axis}:${slug}' description exceeds ${MAX_DESCRIPTION_LENGTH} characters`);
      }
      records.push(Object.freeze({ name: `${axis}:${slug}`, color: overrides[slug] ?? entry.color, description }));
    }
  }

  return Object.freeze(records.sort((left, right) => left.name.localeCompare(right.name)));
}

function normalizeRemoteRecords(records) {
  if (!Array.isArray(records)) {
    throw new Error("remote labels must be an array");
  }
  const byName = new Map();
  for (const record of records) {
    if (!isRecord(record) || typeof record.name !== "string" || record.name.length === 0) {
      throw new Error("remote label requires a non-empty name");
    }
    const color = typeof record.color === "string" ? record.color.toUpperCase() : "";
    if (!COLOR_PATTERN.test(color)) {
      throw new Error(`remote label '${record.name}' has an invalid color`);
    }
    const description = record.description ?? "";
    if (typeof description !== "string") {
      throw new Error(`remote label '${record.name}' has an invalid description`);
    }
    if (byName.has(record.name)) {
      throw new Error(`remote labels contain duplicate '${record.name}'`);
    }
    byName.set(record.name, Object.freeze({ name: record.name, color, description }));
  }
  return byName;
}

export function diffLabelRecords(expected, observed) {
  if (!Array.isArray(expected)) {
    throw new Error("expected labels must be an array");
  }
  const expectedByName = new Map(expected.map((record) => [record.name, record]));
  if (expectedByName.size !== expected.length) {
    throw new Error("expected labels contain duplicate names");
  }
  const observedByName = normalizeRemoteRecords(observed);

  const missing = [...expectedByName.keys()].filter((name) => !observedByName.has(name)).sort();
  const extra = [...observedByName.keys()].filter((name) => !expectedByName.has(name)).sort();
  const mismatched = [];
  for (const [name, wanted] of expectedByName) {
    const actual = observedByName.get(name);
    if (!actual) continue;
    const fields = [];
    if (actual.color !== wanted.color) fields.push("color");
    if (actual.description !== wanted.description) fields.push("description");
    if (fields.length > 0) mismatched.push(Object.freeze({ name, fields: Object.freeze(fields) }));
  }
  mismatched.sort((left, right) => left.name.localeCompare(right.name));

  return Object.freeze({
    missing: Object.freeze(missing),
    extra: Object.freeze(extra),
    mismatched: Object.freeze(mismatched),
  });
}

export function planLabelReconciliation(expected, observed) {
  const diff = diffLabelRecords(expected, observed);
  if (diff.extra.length > 0) {
    return Object.freeze({ ok: false, reason: "undeclared-labels", diff, operations: Object.freeze([]) });
  }

  const expectedByName = new Map(expected.map((record) => [record.name, record]));
  const operations = [
    ...diff.missing.map((name) => Object.freeze({ action: "create", label: expectedByName.get(name) })),
    ...diff.mismatched.map(({ name }) => Object.freeze({ action: "update", label: expectedByName.get(name) })),
  ].sort((left, right) => left.label.name.localeCompare(right.label.name));

  return Object.freeze({ ok: true, reason: null, diff, operations: Object.freeze(operations) });
}

export const LABEL_AXES = AXES;
