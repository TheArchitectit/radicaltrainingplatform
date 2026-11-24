#!/usr/bin/env python3
"""Pure helpers shared by the RedEye ship-gate and its self-test.

Split out of `scripts/redeye-gate.py` to keep that file under the 500-line
source limit. Nothing here reads module state: `collect_banks` and
`parse_items` stay in the gate because they honour the test-overridable
`_repo_root`, and moving them would break that seam.
"""
import hashlib
import pathlib
import re

SUFFIX_STRIP = re.compile(
    r"^(.+?)-(?:Part\d+(?:-.*)?|D\d+(?:-.*)?|GapFill(?:-.*)?)$", re.IGNORECASE
)


def derive_exam_code(file_name):
    """Port of QuestionParser.DeriveExamCode — mirrors check-item-identity.py.

    Legacy root banks (NCA-75-Part1.md) carry their exam in the filename, not
    in a directory. Without this the gate cannot see them at all.
    """
    current = pathlib.Path(file_name).stem
    while True:
        match = SUFFIX_STRIP.match(current)
        if not match:
            break
        current = match.group(1)
    parts = current.split("-")
    return f"{parts[0]}-{parts[1]}" if len(parts) >= 2 else current


def sha256(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def sanitize_item_id(item_id):
    return re.sub(r"[^A-Za-z0-9._-]+", "_", item_id)
