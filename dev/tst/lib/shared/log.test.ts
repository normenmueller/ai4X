import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  logLine,
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
