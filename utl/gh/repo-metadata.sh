#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
NODE_SCRIPT="${SCRIPT_DIR}/repo-metadata.mjs"

if [[ ! -f "${NODE_SCRIPT}" ]]; then
  echo "[repo-metadata|ERROR]: missing node script: ${NODE_SCRIPT}" >&2
  exit 1
fi

MODE="${1:---check}"
case "${MODE}" in
  --check|--check-local|--apply)
    ;;
  *)
    echo "[repo-metadata|ERROR]: usage: --check | --check-local | --apply" >&2
    exit 2
    ;;
esac

node "${NODE_SCRIPT}" "${MODE}"
