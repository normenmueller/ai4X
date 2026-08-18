import { loadPolicyProjection, validatePolicyProjection } from "./projection.mjs";

const EVALUATION_SCHEMA = "ai4x.session-hygiene-evaluation/v1";
const OBSERVATION_SCHEMA = "ai4x.codex-session-observation/v1";
const RESTART_SCHEMA = "ai4x.session-hygiene-restart-evaluation/v1";
const WRITE_EFFECT = "modify-repository";
const READ_EFFECTS = new Set(["read-repository", "review", "advise"]);
const LIFECYCLES = new Set([
  "before-delegation",
  "active-interval",
  "subagent-stop",
  "after-issue-completion",
  "handoff-boundary",
]);
const EFFECTIVE_CHANGE_CLASSES = new Set([
  "constitution-safety",
  "agents-roles",
  "delegation-collaboration",
  "governance-lifecycle-authority-routing-work-management",
  "host-bootstrap-configuration",
  "tracked-ai-host-facade",
  "capability-context-selection",
]);
const INERT_CHANGE_CLASSES = new Set([
  "inert-documentation",
  "test-evidence-output",
  "generated-projection",
  "local-scratch",
]);
const RESTART_INPUT_KEYS = new Set([
  "schemaVersion",
  "merged",
  "safeBoundary",
  "compactDurableHandoffVerified",
  "startMode",
  "changeClasses",
]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0 && value.trim() === value;
}

function natural(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function durableEvidence(value) {
  return isRecord(value)
    && ["git", "github", "governed-evidence"].includes(value.kind)
    && nonEmpty(value.locator)
    && !value.locator.startsWith("/tmp/")
    && !value.locator.startsWith(".ai4x/local/");
}

function pathOwns(owner, candidate) {
  if (!nonEmpty(owner) || !nonEmpty(candidate)) return false;
  const normalizedOwner = owner.replace(/\/+$/, "");
  const normalizedCandidate = candidate.replace(/\/+$/, "");
  return normalizedOwner === normalizedCandidate
    || normalizedOwner.startsWith(`${normalizedCandidate}/`)
    || normalizedCandidate.startsWith(`${normalizedOwner}/`);
}

function classifyAssignment(assignment) {
  if (!isRecord(assignment)
    || !nonEmpty(assignment.id)
    || !Array.isArray(assignment.allowedEffects)
    || assignment.allowedEffects.length === 0
    || !["read-only", "write"].includes(assignment.grantedAuthority)
    || !Array.isArray(assignment.ownedPaths)) return "ambiguous";

  const effects = new Set(assignment.allowedEffects);
  if (effects.size !== assignment.allowedEffects.length) return "ambiguous";
  if ([...effects].some((effect) => effect !== WRITE_EFFECT && !READ_EFFECTS.has(effect))) return "ambiguous";
  const writes = effects.has(WRITE_EFFECT);
  if (writes !== (assignment.grantedAuthority === "write")) return "ambiguous";
  if (writes && (assignment.ownedPaths.length === 0 || assignment.ownedPaths.some((ownedPath) => !nonEmpty(ownedPath)))) return "ambiguous";
  if (!writes && assignment.ownedPaths.length > 0) return "ambiguous";
  return writes ? "write-capable-implementation" : "non-writing-specialist";
}

function validatePolicy(policy, add) {
  const limit = policy?.collaboration?.writeCapableAssignmentLimit;
  if (isRecord(limit)
    && ((natural(limit.maximum)
        && limit.maximum > 1
        && (!isRecord(limit.aboveOneApproval)
          || !nonEmpty(limit.aboveOneApproval.decisionReference)
          || limit.aboveOneApproval.approvedMaximum !== limit.maximum))
      || (natural(limit.maximum) && limit.maximum <= 1 && limit.aboveOneApproval !== null))) {
    add("SH-DELEGATION-LIMIT-APPROVAL", "delegation-limit");
  }
  try {
    validatePolicyProjection(policy);
  } catch {
    add("SH-POLICY-INVALID", "policy");
    return false;
  }
  return true;
}

function validateAssignmentAndContext(policy, input, add) {
  const delegation = input.delegation;
  if (!isRecord(delegation)
    || typeof delegation.active !== "boolean"
    || !Array.isArray(delegation.activeAssignments)
    || !Array.isArray(delegation.activeAgentOwnedPaths)
    || !isRecord(delegation.contextInheritance)) {
    add("SH-DELEGATION-INPUT-INVALID", "delegation");
    return;
  }
  if (delegation.active !== (delegation.activeAssignments.length > 0)) {
    add("SH-DELEGATION-INPUT-INVALID", "active-assignment-state");
  }

  const assignments = [...delegation.activeAssignments];
  if (delegation.requestedAssignment !== null) assignments.push(delegation.requestedAssignment);
  const ids = new Set();
  const classified = assignments.map((assignment) => {
    const classification = classifyAssignment(assignment);
    if (classification === "ambiguous") add("SH-ASSIGNMENT-EFFECTS-AMBIGUOUS", "assignment");
    if (isRecord(assignment) && nonEmpty(assignment.id)) {
      if (ids.has(assignment.id)) add("SH-ASSIGNMENT-EFFECTS-AMBIGUOUS", "assignment-identity");
      ids.add(assignment.id);
    }
    return { assignment, classification };
  });

  const writeCount = classified.filter(({ classification }) => classification === "write-capable-implementation").length;
  if (writeCount > policy.collaboration.writeCapableAssignmentLimit.maximum) add("SH-WRITE-ASSIGNMENT-LIMIT", "delegation-limit");

  for (const { assignment, classification } of classified.slice(0, delegation.activeAssignments.length)) {
    if (classification !== "write-capable-implementation") continue;
    for (const delegatedPath of assignment.ownedPaths) {
      if (delegation.activeAgentOwnedPaths.some((activePath) => pathOwns(activePath, delegatedPath))) {
        add("SH-PRIMARY-OWNERSHIP-OVERLAP", "file-ownership");
        break;
      }
    }
  }
  if (delegation.requestedAssignment !== null) {
    const requested = classified.at(-1);
    if (requested?.classification === "write-capable-implementation") {
      for (const delegatedPath of requested.assignment.ownedPaths) {
        if (delegation.activeAgentOwnedPaths.some((activePath) => pathOwns(activePath, delegatedPath))) {
          add("SH-PRIMARY-OWNERSHIP-OVERLAP", "file-ownership");
          break;
        }
      }
    }

    const inheritance = delegation.contextInheritance;
    if (inheritance.mode === "none") return;
    if (inheritance.mode === "bounded") {
      if (!Number.isSafeInteger(inheritance.turnCount) || inheritance.turnCount <= 0 || !nonEmpty(inheritance.rationale)) {
        add("SH-CONTEXT-BOUNDED-RATIONALE", "context-inheritance");
      }
      return;
    }
    if (inheritance.mode === "all") {
      const approval = policy.collaboration.contextInheritance.fullHistoryApproval;
      if (!isRecord(approval)
        || inheritance.poDecisionReference !== approval.decisionReference
        || inheritance.approvedIssue !== approval.issue
        || inheritance.task !== approval.task
        || inheritance.rationale !== approval.rationale
        || input.issue !== approval.issue) {
        add("SH-CONTEXT-FULL-HISTORY", "context-inheritance");
      }
      return;
    }
    add("SH-DELEGATION-INPUT-INVALID", "context-inheritance");
  }
}

function validateObservation(policy, input, add) {
  const observation = input.observation;
  if (!isRecord(observation)) {
    add("SH-OBSERVATION-MISSING", "observation");
    return;
  }
  if (!natural(input.nowEpochSeconds)
    || !natural(observation.observedAtEpochSeconds)
    || !natural(observation.freeBytes)
    || !natural(observation.parentRolloutBytes)
    || observation.observedAtEpochSeconds > input.nowEpochSeconds
    || !isRecord(observation.childRollout)) {
    add("SH-OBSERVATION-MALFORMED", "observation");
    return;
  }
  if (observation.schemaVersion !== OBSERVATION_SCHEMA) {
    add("SH-OBSERVATION-SCHEMA-INVALID", "observation-schema");
  }
  if (observation.issue !== input.issue) {
    add("SH-OBSERVATION-ISSUE-MISMATCH", "observation-issue");
  }
  if (observation.lifecycle !== input.lifecycle) {
    add("SH-OBSERVATION-LIFECYCLE-MISMATCH", "observation-lifecycle");
  }
  if (observation.repositoryRoot !== input.repositoryRoot) add("SH-OBSERVATION-FOREIGN-REPOSITORY", "repository-binding");
  if (input.nowEpochSeconds - observation.observedAtEpochSeconds > policy.resources.maximumObservationAgeSeconds) {
    add("SH-OBSERVATION-STALE", "observation-age");
  }
  if (!isRecord(observation.binding)
    || observation.binding.provider !== "codex"
    || observation.binding.providerVersion !== "0.147.0"
    || observation.binding.sessionIdPresent !== true
    || observation.binding.parentPathValidated !== true
    || observation.binding.cwdMatchesProject !== true) {
    add("SH-OBSERVATION-BINDING-INVALID", "provider-binding");
  }
  if (observation.freeBytes < policy.resources.minimumFreeBytes) add("SH-FREE-SPACE-LOW", "free-space");

  if (input.previousObservation !== null) {
    const previous = input.previousObservation;
    if (!isRecord(previous)
      || previous.repositoryRoot !== input.repositoryRoot
      || !natural(previous.freeBytes)
      || !natural(previous.parentRolloutBytes)) {
      add("SH-PREVIOUS-OBSERVATION-INVALID", "previous-observation");
    } else {
      const freeDecrease = Math.max(0, previous.freeBytes - observation.freeBytes);
      if (freeDecrease >= policy.resources.unexplainedFreeSpaceDecreaseBytes && !durableEvidence(input.explanations?.freeSpaceDecrease)) {
        add("SH-FREE-SPACE-DECREASE", "free-space");
      }
      const parentGrowth = Math.max(0, observation.parentRolloutBytes - previous.parentRolloutBytes);
      if (parentGrowth >= policy.resources.abnormalSingleRolloutGrowthBytes && !durableEvidence(input.explanations?.parentGrowth)) {
        add("SH-PARENT-ROLLOUT-GROWTH", "parent-rollout");
      }
    }
  }

  const child = observation.childRollout;
  if (!new Set(["not-created", "pending-provider-path", "not-applicable", "measured"]).has(child.state)
    || (child.state === "measured" && !natural(child.bytes))) {
    add("SH-OBSERVATION-MALFORMED", "child-observation");
  }
  if (input.lifecycle === "before-delegation" && child.state !== "not-created") add("SH-CHILD-LIFECYCLE-INVALID", "child-observation");
  if (input.lifecycle === "active-interval" && child.state !== "pending-provider-path") add("SH-CHILD-LIFECYCLE-INVALID", "child-observation");
  if (input.lifecycle === "subagent-stop" && child.state !== "measured") add("SH-CHILD-PATH-MISSING", "child-observation");
  if (["after-issue-completion", "handoff-boundary"].includes(input.lifecycle) && child.state !== "not-applicable") add("SH-CHILD-LIFECYCLE-INVALID", "child-observation");
  if (child.state === "measured"
    && child.bytes >= policy.resources.abnormalSingleRolloutGrowthBytes
    && !durableEvidence(input.explanations?.childGrowth)) {
    add("SH-CHILD-ROLLOUT-GROWTH", "child-rollout");
  }
}

function evaluateValidatedSessionHygiene(policy, input) {
  const diagnostics = [];
  const seen = new Set();
  const add = (code, subject) => {
    const key = `${code}\0${subject}`;
    if (!seen.has(key)) diagnostics.push(Object.freeze({ code, subject }));
    seen.add(key);
  };

  if (!validatePolicy(policy, add)) return Object.freeze({ decision: "block", diagnostics: Object.freeze(diagnostics) });
  if (!isRecord(input)
    || input.schemaVersion !== EVALUATION_SCHEMA
    || !nonEmpty(input.repositoryRoot)
    || !/^#[1-9][0-9]*$/.test(input.issue ?? "")
    || !LIFECYCLES.has(input.lifecycle)) {
    add("SH-EVALUATION-INPUT-INVALID", "evaluation");
    return Object.freeze({ decision: "block", diagnostics: Object.freeze(diagnostics) });
  }

  validateAssignmentAndContext(policy, input, add);
  validateObservation(policy, input, add);

  if (["after-issue-completion", "handoff-boundary"].includes(input.lifecycle)) {
    if (!Array.isArray(input.essentialEvidence)
      || input.essentialEvidence.length === 0
      || input.essentialEvidence.some((evidence) => !durableEvidence(evidence))) {
      add("SH-EVIDENCE-NOT-DURABLE", "essential-evidence");
    }
  }

  return Object.freeze({
    decision: diagnostics.length === 0 ? "allow" : "block",
    diagnostics: Object.freeze(diagnostics),
  });
}

export function evaluateSessionHygiene({ repositoryRoot, projectionPath, input } = {}) {
  let policy;
  try {
    policy = loadPolicyProjection({ repositoryRoot, projectionPath });
  } catch (error) {
    const code = ["SH-PROJECTION-STALE", "SH-DELEGATION-LIMIT-APPROVAL"].includes(error?.code)
      ? error.code
      : "SH-PROJECTION-INVALID";
    return Object.freeze({
      decision: "block",
      diagnostics: Object.freeze([Object.freeze({ code, subject: "policy" })]),
    });
  }
  return evaluateValidatedSessionHygiene(policy, input);
}

export function evaluateRestartBoundary(input) {
  const diagnostics = [];
  const add = (code, subject) => diagnostics.push(Object.freeze({ code, subject }));
  if (!isRecord(input)
    || Object.keys(input).length !== RESTART_INPUT_KEYS.size
    || Object.keys(input).some((key) => !RESTART_INPUT_KEYS.has(key))
    || input.schemaVersion !== RESTART_SCHEMA
    || typeof input.merged !== "boolean"
    || typeof input.safeBoundary !== "boolean"
    || typeof input.compactDurableHandoffVerified !== "boolean"
    || !["fresh-without-resume", "resume", "not-started"].includes(input.startMode)
    || !Array.isArray(input.changeClasses)
    || input.changeClasses.length === 0
    || new Set(input.changeClasses).size !== input.changeClasses.length
    || input.changeClasses.some((kind) => !EFFECTIVE_CHANGE_CLASSES.has(kind) && !INERT_CHANGE_CLASSES.has(kind))) {
    add("SH-RESTART-INPUT-INVALID", "restart-boundary");
    return Object.freeze({ restartRequired: false, decision: "block", diagnostics: Object.freeze(diagnostics) });
  }

  const restartRequired = input.merged && input.changeClasses.some((kind) => EFFECTIVE_CHANGE_CLASSES.has(kind));
  if (restartRequired) {
    if (!input.safeBoundary) add("SH-RESTART-SAFE-BOUNDARY", "restart-boundary");
    if (!input.compactDurableHandoffVerified) add("SH-RESTART-HANDOFF", "durable-handoff");
    if (input.startMode !== "fresh-without-resume") add("SH-RESTART-WITHOUT-RESUME", "session-start");
  }
  return Object.freeze({
    restartRequired,
    decision: diagnostics.length === 0 ? "allow" : "block",
    diagnostics: Object.freeze(diagnostics),
  });
}

export const SESSION_HYGIENE_EVALUATION_SCHEMA = EVALUATION_SCHEMA;
export const SESSION_HYGIENE_RESTART_SCHEMA = RESTART_SCHEMA;
