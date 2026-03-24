#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

for rel in utl/cmp/ai4x.bash utl/cmp/_ai4x utl/cmp/ai4x.fish; do
  if [[ ! -f "${ROOT_DIR}/${rel}" ]]; then
    echo "[tst/setup] missing completion file: ${rel}" >&2
    exit 1
  fi
done

for rel in \
  src/app/ai4x.ts \
  src/lib/app/main.ts \
  src/lib/cli/args.ts \
  src/lib/operations/actions.ts \
  src/lib/runtime/shell.ts \
  src/lib/model/types.ts \
  src/lib/shared/log.ts
do
  if [[ ! -f "${ROOT_DIR}/${rel}" ]]; then
    echo "[tst/setup] missing source file: ${rel}" >&2
    exit 1
  fi
done

echo "[tst/setup] OK"
