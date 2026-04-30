#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHECKER="${SCRIPT_DIR}/../capability-shape.sh"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

write_meta() {
  local file="$1"
  cat >"${file}" <<'YAML'
id: sample-capability
version: 0.1.0
status: active
approved_by: ["qa"]
approved_at: 2026-03-21T00:00:00+01:00
scope: cognitive
requires: []
conflicts: []
sources: []
YAML
}

run_ok() {
  local fixture="${TMP_DIR}/ok"
  mkdir -p "${fixture}/cap/foundation"
  cat >"${fixture}/cap/foundation/sample-capability.md" <<'MD'
# Sample Capability (MUST)

## Purpose

Provide a bounded cognitive contract.

## Trigger

Use when a stable activation condition applies.

## Rules (MUST)

- Keep the result explicit.

## Fallback

- If context is missing, keep the result provisional.

## Minimal Output Contract

- expected contribution
MD
  write_meta "${fixture}/cap/foundation/sample-capability.meta.yaml"
  bash "${CHECKER}" "${fixture}/cap" >/dev/null
}

run_fail_missing_trigger() {
  local fixture="${TMP_DIR}/missing-trigger"
  mkdir -p "${fixture}/cap/foundation"
  cat >"${fixture}/cap/foundation/sample-capability.md" <<'MD'
# Sample Capability (MUST)

## Purpose

Provide a bounded cognitive contract.

## Rules (MUST)

- Keep the result explicit.

## Fallback

- If context is missing, keep the result provisional.

## Minimal Output Contract

- expected contribution
MD
  write_meta "${fixture}/cap/foundation/sample-capability.meta.yaml"
  if bash "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for missing trigger heading" >&2
    return 1
  fi
}

run_fail_german_marker() {
  local fixture="${TMP_DIR}/german-marker"
  mkdir -p "${fixture}/cap/foundation"
  cat >"${fixture}/cap/foundation/sample-capability.md" <<'MD'
# Sample Capability (MUST)

## Purpose

Provide a bounded cognitive contract.

## Trigger

Use when a stable activation condition applies.

## Rules (MUST)

- Keep the result explicit.

## Fallback

- If context is missing, keep the result provisional.

## Minimal Output Contract

- expected contribution
- avoid vorläufig handling
MD
  write_meta "${fixture}/cap/foundation/sample-capability.meta.yaml"
  if bash "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for german marker" >&2
    return 1
  fi
}

run_fail_extra_heading() {
  local fixture="${TMP_DIR}/extra-heading"
  mkdir -p "${fixture}/cap/foundation"
  cat >"${fixture}/cap/foundation/sample-capability.md" <<'MD'
# Sample Capability (MUST)

## Purpose

Provide a bounded cognitive contract.

## Trigger

Use when a stable activation condition applies.

## Rules (MUST)

- Keep the result explicit.

## Fallback

- If context is missing, keep the result provisional.

## Integration Contract

- wrong extra section

## Minimal Output Contract

- expected contribution
MD
  write_meta "${fixture}/cap/foundation/sample-capability.meta.yaml"
  if bash "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for extra non-canonical heading" >&2
    return 1
  fi
}

run_fail_empty_trigger_body() {
  local fixture="${TMP_DIR}/empty-trigger-body"
  mkdir -p "${fixture}/cap/foundation"
  cat >"${fixture}/cap/foundation/sample-capability.md" <<'MD'
# Sample Capability (MUST)

## Purpose

Provide a bounded cognitive contract.

## Trigger

## Rules (MUST)

- Keep the result explicit.

## Fallback

- If context is missing, keep the result provisional.

## Minimal Output Contract

- expected contribution
MD
  write_meta "${fixture}/cap/foundation/sample-capability.meta.yaml"
  if bash "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for empty trigger content" >&2
    return 1
  fi
}

run_fail_empty_fallback_bullets() {
  local fixture="${TMP_DIR}/empty-fallback-bullets"
  mkdir -p "${fixture}/cap/foundation"
  cat >"${fixture}/cap/foundation/sample-capability.md" <<'MD'
# Sample Capability (MUST)

## Purpose

Provide a bounded cognitive contract.

## Trigger

Use when a stable activation condition applies.

## Rules (MUST)

- Keep the result explicit.

## Fallback

Fallback exists but contains no actionable bullet.

## Minimal Output Contract

- expected contribution
MD
  write_meta "${fixture}/cap/foundation/sample-capability.meta.yaml"
  if bash "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for fallback without actionable bullet" >&2
    return 1
  fi
}

run_fail_placeholder_output() {
  local fixture="${TMP_DIR}/placeholder-output"
  mkdir -p "${fixture}/cap/foundation"
  cat >"${fixture}/cap/foundation/sample-capability.md" <<'MD'
# Sample Capability (MUST)

## Purpose

Provide a bounded cognitive contract.

## Trigger

Use when a stable activation condition applies.

## Rules (MUST)

- Keep the result explicit.

## Fallback

- If context is missing, keep the result provisional.

## Minimal Output Contract

- TBD
MD
  write_meta "${fixture}/cap/foundation/sample-capability.meta.yaml"
  if bash "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for placeholder minimal output contract" >&2
    return 1
  fi
}

run_ok
run_fail_missing_trigger
run_fail_german_marker
run_fail_extra_heading
run_fail_empty_trigger_body
run_fail_empty_fallback_bullets
run_fail_placeholder_output

echo "capability-shape.sh: OK"
