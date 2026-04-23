import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  logLine,
  VERSION,
  APP_NAME,
  COPYRIGHT_YEAR,
  AUTHOR,
} from "../../../src/lib/shared/log.ts";

describe("logLine formatting", () => {
  it("formats info-level messages with app name prefix", () => {
    assert.equal(logLine("info", "hello"), "[ai4X|info] hello");
  });

  it("formats warn-level messages with app name prefix", () => {
    assert.equal(logLine("warn", "caution"), "[ai4X|warn] caution");
  });

  it("formats error-level messages with app name prefix", () => {
    assert.equal(logLine("error", "fail"), "[ai4X|error] fail");
  });

  it("accepts an empty message without validation", () => {
    assert.equal(logLine("info", ""), "[ai4X|info] ");
  });
});

describe("shared constants", () => {
  it("VERSION matches package.json version", () => {
    assert.equal(VERSION, "0.1.0");
  });

  it("APP_NAME is ai4X", () => {
    assert.equal(APP_NAME, "ai4X");
  });

  it("COPYRIGHT_YEAR is a non-empty string", () => {
    assert.equal(typeof COPYRIGHT_YEAR, "string");
    assert.ok(COPYRIGHT_YEAR.length > 0, "COPYRIGHT_YEAR must not be empty");
  });

  it("AUTHOR is nemron", () => {
    assert.equal(AUTHOR, "nemron");
  });
});
