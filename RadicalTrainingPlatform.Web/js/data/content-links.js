import { TRACKS, LESSONS, EXAMS } from '../study-content.js';

/**
 * ContentLinks (S37-05) — resolves the links between the study surfaces:
 * lesson ↔ item ↔ objective ↔ deck, and the exam's guided scenarios.
 *
 * This is a **data** module, not a core module, and that placement is the
 * point. `js/core/` describes and classifies; it does not enumerate content.
 * Every core module in this repository is content-free (see the header of
 * `ContentFormats.js`, which classifies IDs but deliberately refuses to list
 * them), and the one thing this module does is enumerate. So it sits in
 * `js/data/` beside `tutor-recorded.js`, which is the same kind of thing: a
 * hand-written module over generated content.
 *
 * ## What links, and what does not
 *
 * The structural anchors that exist in the data are:
 *
 *   item      → examId, objectiveId          (a blueprint objective)
 *   lesson    → examId, lessonId, objectiveIds
 *   track     → examIds
 *   scenario  → exam                         (its own `obj-N` space, not blueprint IDs)
 *
 * So an item reaches its lesson **through the blueprint objective**, and a
 * lesson reaches the practice set, the deck and its exam's scenarios directly.
 *
 * What does **not** exist is a per-lesson scenario link. Four beginner
 * scenarios name a lesson in their prose ("Powers lesson 1.3", "Powers lesson
 * 2.1"), but that is a sentence, not a field — parsing it would be a guess
 * dressed as a fact, and the scenario objective IDs (`obj-1`) are a separate
 * space from blueprint IDs (`2.3`). So the lesson links to the exam's guided
 * scenarios as a set, which is what the data actually supports. Recording that
 * is more useful than a link that looks precise and is not.
 */

/** The track that carries an exam, or null. */
export function trackForExam(examId) {
    return Object.values(TRACKS).find(t => t.examIds.includes(examId)) || null;
}

/** The lesson's own key, `<examId>/<lessonId>` — the key `LESSONS` uses. */
export function lessonKeyOf(lesson) {
    return lesson ? `${lesson.examId}/${lesson.lessonId}` : null;
}

/** Released lessons for an exam, in domain order. */
export function releasedLessons(examId) {
    return Object.values(LESSONS)
        .filter(l => l.examId === examId && l.status === 'released')
        .sort((a, b) => a.lessonId.localeCompare(b.lessonId, undefined, { numeric: true }));
}

/**
 * The released lesson that covers a blueprint objective, or null.
 *
 * An objective can be covered by more than one lesson; the **lowest lesson ID**
 * wins, so the answer is stable across runs and across a reordering of the
 * source object. Returning null rather than a nearest guess matters: a link to
 * a lesson that does not cover the objective is worse than no link, because a
 * learner would trust it.
 */
export function lessonForObjective(examId, objectiveId) {
    if (!examId || !objectiveId) return null;
    return releasedLessons(examId)
        .find(l => l.objectiveIds.includes(objectiveId)) || null;
}

/** A blueprint objective's `{ id, title }`, or null. */
export function objectiveOf(examId, objectiveId) {
    const exam = EXAMS[examId];
    if (!exam || !objectiveId) return null;
    for (const section of exam.sections || []) {
        const found = (section.objectives || []).find(o => o.id === objectiveId);
        if (found) return found;
    }
    return null;
}

export function lessonHref(trackId, lesson) {
    return `#/tracks/${trackId}/lessons/${lesson.examId}/${lesson.lessonId}`;
}

export function practiceHref(examId) {
    return `#/practice/${examId}`;
}

export function deckHref(examId) {
    return `#/flashcards/${examId}`;
}

export function trackHref(trackId) {
    return `#/tracks/${trackId}`;
}

/** The guided-scenarios catalogue. Scenarios are grouped there by exam. */
export function scenariosHref() {
    return '#/pc/scenarios';
}

/**
 * Everything an item links to: the lesson that teaches it, the objective it
 * belongs to, its deck, and its scored practice set.
 *
 * `lesson` is null when no released lesson covers the item's objective — which
 * is the common case for the wider bank, and is reported honestly rather than
 * filled with a plausible neighbour.
 */
export function linksForItem(item) {
    if (!item) return null;
    const track = trackForExam(item.examId);
    const lesson = lessonForObjective(item.examId, item.objectiveId);
    return {
        examId: item.examId,
        objective: objectiveOf(item.examId, item.objectiveId),
        lesson: lesson && track
            ? { href: lessonHref(track.trackId, lesson), title: lesson.title, lessonId: lesson.lessonId }
            : null,
        practice: { href: practiceHref(item.examId) },
        deck: { href: deckHref(item.examId) },
    };
}

/** Everything a lesson links to, given the lesson and its track. */
export function linksForLesson(lesson, track) {
    if (!lesson) return null;
    return {
        examId: lesson.examId,
        practice: { href: practiceHref(lesson.examId) },
        deck: { href: deckHref(lesson.examId) },
        scenarios: { href: scenariosHref() },
        track: track ? { href: trackHref(track.trackId), title: track.title } : null,
    };
}
