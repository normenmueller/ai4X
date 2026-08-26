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

(
  cd "$checkpoint_directory"
  shasum -a 256 -c SHA256SUMS
)

git bundle verify "$checkpoint_directory/all-refs.bundle"
tar -tzf "$checkpoint_directory/local-continuity.tar.gz" > "$verification_directory/archive.txt"
sort "$checkpoint_directory/INCLUDE.txt" > "$verification_directory/include.txt"
sort "$verification_directory/archive.txt" > "$verification_directory/archive-sorted.txt"

if ! cmp -s "$verification_directory/include.txt" "$verification_directory/archive-sorted.txt"; then
  echo "archive entries do not equal INCLUDE.txt" >&2
  exit 65
fi

if ! grep -F -x 'schema=ai4x-project-work-continuity-bootstrap-v1' "$checkpoint_directory/MANIFEST.txt" > /dev/null; then
  echo "unsupported checkpoint schema" >&2
  exit 65
fi

if ! grep -F -x 'tracked_worktree=clean' "$checkpoint_directory/MANIFEST.txt" > /dev/null; then
  echo "checkpoint was not created from a clean tracked worktree" >&2
  exit 65
fi

echo "verified: $checkpoint_directory"
