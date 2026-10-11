/**
 * Corpus index (REQ-AI-02, TM-62).
 *
 * Evidence is a small allowlisted corpus, not a search over the repository.
 * Each record declares its rights, and the index builder *drops* any record
 * without transmission rights and names it in the build report. Dropping
 * silently would be worse than keeping it: a report that lists what was
 * excluded is the only way a reviewer can tell "no vendor text was sent"
 * apart from "the filter never ran".
 *
 * The lesson text is read from `content/` at index time. That is fine for a
 * service; the Pages artifact cannot read `content/` at runtime, which is why
 * the *shipped* tutor answers are prewritten (see Web/js/data/tutor-recorded.js).
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/** Reasons a record is kept out of the transmissible index. */
export const EXCLUSION = {
    NO_TRANSMISSION: 'no provider-transmission right',
    NO_RETRIEVAL: 'no retrieval right',
    MISSING_TEXT: 'locator present but the file is missing',
    NO_LOCATOR: 'linking-only record (URL, no local text)',
};

/**
 * Build the transmissible index.
 *
 * @param {object} corpus   parsed corpus.json
 * @param {string} root     repository root the locators are relative to
 * @returns {{index: object[], excluded: object[], report: string[]}}
 */
export function buildIndex(corpus, root) {
    if (!corpus || !Array.isArray(corpus.records)) {
        throw new Error('corpus must have a records array');
    }
    const index = [];
    const excluded = [];
    const report = [];

    for (const record of corpus.records) {
        const rights = record.rights || {};
        let reason = null;
        if (rights.retrieval !== true) reason = EXCLUSION.NO_RETRIEVAL;
        else if (rights.providerTransmission !== true) reason = EXCLUSION.NO_TRANSMISSION;
        else if (!record.locator) reason = EXCLUSION.NO_LOCATOR;

        if (reason) {
            excluded.push({ sourceId: record.sourceId, reason });
            report.push(`excluded ${record.sourceId}: ${reason}`);
            continue;
        }

        const path = join(root, record.locator);
        if (!existsSync(path)) {
            excluded.push({ sourceId: record.sourceId, reason: EXCLUSION.MISSING_TEXT });
            report.push(`excluded ${record.sourceId}: ${EXCLUSION.MISSING_TEXT} (${record.locator})`);
            continue;
        }

        index.push({
            sourceId: record.sourceId,
            title: record.title,
            url: record.url || null,
            examId: record.examId,
            objectiveIds: record.objectiveIds || [],
            version: record.version,
            text: readFileSync(path, 'utf8'),
        });
        report.push(`included ${record.sourceId} (${record.locator})`);
    }

    return { index, excluded, report };
}

/**
 * Retrieve evidence for a request. Deliberately simple and explainable: score
 * by objective match, then lesson identity, then term overlap. There is no
 * vector store and no external search — the corpus is small enough that a
 * reviewer can read every record, which is the point of an allowlist.
 *
 * @param {object[]} index   from buildIndex()
 * @param {object}   request normalized contract request
 * @param {number}   limit   max evidence records
 */
export function retrieve(index, request, limit = 3) {
    const terms = termsOf(request.question);
    const scored = index.map(record => {
        let score = 0;
        if (request.lessonId && record.sourceId.toLowerCase().endsWith(
                `${request.examId}/${request.lessonId}`.toLowerCase())) {
            score += 100; // the lesson the learner is standing in
        }
        if (request.objectiveId && record.objectiveIds.includes(request.objectiveId)) {
            score += 40;
        }
        if (request.examId && record.examId === request.examId) score += 10;
        const haystack = `${record.title} ${record.text}`.toLowerCase();
        for (const term of terms) if (haystack.includes(term)) score += 3;
        return { record, score };
    });

    return scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score || a.record.sourceId.localeCompare(b.record.sourceId))
        .slice(0, limit)
        .map(s => s.record);
}

const STOPWORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'be', 'to', 'of',
    'in', 'on', 'at', 'it', 'this', 'that', 'i', 'me', 'my', 'you', 'your',
    'what', 'which', 'why', 'how', 'do', 'does', 'should', 'can', 'not', 'no',
    'one', 'give', 'hint', 'answer', 'first', 'check', 'get', 'got', 'with',
]);

function termsOf(text) {
    return [...new Set(
        text.toLowerCase()
            .split(/[^a-z0-9]+/)
            .filter(t => t.length > 2 && !STOPWORDS.has(t))
    )];
}

/** Source IDs the model is allowed to cite — used by the output validator. */
export function allowedCitations(evidence) {
    return new Set(evidence.map(e => e.sourceId));
}
