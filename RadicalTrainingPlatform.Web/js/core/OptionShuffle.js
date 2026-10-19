/**
 * Option shuffling with stable option IDs (T-24, R-09).
 *
 * The problem this solves is not cosmetic. Every bank in the reviewed set was
 * authored with the key on A (verified pre-repair: NCP-AI-Part1.md had 80/80
 * single-answer keys on A), so a learner who never reads the stem can farm
 * apparent accuracy by always answering "A". The fix is to present the options
 * in a per-run order and to score the *choice*, not the position.
 *
 * The distinction that makes that safe is identity vs position:
 *
 *   - A **stable option ID** is `<item id>#<source letter>` — the letter the
 *     bank authored the option under. It never changes when the display order
 *     changes, and it is derived from the item's canonical ID rather than from
 *     where the option happens to sit (SPEC-16: content IDs are never
 *     renumbered).
 *   - A **display letter** (A, B, C …) is whatever position the option occupies
 *     in this run. It is what the learner clicks and what a saved selection
 *     holds, and it means nothing on its own.
 *
 * Grading therefore always runs on stable IDs. `grade()` in the practice view
 * keeps its existing contract — it scores a list of stable IDs — and the view
 * translates the learner's display letters through `toStableIds` first. That is
 * what makes the result identical across every permutation.
 *
 * Shuffling is refused where the item's meaning depends on order or on the
 * letters themselves (R-09): sequence items, and items whose stem or options
 * refer to positions ("all of the above", "both A and C"). A refusal is not a
 * silent fallback — `shuffleRefusal` names the reason so the refusal can be
 * reported rather than guessed at.
 */

/** Minimum options before a permutation means anything. */
const MIN_OPTIONS = 2;

/**
 * Wording that makes a permutation unsafe: it points at a position or at a
 * letter, so moving the options would make the item self-contradictory.
 */
const POSITIONAL_PATTERNS = [
    /\ball of the above\b/i,
    /\bnone of the above\b/i,
    /\bboth\s+[A-F]\b/i,
    /\b(?:options?|answers?|choices?)\s+[A-F]\b/i,
    // Both letters must be single letters: without the `\b` after the first
    // `[A-F]`, `re.I`/`/i` let it match the "f" of "for" or the "c" of "core",
    // and "for a development team" was silently refused a shuffle.
    /\b[A-F]\b\s*(?:,\s*(?:and\s+)?|&|\band\b|\bor\b)\s*[A-F]\b/i,
];

/** Stable ID for one option of one item. */
export function optionId(item, sourceLetter) {
    return `${item.id}#${sourceLetter}`;
}

/** Stable IDs in the bank's authored order. */
export function optionIds(item) {
    return Object.keys(item.options || {}).map(letter => optionId(item, letter));
}

/** Source letter back out of a stable ID. */
export function sourceLetterOf(item, id) {
    const prefix = `${item.id}#`;
    return id.startsWith(prefix) ? id.slice(prefix.length) : null;
}

/**
 * Why this item must not be shuffled, or `null` when it may be.
 *
 * Reasons, all of them named so a caller can report rather than assume:
 *   'ordered'            — the sequence is the answer (R-03), so position is meaning
 *   'letter-referential' — the wording names a position or a letter
 *   'too-few-options'    — fewer than two options is not a choice
 *   'no-options'         — nothing parsed
 */
export function shuffleRefusal(item) {
    if (!item) return 'no-options';
    const letters = Object.keys(item.options || {});
    if (!letters.length) return 'no-options';
    if (item.isOrdered) return 'ordered';
    if (letters.length < MIN_OPTIONS) return 'too-few-options';
    const haystacks = [item.stem, ...letters.map(l => item.options[l])];
    for (const text of haystacks) {
        if (typeof text !== 'string') continue;
        if (POSITIONAL_PATTERNS.some(re => re.test(text))) return 'letter-referential';
    }
    return null;
}

export function isShufflable(item) {
    return shuffleRefusal(item) === null;
}

/** FNV-1a over a string — a small, stable seed for the PRNG below. */
function hashSeed(text) {
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i += 1) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

/** mulberry32 — deterministic given a 32-bit seed. */
function mulberry32(seed) {
    let a = seed >>> 0;
    return function next() {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** A fresh seed for one practice run. */
export function newRunSeed() {
    if (globalThis.crypto?.getRandomValues) {
        return globalThis.crypto.getRandomValues(new Uint32Array(1))[0];
    }
    // No CSPRNG (old browser, or a test stub): a clock-derived seed still
    // varies per run. Determinism only has to hold for a given (item, seed)
    // pair, and this is not a security boundary.
    return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

/**
 * Stable option IDs in display order for one item under one run seed.
 *
 * Deterministic: the same (item id, seed) always yields the same order, which
 * is what lets a resumed run restore a saved display-letter selection and still
 * mean the same thing. Not shufflable → authored order, unchanged.
 */
export function optionOrder(item, seed) {
    const ids = optionIds(item);
    if (shuffleRefusal(item) !== null) return ids;
    const rand = mulberry32(hashSeed(`${item.id}|${seed >>> 0}`));
    const out = [...ids];
    for (let i = out.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rand() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

/** Display letter → stable option ID, for one item under one run seed. */
export function displayMap(item, seed) {
    const map = {};
    optionOrder(item, seed).forEach((id, i) => {
        map[String.fromCharCode(65 + i)] = id;
    });
    return map;
}

/** Stable option ID → display letter (the inverse of `displayMap`). */
export function letterMap(item, seed) {
    const inverse = {};
    for (const [letter, id] of Object.entries(displayMap(item, seed))) {
        inverse[id] = letter;
    }
    return inverse;
}

/**
 * Translate what the learner clicked into what grading scores.
 *
 * Unknown letters are dropped rather than passed through: a stale saved
 * selection from a different run must not become a phantom correct answer.
 */
export function toStableIds(item, seed, displayLetters) {
    const map = displayMap(item, seed);
    const out = [];
    for (const letter of displayLetters || []) {
        const id = map[String(letter).toUpperCase()];
        if (id) out.push(id);
    }
    return out;
}

/** The display letters that are correct for this item — for feedback text. */
export function correctDisplayLetters(item, seed) {
    const letters = letterMap(item, seed);
    return (item.keys || []).map(key => letters[optionId(item, key)] ?? key);
}
