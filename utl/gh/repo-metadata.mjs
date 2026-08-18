#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { diffLabelRecords, labelRecordsFromConfig, planLabelReconciliation } from "./repo-labels.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const METADATA_FILE = path.join(__dirname, "repo-metadata.yaml");
const REPO_METADATA_VERSION = "0.2.0";

function runGh(args) {
  return spawnSync("gh", args, { encoding: "utf8", cwd: REPO_ROOT });
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

export function loadMetadata() {
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
  return { ...cfg, labels: labelRecordsFromConfig(cfg.labels) };
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

function readRemoteLabels(target) {
  const output = runGh(["api", "--paginate", "--slurp", `repos/${target}/labels?per_page=100`]);
  if (output.status !== 0) {
    throw new Error(`failed to read labels for ${target}: ${output.stderr.trim()}`);
  }
  let pages;
  try {
    pages = JSON.parse(output.stdout);
  } catch {
    throw new Error(`failed to parse labels for ${target}`);
  }
  if (!Array.isArray(pages) || !pages.every(Array.isArray)) {
    throw new Error(`labels for ${target} are not a paginated array`);
  }
  return pages.flat();
}

function readRemoteState(target) {
  const aboutOut = runGh(["api", `repos/${target}`, "--jq", ".description // \"\""]);
  if (aboutOut.status !== 0) {
    throw new Error(`failed to read description for ${target}: ${aboutOut.stderr.trim()}`);
  }
  const topicsOut = runGh(["api", `repos/${target}/topics`, "--jq", ".names[]"]);
  if (topicsOut.status !== 0) {
    throw new Error(`failed to read topics for ${target}: ${topicsOut.stderr.trim()}`);
  }
  const topics = topicsOut.stdout
    .split("\n")
    .map((topic) => topic.trim())
    .filter((topic) => topic.length > 0);
  return { about: aboutOut.stdout.trim(), topics, labels: readRemoteLabels(target) };
}

function reportLabelDiff(diff, target) {
  let ok = true;
  if (diff.missing.length > 0) {
    fail(`remote labels missing for ${target}: ${diff.missing.join(", ")}`);
    ok = false;
  }
  if (diff.extra.length > 0) {
    fail(`undeclared remote labels for ${target}: ${diff.extra.join(", ")}`);
    ok = false;
  }
  if (diff.mismatched.length > 0) {
    const details = diff.mismatched.map(({ name, fields }) => `${name}(${fields.join("+")})`);
    fail(`remote label metadata mismatch for ${target}: ${details.join(", ")}`);
    ok = false;
  }
  return ok;
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

function checkLocalMetadata(metadata, repoRef) {
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

function checkRemote(metadata, target) {
  if (!ghAvailable()) {
    return fail("gh auth is required for remote drift check; use --check-local for offline validation");
  }
  let remote;
  try {
    remote = readRemoteState(target);
  } catch (error) {
    return fail(error instanceof Error ? error.message : String(error));
  }
  let ok = true;
  if (remote.about !== metadata.about) {
    ok = fail(`remote about mismatch for ${target}`) && ok;
  }
  if (!topicsEqual(remote.topics, metadata.topics)) {
    ok = fail(`remote topics mismatch for ${target}`) && ok;
  }
  if (!reportLabelDiff(diffLabelRecords(metadata.labels, remote.labels), target)) {
    ok = false;
  }
  return ok;
}

function applyRemote(metadata, target) {
  if (!ghAvailable()) {
    process.stderr.write("[gh|error]: gh auth is required for --apply\n");
    return false;
  }
  let remote;
  try {
    remote = readRemoteState(target);
  } catch (error) {
    return fail(error instanceof Error ? error.message : String(error));
  }
  const labelPlan = planLabelReconciliation(metadata.labels, remote.labels);
  if (!labelPlan.ok) {
    return fail(`refusing to delete undeclared remote labels for ${target}: ${labelPlan.diff.extra.join(", ")}`);
  }

  const operations = [];
  if (remote.about !== metadata.about) {
    operations.push({ name: "about:update", args: ["api", "-X", "PATCH", `repos/${target}`, "-f", `description=${metadata.about}`] });
  }
  if (!topicsEqual(remote.topics, metadata.topics)) {
    const args = ["api", "-X", "PUT", `repos/${target}/topics`];
    for (const topic of metadata.topics) args.push("-f", `names[]=${topic}`);
    operations.push({ name: "topics:update", args });
  }
  for (const operation of labelPlan.operations) {
    const { name, color, description } = operation.label;
    const args = operation.action === "create"
      ? ["api", "-X", "POST", `repos/${target}/labels`, "-f", `name=${name}`, "-f", `color=${color}`, "-f", `description=${description}`]
      : ["api", "-X", "PATCH", `repos/${target}/labels/${encodeURIComponent(name)}`, "-f", `new_name=${name}`, "-f", `color=${color}`, "-f", `description=${description}`];
    operations.push({ name: `label:${operation.action}:${name}`, args });
  }

  const completed = [];
  for (const operation of operations) {
    const output = runGh(operation.args);
    if (output.status !== 0) {
      const receipt = completed.length > 0 ? completed.join(", ") : "none";
      return fail(`operation '${operation.name}' failed for ${target}: ${output.stderr.trim()}; completed: ${receipt}; rerun --check before recovery`);
    }
    completed.push(operation.name);
  }

  process.stdout.write(`[gh|info]: applied ${target} (${operations.length} metadata changes)\n`);
  return true;
}

function main() {
  const mode = process.argv[2] ?? "--check";
  if (!["--check", "--check-local", "--apply"].includes(mode)) {
    process.stderr.write("[gh|error]: usage: --check | --check-local | --apply\n");
    process.exit(2);
  }

  let metadata;
  try {
    metadata = loadMetadata();
  } catch (error) {
    process.stderr.write(`[gh|error]: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
  const target = resolveRepoRefFromGit();
  if (!checkLocalMetadata(metadata, target)) process.exit(1);
  process.stdout.write("[gh|info]: local metadata contract: ok\n");

  if (mode === "--check-local") process.exit(0);
  if (!target) {
    process.stderr.write("[gh|error]: exact owner/repository cannot be derived from origin\n");
    process.exit(1);
  }
  if (mode === "--check") {
    if (!checkRemote(metadata, target)) process.exit(1);
    process.stdout.write("[gh|info]: remote metadata check: ok\n");
    process.exit(0);
  }

  if (!applyRemote(metadata, target)) process.exit(1);
  process.stdout.write("[gh|info]: apply completed\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main();
}
