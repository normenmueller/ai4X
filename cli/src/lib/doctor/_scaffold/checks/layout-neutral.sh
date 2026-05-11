#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../../../../../.." && pwd)/crp/cap"
FAIL=0

scan_pattern() {
  local label="$1"
  local pattern="$2"
  local hits
  hits="$(
    (
      cd "${ROOT_DIR}" && \
      rg -n --hidden \
        -g '*.md' -g '*.yaml' -g '*.yml' -g '*.json' -g '*.sh' -g '*.ts' -g '*.tex' \
        -g '!**/.git/**' \
        -g '!**/node_modules/**' \
        -g '!**/layout-neutral*.sh' \
        -e "$pattern" .
    ) || true
  )"
  if [[ -n "${hits}" ]]; then
    echo "[ccp|ERROR]: forbidden ${label} detected" >&2
    echo "${hits}" >&2
    FAIL=1
  fi
}

scan_pattern "absolute user paths" '(/Users/[^/]+|/home/[^/]+)'
scan_pattern "local repository roots" 'Repositories/(GitHub|GitLab)/[^/]+/[^/]+'
scan_pattern "cross-repo relative module links" '(^|[^.])\.\./(ai4x|ask|kob|ccp|tcp|skills)(/|\))'
scan_pattern "forbidden removed ai4x config keys" 'modules\.rules|install\.config_mode\.rules|/absolute/path/to/rules'

if [[ "${FAIL}" -ne 0 ]]; then
  echo "[ccp|ERROR]: layout-neutrality gate failed" >&2
  exit 1
fi

echo "[ccp|INFO]: layout-neutrality gate passed"
