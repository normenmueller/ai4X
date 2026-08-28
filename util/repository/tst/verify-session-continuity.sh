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
  cp "$repository/.ai4x/.gitignore" "$target/.ai4x/.gitignore"
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

make_git_fixture() {
  target=$1
  make_fixture "$target"
  git -C "$target" init -q
  git -C "$target" config user.name 'ai4X fixture'
  git -C "$target" config user.email 'fixture@ai4x.invalid'
  git -C "$target" add .
  git -C "$target" commit -q -m fixture
  git -C "$target" branch -M trunk
}

write_active_pointer() {
  target=$1
  worktree=$2
  branch=$3
  mkdir -p "$target/.ai4x/local"
  printf '%s\n' \
    '# ai4X Active Worktree Pointer' \
    'Schema: ai4x-active-worktree-pointer-v1' \
    "Worktree: $worktree" \
    "Expected Branch: $branch" \
    > "$target/.ai4x/local/ACTIVE.md"
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

detached=$scratch_root/detached
make_git_fixture "$detached"
git -C "$detached" checkout -q --detach
"$verifier" "$detached" --static clean >/dev/null
expect_failure detached-runtime "$verifier" "$detached" '' clean

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
make_git_fixture "$safe_active"
mkdir -p "$safe_active/.ai4x/local/worktrees"
git -C "$safe_active" worktree add -q -b feature/188-lean-agent-governance \
  "$safe_active/.ai4x/local/worktrees/188"
write_active_pointer "$safe_active" '.ai4x/local/worktrees/188' \
  feature/188-lean-agent-governance
"$verifier" "$safe_active" trunk clean >/dev/null

unsafe_active=$scratch_root/unsafe-active
make_fixture "$unsafe_active"
write_active_pointer "$unsafe_active" '../../outside' \
  feature/188-lean-agent-governance
expect_failure unsafe-active "$verifier" "$unsafe_active" feature/188-lean-agent-governance clean

missing_active_target=$scratch_root/missing-active-target
make_git_fixture "$missing_active_target"
write_active_pointer "$missing_active_target" '.ai4x/local/worktrees/missing' \
  feature/188-lean-agent-governance
expect_failure missing-active-target "$verifier" "$missing_active_target" trunk clean

cross_repository=$scratch_root/cross-repository
make_git_fixture "$cross_repository"
cross_target=$cross_repository/.ai4x/local/worktrees/foreign
mkdir -p "$cross_target"
git -C "$cross_target" init -q
git -C "$cross_target" checkout -q -b feature/188-lean-agent-governance
write_active_pointer "$cross_repository" '.ai4x/local/worktrees/foreign' \
  feature/188-lean-agent-governance
expect_failure cross-repository "$verifier" "$cross_repository" trunk clean

wrong_active_branch=$scratch_root/wrong-active-branch
make_git_fixture "$wrong_active_branch"
mkdir -p "$wrong_active_branch/.ai4x/local/worktrees"
git -C "$wrong_active_branch" worktree add -q -b feature/wrong \
  "$wrong_active_branch/.ai4x/local/worktrees/wrong"
write_active_pointer "$wrong_active_branch" '.ai4x/local/worktrees/wrong' \
  feature/188-lean-agent-governance
expect_failure wrong-active-branch "$verifier" "$wrong_active_branch" trunk clean

wrong_target_state=$scratch_root/wrong-target-state
make_git_fixture "$wrong_target_state"
mkdir -p "$wrong_target_state/.ai4x/local/worktrees"
git -C "$wrong_target_state" worktree add -q -b feature/188-lean-agent-governance \
  "$wrong_target_state/.ai4x/local/worktrees/188"
sed -i.bak 's|^Applies on branch:.*|Applies on branch: feature/other|' \
  "$wrong_target_state/.ai4x/local/worktrees/188/.ai4x/STATE.md"
rm "$wrong_target_state/.ai4x/local/worktrees/188/.ai4x/STATE.md.bak"
write_active_pointer "$wrong_target_state" '.ai4x/local/worktrees/188' \
  feature/188-lean-agent-governance
expect_failure wrong-target-state "$verifier" "$wrong_target_state" trunk clean

untracked_target_state=$scratch_root/untracked-target-state
make_git_fixture "$untracked_target_state"
mkdir -p "$untracked_target_state/.ai4x/local/worktrees"
git -C "$untracked_target_state" worktree add -q -b feature/188-lean-agent-governance \
  "$untracked_target_state/.ai4x/local/worktrees/188"
git -C "$untracked_target_state/.ai4x/local/worktrees/188" rm -q --cached .ai4x/STATE.md
write_active_pointer "$untracked_target_state" '.ai4x/local/worktrees/188' \
  feature/188-lean-agent-governance
expect_failure untracked-target-state "$verifier" "$untracked_target_state" trunk clean

absolute_target_state=$scratch_root/absolute-target-state
make_git_fixture "$absolute_target_state"
mkdir -p "$absolute_target_state/.ai4x/local/worktrees"
git -C "$absolute_target_state" worktree add -q -b feature/188-lean-agent-governance \
  "$absolute_target_state/.ai4x/local/worktrees/188"
printf '\n- /Users/person/unsafe\n' >> \
  "$absolute_target_state/.ai4x/local/worktrees/188/.ai4x/STATE.md"
write_active_pointer "$absolute_target_state" '.ai4x/local/worktrees/188' \
  feature/188-lean-agent-governance
expect_failure absolute-target-state "$verifier" "$absolute_target_state" trunk clean

echo '[ai4x] session-continuity-test: passed'
