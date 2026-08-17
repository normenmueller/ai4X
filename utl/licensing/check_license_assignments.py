#!/usr/bin/env python3
"""Enforce ai4X's single, closed-set, path-based licensing authority."""

from __future__ import annotations

import argparse
from pathlib import Path
import re
import subprocess
from typing import Iterable

from reuse.global_licensing import ReuseTOML


ALLOWED_LICENSE_IDENTIFIERS = frozenset({"Apache-2.0", "CC-BY-4.0"})
CANONICAL_LICENSE_TEXT = re.compile(
    r"^(?:LICENSES/[^/]+\.txt|(?:.+/)LICENSE(?:\.(?:Apache-2\.0|CC-BY-4\.0))?)$"
)
EMBEDDED_SPDX = re.compile(
    r"SPDX-(?:FileCopyrightText|SnippetCopyrightText|License-Identifier)\s*:"
)


def tracked_paths(repository_root: Path) -> tuple[str, ...]:
    """Return the repository's tracked paths without locale-sensitive parsing."""

    result = subprocess.run(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
        cwd=repository_root,
        check=True,
        capture_output=True,
    )
    paths = (path.decode("utf-8") for path in result.stdout.split(b"\0") if path)
    return tuple(path for path in paths if (repository_root / path).exists())


def validate_repository(
    repository_root: Path,
    paths: Iterable[str] | None = None,
) -> tuple[str, ...]:
    """Return deterministic violations of the exact ai4X licensing contract."""

    root = repository_root.resolve()
    repository_paths = tuple(sorted(paths if paths is not None else tracked_paths(root)))
    violations: list[str] = []

    authority_path = root / "REUSE.toml"
    try:
        authority = ReuseTOML.from_file(authority_path)
    except Exception as error:  # REUSE intentionally owns syntax/semantic parsing.
        return (f"REUSE.toml: cannot parse licensing authority: {error}",)

    if authority.version != 1:
        violations.append(f"REUSE.toml: unsupported version {authority.version!r}; expected 1")

    for index, annotation in enumerate(authority.annotations, start=1):
        identifiers = {str(expression) for expression in annotation.spdx_expressions}
        if len(identifiers) != 1:
            violations.append(
                f"REUSE.toml annotation {index}: expected exactly one permitted license, "
                f"found {sorted(identifiers)!r}"
            )
        unsupported = identifiers - ALLOWED_LICENSE_IDENTIFIERS
        if unsupported:
            violations.append(
                f"REUSE.toml annotation {index}: identifier(s) {sorted(unsupported)!r} "
                "are outside the closed license set"
            )

    for relative in repository_paths:
        if relative != "REUSE.toml" and relative.endswith("/REUSE.toml"):
            violations.append(f"{relative}: nested licensing authority is not allowed")
        if relative == ".reuse/dep5" or relative.endswith("/.reuse/dep5"):
            violations.append(f"{relative}: DEP5 licensing authority is not allowed")

        if CANONICAL_LICENSE_TEXT.fullmatch(relative):
            continue

        matches: list[tuple[int, str]] = []
        for index, annotation in enumerate(authority.annotations, start=1):
            for pattern in sorted(annotation.paths):
                if annotation.__class__(
                    paths={pattern},
                    precedence=annotation.precedence,
                    copyright_notices={str(item) for item in annotation.copyright_notices},
                    spdx_expressions={str(item) for item in annotation.spdx_expressions},
                ).matches(relative):
                    matches.append((index, pattern))

        if len(matches) != 1:
            detail = "none" if not matches else ", ".join(
                f"annotation {index} ({pattern})" for index, pattern in matches
            )
            violations.append(
                f"{relative}: expected exactly one path assignment; matched: {detail}"
            )

        if relative == "REUSE.toml":
            continue
        try:
            payload = (root / relative).read_bytes()
        except OSError as error:
            violations.append(f"{relative}: cannot read tracked file: {error}")
            continue
        text = payload.decode("utf-8", errors="ignore")
        if EMBEDDED_SPDX.search(text):
            violations.append(
                f"{relative}: embedded SPDX licensing metadata competes with root REUSE.toml"
            )

    return tuple(sorted(set(violations)))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repository", nargs="?", default=".")
    arguments = parser.parse_args()
    try:
        violations = validate_repository(Path(arguments.repository))
    except (OSError, subprocess.CalledProcessError) as error:
        print(f"[ai4x|error] licensing inventory failed: {error}")
        return 1
    if violations:
        for violation in violations:
            print(f"[ai4x|error] {violation}")
        return 1
    print("[ai4x|info] every tracked file has exactly one permitted path license")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
