#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
CHECKER="${ROOT_DIR}/utl/checks/capability-meta.sh"
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
status: active
approved_by: ["qa"]
approved_at: 2026-03-08T00:00:00+01:00
scope: cognitive
owner: qa
review_due: 2026-12-31
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
status: active
approved_by: ["qa"]
approved_at: 2026-03-08T00:00:00+01:00
scope: cognitive
owner: qa
review_due: 2026-12-31
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
status: active
approved_by: ["qa"]
approved_at: 2026-03-08T00:00:00+01:00
scope: cognitive
owner: qa
review_due: 2026-12-31
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
status: active
approved_by: ["qa"]
approved_at: 2026-03-08T00:00:00+01:00
scope: cognitive
owner: qa
review_due: 2026-12-31
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
status: active
approved_by: ["qa"]
approved_at: 2026-03-08T00:00:00+01:00
scope: cognitive
owner: qa
review_due: 2026-12-31
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
status: active
approved_by: ["qa"]
approved_at: 2026-03-08T00:00:00+01:00
scope: cognitive
owner: qa
review_due: 2026-12-31
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
status: active
approved_by: ["qa"]
approved_at: 2026-03-08T00:00:00+01:00
scope: cognitive
owner: qa
review_due: 2026-12-31
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

run_fail_missing_sources() {
  local fixture="${TMP_DIR}/missing-sources"
  make_ok_fixture "${fixture}"
  cat >"${fixture}/cap/strategy/workflow/interaction-contract.meta.yaml" <<'YAML'
id: interaction-contract
version: 0.1.0
status: active
approved_by: ["qa"]
approved_at: 2026-03-08T00:00:00+01:00
scope: cognitive
owner: qa
review_due: 2026-12-31
requires: ["clarification-before-guessing"]
conflicts: []
do_not_use_when: []
distinguish_from: []
YAML
  if "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for missing required sources field" >&2
    return 1
  fi
}

run_fail_missing_do_not_use_when() {
  local fixture="${TMP_DIR}/missing-do-not-use-when"
  make_ok_fixture "${fixture}"
  cat >"${fixture}/cap/strategy/workflow/interaction-contract.meta.yaml" <<'YAML'
id: interaction-contract
version: 0.1.0
status: active
approved_by: ["qa"]
approved_at: 2026-03-08T00:00:00+01:00
scope: cognitive
owner: qa
review_due: 2026-12-31
requires: ["clarification-before-guessing"]
conflicts: []
distinguish_from: []
sources: []
YAML
  if "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for missing do_not_use_when field" >&2
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
status: active
approved_by: ["qa"]
approved_at: 2026-03-08T00:00:00+01:00
scope: cognitive
owner: qa
review_due: 2026-12-31
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

run_ok
run_ok_explicit_empty_sources
run_fail_missing_meta
run_fail_unknown_requires
run_fail_requires_conflicts_overlap
run_fail_asymmetric_conflict
run_fail_missing_sources
run_fail_missing_do_not_use_when
run_fail_invalid_source_kind

echo "capability-meta.sh: OK"
