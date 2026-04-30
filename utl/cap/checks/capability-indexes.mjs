#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const args = process.argv.slice(2);
const modeArg = args.find((a) => a === "--check" || a === "--write") ?? "--check";
const rootArg = args.find((a) => !a.startsWith("--"));
const root = rootArg ? path.resolve(rootArg) : path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../../dev/cap");
const capRoot = root;
const writeMode = modeArg === "--write";
let fail = 0;

function error(message) {
  fail += 1;
  process.stderr.write(`[ccp|ERROR]: ${message}\n`);
}

function readMeta(metaPath) {
  const raw = fs.readFileSync(metaPath, "utf8");
  const out = YAML.parse(raw);
  if (out == null || typeof out !== "object") {
    return {};
  }
  return out;
}

function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map(String);
}

function extractSection(markdown, heading) {
  const pattern = new RegExp(`^## ${heading}\\s*$`, "m");
  const match = markdown.match(pattern);
  if (!match || match.index === undefined) {
    return "";
  }
  const start = match.index + match[0].length;
  const rest = markdown.slice(start).replace(/^\s+/, "");
  const nextHeading = rest.search(/^##\s+/m);
  const section = nextHeading >= 0 ? rest.slice(0, nextHeading) : rest;
  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("- "))
    .join(" ")
    .trim();
}

function titleCase(segment) {
  if (segment === "ai") {
    return "AI";
  }
  return segment
    .split("-")
    .map((part) => part.length === 0 ? part : part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function relFromCap(absDir) {
  return path.relative(capRoot, absDir).split(path.sep).filter(Boolean);
}

const SKIP_DIRS = new Set(["node_modules", "utl"]);

function hasCapabilitiesDeep(absDir) {
  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      if (hasCapabilitiesDeep(full)) {
        return true;
      }
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "index.md") {
      return true;
    }
  }
  return false;
}

function getDirectCapabilities(absDir) {
  return fs.readdirSync(absDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && entry.name !== "index.md")
    .map((entry) => {
      const mdPath = path.join(absDir, entry.name);
      const metaPath = mdPath.replace(/\.md$/, ".meta.yaml");
      const markdown = fs.readFileSync(mdPath, "utf8");
      const meta = fs.existsSync(metaPath) ? readMeta(metaPath) : {};
      return {
        id: path.basename(entry.name, ".md"),
        file: path.relative(absDir, mdPath).split(path.sep).join("/"),
        purpose: extractSection(markdown, "Purpose"),
        useWhen: extractSection(markdown, "Trigger"),
        doNotUseWhen: asStringArray(meta.do_not_use_when),
        requires: asStringArray(meta.requires),
        conflicts: asStringArray(meta.conflicts),
        distinguishFrom: asStringArray(meta.distinguish_from),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function formatIdArray(values) {
  return values.length === 0 ? "`[]`" : `\`${`[${values.join(", ")}]`}\``;
}

function formatTextArray(values) {
  return values.length === 0 ? "`[]`" : values.join("<br>");
}

function renderTable(entries) {
  const lines = [
    "| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
  ];
  for (const entry of entries) {
    lines.push(
      `| \`${entry.id}\` | \`${entry.file}\` | ${entry.purpose} | ${entry.useWhen} | ${formatTextArray(entry.doNotUseWhen)} | ${formatIdArray(entry.requires)} | ${formatIdArray(entry.conflicts)} | ${formatTextArray(entry.distinguishFrom)} |`,
    );
  }
  return lines.join("\n");
}

function renderRootCatalog(absDir) {
  const lines = [
    "# CCP Capability Inventory",
    "",
    "This catalog is the global portfolio inventory for all cognitive capabilities under `cap/**`.",
    "It complements the domain-local indexes, which stay focused on composition-oriented selection views such as purpose, use conditions, negative applicability boundaries, `requires`, `conflicts`, and neighbor distinctions.",
    "",
    "## Status Meanings",
    "",
    "- `draft`: in progress and not yet approved as a stable capability.",
    "- `active`: approved and intended for curation.",
    "- `deprecated`: still present, but no longer recommended for new curation.",
    "- `retired`: out of service and only retained for history or migration context.",
    "",
  ];

  const childDirs = fs.readdirSync(absDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !SKIP_DIRS.has(entry.name))
    .map((entry) => path.join(absDir, entry.name))
    .filter((full) => hasCapabilitiesDeep(full))
    .sort((a, b) => path.basename(a).localeCompare(path.basename(b)));

  for (const child of childDirs) {
    const childParts = relFromCap(child);
    const localName = titleCase(childParts[childParts.length - 1] ?? "");
    lines.push(`## ${localName}`, "");
    const childDirect = getDirectCapabilities(child);
    if (childDirect.length > 0) {
      lines.push(renderTable(childDirect), "");
    }
    const grandChildren = fs.readdirSync(child, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !SKIP_DIRS.has(entry.name))
      .map((entry) => path.join(child, entry.name))
      .filter((full) => hasCapabilitiesDeep(full))
      .sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
    if (childDirect.length === 0 && grandChildren.length === 0) {
      lines.push("_No capabilities yet._", "");
    }
    if (grandChildren.length > 0) {
      const nested = renderNestedSections(grandChildren, 2);
      if (nested.length > 0) {
        lines.push(nested.trimEnd(), "");
      }
    }
  }

  return `${lines.join("\n").trim()}\n`;
}

function renderDirectory(absDir, depth = 0) {
  const parts = relFromCap(absDir);
  if (parts.length === 0) {
    return renderRootCatalog(absDir);
  }
  const titlePrefix = parts.map(titleCase).join(" ");
  const title = titlePrefix.length === 0 ? "Capability Catalog" : `${titlePrefix} Capability Catalog`;
  const lines = [`# ${title}`, "", `This index exposes the local capability selection surface for \`${parts.join("/") || "."}\`.`, ""];
  const direct = getDirectCapabilities(absDir);
  const childDirs = fs.readdirSync(absDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !SKIP_DIRS.has(entry.name))
    .map((entry) => path.join(absDir, entry.name))
    .filter((full) => hasCapabilitiesDeep(full))
    .sort((a, b) => path.basename(a).localeCompare(path.basename(b)));

  if (direct.length > 0) {
    lines.push(renderTable(direct), "");
  }

  for (const child of childDirs) {
    const childParts = relFromCap(child);
    const localName = titleCase(childParts[childParts.length - 1] ?? "");
    lines.push(`${"#".repeat(depth + 2)} ${localName}`, "");
    const childDirect = getDirectCapabilities(child);
    if (childDirect.length > 0) {
      lines.push(renderTable(childDirect), "");
    }
    const grandChildren = fs.readdirSync(child, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !SKIP_DIRS.has(entry.name))
      .map((entry) => path.join(child, entry.name))
      .filter((full) => hasCapabilitiesDeep(full))
      .sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
    if (childDirect.length === 0 && grandChildren.length === 0) {
      lines.push("_No capabilities yet._", "");
    }
    if (grandChildren.length > 0) {
      const nested = renderNestedSections(grandChildren, depth + 1);
      if (nested.length > 0) {
        lines.push(nested.trimEnd(), "");
      }
    }
  }

  return `${lines.join("\n").trim()}\n`;
}

function renderNestedSections(directories, depth) {
  const lines = [];
  for (const dir of directories) {
    const parts = relFromCap(dir);
    const localName = titleCase(parts[parts.length - 1] ?? "");
    lines.push(`${"#".repeat(depth + 2)} ${localName}`, "");
    const direct = getDirectCapabilities(dir);
    if (direct.length > 0) {
      lines.push(renderTable(direct), "");
    }
    const children = fs.readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !SKIP_DIRS.has(entry.name))
      .map((entry) => path.join(dir, entry.name))
      .filter((full) => hasCapabilitiesDeep(full))
      .sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
    if (direct.length === 0 && children.length === 0) {
      lines.push("_No capabilities yet._", "");
    }
    if (children.length > 0) {
      lines.push(renderNestedSections(children, depth + 1));
    }
  }
  return lines.join("\n");
}

const directories = [
  capRoot,
  ...fs.readdirSync(capRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !SKIP_DIRS.has(entry.name))
  .map((entry) => path.join(capRoot, entry.name))
  .filter((full) => hasCapabilitiesDeep(full)),
];

for (const dir of directories) {
  const target = path.join(dir, "index.md");
  const rendered = renderDirectory(dir);
  if (writeMode) {
    fs.writeFileSync(target, rendered, "utf8");
    continue;
  }
  const existing = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
  if (existing !== rendered) {
    error(`${path.relative(root, target)}: stale generated capability index (run capability-indexes.mjs --write)`);
  }
}

if (fail > 0) {
  process.exit(1);
}
process.stdout.write("[ccp|INFO]: capability-indexes gate passed\n");
