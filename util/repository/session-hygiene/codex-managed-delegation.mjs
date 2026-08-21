import { createHash } from "node:crypto";
import { lstatSync, readFileSync, realpathSync, statfsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPolicyProjection } from "./projection.mjs";

const MODULE_REPOSITORY_ROOT = realpathSync(path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
));

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
  repositoryObservation: "module-root-and-git-head",
  repositoryAssuranceAuthority: "none",
  hostAdmissionAuthority: "direct-provider-parent-only",
  detachedProjectionAuthority: "none",
});

const INTENT_SCHEMA = "ai4x.codex-managed-delegation-intent/v3";
const PREFLIGHT_KEYS = new Set(["intent", "task", "handoff"]);
const INTENT_KEYS = new Set([
  "schemaVersion", "profileId", "profileDigest", "issue", "repositoryRoot", "cwd",
  "lifecycle", "timestampEpochSeconds", "nonce", "handoffDigest", "assignment",
  "resource", "review", "transition",
]);
const ASSIGNMENT_KEYS = new Set(["id", "digest", "grantedAuthority", "allowedEffects", "ownedPaths", "context"]);
const CONTEXT_KEYS = new Set(["mode", "turnCount", "rationale"]);
const FULL_CONTEXT_KEYS = new Set(["mode", "turnCount", "rationale", "poDecisionReference", "approvedIssue", "task"]);
const RESOURCE_KEYS = new Set(["minimumFreeBytes"]);
const REVIEW_KEYS = new Set(["independent", "candidate", "maximumVerdicts"]);
const CANDIDATE_KEYS = new Set(["headOid"]);
const TRANSITION_KEYS = new Set(["predecessorProfileDigest", "successorProfileDigest"]);
const READ_EFFECTS = new Set(["read-repository", "review", "advise"]);
const WRITE_EFFECT = "modify-repository";
const COMMON_HOST_CHECKS = Object.freeze([
  "direct-provider-task-identity",
  "same-identity-at-stop",
  "exact-provider-permissions-or-not-exposed",
  "complete-active-assignment-topology",
  "authenticated-durable-replay-state",
  "author-and-prior-reviewer-exclusion",
  "exact-provider-candidate-tree-and-nonmutation-recheck",
  "read-only-repository-and-remote-nonmutation",
  "exactly-one-verdict",
  "durable-nonce-consumption",
]);
const WRITER_HOST_CHECKS = Object.freeze([
  "requested-ownership-containment-recheck-at-start",
  "accepted-writer-limit-against-complete-topology",
  "all-writer-and-parent-ownership-nonoverlap",
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

function contentPresent(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function natural(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function digest(value) {
  return typeof value === "string" && /^sha256:[0-9a-f]{64}$/u.test(value);
}

function gitOid(value) {
  return typeof value === "string" && /^[0-9a-f]{40}$/u.test(value);
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

function lexicalOwnedPath(value) {
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

function repositoryOwnedPath(repositoryRoot, value) {
  const ownedPath = lexicalOwnedPath(value);
  let current = repositoryRoot;
  const segments = ownedPath.split("/");
  for (const [index, segment] of segments.entries()) {
    current = path.join(current, segment);
    let stat;
    try {
      stat = lstatSync(current);
    } catch (error) {
      if (error?.code === "ENOENT") break;
      fail("SH-DELEGATION-OWNERSHIP-INVALID", "owned path cannot be verified");
    }
    if (stat.isSymbolicLink()) {
      fail("SH-DELEGATION-OWNERSHIP-INVALID", "owned path traverses a symbolic link");
    }
    if (index < segments.length - 1 && !stat.isDirectory()) {
      fail("SH-DELEGATION-OWNERSHIP-INVALID", "owned path traverses a non-directory");
    }
    let resolved;
    try {
      resolved = realpathSync.native(current);
    } catch {
      fail("SH-DELEGATION-OWNERSHIP-INVALID", "owned path cannot be resolved safely");
    }
    if (resolved !== current) {
      fail("SH-DELEGATION-OWNERSHIP-INVALID", "owned path component spelling is not canonical");
    }
    if (resolved !== repositoryRoot && !resolved.startsWith(`${repositoryRoot}${path.sep}`)) {
      fail("SH-DELEGATION-OWNERSHIP-INVALID", "owned path escapes the repository");
    }
  }
  return ownedPath;
}

function assignmentClass(subject, issue, repositoryRoot) {
  if (!exactKeys(subject, ASSIGNMENT_KEYS)
    || !nonEmpty(subject.id)
    || !digest(subject.digest)
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
  const ownedPaths = subject.ownedPaths.map((ownedPath) => repositoryOwnedPath(repositoryRoot, ownedPath));
  if (new Set(ownedPaths).size !== ownedPaths.length) {
    fail("SH-DELEGATION-OWNERSHIP-INVALID", "owned paths are duplicated");
  }
  validateContext(subject.context, issue);
  return { writing, ownedPaths };
}

function readRegularText(filePath, code, label) {
  try {
    const stat = lstatSync(filePath);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("unsafe-file");
    const value = readFileSync(filePath, "utf8").trim();
    if (value.length === 0) throw new Error("empty-file");
    return value;
  } catch {
    fail(code, `${label} is unavailable or unsafe`);
  }
}

function resolveGitDirectory(repositoryRoot) {
  const marker = path.join(repositoryRoot, ".git");
  let stat;
  try {
    stat = lstatSync(marker);
  } catch {
    fail("SH-DELEGATION-PROJECT-BINDING", "canonical repository marker is unavailable");
  }
  if (stat.isSymbolicLink()) fail("SH-DELEGATION-PROJECT-BINDING", "canonical repository marker is symlinked");
  if (stat.isDirectory()) return realpathSync(marker);
  if (!stat.isFile()) fail("SH-DELEGATION-PROJECT-BINDING", "canonical repository marker is invalid");
  const declaration = readRegularText(marker, "SH-DELEGATION-PROJECT-BINDING", "git directory declaration");
  const match = /^gitdir: (.+)$/u.exec(declaration);
  if (match === null) fail("SH-DELEGATION-PROJECT-BINDING", "git directory declaration is invalid");
  try {
    return realpathSync(path.resolve(repositoryRoot, match[1]));
  } catch {
    fail("SH-DELEGATION-PROJECT-BINDING", "git directory cannot be resolved");
  }
}

function resolveHeadOid(gitDirectory) {
  const head = readRegularText(path.join(gitDirectory, "HEAD"), "SH-DELEGATION-CANDIDATE-UNAVAILABLE", "git HEAD");
  if (gitOid(head)) return head;
  const match = /^ref: (refs\/[A-Za-z0-9._/-]+)$/u.exec(head);
  if (match === null || match[1].includes("..") || match[1].includes("//")) {
    fail("SH-DELEGATION-CANDIDATE-UNAVAILABLE", "git HEAD reference is invalid");
  }
  const looseRef = path.join(gitDirectory, ...match[1].split("/"));
  let looseStat;
  try {
    looseStat = lstatSync(looseRef);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      fail("SH-DELEGATION-CANDIDATE-UNAVAILABLE", "git HEAD reference is unavailable or unsafe");
    }
  }
  if (looseStat !== undefined) {
    if (!looseStat.isFile() || looseStat.isSymbolicLink()) {
      fail("SH-DELEGATION-CANDIDATE-UNAVAILABLE", "git HEAD reference is unavailable or unsafe");
    }
    const oid = readFileSync(looseRef, "utf8").trim();
    if (!gitOid(oid)) fail("SH-DELEGATION-CANDIDATE-UNAVAILABLE", "git HEAD reference identity is invalid");
    return oid;
  }
  const packed = readRegularText(path.join(gitDirectory, "packed-refs"), "SH-DELEGATION-CANDIDATE-UNAVAILABLE", "packed refs");
  for (const line of packed.split("\n")) {
    const packedMatch = /^([0-9a-f]{40}) (refs\/[A-Za-z0-9._/-]+)$/u.exec(line);
    if (packedMatch?.[2] === match[1]) return packedMatch[1];
  }
  fail("SH-DELEGATION-CANDIDATE-UNAVAILABLE", "git HEAD reference is absent");
}

function observeRepositoryBinding() {
  const gitDirectory = resolveGitDirectory(MODULE_REPOSITORY_ROOT);
  const headOid = resolveHeadOid(gitDirectory);
  return { repositoryRoot: MODULE_REPOSITORY_ROOT, headOid };
}

function validateRepository(intent) {
  let requestedRoot;
  let requestedCwd;
  let activeCwd;
  try {
    requestedRoot = realpathSync(intent.repositoryRoot);
    requestedCwd = realpathSync(intent.cwd);
    activeCwd = realpathSync(process.cwd());
  } catch {
    fail("SH-DELEGATION-PROJECT-BINDING", "repository or working directory is not canonical");
  }
  if (requestedRoot !== MODULE_REPOSITORY_ROOT
    || requestedCwd !== MODULE_REPOSITORY_ROOT
    || activeCwd !== MODULE_REPOSITORY_ROOT
    || requestedRoot !== intent.repositoryRoot
    || requestedCwd !== intent.cwd) {
    fail("SH-DELEGATION-PROJECT-BINDING", "requested project is not the executing module repository");
  }
  return observeRepositoryBinding();
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

function validateIntent(subject, nowEpochSeconds, repositoryBinding) {
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
  const assignment = assignmentClass(subject.assignment, subject.issue, repositoryBinding.repositoryRoot);
  if (subject.review !== null) {
    if (!exactKeys(subject.review, REVIEW_KEYS)
      || subject.review.independent !== true
      || !exactKeys(subject.review.candidate, CANDIDATE_KEYS)
      || !gitOid(subject.review.candidate.headOid)
      || subject.review.maximumVerdicts !== 1
      || assignment.writing) {
      fail("SH-DELEGATION-INDEPENDENCE", "independent review binding is invalid");
    }
    if (subject.review.candidate.headOid !== repositoryBinding.headOid) {
      fail("SH-DELEGATION-CANDIDATE-DRIFT", "actual git HEAD differs from the review intent");
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

export function observeCodexManagedRepositoryBinding() {
  return deepFreeze({ ...observeRepositoryBinding() });
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
    fail("SH-DELEGATION-EVIDENCE-INVALID", "repository preflight accepts only local-observation inputs");
  }
  const nowEpochSeconds = Math.floor(Date.now() / 1_000);
  const repositoryBinding = validateRepository(subject.intent ?? {});
  const requested = validateIntent(subject.intent, nowEpochSeconds, repositoryBinding);
  let policy;
  try {
    policy = loadPolicyProjection({
      repositoryRoot: repositoryBinding.repositoryRoot,
      projectionPath: path.join(repositoryBinding.repositoryRoot, ".ai4x/generated/assurance/session-hygiene-policy.json"),
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
  if (!contentPresent(subject.task) || !contentPresent(subject.handoff)) {
    fail("SH-DELEGATION-EVIDENCE-INVALID", "task or bounded handoff is absent");
  }
  if (delegationAssignmentDigest({ assignment: subject.intent.assignment, task: subject.task })
    !== subject.intent.assignment.digest) {
    fail("SH-DELEGATION-ASSIGNMENT-DIGEST", "task is not bound to the Assignment digest");
  }
  if (sha256(subject.handoff) !== subject.intent.handoffDigest) {
    fail("SH-DELEGATION-HANDOFF-DIGEST", "bounded handoff content does not match its digest");
  }

  const freeBytes = observeFreeBytes(repositoryBinding.repositoryRoot);
  if (freeBytes < subject.intent.resource.minimumFreeBytes) {
    fail("SH-DELEGATION-RESOURCE-LOW", "repository free space is below the exact threshold");
  }

  const requiredHostChecks = requested.writing
    ? [...COMMON_HOST_CHECKS, ...WRITER_HOST_CHECKS]
    : [...COMMON_HOST_CHECKS];
  const candidate = subject.intent.review?.candidate ?? null;

  return deepFreeze({
    schemaVersion: "ai4x.codex-managed-delegation-local-observation/v1",
    decision: "local-observations-complete",
    delegationAuthorized: false,
    hostAdmission: "blocked-until-direct-provider-boundary",
    providerIdentity: null,
    verdict: null,
    profileId: PROFILE.id,
    profileDigest: CODEX_MANAGED_DELEGATION_PROFILE_DIGEST,
    repositoryBinding: { ...repositoryBinding },
    observedResource: {
      observedAtEpochSeconds: nowEpochSeconds,
      freeBytes,
      minimumFreeBytes: subject.intent.resource.minimumFreeBytes,
    },
    intentDigest: sha256(subject.intent),
    assignmentDigest: subject.intent.assignment.digest,
    handoffDigest: subject.intent.handoffDigest,
    candidateDigest: candidate === null ? null : sha256({
      repositoryRoot: repositoryBinding.repositoryRoot,
      ...candidate,
    }),
    nonceDigest: sha256(subject.intent.nonce),
    requiredHostChecks,
    profileTransition: subject.intent.transition === null ? null : { ...subject.intent.transition },
    authorityEffect: "none",
    detachedAuthority: "none",
  });
}

export const CODEX_MANAGED_DELEGATION_PROFILE = PROFILE;
export const CODEX_MANAGED_DELEGATION_PROFILE_DIGEST = sha256(PROFILE);
export const CODEX_MANAGED_DELEGATION_INTENT_SCHEMA = INTENT_SCHEMA;
