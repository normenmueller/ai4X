#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
REPO_ROOT="$(cd "${SRC_DIR}/../../.." && pwd)"
SCRIPT_PATH="${REPO_ROOT}/utl/gh/repo-metadata.sh"

if [[ ! -x "${SCRIPT_PATH}" ]]; then
  echo "missing executable metadata script: ${SCRIPT_PATH}" >&2
  exit 1
fi

bash "${SCRIPT_PATH}" --check-local
echo "repo-metadata.sh: OK"
