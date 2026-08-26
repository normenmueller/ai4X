#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repository=$(CDPATH= cd -- "$script_directory/../../.." && pwd)
verifier="$repository/util/work-continuity/verify-checkpoint.sh"
common="$repository/util/work-continuity/common.sh"
include_file="$repository/.ai4x/operations/work-continuity/INCLUDE.txt"
scratch_parent="$repository/.ai4x/local/verification"
mkdir -p "$scratch_parent"
scratch_root=$(mktemp -d "$scratch_parent/work-continuity.XXXXXX")

cleanup() {
  case "$scratch_root" in
    "$scratch_parent"/work-continuity.*) rm -rf "$scratch_root" ;;
    *) echo "refusing unsafe test cleanup: $scratch_root" >&2 ;;
  esac
}
trap cleanup EXIT HUP INT TERM

. "$common"

write_checksums() (
  checkpoint=$1
  cd "$checkpoint"
  shasum -a 256 all-refs.bundle local-continuity.tar.gz RECOVERY.md INCLUDE.txt MANIFEST.txt > SHA256SUMS
)

copy_checkpoint() {
  source_checkpoint=$1
  target_checkpoint=$2
  cp -R "$source_checkpoint" "$target_checkpoint"
}

expect_failure() {
  name=$1
  shift

  if "$@" > "$scratch_root/$name.out" 2>&1; then
    echo "expected failure was accepted: $name" >&2
    exit 1
  fi
}

valid="$scratch_root/valid"
mkdir -p "$valid"
fixture_repository="$scratch_root/git-source"
mkdir -p "$fixture_repository"
git -C "$fixture_repository" init -q
git -C "$fixture_repository" config user.name 'ai4X Work Continuity Test'
git -C "$fixture_repository" config user.email 'work-continuity-test@invalid.example'
printf 'fixture\n' > "$fixture_repository/content"
git -C "$fixture_repository" add content
git -C "$fixture_repository" commit -q -m fixture
branch=fixture-work-continuity
git -C "$fixture_repository" branch -m "$branch"
head_revision=$(git -C "$fixture_repository" rev-parse HEAD)
upstream_revision=$head_revision
origin_trunk=$head_revision
git -C "$fixture_repository" update-ref refs/remotes/origin/trunk "$origin_trunk"

fixture_include="$scratch_root/fixture-INCLUDE.txt"
printf '%s\n' \
  '.ai4x/local/session-scratch/102/epic-review.md' \
  '.ai4x/local/session-scratch/103/epic-body.md' \
  '.ai4x/local/session-scratch/103/first-story-body.md' \
  '.ai4x/local/session-scratch/103/reference/ai4x-logo/ai4X Logo.jpg' \
  '.ai4x/local/session-scratch/103/reference/complete-sfe-run-interaction.md' \
  '.ai4x/local/session-scratch/103/reference/complete-sfe-run-interaction.png' \
  '.ai4x/local/session-scratch/103/reference/complete-sfe-run-interaction.tex' \
  '.ai4x/local/session-scratch/103/refinement-comment.md' \
  '.ai4x/local/session-scratch/180/work-continuity-portfolio-and-project-instance.md' \
  '.ai4x/local/session-scratch/CURRENT-HANDOFF.md' \
  > "$fixture_include"

if ! cmp -s "$include_file" "$fixture_include"; then
  echo 'test fixture inclusion policy differs from tracked policy' >&2
  exit 1
fi

while IFS= read -r included_path; do
  mkdir -p "$(dirname -- "$fixture_repository/$included_path")"
  printf 'fixture: %s\n' "$included_path" > "$fixture_repository/$included_path"
done < "$fixture_include"

git -C "$fixture_repository" bundle create "$valid/all-refs.bundle" --all
tar -czf "$valid/local-continuity.tar.gz" -C "$fixture_repository" -T "$fixture_include"
cp "$repository/.ai4x/operations/work-continuity/RECOVERY.md" "$valid/RECOVERY.md"
cp "$fixture_include" "$valid/INCLUDE.txt"
printf '%s\n' \
  'schema=ai4x-project-work-continuity-bootstrap-v1' \
  'issue=181' \
  'slot=slot-a' \
  'created_at=2026-08-26T00:00:00Z' \
  'repository=git@github.com:normenmueller/ai4X.git' \
  "branch=$branch" \
  "head=$head_revision" \
  "upstream=origin/$branch" \
  "upstream_head=$upstream_revision" \
  "origin_trunk=$origin_trunk" \
  'tracked_worktree=clean' \
  > "$valid/MANIFEST.txt"
write_checksums "$valid"
"$verifier" "$valid" > /dev/null

truncated_checksums="$scratch_root/truncated-checksums"
copy_checkpoint "$valid" "$truncated_checksums"
sed -n '1,4p' "$valid/SHA256SUMS" > "$truncated_checksums/SHA256SUMS"
expect_failure truncated-checksums "$verifier" "$truncated_checksums"

external_checksum="$scratch_root/external-checksum"
copy_checkpoint "$valid" "$external_checksum"
printf '%064d  ../outside\n' 0 >> "$external_checksum/SHA256SUMS"
expect_failure external-checksum "$verifier" "$external_checksum"

wrong_manifest="$scratch_root/wrong-manifest"
copy_checkpoint "$valid" "$wrong_manifest"
sed 's/^head=.*/head=0000000000000000000000000000000000000000/' \
  "$valid/MANIFEST.txt" > "$wrong_manifest/MANIFEST.txt"
write_checksums "$wrong_manifest"
expect_failure wrong-manifest "$verifier" "$wrong_manifest"

traversal="$scratch_root/traversal"
copy_checkpoint "$valid" "$traversal"
sed '1s|.*|.ai4x/local/../escape|' "$valid/INCLUDE.txt" > "$traversal/INCLUDE.txt"
write_checksums "$traversal"
expect_failure path-traversal "$verifier" "$traversal"

duplicate="$scratch_root/duplicate"
copy_checkpoint "$valid" "$duplicate"
first_entry=$(sed -n '1p' "$valid/INCLUDE.txt")
printf '%s\n' "$first_entry" >> "$duplicate/INCLUDE.txt"
write_checksums "$duplicate"
expect_failure duplicate-include "$verifier" "$duplicate"

symlink_archive="$scratch_root/symlink-archive"
copy_checkpoint "$valid" "$symlink_archive"
archive_root="$scratch_root/archive-root"
mkdir -p "$archive_root"
tar -xzf "$valid/local-continuity.tar.gz" -C "$archive_root"
symlink_member="$archive_root/.ai4x/local/session-scratch/102/epic-review.md"
rm "$symlink_member"
ln -s ../CURRENT-HANDOFF.md "$symlink_member"
tar -czf "$symlink_archive/local-continuity.tar.gz" -C "$archive_root" -T "$fixture_include"
write_checksums "$symlink_archive"
expect_failure symlink-archive "$verifier" "$symlink_archive"

source_root="$scratch_root/source-root"
mkdir -p "$source_root/.ai4x/local/real"
printf 'safe\n' > "$source_root/.ai4x/local/real/file"
ln -s real "$source_root/.ai4x/local/link"
printf '.ai4x/local/link/file\n' > "$scratch_root/symlink-parent-include.txt"
expect_failure symlink-parent validate_local_sources "$source_root" "$scratch_root/symlink-parent-include.txt"

root_symlink_source="$scratch_root/root-symlink-source"
mkdir -p "$root_symlink_source/.ai4x" "$root_symlink_source/real-local/real"
printf 'unsafe\n' > "$root_symlink_source/real-local/real/file"
ln -s ../../real-local "$root_symlink_source/.ai4x/local"
printf '.ai4x/local/real/file\n' > "$scratch_root/symlink-root-include.txt"
expect_failure symlink-root validate_local_sources "$root_symlink_source" "$scratch_root/symlink-root-include.txt"
expect_failure credential-url require_safe_repository_url 'https://token@github.com/normenmueller/ai4X.git'

echo '[ai4x] work-continuity-test: passed'
