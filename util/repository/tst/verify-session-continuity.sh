#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
repository=$(CDPATH= cd -- "$script_directory/../../.." && pwd -P)
verifier=$repository/util/repository/verify-session-continuity.sh
scratch_parent=$repository/.ai4x/local/verification
mkdir -p "$scratch_parent"
scratch_root=$(mktemp -d "$scratch_parent/session-continuity.XXXXXX")

cleanup() {
  case "$scratch_root" in
    "$scratch_parent"/session-continuity.*) rm -rf "$scratch_root" ;;
    *) printf 'refusing unsafe test cleanup: %s\n' "$scratch_root" >&2 ;;
  esac
}
trap cleanup EXIT HUP INT TERM

make_fixture() {
  target=$1
  mkdir -p "$target/.github/workflows" "$target/.ai4x/context" \
    "$target/.ai4x/governance" "$target/.ai4x/operations"
  cp "$repository/AGENTS.md" "$target/AGENTS.md"
  cp "$repository/.github/copilot-instructions.md" "$target/.github/copilot-instructions.md"
  cp "$repository/.github/workflows/verify.yml" "$target/.github/workflows/verify.yml"
  cp "$repository/.ai4x/BEHAVIOR.md" "$target/.ai4x/BEHAVIOR.md"
  cp "$repository/.ai4x/CONTEXT.md" "$target/.ai4x/CONTEXT.md"
  cp "$repository/.ai4x/STATE.md" "$target/.ai4x/STATE.md"
  cp "$repository/.ai4x/TEAM.md" "$target/.ai4x/TEAM.md"
  cp "$repository/.ai4x/governance/work-authority.md" "$target/.ai4x/governance/work-authority.md"
  cp "$repository/.ai4x/operations/session-continuity.md" "$target/.ai4x/operations/session-continuity.md"
  cp "$repository/.ai4x/context/curation.md" "$target/.ai4x/context/curation.md"
  cp "$repository/.ai4x/context/need-to-capability.md" "$target/.ai4x/context/need-to-capability.md"
}

expect_failure() {
  name=$1
  shift
  if "$@" >"$scratch_root/$name.out" 2>&1; then
    printf 'expected failure was accepted: %s\n' "$name" >&2
    exit 1
  fi
}

valid=$scratch_root/valid
make_fixture "$valid"
"$verifier" "$valid" feature/188-lean-agent-governance clean >/dev/null

dormant=$scratch_root/dormant
make_fixture "$dormant"
"$verifier" "$dormant" trunk clean >/dev/null

wrong_branch=$scratch_root/wrong-branch
make_fixture "$wrong_branch"
expect_failure wrong-branch "$verifier" "$wrong_branch" feature/other-work clean

dirty_trunk=$scratch_root/dirty-trunk
make_fixture "$dirty_trunk"
expect_failure dirty-trunk "$verifier" "$dirty_trunk" trunk dirty

duplicate_issue=$scratch_root/duplicate-issue
make_fixture "$duplicate_issue"
sed -i.bak '/^Owning Issue:/a\
Owning Issue: #189' "$duplicate_issue/.ai4x/STATE.md"
rm "$duplicate_issue/.ai4x/STATE.md.bak"
expect_failure duplicate-issue "$verifier" "$duplicate_issue" feature/188-lean-agent-governance clean

live_status=$scratch_root/live-status
make_fixture "$live_status"
sed -i.bak '/^Owning Issue:/a\
Status: In progress' "$live_status/.ai4x/STATE.md"
rm "$live_status/.ai4x/STATE.md.bak"
expect_failure live-status "$verifier" "$live_status" feature/188-lean-agent-governance clean

bad_state_branch=$scratch_root/bad-state-branch
make_fixture "$bad_state_branch"
sed -i.bak 's|^Applies on branch:.*|Applies on branch: ../escape|' "$bad_state_branch/.ai4x/STATE.md"
rm "$bad_state_branch/.ai4x/STATE.md.bak"
expect_failure bad-state-branch "$verifier" "$bad_state_branch" feature/188-lean-agent-governance clean

absolute_state_path=$scratch_root/absolute-state-path
make_fixture "$absolute_state_path"
printf '\n- /Users/person/unsafe\n' >> "$absolute_state_path/.ai4x/STATE.md"
expect_failure absolute-state-path "$verifier" "$absolute_state_path" feature/188-lean-agent-governance clean

wrong_direct_default=$scratch_root/wrong-direct-default
make_fixture "$wrong_direct_default"
sed -i.bak 's/^Direct default:.*/Direct default: mandatory team/' "$wrong_direct_default/.ai4x/TEAM.md"
rm "$wrong_direct_default/.ai4x/TEAM.md.bak"
expect_failure wrong-direct-default "$verifier" "$wrong_direct_default" feature/188-lean-agent-governance clean

review_not_independent=$scratch_root/review-not-independent
make_fixture "$review_not_independent"
sed -i.bak 's/^Review independence:.*/Review independence: optional/' "$review_not_independent/.ai4x/TEAM.md"
rm "$review_not_independent/.ai4x/TEAM.md.bak"
expect_failure review-not-independent "$verifier" "$review_not_independent" feature/188-lean-agent-governance clean

permission_is_authority=$scratch_root/permission-is-authority
make_fixture "$permission_is_authority"
sed -i.bak 's/^Technical permission grants authority:.*/Technical permission grants authority: yes/' \
  "$permission_is_authority/.ai4x/governance/work-authority.md"
rm "$permission_is_authority/.ai4x/governance/work-authority.md.bak"
expect_failure permission-is-authority "$verifier" "$permission_is_authority" feature/188-lean-agent-governance clean

merge_not_po=$scratch_root/merge-not-po
make_fixture "$merge_not_po"
sed -i.bak 's/^Merge authority:.*/Merge authority: automation/' \
  "$merge_not_po/.ai4x/governance/work-authority.md"
rm "$merge_not_po/.ai4x/governance/work-authority.md.bak"
expect_failure merge-not-po "$verifier" "$merge_not_po" feature/188-lean-agent-governance clean

persisted_credentials=$scratch_root/persisted-credentials
make_fixture "$persisted_credentials"
sed -i.bak 's/persist-credentials: false/persist-credentials: true/' \
  "$persisted_credentials/.github/workflows/verify.yml"
rm "$persisted_credentials/.github/workflows/verify.yml.bak"
expect_failure persisted-credentials "$verifier" "$persisted_credentials" feature/188-lean-agent-governance clean

safe_active=$scratch_root/safe-active
make_fixture "$safe_active"
mkdir -p "$safe_active/.ai4x/local"
printf '%s\n' \
  '# ai4X Active Worktree Pointer' \
  'Schema: ai4x-active-worktree-pointer-v1' \
  'Worktree: .ai4x/local/worktrees/188' \
  'Expected Branch: feature/188-lean-agent-governance' \
  > "$safe_active/.ai4x/local/ACTIVE.md"
"$verifier" "$safe_active" feature/188-lean-agent-governance clean >/dev/null

unsafe_active=$scratch_root/unsafe-active
make_fixture "$unsafe_active"
mkdir -p "$unsafe_active/.ai4x/local"
printf '%s\n' \
  '# ai4X Active Worktree Pointer' \
  'Schema: ai4x-active-worktree-pointer-v1' \
  'Worktree: ../../outside' \
  'Expected Branch: feature/188-lean-agent-governance' \
  > "$unsafe_active/.ai4x/local/ACTIVE.md"
expect_failure unsafe-active "$verifier" "$unsafe_active" feature/188-lean-agent-governance clean

echo '[ai4x] session-continuity-test: passed'
