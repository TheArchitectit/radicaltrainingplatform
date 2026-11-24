#!/usr/bin/env python3
"""RedEye model stage: blind key-vs-source derivation (SPEC-08A REQ-REV-01a).

Split out of redeye-lane.py to keep both files under the 500-line source limit.
The lane owns the checks and the log format; this module owns the one network
call and the comparison that decides whether the key survives it.
"""
import json
import os
import re
import urllib.request


def model_stage_config(config_text):
    """The model block, or None when the stage is not integrated.

    Fail-closed by construction: no baseUrl or no model means the stage stays
    blocked, exactly as before this integration. The block names an endpoint,
    a model and (for a local endpoint whose key is a literal) an apiKey or an
    apiKeyEnv reference.
    """
    try:
        cfg = json.loads(config_text)
    except Exception:
        return None
    model = cfg.get("model") or {}
    if not model.get("baseUrl") or not model.get("model"):
        return None
    return model


def verify_key_with_model(item, model):
    """Blind derivation: ask the model to answer, then compare with the key.

    The keyed answer is deliberately NOT in the prompt. Showing it invites
    agreement and would make the check a tautology; SPEC-08A requires the model
    to derive an answer independently and the comparison to happen here.

    Raises on any doubt — timeout, HTTP error, empty content (a reasoning model
    can spend its whole budget reasoning and return null), malformed shape, or
    an answer that is not one of the item's options. A raised error leaves the
    stage blocked; only a successful derivation produces "verified".
    """
    key = os.environ.get(model.get("apiKeyEnv") or "", model.get("apiKey") or "")
    if not key:
        raise RuntimeError("no API key for the model stage")
    # parse_bank yields number/text/keys only; the options live in the raw
    # block, so they are extracted here rather than assumed to be a field.
    options = {}
    for line in (item.get("text") or "").splitlines():
        match = re.match(r"^-\s*([A-F])\)\s*(.+)$", line.strip())
        if match:
            options[match.group(1)] = match.group(2)
    if not options:
        raise RuntimeError("item has no options to derive an answer from")
    listing = "\n".join(f"{k}) {v}" for k, v in options.items())
    body = json.dumps({
        "model": model["model"],
        "temperature": 0,
        "max_tokens": int(model.get("maxTokens", 1200)),
        "messages": [
            {"role": "system",
             "content": "You answer certification exam items from your own knowledge. "
                        "Reply with JSON only: {\"answers\": [\"<letter>\", ...], "
                        "\"reason\": \"<20 words\"}"},
            {"role": "user",
             "content": f"{item.get('text', '')}\n\n{listing}\n\n"
                        "Which option(s) are correct?"},
        ],
    }).encode()
    req = urllib.request.Request(
        model["baseUrl"].rstrip("/") + "/v1/chat/completions", data=body,
        headers={"Content-Type": "application/json",
                 "Authorization": f"Bearer {key}"}, method="POST")
    with urllib.request.urlopen(req, timeout=int(model.get("timeoutSeconds", 180))) as resp:
        payload = json.loads(resp.read())
    content = (payload.get("choices") or [{}])[0].get("message", {}).get("content")
    if not content:
        raise RuntimeError("model returned no final content (reasoning-only reply)")
    verdict = json.loads(content)
    derived = verdict.get("answers")
    if not isinstance(derived, list) or not derived:
        raise RuntimeError(f"model reply is not the requested shape: {content[:120]}")
    derived = {str(a).strip().upper() for a in derived}
    unknown = derived - set(options)
    if unknown:
        raise RuntimeError(f"model answered with {sorted(unknown)}, which are not options")
    keyed = {str(k).strip().upper() for k in (item.get("keys") or [])}
    reason = str(verdict.get("reason", ""))
    if derived == keyed:
        return True, reason
    return False, f"model derived {sorted(derived)}; key says {sorted(keyed)}. {reason}".strip()
