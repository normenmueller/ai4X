#!/usr/bin/env python3
"""Compare metadata.json with GitHub. Exit 0 on match, 1 on drift, 2 on error."""

import json
from pathlib import Path
import subprocess
import sys


REPOSITORY = "normenmueller/ai4X"
METADATA = Path(__file__).with_name("metadata.json")


def metadata_fields(data):
    if not isinstance(data, dict) or not {"description", "topics"} <= data.keys():
        raise ValueError("expected description and topics")
    description = data["description"]
    topics = data["topics"]
    if description is not None and not isinstance(description, str):
        raise ValueError("description must be a string or null")
    if not isinstance(topics, list) or not all(isinstance(t, str) and t for t in topics):
        raise ValueError("topics must be a list of nonempty strings")
    if len(topics) != len(set(topics)):
        raise ValueError("duplicate topic")
    return {"description": description or "", "topics": sorted(topics)}


def main():
    try:
        expected = metadata_fields(json.loads(METADATA.read_text(encoding="utf-8")))
        response = subprocess.check_output(
            ["gh", "api", "--hostname", "github.com", "--method", "GET", f"repos/{REPOSITORY}"]
        )
        remote = json.loads(response)
        actual = metadata_fields(remote)
        name = remote.get("full_name")
        if not isinstance(name, str) or name.casefold() != REPOSITORY.casefold():
            raise ValueError(f"expected repository {REPOSITORY}, received {name!r}")
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        print(f"Metadata check failed: {error}", file=sys.stderr)
        return 2

    differences = [field for field in expected if expected[field] != actual[field]]
    for field in differences:
        print(f"{field}: expected {expected[field]!r}, GitHub has {actual[field]!r}", file=sys.stderr)
    if differences:
        return 1
    print(f"GitHub description and topics match metadata.json for {REPOSITORY}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
