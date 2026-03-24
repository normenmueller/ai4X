#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ALLOWLIST_FILE="${ROOT_DIR}/tst/setup/secret-scan.allowlist"

if ! command -v rg >/dev/null 2>&1; then
  echo "[tst/setup] secret-scan requires 'rg' in PATH" >&2
  exit 1
fi

PATTERNS=(
  'AKIA[0-9A-Z]{16}'
  'gh[pousr]_[A-Za-z0-9_]{20,}'
  'sk-[A-Za-z0-9]{20,}'
  'xox[baprs]-[A-Za-z0-9-]{10,}'
  '-----BEGIN (EC|RSA|OPENSSH|DSA|PGP) PRIVATE KEY-----'
)

raw_hits_file="$(mktemp)"
unique_hits_file="$(mktemp)"
allowlist_patterns_file="$(mktemp)"
pattern_hits_file="$(mktemp)"
filtered_hits_file="$(mktemp)"
trap 'rm -f "${raw_hits_file}" "${unique_hits_file}" "${allowlist_patterns_file}" "${pattern_hits_file}" "${filtered_hits_file}"' EXIT

for pattern in "${PATTERNS[@]}"; do
  set +e
  rg \
    --pcre2 \
    --line-number \
    --no-heading \
    --hidden \
    --glob '!.git/**' \
    --glob '!node_modules/**' \
    --glob '!coverage/**' \
    --glob '!dist/**' \
    --glob '!tst/fixtures/**' \
    --glob '!package-lock.json' \
    --regexp "${pattern}" \
    "${ROOT_DIR}" >"${pattern_hits_file}"
  rg_status=$?
  set -e

  if [[ ${rg_status} -eq 0 ]]; then
    cat "${pattern_hits_file}" >>"${raw_hits_file}"
    continue
  fi
  if [[ ${rg_status} -eq 1 ]]; then
    continue
  fi

  echo "[tst/setup] secret-scan failed while scanning pattern: ${pattern}" >&2
  exit 1
done

sort -u "${raw_hits_file}" >"${unique_hits_file}"

if [[ -f "${ALLOWLIST_FILE}" ]]; then
  grep -Ev '^\s*(#|$)' "${ALLOWLIST_FILE}" >"${allowlist_patterns_file}" || true
  if [[ -s "${allowlist_patterns_file}" ]]; then
    grep -F -v -f "${allowlist_patterns_file}" "${unique_hits_file}" >"${filtered_hits_file}" || true
    mv "${filtered_hits_file}" "${unique_hits_file}"
  fi
fi

if [[ -s "${unique_hits_file}" ]]; then
  echo "[tst/setup] secret-scan found potential secrets:" >&2
  cat "${unique_hits_file}" >&2
  exit 1
fi

echo "[tst/setup] secret-scan OK"
