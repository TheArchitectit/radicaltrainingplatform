#!/usr/bin/env python3
"""Page retrieval for the RedEye source stage (SPEC-08A REQ-REV-01a).

Split out of redeye_source_stage.py to keep both files under the 500-line
source limit. This module answers one question — which pages of a supplied
document should be shown to the model — with two passes that disagree on
purpose: a term count that finds overview pages, and a phrase (bigram) pass
that finds the deep page naming the subject. Table-of-contents pages are
excluded; a TOC matches every item and supports none.
"""
import hashlib
import json
import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

# Vocabulary that appears on every page of a technical guide and therefore
# selects nothing. Kept small on purpose: the score threshold does the pruning.
STOPWORDS = frozenset("""
about above after again against also among another answer applied apply
because before being below between both cannot cluster could does doing
during each every follow following from have here into itself just more
most much must only other over same should since some such than that their
them then there these they this those through under until upon using very
what when where which while within without would your
""".split())

CACHE = Path(os.environ.get("REDEYE_SOURCE_CACHE",
                            Path.home() / ".cache" / "redeye-source"))


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for block in iter(lambda: fh.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()
def _index_path(doc):
    return CACHE / "index" / f"{doc['sha256']}.json"


def load_source_index(doc):
    """Pages of a document, as text, with the pinned hash checked first."""
    path = Path(doc["path"]).expanduser()
    if not path.is_file():
        raise RuntimeError(f"source document missing: {path}")
    digest = sha256_file(path)
    if digest != doc.get("sha256"):
        raise RuntimeError(f"source document changed: {path} is {digest[:12]}…, "
                           f"config pins {str(doc.get('sha256'))[:12]}…")
    cached = _index_path(doc)
    if cached.is_file():
        return json.loads(cached.read_text(encoding="utf-8"))
    tool = shutil.which("pdftotext")
    if not tool:
        raise RuntimeError("pdftotext is not on PATH — cannot read the source document")
    proc = subprocess.run([tool, "-layout", str(path), "-"],
                          capture_output=True, text=True, timeout=300)
    if proc.returncode != 0:
        raise RuntimeError(f"pdftotext failed on {path.name}: {proc.stderr[:160]}")
    pages = proc.stdout.split("\f")
    cached.parent.mkdir(parents=True, exist_ok=True)
    cached.write_text(json.dumps(pages), encoding="utf-8")
    return pages


def item_terms(item):
    text = (item.get("text") or "").lower()
    words = re.findall(r"[a-z][a-z0-9+.-]{3,}", text)
    return {w for w in words if w not in STOPWORDS}


_WORD = re.compile(r"[a-z][a-z0-9+.-]{3,}")
_PAGE_CACHE = {}
# A table-of-contents page shares vocabulary with every item and supports none
# of them. Measured: AHV 11.2 page 4 is the TOC, and the stage cited it as
# "stating" the answer for five pilot items — the model confabulated support
# from a contents list. Ten dot-leader runs is a TOC; body pages do not have
# them.
_TOC_LEADER = re.compile(r"\.{4,}")


def _is_toc(page):
    return len(_TOC_LEADER.findall(page)) >= 10


def _norm(word):
    word = word.strip(".")
    return word[:-1] if len(word) > 4 and word.endswith("s") else word


def _page_features(pages, cache_key=None):
    """Normalized word lists and bigram sets per page, cached per document.

    Recomputing this for every item was measurable: a 320-page guide is ~160k
    words and the lane asks per item per document.
    """
    if cache_key and cache_key in _PAGE_CACHE:
        return _PAGE_CACHE[cache_key]
    word_lists = [[_norm(w) for w in _WORD.findall(page.lower())] for page in pages]
    bigrams = [
        {f"{a} {b}" for a, b in zip(words, words[1:])
         if a not in STOPWORDS and b not in STOPWORDS}
        for words in word_lists
    ]
    features = (word_lists, bigrams)
    if cache_key:
        _PAGE_CACHE[cache_key] = features
    return features


def select_pages(item, pages, max_pages=3, min_score=3, cache_key=None):
    """Pages to render: the union of two selections, each capped at max_pages.

    The single-term count (the original selection) finds overview pages — the
    one that introduces a concept in plain words, which is how most items are
    answered. Phrase (bigram) scoring finds the deep page that names the
    subject. Measured both ways on the pilot: replacing the first with the
    second lost 8 of 13 previously cited pages, and using only the first missed
    pages that do settle an item. So both run and the union is rendered; the
    cap is 2 x max_pages.

    A page must be picked by one of them; if neither finds anything the stage
    refuses rather than sending unrelated pages to the model — an item the
    source does not cover is not a source-verified item.
    """
    word_lists, page_bigrams = _page_features(pages, cache_key)
    item_words = [_norm(w) for w in _WORD.findall((item.get("text") or "").lower())]
    terms = {w for w in item_words if w not in STOPWORDS}
    if not terms:
        raise RuntimeError("item has no usable terms for page selection")
    token_sets = [set(words) for words in word_lists]

    # The count pass is deliberately the ORIGINAL selection, substring match
    # included: a normalized token match is stricter and lost overview pages
    # that matched a plural or a derived form ("management" for "manage").
    raw_terms = item_terms(item)
    counted = []
    for number, page in enumerate(pages, start=1):
        if _is_toc(page):
            continue
        score = sum(1 for t in raw_terms if t in page.lower())
        if score >= min_score:
            counted.append((score, number))
    counted.sort(key=lambda pair: (-pair[0], pair[1]))
    by_terms = [number for _, number in counted[:max_pages]]

    item_bigrams = {f"{a} {b}" for a, b in zip(item_words, item_words[1:])
                    if a not in STOPWORDS and b not in STOPWORDS}
    n = len(pages)
    bg_df = {b: sum(1 for s in page_bigrams if b in s) for b in item_bigrams}
    specific_bg = {b for b, d in bg_df.items() if 0 < d <= max(2, n // 50)}
    df = {t: sum(1 for ts in token_sets if t in ts) for t in terms}
    phrased = []
    for number, (tokens, bigrams) in enumerate(zip(token_sets, page_bigrams), start=1):
        if _is_toc(pages[number - 1]):
            continue
        phrases = len(specific_bg & bigrams)
        rare = sum(1.0 / df[t] for t in terms if t in tokens and df[t])
        if phrases or rare >= 1.0:
            phrased.append((3 * phrases + rare, number))
    phrased.sort(key=lambda pair: (-pair[0], pair[1]))
    by_phrases = [number for _, number in phrased[:max_pages]]

    chosen = sorted(set(by_terms) | set(by_phrases))[:2 * max_pages]
    if not chosen:
        best = max([s for s, _ in counted] + [0])
        raise RuntimeError(f"no source page matched the item (best score {best}, "
                           f"threshold {min_score})")
    return chosen


def render_page(doc, number, dpi=110):
    """PNG bytes for one page, cached by document hash and page number."""
    key = CACHE / "pages" / doc["sha256"] / f"{dpi}" / f"p{number:04d}.png"
    if key.is_file():
        return key.read_bytes()
    tool = shutil.which("pdftoppm")
    if not tool:
        raise RuntimeError("pdftoppm is not on PATH — cannot render the source page")
    with tempfile.TemporaryDirectory() as td:
        prefix = Path(td) / "page"
        proc = subprocess.run([tool, "-png", "-r", str(dpi), "-f", str(number),
                               "-l", str(number), str(Path(doc["path"]).expanduser()),
                               str(prefix)], capture_output=True, text=True, timeout=300)
        produced = sorted(Path(td).glob("page-*.png"))
        if proc.returncode != 0 or not produced:
            raise RuntimeError(f"pdftoppm failed on page {number}: {proc.stderr[:160]}")
        data = produced[0].read_bytes()
    key.parent.mkdir(parents=True, exist_ok=True)
    key.write_bytes(data)
    return data


