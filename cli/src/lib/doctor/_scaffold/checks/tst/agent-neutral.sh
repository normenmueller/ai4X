#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHECKER="${SCRIPT_DIR}/../agent-neutral.sh"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

make_base_fixture() {
  local fixture="$1"
  mkdir -p "${fixture}/cap/foundation" "${fixture}/cap/strategy/workflow"
  cat >"${fixture}/cap/foundation/deterministic-reasoning.md" <<'EOF2'
# Deterministic Reasoning

- Rule-Module bleiben atomar und ohne Rule-Referenzen.
EOF2
  cat >"${fixture}/cap/foundation/deterministic-reasoning.meta.yaml" <<'EOF2'
id: deterministic-reasoning
version: 0.1.0
status: active
approved_by: ["qa"]
approved_at: 2026-03-21T00:00:00+01:00
scope: cognitive
requires: []
conflicts: []
sources: []
EOF2
  cat >"${fixture}/cap/strategy/workflow/interaction-contract.md" <<'EOF2'
# Interaction Contract

- Default Output folgt der vereinbarten Ergebnisstruktur.
EOF2
  cat >"${fixture}/cap/strategy/workflow/interaction-contract.meta.yaml" <<'EOF2'
id: interaction-contract
version: 0.1.0
status: active
approved_by: ["qa"]
approved_at: 2026-03-21T00:00:00+01:00
scope: cognitive
requires: ["deterministic-reasoning"]
conflicts: []
sources: []
EOF2
}

run_ok() {
  local fixture="${TMP_DIR}/ok"
  make_base_fixture "${fixture}"
  "${CHECKER}" "${fixture}/cap" >/dev/null
}

run_fail_agent() {
  local fixture="${TMP_DIR}/fail-agent"
  make_base_fixture "${fixture}"
  echo "- Sigrid spezifisch" >>"${fixture}/cap/strategy/workflow/interaction-contract.md"
  if "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for agent-specific token" >&2
    return 1
  fi
}

run_fail_path_ref() {
  local fixture="${TMP_DIR}/fail-path"
  make_base_fixture "${fixture}"
  echo "- siehe \`../../doc/refs.md\`" >>"${fixture}/cap/strategy/workflow/interaction-contract.md"
  if "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for path-based markdown reference" >&2
    return 1
  fi
}

run_fail_rule_ref() {
  local fixture="${TMP_DIR}/fail-rule-ref"
  make_base_fixture "${fixture}"
  echo "- siehe \`deterministic-reasoning.md\`" >>"${fixture}/cap/strategy/workflow/interaction-contract.md"
  if "${CHECKER}" "${fixture}/cap" >/dev/null 2>&1; then
    echo "expected failure for rule-to-rule reference" >&2
    return 1
  fi
}

run_ok
run_fail_agent
run_fail_path_ref
run_fail_rule_ref

echo "agent-neutral.sh: OK"
