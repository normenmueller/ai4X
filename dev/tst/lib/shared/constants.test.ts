import { describe, it } from "node:test";
import assert from "node:assert/strict";

import pkg from "../../../package.json" with { type: "json" };
import {
  VERSION,
  APP_NAME,
  COPYRIGHT_YEAR,
  AUTHOR,
} from "../../../src/lib/shared/constants.ts";

describe("shared constants", () => {
  it("VERSION matches package.json version", () => {
    assert.equal(VERSION, pkg.version);
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
