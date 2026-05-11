#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/../../../../../.." && pwd)/crp/cap"

node "${SCRIPT_DIR}/capability-indexes.mjs" "${ROOT}" "--check"
