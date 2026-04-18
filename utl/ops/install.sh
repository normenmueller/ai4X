#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

ROOT="$(root_dir)"
info "install: baseline install"

if [[ ! -f "$ROOT/package.json" ]]; then
  info "install: package.json not found, no package installation required"
  exit 0
fi

if command -v npm >/dev/null 2>&1; then
  info "install: running npm ci"
  (cd "$ROOT" && npm ci)
  exit 0
fi

echo "[ai4x] ERROR npm is required when package.json exists" >&2
exit 2
