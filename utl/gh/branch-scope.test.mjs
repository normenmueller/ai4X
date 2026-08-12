import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  CONTRACT_VERSION,
  LIFECYCLE_EVENTS,
  PO_RESERVED_CONSTRAINTS,
  ScopeFailure,
  buildGithubProof,
  digestJson,
  normalizeGithubFiles,
  parseGithubRemoteUrl,
  parseLocalNameStatus,
  reconcileGithubEvidence,
  validateObservationClosure,
  validateIntent,
  validateLifecycleEvent,
  verifyLocal,
  verifyPush,
} from "./branch-scope.mjs";

const FIXTURE_REPOSITORY = "example/project";
const fixtureRoots = new Set();

test.after(() => {
  for (const root of fixtureRoots) {
    fs.rmSync(root, { force: true, recursive: true });
  }
});

function command(executable, args, cwd) {
  const result = spawnSync(executable, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(
      `${executable} ${args.join(" ")} failed (${result.status}): ${result.stderr}`,
    );
  }
  return result.stdout.trim();
}

function git(repo, ...args) {
  return command("git", ["-C", repo, ...args]);
}

function write(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value);
}

function expectFailure(fn, kind) {
  assert.throws(fn, (error) => {
    assert.ok(error instanceof ScopeFailure);
    assert.equal(error.kind, kind);
    return true;
  });
}

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ai4x-branch-scope-"));
  fixtureRoots.add(root);
  const remote = path.join(root, "remote.git");
  const seed = path.join(root, "seed");
  const repo = path.join(root, "repo");
  command("git", ["init", "--bare", remote]);
  command("git", ["init", "--initial-branch=trunk", seed]);
  git(seed, "config", "user.name", "Fixture");
  git(seed, "config", "user.email", "fixture@example.test");
  write(path.join(seed, "base.txt"), "base\n");
  git(seed, "add", "base.txt");
  git(seed, "commit", "-m", "base");
  const baseOid = git(seed, "rev-parse", "HEAD");
  git(seed, "remote", "add", "origin", remote);
  git(seed, "push", "origin", "trunk");
  git(remote, "symbolic-ref", "HEAD", "refs/heads/trunk");
  command("git", ["clone", "--branch", "trunk", remote, repo]);
  git(repo, "config", "user.name", "Fixture");
  git(repo, "config", "user.email", "fixture@example.test");
  git(repo, "checkout", "-b", "topic", baseOid);
  git(repo, "remote", "set-url", "origin", `https://github.com/${FIXTURE_REPOSITORY}.git`);
  git(
    repo,
    "config",
    `url.file://${remote}.insteadOf`,
    `https://github.com/${FIXTURE_REPOSITORY}.git`,
  );
  return { root, remote, seed, repo, baseOid };
}

function commitFile(fixture, relativePath = "feature.txt", contents = "feature\n") {
  write(path.join(fixture.repo, relativePath), contents);
  git(fixture.repo, "add", "--", relativePath);
  git(fixture.repo, "commit", "-m", `add ${relativePath.replaceAll("\n", "-")}`);
  return git(fixture.repo, "rev-parse", "HEAD");
}

function intentFor(fixture, headOid, records, commitOids = [headOid]) {
  return {
    contractVersion: CONTRACT_VERSION,
    readyAuthority: {
      granted: true,
      approver: "normenmueller",
      authority: "product-owner",
      revision: "ready-1",
      workItem: "#118",
    },
    baseAuthorization: {
      revision: "base-1",
      approver: "gertrud-ai4x",
      authority: "tech-lead",
      workItem: "#118",
      targetRepository: FIXTURE_REPOSITORY,
      remote: "origin",
      targetRef: "refs/heads/trunk",
      baseOid: fixture.baseOid,
      poReservedConstraints: [],
      lineage: [
        {
          sequence: 1,
          revision: "base-1",
          approver: "gertrud-ai4x",
          baseOid: fixture.baseOid,
          replacementApproval: null,
        },
      ],
    },
    publicationIntent: {
      revision: "publication-1",
      approver: "gertrud-ai4x",
      authority: "tech-lead",
      workItem: "#118",
      baseAuthorizationRevision: "base-1",
      expectedCommitOids: commitOids,
      expectedPrimitiveRecords: records,
    },
  };
}

function mockProof(intent, headOid, baseOid) {
  const checked = validateIntent(structuredClone(intent));
  const commits = checked.publicationIntent.expectedCommitOids;
  const records = checked.publicationIntent.expectedPrimitiveRecords;
  const inventory = {
    commits,
    commitCount: commits.length,
    commitDigest: digestJson(commits),
    primitiveRecords: records,
    primitiveRecordCount: records.length,
    primitiveRecordDigest: digestJson(records),
  };
  const remoteBinding = {
    remote: "origin",
    repository: FIXTURE_REPOSITORY,
    fetch: { transport: "https", endpoint: `github.com/${FIXTURE_REPOSITORY}` },
    push: { transport: "https", endpoint: `github.com/${FIXTURE_REPOSITORY}` },
  };
  return {
    contractVersion: CONTRACT_VERSION,
    kind: "local-proof",
    phase: "pre-push-refresh",
    verdict: "pass",
    repository: FIXTURE_REPOSITORY,
    remoteBinding,
    readyRevision: checked.readyAuthority.revision,
    baseAuthorizationRevision: checked.baseAuthorization.revision,
    publicationIntentRevision: checked.publicationIntent.revision,
    intentDigest: digestJson(checked),
    targetRepository: FIXTURE_REPOSITORY,
    targetRef: "refs/heads/trunk",
    approvedBaseOid: baseOid,
    currentTargetOid: baseOid,
    verifiedHeadOid: headOid,
    mergeBaseOid: baseOid,
    cleanliness: { index: true, worktree: true },
    authority: {
      ready: {
        approver: checked.readyAuthority.approver,
        authority: checked.readyAuthority.authority,
        revision: checked.readyAuthority.revision,
        workItem: checked.readyAuthority.workItem,
      },
      base: {
        approver: checked.baseAuthorization.approver,
        authority: checked.baseAuthorization.authority,
        revision: checked.baseAuthorization.revision,
        workItem: checked.baseAuthorization.workItem,
        poReservedConstraints: checked.baseAuthorization.poReservedConstraints,
        lineage: checked.baseAuthorization.lineage,
      },
      publication: {
        approver: checked.publicationIntent.approver,
        authority: checked.publicationIntent.authority,
        revision: checked.publicationIntent.revision,
        workItem: checked.publicationIntent.workItem,
        baseAuthorizationRevision: checked.publicationIntent.baseAuthorizationRevision,
      },
    },
    expected: structuredClone(inventory),
    actual: structuredClone(inventory),
    proofSnapshot: {
      repository: FIXTURE_REPOSITORY,
      remoteBinding,
      targetRepository: FIXTURE_REPOSITORY,
      targetRef: "refs/heads/trunk",
      approvedBaseOid: baseOid,
      currentTargetOid: baseOid,
      verifiedHeadOid: headOid,
      mergeBaseOid: baseOid,
      indexClean: true,
      worktreeClean: true,
    },
    pushBoundaryChecked: true,
    remediation: null,
  };
}

function mockSnapshot(baseOid, headOid, overrides = {}) {
  return {
    targetRepository: FIXTURE_REPOSITORY,
    baseRef: "trunk",
    baseOid,
    headRepository: FIXTURE_REPOSITORY,
    headRef: "topic",
    headOid,
    commitCount: 1,
    changedFileCount: 1,
    ...overrides,
  };
}

test("T-01 rejects missing Ready authority and Actual-as-Expected shortcuts", () => {
  const fixture = { baseOid: "1".repeat(40) };
  const intent = intentFor(fixture, "2".repeat(40), [], ["2".repeat(40)]);
  intent.readyAuthority.granted = false;
  expectFailure(() => validateIntent(intent), "approval_missing_or_stale");
  const stale = intentFor(fixture, "2".repeat(40), [], ["2".repeat(40)]);
  stale.publicationIntent.workItem = "#119";
  expectFailure(() => validateIntent(stale), "approval_missing_or_stale");
  const wrongOid = intentFor(fixture, "2".repeat(40), [], ["2".repeat(40)]);
  wrongOid.baseAuthorization.baseOid = "1".repeat(41);
  expectFailure(() => validateIntent(wrongOid), "invalid_input");

  const actualFixture = createFixture();
  const actualHead = commitFile(actualFixture);
  const approved = intentFor(
    actualFixture,
    "f".repeat(40),
    [{ operation: "add", path: "invented.txt" }],
    ["f".repeat(40)],
  );
  const approvedBefore = structuredClone(approved);
  expectFailure(() => verifyLocal(actualFixture.repo, approved), "expected_commit_mismatch");
  assert.deepEqual(approved, approvedBefore);
  assert.notEqual(actualHead, approved.publicationIntent.expectedCommitOids[0]);
});

test("T-02/T-03 produces a valid target-bound local proof without ref mutation", () => {
  const fixture = createFixture();
  const headOid = commitFile(fixture);
  const intent = intentFor(fixture, headOid, [{ operation: "add", path: "feature.txt" }]);
  const refsBefore = git(fixture.repo, "for-each-ref", "--format=%(refname) %(objectname)");
  const configBefore = git(fixture.repo, "config", "--local", "--list");
  const proof = verifyLocal(fixture.repo, intent);
  assert.equal(proof.verdict, "pass");
  assert.equal(proof.approvedBaseOid, fixture.baseOid);
  assert.equal(proof.currentTargetOid, fixture.baseOid);
  assert.equal(proof.verifiedHeadOid, headOid);
  assert.equal(
    git(fixture.repo, "for-each-ref", "--format=%(refname) %(objectname)"),
    refsBefore,
  );
  assert.equal(git(fixture.repo, "config", "--local", "--list"), configBefore);
  assert.deepEqual(proof.expected, proof.actual);
  assert.equal(proof.cleanliness.index, true);
  assert.equal(proof.cleanliness.worktree, true);
  assert.equal(proof.authority.publication.workItem, "#118");
});

test("T-02 fetch failure preserves index, worktree, refs, and repository configuration", () => {
  const fixture = createFixture();
  const headOid = commitFile(fixture);
  const intent = intentFor(fixture, headOid, [{ operation: "add", path: "feature.txt" }]);
  const state = () => ({
    head: git(fixture.repo, "rev-parse", "HEAD"),
    refs: git(fixture.repo, "for-each-ref", "--format=%(refname) %(objectname)"),
    status: git(fixture.repo, "status", "--porcelain=v2", "--untracked-files=normal"),
    config: git(fixture.repo, "config", "--local", "--list"),
    index: fs.readFileSync(path.join(fixture.repo, ".git", "index")).toString("base64"),
  });
  const before = state();
  fs.renameSync(fixture.remote, `${fixture.remote}.unavailable`);
  expectFailure(() => verifyLocal(fixture.repo, intent), "target_unavailable");
  assert.deepEqual(state(), before);
});

test("T-03 binds exact github.com fetch and push remote identities", async (t) => {
  assert.deepEqual(parseGithubRemoteUrl("https://github.com/example/project.git"), {
    repository: FIXTURE_REPOSITORY,
    transport: "https",
    endpoint: `github.com/${FIXTURE_REPOSITORY}`,
  });
  assert.deepEqual(parseGithubRemoteUrl("git@github.com:example/project.git"), {
    repository: FIXTURE_REPOSITORY,
    transport: "ssh",
    endpoint: `github.com/${FIXTURE_REPOSITORY}`,
  });
  assert.deepEqual(parseGithubRemoteUrl("ssh://git@github.com/example/project.git"), {
    repository: FIXTURE_REPOSITORY,
    transport: "ssh",
    endpoint: `github.com/${FIXTURE_REPOSITORY}`,
  });
  for (const remoteUrl of [
    "https://evilgithub.com/example/project.git",
    "https://github.com.evil.example/example/project.git",
  ]) {
    expectFailure(() => parseGithubRemoteUrl(remoteUrl), "repository_mismatch");
  }

  await t.test("lookalike fetch host", () => {
    const fixture = createFixture();
    const headOid = commitFile(fixture);
    const intent = intentFor(fixture, headOid, [{ operation: "add", path: "feature.txt" }]);
    git(fixture.repo, "remote", "set-url", "origin", "https://evilgithub.com/example/project.git");
    expectFailure(() => verifyLocal(fixture.repo, intent), "repository_mismatch");
  });
  await t.test("different push repository", () => {
    const fixture = createFixture();
    const headOid = commitFile(fixture);
    const intent = intentFor(fixture, headOid, [{ operation: "add", path: "feature.txt" }]);
    git(fixture.repo, "config", "remote.origin.pushurl", "git@github.com:other/project.git");
    expectFailure(() => verifyLocal(fixture.repo, intent), "repository_mismatch");
  });
  await t.test("multiple push URLs", () => {
    const fixture = createFixture();
    const headOid = commitFile(fixture);
    const intent = intentFor(fixture, headOid, [{ operation: "add", path: "feature.txt" }]);
    git(fixture.repo, "config", "--add", "remote.origin.pushurl", "git@github.com:example/project.git");
    git(fixture.repo, "config", "--add", "remote.origin.pushurl", "https://github.com/example/project.git");
    expectFailure(() => verifyLocal(fixture.repo, intent), "repository_mismatch");
  });
  await t.test("push binding changes after proof", () => {
    const fixture = createFixture();
    const headOid = commitFile(fixture);
    const intent = intentFor(fixture, headOid, [{ operation: "add", path: "feature.txt" }]);
    const proof = verifyLocal(fixture.repo, intent);
    git(fixture.repo, "config", "remote.origin.pushurl", "git@github.com:example/project.git");
    expectFailure(() => verifyPush(fixture.repo, intent, proof), "stale_local_proof");
  });
});

test("T-04 rejects inherited unrelated ancestry", () => {
  const fixture = createFixture();
  git(fixture.repo, "checkout", "--orphan", "wrong-history");
  git(fixture.repo, "rm", "-rf", ".");
  const headOid = commitFile(fixture, "wrong.txt", "wrong\n");
  const intent = intentFor(fixture, headOid, [{ operation: "add", path: "wrong.txt" }]);
  expectFailure(() => verifyLocal(fixture.repo, intent), "merge_base_mismatch");
});

test("T-05 rejects equal-count commit substitution", () => {
  const fixture = createFixture();
  const headOid = commitFile(fixture);
  const intent = intentFor(
    fixture,
    headOid,
    [{ operation: "add", path: "feature.txt" }],
    ["f".repeat(40)],
  );
  expectFailure(() => verifyLocal(fixture.repo, intent), "expected_commit_mismatch");
});

test("T-06 preserves adversarial paths and normalizes rename heuristics", () => {
  const local = parseLocalNameStatus(
    Buffer.from("D\0old name\nwith-tab\t\0A\0-new café\n\0", "utf8"),
  );
  const github = normalizeGithubFiles([
    {
      status: "renamed",
      previous_filename: "old name\nwith-tab\t",
      filename: "-new café\n",
    },
  ]);
  assert.deepEqual(local, github);
  assert.deepEqual(normalizeGithubFiles([{ status: "copied", filename: "copy.txt" }]), [
    { operation: "add", path: "copy.txt" },
  ]);
  const composed = "caf\u00e9.txt";
  const decomposed = "cafe\u0301.txt";
  assert.deepEqual(
    normalizeGithubFiles([
      { status: "added", filename: composed },
      { status: "added", filename: decomposed },
    ]),
    [
      { operation: "add", path: decomposed },
      { operation: "add", path: composed },
    ].sort((left, right) => Buffer.compare(Buffer.from(left.path), Buffer.from(right.path))),
  );
  expectFailure(
    () => normalizeGithubFiles([{ status: "added", filename: "broken-\ud800.txt" }]),
    "lossy_path_representation",
  );
});

test("T-07 rejects tracked, staged, and untracked dirty state", async (t) => {
  await t.test("tracked", () => {
    const fixture = createFixture();
    const headOid = commitFile(fixture);
    const intent = intentFor(fixture, headOid, [{ operation: "add", path: "feature.txt" }]);
    const proof = verifyLocal(fixture.repo, intent);
    write(path.join(fixture.repo, "feature.txt"), "dirty\n");
    expectFailure(() => verifyPush(fixture.repo, intent, proof), "dirty_worktree");
  });
  await t.test("staged", () => {
    const fixture = createFixture();
    const headOid = commitFile(fixture);
    const intent = intentFor(fixture, headOid, [{ operation: "add", path: "feature.txt" }]);
    const proof = verifyLocal(fixture.repo, intent);
    write(path.join(fixture.repo, "staged.txt"), "staged\n");
    git(fixture.repo, "add", "staged.txt");
    expectFailure(() => verifyPush(fixture.repo, intent, proof), "dirty_worktree");
  });
  await t.test("untracked", () => {
    const fixture = createFixture();
    const headOid = commitFile(fixture);
    const intent = intentFor(fixture, headOid, [{ operation: "add", path: "feature.txt" }]);
    const proof = verifyLocal(fixture.repo, intent);
    write(path.join(fixture.repo, "untracked.txt"), "untracked\n");
    expectFailure(() => verifyPush(fixture.repo, intent, proof), "dirty_worktree");
  });
});

test("T-08 invalidates proof after HEAD or target movement", async (t) => {
  await t.test("HEAD changed", () => {
    const fixture = createFixture();
    const headOid = commitFile(fixture);
    const intent = intentFor(fixture, headOid, [{ operation: "add", path: "feature.txt" }]);
    const proof = verifyLocal(fixture.repo, intent);
    commitFile(fixture, "second.txt", "second\n");
    expectFailure(() => verifyPush(fixture.repo, intent, proof), "stale_local_proof");
  });
  await t.test("target moved", () => {
    const fixture = createFixture();
    const headOid = commitFile(fixture);
    const intent = intentFor(fixture, headOid, [{ operation: "add", path: "feature.txt" }]);
    const proof = verifyLocal(fixture.repo, intent);
    write(path.join(fixture.seed, "base-2.txt"), "base 2\n");
    git(fixture.seed, "add", "base-2.txt");
    git(fixture.seed, "commit", "-m", "move base");
    git(fixture.seed, "push", "origin", "trunk");
    expectFailure(() => verifyPush(fixture.repo, intent, proof), "target_moved");
  });
  await t.test("repository, base, and Publication Intent tuple changes", () => {
    const baseOid = "1".repeat(40);
    const headOid = "2".repeat(40);
    const intent = intentFor(
      { baseOid },
      headOid,
      [{ operation: "add", path: "feature.txt" }],
    );
    const proof = mockProof(intent, headOid, baseOid);
    const snapshot = mockSnapshot(baseOid, headOid);
    for (const [mutate, failureKind] of [
      [(value) => (value.baseAuthorization.targetRepository = "other/project"), "stale_local_proof"],
      [
        (value) => (value.baseAuthorization.baseOid = "3".repeat(40)),
        "approval_missing_or_stale",
      ],
      [(value) => (value.publicationIntent.revision = "publication-2"), "stale_local_proof"],
    ]) {
      const revised = structuredClone(intent);
      mutate(revised);
      expectFailure(
        () =>
          reconcileGithubEvidence({
            intent: revised,
            proof,
            before: snapshot,
            after: snapshot,
            commitPages: [[{ sha: headOid }]],
            filePages: [[{ status: "added", filename: "feature.txt" }]],
          }),
        failureKind,
      );
    }
  });
});

test("T-09/T-10 reconciles separate base/merge-base facts and multi-page evidence", () => {
  const baseOid = "1".repeat(40);
  const headOid = "2".repeat(40);
  const secondOid = "3".repeat(40);
  const intent = intentFor(
    { baseOid },
    headOid,
    [
      { operation: "add", path: "feature.txt" },
      { operation: "modify", path: "second.txt" },
    ],
    [headOid, secondOid],
  );
  const proof = mockProof(intent, headOid, baseOid);
  const snapshot = mockSnapshot(baseOid, headOid, { commitCount: 2, changedFileCount: 2 });
  const result = reconcileGithubEvidence({
    intent,
    proof,
    before: snapshot,
    after: structuredClone(snapshot),
    commitPages: [[{ sha: headOid }], [{ sha: secondOid }]],
    filePages: [
      [{ status: "added", filename: "feature.txt" }],
      [{ status: "modified", filename: "second.txt" }],
    ],
  });
  assert.deepEqual(result.commits, [headOid, secondOid]);
  assert.deepEqual(result.provider.commitPageSizes, [1, 1]);
  assert.deepEqual(result.provider.changedFilePageSizes, [1, 1]);
  expectFailure(
    () =>
      buildGithubProof({
        intent,
        inputProof: proof,
        lifecycleEvent: "pull-request-created",
        githubRepository: FIXTURE_REPOSITORY,
        pullNumber: 1,
        currentTargetOid: baseOid,
        mergeBaseOid: "4".repeat(40),
        before: snapshot,
        after: snapshot,
        commitPages: [[{ sha: headOid }], [{ sha: secondOid }]],
        filePages: [
          [{ status: "added", filename: "feature.txt" }],
          [{ status: "modified", filename: "second.txt" }],
        ],
      }),
    "merge_base_mismatch",
  );
});

test("T-11 rejects incomplete, capped, and unstable GitHub evidence", async (t) => {
  const baseOid = "1".repeat(40);
  const headOid = "2".repeat(40);
  const intent = intentFor({ baseOid }, headOid, [{ operation: "add", path: "feature.txt" }]);
  const proof = mockProof(intent, headOid, baseOid);
  const snapshot = mockSnapshot(baseOid, headOid);
  await t.test("missing page records", () => {
    expectFailure(
      () =>
        reconcileGithubEvidence({
          intent,
          proof,
          before: snapshot,
          after: structuredClone(snapshot),
          commitPages: [[]],
          filePages: [[{ status: "added", filename: "feature.txt" }]],
        }),
      "pagination_incomplete",
    );
  });
  await t.test("provider cap", () => {
    const capped = { ...snapshot, changedFileCount: 3001 };
    expectFailure(
      () =>
        reconcileGithubEvidence({
          intent,
          proof,
          before: capped,
          after: structuredClone(capped),
          commitPages: [[{ sha: headOid }]],
          filePages: [[]],
        }),
      "provider_cap_or_truncation",
    );
  });
  await t.test("unstable snapshot", () => {
    expectFailure(
      () =>
        reconcileGithubEvidence({
          intent,
          proof,
          before: snapshot,
          after: { ...snapshot, headOid: "3".repeat(40) },
          commitPages: [[{ sha: headOid }]],
          filePages: [[{ status: "added", filename: "feature.txt" }]],
        }),
      "unstable_github_snapshot",
    );
  });
  await t.test("duplicate commit record", () => {
    const duplicateSnapshot = { ...snapshot, commitCount: 2 };
    expectFailure(
      () =>
        reconcileGithubEvidence({
          intent,
          proof,
          before: duplicateSnapshot,
          after: duplicateSnapshot,
          commitPages: [[{ sha: headOid }], [{ sha: headOid }]],
          filePages: [[{ status: "added", filename: "feature.txt" }]],
        }),
      "pagination_incomplete",
    );
  });
  await t.test("target moves while provider pages are read", () => {
    expectFailure(
      () =>
        validateObservationClosure({
          approvedBaseOid: baseOid,
          provenTargetOid: baseOid,
          provenHeadOid: headOid,
          provenRemoteBinding: proof.remoteBinding,
          before: {
            targetOid: baseOid,
            headOid,
            remoteBinding: proof.remoteBinding,
            indexClean: true,
            worktreeClean: true,
          },
          after: {
            targetOid: "3".repeat(40),
            headOid,
            remoteBinding: proof.remoteBinding,
            indexClean: true,
            worktreeClean: true,
          },
        }),
      "target_moved",
    );
  });
  await t.test("HEAD or remote binding changes while provider pages are read", () => {
    const stable = {
      targetOid: baseOid,
      headOid,
      remoteBinding: proof.remoteBinding,
      indexClean: true,
      worktreeClean: true,
    };
    const closure = validateObservationClosure({
      approvedBaseOid: baseOid,
      provenTargetOid: baseOid,
      provenHeadOid: headOid,
      provenRemoteBinding: proof.remoteBinding,
      before: stable,
      after: structuredClone(stable),
    });
    assert.equal(closure.targetOid, baseOid);
    assert.equal(closure.headOid, headOid);
    expectFailure(
      () =>
        validateObservationClosure({
          approvedBaseOid: baseOid,
          provenTargetOid: baseOid,
          provenHeadOid: headOid,
          provenRemoteBinding: proof.remoteBinding,
          before: stable,
          after: { ...structuredClone(stable), headOid: "3".repeat(40) },
        }),
      "unstable_local_snapshot",
    );
    const changedRemote = structuredClone(stable);
    changedRemote.remoteBinding.push.transport = "ssh";
    expectFailure(
      () =>
        validateObservationClosure({
          approvedBaseOid: baseOid,
          provenTargetOid: baseOid,
          provenHeadOid: headOid,
          provenRemoteBinding: proof.remoteBinding,
          before: stable,
          after: changedRemote,
        }),
      "unstable_local_snapshot",
    );
    const stableButUnproven = structuredClone(stable);
    stableButUnproven.remoteBinding.push.transport = "ssh";
    expectFailure(
      () =>
        validateObservationClosure({
          approvedBaseOid: baseOid,
          provenTargetOid: baseOid,
          provenHeadOid: headOid,
          provenRemoteBinding: proof.remoteBinding,
          before: stableButUnproven,
          after: structuredClone(stableButUnproven),
        }),
      "stale_local_proof",
    );
  });
});

test("T-12/T-13 rejects stale proof and local/GitHub mismatch", async (t) => {
  const baseOid = "1".repeat(40);
  const headOid = "2".repeat(40);
  const intent = intentFor({ baseOid }, headOid, [{ operation: "add", path: "feature.txt" }]);
  const proof = mockProof(intent, headOid, baseOid);
  const snapshot = mockSnapshot(baseOid, headOid);
  await t.test("stale approval revision", () => {
    const revised = structuredClone(intent);
    revised.publicationIntent.revision = "publication-2";
    expectFailure(
      () =>
        reconcileGithubEvidence({
          intent: revised,
          proof,
          before: snapshot,
          after: snapshot,
          commitPages: [[{ sha: headOid }]],
          filePages: [[{ status: "added", filename: "feature.txt" }]],
        }),
      "stale_local_proof",
    );
  });
  await t.test("GitHub head mismatch", () => {
    const otherHead = "3".repeat(40);
    const changed = { ...snapshot, headOid: otherHead };
    expectFailure(
      () =>
        reconcileGithubEvidence({
          intent,
          proof,
          before: changed,
          after: changed,
          commitPages: [[{ sha: headOid }]],
          filePages: [[{ status: "added", filename: "feature.txt" }]],
        }),
      "github_head_mismatch",
    );
  });
  await t.test("primitive delta mismatch", () => {
    expectFailure(
      () =>
        reconcileGithubEvidence({
          intent,
          proof,
          before: snapshot,
          after: snapshot,
          commitPages: [[{ sha: headOid }]],
          filePages: [[{ status: "added", filename: "other.txt" }]],
        }),
      "local_github_scope_mismatch",
    );
  });
  await t.test("base ref mismatch", () => {
    const changed = { ...snapshot, baseRef: "release" };
    expectFailure(
      () =>
        reconcileGithubEvidence({
          intent,
          proof,
          before: changed,
          after: changed,
          commitPages: [[{ sha: headOid }]],
          filePages: [[{ status: "added", filename: "feature.txt" }]],
        }),
      "github_base_mismatch",
    );
  });
  await t.test("base OID mismatch", () => {
    const changed = { ...snapshot, baseOid: "3".repeat(40) };
    expectFailure(
      () =>
        reconcileGithubEvidence({
          intent,
          proof,
          before: changed,
          after: changed,
          commitPages: [[{ sha: headOid }]],
          filePages: [[{ status: "added", filename: "feature.txt" }]],
        }),
      "github_base_mismatch",
    );
  });
  await t.test("commit-set mismatch", () => {
    expectFailure(
      () =>
        reconcileGithubEvidence({
          intent,
          proof,
          before: snapshot,
          after: snapshot,
          commitPages: [[{ sha: "3".repeat(40) }]],
          filePages: [[{ status: "added", filename: "feature.txt" }]],
        }),
      "local_github_scope_mismatch",
    );
  });
});

test("T-12 enforces fresh governed lifecycle predecessors and immutable PR identity", () => {
  const baseOid = "1".repeat(40);
  const headOid = "2".repeat(40);
  const intent = intentFor({ baseOid }, headOid, [{ operation: "add", path: "feature.txt" }]);
  const localProof = mockProof(intent, headOid, baseOid);
  const snapshot = mockSnapshot(baseOid, headOid);
  const build = (event, inputProof, overrides = {}) =>
    buildGithubProof({
      intent,
      inputProof,
      lifecycleEvent: event,
      githubRepository: FIXTURE_REPOSITORY,
      pullNumber: overrides.pullNumber ?? 118,
      currentTargetOid: baseOid,
      mergeBaseOid: baseOid,
      before: overrides.snapshot ?? snapshot,
      after: structuredClone(overrides.snapshot ?? snapshot),
      commitPages: [[{ sha: headOid }]],
      filePages: [[{ status: "added", filename: "feature.txt" }]],
    });

  const created = build("pull-request-created", localProof);
  const baseOrHeadChanged = build("base-or-head-changed", localProof);
  const ready = build("ready-for-review", created);
  const readyAfterChange = build("ready-for-review", baseOrHeadChanged);
  const inReview = build("issue-in-review", ready);
  const final = build("final-conformance", inReview);
  assert.deepEqual(
    new Set([
      created.lifecycleEvent,
      baseOrHeadChanged.lifecycleEvent,
      ready.lifecycleEvent,
      inReview.lifecycleEvent,
      final.lifecycleEvent,
    ]),
    new Set(LIFECYCLE_EVENTS),
  );
  assert.equal(ready.previousGithubProofDigest, digestJson(created));
  assert.equal(readyAfterChange.previousGithubProofDigest, digestJson(baseOrHeadChanged));
  assert.equal(final.lifecycleChain.at(-1).lifecycleEvent, "issue-in-review");
  expectFailure(() => validateLifecycleEvent("generic-review"), "invalid_input");
  expectFailure(() => build("ready-for-review", localProof), "stale_github_proof");
  expectFailure(() => build("base-or-head-changed", created), "stale_github_proof");
  expectFailure(
    () => build("ready-for-review", created, { pullNumber: 119 }),
    "stale_github_proof",
  );
  expectFailure(
    () => build("ready-for-review", created, { snapshot: { ...snapshot, headRef: "other" } }),
    "stale_github_proof",
  );
  expectFailure(
    () =>
      build("ready-for-review", created, {
        snapshot: { ...snapshot, headRepository: "fork/project" },
      }),
    "stale_github_proof",
  );
  expectFailure(
    () =>
      build("ready-for-review", created, {
        snapshot: { ...snapshot, headOid: "3".repeat(40) },
      }),
    "stale_github_proof",
  );
  const incomplete = structuredClone(ready);
  delete incomplete.provider.commitPageSizes;
  expectFailure(() => build("issue-in-review", incomplete), "invalid_input");

  const providerMutant = structuredClone(ready);
  providerMutant.provider.commitTotal = 2;
  providerMutant.provider.commitPageSizes = [2];
  providerMutant.proofSnapshot.commitCount = 2;
  const { evidenceDigest: _oldDigest, ...providerFacts } = providerMutant.provider;
  providerMutant.provider.evidenceDigest = digestJson({
    provider: providerFacts,
    snapshot: providerMutant.proofSnapshot,
    actual: providerMutant.actual,
  });
  expectFailure(() => build("issue-in-review", providerMutant), "stale_github_proof");
  const chainMutant = structuredClone(ready);
  chainMutant.previousGithubProofDigest = "f".repeat(64);
  expectFailure(() => build("issue-in-review", chainMutant), "stale_github_proof");

  const renameIntent = intentFor({ baseOid }, headOid, [
    { operation: "delete", path: "old.txt" },
    { operation: "add", path: "new.txt" },
  ]);
  const renameLocal = mockProof(renameIntent, headOid, baseOid);
  const renameSnapshot = mockSnapshot(baseOid, headOid, { changedFileCount: 1 });
  const renameCreated = buildGithubProof({
    intent: renameIntent,
    inputProof: renameLocal,
    lifecycleEvent: "pull-request-created",
    githubRepository: FIXTURE_REPOSITORY,
    pullNumber: 120,
    currentTargetOid: baseOid,
    mergeBaseOid: baseOid,
    before: renameSnapshot,
    after: renameSnapshot,
    commitPages: [[{ sha: headOid }]],
    filePages: [[{ status: "renamed", previous_filename: "old.txt", filename: "new.txt" }]],
  });
  const renameProviderMutant = structuredClone(renameCreated);
  renameProviderMutant.provider.changedFileTotal = 2;
  renameProviderMutant.provider.changedFilePageSizes = [2];
  renameProviderMutant.proofSnapshot.changedFileCount = 2;
  const { evidenceDigest: _renameDigest, ...renameProviderFacts } =
    renameProviderMutant.provider;
  renameProviderMutant.provider.evidenceDigest = digestJson({
    provider: renameProviderFacts,
    snapshot: renameProviderMutant.proofSnapshot,
    actual: renameProviderMutant.actual,
  });
  expectFailure(
    () =>
      buildGithubProof({
        intent: renameIntent,
        inputProof: renameProviderMutant,
        lifecycleEvent: "ready-for-review",
        githubRepository: FIXTURE_REPOSITORY,
        pullNumber: 120,
        currentTargetOid: baseOid,
        mergeBaseOid: baseOid,
        before: renameSnapshot,
        after: renameSnapshot,
        commitPages: [[{ sha: headOid }]],
        filePages: [
          [{ status: "renamed", previous_filename: "old.txt", filename: "new.txt" }],
        ],
      }),
    "stale_github_proof",
  );
});

test("T-13 accepts Git rename versus GitHub delete/add after primitive normalization", () => {
  const baseOid = "1".repeat(40);
  const headOid = "2".repeat(40);
  const expected = [
    { operation: "delete", path: "old.txt" },
    { operation: "add", path: "new.txt" },
  ];
  const intent = intentFor({ baseOid }, headOid, expected);
  const proof = mockProof(intent, headOid, baseOid);
  const snapshot = mockSnapshot(baseOid, headOid);
  const result = reconcileGithubEvidence({
    intent,
    proof,
    before: snapshot,
    after: snapshot,
    commitPages: [[{ sha: headOid }]],
    filePages: [[{ status: "renamed", previous_filename: "old.txt", filename: "new.txt" }]],
  });
  assert.deepEqual(result.records, [
    { operation: "add", path: "new.txt" },
    { operation: "delete", path: "old.txt" },
  ]);
});

test("T-14/T-15 failures are non-mutating and deterministic", () => {
  const fixture = createFixture();
  const headOid = commitFile(fixture);
  const intent = intentFor(fixture, headOid, [{ operation: "add", path: "wrong.txt" }]);
  const headBefore = git(fixture.repo, "rev-parse", "HEAD");
  const refsBefore = git(fixture.repo, "for-each-ref", "--format=%(refname) %(objectname)");
  expectFailure(() => verifyLocal(fixture.repo, intent), "changed_file_record_mismatch");
  assert.equal(git(fixture.repo, "rev-parse", "HEAD"), headBefore);
  assert.equal(
    git(fixture.repo, "for-each-ref", "--format=%(refname) %(objectname)"),
    refsBefore,
  );
  const destructive = spawnSync(
    path.resolve("utl/gh/branch-scope.sh"),
    ["force-push", "--repo", fixture.repo],
    { encoding: "utf8" },
  );
  assert.equal(destructive.status, 2);
  assert.equal(git(fixture.repo, "rev-parse", "HEAD"), headBefore);
  assert.equal(
    git(fixture.repo, "for-each-ref", "--format=%(refname) %(objectname)"),
    refsBefore,
  );
  const intentFile = path.join(fixture.root, "invalid-intent.json");
  const invalidIntent = structuredClone(intent);
  delete invalidIntent.publicationIntent.workItem;
  fs.writeFileSync(intentFile, `${JSON.stringify(invalidIntent)}\n`);
  const failed = spawnSync(
    path.resolve("utl/gh/branch-scope.sh"),
    ["verify-local", "--intent", intentFile, "--repo", fixture.repo],
    { encoding: "utf8" },
  );
  assert.equal(failed.status, 1);
  const failureEvidence = JSON.parse(failed.stderr);
  assert.equal(failureEvidence.phase, "local-verification");
  assert.equal(failureEvidence.proofSnapshot.repositoryPath, fixture.repo);
  assert.equal(failureEvidence.proofSnapshot.approvedBaseOid, fixture.baseOid);
  assert.equal(failureEvidence.authorityProvenance.publication.workItem, null);
  assert.equal(failureEvidence.availableEvidence.expected.commitCount, 1);
  assert.equal(failureEvidence.failure.kind, "approval_missing_or_stale");
  assert.equal(failureEvidence.differences, null);
  assert.match(failureEvidence.remediation, /authority/i);
  assert.equal(git(fixture.repo, "rev-parse", "HEAD"), headBefore);

  const mismatchIntentFile = path.join(fixture.root, "mismatch-intent.json");
  fs.writeFileSync(mismatchIntentFile, `${JSON.stringify(intent)}\n`);
  const mismatch = spawnSync(
    path.resolve("utl/gh/branch-scope.sh"),
    ["verify-local", "--intent", mismatchIntentFile, "--repo", fixture.repo],
    { encoding: "utf8" },
  );
  assert.equal(mismatch.status, 1);
  const mismatchEvidence = JSON.parse(mismatch.stderr);
  assert.equal(mismatchEvidence.failure.kind, "changed_file_record_mismatch");
  assert.deepEqual(mismatchEvidence.differences.expected, [
    { operation: "add", path: "wrong.txt" },
  ]);
  assert.deepEqual(mismatchEvidence.differences.actual, [
    { operation: "add", path: "feature.txt" },
  ]);

  const proof = mockProof(
    intentFor(fixture, headOid, [{ operation: "add", path: "wrong.txt" }]),
    headOid,
    fixture.baseOid,
  );
  delete proof.expected.primitiveRecordDigest;
  expectFailure(
    () =>
      reconcileGithubEvidence({
        intent: intentFor(
          fixture,
          headOid,
          [{ operation: "add", path: "wrong.txt" }],
        ),
        proof,
        before: mockSnapshot(fixture.baseOid, headOid),
        after: mockSnapshot(fixture.baseOid, headOid),
        commitPages: [[{ sha: headOid }]],
        filePages: [[{ status: "added", filename: "wrong.txt" }]],
      }),
    "stale_local_proof",
  );
});

test("T-16/T-17 accepts initial #120 authority and enforces non-destructive recovery", () => {
  const baseOid = "b2c6ca96930def7477f91f648b8f85e6f24275b8";
  const headOid = "d51644be2c5370433bdc723af4263e977f68302a";
  const replacementBaseOid = "4".repeat(40);
  const initial = intentFor({ baseOid }, headOid, [
    { operation: "add", path: "evidence.txt" },
  ]);
  initial.baseAuthorization.workItem = "#120";
  initial.readyAuthority.workItem = "#120";
  initial.publicationIntent.workItem = "#120";
  initial.readyAuthority.revision = "5258296515";
  initial.baseAuthorization.revision = "BA-120-01";
  initial.baseAuthorization.targetRepository = "normenmueller/ai4X";
  initial.baseAuthorization.lineage[0].revision = "BA-120-01";
  initial.baseAuthorization.poReservedConstraints = [...PO_RESERVED_CONSTRAINTS];
  initial.publicationIntent.revision = "PI-120-01";
  initial.publicationIntent.baseAuthorizationRevision = "BA-120-01";
  const checkedInitial = validateIntent(structuredClone(initial));
  assert.equal(checkedInitial.baseAuthorization.lineage.length, 1);
  assert.equal(checkedInitial.baseAuthorization.lineage[0].replacementApproval, null);
  assert.deepEqual(
    checkedInitial.baseAuthorization.poReservedConstraints,
    [...PO_RESERVED_CONSTRAINTS].sort((left, right) =>
      Buffer.compare(Buffer.from(left), Buffer.from(right)),
    ),
  );
  const incompleteInitial = structuredClone(initial);
  incompleteInitial.baseAuthorization.poReservedConstraints = ["base-replacement"];
  expectFailure(() => validateIntent(incompleteInitial), "approval_missing_or_stale");
  const falseInitialReplacement = structuredClone(initial);
  falseInitialReplacement.baseAuthorization.lineage[0].replacementApproval = {};
  expectFailure(() => validateIntent(falseInitialReplacement), "approval_missing_or_stale");

  const localFixture = createFixture();
  const localHeadOid = commitFile(localFixture);
  const localInitial = intentFor(localFixture, localHeadOid, [
    { operation: "add", path: "feature.txt" },
  ]);
  localInitial.baseAuthorization.workItem = "#120";
  localInitial.readyAuthority.workItem = "#120";
  localInitial.publicationIntent.workItem = "#120";
  localInitial.baseAuthorization.poReservedConstraints = [...PO_RESERVED_CONSTRAINTS];
  const localProof = verifyLocal(localFixture.repo, localInitial);
  assert.equal(localProof.approvedBaseOid, localFixture.baseOid);
  assert.equal(localProof.verifiedHeadOid, localHeadOid);
  assert.deepEqual(localProof.actual.commits, [localHeadOid]);
  assert.deepEqual(localProof.actual.primitiveRecords, [
    { operation: "add", path: "feature.txt" },
  ]);
  assert.deepEqual(localProof.cleanliness, { index: true, worktree: true });
  assert.equal(localProof.remoteBinding.repository, FIXTURE_REPOSITORY);

  const intent = structuredClone(initial);
  const priorAuthority = intent.baseAuthorization.lineage[0];
  intent.baseAuthorization.revision = "base-2";
  intent.baseAuthorization.baseOid = replacementBaseOid;
  intent.baseAuthorization.lineage.push({
    sequence: 2,
    revision: "base-2",
    approver: "gertrud-ai4x",
    baseOid: replacementBaseOid,
    replacementApproval: {
      previousRevision: priorAuthority.revision,
      previousBaseOid: priorAuthority.baseOid,
      previousApprover: priorAuthority.approver,
      previousAuthorityDigest: digestJson({
        revision: priorAuthority.revision,
        approver: priorAuthority.approver,
        baseOid: priorAuthority.baseOid,
      }),
      poApprover: "normenmueller",
      poAuthority: "product-owner",
      poApprovalRevision: "po-recovery-1",
      preserveOriginalBranch: true,
      preserveOriginalPullRequest: true,
      destructiveActionsAuthorized: false,
    },
  });
  intent.publicationIntent.baseAuthorizationRevision = "base-2";
  const checked = validateIntent(intent);
  assert.deepEqual(
    checked.baseAuthorization.poReservedConstraints,
    [...PO_RESERVED_CONSTRAINTS].sort((left, right) =>
      Buffer.compare(Buffer.from(left), Buffer.from(right)),
    ),
  );
  assert.equal(checked.publicationIntent.baseAuthorizationRevision, "base-2");

  const alias = intentFor({ baseOid }, headOid, [
    { operation: "add", path: "evidence.txt" },
  ]);
  alias.readyAuthority.workItem = "120";
  alias.baseAuthorization.workItem = "120";
  alias.publicationIntent.workItem = "120";
  expectFailure(() => validateIntent(alias), "invalid_input");

  const mutations = [
    (value) => {
      value.baseAuthorization.poReservedConstraints = [];
    },
    (value) => {
      value.baseAuthorization.poReservedConstraints = ["base-replacement"];
    },
    (value) => {
      delete value.publicationIntent.workItem;
    },
  ];
  for (const mutate of mutations) {
    const mutant = structuredClone(intent);
    mutate(mutant);
    expectFailure(() => validateIntent(mutant), "approval_missing_or_stale");
  }

  const approvedProof = mockProof(intent, headOid, replacementBaseOid);
  for (const mutate of [
    (value) => value.actual.commits.pop(),
    (value) => value.actual.primitiveRecords.pop(),
    (value) => (value.proofSnapshot.currentTargetOid = "f".repeat(40)),
    (value) => (value.authority.publication.approver = "observed-tech-lead"),
  ]) {
    const mutant = structuredClone(approvedProof);
    mutate(mutant);
    expectFailure(
      () =>
        reconcileGithubEvidence({
          intent,
          proof: mutant,
          before: mockSnapshot(replacementBaseOid, headOid),
          after: mockSnapshot(replacementBaseOid, headOid),
          commitPages: [[{ sha: headOid }]],
          filePages: [[{ status: "added", filename: "evidence.txt" }]],
        }),
      "stale_local_proof",
    );
  }

  const replacement = structuredClone(intent);
  validateIntent(replacement);

  const omittedPredecessor = structuredClone(replacement);
  omittedPredecessor.baseAuthorization.lineage.shift();
  expectFailure(() => validateIntent(omittedPredecessor), "approval_missing_or_stale");
  const reorderedLineage = structuredClone(replacement);
  reorderedLineage.baseAuthorization.lineage.reverse();
  expectFailure(() => validateIntent(reorderedLineage), "approval_missing_or_stale");

  for (const field of ["preserveOriginalBranch", "preserveOriginalPullRequest"]) {
    const mutant = structuredClone(replacement);
    mutant.baseAuthorization.lineage[1].replacementApproval[field] = false;
    expectFailure(() => validateIntent(mutant), "approval_missing_or_stale");
  }
  const destructiveMutant = structuredClone(replacement);
  destructiveMutant.baseAuthorization.lineage[1].replacementApproval.destructiveActionsAuthorized =
    true;
  expectFailure(() => validateIntent(destructiveMutant), "approval_missing_or_stale");
  const authorityMutant = structuredClone(replacement);
  authorityMutant.baseAuthorization.lineage[1].replacementApproval.previousApprover =
    "someone-else";
  expectFailure(() => validateIntent(authorityMutant), "approval_missing_or_stale");
  const successorApproverMutant = structuredClone(replacement);
  successorApproverMutant.baseAuthorization.lineage[1].approver = "someone-else";
  successorApproverMutant.baseAuthorization.approver = "someone-else";
  expectFailure(() => validateIntent(successorApproverMutant), "approval_missing_or_stale");
  const repeatedBaseMutant = structuredClone(replacement);
  repeatedBaseMutant.baseAuthorization.lineage[1].baseOid = baseOid;
  repeatedBaseMutant.baseAuthorization.baseOid = baseOid;
  expectFailure(() => validateIntent(repeatedBaseMutant), "approval_missing_or_stale");
  const repeatedRevisionMutant = structuredClone(replacement);
  repeatedRevisionMutant.baseAuthorization.lineage[1].revision = "BA-120-01";
  repeatedRevisionMutant.baseAuthorization.revision = "BA-120-01";
  repeatedRevisionMutant.publicationIntent.baseAuthorizationRevision = "BA-120-01";
  expectFailure(() => validateIntent(repeatedRevisionMutant), "approval_missing_or_stale");
  const poMutant = structuredClone(replacement);
  poMutant.baseAuthorization.lineage[1].replacementApproval.poAuthority = "tech-lead";
  expectFailure(() => validateIntent(poMutant), "approval_missing_or_stale");
  for (const mutate of [
    (value) => delete value.baseAuthorization.lineage[1].replacementApproval,
    (value) =>
      (value.baseAuthorization.lineage[1].replacementApproval.previousBaseOid = "5".repeat(40)),
    (value) =>
      (value.baseAuthorization.lineage[1].replacementApproval.previousAuthorityDigest =
        "6".repeat(64)),
    (value) =>
      (value.baseAuthorization.lineage[1].replacementApproval.previousRevision = "base-0"),
    (value) => (value.baseAuthorization.lineage[1].replacementApproval.poApprover = ""),
    (value) => delete value.baseAuthorization.lineage[1].replacementApproval.poApprovalRevision,
    (value) => (value.baseAuthorization.lineage[1].sequence = 3),
  ]) {
    const mutant = structuredClone(replacement);
    mutate(mutant);
    expectFailure(() => validateIntent(mutant), "approval_missing_or_stale");
  }

  const obsoleteReplacement = structuredClone(intent);
  obsoleteReplacement.baseAuthorization.replacement = {};
  expectFailure(() => validateIntent(obsoleteReplacement), "invalid_input");
});
