#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
CLI_TS="$ROOT_DIR/app/ai4x.ts"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

export XDG_CONFIG_HOME="$TMP_DIR/xdg"

OUT_HELP="$(node "$CLI_TS" --help)"
[[ "$OUT_HELP" == *"ai4x clean"* ]] || {
  echo "missing clean command in help"
  exit 1
}
[[ "$OUT_HELP" == *"ai4x doctor"* ]] || {
  echo "missing doctor command in help"
  exit 1
}
[[ "$OUT_HELP" == *"~/.config/ai4x/config.yaml"* ]] || {
  echo "missing config path hint in help"
  exit 1
}
[[ "$OUT_HELP" == *"--strict"* ]] || {
  echo "missing --strict option in help"
  exit 1
}
[[ "$OUT_HELP" == *"--json"* ]] || {
  echo "missing --json option in help"
  exit 1
}
[[ "$OUT_HELP" == *"--verbose"* ]] || {
  echo "missing --verbose option in help"
  exit 1
}
[[ "$OUT_HELP" != *"--skip-kob-test"* ]] || {
  echo "--skip-kob-test must not appear in help"
  exit 1
}
[[ "$OUT_HELP" != *"--config-mode"* ]] || {
  echo "--config-mode must not appear in help"
  exit 1
}
[[ "$OUT_HELP" != *"--ass-root"* ]] || {
  echo "--ass-root must not appear in help"
  exit 1
}
[[ "$OUT_HELP" != *"--ask-root"* ]] || {
  echo "--ask-root must not appear in help"
  exit 1
}
[[ "$OUT_HELP" != *"--kob-root"* ]] || {
  echo "--kob-root must not appear in help"
  exit 1
}
[[ "$OUT_HELP" != *"--tcp-root"* ]] || {
  echo "--tcp-root must not appear in help"
  exit 1
}
[[ "$OUT_HELP" != *"Version:"* ]] || {
  echo "help must not contain a Version block"
  exit 1
}

OUT_HELP_INSTALL="$(node "$CLI_TS" help install)"
[[ "$OUT_HELP_INSTALL" == *"Usage:"* ]] || {
  echo "missing usage header in install help"
  exit 1
}
[[ "$OUT_HELP_INSTALL" == *"ai4x install [--clean] [--prefix <path>] [--admin] [--dry-run]"* ]] || {
  echo "missing install usage line in install help"
  exit 1
}
[[ "$OUT_HELP_INSTALL" == *"Examples:"* ]] || {
  echo "missing examples block in install help"
  exit 1
}

OUT_HELP_CLEAN="$(node "$CLI_TS" clean --help)"
[[ "$OUT_HELP_CLEAN" == *"ai4x clean [--prefix <path>] [--dry-run]"* ]] || {
  echo "missing clean usage line in clean help"
  exit 1
}
[[ "$OUT_HELP_CLEAN" == *"Description:"* ]] || {
  echo "missing description in clean help"
  exit 1
}

OUT_VERSION="$(node "$CLI_TS" --version)"
[[ "$OUT_VERSION" == "ai4x, v0.1.0, © 2026 nemron" ]] || {
  echo "unexpected version output: $OUT_VERSION"
  exit 1
}

set +e
ERR_OUT="$(node "$CLI_TS" unknown 2>&1 >/dev/null)"
ERR_CODE=$?
set -e

if [[ $ERR_CODE -eq 0 ]]; then
  echo "expected failure for unknown command"
  exit 1
fi
[[ "$ERR_CODE" -eq 2 ]] || {
  echo "expected exit code 2 for unknown command, got $ERR_CODE"
  exit 1
}

[[ "$ERR_OUT" == *"unknown command: unknown"* ]] || {
  echo "expected unknown command message"
  exit 1
}

set +e
CLEAN_ADMIN_ERR="$(node "$CLI_TS" clean --admin 2>&1 >/dev/null)"
CLEAN_ADMIN_ERR_CODE=$?
set -e

if [[ $CLEAN_ADMIN_ERR_CODE -eq 0 ]]; then
  echo "expected clean --admin to fail"
  exit 1
fi
[[ "$CLEAN_ADMIN_ERR_CODE" -eq 2 ]] || {
  echo "expected exit code 2 for clean --admin usage error, got $CLEAN_ADMIN_ERR_CODE"
  exit 1
}

[[ "$CLEAN_ADMIN_ERR" == *"unknown option: --admin"* ]] || {
  echo "expected unknown --admin option for clean command"
  exit 1
}

set +e
CFG_ERR="$(node "$CLI_TS" install --dry-run 2>&1 >/dev/null)"
CFG_CODE=$?
set -e

if [[ $CFG_CODE -eq 0 ]]; then
  echo "expected failure for missing ai4x config"
  exit 1
fi

[[ "$CFG_ERR" == *"config file not found:"* ]] || {
  echo "expected missing config error"
  exit 1
}

set +e
DOCTOR_MISSING_OUT="$(node "$CLI_TS" doctor --strict 2>&1)"
DOCTOR_MISSING_CODE=$?
set -e

if [[ $DOCTOR_MISSING_CODE -eq 0 ]]; then
  echo "expected doctor --strict to fail when config is missing"
  exit 1
fi

[[ "$DOCTOR_MISSING_OUT" == *"[FAIL][required] config file not found"* ]] || {
  echo "expected required config.file failure in doctor output"
  exit 1
}

ASK_DIR="$TMP_DIR/ask"
KOB_DIR="$TMP_DIR/kob"
CCP_DIR="$TMP_DIR/cap/cog"
TCP_DIR="$TMP_DIR/cap/tec"

mkdir -p "$ASK_DIR/src"
mkdir -p "$KOB_DIR/utl/kob/src"
mkdir -p "$CCP_DIR"
mkdir -p "$TCP_DIR"
mkdir -p "$TMP_DIR/ai4x"
mkdir -p "$XDG_CONFIG_HOME/ai4x"

cat > "$ASK_DIR/README.md" <<'EOF'
# ask
EOF

cat > "$KOB_DIR/README.md" <<'EOF'
# kob
EOF

cat > "$CCP_DIR/README.md" <<'EOF'
# ccp
EOF

cat > "$TCP_DIR/README.md" <<'EOF'
# tcp
EOF

cat > "$TMP_DIR/ai4x/README.md" <<'EOF'
# ai4x
EOF

cat > "$XDG_CONFIG_HOME/ai4x/config.yaml" <<EOF
version: 0.1.0
modules:
  ask: "$ASK_DIR"
  kob: "$KOB_DIR"
  ccp: "$CCP_DIR"
  tcp: "$TCP_DIR"
install:
  config_mode:
    ask: backup
    kob: keep
    ccp: keep
    tcp: keep
EOF

DRY_OUT="$(node "$CLI_TS" install --dry-run)"
[[ "$DRY_OUT" == *"$ASK_DIR/src"* ]] || {
  echo "expected ask path in dry-run output"
  exit 1
}
[[ "$DRY_OUT" == *"CONFIG_MODE=backup"* ]] || {
  echo "expected CONFIG_MODE=backup from config in dry-run output"
  exit 1
}
[[ "$DRY_OUT" == *"$KOB_DIR/utl/kob/src"* ]] || {
  echo "expected kob path in dry-run output"
  exit 1
}
[[ "$DRY_OUT" == *"make -C $KOB_DIR/utl/kob"* ]] || {
  echo "expected kob make install/uninstall commands in dry-run output"
  exit 1
}

DRY_OUT_CLEAN="$(node "$CLI_TS" install --clean --dry-run)"
[[ "$DRY_OUT_CLEAN" != *"/ask/config.yaml"* ]] || {
  echo "clean dry-run must not remove ask config.yaml"
  exit 1
}
[[ "$DRY_OUT_CLEAN" != *"/ask/AGENTS.md"* ]] || {
  echo "clean dry-run must not remove ask AGENTS.md"
  exit 1
}
[[ "$DRY_OUT_CLEAN" != *"/etc/ask/config.yaml"* ]] || {
  echo "clean dry-run must not remove system ask config.yaml"
  exit 1
}
[[ "$DRY_OUT_CLEAN" != *"/etc/ask/AGENTS.md"* ]] || {
  echo "clean dry-run must not remove system ask AGENTS.md"
  exit 1
}

cat > "$XDG_CONFIG_HOME/ai4x/config.yaml" <<EOF
version: 0.1.0
modules:
  ask: "$ASK_DIR"
  kob: "$KOB_DIR"
  ccp: "$CCP_DIR"
  tcp: "$TCP_DIR"
EOF

DRY_OUT_FALLBACK="$(node "$CLI_TS" install --dry-run)"
[[ "$DRY_OUT_FALLBACK" == *"CONFIG_MODE=keep"* ]] || {
  echo "expected fallback CONFIG_MODE=keep in dry-run output"
  exit 1
}

set +e
SKIP_KOB_TEST_ERR="$(node "$CLI_TS" install --dry-run --skip-kob-test 2>&1 >/dev/null)"
SKIP_KOB_TEST_ERR_CODE=$?
set -e

if [[ $SKIP_KOB_TEST_ERR_CODE -eq 0 ]]; then
  echo "expected failure for unsupported --skip-kob-test option"
  exit 1
fi
[[ "$SKIP_KOB_TEST_ERR_CODE" -eq 2 ]] || {
  echo "expected exit code 2 for unknown option --skip-kob-test, got $SKIP_KOB_TEST_ERR_CODE"
  exit 1
}

[[ "$SKIP_KOB_TEST_ERR" == *"unknown option: --skip-kob-test"* ]] || {
  echo "expected unknown --skip-kob-test option error"
  exit 1
}

set +e
CFG_MODE_ERR="$(node "$CLI_TS" install --dry-run --config-mode backup 2>&1 >/dev/null)"
CFG_MODE_ERR_CODE=$?
set -e

if [[ $CFG_MODE_ERR_CODE -eq 0 ]]; then
  echo "expected failure for unsupported --config-mode option"
  exit 1
fi
[[ "$CFG_MODE_ERR_CODE" -eq 2 ]] || {
  echo "expected exit code 2 for unknown option --config-mode, got $CFG_MODE_ERR_CODE"
  exit 1
}

[[ "$CFG_MODE_ERR" == *"unknown option: --config-mode"* ]] || {
  echo "expected unknown --config-mode option error"
  exit 1
}

cat > "$XDG_CONFIG_HOME/ai4x/config.yaml" <<EOF
version: 0.1.0
modules:
  ask: "$ASK_DIR"
  kob: "$KOB_DIR"
  ccp: "$CCP_DIR"
  tcp: "$TCP_DIR"
install:
  config_mode:
    ask: invalid
EOF

set +e
CFG_FILE_MODE_ERR="$(node "$CLI_TS" install --dry-run 2>&1 >/dev/null)"
CFG_FILE_MODE_ERR_CODE=$?
set -e

if [[ $CFG_FILE_MODE_ERR_CODE -eq 0 ]]; then
  echo "expected failure for invalid install.config_mode.ask"
  exit 1
fi

[[ "$CFG_FILE_MODE_ERR" == *"install.config_mode.ask must be keep|backup|force"* ]] || {
  echo "expected invalid config mode error from config file"
  exit 1
}

INVALID_CONFIG_VERSION="invalid"
cat > "$XDG_CONFIG_HOME/ai4x/config.yaml" <<EOF
version: ${INVALID_CONFIG_VERSION}
modules:
  ask: "$ASK_DIR"
  kob: "$KOB_DIR"
  ccp: "$CCP_DIR"
  tcp: "$TCP_DIR"
EOF

set +e
CFG_VERSION_ERR="$(node "$CLI_TS" install --dry-run 2>&1 >/dev/null)"
CFG_VERSION_ERR_CODE=$?
set -e

if [[ $CFG_VERSION_ERR_CODE -eq 0 ]]; then
  echo "expected failure for invalid config version"
  exit 1
fi

[[ "$CFG_VERSION_ERR" == *"version must be 0.1.0"* ]] || {
  echo "expected invalid config version error"
  exit 1
}

set +e
DOCTOR_VERSION_OUT="$(node "$CLI_TS" doctor --strict 2>&1)"
DOCTOR_VERSION_CODE=$?
set -e

if [[ $DOCTOR_VERSION_CODE -eq 0 ]]; then
  echo "expected doctor --strict to fail for invalid config version"
  exit 1
fi

[[ "$DOCTOR_VERSION_OUT" == *"[FAIL][required] version must be 0.1.0"* ]] || {
  echo "expected required config.version failure in doctor output"
  exit 1
}

cat > "$XDG_CONFIG_HOME/ai4x/config.yaml" <<EOF
version: 0.1.0
modules:
  ask: "$ASK_DIR"
  kob: "$KOB_DIR"
  ccp: "$CCP_DIR"
  tcp: "$TCP_DIR"
install:
  config_mode:
    ask: backup
    kob: keep
    ccp: keep
    tcp: keep
EOF

DOCTOR_STRICT_OUT="$(node "$CLI_TS" doctor --strict)"
[[ "$DOCTOR_STRICT_OUT" == *"summary: required ok="* ]] || {
  echo "expected summary line in doctor output"
  exit 1
}
[[ "$DOCTOR_STRICT_OUT" == *"result: ok"* ]] || {
  echo "expected doctor strict result to be ok"
  exit 1
}
if printf '%s\n' "$DOCTOR_STRICT_OUT" | grep -Fx "[ai4x|INFO]: doctor" >/dev/null; then
  echo "doctor output must not contain a plain header line"
  exit 1
fi
[[ "$DOCTOR_STRICT_OUT" != *"doctor failures:"* ]] || {
  echo "doctor output must not contain redundant failures line"
  exit 1
}
[[ "$DOCTOR_STRICT_OUT" != *"[OK]["* ]] || {
  echo "doctor default output must not include OK checks"
  exit 1
}
[[ "$DOCTOR_STRICT_OUT" != *"[FAIL][advisory] deps.kob.node_modules"* ]] || {
  echo "did not expect kob node_modules failure for dependency-free kob package"
  exit 1
}

DOCTOR_VERBOSE_OUT="$(node "$CLI_TS" doctor --strict --verbose)"
[[ "$DOCTOR_VERBOSE_OUT" == *"[OK][required] modules.ask"* ]] || {
  echo "expected modules.ask to be OK in verbose doctor output"
  exit 1
}

DOCTOR_JSON_OUT="$(node "$CLI_TS" doctor --json)"
[[ "$DOCTOR_JSON_OUT" == *"\"checks\":"* ]] || {
  echo "expected checks array in doctor JSON output"
  exit 1
}
[[ "$DOCTOR_JSON_OUT" == *"\"overall\": \"ok\""* ]] || {
  echo "expected overall=ok in doctor JSON output"
  exit 1
}

echo "ok"
