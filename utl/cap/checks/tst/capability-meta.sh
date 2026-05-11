#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHECKER="${SCRIPT_DIR}/../capability-meta.sh"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

make_ok_fixture() {
  local fixture="$1"
  mkdir -p "${fixture}/cap/foundation" "${fixture}/cap/strategy/workflow"
  cat >"${fixture}/cap/foundation/deterministic-reasoning.md" <<'MD'
# Deterministic Reasoning
MD
  cat >"${fixture}/cap/foundation/deterministic-reasoning.meta.yaml" <<'YAML'
id: deterministic-reasoning
version: 0.1.0
owner: qa
requires: []
conflicts: []
do_not_use_when: []
distinguish_from: []
sources: []
YAML
  cat >"${fixture}/cap/foundation/clarification-before-guessing.md" <<'MD'
# Clarification Before Guessing
MD
  cat >"${fixture}/cap/foundation/clarification-before-guessing.meta.yaml" <<'YAML'
id: clarification-before-guessing
version: 0.1.0
owner: qa
requires: ["deterministic-reasoning"]
conflicts: []
do_not_use_when: []
distinguish_from: []
sources: []
YAML
  cat >"${fixture}/cap/strategy/workflow/interaction-contract.md" <<'MD'
# Interaction Contract
MD
  cat >"${fixture}/cap/strategy/workflow/interaction-contract.meta.yaml" <<'YAML'
id: interaction-contract
version: 0.1.0
owner: qa
requires: ["clarification-before-guessing"]
conflicts: []
do_not_use_when: []
distinguish_from: []
sources: []
YAML
}

run_ok() {
  local fixture="${TMP_DIR}/ok"
  make_ok_fixture "${fixture}"
  "${CHECKER}" "${fixture}/cap" >/dev/null
}

run_ok_explicit_empty_sources() {
  local fixture="${TMP_DIR}/ok-empty-sources"
  make_ok_fixture "${fixture}"
  mkdir -p "${fixture}/cap/ai/engineering"
  cat >"${fixture}/cap/ai/engineering/context-engineering-discipline.md" <<'MD'
# Context Engineering Discipline
MD
  cat >"${fixture}/cap/ai/engineering/context-engineering-discipline.meta.yaml" <<'YAML'
id: context-engineering-discipline
version: 0.1.0
owner: qa
requires: ["clarification-before-guessing"]
conflicts: []
do_not_use_when: []
distinguish_from: []
sources: []
YAML
  "${CHECKER}" "${fixture}/cap" >/dev/null
}

run_fail_missing_meta() {
  local fixture="${TMP_DIR}/missing-meta"
  make_ok_fixture "${fixture}"
  rm -f "${fixture}/cap/strategy/workflow/interaction-contract.meta.yaml"
  if "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for missing metadata file" >&2
    return 1
  fi
}

run_fail_unknown_requires() {
  local fixture="${TMP_DIR}/unknown-requires"
  make_ok_fixture "${fixture}"
  cat >"${fixture}/cap/strategy/workflow/interaction-contract.meta.yaml" <<'YAML'
id: interaction-contract
version: 0.1.0
owner: qa
requires: ["missing"]
conflicts: []
do_not_use_when: []
distinguish_from: []
sources: []
YAML
  if "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for unknown requires id" >&2
    return 1
  fi
}

run_fail_requires_conflicts_overlap() {
  local fixture="${TMP_DIR}/overlap"
  make_ok_fixture "${fixture}"
  cat >"${fixture}/cap/strategy/workflow/interaction-contract.meta.yaml" <<'YAML'
id: interaction-contract
version: 0.1.0
owner: qa
requires: ["clarification-before-guessing"]
conflicts: ["clarification-before-guessing"]
do_not_use_when: []
distinguish_from: []
sources: []
YAML
  if "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for requires/conflicts overlap" >&2
    return 1
  fi
}

run_fail_asymmetric_conflict() {
  local fixture="${TMP_DIR}/asymmetric"
  make_ok_fixture "${fixture}"
  cat >"${fixture}/cap/foundation/critical-peer-discipline.md" <<'MD'
# Critical Peer Discipline
MD
  cat >"${fixture}/cap/foundation/critical-peer-discipline.meta.yaml" <<'YAML'
id: critical-peer-discipline
version: 0.1.0
owner: qa
requires: ["deterministic-reasoning"]
conflicts: ["interaction-contract"]
do_not_use_when: []
distinguish_from: []
sources: []
YAML
  if "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for asymmetric conflict" >&2
    return 1
  fi
}

run_fail_missing_owner() {
  local fixture="${TMP_DIR}/missing-owner"
  make_ok_fixture "${fixture}"
  cat >"${fixture}/cap/strategy/workflow/interaction-contract.meta.yaml" <<'YAML'
id: interaction-contract
version: 0.1.0
requires: ["clarification-before-guessing"]
conflicts: []
do_not_use_when: []
distinguish_from: []
sources: []
YAML
  if "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for missing required owner field" >&2
    return 1
  fi
}

run_fail_unknown_key() {
  local fixture="${TMP_DIR}/unknown-key"
  make_ok_fixture "${fixture}"
  cat >"${fixture}/cap/strategy/workflow/interaction-contract.meta.yaml" <<'YAML'
id: interaction-contract
version: 0.1.0
owner: qa
status: active
requires: ["clarification-before-guessing"]
conflicts: []
do_not_use_when: []
distinguish_from: []
sources: []
YAML
  if "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for unknown key 'status'" >&2
    return 1
  fi
}

run_fail_invalid_source_kind() {
  local fixture="${TMP_DIR}/invalid-source-kind"
  make_ok_fixture "${fixture}"
  mkdir -p "${fixture}/cap/ai/architecture/solution"
  cat >"${fixture}/cap/ai/architecture/solution/agentic-solution-architecture.md" <<'MD'
# Agentic Solution Architecture
MD
  cat >"${fixture}/cap/ai/architecture/solution/agentic-solution-architecture.meta.yaml" <<'YAML'
id: agentic-solution-architecture
version: 0.1.0
owner: qa
requires: ["deterministic-reasoning"]
conflicts: []
do_not_use_when: []
distinguish_from: []
sources:
  - title: "Test source"
    organization: "QA"
    url: "https://example.com/source"
    kind: "wrong"
    accessed_at: "2026-03-20"
YAML
  if "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for invalid source kind" >&2
    return 1
  fi
}

run_fail_invalid_distinguish_from() {
  local fixture="${TMP_DIR}/invalid-df"
  make_ok_fixture "${fixture}"
  cat >"${fixture}/cap/strategy/workflow/interaction-contract.meta.yaml" <<'YAML'
id: interaction-contract
version: 0.1.0
owner: qa
requires: ["clarification-before-guessing"]
conflicts: []
do_not_use_when: []
distinguish_from: ["some-plain-string"]
sources: []
YAML
  if "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for string-format distinguish_from entry" >&2
    return 1
  fi
}

run_fail_schema_missing() {
  local fixture="${TMP_DIR}/schema-missing"
  make_ok_fixture "${fixture}"
  if AI4X_SCHEMA_PATH="/nonexistent/schema.yaml" "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for missing schema file" >&2
    return 1
  fi
  # Verify error message names the file
  local stderr_output
  stderr_output="$(AI4X_SCHEMA_PATH="/nonexistent/schema.yaml" "${CHECKER}" "${fixture}/cap" 2>&1 || true)"
  if ! echo "${stderr_output}" | grep -q "schema file not found"; then
    echo "expected error message to mention 'schema file not found'" >&2
    return 1
  fi
}

run_fail_schema_unparseable() {
  local fixture="${TMP_DIR}/schema-unparseable"
  make_ok_fixture "${fixture}"
  local bad_schema="${TMP_DIR}/bad-schema.yaml"
  echo "{{invalid yaml" >"${bad_schema}"
  if AI4X_SCHEMA_PATH="${bad_schema}" "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for unparseable schema file" >&2
    return 1
  fi
}

run_ok
run_ok_explicit_empty_sources
run_fail_missing_meta
run_fail_unknown_requires
run_fail_requires_conflicts_overlap
run_fail_asymmetric_conflict
run_fail_missing_owner
run_fail_unknown_key
run_fail_invalid_source_kind
run_fail_invalid_distinguish_from
run_fail_schema_missing
run_fail_schema_unparseable

echo "capability-meta.sh: OK"
