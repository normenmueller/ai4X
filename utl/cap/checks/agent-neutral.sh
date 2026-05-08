#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="${1:-$(cd "${SCRIPT_DIR}/../../.." && pwd)/crp/cap}"
SRC_DIR="${ROOT}"

if [ ! -d "${SRC_DIR}" ]; then
  echo "[ccp|ERROR]: cap directory not found: ${SRC_DIR}" >&2
  exit 1
fi

status=0
capability_ids=()

check_forbidden() {
  local pattern="$1"
  local label="$2"
  local matches

  if matches="$(rg -n --glob '*.md' -e "${pattern}" "${SRC_DIR}" || true)"; then
    :
  fi
  if [ -n "${matches}" ]; then
    echo "[ccp|ERROR]: forbidden ${label} detected:" >&2
    echo "${matches}" >&2
    status=1
  fi
}

check_forbidden_no_index() {
  local pattern="$1"
  local label="$2"
  local matches

  if matches="$(rg -n --glob '*.md' --glob '!**/index.md' -e "${pattern}" "${SRC_DIR}" || true)"; then
    :
  fi
  if [ -n "${matches}" ]; then
    echo "[ccp|ERROR]: forbidden ${label} detected:" >&2
    echo "${matches}" >&2
    status=1
  fi
}

collect_active_capability_ids() {
  local meta
  while IFS= read -r -d '' meta; do
    if ! rg -q '^status:\s*active$' "${meta}"; then
      continue
    fi
    capability_ids+=("$(sed -n 's/^id: //p' "${meta}")")
  done < <(find "${SRC_DIR}" -name '*.meta.yaml' -print0)
}

# Agenten-/Runtime-spezifische Begriffe und Pfade sind in ccp verboten.
check_forbidden '\b(Sigrid|Gertrud|Lamby|Citty|Arty|Librarian|Graphion)\b' "agent name"
check_forbidden '(\.sigrid\b|\.gertrud\b|\.github/agents\b|AGENTS\.md)' "runtime/client path"
check_forbidden '\b(codex|copilot|vscode)\b' "provider/client instruction"

# v1: atomare Rules ohne Rule-zu-Rule Referenzen.
collect_active_capability_ids
if [ "${#capability_ids[@]}" -gt 0 ]; then
  joined_ids="$(printf '%s|' "${capability_ids[@]}")"
  joined_ids="${joined_ids%|}"
  check_forbidden_no_index "(^|[^[:alnum:]_-])(${joined_ids})\\.md([^[:alnum:]_-]|$)" "rule-to-rule reference"
fi
check_forbidden_no_index '`[^`]*\/[^"]*\.md`' "path-based markdown reference"
check_forbidden_no_index '\]\((\.\.?\/|\/)[^)]+\.md\)' "relative or absolute markdown link path"

if [ "${status}" -ne 0 ]; then
  echo "[ccp|ERROR]: agent-neutral gate failed" >&2
  exit 1
fi

echo "[ccp|INFO]: agent-neutral gate passed"
