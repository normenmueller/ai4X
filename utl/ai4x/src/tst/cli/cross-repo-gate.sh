#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
CLI_TS="${ROOT_DIR}/app/ai4x.ts"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

XDG_FALLBACK="${HOME}/.config"
XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-${XDG_FALLBACK}}"
CONFIG_FILE="${XDG_CONFIG_HOME}/ai4x/config.yaml"
ASK_DIR=""
KOB_DIR=""
CCP_DIR=""
TCP_DIR=""

expand_path() {
  local value="$1"
  local expanded="${value/#\~/${HOME}}"
  expanded="${expanded//\$\{HOME\}/${HOME}}"
  expanded="${expanded//\$HOME/${HOME}}"
  printf '%s' "${expanded}"
}

if [[ -f "${CONFIG_FILE}" ]]; then
  MODULES_CSV="$(
    node --input-type=module - "${CONFIG_FILE}" <<'NODE'
import fs from "node:fs";
import { parse } from "yaml";

const cfgPath = process.argv[2];
const raw = fs.readFileSync(cfgPath, "utf8");
const cfg = parse(raw);
const modules = cfg?.modules ?? {};
const fields = [modules.ask, modules.kob, modules.ccp, modules.tcp];
if (fields.every((entry) => typeof entry === "string" && entry.trim().length > 0)) {
  process.stdout.write(fields.join(","));
}
NODE
  )"
  IFS=',' read -r ASK_DIR KOB_DIR CCP_DIR TCP_DIR <<<"${MODULES_CSV:-}"
  ASK_DIR="$(expand_path "${ASK_DIR}")"
  KOB_DIR="$(expand_path "${KOB_DIR}")"
  CCP_DIR="$(expand_path "${CCP_DIR}")"
  TCP_DIR="$(expand_path "${TCP_DIR}")"

  for dir in "${ASK_DIR}" "${KOB_DIR}" "${CCP_DIR}" "${TCP_DIR}"; do
    if [[ ! -d "${dir}" ]]; then
      ASK_DIR=""
      KOB_DIR=""
      CCP_DIR=""
      TCP_DIR=""
      break
    fi
  done
fi

if [[ -z "${ASK_DIR}" || -z "${KOB_DIR}" || -z "${CCP_DIR}" || -z "${TCP_DIR}" ]]; then
  MODULE_ROOT="${TMP_DIR}/modules"
  ASK_DIR="${MODULE_ROOT}/ask"
  KOB_DIR="${MODULE_ROOT}/kob"
  CCP_DIR="${MODULE_ROOT}/cap/cog"
  TCP_DIR="${MODULE_ROOT}/cap/tec"

  mkdir -p "${ASK_DIR}/src"
  mkdir -p "${KOB_DIR}/utl/kob/src"
  mkdir -p "${CCP_DIR}"
  mkdir -p "${TCP_DIR}"
  mkdir -p "${MODULE_ROOT}/ai4x"

  cat > "${ASK_DIR}/README.md" <<'EOF'
# ask
EOF
  cat > "${KOB_DIR}/README.md" <<'EOF'
# kob
EOF
  cat > "${CCP_DIR}/README.md" <<'EOF'
# ccp
EOF
  cat > "${TCP_DIR}/README.md" <<'EOF'
# tcp
EOF
  cat > "${MODULE_ROOT}/ai4x/README.md" <<'EOF'
# ai4x
EOF
fi

for dir in "${ASK_DIR}" "${KOB_DIR}" "${CCP_DIR}" "${TCP_DIR}"; do
  if [[ ! -d "${dir}" ]]; then
    echo "missing module directory: ${dir}" >&2
    exit 1
  fi
done

export XDG_CONFIG_HOME="${TMP_DIR}/xdg"
mkdir -p "${XDG_CONFIG_HOME}/ai4x"

cat > "${XDG_CONFIG_HOME}/ai4x/config.yaml" <<EOF
version: 0.1.0
modules:
  ask: "${ASK_DIR}"
  kob: "${KOB_DIR}"
  ccp: "${CCP_DIR}"
  tcp: "${TCP_DIR}"
install:
  config_mode:
    ask: keep
    kob: keep
    ccp: keep
    tcp: keep
EOF

DOCTOR_OUT="$(node "${CLI_TS}" doctor --strict)"
[[ "${DOCTOR_OUT}" == *"[ai4x|INFO]: summary: required ok="* ]] || {
  echo "doctor summary missing"
  exit 1
}
[[ "${DOCTOR_OUT}" == *"required fail=0"* ]] || {
  echo "doctor strict required failures detected"
  exit 1
}
[[ "${DOCTOR_OUT}" == *"[ai4x|INFO]: result: ok"* ]] || {
  echo "doctor strict did not return result ok"
  exit 1
}

DRY_OUT="$(node "${CLI_TS}" install --clean --dry-run)"
[[ "${DRY_OUT}" == *"npm --prefix ${ASK_DIR}/src ci"* ]] || {
  echo "missing ask npm ci step in dry-run plan"
  exit 1
}
[[ "${DRY_OUT}" == *"make -C ${ASK_DIR}"* ]] || {
  echo "missing ask make step in dry-run plan"
  exit 1
}
[[ "${DRY_OUT}" == *"npm --prefix ${KOB_DIR}/utl/kob/src ci"* ]] || {
  echo "missing kob npm ci step in dry-run plan"
  exit 1
}
[[ "${DRY_OUT}" == *"npm --prefix ${KOB_DIR}/utl/kob/src test"* ]] || {
  echo "missing kob npm test step in dry-run plan"
  exit 1
}
[[ "${DRY_OUT}" == *"make -C ${KOB_DIR}/utl/kob"* ]] || {
  echo "missing kob make step in dry-run plan"
  exit 1
}

echo "cross-repo-gate.sh: OK"
