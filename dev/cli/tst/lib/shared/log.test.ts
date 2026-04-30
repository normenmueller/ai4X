import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  logLine,
} from "../../../src/lib/shared/log.ts";

describe("logLine formatting", () => {
  it("formats info-level messages with app name prefix", () => {
    assert.equal(logLine("info", "hello"), "[ai4x|info] hello");
  });

  it("formats warn-level messages with app name prefix", () => {
    assert.equal(logLine("warn", "caution"), "[ai4x|warn] caution");
  });

  it("formats error-level messages with app name prefix", () => {
    assert.equal(logLine("error", "fail"), "[ai4x|error] fail");
  });

  it("accepts an empty message without validation", () => {
    assert.equal(logLine("info", ""), "[ai4x|info] ");
  });
});
