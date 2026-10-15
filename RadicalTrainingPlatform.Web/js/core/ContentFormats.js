/**
 * ContentFormats (S37-01) — the registry of the content formats the study
 * surface can render, and the one place that says what a content ID means.
 *
 * Before this, each surface knew its own ID shape and nothing else. The
 * practice view keyed progress by `examId/itemId`; the scenario surface keyed
 * by a bare `scenarioId`; the lesson reader derived its key from a path. Three
 * surfaces, three private conventions, no single answer to "what formats
 * exist" — which is the thing a format registry exists to answer, and the
 * precondition for S37-06 (per-type progress), S37-05 (cross-linking) and
 * S37-07 (search), all of which need to name a format.
 *
 * This module is deliberately **dependency-free**. It describes formats and
 * classifies ID strings; it does not enumerate content and it does not import
 * a view. Enumeration needs the content sources, which live in a data module
 * and a view module respectively, and a core module that reached into a view
 * would invert the layering this repository keeps everywhere else.
 *
 * ## The four formats
 *
 *   lesson     `<examId>/<lessonId>`                     COMPTIA-A-1201/A2
 *   item       `<examId>/<sourceFile>/<number>`          COMPTIA-A-1201/core1-a2-fixtures.md/Q1
 *   scenario   `<scenarioId>`                            mci-01
 *   flashcard  — shares the **item** ID space            COMPTIA-A-1201/core1-a2-fixtures.md/Q1
 *
 * The item ID shape is not a convention invented here: it is the source-aware
 * semantic ID the content pipeline already uses (R-13), and this registry
 * adopts it rather than inventing a second one. A bare exam+number is
 * ambiguous across multi-part banks and is not accepted anywhere.
 *
 * ## Flashcards do not get their own IDs, on purpose
 *
 * A flashcard is not new content. It is an existing item *presented* as a
 * prompt/answer pair — front is the stem, back is the key plus the
 * explanation. Deriving it means the deck cannot drift from the bank, and it
 * means the sprint authors no new content, touches no manifest, and leaves the
 * content, lint and RedEye gates exactly as they were. The cost is that a
 * flashcard and its item share one ID, so `formatFor()` cannot tell them
 * apart and does not try: it classifies content *identity*, and callers that
 * need the format name it explicitly (see `progressKeyFor`).
 *
 * That distinction is why flashcard review is keyed separately from scored
 * practice. "I reviewed this card" and "I answered this item correctly" are
 * different facts about a learner, and merging them would let a card flip
 * inflate a score.
 */

/**
 * The registry. Every entry is frozen; adding a format is a deliberate edit
 * here, not an incidental one somewhere else.
 *
 * `idShape` is documentation for a human — `formatFor` is the executable
 * classifier. `route` is null where no route exists yet, rather than a
 * plausible-looking path that would 404.
 */
export const CONTENT_FORMATS = Object.freeze({
    lesson: Object.freeze({
        id: 'lesson',
        label: 'Lesson',
        plural: 'Lessons',
        idShape: '<examId>/<lessonId>',
        example: 'COMPTIA-A-1201/A2',
        source: 'js/study-content.js — LESSONS',
        route: '#/tracks/:trackId/lessons/:examId/:lessonId',
        // What progress means here: a lesson is read, not scored. There is no
        // right answer, so no attempt record and no streak contribution.
        progressKind: 'read',
        scorable: false,
    }),
    item: Object.freeze({
        id: 'item',
        label: 'Practice item',
        plural: 'Practice items',
        idShape: '<examId>/<sourceFile>/<number>',
        example: 'COMPTIA-A-1201/core1-a2-fixtures.md/Q1',
        source: 'js/study-content.js — ITEMS',
        route: '#/practice/:examId',
        progressKind: 'scored',
        scorable: true,
    }),
    scenario: Object.freeze({
        id: 'scenario',
        label: 'Guided scenario',
        plural: 'Guided scenarios',
        idShape: '<scenarioId>',
        example: 'mci-01',
        source: 'js/views/scenarios.js — SCENARIOS',
        route: '#/pc/scenarios',
        progressKind: 'completion',
        scorable: false,
    }),
    flashcard: Object.freeze({
        id: 'flashcard',
        label: 'Flashcard',
        plural: 'Flashcards',
        // Deliberately the same shape as `item`: a card is a view over an item.
        idShape: '<examId>/<sourceFile>/<number>  (shared with item)',
        example: 'COMPTIA-A-1201/core1-a2-fixtures.md/Q1',
        source: 'derived from js/study-content.js — ITEMS (no new content)',
        route: '#/flashcards/:examId',
        progressKind: 'reviewed',
        scorable: false,
    }),
});

/** Format IDs in registry order — the order surfaces should present them in. */
export const FORMAT_IDS = Object.freeze(Object.keys(CONTENT_FORMATS));

export function isKnownFormat(formatId) {
    return Object.prototype.hasOwnProperty.call(CONTENT_FORMATS, formatId);
}

/**
 * The descriptor for a format, or `null` for an unknown one.
 *
 * Returns null rather than throwing: a caller classifying untrusted input (a
 * hash path, a stored key) should be able to ask without a try/catch, and an
 * unknown format is a thing to report, not a crash.
 */
export function format(formatId) {
    return isKnownFormat(formatId) ? CONTENT_FORMATS[formatId] : null;
}

/**
 * Classify a content ID by its shape. Returns a format ID, or `null` when the
 * ID matches no format.
 *
 * The rule is the slash count, which is sound because no ID in the content
 * carries a slash inside a segment: exam IDs (`COMPTIA-A-1201`, `NCA-75`) and
 * lesson IDs (`A2`) have none, and all 50 scenario IDs are slash-free
 * (`mci-01`, `netplus-gw-01`). A future ID with a slash in a segment would break
 * this, so `null` is returned rather than a guess when the count is
 * unrecognised — and the fixture suite pins the counts.
 *
 * `flashcard` is not returned by this function and cannot be: a card shares
 * its item's ID. Callers that need to know a card from its item name the
 * format explicitly.
 */
export function formatFor(contentId) {
    const text = String(contentId ?? '');
    if (!text) return null;
    let slashes = 0;
    for (let i = 0; i < text.length; i += 1) {
        if (text.charCodeAt(i) === 47) slashes += 1; // '/'
    }
    if (slashes === 0) return 'scenario';
    if (slashes === 1) return 'lesson';
    if (slashes === 2) return 'item';
    return null;
}

/**
 * The ProgressStore key for one piece of content under one format.
 *
 * `progress/content/<formatId>/<contentId>` — a namespace deliberately
 * separate from `progress/<examId>/...` so a content ID that happens to
 * resemble an exam-scoped key cannot collide with one. It still sits under
 * `progress/`, which is what makes `clearStation()`'s `store.keys('progress/')`
 * sweep reach it: a demo reset clears this without ProgressStore needing to
 * learn about formats.
 *
 * Throws on an unknown format or an empty ID — both are programming errors at
 * a call site that has the format in hand, unlike `formatFor`, which is
 * classifying input it did not choose.
 */
export function progressKeyFor(formatId, contentId) {
    if (!isKnownFormat(formatId)) {
        throw new Error(`ContentFormats: unknown format '${formatId}'`);
    }
    const text = String(contentId ?? '');
    if (!text) {
        throw new Error(`ContentFormats: empty content id for format '${formatId}'`);
    }
    return `progress/content/${formatId}/${text}`;
}

/** The key prefix that holds every format's progress — for enumeration. */
export const CONTENT_PROGRESS_PREFIX = 'progress/content/';
