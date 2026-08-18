import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

const SOURCE_PATHS = Object.freeze([
  ".ai4x/coordination/collaboration.dhall",
  ".ai4x/operations/session-hygiene.dhall",
]);

export class ProjectionFailure extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ProjectionFailure";
    this.code = code;
  }
}

function fail(code, message) {
  throw new ProjectionFailure(code, message);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireClosedRecord(value, keys, label) {
  if (!isRecord(value)) fail("SH-PROJECTION-INVALID", `${label} must be an object`);
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail("SH-PROJECTION-INVALID", `${label} keys do not match the closed schema`);
  }
  return value;
}

function requireString(value, label) {
  if (typeof value !== "string" || value.length === 0 || value.trim() !== value) {
    fail("SH-PROJECTION-INVALID", `${label} must be a non-empty trimmed string`);
  }
  return value;
}

function requireBoolean(value, label) {
  if (typeof value !== "boolean") fail("SH-PROJECTION-INVALID", `${label} must be a boolean`);
  return value;
}

function requireNatural(value, label, { positive = false } = {}) {
  if (!Number.isSafeInteger(value) || value < (positive ? 1 : 0)) {
    fail("SH-PROJECTION-INVALID", `${label} must be a ${positive ? "positive" : "non-negative"} safe integer`);
  }
  return value;
}

export function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function projectionBytes(value) {
  validatePolicyProjection(value);
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function validatePolicyProjection(value) {
  const root = requireClosedRecord(value, ["schemaVersion", "authorityStatus", "provenance", "collaboration", "resources"], "projection");
  if (root.schemaVersion !== "ai4x.session-hygiene-projection/v1") fail("SH-PROJECTION-INVALID", "unsupported projection schema");
  if (root.authorityStatus !== "mechanically-derived-inert-projection") fail("SH-PROJECTION-INVALID", "projection authority status is invalid");

  const provenance = requireClosedRecord(root.provenance, ["generator", "sources"], "provenance");
  if (provenance.generator !== "util/repository/session-hygiene/publish-projection.mjs") fail("SH-PROJECTION-INVALID", "unexpected projection generator");
  if (!Array.isArray(provenance.sources) || provenance.sources.length !== SOURCE_PATHS.length) fail("SH-PROJECTION-INVALID", "projection sources are incomplete");
  const observedPaths = [];
  for (const [index, source] of provenance.sources.entries()) {
    requireClosedRecord(source, ["path", "sha256"], `provenance.sources[${index}]`);
    observedPaths.push(requireString(source.path, `provenance.sources[${index}].path`));
    if (!/^[0-9a-f]{64}$/.test(source.sha256)) fail("SH-PROJECTION-INVALID", "source digest must be lowercase SHA-256");
  }
  if (JSON.stringify(observedPaths) !== JSON.stringify(SOURCE_PATHS)) fail("SH-PROJECTION-INVALID", "projection source order or identity is invalid");

  const collaboration = requireClosedRecord(root.collaboration, [
    "assignmentClassification", "writeCapableAssignmentLimit", "zeroLimitBehavior",
    "observeAllDelegatedAgents", "collaborationTopologyCapped", "contextInheritance",
  ], "collaboration");
  if (collaboration.assignmentClassification !== "assignment-effects-and-granted-authority") fail("SH-PROJECTION-INVALID", "assignment classification is invalid");
  if (collaboration.zeroLimitBehavior !== "block-delegated-write-capable-spawn-only") fail("SH-PROJECTION-INVALID", "zero-limit behavior is invalid");
  if (!requireBoolean(collaboration.observeAllDelegatedAgents, "observeAllDelegatedAgents")) fail("SH-PROJECTION-INVALID", "all delegated agents must remain observed");
  if (requireBoolean(collaboration.collaborationTopologyCapped, "collaborationTopologyCapped")) fail("SH-PROJECTION-INVALID", "collaboration topology must not be capped here");

  const limit = requireClosedRecord(collaboration.writeCapableAssignmentLimit, ["maximum", "aboveOneApproval"], "writeCapableAssignmentLimit");
  requireNatural(limit.maximum, "writeCapableAssignmentLimit.maximum");
  if (limit.aboveOneApproval !== null) {
    const approval = requireClosedRecord(limit.aboveOneApproval, ["decisionReference", "approvedMaximum"], "aboveOneApproval");
    if (!/^[A-Za-z0-9][A-Za-z0-9._:#/-]*$/.test(requireString(approval.decisionReference, "aboveOneApproval.decisionReference"))) {
      fail("SH-DELEGATION-LIMIT-APPROVAL", "above-one decision reference is not an exact safe identifier");
    }
    requireNatural(approval.approvedMaximum, "aboveOneApproval.approvedMaximum", { positive: true });
  }
  if (limit.maximum > 1 && (limit.aboveOneApproval === null || limit.aboveOneApproval.approvedMaximum !== limit.maximum)) {
    fail("SH-DELEGATION-LIMIT-APPROVAL", "above-one maximum lacks an exact matching PO decision");
  }
  if (limit.maximum <= 1 && limit.aboveOneApproval !== null) fail("SH-DELEGATION-LIMIT-APPROVAL", "above-one approval is invalid for a default maximum");

  const inheritance = requireClosedRecord(collaboration.contextInheritance, [
    "defaultMode", "boundedPositiveRequiresRationale", "fullHistoryRequiresExactPoDecision", "fullHistoryApproval",
  ], "contextInheritance");
  if (inheritance.defaultMode !== "none" || !requireBoolean(inheritance.boundedPositiveRequiresRationale, "boundedPositiveRequiresRationale") || !requireBoolean(inheritance.fullHistoryRequiresExactPoDecision, "fullHistoryRequiresExactPoDecision")) {
    fail("SH-PROJECTION-INVALID", "context inheritance weakens the accepted contract");
  }
  if (inheritance.fullHistoryApproval !== null) {
    const approval = requireClosedRecord(inheritance.fullHistoryApproval, [
      "decisionReference", "issue", "task", "rationale",
    ], "fullHistoryApproval");
    if (!/^[A-Za-z0-9][A-Za-z0-9._:#/-]*$/.test(requireString(approval.decisionReference, "fullHistoryApproval.decisionReference"))) {
      fail("SH-PROJECTION-INVALID", "full-history decision reference is not an exact safe identifier");
    }
    if (!/^#[1-9][0-9]*$/.test(requireString(approval.issue, "fullHistoryApproval.issue"))) {
      fail("SH-PROJECTION-INVALID", "full-history Issue identity is invalid");
    }
    requireString(approval.task, "fullHistoryApproval.task");
    requireString(approval.rationale, "fullHistoryApproval.rationale");
  }

  const resources = requireClosedRecord(root.resources, [
    "minimumFreeBytes", "unexplainedFreeSpaceDecreaseBytes", "maximumObservationAgeSeconds", "abnormalSingleRolloutGrowthBytes",
  ], "resources");
  for (const [key, amount] of Object.entries(resources)) requireNatural(amount, `resources.${key}`, { positive: true });
  return root;
}

export function withProvenance(evaluated, repositoryRoot) {
  const value = {
    ...evaluated,
    provenance: {
      generator: "util/repository/session-hygiene/publish-projection.mjs",
      sources: SOURCE_PATHS.map((sourcePath) => ({
        path: sourcePath,
        sha256: sha256(readFileSync(path.join(repositoryRoot, sourcePath))),
      })),
    },
  };
  validatePolicyProjection(value);
  return value;
}

export function loadPolicyProjection({ repositoryRoot, projectionPath }) {
  let value;
  try {
    value = JSON.parse(readFileSync(projectionPath, "utf8"));
  } catch (error) {
    fail("SH-PROJECTION-INVALID", `projection cannot be loaded: ${error.code ?? "invalid-json"}`);
  }
  validatePolicyProjection(value);
  for (const source of value.provenance.sources) {
    let digest;
    try {
      digest = sha256(readFileSync(path.join(repositoryRoot, source.path)));
    } catch (error) {
      fail("SH-PROJECTION-STALE", `authoritative source is unavailable: ${error.code ?? "unavailable"}`);
    }
    if (digest !== source.sha256) fail("SH-PROJECTION-STALE", "projection source digest does not match authority");
  }
  return value;
}

export const POLICY_SOURCE_PATHS = SOURCE_PATHS;
