#!/bin/sh

validate_include_syntax() (
  include_file=$1

  if [ ! -s "$include_file" ]; then
    echo "inclusion manifest is missing or empty: $include_file" >&2
    exit 65
  fi

  if ! LC_ALL=C sort -u "$include_file" | cmp -s - "$include_file"; then
    echo "inclusion manifest must be sorted and contain no duplicates" >&2
    exit 65
  fi

  while IFS= read -r included_path; do
    if ! printf '%s\n' "$included_path" | LC_ALL=C grep -Eq '^\.ai4x/local/[A-Za-z0-9._ /-]+$'; then
      echo "included path contains unsupported characters: $included_path" >&2
      exit 65
    fi

    case "$included_path" in
      .ai4x/local/*) ;;
      *)
        echo "included path is outside .ai4x/local: $included_path" >&2
        exit 65
        ;;
    esac

    case "$included_path" in
      *//*|*/./*|*/../*|*/.|*/..)
        echo "included path is not lexically normalized: $included_path" >&2
        exit 65
        ;;
    esac
  done < "$include_file"
)

validate_local_sources() (
  repository=$1
  include_file=$2

  validate_include_syntax "$include_file"

  while IFS= read -r included_path; do
    relative_path=${included_path#.ai4x/local/}
    prefix="$repository/.ai4x/local"
    previous_ifs=$IFS
    set -f
    IFS=/
    set -- $relative_path
    IFS=$previous_ifs

    for component in "$@"; do
      prefix="$prefix/$component"
      if [ -L "$prefix" ]; then
        echo "included path crosses a symlink: $included_path" >&2
        exit 65
      fi
    done

    if [ ! -f "$repository/$included_path" ]; then
      echo "included path is missing or not a regular file: $included_path" >&2
      exit 66
    fi
  done < "$include_file"
)

require_safe_repository_url() (
  repository_url=$1

  case "$repository_url" in
    git@github.com:normenmueller/ai4X.git|https://github.com/normenmueller/ai4X.git) ;;
    *)
      echo "repository URL is unsupported or may contain credentials" >&2
      exit 65
      ;;
  esac
)
