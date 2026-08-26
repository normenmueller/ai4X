#!/bin/sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "usage: $0 CHECKPOINT_DIRECTORY" >&2
  exit 64
fi

checkpoint_directory=$1
script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repository=$(CDPATH= cd -- "$script_directory/../.." && pwd)
verification_root="$repository/.ai4x/local/work-continuity"
tracked_include="$repository/.ai4x/operations/work-continuity/INCLUDE.txt"
. "$script_directory/common.sh"

for required_file in all-refs.bundle local-continuity.tar.gz RECOVERY.md INCLUDE.txt MANIFEST.txt SHA256SUMS; do
  if [ ! -f "$checkpoint_directory/$required_file" ]; then
    echo "missing checkpoint file: $required_file" >&2
    exit 66
  fi
done

mkdir -p "$verification_root"
verification_directory=$(mktemp -d "$verification_root/verification.XXXXXX")

cleanup() {
  case "$verification_directory" in
    "$verification_root"/verification.*) rm -rf "$verification_directory" ;;
    *) echo "refusing unsafe verification cleanup: $verification_directory" >&2 ;;
  esac
}
trap cleanup EXIT HUP INT TERM

printf '%s\n' \
  INCLUDE.txt \
  MANIFEST.txt \
  RECOVERY.md \
  all-refs.bundle \
  local-continuity.tar.gz \
  > "$verification_directory/expected-checksum-files.txt"

if grep -Eqv '^[0-9a-f]{64}  [A-Za-z0-9.-]+$' "$checkpoint_directory/SHA256SUMS"; then
  echo "checksum manifest contains an invalid entry" >&2
  exit 65
fi

awk '{ print $2 }' "$checkpoint_directory/SHA256SUMS" \
  | LC_ALL=C sort > "$verification_directory/checksum-files.txt"

if ! cmp -s "$verification_directory/expected-checksum-files.txt" "$verification_directory/checksum-files.txt"; then
  echo "checksum manifest does not name the exact expected files" >&2
  exit 65
fi

(
  cd "$checkpoint_directory"
  shasum -a 256 -c SHA256SUMS
)

printf '%s\n' \
  branch \
  created_at \
  head \
  issue \
  origin_trunk \
  repository \
  schema \
  slot \
  tracked_worktree \
  upstream \
  upstream_head \
  > "$verification_directory/expected-manifest-fields.txt"

awk -F= '{ print $1 }' "$checkpoint_directory/MANIFEST.txt" \
  | LC_ALL=C sort > "$verification_directory/manifest-fields.txt"

if ! cmp -s "$verification_directory/expected-manifest-fields.txt" "$verification_directory/manifest-fields.txt"; then
  echo "manifest fields are incomplete, duplicated, or unexpected" >&2
  exit 65
fi

manifest_value() {
  awk -F= -v key="$1" '$1 == key { sub(/^[^=]*=/, ""); print }' "$checkpoint_directory/MANIFEST.txt"
}

schema=$(manifest_value schema)
issue=$(manifest_value issue)
slot=$(manifest_value slot)
repository_url=$(manifest_value repository)
branch=$(manifest_value branch)
head_revision=$(manifest_value head)
upstream=$(manifest_value upstream)
upstream_revision=$(manifest_value upstream_head)
origin_trunk=$(manifest_value origin_trunk)
tracked_worktree=$(manifest_value tracked_worktree)
created_at=$(manifest_value created_at)

if [ "$schema" != ai4x-project-work-continuity-bootstrap-v1 ] \
  || [ "$issue" != 181 ] \
  || [ "$tracked_worktree" != clean ]; then
  echo "manifest has an unsupported schema, issue, or worktree state" >&2
  exit 65
fi

case "$slot" in
  slot-a|slot-b|slot-c) ;;
  *) echo "manifest has an invalid slot" >&2; exit 65 ;;
esac

if ! printf '%s\n' "$created_at" | grep -Eq '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$'; then
  echo "manifest has an invalid creation time" >&2
  exit 65
fi

require_safe_repository_url "$repository_url"

if ! git check-ref-format --branch "$branch" > /dev/null \
  || [ "$upstream" != "origin/$branch" ]; then
  echo "manifest has an invalid branch or upstream" >&2
  exit 65
fi

for revision in "$head_revision" "$upstream_revision" "$origin_trunk"; do
  if ! printf '%s\n' "$revision" | grep -Eq '^[0-9a-f]{40}$'; then
    echo "manifest has an invalid Git revision" >&2
    exit 65
  fi
done

if [ "$head_revision" != "$upstream_revision" ]; then
  echo "manifest head does not equal upstream head" >&2
  exit 65
fi

git bundle verify "$checkpoint_directory/all-refs.bundle"
bundle_branch=$(git bundle list-heads "$checkpoint_directory/all-refs.bundle" "refs/heads/$branch" | awk '{ print $1 }')
bundle_trunk=$(git bundle list-heads "$checkpoint_directory/all-refs.bundle" refs/remotes/origin/trunk | awk '{ print $1 }')

if [ "$bundle_branch" != "$head_revision" ] || [ "$bundle_trunk" != "$origin_trunk" ]; then
  echo "bundle refs do not match the manifest" >&2
  exit 65
fi

validate_include_syntax "$checkpoint_directory/INCLUDE.txt"

if ! cmp -s "$tracked_include" "$checkpoint_directory/INCLUDE.txt"; then
  echo "checkpoint inclusion manifest differs from tracked policy" >&2
  exit 65
fi

tar -tzf "$checkpoint_directory/local-continuity.tar.gz" > "$verification_directory/archive.txt"
LC_ALL=C sort "$verification_directory/archive.txt" > "$verification_directory/archive-sorted.txt"

if ! cmp -s "$checkpoint_directory/INCLUDE.txt" "$verification_directory/archive-sorted.txt"; then
  echo "archive entries do not equal INCLUDE.txt" >&2
  exit 65
fi

tar -tvzf "$checkpoint_directory/local-continuity.tar.gz" > "$verification_directory/archive-verbose.txt"
if ! awk 'substr($0, 1, 1) == "-" { next } { exit 1 }' "$verification_directory/archive-verbose.txt"; then
  echo "archive contains a non-regular member" >&2
  exit 65
fi

echo "verified: $checkpoint_directory"
