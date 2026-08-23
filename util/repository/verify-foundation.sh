#!/bin/sh

set -eu

fail() {
  category=$1
  subject=$2
  detail=$3
  printf '[ai4x] ERROR foundation:%s: %s: %s\n' "$category" "$subject" "$detail" >&2
  exit 2
}

if [ "$#" -gt 1 ]; then
  fail workspace arguments 'expected at most one repository root'
fi

requested_root=${1:-.}
if ! repository_root=$(CDPATH= cd "$requested_root" 2>/dev/null && pwd -P); then
  fail workspace "$requested_root" 'repository root is unavailable'
fi

project_file=src/cabal.project
makefile=Makefile

[ -f "$repository_root/$project_file" ] || fail workspace "$project_file" 'file is missing'
[ -f "$repository_root/$makefile" ] || fail tracked-input "$makefile" 'file is missing'

project_packages() {
  awk '
    /^packages:[[:space:]]*$/ {
      active = 1
      next
    }
    active && /^[[:space:]]*$/ {
      exit
    }
    active && /^[^[:space:]]/ {
      exit
    }
    active {
      line = $0
      sub(/^[[:space:]]+/, "", line)
      sub(/[[:space:]]*\\[[:space:]]*$/, "", line)
      if (line != "") {
        print line
      }
    }
  ' "$repository_root/$project_file"
}

extract_cabal_field() {
  cabal_file=$1
  wanted_section=$2
  wanted_field=$3

  awk -v wanted_section="$wanted_section" -v wanted_field="$wanted_field" '
    function emit(line) {
      sub(/^[[:space:],]*/, "", line)
      if (line != "") {
        print line
      }
    }
    /^[^[:space:]]/ {
      collecting = 0
      if ($0 == "library") {
        current_section = "library"
      } else if ($0 ~ /^test-suite[[:space:]]/) {
        current_section = "test-suite"
      } else {
        current_section = ""
      }
    }
    current_section == wanted_section {
      field_pattern = "^  " wanted_field ":[[:space:]]*"
      if ($0 ~ field_pattern) {
        line = $0
        sub(field_pattern, "", line)
        emit(line)
        collecting = 1
        next
      }
      if (collecting) {
        if ($0 ~ /^  [[:alnum:]-]+:/) {
          collecting = 0
          next
        }
        if ($0 ~ /^[^[:space:]]/) {
          exit
        }
        emit($0)
      }
    }
  ' "$cabal_file"
}

normalize_modules() {
  awk '
    {
      gsub(/,/, " ")
      for (field_index = 1; field_index <= NF; field_index += 1) {
        print $field_index
      }
    }
  '
}

local_dependencies() {
  awk '
    {
      gsub(/[,()]/, " ")
      for (field_index = 1; field_index <= NF; field_index += 1) {
        dependency = tolower($field_index)
        sub(/[:^<>=].*$/, "", dependency)
        if (dependency ~ /^ai4x-[[:alnum:]-]+$/) {
          print dependency
        }
      }
    }
  '
}

all_local_dependencies() {
  awk '
    /^name:[[:space:]]*/ || /^test-suite[[:space:]]/ {
      next
    }
    {
      line = $0
      sub(/--.*/, "", line)
      gsub(/[,()]/, " ", line)
      field_count = split(line, fields, /[[:space:]]+/)
      for (field_index = 1; field_index <= field_count; field_index += 1) {
        dependency = tolower(fields[field_index])
        sub(/[:^<>=].*$/, "", dependency)
        if (dependency ~ /^ai4x-[[:alnum:]-]+$/) {
          print dependency
        }
      }
    }
  '
}

check_components_and_surfaces() {
  relative_cabal=$1
  expected_test_suite=$2
  cabal_file="$repository_root/$relative_cabal"

  components=$(awk '
    {
      lower_line = tolower($0)
    }
    lower_line ~ /^(library|test-suite|executable|foreign-library|benchmark)([[:space:]]|$)/ {
      print $0
    }
  ' "$cabal_file")
  expected_components=$(printf 'library\ntest-suite %s' "$expected_test_suite")
  [ "$components" = "$expected_components" ] || \
    fail surface "$relative_cabal" 'expected exactly one main library and one package test suite'

  surface_shape=$(awk '
    {
      lower_line = tolower($0)
      if (lower_line ~ /^[[:space:]]*exposed-modules[[:space:]]*:/) {
        exposed_count += 1
        if ($0 !~ /^  exposed-modules:[[:space:]]/) {
          noncanonical_count += 1
        }
      }
      if (lower_line ~ /^[[:space:]]*other-modules[[:space:]]*:/) {
        other_count += 1
        if ($0 !~ /^  other-modules:[[:space:]]*$/) {
          noncanonical_count += 1
        }
      }
    }
    END {
      printf "%d %d %d\n", exposed_count + 0, other_count + 0, noncanonical_count + 0
    }
  ' "$cabal_file")
  set -- $surface_shape
  [ "$1" -eq 1 ] && [ "$2" -eq 2 ] && [ "$3" -eq 0 ] || \
    fail surface "$relative_cabal" 'module fields must be canonical and unconditional'

  unsupported_surface=$(awk '
    {
      lower_line = tolower($0)
    }
    lower_line ~ /^[[:space:]]*(reexported-modules|signatures|mixins|virtual-modules)[[:space:]]*:/ {
      field = $0
      sub(/^[[:space:]]*/, "", field)
      sub(/[[:space:]]*:.*$/, "", field)
      print tolower(field)
      exit
    }
  ' "$cabal_file")
  [ -z "$unsupported_surface" ] || \
    fail surface "$relative_cabal" "unsupported public-surface field $unsupported_surface"
}

check_allowed_dependencies() {
  relative_cabal=$1
  section=$2
  allowed=$3
  dependencies=$(extract_cabal_field "$repository_root/$relative_cabal" "$section" build-depends | local_dependencies)

  while IFS= read -r dependency; do
    [ -n "$dependency" ] || continue
    case " $allowed " in
      *" $dependency "*) ;;
      *) fail dependency "$relative_cabal" "$section depends on forbidden local package $dependency" ;;
    esac
  done <<EOF
$dependencies
EOF
}

check_package() {
  package_directory=$1
  package_name=$2
  facade=$3
  library_dependencies=$4
  test_dependencies=$5
  relative_cabal="src/foundation/$package_directory/ai4x-$package_directory.cabal"
  cabal_file="$repository_root/$relative_cabal"

  [ -f "$cabal_file" ] || fail workspace "$relative_cabal" 'package declaration is missing'

  actual_name=$(awk '/^name:[[:space:]]*/ { sub(/^name:[[:space:]]*/, ""); print; exit }' "$cabal_file")
  [ "$actual_name" = "$package_name" ] || fail workspace "$relative_cabal" "expected package name $package_name"

  check_components_and_surfaces "$relative_cabal" "ai4x-$package_directory-test"

  exposed_modules=$(extract_cabal_field "$cabal_file" library exposed-modules | normalize_modules)
  [ "$exposed_modules" = "$facade" ] || fail surface "$relative_cabal" "expected sole exposed module $facade"

  internal_modules=$(extract_cabal_field "$cabal_file" library other-modules | normalize_modules)
  [ -n "$internal_modules" ] || fail surface "$relative_cabal" 'library implementation modules are missing'
  while IFS= read -r module_name; do
    [ -n "$module_name" ] || continue
    case "$module_name" in
      "$facade".Internal.*) ;;
      *) fail surface "$relative_cabal" "implementation module is outside $facade.Internal: $module_name" ;;
    esac
  done <<EOF
$internal_modules
EOF

  check_allowed_dependencies "$relative_cabal" library "$library_dependencies"
  check_allowed_dependencies "$relative_cabal" test-suite "$test_dependencies"

  direct_dependencies=$(
    {
      extract_cabal_field "$cabal_file" library build-depends
      extract_cabal_field "$cabal_file" test-suite build-depends
    } | local_dependencies | LC_ALL=C sort
  )
  declared_dependencies=$(all_local_dependencies <"$cabal_file" | LC_ALL=C sort)
  [ "$declared_dependencies" = "$direct_dependencies" ] || \
    fail dependency "$relative_cabal" 'local dependencies must be declared directly in the library or test suite'
}

expected_packages='foundation/core
foundation/context-protocol
foundation/declaration-protocol
foundation/generation'
actual_packages=$(project_packages)

while IFS= read -r package_path; do
  [ -n "$package_path" ] || continue
  case "$package_path" in
    foundation/core | foundation/context-protocol | foundation/declaration-protocol | foundation/generation) ;;
    *) fail workspace "$project_file" "unexpected package entry $package_path" ;;
  esac
done <<EOF
$actual_packages
EOF

while IFS= read -r package_path; do
  occurrence_count=$(printf '%s\n' "$actual_packages" | awk -v target="$package_path" '$0 == target { count += 1 } END { print count + 0 }')
  [ "$occurrence_count" -eq 1 ] || fail workspace "$project_file" "expected one $package_path entry, found $occurrence_count"
done <<EOF
$expected_packages
EOF

while IFS= read -r cabal_file; do
  [ -n "$cabal_file" ] || continue
  relative_cabal=${cabal_file#"$repository_root"/}
  case "$relative_cabal" in
    src/foundation/core/ai4x-core.cabal | \
      src/foundation/context-protocol/ai4x-context-protocol.cabal | \
      src/foundation/declaration-protocol/ai4x-declaration-protocol.cabal | \
      src/foundation/generation/ai4x-generation.cabal) ;;
    *) fail workspace "$relative_cabal" 'unexpected materialized Cabal package' ;;
  esac
done <<EOF
$(find "$repository_root/src" -type f -name '*.cabal' -print | LC_ALL=C sort)
EOF

for foundation_directory in "$repository_root"/src/foundation/*; do
  [ -d "$foundation_directory" ] || continue
  relative_directory=${foundation_directory#"$repository_root"/}
  case "$relative_directory" in
    src/foundation/core | src/foundation/context-protocol | src/foundation/declaration-protocol | src/foundation/generation) ;;
    *) fail workspace "$relative_directory" 'unexpected materialized foundation directory' ;;
  esac
done

for future_root in src/domains src/interfaces src/resources; do
  while IFS= read -r future_file; do
    [ -n "$future_file" ] || continue
    relative_future=${future_file#"$repository_root"/}
    fail workspace "$relative_future" 'later product surface was materialized'
  done <<EOF
$(find "$repository_root/$future_root" -type f ! -name '.gitkeep' -print | LC_ALL=C sort)
EOF
done

check_package core ai4x-core AI4X.Core '' 'ai4x-core'
check_package context-protocol ai4x-context-protocol AI4X.ContextProtocol 'ai4x-core' 'ai4x-core ai4x-context-protocol'
check_package declaration-protocol ai4x-declaration-protocol AI4X.DeclarationProtocol 'ai4x-core' 'ai4x-core ai4x-declaration-protocol'
check_package generation ai4x-generation AI4X.Generation 'ai4x-core ai4x-declaration-protocol' 'ai4x-core ai4x-declaration-protocol ai4x-generation'

if ! git -C "$repository_root" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  fail tracked-input "$repository_root" 'Git index is unavailable'
fi

required_files=$(awk '
  /^REQUIRED_FILES :=/ {
    active = 1
    next
  }
  active && /^[^[:space:]]/ {
    exit
  }
  active {
    line = $0
    sub(/^[[:space:]]+/, "", line)
    sub(/[[:space:]]*\\[[:space:]]*$/, "", line)
    if (line != "") {
      print line
    }
  }
' "$repository_root/$makefile")

while IFS= read -r required_file; do
  [ -n "$required_file" ] || continue
  [ -f "$repository_root/$required_file" ] || fail tracked-input "$required_file" 'required file is missing'
  git -C "$repository_root" ls-files --error-unmatch -- "$required_file" >/dev/null 2>&1 || \
    fail tracked-input "$required_file" 'required file is not tracked'
done <<EOF
$required_files
EOF

while IFS= read -r package_input; do
  [ -n "$package_input" ] || continue
  relative_input=${package_input#"$repository_root"/}
  git -C "$repository_root" ls-files --error-unmatch -- "$relative_input" >/dev/null 2>&1 || \
    fail tracked-input "$relative_input" 'materialized package input is not tracked'
done <<EOF
$(find "$repository_root/src/foundation" -type f -print | LC_ALL=C sort)
EOF

printf '[ai4x] foundation: passed\n'
