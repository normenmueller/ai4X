#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

ROOT="$(root_dir)"
info "verify: checking repository baseline"

require_path "$ROOT/.github/agents/ai4x.agent.md"
require_path "$ROOT/CONTRIBUTING.md"
require_path "$ROOT/README.md"
require_path "$ROOT/dev/cli/src"
require_path "$ROOT/dev/cli/src/app"
require_path "$ROOT/dev/cli/src/lib"
require_path "$ROOT/dev/cli/tst"

require_tracked_path "dev/cli/src/app/.gitkeep"
require_tracked_path "dev/cli/src/lib/.gitkeep"
require_tracked_path "dev/cli/tst/.gitkeep"

bash "$ROOT/utl/gh/repo-metadata.sh" --check-local

info "verify: baseline checks passed"
