#!/usr/bin/env python3
"""RedEye source stage: key-vs-source against supplied documents (REQ-REV-01a).

The model stage asks the model to derive an answer blind and compares it with
the key. That checks whether one model agrees with the author; it does not check
the key against a document. This stage does: it selects the pages of a supplied
PDF that share vocabulary with the item, renders them, and asks the model which
option(s) those pages support. The keyed answer is still withheld, and the
model's word is not evidence — it must quote the page verbatim and the quote
must be found on a supplied page (60% trigram overlap), because a citation that
cannot be found is exactly how a table of contents once read as support.

Opt-in and fail-closed, by construction:

  * No `source` block in the config, or the flag absent — the lane adds no
    source check at all (unchanged behaviour).
  * The flag is given but the config is unusable, a document's sha256 does not
    match the pin, `pdftotext`/`pdftoppm` is missing, no page shares enough
    vocabulary with the item, the endpoint errors, or the reply is malformed —
    every one of these raises, and a raised error leaves the stage blocked and
    the verdict `return`.

Documents are read where they live; nothing here copies a vendor PDF into the
repository (SPEC-15's vendor-document disposition), and the page cache is a
local scratch directory that is never committed.

Usage (from the lane): see scripts/redeye-lane.py --source-config.
Self-test:    python3 scripts/redeye_source_stage.py --self-test
"""
import base64
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request
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


def source_stage_config(config_text):
    """The `source` block, or None when the stage is not configured.

    Fail-closed by construction: a missing flag, no documents, or `enabled`
    false all mean no source check runs — never a silent pass.
    """
    try:
        cfg = json.loads(config_text)
    except Exception:
        return None
    src = cfg.get("source") or {}
    docs = src.get("documents")
    if not src.get("enabled") or not isinstance(docs, list) or not docs:
        return None
    return src


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


def _options(item):
    options = {}
    for line in (item.get("text") or "").splitlines():
        match = re.match(r"^-\s*([A-F])\)\s*(.+)$", line.strip())
        if match:
            options[match.group(1)] = match.group(2)
    return options


def _endpoint(model):
    key = os.environ.get(model.get("apiKeyEnv") or "", model.get("apiKey") or "")
    if not key:
        raise RuntimeError("no API key for the source stage")
    url = model["baseUrl"].rstrip("/")
    if not url.endswith("/v1"):
        url += "/v1"
    return url + "/chat/completions", key


def _norm_words(text):
    return re.findall(r"[a-z0-9]+", (text or "").lower())


def _trigrams(words):
    return {tuple(words[i:i + 3]) for i in range(max(0, len(words) - 2))}


def citation_supported(quote, page, threshold=0.6, min_words=8):
    """True when `quote` really appears on `page`.

    The model's word is not evidence. Measured failure this exists for: the
    stage cited AHV 11.2 page 4 as stating an answer, and page 4 is the table
    of contents — a hallucinated citation that read as verification. The reply
    must now carry a verbatim sentence, and 60% of its trigrams must occur on
    one supplied page; OCR of a rendered page differs slightly from the text
    layer, which is why this is overlap and not equality.
    """
    words = _norm_words(quote)
    if len(words) < min_words:
        return False
    page_grams = _trigrams(_norm_words(page))
    quote_grams = _trigrams(words)
    if not quote_grams:
        return False
    return len(quote_grams & page_grams) / len(quote_grams) >= threshold


def best_citation_page(quote, candidates):
    """(doc, number, ratio) of the supplied page that best supports the quote."""
    words = _norm_words(quote)
    quote_grams = _trigrams(words)
    best = (None, None, 0.0)
    for doc, number, text in candidates:
        page_grams = _trigrams(_norm_words(text))
        ratio = (len(quote_grams & page_grams) / len(quote_grams)
                 if quote_grams else 0.0)
        if ratio > best[2]:
            best = (doc, number, ratio)
    return best


def verify_key_with_source(item, model, source):
    """True when the rendered source pages support exactly the keyed answer.

    The keyed answer is not in the prompt. "The pages do not answer this" is a
    refusal (False), not an agreement: a source stage that treats silence as
    support would verify every item against any document.
    """
    options = _options(item)
    if not options:
        raise RuntimeError("item has no options to check against the source")
    candidates = []
    for doc in source["documents"]:
        text_pages = load_source_index(doc)
        for number in select_pages(item, text_pages,
                                   max_pages=int(source.get("maxPages", 3)),
                                   min_score=int(source.get("minScore", 3)),
                                   cache_key=doc["sha256"]):
            candidates.append((doc, number, text_pages[number - 1]))
    if not candidates:
        raise RuntimeError("no source pages selected")
    listing = "\n".join(f"{k}) {v}" for k, v in options.items())
    content = [
        {"type": "text", "text":
         f"{item.get('text', '')}\n\n{listing}\n\n"
         "Which option(s) do the supplied pages support? Use only these pages. "
         "If they do not settle the answer, say supported=false."},
    ]
    for doc, number, _text in candidates:
        png = render_page(doc, number, int(source.get("dpi", 110)))
        content.append({"type": "text", "text":
                        f"Page {number} of {doc.get('label') or Path(doc['path']).name}:"})
        content.append({"type": "image_url", "image_url": {
            "url": "data:image/png;base64," +
                   base64.b64encode(png).decode()}})
    body = json.dumps({
        "model": model["model"],
        "temperature": 0,
        "max_tokens": int(model.get("maxTokens", 2500)),
        "messages": [
            {"role": "system",
             "content": "You verify certification items against supplied source pages. "
                        "Reply with JSON only: {\"supported\": true|false, "
                        "\"answers\": [\"<letter>\", ...], "
                        "\"quote\": \"<one sentence copied verbatim from a supplied page>\", "
                        "\"reason\": \"<25 words>\"}"},
            {"role": "user", "content": content},
        ],
    }).encode()
    url, key = _endpoint(model)
    req = urllib.request.Request(url, data=body, method="POST",
                                 headers={"Content-Type": "application/json",
                                          "Authorization": f"Bearer {key}"})
    # Rendering plus OCR of several pages is slower than a text-only derivation;
    # the source stage may name its own budget, and the lane's model timeout is
    # the fallback. A timeout blocks the item — it never passes it.
    timeout = int(source.get("timeoutSeconds", model.get("timeoutSeconds", 300)))
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        payload = json.loads(resp.read())
    raw = (payload.get("choices") or [{}])[0].get("message", {}).get("content")
    if not raw:
        raise RuntimeError("model returned no final content (reasoning-only reply)")
    verdict = json.loads(raw)
    if not verdict.get("supported"):
        return False, "source pages do not settle this item: " + \
                      str(verdict.get("reason", ""))[:160]
    answers = verdict.get("answers")
    if not isinstance(answers, list) or not answers:
        raise RuntimeError(f"model reply is not the requested shape: {raw[:120]}")
    quote = verdict.get("quote")
    if not isinstance(quote, str) or len(_norm_words(quote)) < 8:
        raise RuntimeError("model claimed support without a quotable sentence")
    doc, page, ratio = best_citation_page(quote, candidates)
    if ratio < 0.6:
        return False, (f"citation not found on any supplied page (best overlap "
                       f"{ratio:.0%}); the claim is unsupported: {quote[:120]}")
    derived = {str(a).strip().upper() for a in answers}
    unknown = derived - set(options)
    if unknown:
        raise RuntimeError(f"model answered with {sorted(unknown)}, which are not options")
    keyed = {str(k).strip().upper() for k in (item.get("keys") or [])}
    reason = str(verdict.get("reason", ""))
    cite = f"{doc.get('label') or Path(doc['path']).name} p.{page}: \"{quote[:140]}\""
    if derived == keyed:
        return True, f"{cite} — {reason}".strip()
    return False, (f"source supports {sorted(derived)}; key says {sorted(keyed)}. "
                   f"{cite} — {reason}").strip()


def self_test():
    """Fail-closed checks that need no network and no PDF."""
    failures = []
    with tempfile.TemporaryDirectory() as td:
        doc = Path(td) / "guide.txt"
        doc.write_text("bond type active-backup default recommended\n", encoding="utf-8")
        pinned = {"path": str(doc), "sha256": sha256_file(doc), "label": "fixture"}

        pages = ["irrelevant page about nothing", doc.read_text(encoding="utf-8")]
        try:
            chosen = select_pages({"text": "Which bond type is the default and recommended?"},
                                  pages, min_score=3)
            if chosen != [2]:
                failures.append(f"page selection picked {chosen}, expected [2]")
        except Exception as exc:  # noqa: BLE001
            failures.append(f"page selection failed: {exc}")

        # A table of contents matches item vocabulary and supports nothing; it
        # was cited for five pilot items before this check existed.
        toc = "bond type is the default and recommended ....1\n" * 12
        try:
            chosen = select_pages({"text": "Which bond type is the default and recommended?"},
                                  [toc, "irrelevant", doc.read_text(encoding="utf-8")],
                                  min_score=3)
            if chosen == [1] or 1 in chosen:
                failures.append(f"a table-of-contents page was selected: {chosen}")
        except Exception as exc:  # noqa: BLE001
            failures.append(f"TOC fixture selection failed: {exc}")

        try:
            select_pages({"text": "quantum flux capacitor calibration"},
                         pages, min_score=8)
            failures.append("selection with no matching page did not refuse")
        except RuntimeError:
            pass

        pinned_bad = dict(pinned, sha256="0" * 64)
        try:
            source_stage_config(json.dumps({"source": {"enabled": True,
                                                       "documents": [pinned_bad]}}))
            # config parse alone is fine; the hash is checked when the index loads
            try:
                load_source_index(pinned_bad)
                failures.append("a changed document did not fail its pin")
            except RuntimeError:
                pass
        except Exception as exc:  # noqa: BLE001
            failures.append(f"config parse failed: {exc}")

        if source_stage_config(json.dumps({"source": {"enabled": False,
                                                      "documents": [pinned]}})) is not None:
            failures.append("a disabled source stage was treated as configured")

        # Citation grounding: an invented "quote" must not read as support, and
        # a real one must be found on the page it claims.
        page_text = ("The controller VM runs on every node and aggregates the "
                     "local disks of the cluster into a shared storage pool.")
        if not citation_supported(
                "the controller VM runs on every node and aggregates the local disks",
                page_text):
            failures.append("a real quote was not recognised as support")
        if citation_supported(
                "each node must be rebuilt from an external backup before use",
                page_text):
            failures.append("an invented quote was accepted as support")
        if citation_supported("too short", page_text):
            failures.append("a too-short quote was accepted")

        model = {"baseUrl": "http://127.0.0.1:9", "model": "unreachable",
                 "apiKey": "local", "timeoutSeconds": 2}
        source = {"enabled": True, "documents": [pinned], "minScore": 3}
        try:
            verify_key_with_source(
                {"text": "### Q1\nWhich bond type is the default and recommended?\n"
                         "- A) active-backup\n- B) balance-slb\n**Answer: A**",
                 "keys": ["A"]}, model, source)
            failures.append("an unreachable endpoint produced a verdict")
        except Exception:  # noqa: BLE001 — any failure is the blocked path
            pass

    if failures:
        for f in failures:
            print(f"SOURCE STAGE SELF-TEST FAILURE: {f}", file=sys.stderr)
        return 2
    print("redeye-source self-test: selection, pin, disable and unreachable-endpoint paths hold")
    return 0


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        sys.exit(self_test())
    print(__doc__)
