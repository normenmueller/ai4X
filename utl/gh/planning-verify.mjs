#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { canonicalJson, diagnosticExit, EVIDENCE_ONLY_MESSAGE, validatePlanningObservation } from "./planning-contract.mjs";
import { createGithubTransport, observePlanning } from "./planning-github-observer.mjs";

function usage() {
  return "usage: planning-verify.mjs snapshot --input <file> | live --expected <file>";
}

function parseArguments(argv) {
  if (argv.length !== 3 || !["snapshot", "live"].includes(argv[0])) throw new Error(usage());
  const expectedFlag = argv[0] === "snapshot" ? "--input" : "--expected";
  if (argv[1] !== expectedFlag || argv[2].length === 0) throw new Error(usage());
  return { mode: argv[0], file: argv[2] };
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

export async function run(argv, boundary = {}) {
  const parsed = parseArguments(argv);
  let input;
  try {
    input = await readJson(parsed.file);
  } catch {
    return validatePlanningObservation(null);
  }
  if (parsed.mode === "snapshot") return validatePlanningObservation(input);
  const token = boundary.token ?? process.env.GH_TOKEN;
  if (typeof token !== "string" || token.length === 0) throw new Error("GH_TOKEN is required for live read-only verification.");
  const transport = boundary.transport ?? createGithubTransport({ token });
  const observation = await observePlanning(input, { transport, limits: boundary.limits });
  return observation.ok ? validatePlanningObservation(observation.value) : observation;
}

async function main() {
  let result;
  try {
    result = await run(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : usage()}\n`);
    process.exitCode = 2;
    return;
  }
  process.stdout.write(`${canonicalJson({ evidence: EVIDENCE_ONLY_MESSAGE, result })}\n`);
  process.stderr.write(`${EVIDENCE_ONLY_MESSAGE}\n`);
  process.exitCode = diagnosticExit(result);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main();
