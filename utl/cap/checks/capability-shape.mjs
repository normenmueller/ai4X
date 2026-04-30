#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const rootArg = process.argv[2];
const root = rootArg ? path.resolve(rootArg) : path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../../dev/cap");
const capRoot = root;
const requiredHeadings = [
  "## Purpose",
  "## Trigger",
  "## Rules (MUST)",
  "## Fallback",
  "## Minimal Output Contract",
];
const disallowedGermanMarkers = [
  "## Zweck",
  "## Regeln (MUST)",
  "## Minimaler Output-Vertrag",
  "## Gate-Dimensionen",
  "## Begriffe",
  "## Kopplungslogik",
  "vorläufig",
  "Nicht-Priorisierung",
  "Messdefinition",
  "Entscheidungsgegenstand",
];

let fail = 0;

const placeholderPatterns = [
  /\bTODO\b/i,
  /\bTBD\b/i,
  /\bplaceholder\b/i,
  /\bfill (?:this|me|in)\b/i,
  /\bcoming soon\b/i,
  /\bto be defined\b/i,
];

function error(message) {
  fail += 1;
  process.stderr.write(`[ccp|ERROR]: ${message}\n`);
}

function extractSection(text, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^${escapedHeading}\\s*$`, "m");
  const match = text.match(pattern);
  if (!match || match.index === undefined) {
    return "";
  }
  const start = match.index + match[0].length;
  const rest = text.slice(start).replace(/^\s+/, "");
  const nextHeading = rest.search(/^##\s+/m);
  return (nextHeading >= 0 ? rest.slice(0, nextHeading) : rest).trim();
}

function contentLines(section) {
  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function hasPlaceholder(section) {
  return placeholderPatterns.some((pattern) => pattern.test(section));
}

function collectActiveMarkdownFiles() {
  const result = [];
  const stack = [capRoot];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || !fs.existsSync(current)) {
      continue;
    }
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === "utl") {
          continue;
        }
        stack.push(full);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".meta.yaml")) {
        continue;
      }
      const meta = fs.readFileSync(full, "utf8");
      if (!/^status:\s*active$/m.test(meta)) {
        continue;
      }
      const md = full.replace(/\.meta\.yaml$/, ".md");
      result.push(md);
    }
  }
  return result.sort();
}

for (const mdPath of collectActiveMarkdownFiles()) {
  if (!fs.existsSync(mdPath)) {
    error(`${path.relative(root, mdPath)}: missing markdown file for active capability`);
    continue;
  }

  const text = fs.readFileSync(mdPath, "utf8");
  const relative = path.relative(root, mdPath);
  const headings = text
    .split(/\r?\n/)
    .filter((line) => line.startsWith("## "))
    .map((line) => line.trim());

  if (headings.length !== requiredHeadings.length || !requiredHeadings.every((heading, idx) => headings[idx] === heading)) {
    error(`${relative}: active capability must use exactly the canonical headings in order (${requiredHeadings.join(", ")})`);
  }

  const purpose = extractSection(text, "## Purpose");
  const trigger = extractSection(text, "## Trigger");
  const fallback = extractSection(text, "## Fallback");
  const minimalOutput = extractSection(text, "## Minimal Output Contract");

  if (contentLines(purpose).length === 0) {
    error(`${relative}: '## Purpose' must not be empty`);
  }
  if (contentLines(trigger).length === 0) {
    error(`${relative}: '## Trigger' must not be empty`);
  }
  if (contentLines(fallback).length === 0) {
    error(`${relative}: '## Fallback' must not be empty`);
  }
  if (contentLines(minimalOutput).length === 0) {
    error(`${relative}: '## Minimal Output Contract' must not be empty`);
  }

  if (!contentLines(fallback).some((line) => line.startsWith("- "))) {
    error(`${relative}: '## Fallback' must contain at least one concrete bullet`);
  }
  if (!contentLines(minimalOutput).some((line) => line.startsWith("- "))) {
    error(`${relative}: '## Minimal Output Contract' must contain at least one concrete bullet`);
  }

  for (const [sectionName, sectionValue] of [
    ["## Purpose", purpose],
    ["## Trigger", trigger],
    ["## Fallback", fallback],
    ["## Minimal Output Contract", minimalOutput],
  ]) {
    if (hasPlaceholder(sectionValue)) {
      error(`${relative}: '${sectionName}' contains placeholder wording`);
    }
  }

  for (const marker of disallowedGermanMarkers) {
    if (text.includes(marker)) {
      error(`${relative}: active capability contains forbidden non-canonical marker '${marker}'`);
    }
  }
}

if (fail > 0) {
  process.exit(1);
}

process.stdout.write("[ccp|INFO]: capability-shape gate passed\n");
