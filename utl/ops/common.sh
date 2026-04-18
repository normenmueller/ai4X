#!/usr/bin/env bash
set -euo pipefail

root_dir() {
  cd "$(dirname "${BASH_SOURCE[0]}")/../.." >/dev/null 2>&1
  pwd
}

require_path() {
  local p="$1"
  if [[ ! -e "$p" ]]; then
    echo "[ai4x] ERROR missing required path: $p" >&2
    exit 2
  fi
}

require_tracked_path() {
  local repo_relative_path="$1"
  if ! git -C "$(root_dir)" ls-files --error-unmatch -- "$repo_relative_path" >/dev/null 2>&1; then
    echo "[ai4x] ERROR required tracked path missing from git index: $repo_relative_path" >&2
    exit 2
  fi
}

info() {
  echo "[ai4x] $*"
}
