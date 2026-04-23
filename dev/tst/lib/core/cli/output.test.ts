import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { versionText, usageText } from "../../../../src/lib/core/cli/output.ts";
import { VERSION, COPYRIGHT_YEAR, AUTHOR } from "../../../../src/lib/shared/constants.ts";

describe("versionText", () => {
  it("returns string matching expected format", () => {
    assert.equal(versionText(), `ai4X, v${VERSION}, © ${COPYRIGHT_YEAR} ${AUTHOR}`);
  });

  it("contains VERSION from constants", () => {
    assert.ok(versionText().includes(VERSION), "must contain VERSION");
  });

  it("contains brand name 'ai4X' (exact casing)", () => {
    assert.ok(versionText().includes("ai4X"), "must contain 'ai4X'");
  });
});

describe("usageText", () => {
  it("starts with 'Usage: ai4x' (binary name lowercase)", () => {
    assert.ok(usageText().startsWith("Usage: ai4x"), "must start with 'Usage: ai4x'");
  });

  it("contains all 3 commands: doctor, curate, spawn", () => {
    const text = usageText();
    assert.ok(text.includes("doctor"), "must mention doctor");
    assert.ok(text.includes("curate"), "must mention curate");
    assert.ok(text.includes("spawn"), "must mention spawn");
  });

  it("contains --help and --version options", () => {
    const text = usageText();
    assert.ok(text.includes("--help"), "must mention --help");
    assert.ok(text.includes("--version"), "must mention --version");
  });

  it("contains -h alias", () => {
    assert.ok(usageText().includes("-h"), "must mention -h alias");
  });

  it("is multi-line", () => {
    assert.ok(usageText().includes("\n"), "must contain newlines");
  });
});
