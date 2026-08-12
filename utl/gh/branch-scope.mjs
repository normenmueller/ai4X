#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const CONTRACT_VERSION = "1.0.0";
const GITHUB_COMMIT_CAP = 250;
const GITHUB_FILE_CAP = 3000;
const MAX_BUFFER = 64 * 1024 * 1024;
export const LIFECYCLE_EVENTS = Object.freeze([
  "pull-request-created",
  "base-or-head-changed",
  "ready-for-review",
  "issue-in-review",
  "final-conformance",
]);
export const PO_RESERVED_CONSTRAINTS = Object.freeze([
  "base-replacement",
  "preserve-original-branch",
  "preserve-original-pull-request",
  "no-force-push",
  "no-branch-deletion",
  "no-destructive-rewrite",
]);
const LIFECYCLE_PREDECESSORS = Object.freeze({
  "pull-request-created": null,
  "base-or-head-changed": null,
  "ready-for-review": ["pull-request-created", "base-or-head-changed"],
  "issue-in-review": ["ready-for-review"],
  "final-conformance": ["issue-in-review"],
});

export class ScopeFailure extends Error {
  constructor(kind, message, details = {}) {
    super(message);
    this.name = "ScopeFailure";
    this.kind = kind;
    this.details = details;
  }
}

function fail(kind, message, details = {}) {
  throw new ScopeFailure(kind, message, details);
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: options.binary ? null : "utf8",
    cwd: options.cwd,
    env: options.env,
    maxBuffer: MAX_BUFFER,
  });
}

function runGit(repo, args, options = {}) {
  return run("git", ["-C", repo, ...args], options);
}

function gitText(repo, args, failureKind = "git_evidence_unavailable") {
  const result = runGit(repo, args);
  if (result.status !== 0) {
    fail(failureKind, `git ${args[0]} failed`, {
      stderr: result.stderr.trim(),
    });
  }
  return result.stdout.trim();
}

function requireString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    fail("invalid_input", `${label} must be a non-empty string`);
  }
  return value;
}

function requireWorkItem(value, label) {
  requireString(value, label);
  if (!/^#[1-9][0-9]*$/.test(value)) {
    fail("invalid_input", `${label} must be a canonical GitHub Issue identity such as #118`);
  }
  return value;
}

function requireFullOid(value, label) {
  requireString(value, label);
  if (!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(value)) {
    fail("invalid_input", `${label} must be a full lowercase object ID`, {
      value,
    });
  }
  return value;
}

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail("invalid_input", `${label} must be an object`);
  }
  return value;
}

function requireBoolean(value, label) {
  if (typeof value !== "boolean") {
    fail("invalid_input", `${label} must be a boolean`);
  }
  return value;
}

function requireNonNegativeInteger(value, label) {
  if (!Number.isInteger(value) || value < 0) {
    fail("invalid_input", `${label} must be a non-negative integer`);
  }
  return value;
}

function requireArray(value, label) {
  if (!Array.isArray(value)) {
    fail("invalid_input", `${label} must be an array`);
  }
  return value;
}

function canonicalJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

export function digestJson(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function sortUniqueStrings(values, label, duplicateKind = "invalid_input") {
  const sorted = [...values].sort(compareUtf8);
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index] === sorted[index - 1]) {
      fail(duplicateKind, `${label} contains a duplicate`, {
        value: sorted[index],
      });
    }
  }
  return sorted;
}

function requireLosslessUtf8String(value, label) {
  requireString(value, label);
  const encoded = Buffer.from(value, "utf8");
  let decoded;
  try {
    decoded = new TextDecoder("utf-8", { fatal: true }).decode(encoded);
  } catch {
    fail("lossy_path_representation", `${label} is not lossless UTF-8`);
  }
  if (decoded !== value) {
    fail("lossy_path_representation", `${label} is not lossless UTF-8`);
  }
  return value;
}

function normalizePrimitiveRecord(record, label) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    fail("invalid_input", `${label} must be an object`);
  }
  const operation = requireString(record.operation, `${label}.operation`);
  const allowed = new Set(["add", "delete", "modify", "type-change"]);
  if (!allowed.has(operation)) {
    fail("invalid_input", `${label}.operation is not provider-neutral`, {
      operation,
    });
  }
  const recordPath = requireLosslessUtf8String(record.path, `${label}.path`);
  if (recordPath.startsWith("/") || recordPath.includes("\0")) {
    fail("invalid_input", `${label}.path must be a repository-relative Git path`);
  }
  return { operation, path: recordPath };
}

function recordKey(record) {
  return `${record.operation}\0${record.path}`;
}

export function sortPrimitiveRecords(records, label = "records") {
  const normalized = records.map((record, index) =>
    normalizePrimitiveRecord(record, `${label}[${index}]`),
  );
  normalized.sort((left, right) => {
    const operationOrder = compareUtf8(left.operation, right.operation);
    return operationOrder === 0 ? compareUtf8(left.path, right.path) : operationOrder;
  });
  const seen = new Set();
  for (const record of normalized) {
    const key = recordKey(record);
    if (seen.has(key)) {
      fail("invalid_input", `${label} contains a duplicate primitive record`, {
        record,
      });
    }
    seen.add(key);
  }
  return normalized;
}

function sameJson(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

function assertEqual(expected, actual, kind, label) {
  if (!sameJson(expected, actual)) {
    fail(kind, `${label} differs from approved intent`, { expected, actual });
  }
}

function decodeUtf8Lossless(buffer, label) {
  let value;
  try {
    value = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    fail("lossy_path_representation", `${label} is not valid UTF-8`);
  }
  if (!Buffer.from(value, "utf8").equals(buffer)) {
    fail("lossy_path_representation", `${label} does not round-trip losslessly`);
  }
  return value;
}

function splitNul(buffer, label) {
  if (buffer.length === 0) return [];
  if (buffer.at(-1) !== 0) {
    fail("git_evidence_unavailable", `${label} is not NUL-terminated`);
  }
  const parts = [];
  let start = 0;
  for (let index = 0; index < buffer.length; index += 1) {
    if (buffer[index] === 0) {
      parts.push(buffer.subarray(start, index));
      start = index + 1;
    }
  }
  return parts;
}

export function parseLocalNameStatus(buffer) {
  const fields = splitNul(buffer, "git diff --name-status output");
  if (fields.length % 2 !== 0) {
    fail("git_evidence_unavailable", "git diff output has incomplete records");
  }
  const records = [];
  for (let index = 0; index < fields.length; index += 2) {
    const status = decodeUtf8Lossless(fields[index], "git diff status");
    const recordPath = decodeUtf8Lossless(fields[index + 1], "git diff path");
    const operation = {
      A: "add",
      D: "delete",
      M: "modify",
      T: "type-change",
    }[status];
    if (!operation) {
      fail("lossy_path_representation", "unsupported local diff operation", {
        status,
        path: recordPath,
      });
    }
    records.push({ operation, path: recordPath });
  }
  return sortPrimitiveRecords(records, "local changed-file records");
}

export function normalizeGithubFile(file) {
  if (!file || typeof file !== "object") {
    fail("github_evidence_incomplete", "GitHub changed-file record is invalid");
  }
  const filename = requireLosslessUtf8String(file.filename, "GitHub filename");
  switch (file.status) {
    case "added":
      return [{ operation: "add", path: filename }];
    case "removed":
      return [{ operation: "delete", path: filename }];
    case "modified":
      return [{ operation: "modify", path: filename }];
    case "changed":
      return [{ operation: "type-change", path: filename }];
    case "renamed":
      return [
        {
          operation: "delete",
          path: requireLosslessUtf8String(
            file.previous_filename,
            "GitHub previous_filename",
          ),
        },
        { operation: "add", path: filename },
      ];
    case "copied":
      return [{ operation: "add", path: filename }];
    default:
      fail("lossy_path_representation", "unsupported GitHub file status", {
        status: file.status,
        filename,
      });
  }
}

export function normalizeGithubFiles(files) {
  return sortPrimitiveRecords(files.flatMap(normalizeGithubFile), "GitHub primitive records");
}

function githubRepositoryFromPath(pathname, label) {
  if (pathname.includes("%") || pathname.includes("\\") || pathname.includes("\0")) {
    fail("repository_mismatch", `${label} contains an ambiguous repository path`);
  }
  const parts = pathname.replace(/^\//, "").split("/");
  if (parts.length !== 2) {
    fail("repository_mismatch", `${label} must contain exactly owner/repository`);
  }
  const owner = parts[0];
  const repository = parts[1].replace(/\.git$/, "");
  const validName = /^[A-Za-z0-9_.-]+$/;
  if (
    !validName.test(owner) ||
    !validName.test(repository) ||
    [".", ".."].includes(owner) ||
    [".", ".."].includes(repository)
  ) {
    fail("repository_mismatch", `${label} contains an invalid owner or repository`);
  }
  return `${owner}/${repository}`;
}

export function parseGithubRemoteUrl(remoteUrl) {
  requireString(remoteUrl, "remote URL");
  const scp = remoteUrl.match(/^git@github\.com:([^/]+\/[^/]+)$/);
  if (scp) {
    const repository = githubRepositoryFromPath(scp[1], "SSH remote URL");
    return {
      repository,
      transport: "ssh",
      endpoint: `github.com/${repository}`,
    };
  }
  let parsed;
  try {
    parsed = new URL(remoteUrl);
  } catch {
    fail("repository_mismatch", "remote URL is not a supported GitHub URL", { remoteUrl });
  }
  const isHttps = parsed.protocol === "https:";
  const isSsh = parsed.protocol === "ssh:";
  if (
    (!isHttps && !isSsh) ||
    parsed.hostname.toLowerCase() !== "github.com" ||
    parsed.password ||
    parsed.search ||
    parsed.hash ||
    (isHttps && (parsed.username || parsed.port)) ||
    (isSsh && (parsed.username !== "git" || !["", "22"].includes(parsed.port)))
  ) {
    fail("repository_mismatch", "remote URL is not an exact supported github.com endpoint", {
      remoteUrl,
    });
  }
  const repository = githubRepositoryFromPath(parsed.pathname, "remote URL");
  return {
    repository,
    transport: isHttps ? "https" : "ssh",
    endpoint: `github.com/${repository}`,
  };
}

function gitConfigValues(repo, key) {
  const result = runGit(repo, ["config", "--null", "--get-all", key], { binary: true });
  if (result.status === 1) return [];
  if (result.status !== 0) {
    fail("repository_mismatch", `cannot read ${key}`, {
      stderr: result.stderr.toString("utf8").trim(),
    });
  }
  const values = result.stdout.toString("utf8").split("\0").filter((value) => value.length > 0);
  return values;
}

function resolveRepository(repo, remote) {
  const topLevel = gitText(repo, ["rev-parse", "--show-toplevel"]);
  const fetchUrls = gitConfigValues(repo, `remote.${remote}.url`);
  const configuredPushUrls = gitConfigValues(repo, `remote.${remote}.pushurl`);
  if (fetchUrls.length !== 1 || configuredPushUrls.length > 1) {
    fail("repository_mismatch", "remote requires exactly one fetch URL and at most one push URL", {
      remote,
      fetchUrlCount: fetchUrls.length,
      pushUrlCount: configuredPushUrls.length,
    });
  }
  const fetch = parseGithubRemoteUrl(fetchUrls[0]);
  const push = parseGithubRemoteUrl(configuredPushUrls[0] ?? fetchUrls[0]);
  if (fetch.repository.toLowerCase() !== push.repository.toLowerCase()) {
    fail("repository_mismatch", "remote fetch and push URLs identify different repositories", {
      fetchRepository: fetch.repository,
      pushRepository: push.repository,
    });
  }
  return {
    topLevel,
    repository: fetch.repository,
    remoteBinding: {
      remote,
      repository: fetch.repository,
      fetch: { transport: fetch.transport, endpoint: fetch.endpoint },
      push: { transport: push.transport, endpoint: push.endpoint },
    },
  };
}

function snapshotRecoveryState(repo) {
  const binaryCommands = {
    status: ["status", "--porcelain=v2", "-z", "--untracked-files=normal"],
    heads: ["for-each-ref", "--format=%(refname) %(objectname)%00", "refs/heads"],
    remotes: ["for-each-ref", "--format=%(refname) %(objectname)%00", "refs/remotes"],
    tags: ["for-each-ref", "--format=%(refname) %(objectname)%00", "refs/tags"],
    config: ["config", "--local", "--null", "--list"],
  };
  const snapshot = {};
  for (const [name, args] of Object.entries(binaryCommands)) {
    const result = runGit(repo, args, { binary: true });
    if (result.status !== 0) {
      fail("git_evidence_unavailable", `cannot snapshot ${name}`, {
        stderr: result.stderr.toString("utf8").trim(),
      });
    }
    snapshot[name] = result.stdout.toString("base64");
  }
  return snapshot;
}

function observeTarget(repo, remote, targetRef) {
  if (!/^refs\/heads\/[A-Za-z0-9._/-]+$/.test(targetRef) || targetRef.includes("..")) {
    fail("invalid_input", "target reference must be one explicit refs/heads reference", {
      targetRef,
    });
  }
  const before = snapshotRecoveryState(repo);
  const fetch = runGit(repo, ["fetch", "--no-tags", "--refmap=", remote, targetRef]);
  const after = snapshotRecoveryState(repo);
  if (!sameJson(before, after)) {
    fail("observation_mutated_state", "target observation changed recovery-relevant state");
  }
  if (fetch.status !== 0) {
    fail("target_unavailable", "cannot fetch approved target", {
      remote,
      targetRef,
      stderr: fetch.stderr.trim(),
    });
  }
  return requireFullOid(
    gitText(repo, ["rev-parse", "FETCH_HEAD"], "target_unavailable"),
    "fetched target OID",
  );
}

function parseDirtyState(buffer) {
  const fields = splitNul(buffer, "git status output");
  const dirty = [];
  for (let index = 0; index < fields.length; index += 1) {
    const entry = fields[index];
    if (entry.length < 4) {
      fail("git_evidence_unavailable", "git status entry is malformed");
    }
    const code = entry.subarray(0, 2).toString("ascii");
    const entryPath = decodeUtf8Lossless(entry.subarray(3), "dirty path");
    dirty.push({ code, path: entryPath });
    if (code.includes("R") || code.includes("C")) {
      index += 1;
      if (index >= fields.length) {
        fail("git_evidence_unavailable", "renamed status entry lacks its second path");
      }
      dirty.push({ code, path: decodeUtf8Lossless(fields[index], "dirty original path") });
    }
  }
  return dirty;
}

function dirtyState(repo) {
  const result = runGit(repo, ["status", "--porcelain=v1", "-z", "--untracked-files=normal"], {
    binary: true,
  });
  if (result.status !== 0) {
    fail("git_evidence_unavailable", "cannot inspect index and worktree", {
      stderr: result.stderr.toString("utf8").trim(),
    });
  }
  return parseDirtyState(result.stdout);
}

function assertClean(repo) {
  const dirty = dirtyState(repo);
  if (dirty.length > 0) {
    fail("dirty_worktree", "index or worktree is not clean", { dirty });
  }
}

function localCommitSet(repo, baseOid, headOid) {
  const output = gitText(repo, ["rev-list", `${baseOid}..${headOid}`]);
  const values = output.length === 0 ? [] : output.split("\n");
  values.forEach((oid, index) => requireFullOid(oid, `actual commit OID ${index}`));
  return sortUniqueStrings(values, "actual commits");
}

function localPrimitiveRecords(repo, baseOid, headOid) {
  const result = runGit(
    repo,
    ["diff", "--name-status", "-z", "--no-renames", `${baseOid}...${headOid}`],
    { binary: true },
  );
  if (result.status !== 0) {
    fail("git_evidence_unavailable", "cannot enumerate local changed files", {
      stderr: result.stderr.toString("utf8").trim(),
    });
  }
  return parseLocalNameStatus(result.stdout);
}

function baseAuthorityAnchor(entry) {
  return {
    revision: entry.revision,
    approver: entry.approver,
    baseOid: entry.baseOid,
  };
}

function validateBaseLineage(base, constraints) {
  const lineage = requireArray(base.lineage, "baseAuthorization.lineage");
  if (lineage.length === 0) {
    fail("approval_missing_or_stale", "Base Authorization lineage must contain its initial anchor");
  }
  const revisions = new Set();
  const normalized = lineage.map((rawEntry, index) => {
    const entry = requireObject(rawEntry, `baseAuthorization.lineage[${index}]`);
    if (entry.sequence !== index + 1) {
      fail("approval_missing_or_stale", "Base Authorization lineage sequence is not contiguous");
    }
    requireString(entry.revision, `baseAuthorization.lineage[${index}].revision`);
    requireString(entry.approver, `baseAuthorization.lineage[${index}].approver`);
    requireFullOid(entry.baseOid, `baseAuthorization.lineage[${index}].baseOid`);
    if (revisions.has(entry.revision)) {
      fail("approval_missing_or_stale", "Base Authorization lineage repeats a revision");
    }
    revisions.add(entry.revision);
    if (index === 0) {
      if (entry.replacementApproval !== null) {
        fail("approval_missing_or_stale", "initial Base Authorization cannot claim replacement approval");
      }
      return entry;
    }
    const prior = lineage[index - 1];
    if (
      !entry.replacementApproval ||
      typeof entry.replacementApproval !== "object" ||
      Array.isArray(entry.replacementApproval)
    ) {
      fail("approval_missing_or_stale", "replacement Base Authorization approval is missing");
    }
    const approval = entry.replacementApproval;
    if (
      entry.approver !== prior.approver ||
      entry.baseOid === prior.baseOid ||
      approval.previousRevision !== prior.revision ||
      approval.previousBaseOid !== prior.baseOid ||
      approval.previousApprover !== prior.approver ||
      approval.previousAuthorityDigest !== digestJson(baseAuthorityAnchor(prior))
    ) {
      fail(
        "approval_missing_or_stale",
        "replacement Base Authorization is not bound to the exact preceding authority anchor",
      );
    }
    if (typeof approval.poApprover !== "string" || approval.poApprover.length === 0) {
      fail("approval_missing_or_stale", "replacement product-owner approver is missing");
    }
    if (approval.poAuthority !== "product-owner") {
      fail("approval_missing_or_stale", "replacement requires product-owner authority");
    }
    if (
      typeof approval.poApprovalRevision !== "string" ||
      approval.poApprovalRevision.length === 0
    ) {
      fail("approval_missing_or_stale", "replacement product-owner approval revision is missing");
    }
    if (
      approval.preserveOriginalBranch !== true ||
      approval.preserveOriginalPullRequest !== true ||
      approval.destructiveActionsAuthorized !== false
    ) {
      fail(
        "approval_missing_or_stale",
        "replacement must preserve the original branch and pull request and prohibit destructive actions",
      );
    }
    return entry;
  });
  const current = normalized.at(-1);
  if (
    current.revision !== base.revision ||
    current.approver !== base.approver ||
    current.baseOid !== base.baseOid
  ) {
    fail("approval_missing_or_stale", "current Base Authorization differs from its lineage tip");
  }
  if (normalized.length > 1) {
    assertEqual(
      [...PO_RESERVED_CONSTRAINTS].sort(compareUtf8),
      constraints,
      "approval_missing_or_stale",
      "replacement PO-reserved constraints",
    );
  }
  if (Object.hasOwn(base, "replacement")) {
    fail("invalid_input", "baseAuthorization.replacement is obsolete; use the sole lineage authority");
  }
  base.lineage = normalized;
}

export function validateIntent(intent) {
  requireObject(intent, "intent");
  if (intent.contractVersion !== CONTRACT_VERSION) {
    fail("invalid_input", `contractVersion must be ${CONTRACT_VERSION}`);
  }
  const ready = requireObject(intent.readyAuthority, "readyAuthority");
  if (!ready || ready.granted !== true) {
    fail("approval_missing_or_stale", "PO Ready authority is missing");
  }
  if (ready.authority !== "product-owner") {
    fail("approval_missing_or_stale", "Ready authority requires product-owner authority");
  }
  requireString(ready.approver, "readyAuthority.approver");
  requireString(ready.revision, "readyAuthority.revision");
  requireWorkItem(ready.workItem, "readyAuthority.workItem");
  const base = requireObject(intent.baseAuthorization, "baseAuthorization");
  requireString(base.revision, "baseAuthorization.revision");
  requireString(base.approver, "baseAuthorization.approver");
  if (base.authority !== "tech-lead") {
    fail("approval_missing_or_stale", "Base Authorization requires tech-lead authority");
  }
  requireWorkItem(base.workItem, "baseAuthorization.workItem");
  requireString(base.targetRepository, "baseAuthorization.targetRepository");
  requireString(base.remote, "baseAuthorization.remote");
  requireString(base.targetRef, "baseAuthorization.targetRef");
  requireFullOid(base.baseOid, "baseAuthorization.baseOid");
  if (ready.workItem !== base.workItem) {
    fail("approval_missing_or_stale", "Ready authority and Base Authorization bind different work items");
  }
  const constraints = sortUniqueStrings(
    requireArray(base.poReservedConstraints, "baseAuthorization.poReservedConstraints").map(
      (constraint, index) =>
        requireString(constraint, `baseAuthorization.poReservedConstraints[${index}]`),
    ),
    "PO-reserved constraints",
  );
  for (const constraint of constraints) {
    if (!PO_RESERVED_CONSTRAINTS.includes(constraint)) {
      fail("approval_missing_or_stale", "unknown PO-reserved constraint", { constraint });
    }
  }
  base.poReservedConstraints = constraints;
  if (base.workItem === "#120") {
    assertEqual(
      [...PO_RESERVED_CONSTRAINTS].sort(compareUtf8),
      constraints,
      "approval_missing_or_stale",
      "#120 PO-reserved constraints",
    );
  }
  validateBaseLineage(base, constraints);

  const publication = requireObject(intent.publicationIntent, "publicationIntent");
  requireString(publication.revision, "publicationIntent.revision");
  requireString(publication.approver, "publicationIntent.approver");
  if (publication.authority !== "tech-lead") {
    fail("approval_missing_or_stale", "Publication Intent requires tech-lead authority");
  }
  if (publication.approver !== base.approver) {
    fail(
      "approval_missing_or_stale",
      "Publication Intent requires the same Tech Lead approval authority as the Base Authorization",
    );
  }
  if (publication.baseAuthorizationRevision !== base.revision) {
    fail("approval_missing_or_stale", "Publication Intent references the wrong Base Authorization");
  }
  if (typeof publication.workItem !== "string" || publication.workItem.length === 0) {
    fail("approval_missing_or_stale", "Publication Intent work-item identity is missing");
  }
  requireWorkItem(publication.workItem, "publicationIntent.workItem");
  if (publication.workItem !== base.workItem) {
    fail("approval_missing_or_stale", "Publication Intent binds the wrong work item");
  }
  const expectedCommits = requireArray(
    publication.expectedCommitOids,
    "publicationIntent.expectedCommitOids",
  );
  expectedCommits.forEach((oid, index) =>
    requireFullOid(oid, `publicationIntent.expectedCommitOids[${index}]`),
  );
  publication.expectedCommitOids = sortUniqueStrings(expectedCommits, "expected commits");
  publication.expectedPrimitiveRecords = sortPrimitiveRecords(
    requireArray(
      publication.expectedPrimitiveRecords,
      "publicationIntent.expectedPrimitiveRecords",
    ),
    "expected primitive records",
  );
  return intent;
}

function loadJson(filePath, label) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail("invalid_input", `cannot read ${label}`, {
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });
  }
  return parsed;
}

function intentDigest(intent) {
  return digestJson(intent);
}

function authorityEvidence(intent) {
  const base = intent.baseAuthorization;
  const publication = intent.publicationIntent;
  return {
    ready: {
      approver: intent.readyAuthority.approver,
      authority: intent.readyAuthority.authority,
      revision: intent.readyAuthority.revision,
      workItem: intent.readyAuthority.workItem,
    },
    base: {
      approver: base.approver,
      authority: base.authority,
      revision: base.revision,
      workItem: base.workItem,
      poReservedConstraints: base.poReservedConstraints,
      lineage: base.lineage,
    },
    publication: {
      approver: publication.approver,
      authority: publication.authority,
      revision: publication.revision,
      workItem: publication.workItem,
      baseAuthorizationRevision: publication.baseAuthorizationRevision,
    },
  };
}

function inventoryEvidence(commits, records) {
  return {
    commits,
    commitCount: commits.length,
    commitDigest: digestJson(commits),
    primitiveRecords: records,
    primitiveRecordCount: records.length,
    primitiveRecordDigest: digestJson(records),
  };
}

function validateInventoryEvidence(value, label) {
  const evidence = requireObject(value, label);
  const commits = sortUniqueStrings(
    requireArray(evidence.commits, `${label}.commits`).map((oid, index) =>
      requireFullOid(oid, `${label}.commits[${index}]`),
    ),
    `${label}.commits`,
  );
  const records = sortPrimitiveRecords(
    requireArray(evidence.primitiveRecords, `${label}.primitiveRecords`),
    `${label}.primitiveRecords`,
  );
  if (
    evidence.commitCount !== commits.length ||
    evidence.primitiveRecordCount !== records.length ||
    evidence.commitDigest !== digestJson(commits) ||
    evidence.primitiveRecordDigest !== digestJson(records)
  ) {
    fail("stale_local_proof", `${label} digest does not bind its complete inventory`);
  }
  return { ...evidence, commits, primitiveRecords: records };
}

function localProofSnapshot({ identity, base, currentTargetOid, headOid, mergeBaseOid }) {
  return {
    repository: identity.repository,
    remoteBinding: identity.remoteBinding,
    targetRepository: base.targetRepository,
    targetRef: base.targetRef,
    approvedBaseOid: base.baseOid,
    currentTargetOid,
    verifiedHeadOid: headOid,
    mergeBaseOid,
    indexClean: true,
    worktreeClean: true,
  };
}

function verifyRepositoryIdentity(repo, base) {
  const identity = resolveRepository(repo, base.remote);
  if (identity.repository.toLowerCase() !== base.targetRepository.toLowerCase()) {
    fail("repository_mismatch", "local remote does not match approved target repository", {
      expected: base.targetRepository,
      actual: identity.repository,
    });
  }
  return identity;
}

export function validateObservationClosure({
  approvedBaseOid,
  provenTargetOid,
  provenHeadOid,
  provenRemoteBinding,
  before,
  after,
}) {
  requireFullOid(approvedBaseOid, "approved base OID");
  requireFullOid(provenTargetOid, "proven target OID");
  requireFullOid(provenHeadOid, "proven HEAD OID");
  requireObject(provenRemoteBinding, "proven remote binding");
  for (const [label, observation] of [
    ["before", before],
    ["after", after],
  ]) {
    requireObject(observation, `${label} local observation`);
    requireFullOid(observation.targetOid, `${label} target OID`);
    requireFullOid(observation.headOid, `${label} HEAD OID`);
    requireObject(observation.remoteBinding, `${label} remote binding`);
    requireBoolean(observation.indexClean, `${label} index cleanliness`);
    requireBoolean(observation.worktreeClean, `${label} worktree cleanliness`);
  }
  if (
    before.targetOid !== approvedBaseOid ||
    before.targetOid !== provenTargetOid ||
    after.targetOid !== approvedBaseOid ||
    after.targetOid !== provenTargetOid ||
    after.targetOid !== before.targetOid
  ) {
    fail("target_moved", "target moved during GitHub evidence observation", {
      approvedBaseOid,
      provenTargetOid,
      beforeTargetOid: before.targetOid,
      afterTargetOid: after.targetOid,
    });
  }
  if (
    before.headOid !== provenHeadOid ||
    after.headOid !== provenHeadOid ||
    after.headOid !== before.headOid
  ) {
    fail("unstable_local_snapshot", "local HEAD changed during GitHub evidence observation", {
      provenHeadOid,
      beforeHeadOid: before.headOid,
      afterHeadOid: after.headOid,
    });
  }
  if (!sameJson(before.remoteBinding, after.remoteBinding)) {
    fail(
      "unstable_local_snapshot",
      "fetch or push remote binding changed during GitHub evidence observation",
    );
  }
  if (!sameJson(before.remoteBinding, provenRemoteBinding)) {
    fail(
      "stale_local_proof",
      "observed fetch or push remote binding differs from the pre-push proof",
    );
  }
  if (
    before.indexClean !== true ||
    before.worktreeClean !== true ||
    after.indexClean !== true ||
    after.worktreeClean !== true
  ) {
    fail("dirty_worktree", "index or worktree changed during GitHub evidence observation");
  }
  return {
    targetOid: after.targetOid,
    headOid: after.headOid,
    remoteBinding: after.remoteBinding,
    indexClean: true,
    worktreeClean: true,
  };
}

export function verifyLocal(repo, rawIntent) {
  const intent = validateIntent(structuredClone(rawIntent));
  const base = intent.baseAuthorization;
  const publication = intent.publicationIntent;
  const identity = verifyRepositoryIdentity(repo, base);
  const currentTargetOid = observeTarget(repo, base.remote, base.targetRef);
  if (currentTargetOid !== base.baseOid) {
    fail("target_moved", "current target OID differs from approved base", {
      approvedBaseOid: base.baseOid,
      currentTargetOid,
    });
  }
  assertClean(repo);
  const headOid = requireFullOid(gitText(repo, ["rev-parse", "HEAD"]), "HEAD OID");
  const mergeBaseOid = requireFullOid(
    gitText(repo, ["merge-base", base.baseOid, headOid], "merge_base_mismatch"),
    "merge-base OID",
  );
  if (mergeBaseOid !== base.baseOid) {
    fail("merge_base_mismatch", "merge base differs from approved base", {
      approvedBaseOid: base.baseOid,
      mergeBaseOid,
    });
  }
  const actualCommits = localCommitSet(repo, base.baseOid, headOid);
  const actualRecords = localPrimitiveRecords(repo, base.baseOid, headOid);
  const expected = inventoryEvidence(
    publication.expectedCommitOids,
    publication.expectedPrimitiveRecords,
  );
  const actual = inventoryEvidence(actualCommits, actualRecords);
  const proofSnapshot = localProofSnapshot({
    identity,
    base,
    currentTargetOid,
    headOid,
    mergeBaseOid,
  });
  if (!sameJson(publication.expectedCommitOids, actualCommits)) {
    fail("expected_commit_mismatch", "commit set differs from approved intent", {
      expected: publication.expectedCommitOids,
      actual: actualCommits,
      proofSnapshot,
      availableEvidence: { expected, actual },
    });
  }
  if (!sameJson(publication.expectedPrimitiveRecords, actualRecords)) {
    fail(
      "changed_file_record_mismatch",
      "primitive changed-file records differ from approved intent",
      {
        expected: publication.expectedPrimitiveRecords,
        actual: actualRecords,
        proofSnapshot,
        availableEvidence: { expected, actual },
      },
    );
  }
  return {
    contractVersion: CONTRACT_VERSION,
    kind: "local-proof",
    phase: "local-verification",
    verdict: "pass",
    repository: identity.repository,
    remoteBinding: identity.remoteBinding,
    readyRevision: intent.readyAuthority.revision,
    baseAuthorizationRevision: base.revision,
    publicationIntentRevision: publication.revision,
    intentDigest: intentDigest(intent),
    targetRepository: base.targetRepository,
    targetRef: base.targetRef,
    approvedBaseOid: base.baseOid,
    currentTargetOid,
    verifiedHeadOid: headOid,
    mergeBaseOid,
    cleanliness: { index: true, worktree: true },
    authority: authorityEvidence(intent),
    expected,
    actual,
    proofSnapshot,
    remediation: null,
  };
}

function validateProof(rawProof, intent, expectedKind = "local-proof") {
  if (!rawProof || typeof rawProof !== "object" || rawProof.kind !== expectedKind) {
    fail("invalid_input", `proof kind must be ${expectedKind}`);
  }
  if (rawProof.contractVersion !== CONTRACT_VERSION || rawProof.verdict !== "pass") {
    fail("approval_missing_or_stale", "proof contract or verdict is invalid");
  }
  if (rawProof.intentDigest !== intentDigest(intent)) {
    fail("stale_local_proof", "proof does not bind the current approved intent");
  }
  if (!["local-verification", "pre-push-refresh"].includes(rawProof.phase)) {
    fail("stale_local_proof", "local proof phase is invalid");
  }
  const base = intent.baseAuthorization;
  const publication = intent.publicationIntent;
  requireString(rawProof.repository, "proof.repository");
  requireObject(rawProof.remoteBinding, "proof.remoteBinding");
  requireFullOid(rawProof.approvedBaseOid, "proof.approvedBaseOid");
  requireFullOid(rawProof.currentTargetOid, "proof.currentTargetOid");
  requireFullOid(rawProof.verifiedHeadOid, "proof.verifiedHeadOid");
  requireFullOid(rawProof.mergeBaseOid, "proof.mergeBaseOid");
  if (
    rawProof.readyRevision !== intent.readyAuthority.revision ||
    rawProof.baseAuthorizationRevision !== base.revision ||
    rawProof.publicationIntentRevision !== publication.revision ||
    rawProof.targetRepository !== base.targetRepository ||
    rawProof.targetRef !== base.targetRef ||
    rawProof.approvedBaseOid !== base.baseOid ||
    rawProof.currentTargetOid !== base.baseOid ||
    rawProof.repository.toLowerCase() !== base.targetRepository.toLowerCase() ||
    rawProof.mergeBaseOid !== base.baseOid
  ) {
    fail("stale_local_proof", "local proof tuple differs from current approved authority");
  }
  const cleanliness = requireObject(rawProof.cleanliness, "proof.cleanliness");
  if (cleanliness.index !== true || cleanliness.worktree !== true) {
    fail("stale_local_proof", "proof does not establish a clean index and worktree");
  }
  if (!sameJson(rawProof.authority, authorityEvidence(intent))) {
    fail("stale_local_proof", "proof approver provenance differs from approved authority");
  }
  const expected = validateInventoryEvidence(rawProof.expected, "proof.expected");
  const actual = validateInventoryEvidence(rawProof.actual, "proof.actual");
  assertEqual(
    publication.expectedCommitOids,
    expected.commits,
    "stale_local_proof",
    "proof expected commits",
  );
  assertEqual(
    publication.expectedPrimitiveRecords,
    expected.primitiveRecords,
    "stale_local_proof",
    "proof expected records",
  );
  assertEqual(expected, actual, "stale_local_proof", "proof expected and actual inventories");
  const snapshot = requireObject(rawProof.proofSnapshot, "proof.proofSnapshot");
  requireString(snapshot.repository, "proof.proofSnapshot.repository");
  requireFullOid(snapshot.approvedBaseOid, "proof.proofSnapshot.approvedBaseOid");
  requireFullOid(snapshot.currentTargetOid, "proof.proofSnapshot.currentTargetOid");
  requireFullOid(snapshot.verifiedHeadOid, "proof.proofSnapshot.verifiedHeadOid");
  requireFullOid(snapshot.mergeBaseOid, "proof.proofSnapshot.mergeBaseOid");
  if (
    snapshot.repository !== rawProof.repository ||
    !sameJson(snapshot.remoteBinding, rawProof.remoteBinding) ||
    snapshot.targetRepository !== rawProof.targetRepository ||
    snapshot.targetRef !== rawProof.targetRef ||
    snapshot.approvedBaseOid !== rawProof.approvedBaseOid ||
    snapshot.currentTargetOid !== rawProof.currentTargetOid ||
    snapshot.verifiedHeadOid !== rawProof.verifiedHeadOid ||
    snapshot.mergeBaseOid !== rawProof.mergeBaseOid ||
    snapshot.indexClean !== true ||
    snapshot.worktreeClean !== true
  ) {
    fail("stale_local_proof", "proof snapshot is incomplete or inconsistent");
  }
  return rawProof;
}

export function verifyPush(repo, rawIntent, rawProof) {
  const intent = validateIntent(structuredClone(rawIntent));
  const proof = validateProof(rawProof, intent);
  const base = intent.baseAuthorization;
  const identity = verifyRepositoryIdentity(repo, base);
  const currentTargetOid = observeTarget(repo, base.remote, base.targetRef);
  if (currentTargetOid !== base.baseOid || currentTargetOid !== proof.currentTargetOid) {
    fail("target_moved", "target moved after local proof", {
      approvedBaseOid: base.baseOid,
      provenTargetOid: proof.currentTargetOid,
      currentTargetOid,
    });
  }
  assertClean(repo);
  const headOid = requireFullOid(gitText(repo, ["rev-parse", "HEAD"]), "HEAD OID");
  if (headOid !== proof.verifiedHeadOid) {
    fail("stale_local_proof", "HEAD changed after local proof", {
      provenHeadOid: proof.verifiedHeadOid,
      currentHeadOid: headOid,
    });
  }
  if (
    identity.repository.toLowerCase() !== proof.repository.toLowerCase() ||
    !sameJson(identity.remoteBinding, proof.remoteBinding)
  ) {
    fail("stale_local_proof", "repository or fetch/push remote binding changed after local proof");
  }
  return {
    ...proof,
    kind: "local-proof",
    phase: "pre-push-refresh",
    pushBoundaryChecked: true,
    currentTargetOid,
    verifiedHeadOid: headOid,
    cleanliness: { index: true, worktree: true },
    proofSnapshot: {
      ...proof.proofSnapshot,
      currentTargetOid,
      verifiedHeadOid: headOid,
      indexClean: true,
      worktreeClean: true,
    },
  };
}

function ghJson(args, failureKind = "github_evidence_unavailable") {
  const result = run("gh", ["api", ...args]);
  if (result.status !== 0) {
    fail(failureKind, "GitHub evidence request failed", {
      args,
      stderr: result.stderr.trim(),
    });
  }
  try {
    return JSON.parse(result.stdout);
  } catch {
    fail("github_evidence_incomplete", "GitHub returned invalid JSON", { args });
  }
}

function ghPages(endpoint) {
  const pages = ghJson(["--paginate", "--slurp", endpoint]);
  if (!Array.isArray(pages) || pages.some((page) => !Array.isArray(page))) {
    fail("pagination_incomplete", "GitHub pagination response is not a page array", {
      endpoint,
    });
  }
  return pages;
}

function prSnapshot(pull) {
  return {
    targetRepository: pull.base?.repo?.full_name,
    baseRef: pull.base?.ref,
    baseOid: pull.base?.sha,
    headRepository: pull.head?.repo?.full_name,
    headRef: pull.head?.ref,
    headOid: pull.head?.sha,
    commitCount: pull.commits,
    changedFileCount: pull.changed_files,
  };
}

function assertSnapshotComplete(snapshot) {
  requireString(snapshot.targetRepository, "GitHub target repository");
  requireString(snapshot.baseRef, "GitHub base reference");
  requireFullOid(snapshot.baseOid, "GitHub base OID");
  requireString(snapshot.headRepository, "GitHub head repository");
  requireString(snapshot.headRef, "GitHub head reference");
  requireFullOid(snapshot.headOid, "GitHub head OID");
  if (!Number.isInteger(snapshot.commitCount) || snapshot.commitCount < 0) {
    fail("github_evidence_incomplete", "GitHub commit count is invalid");
  }
  if (!Number.isInteger(snapshot.changedFileCount) || snapshot.changedFileCount < 0) {
    fail("github_evidence_incomplete", "GitHub changed-file count is invalid");
  }
}

export function validateLifecycleEvent(event) {
  requireString(event, "lifecycle event");
  if (!LIFECYCLE_EVENTS.includes(event)) {
    fail("invalid_input", "lifecycle event is not a governed reconciliation boundary", {
      event,
      allowed: LIFECYCLE_EVENTS,
    });
  }
  return event;
}

function validateLifecycleInput(event, inputProof) {
  const predecessors = LIFECYCLE_PREDECESSORS[event];
  if (predecessors === null) {
    if (inputProof?.kind !== "local-proof") {
      fail(
        "stale_github_proof",
        `${event} requires a renewed pre-push local proof, not a prior GitHub proof`,
      );
    }
    return;
  }
  if (inputProof?.kind !== "github-proof" || !predecessors.includes(inputProof.lifecycleEvent)) {
    fail("stale_github_proof", `${event} requires its governed predecessor GitHub proof`, {
      allowedPredecessors: predecessors,
      actualPredecessor: inputProof?.lifecycleEvent ?? null,
    });
  }
}

function providerFacts(provider) {
  const { evidenceDigest: _ignored, ...facts } = provider;
  return facts;
}

function providerEvidenceDigest(provider, snapshot, actual) {
  return digestJson({ provider: providerFacts(provider), snapshot, actual });
}

export function reconcileGithubEvidence({ intent, proof, before, after, commitPages, filePages }) {
  const checkedIntent = validateIntent(structuredClone(intent));
  const checkedProof = validateProof(proof, checkedIntent);
  assertSnapshotComplete(before);
  assertSnapshotComplete(after);
  if (!sameJson(before, after)) {
    fail("unstable_github_snapshot", "PR base, head, or totals changed during observation", {
      before,
      after,
    });
  }
  if (before.commitCount > GITHUB_COMMIT_CAP || before.changedFileCount > GITHUB_FILE_CAP) {
    fail("provider_cap_or_truncation", "PR exceeds GitHub evidence endpoint cap", {
      commits: before.commitCount,
      changedFiles: before.changedFileCount,
    });
  }
  if (!Array.isArray(commitPages) || commitPages.some((page) => !Array.isArray(page))) {
    fail("pagination_incomplete", "commit pages are incomplete");
  }
  if (!Array.isArray(filePages) || filePages.some((page) => !Array.isArray(page))) {
    fail("pagination_incomplete", "file pages are incomplete");
  }
  const rawCommits = commitPages.flat();
  const rawFiles = filePages.flat();
  if (rawCommits.length !== before.commitCount || rawFiles.length !== before.changedFileCount) {
    fail("pagination_incomplete", "retrieved records do not match provider totals", {
      expectedCommits: before.commitCount,
      actualCommits: rawCommits.length,
      expectedFiles: before.changedFileCount,
      actualFiles: rawFiles.length,
    });
  }
  const commits = sortUniqueStrings(
    rawCommits.map((commit, index) => requireFullOid(commit.sha, `GitHub commit ${index}`)),
    "GitHub commits",
    "pagination_incomplete",
  );
  const uniqueFiles = new Set();
  for (const file of rawFiles) {
    const filename = requireLosslessUtf8String(file.filename, "GitHub filename");
    if (uniqueFiles.has(filename)) {
      fail("pagination_incomplete", "GitHub returned a duplicate changed-file entry", {
        filename,
      });
    }
    uniqueFiles.add(filename);
  }
  const records = normalizeGithubFiles(rawFiles);
  const base = checkedIntent.baseAuthorization;
  const publication = checkedIntent.publicationIntent;
  const provider = {
    commitTotal: before.commitCount,
    changedFileTotal: before.changedFileCount,
    commitPageCount: commitPages.length,
    changedFilePageCount: filePages.length,
    commitPageSizes: commitPages.map((page) => page.length),
    changedFilePageSizes: filePages.map((page) => page.length),
    commitCap: GITHUB_COMMIT_CAP,
    changedFileCap: GITHUB_FILE_CAP,
  };
  const expectedEvidence = inventoryEvidence(
    publication.expectedCommitOids,
    publication.expectedPrimitiveRecords,
  );
  const actualEvidence = inventoryEvidence(commits, records);
  const availableEvidence = { expected: expectedEvidence, actual: actualEvidence, provider };
  const expectedBaseRef = base.targetRef.replace(/^refs\/heads\//, "");
  if (
    before.targetRepository.toLowerCase() !== base.targetRepository.toLowerCase() ||
    before.baseRef !== expectedBaseRef ||
    before.baseOid !== base.baseOid
  ) {
    fail("github_base_mismatch", "GitHub PR base differs from approved base", {
      approved: {
        repository: base.targetRepository,
        ref: expectedBaseRef,
        oid: base.baseOid,
      },
      actual: {
        repository: before.targetRepository,
        ref: before.baseRef,
        oid: before.baseOid,
      },
      proofSnapshot: before,
      availableEvidence,
    });
  }
  if (before.headOid !== checkedProof.verifiedHeadOid) {
    fail("github_head_mismatch", "GitHub PR head differs from local proof", {
      provenHeadOid: checkedProof.verifiedHeadOid,
      githubHeadOid: before.headOid,
      proofSnapshot: before,
      availableEvidence,
    });
  }
  if (!sameJson(publication.expectedCommitOids, commits)) {
    fail("local_github_scope_mismatch", "GitHub commits differ from approved intent", {
      expected: publication.expectedCommitOids,
      actual: commits,
      proofSnapshot: before,
      availableEvidence,
    });
  }
  if (!sameJson(publication.expectedPrimitiveRecords, records)) {
    fail(
      "local_github_scope_mismatch",
      "GitHub primitive changed-file records differ from approved intent",
      {
        expected: publication.expectedPrimitiveRecords,
        actual: records,
        proofSnapshot: before,
        availableEvidence,
      },
    );
  }
  return {
    commits,
    records,
    provider,
  };
}

function validateGithubProof(rawProof, intent) {
  requireObject(rawProof, "GitHub proof");
  if (
    rawProof.kind !== "github-proof" ||
    rawProof.contractVersion !== CONTRACT_VERSION ||
    rawProof.verdict !== "pass" ||
    rawProof.phase !== "github-reconciliation"
  ) {
    fail("stale_github_proof", "GitHub proof header is invalid");
  }
  validateLifecycleEvent(rawProof.lifecycleEvent);
  if (rawProof.intentDigest !== intentDigest(intent)) {
    fail("stale_github_proof", "GitHub proof does not bind the current approved intent");
  }
  requireString(rawProof.repository, "GitHub proof repository");
  requireObject(rawProof.remoteBinding, "GitHub proof remote binding");
  requireNonNegativeInteger(rawProof.pullRequest, "GitHub proof pull request");
  if (rawProof.pullRequest === 0) {
    fail("stale_github_proof", "GitHub proof pull request must be positive");
  }
  if (!sameJson(rawProof.authority, authorityEvidence(intent))) {
    fail("stale_github_proof", "GitHub proof approver provenance is stale");
  }
  if (
    rawProof.readyRevision !== intent.readyAuthority.revision ||
    rawProof.baseAuthorizationRevision !== intent.baseAuthorization.revision ||
    rawProof.publicationIntentRevision !== intent.publicationIntent.revision ||
    rawProof.repository.toLowerCase() !== intent.baseAuthorization.targetRepository.toLowerCase()
  ) {
    fail("stale_github_proof", "GitHub proof authority tuple is stale");
  }
  const localProof = validateProof(rawProof.localProof, intent);
  if (!sameJson(rawProof.remoteBinding, localProof.remoteBinding)) {
    fail("stale_github_proof", "GitHub proof remote binding differs from its local proof");
  }
  const expected = validateInventoryEvidence(rawProof.expected, "GitHub proof expected");
  const actual = validateInventoryEvidence(rawProof.actual, "GitHub proof actual");
  assertEqual(localProof.expected, expected, "stale_github_proof", "GitHub expected inventory");
  assertEqual(localProof.actual, actual, "stale_github_proof", "GitHub actual inventory");
  const snapshot = requireObject(rawProof.proofSnapshot, "GitHub proof snapshot");
  requireString(snapshot.repository, "GitHub proof snapshot repository");
  requireObject(snapshot.remoteBinding, "GitHub proof snapshot remote binding");
  requireNonNegativeInteger(snapshot.pullRequest, "GitHub proof snapshot pull request");
  requireString(snapshot.targetRepository, "GitHub proof target repository");
  requireString(snapshot.baseRef, "GitHub proof base ref");
  requireFullOid(snapshot.githubBaseOid, "GitHub proof base OID");
  requireFullOid(snapshot.currentTargetOid, "GitHub proof current target OID");
  requireString(snapshot.headRepository, "GitHub proof head repository");
  requireString(snapshot.headRef, "GitHub proof head ref");
  requireFullOid(snapshot.githubHeadOid, "GitHub proof head OID");
  requireFullOid(snapshot.mergeBaseOid, "GitHub proof merge-base OID");
  requireNonNegativeInteger(snapshot.commitCount, "GitHub proof snapshot commit count");
  requireNonNegativeInteger(
    snapshot.changedFileCount,
    "GitHub proof snapshot changed-file count",
  );
  if (
    snapshot.repository !== rawProof.repository ||
    !sameJson(snapshot.remoteBinding, rawProof.remoteBinding) ||
    snapshot.pullRequest !== rawProof.pullRequest ||
    snapshot.targetRepository.toLowerCase() !==
      intent.baseAuthorization.targetRepository.toLowerCase() ||
    snapshot.baseRef !== intent.baseAuthorization.targetRef.replace(/^refs\/heads\//, "") ||
    snapshot.githubBaseOid !== intent.baseAuthorization.baseOid ||
    snapshot.currentTargetOid !== intent.baseAuthorization.baseOid ||
    snapshot.githubHeadOid !== localProof.verifiedHeadOid ||
    snapshot.mergeBaseOid !== intent.baseAuthorization.baseOid
  ) {
    fail("stale_github_proof", "GitHub proof snapshot is incomplete or inconsistent");
  }
  const provider = requireObject(rawProof.provider, "GitHub provider evidence");
  requireNonNegativeInteger(provider.commitTotal, "provider.commitTotal");
  requireNonNegativeInteger(provider.changedFileTotal, "provider.changedFileTotal");
  requireNonNegativeInteger(provider.commitPageCount, "provider.commitPageCount");
  requireNonNegativeInteger(provider.changedFilePageCount, "provider.changedFilePageCount");
  const commitPageSizes = requireArray(provider.commitPageSizes, "provider.commitPageSizes");
  const filePageSizes = requireArray(
    provider.changedFilePageSizes,
    "provider.changedFilePageSizes",
  );
  commitPageSizes.forEach((value, index) =>
    requireNonNegativeInteger(value, `provider.commitPageSizes[${index}]`),
  );
  filePageSizes.forEach((value, index) =>
    requireNonNegativeInteger(value, `provider.changedFilePageSizes[${index}]`),
  );
  requireFullOid(provider.evidenceDigest, "provider.evidenceDigest");
  if (
    provider.commitPageCount !== commitPageSizes.length ||
    provider.changedFilePageCount !== filePageSizes.length ||
    provider.commitTotal !== commitPageSizes.reduce((sum, value) => sum + value, 0) ||
    provider.changedFileTotal !== filePageSizes.reduce((sum, value) => sum + value, 0) ||
    provider.commitCap !== GITHUB_COMMIT_CAP ||
    provider.changedFileCap !== GITHUB_FILE_CAP ||
    provider.commitTotal !== actual.commitCount ||
    provider.commitTotal !== snapshot.commitCount ||
    provider.changedFileTotal !== snapshot.changedFileCount ||
    actual.primitiveRecordCount < provider.changedFileTotal ||
    actual.primitiveRecordCount > provider.changedFileTotal * 2 ||
    provider.evidenceDigest !== providerEvidenceDigest(provider, snapshot, actual)
  ) {
    fail("stale_github_proof", "GitHub provider pagination evidence is inconsistent");
  }
  const chain = requireArray(rawProof.lifecycleChain, "GitHub proof lifecycle chain");
  for (const [index, entry] of chain.entries()) {
    requireObject(entry, `GitHub proof lifecycle chain[${index}]`);
    validateLifecycleEvent(entry.lifecycleEvent);
    requireFullOid(entry.proofDigest, `GitHub proof lifecycle chain[${index}].proofDigest`);
    requireFullOid(
      entry.proofSnapshotDigest,
      `GitHub proof lifecycle chain[${index}].proofSnapshotDigest`,
    );
    const entryPredecessors = LIFECYCLE_PREDECESSORS[entry.lifecycleEvent];
    if (
      (index === 0 && entryPredecessors !== null) ||
      (index > 0 &&
        (entryPredecessors === null ||
          !entryPredecessors.includes(chain[index - 1].lifecycleEvent)))
    ) {
      fail("stale_github_proof", "GitHub proof lifecycle chain is discontinuous");
    }
  }
  const predecessors = LIFECYCLE_PREDECESSORS[rawProof.lifecycleEvent];
  if (
    (predecessors === null && chain.length !== 0) ||
    (predecessors !== null &&
      (chain.length === 0 || !predecessors.includes(chain.at(-1).lifecycleEvent)))
  ) {
    fail("stale_github_proof", "GitHub proof lifecycle chain has an invalid predecessor");
  }
  if (
    (chain.length === 0 && rawProof.previousGithubProofDigest !== null) ||
    (chain.length > 0 && rawProof.previousGithubProofDigest !== chain.at(-1).proofDigest)
  ) {
    fail("stale_github_proof", "GitHub proof predecessor digest is inconsistent");
  }
  return { proof: rawProof, localProof };
}

export function buildGithubProof({
  intent: rawIntent,
  inputProof,
  lifecycleEvent,
  githubRepository,
  pullNumber,
  currentTargetOid,
  mergeBaseOid,
  before,
  after,
  commitPages,
  filePages,
}) {
  const intent = validateIntent(structuredClone(rawIntent));
  const event = validateLifecycleEvent(lifecycleEvent);
  requireString(githubRepository, "GitHub repository");
  if (
    githubRepository.toLowerCase() !==
    intent.baseAuthorization.targetRepository.toLowerCase()
  ) {
    fail("repository_mismatch", "GitHub proof repository differs from approved target");
  }
  validateLifecycleInput(event, inputProof);
  const prior = inputProof?.kind === "github-proof" ? validateGithubProof(inputProof, intent) : null;
  const localProof = prior ? prior.localProof : validateProof(inputProof, intent);
  if (localProof.phase !== "pre-push-refresh" || localProof.pushBoundaryChecked !== true) {
    fail("stale_local_proof", "GitHub reconciliation requires a pre-push refreshed local proof");
  }
  requireFullOid(currentTargetOid, "current target OID");
  requireFullOid(mergeBaseOid, "merge-base OID");
  if (currentTargetOid !== intent.baseAuthorization.baseOid) {
    fail("target_moved", "current target differs from approved base during reconciliation");
  }
  if (mergeBaseOid !== intent.baseAuthorization.baseOid) {
    fail("merge_base_mismatch", "merge base differs from approved base during reconciliation");
  }
  const pull = Number(pullNumber);
  if (!Number.isInteger(pull) || pull <= 0) {
    fail("invalid_input", "pull request must be a positive integer");
  }
  if (
    prior &&
    (prior.proof.repository.toLowerCase() !== githubRepository.toLowerCase() ||
      prior.proof.pullRequest !== pull)
  ) {
    fail("stale_github_proof", "prior GitHub proof belongs to a different pull request");
  }
  if (
    prior &&
    (before.targetRepository !== prior.proof.proofSnapshot.targetRepository ||
      before.baseRef !== prior.proof.proofSnapshot.baseRef ||
      before.baseOid !== prior.proof.proofSnapshot.githubBaseOid ||
      currentTargetOid !== prior.proof.proofSnapshot.currentTargetOid ||
      before.headRepository !== prior.proof.proofSnapshot.headRepository ||
      before.headRef !== prior.proof.proofSnapshot.headRef ||
      before.headOid !== prior.proof.proofSnapshot.githubHeadOid)
  ) {
    fail(
      "stale_github_proof",
      "prior GitHub proof facts changed; restart from a renewed pre-push local proof",
    );
  }
  const evidence = reconcileGithubEvidence({
    intent,
    proof: localProof,
    before,
    after,
    commitPages,
    filePages,
  });
  const actual = inventoryEvidence(evidence.commits, evidence.records);
  const proofSnapshot = {
    repository: githubRepository,
    remoteBinding: localProof.remoteBinding,
    pullRequest: pull,
    targetRepository: before.targetRepository,
    baseRef: before.baseRef,
    githubBaseOid: before.baseOid,
    currentTargetOid,
    headRepository: before.headRepository,
    headRef: before.headRef,
    githubHeadOid: before.headOid,
    mergeBaseOid,
    commitCount: before.commitCount,
    changedFileCount: before.changedFileCount,
  };
  const provider = { ...evidence.provider };
  provider.evidenceDigest = providerEvidenceDigest(provider, proofSnapshot, actual);
  if (prior && !sameJson(providerFacts(prior.proof.provider), providerFacts(provider))) {
    fail(
      "stale_github_proof",
      "prior provider totals or pagination facts differ from the fresh observation",
      {
        expected: providerFacts(prior.proof.provider),
        actual: providerFacts(provider),
        proofSnapshot,
        availableEvidence: { actual, provider },
      },
    );
  }
  const lifecycleChain = prior
    ? [
        ...prior.proof.lifecycleChain,
        {
          lifecycleEvent: prior.proof.lifecycleEvent,
          proofDigest: digestJson(prior.proof),
          proofSnapshotDigest: digestJson(prior.proof.proofSnapshot),
        },
      ]
    : [];
  return {
    contractVersion: CONTRACT_VERSION,
    kind: "github-proof",
    phase: "github-reconciliation",
    lifecycleEvent: event,
    verdict: "pass",
    repository: githubRepository,
    remoteBinding: localProof.remoteBinding,
    pullRequest: pull,
    readyRevision: intent.readyAuthority.revision,
    baseAuthorizationRevision: intent.baseAuthorization.revision,
    publicationIntentRevision: intent.publicationIntent.revision,
    intentDigest: intentDigest(intent),
    authority: authorityEvidence(intent),
    localProof,
    expected: inventoryEvidence(
      intent.publicationIntent.expectedCommitOids,
      intent.publicationIntent.expectedPrimitiveRecords,
    ),
    actual,
    provider,
    proofSnapshot,
    lifecycleChain,
    previousGithubProofDigest: prior ? digestJson(prior.proof) : null,
    remediation: null,
  };
}

export function verifyGithub(
  repo,
  rawIntent,
  rawProof,
  githubRepository,
  pullNumber,
  lifecycleEvent,
) {
  const intent = validateIntent(structuredClone(rawIntent));
  const prior = rawProof?.kind === "github-proof" ? validateGithubProof(rawProof, intent) : null;
  const proof = prior ? prior.localProof : validateProof(rawProof, intent);
  const base = intent.baseAuthorization;
  const identity = verifyRepositoryIdentity(repo, base);
  if (identity.repository.toLowerCase() !== githubRepository.toLowerCase()) {
    fail("repository_mismatch", "requested GitHub repository differs from local repository");
  }
  const currentTargetOid = observeTarget(repo, base.remote, base.targetRef);
  if (currentTargetOid !== base.baseOid || currentTargetOid !== proof.currentTargetOid) {
    fail("target_moved", "target moved before GitHub reconciliation", {
      approvedBaseOid: base.baseOid,
      provenTargetOid: proof.currentTargetOid,
      currentTargetOid,
    });
  }
  assertClean(repo);
  const headOid = requireFullOid(gitText(repo, ["rev-parse", "HEAD"]), "HEAD OID");
  if (headOid !== proof.verifiedHeadOid) {
    fail("stale_local_proof", "local HEAD differs from proof before GitHub reconciliation");
  }
  const mergeBaseOid = requireFullOid(
    gitText(repo, ["merge-base", base.baseOid, headOid], "merge_base_mismatch"),
    "merge-base OID",
  );
  if (mergeBaseOid !== base.baseOid) {
    fail("merge_base_mismatch", "local merge base differs from approved base");
  }
  const endpoint = `repos/${githubRepository}/pulls/${pullNumber}`;
  const localBefore = {
    targetOid: currentTargetOid,
    headOid,
    remoteBinding: identity.remoteBinding,
    indexClean: true,
    worktreeClean: true,
  };
  const before = prSnapshot(ghJson([endpoint]));
  const commitPages = ghPages(`${endpoint}/commits?per_page=100`);
  const filePages = ghPages(`${endpoint}/files?per_page=100`);
  const after = prSnapshot(ghJson([endpoint]));
  const finalIdentity = verifyRepositoryIdentity(repo, base);
  const finalTargetOid = observeTarget(repo, base.remote, base.targetRef);
  assertClean(repo);
  const finalHeadOid = requireFullOid(gitText(repo, ["rev-parse", "HEAD"]), "HEAD OID");
  const localAfter = {
    targetOid: finalTargetOid,
    headOid: finalHeadOid,
    remoteBinding: finalIdentity.remoteBinding,
    indexClean: true,
    worktreeClean: true,
  };
  const closure = validateObservationClosure({
    approvedBaseOid: base.baseOid,
    provenTargetOid: proof.currentTargetOid,
    provenHeadOid: proof.verifiedHeadOid,
    provenRemoteBinding: proof.remoteBinding,
    before: localBefore,
    after: localAfter,
  });
  return buildGithubProof({
    intent,
    inputProof: rawProof,
    lifecycleEvent,
    githubRepository,
    pullNumber,
    currentTargetOid: closure.targetOid,
    mergeBaseOid,
    before,
    after,
    commitPages,
    filePages,
  });
}

function parseOptions(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined || value.startsWith("--")) {
      fail("invalid_input", `invalid option near '${key ?? ""}'`);
    }
    if (Object.hasOwn(options, key)) {
      fail("invalid_input", `duplicate option '${key}'`);
    }
    options[key] = value;
  }
  return options;
}

function option(options, name, fallback) {
  const value = options[`--${name}`] ?? fallback;
  return requireString(value, `--${name}`);
}

function printJson(value, stream = process.stdout) {
  stream.write(`${JSON.stringify(value, null, 2)}\n`);
}

function usage() {
  process.stderr.write(
    "usage: branch-scope.sh observe-base --target-repository OWNER/REPO --target-ref refs/heads/BRANCH [--repo PATH] [--remote NAME]\n" +
      "       branch-scope.sh verify-local --intent FILE [--repo PATH]\n" +
      "       branch-scope.sh verify-push --intent FILE --proof FILE [--repo PATH]\n" +
      "       branch-scope.sh verify-github --intent FILE --proof FILE --github-repository OWNER/REPO --pr NUMBER --event EVENT [--repo PATH]\n",
  );
}

function failurePhase(command) {
  return {
    "observe-base": "base-observation",
    "verify-local": "local-verification",
    "verify-push": "pre-push-refresh",
    "verify-github": "github-reconciliation",
  }[command] ?? "input-validation";
}

function failureAuthorityProvenance(intent) {
  if (!intent || typeof intent !== "object" || Array.isArray(intent)) return null;
  const compact = (value) =>
    value && typeof value === "object"
      ? {
          approver: value.approver ?? null,
          authority: value.authority ?? null,
          revision: value.revision ?? null,
          workItem: value.workItem ?? null,
        }
      : null;
  return {
    ready: compact(intent.readyAuthority),
    base: compact(intent.baseAuthorization),
    publication: compact(intent.publicationIntent),
  };
}

function remediationFor(kind) {
  return {
    approval_missing_or_stale: "Record renewed authority; never derive expected scope from observed state.",
    target_moved: "Stop publication and obtain a replacement Base Authorization and Publication Intent.",
    dirty_worktree: "Preserve the work, restore a clean index/worktree, and rerun the full boundary.",
    stale_local_proof: "Regenerate the local proof from the approved intent and current immutable facts.",
    stale_github_proof: "Run a fresh GitHub reconciliation for the current lifecycle boundary.",
    lossy_path_representation: "Use evidence that preserves the exact UTF-8 Git path or stop as inconclusive.",
  }[kind] ?? "Stop lifecycle progression, preserve existing refs and PRs, and resolve the reported evidence failure.";
}

function failureDifferences(details) {
  if (!details || typeof details !== "object") return null;
  if (!Object.hasOwn(details, "expected") && !Object.hasOwn(details, "actual")) return null;
  return {
    expected: details.expected ?? null,
    actual: details.actual ?? null,
  };
}

function failureProofSnapshot(command, repo, intent, proof, details) {
  if (proof?.proofSnapshot && typeof proof.proofSnapshot === "object") {
    return proof.proofSnapshot;
  }
  if (details?.proofSnapshot && typeof details.proofSnapshot === "object") {
    return details.proofSnapshot;
  }
  return {
    phase: failurePhase(command),
    repositoryPath: repo ?? null,
    targetRepository: intent?.baseAuthorization?.targetRepository ?? null,
    targetRef: intent?.baseAuthorization?.targetRef ?? null,
    approvedBaseOid: intent?.baseAuthorization?.baseOid ?? null,
    currentTargetOid: details?.currentTargetOid ?? null,
    verifiedHeadOid: details?.currentHeadOid ?? null,
  };
}

function rawExpectedEvidence(intent) {
  const publication = intent?.publicationIntent;
  if (!publication || typeof publication !== "object") return null;
  const commits = Array.isArray(publication.expectedCommitOids)
    ? publication.expectedCommitOids
    : null;
  const records = Array.isArray(publication.expectedPrimitiveRecords)
    ? publication.expectedPrimitiveRecords
    : null;
  if (!commits || !records) return null;
  return {
    commits,
    commitCount: commits.length,
    commitDigest: digestJson(commits),
    primitiveRecords: records,
    primitiveRecordCount: records.length,
    primitiveRecordDigest: digestJson(records),
  };
}

function availableProofEvidence(proof, intent, details) {
  return {
    expected: proof?.expected ?? rawExpectedEvidence(intent),
    actual: proof?.actual ?? details?.availableEvidence?.actual ?? details?.actual ?? null,
    provider: proof?.provider ?? details?.availableEvidence?.provider ?? null,
  };
}

async function main() {
  const command = process.argv[2];
  if (!command || ["-h", "--help"].includes(command)) {
    usage();
    process.exit(command ? 0 : 2);
  }
  let intent = null;
  let proof = null;
  let repo = null;
  try {
    const options = parseOptions(process.argv.slice(3));
    repo = path.resolve(option(options, "repo", process.cwd()));
    if (command === "observe-base") {
      const remote = option(options, "remote", "origin");
      const targetRepository = option(options, "target-repository");
      const targetRef = option(options, "target-ref");
      const identity = resolveRepository(repo, remote);
      if (identity.repository.toLowerCase() !== targetRepository.toLowerCase()) {
        fail("repository_mismatch", "remote does not match requested target repository", {
          expected: targetRepository,
          actual: identity.repository,
        });
      }
      assertClean(repo);
      const targetOid = observeTarget(repo, remote, targetRef);
      printJson({
        contractVersion: CONTRACT_VERSION,
        kind: "base-observation",
        phase: "base-observation",
        verdict: "pass",
        repository: identity.repository,
        remoteBinding: identity.remoteBinding,
        targetRef,
        targetOid,
        proofSnapshot: {
          repository: identity.repository,
          remoteBinding: identity.remoteBinding,
          targetRef,
          targetOid,
          indexClean: true,
          worktreeClean: true,
        },
        remediation: null,
      });
      return;
    }
    intent = loadJson(option(options, "intent"), "intent");
    if (command === "verify-local") {
      printJson(verifyLocal(repo, intent));
      return;
    }
    proof = loadJson(option(options, "proof"), "proof");
    if (command === "verify-push") {
      printJson(verifyPush(repo, intent, proof));
      return;
    }
    if (command === "verify-github") {
      const githubRepository = option(options, "github-repository");
      const pullNumber = option(options, "pr");
      const lifecycleEvent = option(options, "event");
      if (!/^[1-9][0-9]*$/.test(pullNumber)) {
        fail("invalid_input", "--pr must be a positive integer");
      }
      printJson(
        verifyGithub(repo, intent, proof, githubRepository, pullNumber, lifecycleEvent),
      );
      return;
    }
    fail("invalid_input", `unknown command '${command}'`);
  } catch (error) {
    const failure =
      error instanceof ScopeFailure
        ? error
        : new ScopeFailure("internal_error", error instanceof Error ? error.message : String(error));
    printJson(
      {
        contractVersion: CONTRACT_VERSION,
        phase: failurePhase(command),
        verdict: "fail",
        proofSnapshot: failureProofSnapshot(command, repo, intent, proof, failure.details),
        authorityProvenance: failureAuthorityProvenance(intent),
        availableEvidence: availableProofEvidence(proof, intent, failure.details),
        differences: failureDifferences(failure.details),
        failure: {
          kind: failure.kind,
          message: failure.message,
          details: failure.details,
        },
        remediation: remediationFor(failure.kind),
      },
      process.stderr,
    );
    process.exit(failure.kind === "invalid_input" ? 2 : 1);
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  await main();
}
