#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

ROOT="$(root_dir)"
info "verify: checking repository baseline"

require_path "$ROOT/.github/agents/ai4x.agent.md"
require_path "$ROOT/CONTRIBUTING.md"
require_path "$ROOT/README.md"
require_path "$ROOT/dev/src"
require_path "$ROOT/dev/src/app"
require_path "$ROOT/dev/src/lib"
require_path "$ROOT/dev/tst"

require_tracked_path "dev/src/app/.gitkeep"
require_tracked_path "dev/src/lib/.gitkeep"
require_tracked_path "dev/tst/.gitkeep"

bash "$ROOT/utl/gh/repo-metadata.sh" --check-local

info "verify: baseline checks passed"
