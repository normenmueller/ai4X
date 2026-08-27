#!/bin/sh
set -eu

repository=${1:-$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)}
handoff=${2:-$repository/.ai4x/local/session-scratch/CURRENT-HANDOFF.md}

fail() {
  echo "[ai4x] ERROR session-continuity: $*" >&2
  exit 2
}

require_file() {
  test -f "$repository/$1" || fail "missing tracked owner: $1"
}

require_text() {
  file=$1
  text=$2
  grep -F "$text" "$repository/$file" >/dev/null ||
    fail "$file does not route to $text"
}

require_file AGENTS.md
require_file .github/copilot-instructions.md
require_file .ai4x/BEHAVIOR.md
require_file .ai4x/CONTEXT.md
require_file .ai4x/operations/session-continuity.md
require_file .ai4x/context/curation.md
require_file .ai4x/context/need-to-capability.md

require_text AGENTS.md '.ai4x/CONTEXT.md'
require_text .github/copilot-instructions.md '.ai4x/CONTEXT.md'
require_text .ai4x/BEHAVIOR.md 'operations/session-continuity.md'
require_text .ai4x/CONTEXT.md 'operations/session-continuity.md'

if grep -R -n -E 'NEXT-SESSION-PROMPT|transition prompt suitable for /copy' \
  "$repository/AGENTS.md" \
  "$repository/.github/copilot-instructions.md" \
  "$repository/.ai4x/BEHAVIOR.md" \
  "$repository/.ai4x/CONTEXT.md" \
  "$repository/.ai4x/context" \
  "$repository/.ai4x/operations" >/dev/null; then
  fail 'obsolete copied-prompt protocol remains'
fi

test ! -e "$repository/.ai4x/local/session-scratch/NEXT-SESSION-PROMPT.md" ||
  fail 'obsolete NEXT-SESSION-PROMPT.md exists'

test -e "$handoff" || {
  echo '[ai4x] session-continuity: passed (no local handoff)'
  exit 0
}

test -f "$handoff" || fail 'handoff is not a regular file'
test ! -L "$handoff" || fail 'handoff must not be a symlink'

line_count=$(wc -l < "$handoff")
byte_count=$(wc -c < "$handoff")
test "$line_count" -le 80 || fail 'handoff exceeds the 80-line continuity limit'
test "$byte_count" -le 8192 || fail 'handoff exceeds the 8-KiB continuity limit'

test "$(sed -n '1p' "$handoff")" = '# ai4X Session Handoff' ||
  fail 'unexpected handoff title'

require_single_field() {
  field=$1
  count=$(grep -c "^$field: " "$handoff" || true)
  test "$count" -eq 1 || fail "expected exactly one $field field"
  sed -n "s/^$field: //p" "$handoff"
}

schema=$(require_single_field Schema)
test "$schema" = 'ai4x-session-handoff-v1' || fail "unknown schema: $schema"

observed=$(require_single_field Observed)
printf '%s\n' "$observed" | grep -E \
  '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(Z|[+-][0-9]{2}:[0-9]{2})$' >/dev/null ||
  fail 'Observed is not an ISO-8601 timestamp'

repository_name=$(require_single_field Repository)
printf '%s\n' "$repository_name" | grep -E \
  '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$' >/dev/null ||
  fail 'Repository must be owner/name, not a local path'

owning_issue=$(require_single_field 'Owning Issue')
printf '%s\n' "$owning_issue" | grep -E '^#[1-9][0-9]*$' >/dev/null ||
  fail 'Owning Issue must contain exactly one Issue number'

expected_branch=$(require_single_field 'Expected Branch')
git check-ref-format --branch "$expected_branch" >/dev/null 2>&1 ||
  fail 'Expected Branch is not a valid branch name'

expected_sections='## Route
## Immediate next action
## Authority boundaries
## Observed snapshot
## Necessary local-only continuity
## Open decisions'
actual_sections=$(grep '^## ' "$handoff" || true)
test "$actual_sections" = "$expected_sections" ||
  fail 'handoff sections are missing, duplicated, unknown, or out of order'

if grep -n -E '/(Users|home|var|private|tmp|Volumes|opt|mnt|srv)/|[A-Za-z]:\\' "$handoff" >/dev/null; then
  fail 'handoff contains an absolute machine-local path'
fi

if grep -n -E 'NEXT-SESSION-PROMPT|/copy|execute this prompt' "$handoff" >/dev/null; then
  fail 'handoff contains copied-prompt instructions'
fi

echo '[ai4x] session-continuity: passed'
