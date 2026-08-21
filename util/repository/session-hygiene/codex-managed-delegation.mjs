import { createHash } from "node:crypto";

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
  providerIdentityIngress: "direct-native-result-only",
  detachedProjectionAuthority: "none",
});

const INTENT_SCHEMA = "ai4x.codex-managed-delegation-intent/v1";
const INTENT_KEYS = new Set([
  "schemaVersion", "profileId", "profileDigest", "issue", "repositoryRoot", "cwd",
  "lifecycle", "timestampEpochSeconds", "nonce", "handoffDigest", "assignment",
  "resource", "review", "transition",
]);
const ASSIGNMENT_KEYS = new Set(["id", "digest", "grantedAuthority", "allowedEffects", "ownedPaths", "context"]);
const CONTEXT_KEYS = new Set(["mode", "turnCount", "rationale"]);
const FULL_CONTEXT_KEYS = new Set(["mode", "turnCount", "rationale", "poDecisionReference", "approvedIssue", "task"]);
const RESOURCE_KEYS = new Set(["observedAtEpochSeconds", "freeBytes", "minimumFreeBytes"]);
const REVIEW_KEYS = new Set(["independent", "candidateDigest", "excludedAuthorIdentities", "maximumVerdicts"]);
const TRANSITION_KEYS = new Set(["predecessorProfileDigest", "successorProfileDigest"]);
const NATIVE_KEYS = new Set(["start", "stop", "verdicts", "permissions"]);
const NATIVE_STATE_KEYS = new Set(["taskIdentity", "state"]);
const PERMISSION_KEYS = new Set(["repositoryWrite"]);
const READ_EFFECTS = new Set(["read-repository", "review", "advise"]);
const WRITE_EFFECT = "modify-repository";
const MAXIMUM_INTENT_AGE_SECONDS = 300;

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

function requiredClosedKeys(value, allowed, required) {
  return isRecord(value)
    && Object.keys(value).every((key) => allowed.has(key))
    && required.every((key) => Object.hasOwn(value, key));
}

function validateAssignment(subject, issue) {
  if (!exactKeys(subject, ASSIGNMENT_KEYS)
    || !nonEmpty(subject.id)
    || !digest(subject.digest)
    || !["read-only", "write"].includes(subject.grantedAuthority)
    || !Array.isArray(subject.allowedEffects)
    || subject.allowedEffects.length === 0
    || new Set(subject.allowedEffects).size !== subject.allowedEffects.length
    || !Array.isArray(subject.ownedPaths)
    || !isRecord(subject.context)) {
    fail("SH-DELEGATION-ASSIGNMENT-INVALID", "Assignment contract is invalid");
  }
  const writing = subject.grantedAuthority === "write";
  if (writing !== subject.allowedEffects.includes(WRITE_EFFECT)
    || subject.allowedEffects.some((effect) => effect !== WRITE_EFFECT && !READ_EFFECTS.has(effect))
    || (writing && (subject.allowedEffects.length !== 1
      || subject.ownedPaths.length === 0
      || subject.ownedPaths.some((ownedPath) => !nonEmpty(ownedPath))))
    || (!writing && subject.ownedPaths.length !== 0)) {
    fail("SH-DELEGATION-ASSIGNMENT-INVALID", "Assignment effects or ownership are invalid");
  }
  const context = subject.context;
  if ((context.mode === "none" && (!exactKeys(context, CONTEXT_KEYS) || context.turnCount !== 0 || context.rationale !== ""))
    || (context.mode === "bounded" && (!exactKeys(context, CONTEXT_KEYS) || !Number.isSafeInteger(context.turnCount) || context.turnCount <= 0 || !nonEmpty(context.rationale)))
    || (context.mode === "all" && (!exactKeys(context, FULL_CONTEXT_KEYS)
      || context.turnCount !== 0
      || !nonEmpty(context.rationale)
      || !nonEmpty(context.poDecisionReference)
      || context.approvedIssue !== issue
      || !nonEmpty(context.task)))
    || !["none", "bounded", "all"].includes(context.mode)) {
    fail("SH-DELEGATION-CONTEXT-INVALID", "Assignment context is invalid");
  }
}

function validateIntent(subject, nowEpochSeconds) {
  if (!exactKeys(subject, INTENT_KEYS)
    || subject.schemaVersion !== INTENT_SCHEMA
    || subject.profileId !== PROFILE.id
    || subject.profileDigest !== CODEX_MANAGED_DELEGATION_PROFILE_DIGEST
    || !/^#[1-9][0-9]*$/u.test(subject.issue ?? "")
    || !nonEmpty(subject.repositoryRoot)
    || subject.cwd !== subject.repositoryRoot
    || !PROFILE.lifecycle.includes(subject.lifecycle)
    || !natural(subject.timestampEpochSeconds)
    || subject.timestampEpochSeconds > nowEpochSeconds
    || nowEpochSeconds - subject.timestampEpochSeconds > MAXIMUM_INTENT_AGE_SECONDS
    || !nonEmpty(subject.nonce)
    || !digest(subject.handoffDigest)
    || !exactKeys(subject.resource, RESOURCE_KEYS)
    || !natural(subject.resource.observedAtEpochSeconds)
    || subject.resource.observedAtEpochSeconds > nowEpochSeconds
    || nowEpochSeconds - subject.resource.observedAtEpochSeconds > MAXIMUM_INTENT_AGE_SECONDS
    || !natural(subject.resource.freeBytes)
    || !natural(subject.resource.minimumFreeBytes)
    || subject.resource.freeBytes < subject.resource.minimumFreeBytes) {
    fail("SH-DELEGATION-INTENT-INVALID", "delegation intent is invalid or stale");
  }
  validateAssignment(subject.assignment, subject.issue);

  if (subject.review !== null) {
    if (!exactKeys(subject.review, REVIEW_KEYS)
      || subject.review.independent !== true
      || !digest(subject.review.candidateDigest)
      || !Array.isArray(subject.review.excludedAuthorIdentities)
      || subject.review.excludedAuthorIdentities.length === 0
      || subject.review.excludedAuthorIdentities.some((identity) => !nonEmpty(identity))
      || subject.review.maximumVerdicts !== 1
      || subject.assignment.grantedAuthority !== "read-only") {
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
}

function validateNativeResult(subject, intent) {
  if (!requiredClosedKeys(subject, NATIVE_KEYS, ["start", "stop", "verdicts"])
    || !requiredClosedKeys(subject.start, NATIVE_STATE_KEYS, ["state"])
    || !requiredClosedKeys(subject.stop, NATIVE_STATE_KEYS, ["state"])
    || !Array.isArray(subject.verdicts)) {
    fail("SH-DELEGATION-NATIVE-RESULT-INVALID", "native provider result is invalid");
  }
  if (!nonEmpty(subject.start.taskIdentity) || !nonEmpty(subject.stop.taskIdentity)) {
    fail("SH-DELEGATION-IDENTITY-MISSING", "provider task identity is absent");
  }
  if (subject.start.state !== "started"
    || subject.stop.state !== "completed"
    || subject.start.taskIdentity !== subject.stop.taskIdentity) {
    fail("SH-DELEGATION-LIFECYCLE-MISMATCH", "native lifecycle identity is inconsistent");
  }
  if (subject.permissions !== undefined
    && (!exactKeys(subject.permissions, PERMISSION_KEYS) || typeof subject.permissions.repositoryWrite !== "boolean")) {
    fail("SH-DELEGATION-NATIVE-RESULT-INVALID", "provider permission result is invalid");
  }
  const writing = intent.assignment.grantedAuthority === "write";
  if (subject.permissions !== undefined && subject.permissions.repositoryWrite !== writing) {
    fail("SH-DELEGATION-PERMISSION-CONTRADICTION", "provider permissions contradict Assignment authority");
  }
  if (intent.review !== null) {
    if (intent.review.excludedAuthorIdentities.includes(subject.start.taskIdentity)) {
      fail("SH-DELEGATION-INDEPENDENCE", "provider identity participated in authoring");
    }
    if (subject.verdicts.length !== 1 || !nonEmpty(subject.verdicts[0])) {
      fail("SH-DELEGATION-VERDICT-COUNT", "independent review must emit exactly one verdict");
    }
  } else if (subject.verdicts.length !== 0) {
    fail("SH-DELEGATION-VERDICT-COUNT", "non-review Assignment cannot emit a review verdict");
  }
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

export function createCodexManagedDelegationRuntime({ invokeNative, observeReadOnlyState, nowEpochSeconds } = {}) {
  if (typeof invokeNative !== "function" || typeof observeReadOnlyState !== "function" || typeof nowEpochSeconds !== "function") {
    fail("SH-DELEGATION-RUNTIME-INVALID", "native delegation runtime is incomplete");
  }
  const consumedNonces = new Set();
  return Object.freeze({
    async run({ intent, task } = {}) {
      const now = nowEpochSeconds();
      validateIntent(intent, now);
      if (!nonEmpty(task)) fail("SH-DELEGATION-INTENT-INVALID", "bounded task is absent");
      if (consumedNonces.has(intent.nonce)) fail("SH-DELEGATION-NONCE-REPLAY", "delegation nonce was already consumed");
      consumedNonces.add(intent.nonce);

      const readOnly = intent.assignment.grantedAuthority === "read-only";
      const before = readOnly ? await observeReadOnlyState("before") : null;
      if (readOnly && !nonEmpty(before)) fail("SH-DELEGATION-NONMUTATION-EVIDENCE", "read-only baseline is unavailable");

      let nativeResult;
      try {
        nativeResult = await invokeNative(Object.freeze({ task, profileId: PROFILE.id }));
      } catch {
        fail("SH-DELEGATION-NATIVE-RESULT-INVALID", "native provider invocation failed");
      }
      validateNativeResult(nativeResult, intent);

      const after = readOnly ? await observeReadOnlyState("after") : null;
      if (readOnly && !nonEmpty(after)) fail("SH-DELEGATION-NONMUTATION-EVIDENCE", "read-only post-state is unavailable");
      if (readOnly && before !== after) fail("SH-DELEGATION-READONLY-MUTATION", "read-only Assignment changed repository or remote state");

      return deepFreeze({
        schemaVersion: "ai4x.codex-managed-delegation-projection/v1",
        profileId: PROFILE.id,
        profileDigest: CODEX_MANAGED_DELEGATION_PROFILE_DIGEST,
        intentDigest: sha256(intent),
        assignmentDigest: intent.assignment.digest,
        handoffDigest: intent.handoffDigest,
        candidateDigest: intent.review?.candidateDigest ?? null,
        nonceDigest: sha256(intent.nonce),
        providerIdentity: {
          taskIdentity: nativeResult.start.taskIdentity,
          source: "direct-native-result",
          lifecycle: "completed",
        },
        providerPermissions: nativeResult.permissions === undefined ? "not-exposed" : { ...nativeResult.permissions },
        readOnlyNonmutation: readOnly ? "verified" : "not-applicable",
        verdict: nativeResult.verdicts[0] ?? null,
        profileTransition: intent.transition === null ? null : { ...intent.transition },
        authorityEffect: "none",
        detachedAuthority: "none",
      });
    },
  });
}

export const CODEX_MANAGED_DELEGATION_PROFILE = PROFILE;
export const CODEX_MANAGED_DELEGATION_PROFILE_DIGEST = sha256(PROFILE);
export const CODEX_MANAGED_DELEGATION_INTENT_SCHEMA = INTENT_SCHEMA;
