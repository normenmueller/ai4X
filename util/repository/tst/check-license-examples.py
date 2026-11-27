"""Check the effective REUSE assignments of one code and one corpus file."""

import json
import subprocess

EXPECTED = {
    "src/foundation/core/src/AI4X/Core.hs": "Apache-2.0",
    "src/resources/corpus/governance/quality/testing.md": "CC-BY-4.0",
}

report = json.loads(subprocess.check_output(["reuse", "--no-multiprocessing", "lint", "--json"]))
files = {entry["path"]: entry for entry in report["files"]}
for path, expected in EXPECTED.items():
    if path not in files:
        raise SystemExit(f"{path}: missing from REUSE report")
    actual = {item["value"] for item in files[path]["spdx_expressions"]}
    if actual != {expected}:
        observed = ", ".join(sorted(actual)) or "none"
        raise SystemExit(f"{path}: expected {expected}, found {observed}")
