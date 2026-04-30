#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

ROOT="$(root_dir)"
info "doctor: validating repository readiness"

if [[ ! -d "$ROOT/dev/cli/src/app" || ! -d "$ROOT/dev/cli/src/lib" || ! -d "$ROOT/dev/cli/tst" ]]; then
  echo "[ai4x] ERROR dev/cli/src/app, dev/cli/src/lib, and dev/cli/tst are required" >&2
  exit 2
fi

if [[ ! -f "$ROOT/.github/agents/ai4x.agent.md" ]]; then
  echo "[ai4x] ERROR .github/agents/ai4x.agent.md missing" >&2
  exit 2
fi

info "doctor: repository structure is valid"
