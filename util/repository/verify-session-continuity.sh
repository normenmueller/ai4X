#!/bin/sh
set -eu

repository=${1:-$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd -P)}
observed_branch=${2:-}
observed_clean=${3:-}
state_file=$repository/.ai4x/STATE.md
team_file=$repository/.ai4x/TEAM.md
authority_file=$repository/.ai4x/governance/work-authority.md
active_file=$repository/.ai4x/local/ACTIVE.md
workflow_file=$repository/.github/workflows/verify.yml

fail() {
  printf '[ai4x] ERROR session-continuity: %s\n' "$*" >&2
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

single_field() {
  file=$1
  field=$2
  count=$(grep -c "^$field: " "$file" || true)
  test "$count" -eq 1 || fail "expected exactly one $field field in ${file#$repository/}"
  sed -n "s/^$field: //p" "$file"
}

require_sections() {
  file=$1
  expected=$2
  actual=$(grep '^## ' "$file" || true)
  test "$actual" = "$expected" ||
    fail "sections are missing, duplicated, unknown, or out of order in ${file#$repository/}"
}

require_bounded_markdown() {
  file=$1
  line_limit=$2
  byte_limit=$3
  test ! -L "$file" || fail "${file#$repository/} must not be a symlink"
  test "$(wc -l < "$file")" -le "$line_limit" ||
    fail "${file#$repository/} exceeds its line limit"
  test "$(wc -c < "$file")" -le "$byte_limit" ||
    fail "${file#$repository/} exceeds its byte limit"
}

for file in \
  AGENTS.md \
  .github/copilot-instructions.md \
  .github/workflows/verify.yml \
  .ai4x/BEHAVIOR.md \
  .ai4x/CONTEXT.md \
  .ai4x/STATE.md \
  .ai4x/TEAM.md \
  .ai4x/governance/work-authority.md \
  .ai4x/operations/session-continuity.md \
  .ai4x/context/curation.md \
  .ai4x/context/need-to-capability.md; do
  require_file "$file"
done

require_text AGENTS.md '.ai4x/CONTEXT.md'
require_text .github/copilot-instructions.md '.ai4x/CONTEXT.md'
require_text .ai4x/BEHAVIOR.md 'operations/session-continuity.md'
require_text .ai4x/BEHAVIOR.md 'governance/work-authority.md'
require_text .ai4x/BEHAVIOR.md 'TEAM.md'
require_text .ai4x/CONTEXT.md 'operations/session-continuity.md'
require_text .ai4x/CONTEXT.md 'STATE.md'

if grep -n -E 'NEXT-SESSION-PROMPT|CURRENT-HANDOFF|transition prompt suitable for /copy' \
  "$repository/AGENTS.md" \
  "$repository/.github/copilot-instructions.md" \
  "$repository/.ai4x/BEHAVIOR.md" \
  "$repository/.ai4x/CONTEXT.md" \
  "$repository/.ai4x/operations/session-continuity.md" >/dev/null; then
  fail 'obsolete local-handoff or copied-prompt protocol remains in active routing'
fi

require_bounded_markdown "$state_file" 80 8192
test "$(sed -n '1p' "$state_file")" = '# ai4X Work State' ||
  fail 'unexpected STATE title'

state_schema=$(single_field "$state_file" Schema)
test "$state_schema" = 'ai4x-work-state-v1' || fail "unknown STATE schema: $state_schema"

state_branch=$(single_field "$state_file" 'Applies on branch')
git check-ref-format --branch "$state_branch" >/dev/null 2>&1 ||
  fail 'STATE branch is not a valid branch name'
test "$state_branch" != trunk || fail 'STATE must bind a non-trunk work branch'

owning_issue=$(single_field "$state_file" 'Owning Issue')
printf '%s\n' "$owning_issue" | grep -E '^#[1-9][0-9]*$' >/dev/null ||
  fail 'Owning Issue must contain exactly one Issue number'

require_sections "$state_file" '## Return context
## Route
## Authority boundary
## Concurrency limit'

if grep -n -E '^(Status|Work status|Execution authorization|Gate status|Pull Request|HEAD|Revision): ' "$state_file" >/dev/null; then
  fail 'STATE duplicates mutable work, authority, gate, or revision state'
fi

if grep -n -E '/(Users|home|var|private|tmp|Volumes|opt|mnt|srv)/|[A-Za-z]:\\' "$state_file" >/dev/null; then
  fail 'STATE contains an absolute machine-local path'
fi

require_bounded_markdown "$team_file" 100 10240
test "$(sed -n '1p' "$team_file")" = '# ai4X Team Routing' ||
  fail 'unexpected TEAM title'
test "$(single_field "$team_file" Schema)" = 'ai4x-team-routing-v1' ||
  fail 'unknown TEAM schema'
test "$(single_field "$team_file" 'Direct default')" = 'primary agent' ||
  fail 'direct work is not the TEAM default'
test "$(single_field "$team_file" 'Co-author trigger')" = 'missing-capability-contract-or-material-risk' ||
  fail 'co-author routing is not capability/risk triggered'
test "$(single_field "$team_file" 'Independent review trigger')" = 'issue-implementation-or-protected-change' ||
  fail 'independent review trigger is incomplete'
test "$(single_field "$team_file" 'Review independence')" = required ||
  fail 'review independence is not required'
test "$(single_field "$team_file" 'Remote mutation executor')" = 'primary agent' ||
  fail 'delegated remote mutation is not closed'
require_sections "$team_file" '## Direct work
## Co-author
## Independent reviewer
## Provider boundary'

require_bounded_markdown "$authority_file" 180 18432
test "$(sed -n '1p' "$authority_file")" = '# ai4X Work Authority' ||
  fail 'unexpected work-authority title'
test "$(single_field "$authority_file" Schema)" = 'ai4x-work-authority-v1' ||
  fail 'unknown work-authority schema'
test "$(single_field "$authority_file" 'Risk paths')" = 'Routine | Significant | Protected' ||
  fail 'risk paths are not closed'
for field in Ready Merge Done; do
  test "$(single_field "$authority_file" "$field authority")" = 'Product Owner' ||
    fail "$field authority is not Product Owner exclusive"
done
test "$(single_field "$authority_file" 'Technical permission grants authority')" = no ||
  fail 'technical permission is conflated with governance authority'
test "$(single_field "$authority_file" 'Remote actor attribution')" = 'actual actor' ||
  fail 'provider actor attribution is not preserved'
require_sections "$authority_file" '## Independent dimensions
## Risk paths
## Atomic work-unit authority
## Work envelope and exact effects
## Identity and permission separation
## Program boundary'

checkout_count=$(grep -c 'uses: actions/checkout@' "$workflow_file" || true)
credential_boundary_count=$(grep -c 'persist-credentials: false' "$workflow_file" || true)
test "$checkout_count" -gt 0 || fail 'CI has no checkout boundary to verify'
test "$checkout_count" -eq "$credential_boundary_count" ||
  fail 'every CI checkout must disable persisted credentials'

if test -e "$active_file"; then
  test -f "$active_file" || fail 'ACTIVE pointer is not a regular file'
  require_bounded_markdown "$active_file" 8 1024
  test "$(sed -n '1p' "$active_file")" = '# ai4X Active Worktree Pointer' ||
    fail 'unexpected ACTIVE pointer title'
  test "$(single_field "$active_file" Schema)" = 'ai4x-active-worktree-pointer-v1' ||
    fail 'unknown ACTIVE pointer schema'
  active_worktree=$(single_field "$active_file" Worktree)
  case "$active_worktree" in
    ''|/*|*\\*|..|../*|*/../*|*/..) fail 'ACTIVE worktree path is not safe and relative' ;;
  esac
  active_branch=$(single_field "$active_file" 'Expected Branch')
  git check-ref-format --branch "$active_branch" >/dev/null 2>&1 ||
    fail 'ACTIVE branch is not a valid branch name'
  test "$active_branch" != trunk || fail 'ACTIVE must point to a non-trunk branch'
  test -z "$(grep '^## ' "$active_file" || true)" ||
    fail 'ACTIVE contains unowned sections'
fi

if test -z "$observed_branch"; then
  observed_branch=$(git -C "$repository" branch --show-current 2>/dev/null || true)
fi
test -n "$observed_branch" || fail 'observed branch is unavailable'

if test -z "$observed_clean"; then
  if test -z "$(git -C "$repository" status --porcelain=v1 2>/dev/null)"; then
    observed_clean=clean
  else
    observed_clean=dirty
  fi
fi
case "$observed_clean" in clean|dirty) ;; *) fail 'observed worktree state must be clean or dirty' ;; esac

if test "$observed_branch" = "$state_branch"; then
  printf '[ai4x] session-continuity: active (%s, %s)\n' "$owning_issue" "$state_branch"
elif test "$observed_branch" = trunk && test "$observed_clean" = clean; then
  printf '[ai4x] session-continuity: dormant (%s applies on %s)\n' "$owning_issue" "$state_branch"
else
  fail "STATE bound to $state_branch does not apply on $observed_branch ($observed_clean)"
fi
