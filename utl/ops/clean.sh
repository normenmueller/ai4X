#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

ROOT="$(root_dir)"
info "clean: removing local build artifacts"

rm -rf "$ROOT/node_modules" "$ROOT/dist" "$ROOT/.ai4x"

info "clean: done"
