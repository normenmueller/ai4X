#!/bin/sh

set -eu

repository_root=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
source_file="$repository_root/doc/diagrams/need-to-capability.tex"
build_directory="$repository_root/.ai4x/local/diagram-build/need-to-capability"
output_stem=need-to-capability

command -v pdflatex >/dev/null 2>&1 || {
  echo '[ai4x] ERROR pdflatex is required to render the diagram' >&2
  exit 2
}
command -v pdftoppm >/dev/null 2>&1 || {
  echo '[ai4x] ERROR pdftoppm is required to render the diagram' >&2
  exit 2
}

mkdir -p "$build_directory"
cd "$repository_root/doc/diagrams"

pdflatex \
  -interaction=nonstopmode \
  -halt-on-error \
  -output-directory "$build_directory" \
  "$source_file" >/dev/null

pdftoppm \
  -png \
  -r 240 \
  -singlefile \
  "$build_directory/$output_stem.pdf" \
  "$repository_root/doc/diagrams/$output_stem"

echo '[ai4x] rendered doc/diagrams/need-to-capability.png'
