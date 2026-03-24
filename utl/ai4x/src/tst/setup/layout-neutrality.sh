#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-${HOME}/.config}"
CONFIG_FILE="${XDG_CONFIG_HOME}/ai4x/config.yaml"
FAIL=0

scan_pattern() {
  local root="$1"
  local label="$2"
  local pattern="$3"
  local hits
  hits="$(
    (
      cd "$root" && \
      rg -n --hidden \
        -g '*.md' -g '*.yaml' -g '*.yml' -g '*.json' -g '*.sh' -g '*.ts' -g '*.tex' \
        -g '!**/.git/**' \
        -g '!**/node_modules/**' \
        -g '!**/layout-neutral*.sh' \
        -e "$pattern" .
    ) || true
  )"
  if [[ -n "${hits}" ]]; then
    echo "[ai4x|ERROR]: forbidden ${label} in ${root}" >&2
    echo "${hits}" >&2
    FAIL=1
  fi
}

MODULE_ROOTS=""
if [[ -f "${CONFIG_FILE}" ]]; then
  MODULE_ROOTS="$(
    node --input-type=module - "${CONFIG_FILE}" <<'NODE'
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parse } from "yaml";

const cfgPath = process.argv[2];
const raw = fs.readFileSync(cfgPath, "utf8");
const cfg = parse(raw);
const modules = cfg?.modules ?? {};
const keys = ["ask", "kob", "ccp", "tcp"];

function expand(input) {
  if (typeof input !== "string") {
    return "";
  }
  const home = os.homedir();
  const replaced = input
    .replace(/^~(?=$|\/)/, home)
    .replaceAll("$HOME", home)
    .replaceAll("${HOME}", home);
  return path.resolve(path.dirname(cfgPath), replaced);
}

for (const key of keys) {
  const p = expand(modules[key]);
  if (p.length > 0) {
    process.stdout.write(`${p}\n`);
  }
}
NODE
  )"
fi

ROOTS="$(
  {
    echo "${ROOT_DIR}";
    if [[ -n "${MODULE_ROOTS}" ]]; then
      echo "${MODULE_ROOTS}";
    fi
  } | awk 'NF' | sort -u
)"

while IFS= read -r root; do
  [[ -d "${root}" ]] || continue
  scan_pattern "${root}" "absolute user paths" '(/Users/[^/]+|/home/[^/]+)'
  scan_pattern "${root}" "local repository roots" 'Repositories/(GitHub|GitLab)/[^/]+/[^/]+'
  scan_pattern "${root}" "cross-repo relative module links" '(^|[^.])\.\./(ai4x|ask|kob|ccp|tcp|skills)(/|\))'
  scan_pattern "${root}" "forbidden removed ai4x config keys" 'modules.rules|install.config_mode.rules|/absolute/path/to/rules|modules.skills|install.config_mode.skills|/absolute/path/to/skills'
done <<< "${ROOTS}"

if [[ "${FAIL}" -ne 0 ]]; then
  echo "[ai4x|ERROR]: layout-neutrality gate failed" >&2
  exit 1
fi

echo "[ai4x|INFO]: layout-neutrality gate passed"
