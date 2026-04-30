#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const METADATA_FILE = path.join(REPO_ROOT, "acc", "repo-metadata.yaml");
const REPO_METADATA_VERSION = "0.1.0";

const mode = process.argv[2] ?? "--check";
if (!["--check", "--check-local", "--apply"].includes(mode)) {
  process.stderr.write("[gh|error]: usage: --check | --check-local | --apply\n");
  process.exit(2);
}

function runGh(args) {
  return spawnSync("gh", args, { encoding: "utf8" });
}

function runGit(args) {
  return spawnSync("git", args, { encoding: "utf8", cwd: REPO_ROOT });
}

function fail(message) {
  process.stderr.write(`[gh|error]: ${message}\n`);
  return false;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function parseYamlFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return parseSimpleYaml(raw);
}

function parseScalar(rawValue) {
  const value = rawValue.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseSimpleYaml(raw) {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.replace(/\t/g, "  "))
    .map((line) => ({
      indent: line.match(/^ */)[0].length,
      text: line.trim(),
    }))
    .filter((line) => line.text.length > 0 && !line.text.startsWith("#"));

  const [result, nextIndex] = parseBlock(lines, 0, 0);
  if (nextIndex !== lines.length) {
    throw new Error("failed to parse complete YAML document");
  }
  return result;
}

function parseBlock(lines, startIndex, indent) {
  let index = startIndex;
  let result = null;

  while (index < lines.length) {
    const line = lines[index];
    if (line.indent < indent) {
      break;
    }
    if (line.indent > indent) {
      throw new Error(`invalid indentation near '${line.text}'`);
    }

    if (line.text.startsWith("- ")) {
      if (result === null) {
        result = [];
      } else if (!Array.isArray(result)) {
        throw new Error("cannot mix sequence and mapping at same indentation");
      }
      const itemText = line.text.slice(2).trim();
      if (itemText.length === 0) {
        const [nested, nextIndex] = parseBlock(lines, index + 1, indent + 2);
        result.push(nested);
        index = nextIndex;
        continue;
      }
      result.push(parseScalar(itemText));
      index += 1;
      continue;
    }

    if (result === null) {
      result = {};
    } else if (Array.isArray(result)) {
      throw new Error("cannot mix mapping and sequence at same indentation");
    }

    const sep = line.text.indexOf(":");
    if (sep === -1) {
      throw new Error(`invalid mapping entry '${line.text}'`);
    }
    const key = line.text.slice(0, sep).trim();
    const remainder = line.text.slice(sep + 1).trim();
    if (remainder.length > 0) {
      result[key] = parseScalar(remainder);
      index += 1;
      continue;
    }

    const next = lines[index + 1];
    if (!next || next.indent <= indent) {
      result[key] = null;
      index += 1;
      continue;
    }
    const [nested, nextIndex] = parseBlock(lines, index + 1, indent + 2);
    result[key] = nested;
    index = nextIndex;
  }

  return [result ?? {}, index];
}

function validateRepoEntry(id, entry) {
  if (!entry || typeof entry !== "object") {
    return fail(`metadata entry '${id}' must be a map`);
  }
  if (!isNonEmptyString(entry.about)) {
    return fail(`metadata entry '${id}' requires non-empty about`);
  }
  if (!Array.isArray(entry.topics) || entry.topics.length === 0) {
    return fail(`metadata entry '${id}' requires a non-empty topics array`);
  }
  const unique = new Set();
  for (const topic of entry.topics) {
    if (!isNonEmptyString(topic)) {
      return fail(`metadata entry '${id}' contains an empty topic`);
    }
    unique.add(topic);
  }
  if (unique.size !== entry.topics.length) {
    return fail(`metadata entry '${id}' contains duplicate topics`);
  }
  return true;
}

function loadMetadata() {
  if (!fs.existsSync(METADATA_FILE)) {
    throw new Error(`missing metadata file: ${METADATA_FILE}`);
  }
  const cfg = parseYamlFile(METADATA_FILE);
  if (!cfg || typeof cfg !== "object") {
    throw new Error("metadata must be a map");
  }
  if (cfg.version !== REPO_METADATA_VERSION) {
    throw new Error(`metadata version must be ${REPO_METADATA_VERSION}`);
  }
  if (!isNonEmptyString(cfg.repo)) {
    throw new Error("metadata requires non-empty 'repo'");
  }
  if (!validateRepoEntry(cfg.repo, cfg)) {
    throw new Error("metadata validation failed");
  }
  return cfg;
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

function resolveRepoRefFromGit() {
  const remoteOut = runGit(["config", "--get", "remote.origin.url"]);
  if (remoteOut.status !== 0) {
    return null;
  }
  const remote = remoteOut.stdout.trim();
  if (remote.length === 0) {
    return null;
  }

  const match = remote.match(/github\.com[:/](.+?)\/([^/.]+?)(?:\.git)?$/i);
  if (!match) {
    return null;
  }
  return `${match[1]}/${match[2]}`;
}

function ghAvailable() {
  const probe = runGh(["auth", "status"]);
  return probe.status === 0;
}

function checkLocalMetadata(metadata) {
  const repoRef = resolveRepoRefFromGit();
  if (!repoRef) {
    process.stdout.write("[gh|warn]: cannot derive owner/repo from git remote; local-only checks applied\n");
    return true;
  }
  const repoName = repoRef.split("/")[1] || "";
  if (metadata.repo !== repoName) {
    return fail(`metadata repo '${metadata.repo}' does not match git remote repo '${repoName}'`);
  }
  return true;
}

function checkRemote(metadata) {
  if (!ghAvailable()) {
    process.stdout.write("[gh|warn]: gh auth is unavailable; remote drift check skipped\n");
    return true;
  }
  const repoRef = runGh(["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]);
  if (repoRef.status !== 0) {
    return fail(`failed to determine active repo with gh: ${repoRef.stderr.trim()}`);
  }
  const target = repoRef.stdout.trim();

  const descOut = runGh(["api", `repos/${target}`, "--jq", ".description // \"\""]);
  if (descOut.status !== 0) {
    return fail(`failed to read description for ${target}: ${descOut.stderr.trim()}`);
  }
  const remoteAbout = descOut.stdout.trim();
  let ok = true;
  if (remoteAbout !== metadata.about) {
    ok = fail(`remote about mismatch for ${target}`) && ok;
  }

  const topicsOut = runGh(["api", `repos/${target}/topics`, "--jq", ".names[]"]);
  if (topicsOut.status !== 0) {
    return fail(`failed to read topics for ${target}: ${topicsOut.stderr.trim()}`) && ok;
  }
  const remoteTopics = topicsOut.stdout
    .split("\n")
    .map((topic) => topic.trim())
    .filter((topic) => topic.length > 0);

  if (!topicsEqual(remoteTopics, metadata.topics)) {
    ok = fail(`remote topics mismatch for ${target}`) && ok;
  }
  return ok;
}

function applyRemote(metadata) {
  if (!ghAvailable()) {
    process.stderr.write("[gh|error]: gh auth is required for --apply\n");
    return false;
  }
  const repoRef = runGh(["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]);
  if (repoRef.status !== 0) {
    return fail(`failed to determine active repo with gh: ${repoRef.stderr.trim()}`);
  }
  const target = repoRef.stdout.trim();

  const descOut = runGh(["api", "-X", "PATCH", `repos/${target}`, "-f", `description=${metadata.about}`]);
  if (descOut.status !== 0) {
    return fail(`failed to apply description for ${target}: ${descOut.stderr.trim()}`);
  }

  const topicArgs = ["api", "-X", "PUT", `repos/${target}/topics`];
  for (const topic of metadata.topics) {
    topicArgs.push("-f", `names[]=${topic}`);
  }
  const topicsOut = runGh(topicArgs);
  if (topicsOut.status !== 0) {
    return fail(`failed to apply topics for ${target}: ${topicsOut.stderr.trim()}`);
  }

  process.stdout.write(`[gh|info]: applied ${target}\n`);
  return true;
}

let metadata;
try {
  metadata = loadMetadata();
} catch (error) {
  process.stderr.write(`[gh|error]: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}

const localOk = checkLocalMetadata(metadata);
if (!localOk) {
  process.exit(1);
}
process.stdout.write("[gh|info]: local metadata contract: ok\n");

if (mode === "--check-local") {
  process.exit(0);
}

if (mode === "--check") {
  if (!checkRemote(metadata)) {
    process.exit(1);
  }
  process.stdout.write("[gh|info]: remote metadata check: ok\n");
  process.exit(0);
}

if (!applyRemote(metadata)) {
  process.exit(1);
}
process.stdout.write("[gh|info]: apply completed\n");
