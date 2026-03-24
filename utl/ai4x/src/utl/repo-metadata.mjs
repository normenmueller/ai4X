#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(SRC_DIR, "../../..");
const CENTRAL_FILE = path.join(REPO_ROOT, "adm", "ops", "runbooks", "github-repo-metadata.yaml");
const REPO_METADATA_VERSION = "0.1.0";

const REQUIRED_REPOS = ["ai4x", "ask", "kob", "ccp", "tcp"];
const MIRROR_FILES = {
  ai4x: path.join(REPO_ROOT, "acc", "repo-metadata.yaml"),
  ask: path.join(REPO_ROOT, "mod", "ask", "acc", "repo-metadata.yaml"),
  kob: path.join(REPO_ROOT, "mod", "kob", "acc", "repo-metadata.yaml"),
  ccp: path.join(REPO_ROOT, "mod", "cap", "cog", "acc", "repo-metadata.yaml"),
  tcp: path.join(REPO_ROOT, "mod", "cap", "tec", "acc", "repo-metadata.yaml"),
};

const mode = process.argv[2] ?? "--check";
if (!["--check", "--check-local", "--apply"].includes(mode)) {
  process.stderr.write("[repo-metadata|ERROR]: usage: --check | --check-local | --apply\n");
  process.exit(2);
}

function runGh(args) {
  return spawnSync("gh", args, { encoding: "utf8" });
}

function fail(message) {
  process.stderr.write(`[repo-metadata|ERROR]: ${message}\n`);
  return false;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function parseYamlFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return parse(raw);
}

function validateRepoEntry(id, entry) {
  if (!entry || typeof entry !== "object") {
    return fail(`central entry '${id}' must be a map`);
  }
  if (!isNonEmptyString(entry.owner)) {
    return fail(`central entry '${id}' requires non-empty owner`);
  }
  if (!isNonEmptyString(entry.name)) {
    return fail(`central entry '${id}' requires non-empty name`);
  }
  if (!isNonEmptyString(entry.about)) {
    return fail(`central entry '${id}' requires non-empty about`);
  }
  if (!Array.isArray(entry.topics) || entry.topics.length === 0) {
    return fail(`central entry '${id}' requires a non-empty topics array`);
  }
  const unique = new Set();
  for (const topic of entry.topics) {
    if (!isNonEmptyString(topic)) {
      return fail(`central entry '${id}' contains an empty topic`);
    }
    unique.add(topic);
  }
  if (unique.size !== entry.topics.length) {
    return fail(`central entry '${id}' contains duplicate topics`);
  }
  return true;
}

function loadCentralContract() {
  if (!fs.existsSync(CENTRAL_FILE)) {
    throw new Error(`missing central metadata file: ${CENTRAL_FILE}`);
  }
  const cfg = parseYamlFile(CENTRAL_FILE);
  if (!cfg || typeof cfg !== "object") {
    throw new Error("central metadata must be a map");
  }
  if (cfg.version !== REPO_METADATA_VERSION) {
    throw new Error(`central metadata version must be ${REPO_METADATA_VERSION}`);
  }
  if (!cfg.repos || typeof cfg.repos !== "object") {
    throw new Error("central metadata requires repos map");
  }
  for (const id of REQUIRED_REPOS) {
    if (!(id in cfg.repos)) {
      throw new Error(`central metadata missing repo '${id}'`);
    }
    if (!validateRepoEntry(id, cfg.repos[id])) {
      throw new Error("central metadata validation failed");
    }
  }
  return cfg.repos;
}

function normalizeTopics(topics) {
  if (!Array.isArray(topics)) return [];
  return [...new Set(topics.map((topic) => String(topic).trim()).filter((topic) => topic.length > 0))].sort();
}

function topicsEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  const left = normalizeTopics(a);
  const right = normalizeTopics(b);
  if (left.length !== right.length) return false;
  return left.every((topic, idx) => topic === right[idx]);
}

function checkLocalMirrors(repos) {
  let ok = true;
  for (const id of REQUIRED_REPOS) {
    const mirrorPath = MIRROR_FILES[id];
    if (!fs.existsSync(mirrorPath)) {
      ok = fail(`missing mirror file for ${id}: ${mirrorPath}`) && ok;
      continue;
    }
    const mirror = parseYamlFile(mirrorPath);
    if (!mirror || typeof mirror !== "object") {
      ok = fail(`mirror file for ${id} must be a map`) && ok;
      continue;
    }
    if (mirror.version !== REPO_METADATA_VERSION) {
      ok = fail(`mirror file for ${id} requires version ${REPO_METADATA_VERSION}`) && ok;
    }
    if (mirror.repo !== id) {
      ok = fail(`mirror file for ${id} has repo='${String(mirror.repo)}'`) && ok;
    }
    if (mirror.about !== repos[id].about) {
      ok = fail(`mirror about mismatch for ${id}`) && ok;
    }
    if (!topicsEqual(mirror.topics, repos[id].topics)) {
      ok = fail(`mirror topics mismatch for ${id}`) && ok;
    }
  }
  return ok;
}

function ghAvailable() {
  const probe = runGh(["auth", "status"]);
  return probe.status === 0;
}

function checkRemote(repos) {
  if (!ghAvailable()) {
    process.stdout.write("[repo-metadata|WARN]: gh auth is unavailable; remote drift check skipped\n");
    return true;
  }
  let ok = true;
  for (const id of REQUIRED_REPOS) {
    const expected = repos[id];
    const repoRef = `${expected.owner}/${expected.name}`;

    const descOut = runGh(["api", `repos/${repoRef}`, "--jq", ".description // \"\""]);
    if (descOut.status !== 0) {
      ok = fail(`failed to read description for ${repoRef}: ${descOut.stderr.trim()}`) && ok;
      continue;
    }
    const remoteAbout = descOut.stdout.trim();
    if (remoteAbout !== expected.about) {
      ok = fail(`remote about mismatch for ${repoRef}`) && ok;
    }

    const topicsOut = runGh(["api", `repos/${repoRef}/topics`, "--jq", ".names[]"]);
    if (topicsOut.status !== 0) {
      ok = fail(`failed to read topics for ${repoRef}: ${topicsOut.stderr.trim()}`) && ok;
      continue;
    }
    const remoteTopics = topicsOut.stdout
      .split("\n")
      .map((topic) => topic.trim())
      .filter((topic) => topic.length > 0);

    if (!topicsEqual(remoteTopics, expected.topics)) {
      ok = fail(`remote topics mismatch for ${repoRef}`) && ok;
    }
  }
  return ok;
}

function applyRemote(repos) {
  if (!ghAvailable()) {
    process.stderr.write("[repo-metadata|ERROR]: gh auth is required for --apply\n");
    return false;
  }
  let ok = true;
  for (const id of REQUIRED_REPOS) {
    const expected = repos[id];
    const repoRef = `${expected.owner}/${expected.name}`;

    const descOut = runGh(["api", "-X", "PATCH", `repos/${repoRef}`, "-f", `description=${expected.about}`]);
    if (descOut.status !== 0) {
      ok = fail(`failed to apply description for ${repoRef}: ${descOut.stderr.trim()}`) && ok;
      continue;
    }

    const topicArgs = ["api", "-X", "PUT", `repos/${repoRef}/topics`];
    for (const topic of expected.topics) {
      topicArgs.push("-f", `names[]=${topic}`);
    }
    const topicsOut = runGh(topicArgs);
    if (topicsOut.status !== 0) {
      ok = fail(`failed to apply topics for ${repoRef}: ${topicsOut.stderr.trim()}`) && ok;
      continue;
    }

    process.stdout.write(`[repo-metadata|INFO]: applied ${repoRef}\n`);
  }
  return ok;
}

let repos;
try {
  repos = loadCentralContract();
} catch (error) {
  process.stderr.write(`[repo-metadata|ERROR]: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}

const localOk = checkLocalMirrors(repos);
if (!localOk) {
  process.exit(1);
}
process.stdout.write("[repo-metadata|INFO]: local metadata contract: ok\n");

if (mode === "--check-local") {
  process.exit(0);
}

if (mode === "--check") {
  if (!checkRemote(repos)) {
    process.exit(1);
  }
  process.stdout.write("[repo-metadata|INFO]: remote metadata check: ok\n");
  process.exit(0);
}

if (!applyRemote(repos)) {
  process.exit(1);
}
process.stdout.write("[repo-metadata|INFO]: apply completed\n");
