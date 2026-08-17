#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const canonicalDigests = new Map([
  ["LICENSES/Apache-2.0.txt", "074e6e32c86a4c0ef8b3ed25b721ca23aca83df277cd88106ef7177c354615ff"],
  ["LICENSES/CC-BY-4.0.txt", "d557539df68e771cc1eedcc91d13f70fca930e508d11eedcafa4b15db49e3744"],
]);
const copyrightLine = "© 2026 [nemron](https://github.com/normenmueller)";
const currentLogo = "acc/img/ai4X Logo.jpg";
const obsoleteImages = new Set([
  "acc/img/ai4X Client Structure.jpg",
  "acc/img/ai4X Initial Structure.jpeg",
]);
const imageExtensions = new Set([
  ".avif", ".bmp", ".gif", ".ico", ".jpeg", ".jpg", ".png", ".svg", ".tif", ".tiff", ".webp",
]);
const packageDirectories = ["cli", "cli/src/lib/doctor/_scaffold"];

function digest(payload) {
  return createHash("sha256").update(payload).digest("hex");
}

function repositoryPaths(root) {
  const result = spawnSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: root, encoding: "buffer" },
  );
  if (result.status !== 0) {
    throw new Error(`git ls-files failed: ${result.stderr?.toString("utf8").trim() || "unknown error"}`);
  }
  return result.stdout
    .toString("utf8")
    .split("\0")
    .filter((relative) => relative && existsSync(path.join(root, relative)));
}

function readJson(root, relative, violations) {
  try {
    return JSON.parse(readFileSync(path.join(root, relative), "utf8"));
  } catch (error) {
    violations.push(`${relative}: cannot read valid JSON (${error.message})`);
    return undefined;
  }
}

function cabalField(text, field) {
  const match = text.match(new RegExp(`^${field}\\s*:\\s*(.+)$`, "im"));
  return match?.[1].trim();
}

function sameBytes(root, relative, canonical) {
  try {
    return readFileSync(path.join(root, relative)).equals(readFileSync(path.join(root, canonical)));
  } catch {
    return false;
  }
}

export function validateRepositoryPolicy(root, { trackedPaths } = {}) {
  const repositoryRoot = path.resolve(root);
  const paths = new Set(trackedPaths ?? repositoryPaths(repositoryRoot));
  const violations = [];
  const expectedPackageLicenseCopies = new Map(
    packageDirectories.map((directory) => [`${directory}/LICENSE`, "LICENSES/Apache-2.0.txt"]),
  );
  const requiredPackageLicenseCopies = new Set();

  for (const [relative, expected] of canonicalDigests) {
    try {
      const actual = digest(readFileSync(path.join(repositoryRoot, relative)));
      if (actual !== expected) violations.push(`${relative}: canonical license text digest drifted`);
    } catch (error) {
      violations.push(`${relative}: canonical license text is missing or unreadable (${error.message})`);
    }
  }
  for (const relative of paths) {
    if (relative.startsWith("LICENSES/") && !canonicalDigests.has(relative)) {
      violations.push(`${relative}: extra canonical license text is outside the approved closed set`);
    }
  }

  if (paths.has("LICENSE") || existsSync(path.join(repositoryRoot, "LICENSE"))) {
    violations.push("root LICENSE: repository-wide default license is not allowed");
  }

  for (const relative of ["README.md", "LICENSING.md"]) {
    try {
      const text = readFileSync(path.join(repositoryRoot, relative), "utf8");
      if (!text.endsWith(`${copyrightLine}\n`)) {
        violations.push(`${relative}: must end with the exact approved copyright line`);
      }
      if (relative === "README.md" && !/\]\(LICENSING\.md\)/.test(text)) {
        violations.push("README.md: must link to LICENSING.md");
      }
    } catch (error) {
      violations.push(`${relative}: is missing or unreadable (${error.message})`);
    }
  }

  if (!paths.has(currentLogo) || !existsSync(path.join(repositoryRoot, currentLogo))) {
    violations.push(`${currentLogo}: approved current logo is missing`);
  }
  for (const relative of obsoleteImages) {
    if (paths.has(relative) || existsSync(path.join(repositoryRoot, relative))) {
      violations.push(`${relative}: obsolete or unverified architecture image was reintroduced`);
    }
  }
  for (const relative of paths) {
    if (imageExtensions.has(path.posix.extname(relative).toLowerCase()) && relative !== currentLogo) {
      violations.push(`${relative}: image provenance, currentness and license are not approved`);
    }
  }

  for (const directory of packageDirectories) {
    const packagePath = `${directory}/package.json`;
    const packageLockPath = `${directory}/package-lock.json`;
    const manifest = readJson(repositoryRoot, packagePath, violations);
    if (manifest && manifest.license !== "Apache-2.0") {
      violations.push(`${packagePath}: license must be Apache-2.0`);
    }
    const lock = readJson(repositoryRoot, packageLockPath, violations);
    if (lock && lock.packages?.[""]?.license !== "Apache-2.0") {
      violations.push(`${packageLockPath}: root package license must be Apache-2.0`);
    }
  }

  for (const relative of [...paths].filter((item) => item.endsWith(".cabal")).sort()) {
    let text;
    try {
      text = readFileSync(path.join(repositoryRoot, relative), "utf8");
    } catch (error) {
      violations.push(`${relative}: cannot read Cabal metadata (${error.message})`);
      continue;
    }
    const mixedCorpus = relative === "src/corpus/ai4x-corpus.cabal";
    const expectedLicense = mixedCorpus ? "Apache-2.0 AND CC-BY-4.0" : "Apache-2.0";
    const expectedFiles = mixedCorpus
      ? ["LICENSE.Apache-2.0", "LICENSE.CC-BY-4.0"]
      : ["LICENSE"];
    if (cabalField(text, "license") !== expectedLicense) {
      violations.push(`${relative}: license must be ${expectedLicense}`);
    }
    const actualFiles = (cabalField(text, "license-files") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (actualFiles.join("\0") !== expectedFiles.join("\0")) {
      violations.push(`${relative}: license-files must be ${expectedFiles.join(", ")}`);
    }
    const directory = path.posix.dirname(relative);
    for (const name of expectedFiles) {
      const canonical = name.includes("CC-BY") ? "LICENSES/CC-BY-4.0.txt" : "LICENSES/Apache-2.0.txt";
      const copy = path.posix.join(directory, name);
      expectedPackageLicenseCopies.set(copy, canonical);
      requiredPackageLicenseCopies.add(copy);
    }
  }

  for (const relative of requiredPackageLicenseCopies) {
    if (!paths.has(relative)) {
      violations.push(`${relative}: required package license copy is not tracked`);
    }
  }
  for (const relative of paths) {
    const basename = path.posix.basename(relative);
    if (relative === "LICENSE" || canonicalDigests.has(relative) || !/^LICENSE(?:\.|$)/i.test(basename)) {
      continue;
    }
    const canonical = expectedPackageLicenseCopies.get(relative);
    if (!canonical) {
      violations.push(`${relative}: undeclared package license copy is outside recognized package metadata`);
    } else if (!sameBytes(repositoryRoot, relative, canonical)) {
      violations.push(`${relative}: package license copy must be byte-identical to ${canonical}`);
    }
  }

  return [...new Set(violations)].sort();
}

function main() {
  let violations;
  try {
    violations = validateRepositoryPolicy(process.cwd());
  } catch (error) {
    console.error(`[ai4x|error] licensing policy check failed: ${error.message}`);
    return 1;
  }
  if (violations.length) {
    for (const violation of violations) console.error(`[ai4x|error] ${violation}`);
    return 1;
  }
  console.log("[ai4x|info] licensing texts, attribution and package metadata are canonical");
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
