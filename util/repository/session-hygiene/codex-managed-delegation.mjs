import { createHash } from "node:crypto";
import { lstatSync, realpathSync, statfsSync } from "node:fs";
import path from "node:path";
import { loadPolicyProjection } from "./projection.mjs";

const PROFILE = deepFreeze({
  schemaVersion: "ai4x.delegation-profile/v1",
  id: "codex-managed-delegation/v1",
  lifecycle: ["before-delegation", "active-interval", "subagent-stop"],
  admissionCapabilities: [
    "managed-delegation/v1",
    "bounded-context/v1",
    "assignment-authority/v1",
    "project-binding/v1",
    "repository-free-space/v1",
  ],
  conditionalCapabilities: {
    independentReview: "review-independence/v1",
    writing: "writer-ownership/v1",
    bootstrap: "profile-transition/v1",
  },
  diagnosticCapabilities: [
    "parent-rollout-path/v1",
    "child-rollout-path-at-stop/v1",
    "exact-rollout-measurement/v1",
  ],
  providerIdentityIngress: "host-native-boundary-only",
  repositoryAssuranceAuthority: "none",
  detachedProjectionAuthority: "none",
});

const INTENT_SCHEMA = "ai4x.codex-managed-delegation-intent/v2";
const REPLAY_SCHEMA = "ai4x.delegation-replay-evidence/v1";
const PREFLIGHT_KEYS = new Set([
  "intent", "task", "handoff", "candidateDigestAfterHandoff", "activeAssignments",
  "activeAgentOwnedPaths", "replayEvidence",
]);
const INTENT_KEYS = new Set([
  "schemaVersion", "profileId", "profileDigest", "issue", "repositoryRoot", "cwd",
  "lifecycle", "timestampEpochSeconds", "nonce", "handoffDigest", "assignment",
  "resource", "review", "transition",
]);
const ASSIGNMENT_KEYS = new Set(["id", "digest", "grantedAuthority", "allowedEffects", "ownedPaths", "context"]);
const ACTIVE_ASSIGNMENT_KEYS = new Set(["id", "grantedAuthority", "allowedEffects", "ownedPaths"]);
const CONTEXT_KEYS = new Set(["mode", "turnCount", "rationale"]);
const FULL_CONTEXT_KEYS = new Set(["mode", "turnCount", "rationale", "poDecisionReference", "approvedIssue", "task"]);
const RESOURCE_KEYS = new Set(["minimumFreeBytes"]);
const REVIEW_KEYS = new Set(["independent", "candidateDigest", "excludedAuthorIdentities", "maximumVerdicts"]);
const TRANSITION_KEYS = new Set(["predecessorProfileDigest", "successorProfileDigest"]);
const REPLAY_KEYS = new Set(["schemaVersion", "consumedNonceDigests", "priorReviewerIdentities", "durableEvidence"]);
const DURABLE_KEYS = new Set(["kind", "locator"]);
const READ_EFFECTS = new Set(["read-repository", "review", "advise"]);
const WRITE_EFFECT = "modify-repository";
const REQUIRED_HOST_CHECKS = Object.freeze([
  "direct-provider-task-identity",
  "same-identity-at-stop",
  "author-and-prior-reviewer-exclusion",
  "candidate-and-nonmutation-recheck",
  "exactly-one-verdict",
  "durable-nonce-consumption",
]);

export class DelegationFailure extends Error {
  constructor(code, message) {
    super(message);
    this.name = "DelegationFailure";
    this.code = code;
  }
}

function fail(code, message) {
  throw new DelegationFailure(code, message);
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return `sha256:${createHash("sha256").update(typeof value === "string" ? value : canonicalJson(value)).digest("hex")}`;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0 && value.trim() === value;
}

function natural(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function digest(value) {
  return typeof value === "string" && /^sha256:[0-9a-f]{64}$/u.test(value);
}

function exactKeys(value, allowed) {
  return isRecord(value)
    && Object.keys(value).length === allowed.size
    && Object.keys(value).every((key) => allowed.has(key));
}

function validateContext(context, issue) {
  if ((context?.mode === "none"
      && (!exactKeys(context, CONTEXT_KEYS) || context.turnCount !== 0 || context.rationale !== ""))
    || (context?.mode === "bounded"
      && (!exactKeys(context, CONTEXT_KEYS) || !Number.isSafeInteger(context.turnCount)
        || context.turnCount <= 0 || !nonEmpty(context.rationale)))
    || (context?.mode === "all"
      && (!exactKeys(context, FULL_CONTEXT_KEYS) || context.turnCount !== 0
        || !nonEmpty(context.rationale) || !nonEmpty(context.poDecisionReference)
        || context.approvedIssue !== issue || !nonEmpty(context.task)))
    || !["none", "bounded", "all"].includes(context?.mode)) {
    fail("SH-DELEGATION-CONTEXT-INVALID", "Assignment context is invalid");
  }
}

function canonicalOwnedPath(value) {
  if (!nonEmpty(value)
    || value.includes("\\")
    || value.includes("//")
    || path.posix.isAbsolute(value)) {
    fail("SH-DELEGATION-OWNERSHIP-INVALID", "owned path is not a canonical repository-relative path");
  }
  const normalized = path.posix.normalize(value);
  if (normalized === "."
    || normalized === ".."
    || normalized.startsWith("../")
    || normalized !== value) {
    fail("SH-DELEGATION-OWNERSHIP-INVALID", "owned path escapes or is noncanonical");
  }
  return normalized;
}

function assignmentClass(subject, issue, { active = false } = {}) {
  const keys = active ? ACTIVE_ASSIGNMENT_KEYS : ASSIGNMENT_KEYS;
  if (!exactKeys(subject, keys)
    || !nonEmpty(subject.id)
    || (!active && !digest(subject.digest))
    || !["read-only", "write"].includes(subject.grantedAuthority)
    || !Array.isArray(subject.allowedEffects)
    || subject.allowedEffects.length === 0
    || new Set(subject.allowedEffects).size !== subject.allowedEffects.length
    || !Array.isArray(subject.ownedPaths)) {
    fail("SH-DELEGATION-ASSIGNMENT-INVALID", "Assignment contract is invalid");
  }
  const writing = subject.grantedAuthority === "write";
  if (writing !== subject.allowedEffects.includes(WRITE_EFFECT)
    || subject.allowedEffects.some((effect) => effect !== WRITE_EFFECT && !READ_EFFECTS.has(effect))
    || (writing && subject.allowedEffects.length !== 1)
    || (!writing && subject.ownedPaths.length !== 0)
    || (writing && subject.ownedPaths.length === 0)) {
    fail("SH-DELEGATION-ASSIGNMENT-INVALID", "Assignment effects or ownership are invalid");
  }
  const ownedPaths = subject.ownedPaths.map(canonicalOwnedPath);
  if (new Set(ownedPaths).size !== ownedPaths.length) {
    fail("SH-DELEGATION-OWNERSHIP-INVALID", "owned paths are duplicated");
  }
  if (!active) validateContext(subject.context, issue);
  return { writing, ownedPaths };
}

function pathsOverlap(left, right) {
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function validateRepository(intent) {
  let root;
  let cwd;
  try {
    root = realpathSync(intent.repositoryRoot);
    cwd = realpathSync(intent.cwd);
    const marker = lstatSync(path.join(root, ".git"));
    if (!marker.isDirectory() && !marker.isFile()) throw new Error("unsupported .git marker");
  } catch {
    fail("SH-DELEGATION-PROJECT-BINDING", "repository or working directory is not canonical");
  }
  if (root !== cwd || root !== intent.repositoryRoot || cwd !== intent.cwd) {
    fail("SH-DELEGATION-PROJECT-BINDING", "repository and working directory bindings differ");
  }
  return root;
}

function observeFreeBytes(repositoryRoot) {
  try {
    const observation = statfsSync(repositoryRoot);
    const freeBytes = Number(observation.bavail) * Number(observation.bsize);
    if (!natural(freeBytes)) throw new Error("unsafe free-space value");
    return freeBytes;
  } catch {
    fail("SH-DELEGATION-RESOURCE-UNAVAILABLE", "repository free space is unavailable");
  }
}

function durableEvidence(value) {
  return exactKeys(value, DURABLE_KEYS)
    && ["git", "github", "governed-evidence"].includes(value.kind)
    && nonEmpty(value.locator)
    && !value.locator.startsWith("/tmp/")
    && !value.locator.startsWith(".ai4x/local/");
}

function validateReplayEvidence(subject, nonceDigest) {
  if (!exactKeys(subject, REPLAY_KEYS)
    || subject.schemaVersion !== REPLAY_SCHEMA
    || !Array.isArray(subject.consumedNonceDigests)
    || subject.consumedNonceDigests.some((value) => !digest(value))
    || new Set(subject.consumedNonceDigests).size !== subject.consumedNonceDigests.length
    || !Array.isArray(subject.priorReviewerIdentities)
    || subject.priorReviewerIdentities.some((value) => !nonEmpty(value))
    || new Set(subject.priorReviewerIdentities).size !== subject.priorReviewerIdentities.length
    || !durableEvidence(subject.durableEvidence)) {
    fail("SH-DELEGATION-REPLAY-EVIDENCE", "durable replay or reviewer evidence is invalid");
  }
  if (subject.consumedNonceDigests.includes(nonceDigest)) {
    fail("SH-DELEGATION-NONCE-REPLAY", "delegation nonce was already durably consumed");
  }
}

function validateIntent(subject, nowEpochSeconds) {
  if (!exactKeys(subject, INTENT_KEYS)
    || subject.schemaVersion !== INTENT_SCHEMA
    || subject.profileId !== PROFILE.id
    || subject.profileDigest !== CODEX_MANAGED_DELEGATION_PROFILE_DIGEST
    || !/^#[1-9][0-9]*$/u.test(subject.issue ?? "")
    || !PROFILE.lifecycle.includes(subject.lifecycle)
    || !natural(subject.timestampEpochSeconds)
    || subject.timestampEpochSeconds > nowEpochSeconds
    || !nonEmpty(subject.nonce)
    || !digest(subject.handoffDigest)
    || !exactKeys(subject.resource, RESOURCE_KEYS)
    || !natural(subject.resource.minimumFreeBytes)) {
    fail("SH-DELEGATION-INTENT-INVALID", "delegation intent is invalid or stale");
  }
  const assignment = assignmentClass(subject.assignment, subject.issue);
  if (subject.review !== null) {
    if (!exactKeys(subject.review, REVIEW_KEYS)
      || subject.review.independent !== true
      || !digest(subject.review.candidateDigest)
      || !Array.isArray(subject.review.excludedAuthorIdentities)
      || subject.review.excludedAuthorIdentities.length === 0
      || subject.review.excludedAuthorIdentities.some((identity) => !nonEmpty(identity))
      || new Set(subject.review.excludedAuthorIdentities).size !== subject.review.excludedAuthorIdentities.length
      || subject.review.maximumVerdicts !== 1
      || assignment.writing) {
      fail("SH-DELEGATION-INDEPENDENCE", "independent review binding is invalid");
    }
  }
  if (subject.transition !== null) {
    if (!exactKeys(subject.transition, TRANSITION_KEYS)
      || !digest(subject.transition.predecessorProfileDigest)
      || subject.transition.successorProfileDigest !== CODEX_MANAGED_DELEGATION_PROFILE_DIGEST
      || subject.transition.predecessorProfileDigest === subject.transition.successorProfileDigest
      || subject.review === null) {
      fail("SH-DELEGATION-TRANSITION-INVALID", "profile transition lineage is invalid");
    }
  }
  return assignment;
}

function validateWriterTopology(intent, requested, activeAssignments, activeAgentOwnedPaths, limit) {
  if (!Array.isArray(activeAssignments) || !Array.isArray(activeAgentOwnedPaths) || !natural(limit)) {
    fail("SH-DELEGATION-EVIDENCE-INVALID", "writer topology evidence is invalid");
  }
  const primaryPaths = activeAgentOwnedPaths.map(canonicalOwnedPath);
  const writers = [];
  const ids = new Set([intent.assignment.id]);
  for (const active of activeAssignments) {
    if (ids.has(active?.id)) fail("SH-DELEGATION-ASSIGNMENT-INVALID", "Assignment identity is duplicated");
    ids.add(active?.id);
    const classified = assignmentClass(active, intent.issue, { active: true });
    if (classified.writing) writers.push({ id: active.id, ownedPaths: classified.ownedPaths });
  }
  if (requested.writing) writers.push({ id: intent.assignment.id, ownedPaths: requested.ownedPaths });
  for (const writer of writers) {
    if (writer.ownedPaths.some((owned) => primaryPaths.some((primary) => pathsOverlap(owned, primary)))) {
      fail("SH-DELEGATION-OWNERSHIP-OVERLAP", "writer ownership overlaps the active parent");
    }
  }
  for (let left = 0; left < writers.length; left += 1) {
    for (let right = left + 1; right < writers.length; right += 1) {
      if (writers[left].ownedPaths.some((owned) => writers[right].ownedPaths.some((other) => pathsOverlap(owned, other)))) {
        fail("SH-DELEGATION-OWNERSHIP-OVERLAP", "delegated writer ownership overlaps");
      }
    }
  }
  if (writers.length > limit) fail("SH-DELEGATION-WRITER-LIMIT", "write-capable Assignment limit is exceeded");
}

export function delegationEvidenceDigest(value) {
  return sha256(value);
}

export function delegationAssignmentDigest({ assignment, task } = {}) {
  if (!isRecord(assignment) || typeof task !== "string") {
    fail("SH-DELEGATION-ASSIGNMENT-DIGEST", "Assignment digest input is invalid");
  }
  const { digest: ignored, ...contract } = assignment;
  return sha256({ assignment: contract, taskDigest: sha256(task) });
}

export function requiredCapabilities({ authority, independentReview, bootstrap }) {
  if (!["read-only", "write"].includes(authority)
    || typeof independentReview !== "boolean"
    || typeof bootstrap !== "boolean") {
    fail("SH-DELEGATION-INTENT-INVALID", "capability request is invalid");
  }
  const result = [...PROFILE.admissionCapabilities];
  if (independentReview) result.push(PROFILE.conditionalCapabilities.independentReview);
  if (authority === "write") result.push(PROFILE.conditionalCapabilities.writing);
  if (bootstrap) result.push(PROFILE.conditionalCapabilities.bootstrap);
  return Object.freeze(result);
}

export function assessCodexManagedDelegationPreflight(subject) {
  if (!exactKeys(subject, PREFLIGHT_KEYS)) {
    fail("SH-DELEGATION-EVIDENCE-INVALID", "preflight evidence schema is invalid");
  }
  const nowEpochSeconds = Math.floor(Date.now() / 1_000);
  const requested = validateIntent(subject.intent, nowEpochSeconds);
  const repositoryRoot = validateRepository(subject.intent);
  let policy;
  try {
    policy = loadPolicyProjection({
      repositoryRoot,
      projectionPath: path.join(repositoryRoot, ".ai4x/generated/assurance/session-hygiene-policy.json"),
    });
  } catch {
    fail("SH-DELEGATION-POLICY-INVALID", "accepted policy projection is absent, stale, or invalid");
  }
  if (subject.intent.resource.minimumFreeBytes !== policy.resources.minimumFreeBytes) {
    fail("SH-DELEGATION-RESOURCE-BINDING", "resource threshold differs from the accepted projection");
  }
  if (nowEpochSeconds - subject.intent.timestampEpochSeconds
    > policy.resources.maximumObservationAgeSeconds) {
    fail("SH-DELEGATION-INTENT-INVALID", "delegation intent is stale under the accepted projection");
  }
  if (subject.intent.assignment.context.mode === "all") {
    const approval = policy.collaboration.contextInheritance.fullHistoryApproval;
    const context = subject.intent.assignment.context;
    if (!isRecord(approval)
      || context.poDecisionReference !== approval.decisionReference
      || context.approvedIssue !== approval.issue
      || context.task !== approval.task
      || context.rationale !== approval.rationale
      || subject.intent.issue !== approval.issue) {
      fail("SH-DELEGATION-CONTEXT-INVALID", "full-history context lacks exact accepted authority");
    }
  }
  if (!nonEmpty(subject.task) || !nonEmpty(subject.handoff)) {
    fail("SH-DELEGATION-EVIDENCE-INVALID", "task or bounded handoff is absent");
  }
  if (delegationAssignmentDigest({ assignment: subject.intent.assignment, task: subject.task })
    !== subject.intent.assignment.digest) {
    fail("SH-DELEGATION-ASSIGNMENT-DIGEST", "task is not bound to the Assignment digest");
  }
  if (sha256(subject.handoff) !== subject.intent.handoffDigest) {
    fail("SH-DELEGATION-HANDOFF-DIGEST", "bounded handoff content does not match its digest");
  }
  if (subject.intent.review !== null
    && (subject.candidateDigestAfterHandoff !== subject.intent.review.candidateDigest
      || !digest(subject.candidateDigestAfterHandoff))) {
    fail("SH-DELEGATION-CANDIDATE-DRIFT", "candidate changed after the bounded handoff");
  }
  if (subject.intent.review === null && subject.candidateDigestAfterHandoff !== null) {
    fail("SH-DELEGATION-EVIDENCE-INVALID", "non-review Assignment supplied a candidate binding");
  }

  const freeBytes = observeFreeBytes(repositoryRoot);
  if (freeBytes < subject.intent.resource.minimumFreeBytes) {
    fail("SH-DELEGATION-RESOURCE-LOW", "repository free space is below the exact threshold");
  }
  const nonceDigest = sha256(subject.intent.nonce);
  validateReplayEvidence(subject.replayEvidence, nonceDigest);
  validateWriterTopology(
    subject.intent,
    requested,
    subject.activeAssignments,
    subject.activeAgentOwnedPaths,
    policy.collaboration.writeCapableAssignmentLimit.maximum,
  );

  const excludedReviewerIdentities = subject.intent.review === null
    ? []
    : [...new Set([
        ...subject.intent.review.excludedAuthorIdentities,
        ...subject.replayEvidence.priorReviewerIdentities,
      ])];

  return deepFreeze({
    schemaVersion: "ai4x.codex-managed-delegation-preflight/v1",
    decision: "policy-satisfied",
    providerAdmission: "required-at-host-native-boundary",
    providerIdentity: null,
    verdict: null,
    profileId: PROFILE.id,
    profileDigest: CODEX_MANAGED_DELEGATION_PROFILE_DIGEST,
    repositoryRoot,
    observedResource: {
      observedAtEpochSeconds: nowEpochSeconds,
      freeBytes,
      minimumFreeBytes: subject.intent.resource.minimumFreeBytes,
    },
    intentDigest: sha256(subject.intent),
    assignmentDigest: subject.intent.assignment.digest,
    handoffDigest: subject.intent.handoffDigest,
    candidateDigest: subject.intent.review?.candidateDigest ?? null,
    nonceDigest,
    excludedReviewerIdentities,
    requiredHostChecks: REQUIRED_HOST_CHECKS,
    profileTransition: subject.intent.transition === null ? null : { ...subject.intent.transition },
    authorityEffect: "none",
    detachedAuthority: "none",
  });
}

export const CODEX_MANAGED_DELEGATION_PROFILE = PROFILE;
export const CODEX_MANAGED_DELEGATION_PROFILE_DIGEST = sha256(PROFILE);
export const CODEX_MANAGED_DELEGATION_INTENT_SCHEMA = INTENT_SCHEMA;
