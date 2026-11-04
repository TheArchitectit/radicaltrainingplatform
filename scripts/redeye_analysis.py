#!/usr/bin/env python3
"""Deterministic analysis the RedEye lane runs over a bank (T-46, SPEC-08A).

Split out of `scripts/redeye-lane.py` so neither file carries the whole lane:
this module parses banks, reads provenance, and answers the deterministic
questions the lane asks (position bias, originality, injection text). The
command holds the log format, the per-bank loop and the CLI.

`REPO_ROOT` is resolved here because the provenance, manifest and bank
discovery helpers are relative to the repository; the command imports it.
"""
import collections
import hashlib
import json
import pathlib
import re
import sys

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

# Mirrors QuestionParser.AnswerRegex — keep in sync (see lint-content.py note).
QUESTION_HEADER = re.compile(r"^###\s+(Q\d+)", re.MULTILINE)
ANSWER_LINE = re.compile(
    r"^\*\*(?:Correct )?Answer:\s*([A-F](?:\s*(?:,|and|&)?\s*[A-F])*)\s*\*\*",
    re.MULTILINE,
)

CONCENTRATION_THRESHOLD = 0.40
NGRAM_SIZE = 5
DUPLICATE_THRESHOLD = 0.6

REQUIRED_PROVENANCE_FIELDS = (
    "itemId", "examId", "objectiveId", "author", "assistance",
    "rightsBasis", "reviewer", "originalityCheck",
)
VALID_PROVENANCE_STATUSES = ("draft", "reviewed", "released")

# REQ-REV-06: model output is data; content containing instruction-shaped text
# is flagged, never followed. Patterns are heuristic — a flag is a review
# signal, not proof of malice.
INJECTION_PATTERNS = (
    re.compile(r"ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions", re.IGNORECASE),
    re.compile(r"you\s+are\s+now", re.IGNORECASE),
    re.compile(r"mark\s+this\s+(?:item|answer)\s+(?:as\s+)?(?:approved|correct|passing)", re.IGNORECASE),
    re.compile(r"disregard\s+.+\s+and\s+", re.IGNORECASE),
    re.compile(r"system\s*:\s*", re.IGNORECASE),
)

def sha256(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def parse_bank(path):
    """Split a bank file into items: list of dicts with number, text, keys.

    Text is the raw markdown slice from the question header to the next
    header — the exact bytes the hash binds. Keys come from the answer line.
    """
    content = path.read_text(encoding="utf-8")
    headers = list(QUESTION_HEADER.finditer(content))
    items = []
    for i, match in enumerate(headers):
        start = match.start()
        end = headers[i + 1].start() if i + 1 < len(headers) else len(content)
        text = content[start:end]
        answer = ANSWER_LINE.search(text)
        keys = re.findall(r"[A-F]", answer.group(1)) if answer else []
        items.append({
            "number": match.group(1),
            "text": text,
            "keys": keys,
        })
    return items


def bank_position_stats(items):
    single = [it["keys"][0] for it in items if len(it["keys"]) == 1]
    counts = collections.Counter(single)
    total = len(single)
    shares = {letter: counts.get(letter, 0) / total for letter in "ABCDEF"} if total else {}
    dominant_letter, dominant_share = max(shares.items(), key=lambda kv: kv[1]) if shares else ("-", 0.0)
    return shares, dominant_letter, dominant_share, total


def ngrams(text, n=NGRAM_SIZE):
    tokens = re.findall(r"[a-z0-9]+", text.lower())
    if len(tokens) < n:
        return {" ".join(tokens)} if tokens else set()
    return {" ".join(tokens[i:i + n]) for i in range(len(tokens) - n + 1)}


def overlap_ratio(a, b):
    if not a or not b:
        return 0.0
    return len(a & b) / min(len(a), len(b))


def load_manifest_objective_ids(exam_id):
    manifest_path = REPO_ROOT / "content" / "exams" / exam_id / "exam.json"
    if not manifest_path.is_file():
        sys.exit(f"manifest missing: {manifest_path}")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    ids = set()
    for section in manifest.get("sections", []):
        for objective in section.get("objectives", []):
            ids.add(objective["id"])
    return manifest_path, ids


def load_provenance(exam_id, item_id, provenance_dir):
    """Look up the C-02 record for one item. Returns (record|None, path|None).

    Records live as content/provenance/<examId>/Q<n>.json (one bank per exam
    in the current content tree) but are matched by their itemId field so a
    second bank of the same exam cannot collide on Q1.
    """
    base = pathlib.Path(provenance_dir) if provenance_dir else (
        REPO_ROOT / "content" / "provenance" / exam_id)
    if not base.is_dir():
        return None, None

    # Prefer an exact itemId match inside any record of the directory.
    for path in sorted(base.glob("*.json")):
        try:
            record = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        if record.get("itemId") == item_id:
            return record, path

    # Fall back to the Q<n>.json naming convention used by the first banks.
    match = re.search(r"(Q\d+)$", item_id)
    if not match:
        return None, None
    path = base / f"{match.group(1)}.json"
    if not path.is_file():
        return None, path
    try:
        record = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None, path
    # A Q<n>.json whose itemId points at a different item is not this item's record.
    if record.get("itemId") and record["itemId"] != item_id:
        return None, path
    return record, path


def check_provenance(record, item_id):
    """Return None if the provenance record is complete, else a failure detail."""
    if record is None:
        return "missing provenance record"
    if record.get("itemId") and record["itemId"] != item_id:
        return f"provenance itemId mismatch: record says {record['itemId']!r}"
    missing = [f for f in REQUIRED_PROVENANCE_FIELDS if not str(record.get(f, "")).strip()]
    if missing:
        return f"incomplete provenance: empty fields {', '.join(missing)}"
    if record.get("status") not in VALID_PROVENANCE_STATUSES:
        return f"invalid provenance status: {record.get('status')!r}"
    return None


def check_injection(text):
    hits = [pat.pattern for pat in INJECTION_PATTERNS if pat.search(text)]
    return hits or None


def sanitize_item_id(item_id):
    return re.sub(r"[^A-Za-z0-9._-]+", "_", item_id)

def item_id_for(exam_id, bank_path, question_number):
    return f"{exam_id}/{bank_path.name}/{question_number}"


def collect_exam_banks(exam_id):
    base = REPO_ROOT / "content" / "exams" / exam_id / "questions"
    if not base.is_dir():
        return []
    return sorted(base.glob("*.md"))


def infer_exam_id(bank_path):
    for parent in bank_path.resolve().parents:
        manifest = parent / "exam.json"
        if manifest.is_file():
            try:
                return json.loads(manifest.read_text(encoding="utf-8"))["examId"]
            except (json.JSONDecodeError, KeyError):
                return None
    return None
