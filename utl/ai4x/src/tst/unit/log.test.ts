import assert from "node:assert/strict";
import test from "node:test";

import { APP_NAME, logLine } from "../../lib/shared/log.ts";

test("logLine uses stable ai4x log format", () => {
  assert.equal(APP_NAME, "ai4x");
  assert.equal(logLine("INFO", "ready"), "[ai4x|INFO]: ready");
  assert.equal(logLine("ERROR", "failed"), "[ai4x|ERROR]: failed");
});
