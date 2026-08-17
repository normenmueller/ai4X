#!/usr/bin/env bash
set -euo pipefail

expected_reuse_version='6.2.0'

command -v reuse >/dev/null 2>&1 || {
  echo '[ai4x|error] REUSE 6.2.0 is required; install with: pipx install "reuse[charset-normalizer]==6.2.0"' >&2
  exit 1
}

actual_reuse_version=$(reuse --version | sed -n '1s/^reuse, version //p')
if [[ "$actual_reuse_version" != "$expected_reuse_version" ]]; then
  echo "[ai4x|error] REUSE ${expected_reuse_version} is required; found ${actual_reuse_version:-unknown}" >&2
  exit 1
fi

reuse_entry=$(command -v reuse)
reuse_python=$(head -n 1 "$reuse_entry" | sed -E 's/^#!([^ ]+).*/\1/')
if [[ ! -x "$reuse_python" ]]; then
  echo "[ai4x|error] cannot resolve REUSE Python interpreter from ${reuse_entry}" >&2
  exit 1
fi

"$reuse_python" -B -m unittest discover -s utl/licensing -p 'test_license_assignments.py'
"$reuse_python" -B utl/licensing/check_license_assignments.py .
node --test utl/licensing/licensing-policy.test.mjs
node utl/licensing/licensing-policy.mjs
reuse --no-multiprocessing lint

echo '[ai4x|info] licensing verification passed'
