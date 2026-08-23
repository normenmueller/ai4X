#!/bin/sh

set -eu

script_directory=$(CDPATH= cd "$(dirname "$0")" && pwd -P)
repository_root=$(CDPATH= cd "$script_directory/../../.." && pwd -P)
checker="$repository_root/util/repository/verify-foundation.sh"
scratch_parent="$repository_root/.ai4x/local/verification"

mkdir -p "$scratch_parent"
scratch_root=$(mktemp -d "$scratch_parent/foundation-architecture.XXXXXX")

cleanup() {
  case "$scratch_root" in
    "$repository_root"/.ai4x/local/verification/foundation-architecture.*)
      rm -rf "$scratch_root"
      ;;
    *)
      printf '[ai4x] ERROR foundation-test: unsafe scratch path: %s\n' "$scratch_root" >&2
      ;;
  esac
}
trap cleanup 0 HUP INT TERM

base_root="$scratch_root/base"
mkdir -p "$base_root/src/foundation/core"
mkdir -p "$base_root/src/foundation/context-protocol"
mkdir -p "$base_root/src/foundation/declaration-protocol"
mkdir -p "$base_root/src/foundation/generation"
mkdir -p "$base_root/src/domains"
mkdir -p "$base_root/src/interfaces"
mkdir -p "$base_root/src/resources"

cp "$repository_root/src/cabal.project" "$base_root/src/cabal.project"
cp "$repository_root/src/foundation/core/ai4x-core.cabal" "$base_root/src/foundation/core/ai4x-core.cabal"
cp "$repository_root/src/foundation/context-protocol/ai4x-context-protocol.cabal" "$base_root/src/foundation/context-protocol/ai4x-context-protocol.cabal"
cp "$repository_root/src/foundation/declaration-protocol/ai4x-declaration-protocol.cabal" "$base_root/src/foundation/declaration-protocol/ai4x-declaration-protocol.cabal"
cp "$repository_root/src/foundation/generation/ai4x-generation.cabal" "$base_root/src/foundation/generation/ai4x-generation.cabal"

{
  printf 'REQUIRED_FILES := \\\n'
  printf '\tMakefile \\\n'
  printf '\tsrc/cabal.project \\\n'
  printf '\tsrc/foundation/core/ai4x-core.cabal \\\n'
  printf '\tsrc/foundation/context-protocol/ai4x-context-protocol.cabal \\\n'
  printf '\tsrc/foundation/declaration-protocol/ai4x-declaration-protocol.cabal \\\n'
  printf '\tsrc/foundation/generation/ai4x-generation.cabal\n'
} >"$base_root/Makefile"

git -C "$base_root" init -q
git -C "$base_root" add Makefile src

if ! "$checker" "$base_root" >/dev/null; then
  printf '[ai4x] ERROR foundation-test: positive architecture fixture was rejected\n' >&2
  exit 2
fi

copy_case() {
  case_name=$1
  case_root="$scratch_root/$case_name"
  mkdir -p "$case_root"
  cp -R "$base_root/." "$case_root"
  printf '%s\n' "$case_root"
}

expect_failure() {
  case_root=$1
  category=$2
  subject=$3

  if output=$("$checker" "$case_root" 2>&1); then
    printf '[ai4x] ERROR foundation-test: mutation was accepted: %s\n' "$case_root" >&2
    exit 2
  fi

  case "$output" in
    *"foundation:$category: $subject:"*) ;;
    *)
      printf '[ai4x] ERROR foundation-test: unexpected defect for %s\n%s\n' "$case_root" "$output" >&2
      exit 2
      ;;
  esac
}

case_root=$(copy_case missing-workspace-package)
awk '$0 !~ /^[[:space:]]+foundation\/generation[[:space:]]*$/' "$case_root/src/cabal.project" >"$case_root/project.new"
mv "$case_root/project.new" "$case_root/src/cabal.project"
expect_failure "$case_root" workspace src/cabal.project

case_root=$(copy_case duplicate-workspace-package)
awk '
  !inserted && /^[[:space:]]*$/ {
    print "  foundation/core"
    inserted = 1
  }
  { print }
' "$case_root/src/cabal.project" >"$case_root/project.new"
mv "$case_root/project.new" "$case_root/src/cabal.project"
expect_failure "$case_root" workspace src/cabal.project

case_root=$(copy_case forbidden-dependency)
awk '
  !inserted && /^    , cryptohash-sha256/ {
    print "    , ai4x-generation"
    inserted = 1
  }
  { print }
' "$case_root/src/foundation/core/ai4x-core.cabal" >"$case_root/core.new"
mv "$case_root/core.new" "$case_root/src/foundation/core/ai4x-core.cabal"
expect_failure "$case_root" dependency src/foundation/core/ai4x-core.cabal

case_root=$(copy_case component-qualified-forbidden-dependency)
awk '
  !inserted && /^    , cryptohash-sha256/ {
    print "    , ai4x-generation:backdoor"
    inserted = 1
  }
  { print }
' "$case_root/src/foundation/core/ai4x-core.cabal" >"$case_root/core.new"
mv "$case_root/core.new" "$case_root/src/foundation/core/ai4x-core.cabal"
expect_failure "$case_root" dependency src/foundation/core/ai4x-core.cabal

case_root=$(copy_case major-bound-forbidden-dependency)
awk '
  !inserted && /^    , cryptohash-sha256/ {
    print "    , ai4x-generation^>=0.1"
    inserted = 1
  }
  { print }
' "$case_root/src/foundation/core/ai4x-core.cabal" >"$case_root/core.new"
mv "$case_root/core.new" "$case_root/src/foundation/core/ai4x-core.cabal"
expect_failure "$case_root" dependency src/foundation/core/ai4x-core.cabal

case_root=$(copy_case case-variant-forbidden-dependency)
awk '
  !inserted && /^    , cryptohash-sha256/ {
    print "    , AI4X-generation"
    inserted = 1
  }
  { print }
' "$case_root/src/foundation/core/ai4x-core.cabal" >"$case_root/core.new"
mv "$case_root/core.new" "$case_root/src/foundation/core/ai4x-core.cabal"
expect_failure "$case_root" dependency src/foundation/core/ai4x-core.cabal

case_root=$(copy_case indirect-forbidden-dependency)
awk '
  { print }
  !inserted && /^common language-and-warnings$/ {
    print "  build-depends: ai4x-generation"
    inserted = 1
  }
' "$case_root/src/foundation/core/ai4x-core.cabal" >"$case_root/core.new"
mv "$case_root/core.new" "$case_root/src/foundation/core/ai4x-core.cabal"
expect_failure "$case_root" dependency src/foundation/core/ai4x-core.cabal

case_root=$(copy_case exposed-internal-module)
awk '
  {
    sub(/^  exposed-modules: AI4X.Core$/, "  exposed-modules: AI4X.Core AI4X.Core.Internal.Identifier")
    print
  }
' "$case_root/src/foundation/core/ai4x-core.cabal" >"$case_root/core.new"
mv "$case_root/core.new" "$case_root/src/foundation/core/ai4x-core.cabal"
expect_failure "$case_root" surface src/foundation/core/ai4x-core.cabal

case_root=$(copy_case reexported-module)
awk '
  { print }
  !inserted && /^  exposed-modules: AI4X.Generation$/ {
    print "  reexported-modules: ai4x-core:AI4X.Core"
    inserted = 1
  }
' "$case_root/src/foundation/generation/ai4x-generation.cabal" >"$case_root/generation.new"
mv "$case_root/generation.new" "$case_root/src/foundation/generation/ai4x-generation.cabal"
expect_failure "$case_root" surface src/foundation/generation/ai4x-generation.cabal

case_root=$(copy_case case-variant-reexported-module)
awk '
  { print }
  !inserted && /^  exposed-modules: AI4X.Generation$/ {
    print "  Reexported-Modules: ai4x-core:AI4X.Core"
    inserted = 1
  }
' "$case_root/src/foundation/generation/ai4x-generation.cabal" >"$case_root/generation.new"
mv "$case_root/generation.new" "$case_root/src/foundation/generation/ai4x-generation.cabal"
expect_failure "$case_root" surface src/foundation/generation/ai4x-generation.cabal

case_root=$(copy_case conditional-exposed-module)
awk '
  !declared && /^library$/ {
    print "flag backdoor"
    print "  default: False"
    print "  manual: True"
    print ""
    declared = 1
  }
  { print }
  !inserted && /^  hs-source-dirs: src$/ {
    print "  if flag(backdoor)"
    print "    exposed-modules: AI4X.Core"
    inserted = 1
  }
' "$case_root/src/foundation/generation/ai4x-generation.cabal" >"$case_root/generation.new"
mv "$case_root/generation.new" "$case_root/src/foundation/generation/ai4x-generation.cabal"
expect_failure "$case_root" surface src/foundation/generation/ai4x-generation.cabal

case_root=$(copy_case conditional-non-internal-module)
awk '
  !declared && /^library$/ {
    print "flag backdoor"
    print "  default: False"
    print "  manual: True"
    print ""
    declared = 1
  }
  { print }
  !inserted && /^  hs-source-dirs: src$/ {
    print "  if flag(backdoor)"
    print "    other-modules: Outside.Internal"
    inserted = 1
  }
' "$case_root/src/foundation/core/ai4x-core.cabal" >"$case_root/core.new"
mv "$case_root/core.new" "$case_root/src/foundation/core/ai4x-core.cabal"
expect_failure "$case_root" surface src/foundation/core/ai4x-core.cabal

case_root=$(copy_case named-sublibrary)
{
  printf '\nlibrary backdoor\n'
  printf '  exposed-modules: AI4X.Core\n'
  printf '  build-depends: base\n'
} >>"$case_root/src/foundation/core/ai4x-core.cabal"
expect_failure "$case_root" surface src/foundation/core/ai4x-core.cabal

case_root=$(copy_case case-variant-component)
{
  printf '\nExecutable backdoor\n'
  printf '  main-is: Main.hs\n'
  printf '  build-depends: base\n'
} >>"$case_root/src/foundation/core/ai4x-core.cabal"
expect_failure "$case_root" surface src/foundation/core/ai4x-core.cabal

case_root=$(copy_case unexpected-package)
mkdir -p "$case_root/src/domains/unexpected"
printf 'name: ai4x-unexpected\n' >"$case_root/src/domains/unexpected/ai4x-unexpected.cabal"
expect_failure "$case_root" workspace src/domains/unexpected/ai4x-unexpected.cabal

case_root=$(copy_case later-product-surface)
mkdir -p "$case_root/src/domains/unexpected"
printf 'module Unexpected where\n' >"$case_root/src/domains/unexpected/Product.hs"
expect_failure "$case_root" workspace src/domains/unexpected/Product.hs

case_root=$(copy_case untracked-required-input)
printf '\trequired.txt\n' >>"$case_root/Makefile"
printf 'required fixture\n' >"$case_root/required.txt"
expect_failure "$case_root" tracked-input required.txt

printf '[ai4x] foundation-test: passed\n'
