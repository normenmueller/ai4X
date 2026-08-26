#!/bin/sh
set -eu

if [ "$#" -ne 3 ]; then
  echo "usage: $0 REPOSITORY OUTPUT_DIRECTORY SLOT" >&2
  exit 64
fi

repository=$1
output_directory=$2
slot=$3

case "$slot" in
  slot-a|slot-b|slot-c) ;;
  *)
    echo "unsupported slot: $slot" >&2
    exit 64
    ;;
esac

if [ -e "$output_directory" ]; then
  echo "output already exists: $output_directory" >&2
  exit 73
fi

if [ -n "$(git -C "$repository" status --porcelain=v1 --untracked-files=no)" ]; then
  echo "tracked worktree is not clean" >&2
  exit 65
fi

branch=$(git -C "$repository" branch --show-current)
head_revision=$(git -C "$repository" rev-parse HEAD)
upstream=$(git -C "$repository" rev-parse --abbrev-ref --symbolic-full-name '@{upstream}')
upstream_revision=$(git -C "$repository" rev-parse "$upstream")
origin_trunk=$(git -C "$repository" rev-parse refs/remotes/origin/trunk)
origin_url=$(git -C "$repository" remote get-url origin)
created_at=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
include_file="$repository/.ai4x/operations/work-continuity/INCLUDE.txt"
recovery_file="$repository/.ai4x/operations/work-continuity/RECOVERY.md"
verifier="$repository/util/work-continuity/verify-checkpoint.sh"

if [ "$head_revision" != "$upstream_revision" ]; then
  echo "HEAD does not equal its upstream" >&2
  exit 65
fi

for required_input in "$include_file" "$recovery_file" "$verifier"; do
  if [ ! -f "$required_input" ]; then
    echo "missing work-continuity input: $required_input" >&2
    exit 66
  fi
done

while IFS= read -r included_path; do
  case "$included_path" in
    .ai4x/local/*) ;;
    *)
      echo "included path is outside .ai4x/local: $included_path" >&2
      exit 65
      ;;
  esac

  if [ ! -f "$repository/$included_path" ] || [ -L "$repository/$included_path" ]; then
    echo "included path is missing, not regular, or a symlink: $included_path" >&2
    exit 66
  fi
done < "$include_file"

mkdir -p "$output_directory"
git -C "$repository" bundle create "$output_directory/all-refs.bundle" --all
tar -czf "$output_directory/local-continuity.tar.gz" -C "$repository" -T "$include_file"
cp "$recovery_file" "$output_directory/RECOVERY.md"
cp "$include_file" "$output_directory/INCLUDE.txt"

printf '%s\n' \
  "schema=ai4x-project-work-continuity-bootstrap-v1" \
  "issue=181" \
  "slot=$slot" \
  "created_at=$created_at" \
  "repository=$origin_url" \
  "branch=$branch" \
  "head=$head_revision" \
  "upstream=$upstream" \
  "upstream_head=$upstream_revision" \
  "origin_trunk=$origin_trunk" \
  "tracked_worktree=clean" \
  > "$output_directory/MANIFEST.txt"

(
  cd "$output_directory"
  shasum -a 256 all-refs.bundle local-continuity.tar.gz RECOVERY.md INCLUDE.txt MANIFEST.txt > SHA256SUMS
)

"$verifier" "$output_directory"
