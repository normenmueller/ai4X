#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
repository=$(CDPATH= cd -- "$script_directory/../../.." && pwd -P)
verifier=$repository/util/repository/verify-session-continuity.sh
fixture_branch=feature/session-continuity-fixture
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
  sed -i.bak "s|^Applies on branch:.*|Applies on branch: $fixture_branch|" \
    "$target/.ai4x/STATE.md"
  rm "$target/.ai4x/STATE.md.bak"
  git -C "$target" init -q
  git -C "$target" add .ai4x/STATE.md
  cp "$repository/.ai4x/TEAM.md" "$target/.ai4x/TEAM.md"
  for role_file in "$repository"/.ai4x/agents/*/ROLE.md; do
    role_directory=${role_file%/ROLE.md}
    destination=$target/.ai4x/agents/${role_directory##*/}
    mkdir -p "$destination"
    cp "$role_file" "$destination/ROLE.md"
  done
  cp "$repository/.ai4x/governance/work-authority.md" "$target/.ai4x/governance/work-authority.md"
  cp "$repository/.ai4x/operations/session-continuity.md" "$target/.ai4x/operations/session-continuity.md"
  cp "$repository/.ai4x/context/curation.md" "$target/.ai4x/context/curation.md"
  cp "$repository/.ai4x/context/need-to-capability.md" "$target/.ai4x/context/need-to-capability.md"
}

make_git_fixture() {
  target=$1
  make_fixture "$target"
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
sed -i.bak 's/^Owning Issue:.*/Owning Issue: #188/' "$valid/.ai4x/STATE.md"
"$verifier" "$valid" "$fixture_branch" clean | grep -F '#188' >/dev/null
sed -i.bak 's/^Owning Issue:.*/Owning Issue: none/' "$valid/.ai4x/STATE.md"
"$verifier" "$valid" "$fixture_branch" clean | grep -F 'direct PO assignment' >/dev/null
sed -i.bak 's/^Owning Issue:.*/Owning Issue: unknown/' "$valid/.ai4x/STATE.md"
expect_failure malformed-owner "$verifier" "$valid" "$fixture_branch" clean

untracked_source=$scratch_root/untracked-source
make_git_fixture "$untracked_source"
git -C "$untracked_source" switch -q -c "$fixture_branch"
"$verifier" "$untracked_source" | grep -F "session-continuity: active (" >/dev/null
git -C "$untracked_source" rm -q --cached .ai4x/STATE.md
test -f "$untracked_source/.ai4x/STATE.md"
expect_failure untracked-source-state "$verifier" "$untracked_source"
grep -F 'source STATE is not tracked' "$scratch_root/untracked-source-state.out" >/dev/null

missing_role=$scratch_root/missing-role
make_fixture "$missing_role"
rm "$missing_role/.ai4x/agents/testing/ROLE.md"
"$verifier" "$missing_role" "$fixture_branch" clean >/dev/null
expect_failure missing-specialist-role "$verifier" "$missing_role" --static
rm "$missing_role/.ai4x/agents/principal-adviser/ROLE.md"
expect_failure missing-primary-role "$verifier" "$missing_role" "$fixture_branch" clean

unlinked_role=$scratch_root/unlinked-role
make_fixture "$unlinked_role"
sed -i.bak 's|agents/principal-adviser/ROLE.md|agents/architecture/ROLE.md|' "$unlinked_role/.ai4x/TEAM.md"
expect_failure missing-primary-route "$verifier" "$unlinked_role" "$fixture_branch" clean

role_table=$scratch_root/role-table
make_fixture "$role_table"
table_file=$role_table/.ai4x/TEAM.md
for invalid_target in agents/other/ROLE.md agents/../agents/testing/ROLE.md profiles/testing/ROLE.md agents/testing/other.md agents/architecture/ROLE.md; do
  sed "s|agents/testing/ROLE.md|$invalid_target|" "$repository/.ai4x/TEAM.md" >"$table_file"
  expect_failure invalid-specialist-link "$verifier" "$role_table" --static
done
sed '/agents\/testing\/ROLE.md/d' "$repository/.ai4x/TEAM.md" >"$table_file"
expect_failure omitted-table-row "$verifier" "$role_table" --static
sed -e 's|agents/testing/ROLE.md|TEMP_ROLE|' \
  -e 's|agents/architecture/ROLE.md|agents/testing/ROLE.md|' \
  -e 's|TEMP_ROLE|agents/architecture/ROLE.md|' "$repository/.ai4x/TEAM.md" >"$table_file"
expect_failure swapped-role-profiles "$verifier" "$role_table" --static
cp "$repository/.ai4x/TEAM.md" "$table_file"

test_role=$role_table/.ai4x/agents/testing
mv "$test_role" "$role_table/original-role"
ln -s "$role_table/original-role" "$test_role"
expect_failure symlink-role-directory "$verifier" "$role_table" --static
rm "$test_role"
mv "$role_table/original-role" "$test_role"
mv "$test_role/ROLE.md" "$role_table/original-profile"
ln -s "$role_table/original-profile" "$test_role/ROLE.md"
expect_failure symlink-role-profile "$verifier" "$role_table" --static
rm "$test_role/ROLE.md"
touch "$test_role/ROLE.md"
expect_failure empty-role-profile "$verifier" "$role_table" --static

runtime_only=$scratch_root/runtime-only
make_fixture "$runtime_only"
rm "$runtime_only/.ai4x/context/curation.md" "$runtime_only/.github/workflows/verify.yml"
"$verifier" "$runtime_only" "$fixture_branch" clean >/dev/null
expect_failure missing-static-context "$verifier" "$runtime_only" --static

dormant=$scratch_root/dormant
make_fixture "$dormant"
"$verifier" "$dormant" trunk clean >/dev/null

trunk_entry=$scratch_root/trunk-entry
make_git_fixture "$trunk_entry"
sed -i.bak 's|^Applies on branch:.*|Applies on branch: trunk|' "$trunk_entry/.ai4x/STATE.md"
rm "$trunk_entry/.ai4x/STATE.md.bak"
"$verifier" "$trunk_entry" trunk clean | grep -F 'read-only entry' >/dev/null
git -C "$trunk_entry" add .ai4x/STATE.md
git -C "$trunk_entry" commit -q -m "Bind fixture to trunk"
git -C "$trunk_entry" config status.showUntrackedFiles no
touch "$trunk_entry/untracked"
expect_failure dirty-trunk-entry "$verifier" "$trunk_entry"

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
expect_failure duplicate-issue "$verifier" "$duplicate_issue" "$fixture_branch" clean

live_status=$scratch_root/live-status
make_fixture "$live_status"
sed -i.bak '/^Owning Issue:/a\
Status: In progress' "$live_status/.ai4x/STATE.md"
rm "$live_status/.ai4x/STATE.md.bak"
expect_failure live-status "$verifier" "$live_status" "$fixture_branch" clean

bad_state_branch=$scratch_root/bad-state-branch
make_fixture "$bad_state_branch"
sed -i.bak 's|^Applies on branch:.*|Applies on branch: ../escape|' "$bad_state_branch/.ai4x/STATE.md"
rm "$bad_state_branch/.ai4x/STATE.md.bak"
expect_failure bad-state-branch "$verifier" "$bad_state_branch" "$fixture_branch" clean

absolute_state_path=$scratch_root/absolute-state-path
make_fixture "$absolute_state_path"
printf '\n- /Users/person/unsafe\n' >> "$absolute_state_path/.ai4x/STATE.md"
expect_failure absolute-state-path "$verifier" "$absolute_state_path" "$fixture_branch" clean

wrong_direct_default=$scratch_root/wrong-direct-default
make_fixture "$wrong_direct_default"
sed -i.bak 's/^Direct default:.*/Direct default: mandatory team/' "$wrong_direct_default/.ai4x/TEAM.md"
rm "$wrong_direct_default/.ai4x/TEAM.md.bak"
expect_failure wrong-direct-default "$verifier" "$wrong_direct_default" --static

review_not_independent=$scratch_root/review-not-independent
make_fixture "$review_not_independent"
sed -i.bak 's/^Review independence:.*/Review independence: optional/' "$review_not_independent/.ai4x/TEAM.md"
rm "$review_not_independent/.ai4x/TEAM.md.bak"
expect_failure review-not-independent "$verifier" "$review_not_independent" --static

permission_is_authority=$scratch_root/permission-is-authority
make_fixture "$permission_is_authority"
sed -i.bak 's/^Technical permission grants authority:.*/Technical permission grants authority: yes/' \
  "$permission_is_authority/.ai4x/governance/work-authority.md"
rm "$permission_is_authority/.ai4x/governance/work-authority.md.bak"
expect_failure permission-is-authority "$verifier" "$permission_is_authority" --static

merge_not_po=$scratch_root/merge-not-po
make_fixture "$merge_not_po"
sed -i.bak 's/^Merge authority:.*/Merge authority: automation/' \
  "$merge_not_po/.ai4x/governance/work-authority.md"
rm "$merge_not_po/.ai4x/governance/work-authority.md.bak"
expect_failure merge-not-po "$verifier" "$merge_not_po" --static

persisted_credentials=$scratch_root/persisted-credentials
make_fixture "$persisted_credentials"
sed -i.bak 's/persist-credentials: false/persist-credentials: true/' \
  "$persisted_credentials/.github/workflows/verify.yml"
rm "$persisted_credentials/.github/workflows/verify.yml.bak"
expect_failure persisted-credentials "$verifier" "$persisted_credentials" --static

safe_active=$scratch_root/safe-active
make_git_fixture "$safe_active"
mkdir -p "$safe_active/.ai4x/local/worktrees"
git -C "$safe_active" worktree add -q -b "$fixture_branch" \
  "$safe_active/.ai4x/local/worktrees/188"
write_active_pointer "$safe_active" '.ai4x/local/worktrees/188' \
  "$fixture_branch"
"$verifier" "$safe_active" trunk clean | grep -F 'active-worktree' >/dev/null
git -C "$safe_active" switch -q -c feature/other-source
expect_failure conflicting-source-with-active "$verifier" "$safe_active"
grep -F "STATE bound to $fixture_branch does not apply on feature/other-source" \
  "$scratch_root/conflicting-source-with-active.out" >/dev/null
git -C "$safe_active" switch -q trunk
rm "$safe_active/.ai4x/local/worktrees/188/.ai4x/agents/principal-adviser/ROLE.md"
expect_failure missing-target-role "$verifier" "$safe_active" trunk clean

unsafe_active=$scratch_root/unsafe-active
make_fixture "$unsafe_active"
write_active_pointer "$unsafe_active" '../../outside' \
  "$fixture_branch"
"$verifier" "$unsafe_active" --static >/dev/null
expect_failure unsafe-active "$verifier" "$unsafe_active" "$fixture_branch" clean

missing_active_target=$scratch_root/missing-active-target
make_git_fixture "$missing_active_target"
write_active_pointer "$missing_active_target" '.ai4x/local/worktrees/missing' \
  "$fixture_branch"
expect_failure missing-active-target "$verifier" "$missing_active_target" trunk clean

cross_repository=$scratch_root/cross-repository
make_git_fixture "$cross_repository"
cross_target=$cross_repository/.ai4x/local/worktrees/foreign
mkdir -p "$cross_target"
git -C "$cross_target" init -q
git -C "$cross_target" checkout -q -b "$fixture_branch"
write_active_pointer "$cross_repository" '.ai4x/local/worktrees/foreign' \
  "$fixture_branch"
expect_failure cross-repository "$verifier" "$cross_repository" trunk clean

wrong_active_branch=$scratch_root/wrong-active-branch
make_git_fixture "$wrong_active_branch"
mkdir -p "$wrong_active_branch/.ai4x/local/worktrees"
git -C "$wrong_active_branch" worktree add -q -b feature/wrong \
  "$wrong_active_branch/.ai4x/local/worktrees/wrong"
write_active_pointer "$wrong_active_branch" '.ai4x/local/worktrees/wrong' \
  "$fixture_branch"
expect_failure wrong-active-branch "$verifier" "$wrong_active_branch" trunk clean

wrong_target_state=$scratch_root/wrong-target-state
make_git_fixture "$wrong_target_state"
mkdir -p "$wrong_target_state/.ai4x/local/worktrees"
git -C "$wrong_target_state" worktree add -q -b "$fixture_branch" \
  "$wrong_target_state/.ai4x/local/worktrees/188"
sed -i.bak 's|^Applies on branch:.*|Applies on branch: feature/other|' \
  "$wrong_target_state/.ai4x/local/worktrees/188/.ai4x/STATE.md"
rm "$wrong_target_state/.ai4x/local/worktrees/188/.ai4x/STATE.md.bak"
write_active_pointer "$wrong_target_state" '.ai4x/local/worktrees/188' \
  "$fixture_branch"
expect_failure wrong-target-state "$verifier" "$wrong_target_state" trunk clean

untracked_target_state=$scratch_root/untracked-target-state
make_git_fixture "$untracked_target_state"
mkdir -p "$untracked_target_state/.ai4x/local/worktrees"
git -C "$untracked_target_state" worktree add -q -b "$fixture_branch" \
  "$untracked_target_state/.ai4x/local/worktrees/188"
git -C "$untracked_target_state/.ai4x/local/worktrees/188" rm -q --cached .ai4x/STATE.md
write_active_pointer "$untracked_target_state" '.ai4x/local/worktrees/188' \
  "$fixture_branch"
expect_failure untracked-target-state "$verifier" "$untracked_target_state" trunk clean

absolute_target_state=$scratch_root/absolute-target-state
make_git_fixture "$absolute_target_state"
mkdir -p "$absolute_target_state/.ai4x/local/worktrees"
git -C "$absolute_target_state" worktree add -q -b "$fixture_branch" \
  "$absolute_target_state/.ai4x/local/worktrees/188"
printf '\n- /Users/person/unsafe\n' >> \
  "$absolute_target_state/.ai4x/local/worktrees/188/.ai4x/STATE.md"
write_active_pointer "$absolute_target_state" '.ai4x/local/worktrees/188' \
  "$fixture_branch"
expect_failure absolute-target-state "$verifier" "$absolute_target_state" trunk clean

echo '[ai4x] session-continuity-test: passed'
