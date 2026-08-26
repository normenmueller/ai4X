#!/bin/sh
set -eu

if [ "$#" -ne 3 ]; then
  echo "usage: $0 REPOSITORY OUTPUT_DIRECTORY SLOT" >&2
  exit 64
fi

repository=$1
output_directory=$2
slot=$3
script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$script_directory/common.sh"

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
repository_url=$(git -C "$repository" remote get-url origin)
created_at=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
include_file="$repository/.ai4x/operations/work-continuity/INCLUDE.txt"
recovery_file="$repository/.ai4x/operations/work-continuity/RECOVERY.md"
verifier="$repository/util/work-continuity/verify-checkpoint.sh"

if [ -z "$branch" ] || ! git check-ref-format --branch "$branch" > /dev/null; then
  echo "checkout has no valid branch" >&2
  exit 65
fi

if [ "$upstream" != "origin/$branch" ] || [ "$head_revision" != "$upstream_revision" ]; then
  echo "HEAD does not equal its expected origin upstream" >&2
  exit 65
fi

for required_input in "$include_file" "$recovery_file" "$verifier"; do
  if [ ! -f "$required_input" ]; then
    echo "missing work-continuity input: $required_input" >&2
    exit 66
  fi
done

require_safe_repository_url "$repository_url"
validate_local_sources "$repository" "$include_file"

output_parent=$(dirname -- "$output_directory")
output_name=$(basename -- "$output_directory")
mkdir -p "$output_parent"
prepared_directory=$(mktemp -d "$output_parent/.${output_name}.prepared.XXXXXX")

cleanup() {
  if [ -n "${prepared_directory:-}" ]; then
    case "$prepared_directory" in
      "$output_parent"/."$output_name".prepared.*) rm -rf "$prepared_directory" ;;
      *) echo "refusing unsafe prepared-output cleanup: $prepared_directory" >&2 ;;
    esac
  fi
}
trap cleanup EXIT HUP INT TERM

git -C "$repository" bundle create "$prepared_directory/all-refs.bundle" --all
tar -czf "$prepared_directory/local-continuity.tar.gz" -C "$repository" -T "$include_file"
cp "$recovery_file" "$prepared_directory/RECOVERY.md"
cp "$include_file" "$prepared_directory/INCLUDE.txt"

printf '%s\n' \
  "schema=ai4x-project-work-continuity-bootstrap-v1" \
  "issue=181" \
  "slot=$slot" \
  "created_at=$created_at" \
  "repository=$repository_url" \
  "branch=$branch" \
  "head=$head_revision" \
  "upstream=$upstream" \
  "upstream_head=$upstream_revision" \
  "origin_trunk=$origin_trunk" \
  "tracked_worktree=clean" \
  > "$prepared_directory/MANIFEST.txt"

(
  cd "$prepared_directory"
  shasum -a 256 all-refs.bundle local-continuity.tar.gz RECOVERY.md INCLUDE.txt MANIFEST.txt > SHA256SUMS
)

"$verifier" "$prepared_directory"
mv "$prepared_directory" "$output_directory"
prepared_directory=
trap - EXIT HUP INT TERM

echo "prepared and verified: $output_directory"
