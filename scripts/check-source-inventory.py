#!/usr/bin/env python3
"""Source-document inventory gate (C-09, T-31a / S48-07).

C-09's passing condition asks for a "PDF inventory with hash/license record".
Prose alone cannot hold that: an inventory drifts the moment a PDF is added,
renamed or replaced, and the two vendor manuals here are exactly the claim that
needs a machine behind it. Both are 132 and 133 bytes of large-object pointer
text, so a reader can see a filename, a plausible size in a document, and still
have no manual anywhere in the repository.

This gate makes the inventory a checked artifact. It fails when:

  1. a PDF in the tree is missing from the inventory (an unlisted artifact);
  2. an inventory row names a PDF that is not in the tree (a phantom record);
  3. the recorded sha256 does not match the bytes on disk (the file was
     replaced, truncated or re-fetched and kept a stale record);
  4. the recorded byte size does not match;
  5. the rights cell is blank or a "review later" placeholder — the register
     rule (SPEC-14) allows a concrete workflow and output, never that label;
  6. a row claims Presence `in-repo` for a file that is actually large-object
     pointer text, or `pointer-only` for a file that is not. This is the
     clause that stops the record from claiming a manual the repo does not
     contain.

Presence is recorded, not inferred, so the row is a statement the gate can
contradict. `pointer-only` is a truthful status; the defect is a row that
claims otherwise.

Not checked (reported as not-verified in the record): whether any rights
review has actually been performed for the ingested documents, and whether the
pointer objects are retrievable from any remote. This gate reads bytes in the
tree and nothing else.

Exit 0: clean. Exit 1: failures listed.
"""
import argparse
import hashlib
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
INVENTORY = Path("docs") / "SOURCE-INVENTORY.md"

# Fixture trees are not repository artifacts; they carry PDFs of their own by
# design, so they are not enumerated. Build output is skipped for the same
# reason: `EmptyFiles` ships a zero-byte document/empty.pdf into every .NET
# test project's bin/ and obj/ during a build, and it is not a source document.
SKIP_DIRS = {".git", "node_modules", "bin", "obj", ".playwright-mcp"}
SKIP_PREFIXES = (Path("tests") / "gates" / "fixtures",)

COLUMNS = ("File", "sha256", "bytes", "Class", "Presence", "Rights status")
PRESENCE = {"in-repo", "pointer-only"}

# SPEC-14's register rule: rights decisions get a concrete workflow and output
# record, never a "review later" label.
PLACEHOLDERS = {"", "-", "?", "tbd", "todo", "n/a", "review later", "unknown"}

POINTER_MARKER = "version https://git-lfs.github.com/spec/v1"
POINTER_OID_RE = re.compile(r"^oid sha256:([0-9a-f]{64})$", re.MULTILINE)
POINTER_SIZE_RE = re.compile(r"^size (\d+)$", re.MULTILINE)


def sha256_of(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 16), b""):
            digest.update(chunk)
    return digest.hexdigest()


def is_pointer_text(path: Path) -> bool:
    head = path.read_bytes()[:256].decode("utf-8", errors="replace")
    return POINTER_MARKER in head


def enumerate_pdfs(root: Path) -> list[str]:
    found = []
    for path in sorted(root.rglob("*.pdf")):
        rel = path.relative_to(root)
        if any(part in SKIP_DIRS for part in rel.parts):
            continue
        if any(rel.is_relative_to(prefix) for prefix in SKIP_PREFIXES):
            continue
        if path.is_file():
            found.append(rel.as_posix())
    return found


def parse_inventory(path: Path) -> tuple[list[dict], list[str]]:
    """Return (rows, parse_errors). A row is one PDF line of the table."""
    rows: list[dict] = []
    errors: list[str] = []
    if not path.is_file():
        return rows, [f"{path}: inventory not found"]

    for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        stripped = line.strip()
        if not stripped.startswith("|"):
            continue
        # Markdown tables here wrap paths and hashes in backticks; the record is
        # the value, not the formatting.
        cells = [cell.strip().strip("`").strip() for cell in stripped.split("|")[1:-1]]
        if not cells or cells[0] in ("File", "") or set(cells[0]) <= set("-: "):
            continue
        if not cells[0].endswith(".pdf"):
            continue
        if len(cells) != len(COLUMNS):
            errors.append(
                f"{path}:{lineno}: row has {len(cells)} columns, expected "
                f"{len(COLUMNS)} ({', '.join(COLUMNS)})"
            )
            continue
        rows.append(dict(zip(COLUMNS, cells), _line=lineno))
    return rows, errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--root",
        type=Path,
        default=REPO_ROOT,
        help="tree to check (fixtures use this); default: the repo root",
    )
    parser.add_argument(
        "--inventory",
        type=Path,
        default=None,
        help=f"inventory path relative to --root; default: {INVENTORY}",
    )
    args = parser.parse_args()

    root = args.root if args.root.is_absolute() else REPO_ROOT / args.root
    if not root.is_dir():
        print(f"SOURCE INVENTORY: FAIL — not a directory: {root}", file=sys.stderr)
        return 1
    inventory_path = args.inventory or INVENTORY
    if not inventory_path.is_absolute():
        inventory_path = root / inventory_path

    rows, failures = parse_inventory(inventory_path)
    listed = {row["File"] for row in rows}
    present = set(enumerate_pdfs(root))

    for missing in sorted(present - listed):
        failures.append(
            f"{missing}: PDF in the tree with no inventory row (C-09 — every "
            "source document carries a hash and a rights status)"
        )
    for phantom in sorted(listed - present):
        failures.append(f"{phantom}: inventory row names a file that is not in the tree")

    for row in rows:
        rel = row["File"]
        path = root / rel
        lineno = row["_line"]
        if not path.is_file():
            continue  # already reported as a phantom
        actual_hash = sha256_of(path)
        actual_bytes = path.stat().st_size
        if row["sha256"].lower() != actual_hash:
            failures.append(
                f"{rel}:{lineno}: recorded sha256 {row['sha256'][:16]}… does not "
                f"match the bytes on disk ({actual_hash[:16]}…)"
            )
        if row["bytes"] != str(actual_bytes):
            failures.append(
                f"{rel}:{lineno}: recorded size {row['bytes']} does not match "
                f"the file ({actual_bytes} bytes)"
            )

        if row["Rights status"].strip().lower() in PLACEHOLDERS:
            failures.append(
                f"{rel}:{lineno}: rights status is a placeholder "
                f"({row['Rights status']!r}) — SPEC-14 requires a concrete record"
            )

        declared = row["Presence"]
        if declared not in PRESENCE:
            failures.append(
                f"{rel}:{lineno}: Presence {declared!r} is not one of "
                f"{sorted(PRESENCE)}"
            )
            continue
        actual_pointer = is_pointer_text(path)
        if declared == "in-repo" and actual_pointer:
            failures.append(
                f"{rel}:{lineno}: recorded in-repo, but the file is large-object "
                "pointer text — the document itself is not in the repository"
            )
        if declared == "pointer-only" and not actual_pointer:
            failures.append(
                f"{rel}:{lineno}: recorded pointer-only, but the file is not "
                "pointer text (the record is stale — update it, do not loosen it)"
            )

    for row in rows:
        if row["Presence"] != "pointer-only":
            continue
        path = root / row["File"]
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        oid = POINTER_OID_RE.search(text)
        size = POINTER_SIZE_RE.search(text)
        if not oid or not size:
            failures.append(
                f"{row['File']}:{row['_line']}: pointer text is malformed — "
                "cannot read an object id and size"
            )
            continue
        print(
            f"  pointer-only: {row['File']} → object {oid.group(1)[:16]}…, "
            f"{int(size.group(1)):,} bytes (absent from the repository)"
        )

    if failures:
        print(f"SOURCE INVENTORY: FAIL — {len(failures)} problem(s)", file=sys.stderr)
        for failure in failures:
            print(f"  {failure}", file=sys.stderr)
        return 1

    print(
        f"SOURCE INVENTORY: PASS — {len(rows)} source document(s) recorded, "
        "hash/size/rights/presence all match the tree"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
