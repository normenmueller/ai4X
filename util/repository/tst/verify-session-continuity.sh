#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repository=$(CDPATH= cd -- "$script_directory/../../.." && pwd)
verifier="$repository/util/repository/verify-session-continuity.sh"
scratch_parent="$repository/.ai4x/local/verification"
mkdir -p "$scratch_parent"
scratch_root=$(mktemp -d "$scratch_parent/session-continuity.XXXXXX")

cleanup() {
  case "$scratch_root" in
    "$scratch_parent"/session-continuity.*) rm -rf "$scratch_root" ;;
    *) echo "refusing unsafe test cleanup: $scratch_root" >&2 ;;
  esac
}
trap cleanup EXIT HUP INT TERM

make_fixture() {
  target=$1
  mkdir -p \
    "$target/.github" \
    "$target/.ai4x/context" \
    "$target/.ai4x/operations" \
    "$target/.ai4x/local/session-scratch"
  cp "$repository/AGENTS.md" "$target/AGENTS.md"
  cp "$repository/.github/copilot-instructions.md" "$target/.github/copilot-instructions.md"
  cp "$repository/.ai4x/BEHAVIOR.md" "$target/.ai4x/BEHAVIOR.md"
  cp "$repository/.ai4x/CONTEXT.md" "$target/.ai4x/CONTEXT.md"
  cp "$repository/.ai4x/operations/session-continuity.md" "$target/.ai4x/operations/session-continuity.md"
  cp "$repository/.ai4x/context/curation.md" "$target/.ai4x/context/curation.md"
  cp "$repository/.ai4x/context/need-to-capability.md" "$target/.ai4x/context/need-to-capability.md"
}

write_valid_handoff() {
  target=$1
  printf '%s\n' \
    '# ai4X Session Handoff' \
    'Schema: ai4x-session-handoff-v1' \
    'Observed: 2026-08-27T00:00:00Z' \
    'Repository: normenmueller/ai4X' \
    'Owning Issue: #183' \
    'Expected Branch: fix/183-self-discovering-cold-start' \
    '' \
    '## Route' \
    '' \
    '- Tracked owners only.' \
    '' \
    '## Immediate next action' \
    '' \
    '- Perform a read-only Cold Start bootstrap.' \
    '' \
    '## Authority boundaries' \
    '' \
    '- No publication or merge authority.' \
    '' \
    '## Observed snapshot' \
    '' \
    '- Re-read Git and GitHub.' \
    '' \
    '## Necessary local-only continuity' \
    '' \
    '- None.' \
    '' \
    '## Open decisions' \
    '' \
    '- None.' \
    > "$target"
}

expect_failure() {
  name=$1
  shift
  if "$@" >"$scratch_root/$name.out" 2>&1; then
    echo "expected failure was accepted: $name" >&2
    exit 1
  fi
}

valid="$scratch_root/valid"
make_fixture "$valid"
write_valid_handoff "$valid/.ai4x/local/session-scratch/CURRENT-HANDOFF.md"
"$verifier" "$valid" >/dev/null

no_handoff="$scratch_root/no-handoff"
make_fixture "$no_handoff"
"$verifier" "$no_handoff" >/dev/null

unknown_schema="$scratch_root/unknown-schema"
make_fixture "$unknown_schema"
write_valid_handoff "$unknown_schema/.ai4x/local/session-scratch/CURRENT-HANDOFF.md"
sed -i.bak 's/ai4x-session-handoff-v1/ai4x-session-handoff-v2/' \
  "$unknown_schema/.ai4x/local/session-scratch/CURRENT-HANDOFF.md"
rm "$unknown_schema/.ai4x/local/session-scratch/CURRENT-HANDOFF.md.bak"
expect_failure unknown-schema "$verifier" "$unknown_schema"

duplicate_issue="$scratch_root/duplicate-issue"
make_fixture "$duplicate_issue"
write_valid_handoff "$duplicate_issue/.ai4x/local/session-scratch/CURRENT-HANDOFF.md"
sed -i.bak '/^Owning Issue:/a\
Owning Issue: #184' "$duplicate_issue/.ai4x/local/session-scratch/CURRENT-HANDOFF.md"
rm "$duplicate_issue/.ai4x/local/session-scratch/CURRENT-HANDOFF.md.bak"
expect_failure duplicate-issue "$verifier" "$duplicate_issue"

absolute_path="$scratch_root/absolute-path"
make_fixture "$absolute_path"
write_valid_handoff "$absolute_path/.ai4x/local/session-scratch/CURRENT-HANDOFF.md"
printf '\n- [target](file:///Volumes/private/unsafe)\n' >> "$absolute_path/.ai4x/local/session-scratch/CURRENT-HANDOFF.md"
expect_failure absolute-path "$verifier" "$absolute_path"

windows_path="$scratch_root/windows-path"
make_fixture "$windows_path"
write_valid_handoff "$windows_path/.ai4x/local/session-scratch/CURRENT-HANDOFF.md"
printf '\n- C:\\private\\unsafe\n' >> "$windows_path/.ai4x/local/session-scratch/CURRENT-HANDOFF.md"
expect_failure windows-path "$verifier" "$windows_path"

oversized="$scratch_root/oversized"
make_fixture "$oversized"
write_valid_handoff "$oversized/.ai4x/local/session-scratch/CURRENT-HANDOFF.md"
line=0
while test "$line" -lt 81; do
  printf 'continuity-padding-%s\n' "$line" >> "$oversized/.ai4x/local/session-scratch/CURRENT-HANDOFF.md"
  line=$((line + 1))
done
expect_failure oversized-handoff "$verifier" "$oversized"

bad_branch="$scratch_root/bad-branch"
make_fixture "$bad_branch"
write_valid_handoff "$bad_branch/.ai4x/local/session-scratch/CURRENT-HANDOFF.md"
sed -i.bak 's|^Expected Branch:.*|Expected Branch: ../escape|' \
  "$bad_branch/.ai4x/local/session-scratch/CURRENT-HANDOFF.md"
rm "$bad_branch/.ai4x/local/session-scratch/CURRENT-HANDOFF.md.bak"
expect_failure bad-branch "$verifier" "$bad_branch"

obsolete_prompt="$scratch_root/obsolete-prompt"
make_fixture "$obsolete_prompt"
write_valid_handoff "$obsolete_prompt/.ai4x/local/session-scratch/CURRENT-HANDOFF.md"
printf 'obsolete\n' > "$obsolete_prompt/.ai4x/local/session-scratch/NEXT-SESSION-PROMPT.md"
expect_failure obsolete-prompt "$verifier" "$obsolete_prompt"

echo '[ai4x] session-continuity-test: passed'
