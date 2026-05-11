#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const rootArg = process.argv[2];
const root = rootArg ? path.resolve(rootArg) : path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../../../../../crp/cap");
const capRoot = root;

// --- Schema loading (AC-11, AC-13, AC-14) ---

const schemaPath = process.env.AI4X_SCHEMA_PATH
  ? path.resolve(process.env.AI4X_SCHEMA_PATH)
  : path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../../../../../adm/gdl/dev/schemas/capability-meta.schema.yaml",
    );

if (!fs.existsSync(schemaPath)) {
  process.stderr.write(`[ccp|ERROR]: central schema file not found: ${schemaPath}\n`);
  process.exit(1);
}

let schemaRaw;
try {
  schemaRaw = YAML.parse(fs.readFileSync(schemaPath, "utf8"));
} catch (err) {
  process.stderr.write(`[ccp|ERROR]: central schema file is unparseable: ${schemaPath}: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
}

if (schemaRaw == null || typeof schemaRaw !== "object" || schemaRaw.fields == null) {
  process.stderr.write(`[ccp|ERROR]: central schema file is malformed (missing 'fields' block): ${schemaPath}\n`);
  process.exit(1);
}

const schemaFields = schemaRaw.fields;
const allowedKeys = new Set(Object.keys(schemaFields));
const requiredKeys = Object.entries(schemaFields)
  .filter(([, def]) => def.required === true)
  .map(([name]) => name);

// Derive source entry constraints from schema
const sourcesSchema = schemaFields.sources?.items?.properties ?? {};
const allowedSourceKeys = new Set(Object.keys(sourcesSchema));
const allowedSourceKinds = sourcesSchema.kind?.enum
  ? new Set(sourcesSchema.kind.enum)
  : new Set();

let requiredFail = 0;
let advisoryFail = 0;

function failRequired(message) {
  requiredFail += 1;
  process.stderr.write(`[ccp|ERROR]: [required] ${message}\n`);
}

function failAdvisory(message) {
  advisoryFail += 1;
  process.stderr.write(`[ccp|WARN]: [advisory] ${message}\n`);
}

function parseMeta(metaPath) {
  const raw = fs.readFileSync(metaPath, "utf8");
  const out = YAML.parse(raw);
  if (out == null || typeof out !== "object") {
    throw new Error("YAML did not produce an object");
  }
  for (const key of Object.keys(out)) {
    if (!allowedKeys.has(key)) {
      throw new Error(`unsupported key '${key}'`);
    }
  }
  return out;
}

function validateIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed);
}

function validateSemver(value) {
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(value);
}

function collectCapabilityFiles() {
  const result = [];
  if (!fs.existsSync(capRoot)) {
    return result;
  }
  const stack = [capRoot];
  while (stack.length > 0) {
    const abs = stack.pop();
    if (!abs) {
      continue;
    }
    const entries = fs.readdirSync(abs, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(abs, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".lint") {
          continue;
        }
        stack.push(fullPath);
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }
      if (!entry.name.endsWith(".md")) {
        continue;
      }
      if (entry.name === "index.md") {
        continue;
      }
      result.push(fullPath);
    }
  }
  return result.sort();
}

const metaById = new Map();
const requiresGraph = new Map();
const capabilityFiles = collectCapabilityFiles();

for (const capabilityFile of capabilityFiles) {
  const relativeCapability = path.relative(root, capabilityFile);
  const expectedId = path.basename(capabilityFile, ".md");
  const metaPath = capabilityFile.replace(/\.md$/, ".meta.yaml");

  if (!fs.existsSync(metaPath)) {
    failRequired(`${relativeCapability}: missing metadata file ${path.basename(metaPath)}`);
    continue;
  }

  let parsed;
  try {
    parsed = parseMeta(metaPath);
  } catch (error) {
    failRequired(`${path.relative(root, metaPath)}: ${(error instanceof Error ? error.message : String(error))}`);
    continue;
  }

  for (const key of requiredKeys) {
    if (!Object.prototype.hasOwnProperty.call(parsed, key)) {
      failRequired(`${path.relative(root, metaPath)}: missing required field '${key}'`);
    }
  }

  const id = String(parsed.id ?? "");
  const version = String(parsed.version ?? "");
  const owner = Object.prototype.hasOwnProperty.call(parsed, "owner") ? String(parsed.owner) : "";
  const sources = Array.isArray(parsed.sources) ? parsed.sources : [];

  const requires = Array.isArray(parsed.requires) ? parsed.requires.map(String) : [];
  const conflicts = Array.isArray(parsed.conflicts) ? parsed.conflicts.map(String) : [];
  const doNotUseWhen = Array.isArray(parsed.do_not_use_when) ? parsed.do_not_use_when.map(String) : [];
  const distinguishFrom = Array.isArray(parsed.distinguish_from) ? parsed.distinguish_from : [];

  if (Object.prototype.hasOwnProperty.call(parsed, "requires") && !Array.isArray(parsed.requires)) {
    failRequired(`${path.relative(root, metaPath)}: requires must be an array`);
  }
  if (Object.prototype.hasOwnProperty.call(parsed, "conflicts") && !Array.isArray(parsed.conflicts)) {
    failRequired(`${path.relative(root, metaPath)}: conflicts must be an array`);
  }
  if (Object.prototype.hasOwnProperty.call(parsed, "do_not_use_when") && !Array.isArray(parsed.do_not_use_when)) {
    failRequired(`${path.relative(root, metaPath)}: do_not_use_when must be an array`);
  }
  if (Object.prototype.hasOwnProperty.call(parsed, "distinguish_from") && !Array.isArray(parsed.distinguish_from)) {
    failRequired(`${path.relative(root, metaPath)}: distinguish_from must be an array`);
  }

  if (id.length === 0) {
    failRequired(`${path.relative(root, metaPath)}: id must be non-empty`);
  }
  if (id !== expectedId) {
    failRequired(`${path.relative(root, metaPath)}: id '${id}' must match file name '${expectedId}'`);
  }
  if (!validateSemver(version)) {
    failRequired(`${path.relative(root, metaPath)}: version '${version}' must be semver`);
  }
  if (owner.length === 0) {
    failRequired(`${path.relative(root, metaPath)}: owner must be non-empty`);
  }
  for (const entry of doNotUseWhen) {
    if (String(entry).trim().length === 0) {
      failRequired(`${path.relative(root, metaPath)}: do_not_use_when entries must be non-empty strings`);
    }
  }
  for (const entry of distinguishFrom) {
    if (entry == null || typeof entry !== "object" || !entry.id || !entry.boundary) {
      failRequired(`${path.relative(root, metaPath)}: distinguish_from entries must be objects with 'id' and 'boundary' properties`);
    }
  }
  for (let idx = 0; idx < sources.length; idx += 1) {
    const source = sources[idx] ?? {};
    const label = `${path.relative(root, metaPath)}: sources[${idx}]`;
    // Reject unknown source properties (schema-derived)
    if (allowedSourceKeys.size > 0) {
      for (const key of Object.keys(source)) {
        if (!allowedSourceKeys.has(key)) {
          failRequired(`${label} unsupported key '${key}'`);
        }
      }
    }
    const title = String(source.title ?? "");
    const organization = String(source.organization ?? "");
    const url = String(source.url ?? "");
    const kind = String(source.kind ?? "");
    const rawAccessedAt = source.accessed_at;
    const accessedAt = rawAccessedAt instanceof Date
      ? rawAccessedAt.toISOString().slice(0, 10)
      : String(rawAccessedAt ?? "");
    if (title.length === 0) {
      failRequired(`${label} missing non-empty title`);
    }
    if (organization.length === 0) {
      failRequired(`${label} missing non-empty organization`);
    }
    if (!/^https?:\/\//.test(url)) {
      failRequired(`${label} url '${url}' must be http(s)`);
    }
    if (!allowedSourceKinds.has(kind)) {
      failRequired(`${label} invalid kind '${kind}'`);
    }
    if (!validateIsoDate(accessedAt)) {
      failRequired(`${label} accessed_at '${accessedAt}' must be ISO date (YYYY-MM-DD)`);
    }
  }

  if (metaById.has(id)) {
    failRequired(`${path.relative(root, metaPath)}: duplicate id '${id}'`);
  } else {
    metaById.set(id, {
      id,
      file: relativeCapability,
      requires,
      conflicts,
    });
    requiresGraph.set(id, requires);
  }
}

for (const meta of metaById.values()) {
  const conflictsSet = new Set(meta.conflicts);
  for (const req of meta.requires) {
    if (!metaById.has(req)) {
      failRequired(`${meta.file}: requires unknown capability id '${req}'`);
    }
    if (conflictsSet.has(req)) {
      failRequired(`${meta.file}: requires/conflicts overlap for capability id '${req}'`);
    }
  }
  for (const conflict of meta.conflicts) {
    if (!metaById.has(conflict)) {
      failRequired(`${meta.file}: conflicts references unknown capability id '${conflict}'`);
      continue;
    }
    if (conflict === meta.id) {
      failRequired(`${meta.file}: conflicts must not contain self id '${meta.id}'`);
    }
    const reverse = metaById.get(conflict);
    if (reverse && !reverse.conflicts.includes(meta.id)) {
      failRequired(`${meta.file}: conflict '${meta.id} <-> ${conflict}' must be symmetric`);
    }
  }
}

const visitState = new Map();

function walk(id, stack) {
  const state = visitState.get(id) ?? 0;
  if (state === 1) {
    const idx = stack.indexOf(id);
    const cycle = [...stack.slice(idx), id].join(" -> ");
    failRequired(`requires cycle detected: ${cycle}`);
    return;
  }
  if (state === 2) {
    return;
  }

  visitState.set(id, 1);
  const next = requiresGraph.get(id) ?? [];
  for (const child of next) {
    if (!metaById.has(child)) {
      continue;
    }
    walk(child, [...stack, id]);
  }
  visitState.set(id, 2);
}

for (const id of metaById.keys()) {
  walk(id, []);
}

process.stdout.write(`[ccp|INFO]: metadata summary: required fail=${requiredFail}, advisory fail=${advisoryFail}\n`);
if (requiredFail > 0) {
  process.stderr.write("[ccp|ERROR]: capability metadata gate failed\n");
  process.exit(1);
}
process.stdout.write("[ccp|INFO]: capability metadata gate passed\n");
