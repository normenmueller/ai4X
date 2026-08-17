import assert from "node:assert/strict";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { validateRepositoryPolicy } from "./licensing-policy.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const exactCopyright = "© 2026 [nemron](https://github.com/normenmueller)\n";

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "ai4x-licensing-"));
  const paths = [
    "LICENSES/Apache-2.0.txt",
    "LICENSES/CC-BY-4.0.txt",
    "README.md",
    "LICENSING.md",
    "acc/img/ai4X Logo.jpg",
    "cli/package.json",
    "cli/package-lock.json",
    "cli/src/lib/doctor/_scaffold/package.json",
    "cli/src/lib/doctor/_scaffold/package-lock.json",
  ];
  for (const relative of paths) mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
  cpSync(path.join(repositoryRoot, "LICENSES/Apache-2.0.txt"), path.join(root, "LICENSES/Apache-2.0.txt"));
  cpSync(path.join(repositoryRoot, "LICENSES/CC-BY-4.0.txt"), path.join(root, "LICENSES/CC-BY-4.0.txt"));
  writeFileSync(path.join(root, "README.md"), `# ai4X\n\n[Licensing](LICENSING.md)\n\n${exactCopyright}`);
  writeFileSync(path.join(root, "LICENSING.md"), `# Licensing\n\n${exactCopyright}`);
  writeFileSync(path.join(root, "acc/img/ai4X Logo.jpg"), "logo");
  for (const packagePath of ["cli", "cli/src/lib/doctor/_scaffold"]) {
    writeFileSync(path.join(root, packagePath, "package.json"), JSON.stringify({ name: "fixture", license: "Apache-2.0" }));
    writeFileSync(path.join(root, packagePath, "package-lock.json"), JSON.stringify({ packages: { "": { name: "fixture", license: "Apache-2.0" } } }));
  }
  return { root, paths };
}

function mutate(testCase, change, expected) {
  test(testCase, () => {
    const { root, paths } = fixture();
    try {
      change(root, paths);
      assert.ok(validateRepositoryPolicy(root, { trackedPaths: paths }).some((item) => item.includes(expected)));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
}

test("accepts the exact licensing policy projection", () => {
  const { root, paths } = fixture();
  try {
    assert.deepEqual(validateRepositoryPolicy(root, { trackedPaths: paths }), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

mutate("rejects canonical license-text drift", (root) => {
  writeFileSync(path.join(root, "LICENSES/Apache-2.0.txt"), "changed\n");
}, "LICENSES/Apache-2.0.txt");

mutate("rejects README attribution or licensing-link drift", (root) => {
  writeFileSync(path.join(root, "README.md"), "# ai4X\n");
}, "README.md");

mutate("rejects LICENSING attribution drift", (root) => {
  writeFileSync(path.join(root, "LICENSING.md"), "# Licensing\n");
}, "LICENSING.md");

mutate("rejects a reintroduced root LICENSE", (root, paths) => {
  writeFileSync(path.join(root, "LICENSE"), "implicit default\n");
  paths.push("LICENSE");
}, "root LICENSE");

mutate("rejects a missing current logo", (root) => {
  rmSync(path.join(root, "acc/img/ai4X Logo.jpg"));
}, "ai4X Logo.jpg");

for (const image of ["ai4X Client Structure.jpg", "ai4X Initial Structure.jpeg"]) {
  mutate(`rejects reintroduced obsolete image ${image}`, (root, paths) => {
    const relative = `acc/img/${image}`;
    writeFileSync(path.join(root, relative), "obsolete\n");
    paths.push(relative);
  }, image);
}

for (const relative of ["doc/unknown.png", "src/ui/unapproved.svg"]) {
  mutate(`rejects unapproved image outside acc/img: ${relative}`, (root, paths) => {
    mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    writeFileSync(path.join(root, relative), "unapproved image\n");
    paths.push(relative);
  }, "image provenance");
}

mutate("rejects npm package-license drift", (root) => {
  const file = path.join(root, "cli/package.json");
  const value = JSON.parse(readFileSync(file, "utf8"));
  value.license = "MIT";
  writeFileSync(file, JSON.stringify(value));
}, "cli/package.json");

mutate("rejects npm lockfile-license drift", (root) => {
  const file = path.join(root, "cli/package-lock.json");
  const value = JSON.parse(readFileSync(file, "utf8"));
  delete value.packages[""].license;
  writeFileSync(file, JSON.stringify(value));
}, "cli/package-lock.json");

mutate("rejects an undeclared nested LICENSE", (root, paths) => {
  const relative = "doc/package/LICENSE";
  mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
  cpSync(path.join(root, "LICENSES/Apache-2.0.txt"), path.join(root, relative));
  paths.push(relative);
}, "undeclared package license copy");

for (const source of ["Apache-2.0.txt", "CC-BY-4.0.txt"]) {
  mutate(`rejects a wrong or modified npm package LICENSE copied from ${source}`, (root, paths) => {
    const relative = "cli/LICENSE";
    cpSync(path.join(root, "LICENSES", source), path.join(root, relative));
    if (source === "Apache-2.0.txt") writeFileSync(path.join(root, relative), "modified Apache text\n");
    paths.push(relative);
  }, "byte-identical");
}

mutate("rejects an extra named license copy in an npm package", (root, paths) => {
  const relative = "cli/LICENSE.CC-BY-4.0";
  cpSync(path.join(root, "LICENSES/CC-BY-4.0.txt"), path.join(root, relative));
  paths.push(relative);
}, "undeclared package license copy");

test("accepts an optional canonical Apache LICENSE in a recognized npm package", () => {
  const { root, paths } = fixture();
  try {
    const relative = "cli/LICENSE";
    cpSync(path.join(root, "LICENSES/Apache-2.0.txt"), path.join(root, relative));
    paths.push(relative);
    assert.deepEqual(validateRepositoryPolicy(root, { trackedPaths: paths }), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("accepts pure Apache and mixed corpus Cabal metadata", () => {
  const { root, paths } = fixture();
  try {
    for (const [relative, license, names] of [
      ["src/core/ai4x-core.cabal", "Apache-2.0", ["LICENSE"]],
      ["src/corpus/ai4x-corpus.cabal", "Apache-2.0 AND CC-BY-4.0", ["LICENSE.Apache-2.0", "LICENSE.CC-BY-4.0"]],
    ]) {
      mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
      writeFileSync(path.join(root, relative), `cabal-version: 3.0\nlicense: ${license}\nlicense-files: ${names.join(", ")}\n`);
      paths.push(relative);
      for (const name of names) {
        const source = name.includes("CC-BY") ? "CC-BY-4.0.txt" : "Apache-2.0.txt";
        const target = path.join(path.dirname(path.join(root, relative)), name);
        cpSync(path.join(root, "LICENSES", source), target);
        paths.push(path.relative(root, target));
      }
    }
    assert.deepEqual(validateRepositoryPolicy(root, { trackedPaths: paths }), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
