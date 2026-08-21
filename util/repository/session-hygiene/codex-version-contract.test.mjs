import assert from "node:assert/strict";
import test from "node:test";

import { ACCEPTED_CODEX_VERSIONS, acceptsCodexVersion } from "./codex-version-contract.mjs";

test("owns the exact closed Codex version set", () => {
  assert.deepEqual(ACCEPTED_CODEX_VERSIONS, ["0.147.0", "0.148.0"]);
  assert.equal(Object.isFrozen(ACCEPTED_CODEX_VERSIONS), true);

  for (const version of ACCEPTED_CODEX_VERSIONS) assert.equal(acceptsCodexVersion(version), true);
  for (const version of ["0.146.0", "0.147.1", "0.148.1", "0.149.0", "0.148", "v0.148.0", null]) {
    assert.equal(acceptsCodexVersion(version), false);
  }
});
