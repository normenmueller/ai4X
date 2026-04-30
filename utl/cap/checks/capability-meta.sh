#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="${1:-$(cd "${SCRIPT_DIR}/../../.." && pwd)/dev/cap}"
node "${SCRIPT_DIR}/capability-meta.mjs" "${ROOT}"
