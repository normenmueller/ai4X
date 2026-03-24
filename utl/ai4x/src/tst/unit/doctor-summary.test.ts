import assert from "node:assert/strict";
import test from "node:test";

import type { DoctorCheck } from "../../lib/operations/doctor.ts";
import { summarizeDoctorChecks } from "../../lib/operations/doctor.ts";

test("summarizeDoctorChecks marks overall fail when required checks fail", () => {
  const checks: DoctorCheck[] = [
    { id: "a", level: "required", status: "ok", message: "ok" },
    { id: "b", level: "required", status: "fail", message: "fail" },
    { id: "c", level: "advisory", status: "fail", message: "warn" },
  ];

  const summary = summarizeDoctorChecks(checks);
  assert.equal(summary.required.ok, 1);
  assert.equal(summary.required.fail, 1);
  assert.equal(summary.advisory.ok, 0);
  assert.equal(summary.advisory.fail, 1);
  assert.equal(summary.overall, "fail");
});

test("summarizeDoctorChecks keeps overall ok when required checks pass", () => {
  const checks: DoctorCheck[] = [
    { id: "a", level: "required", status: "ok", message: "ok" },
    { id: "b", level: "advisory", status: "fail", message: "warn" },
  ];

  const summary = summarizeDoctorChecks(checks);
  assert.equal(summary.required.ok, 1);
  assert.equal(summary.required.fail, 0);
  assert.equal(summary.advisory.ok, 0);
  assert.equal(summary.advisory.fail, 1);
  assert.equal(summary.overall, "ok");
});
