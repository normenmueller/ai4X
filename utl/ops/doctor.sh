#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

ROOT="$(root_dir)"
info "doctor: validating repository readiness"

if [[ ! -d "$ROOT/cli/src/app" || ! -d "$ROOT/cli/src/lib" || ! -d "$ROOT/cli/tst" ]]; then
  echo "[ai4x] ERROR cli/src/app, cli/src/lib, and cli/tst are required" >&2
  exit 2
fi

if [[ ! -f "$ROOT/.github/agents/ai4x.agent.md" ]]; then
  echo "[ai4x] ERROR .github/agents/ai4x.agent.md missing" >&2
  exit 2
fi

info "doctor: repository structure is valid"
