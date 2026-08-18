#!/usr/bin/env node

import { readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { projectionBytes, withProvenance } from "./projection.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(HERE, "..", "..", "..");
const DHALL_PROJECTION = path.join(HERE, "projection.dhall");
const GENERATED = path.join(REPOSITORY_ROOT, ".ai4x", "generated", "assurance", "session-hygiene-policy.json");

function evaluateDhall() {
  const result = spawnSync("dhall", ["text", "--file", DHALL_PROJECTION], {
    cwd: REPOSITORY_ROOT,
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
  });
  if (result.error || result.status !== 0) {
    throw new Error(`Dhall projection failed: ${result.error?.code ?? result.stderr.trim() ?? "unknown"}`);
  }
  let evaluated;
  try {
    evaluated = JSON.parse(result.stdout);
  } catch {
    throw new Error("Dhall projection did not emit valid JSON text");
  }
  return withProvenance(evaluated, REPOSITORY_ROOT);
}

function main(argv) {
  if (argv.length !== 1 || !["--publish", "--check"].includes(argv[0])) {
    process.stderr.write("usage: publish-projection.mjs --publish|--check\n");
    return 2;
  }
  let expected;
  try {
    expected = projectionBytes(evaluateDhall());
  } catch (error) {
    process.stderr.write(`[session-hygiene|ERROR]: ${error.message}\n`);
    return 1;
  }

  if (argv[0] === "--check") {
    let observed;
    try {
      observed = readFileSync(GENERATED, "utf8");
    } catch (error) {
      process.stderr.write(`[session-hygiene|ERROR]: generated projection unavailable: ${error.code ?? "unknown"}\n`);
      return 1;
    }
    if (observed !== expected) {
      process.stderr.write("[session-hygiene|ERROR]: generated projection is stale; run make session-hygiene-publish\n");
      return 1;
    }
    process.stdout.write("[session-hygiene|INFO]: projection is current\n");
    return 0;
  }

  const temporary = `${GENERATED}.tmp-${process.pid}`;
  try {
    writeFileSync(temporary, expected, { encoding: "utf8", flag: "wx", mode: 0o644 });
    renameSync(temporary, GENERATED);
  } catch (error) {
    process.stderr.write(`[session-hygiene|ERROR]: projection publication failed: ${error.code ?? "unknown"}\n`);
    return 1;
  }
  process.stdout.write("[session-hygiene|INFO]: projection published\n");
  return 0;
}

process.exitCode = main(process.argv.slice(2));
