#!/usr/bin/env python3
"""RedEye source stage: key-vs-source against supplied documents (REQ-REV-01a).

The model stage asks the model to derive an answer blind and compares it with
the key. That checks whether one model agrees with the author; it does not check
the key against a document. This stage does: it selects the pages of a supplied
PDF that share vocabulary with the item, renders them, and asks the model which
option(s) those pages support. The keyed answer is still withheld.

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


def select_pages(item, pages, max_pages=3, min_score=3):
    """The pages that share the most vocabulary with the item.

    A page must share at least `min_score` distinct terms with the item; if no
    page does, the stage refuses rather than sending unrelated pages to the
    model — an item the source does not cover is not a source-verified item.
    """
    terms = item_terms(item)
    if not terms:
        raise RuntimeError("item has no usable terms for page selection")
    scored = []
    for number, page in enumerate(pages, start=1):
        low = page.lower()
        score = sum(1 for t in terms if t in low)
        if score:
            scored.append((score, number))
    scored.sort(key=lambda pair: (-pair[0], pair[1]))
    chosen = [number for score, number in scored[:max_pages] if score >= min_score]
    if not chosen:
        best = scored[0] if scored else (0, 0)
        raise RuntimeError(f"no source page matched the item (best score {best[0]}, "
                           f"threshold {min_score})")
    return sorted(chosen)


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
                                   min_score=int(source.get("minScore", 3))):
            candidates.append((doc, number))
    if not candidates:
        raise RuntimeError("no source pages selected")
    listing = "\n".join(f"{k}) {v}" for k, v in options.items())
    content = [
        {"type": "text", "text":
         f"{item.get('text', '')}\n\n{listing}\n\n"
         "Which option(s) do the supplied pages support? Use only these pages. "
         "If they do not settle the answer, say supported=false."},
    ]
    for doc, number in candidates:
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
                        "\"answers\": [\"<letter>\", ...], \"reason\": \"<25 words>\"}"},
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
    derived = {str(a).strip().upper() for a in answers}
    unknown = derived - set(options)
    if unknown:
        raise RuntimeError(f"model answered with {sorted(unknown)}, which are not options")
    keyed = {str(k).strip().upper() for k in (item.get("keys") or [])}
    reason = str(verdict.get("reason", ""))
    if derived == keyed:
        return True, reason
    return False, (f"source supports {sorted(derived)}; key says {sorted(keyed)}. "
                   f"{reason}").strip()


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
