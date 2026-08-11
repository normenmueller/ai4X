#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NODE_SCRIPT="${SCRIPT_DIR}/branch-scope.mjs"

if [[ ! -f "${NODE_SCRIPT}" ]]; then
  echo "[branch-scope|ERROR]: missing node script: ${NODE_SCRIPT}" >&2
  exit 1
fi

exec node "${NODE_SCRIPT}" "$@"
