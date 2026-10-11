import { BaseView } from './BaseView.js';
import { ITEMS, TRACKS, EXAMS, DISCLAIMER } from '../study-content.js';
import { progress } from '../core/ProgressStore.js';
import {
    optionOrder, toStableIds, sourceLetterOf, correctDisplayLetters, newRunSeed,
} from '../core/OptionShuffle.js';

/**
 * Practice view (T-11, REQ-UI-03) — scored sets drawn from the compiled
 * released banks. Scoring mirrors Core's ExamSessionViewModel.Grade
 * exactly: set equality (order-insensitive, count-sensitive) for choice
 * items; exact sequence equality for ordered items (R-03).
 *
 * Options are presented in a seeded per-run order (T-24, R-09) so a learner
 * cannot farm accuracy by always clicking A. Display letters are therefore
 * positions, not identities: everything the learner touches is translated to
 * stable option IDs before grading, and everything shown back to them is
 * translated the other way. See core/OptionShuffle.js.
 *
 * Review mode shows the reviewed explanation after each submission.
 * Assessment-style runs hide hints until submission (Plan v2 L-01); the
 * released banks carry no hints, so nothing is ever pre-revealed.
 */

/**
 * What the learner clicked (display letters) → what `grade` scores (the
 * bank's own source letters). The route runs through the stable option ID, so
 * the result cannot depend on where the option was displayed.
 */
export function selectionToKeys(item, seed, displayLetters) {
    return toStableIds(item, seed, displayLetters).map(id => sourceLetterOf(item, id));
}

/** Core-identical grading. `response` is an array of source letters. */
export function grade(item, response) {
    if (item.isOrdered) {
        if (response.length !== item.keys.length) {
            return { isCorrect: false, reason: response.length < item.keys.length ? 'missing-step' : 'extra-token' };
        }
        if (new Set(response).size !== response.length) {
            return { isCorrect: false, reason: 'duplicate-step' };
        }
        return { isCorrect: response.every((k, i) => k === item.keys[i]), reason: 'sequence-mismatch' };
    }
    const sorted = [...response].sort();
    const keysSorted = [...item.keys].sort();
    const isCorrect = sorted.length === keysSorted.length
        && sorted.every((k, i) => k === keysSorted[i]);
    return { isCorrect, reason: isCorrect ? '' : 'set-mismatch' };
}

export class PracticeView extends BaseView {
    // Per-element view state (one PracticeView instance per navigation).
    #queue = [];
    #index = 0;
    #selection = new Set();
    #results = [];
    #submitted = false;
    #restored = { attempted: 0, correct: 0, items: {} };
    // Per-run seed for the option order (T-24). Restored from the continuation
    // so a resumed run shows the same order it showed before — a saved
    // selection of display letters only means anything under the same seed.
    #runSeed = null;

    async render(params) {
        const examId = params.examId;
        const exam = EXAMS[examId];
        const track = Object.values(TRACKS).find(t => t.examIds.includes(examId));
        if (!exam) {
            return this.html(`<div class="study-page"><h1 class="study-title">Unknown exam</h1>
                <p><a href="#/tracks">Back to tracks</a></p></div>`);
        }
        // Draw only from released reviewed items for this exam (REQ-AP-02:
        // "practice sets draw only from the reviewed items and say so").
        this.#queue = ITEMS.filter(i => i.examId === examId)
            .slice()
            .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
        if (!this.#queue.length) {
            return this.html(`<div class="study-page">
                <a class="study-back" href="#/tracks">‹ All tracks</a>
                <h1 class="study-title">No practice items yet</h1>
                <p class="study-sub">Practice items for ${exam.displayName} are still in review. Check back when the pack is released.</p>
                <p class="study-disclaimer">${DISCLAIMER}</p></div>`);
        }
        this.#index = 0;
        this.#results = [];
        this.#submitted = false;
        this.#selection = new Set();
        // REQ-UI-04: restore prior progress for this exam. R-15: also
        // restore the mid-run position (index + in-progress selection).
        await progress.init();
        this.#restored = await progress.restore(examId, this.#queue.map(i => i.id));
        this.#runSeed = null;
        const cont = await progress.loadContinuation(examId);
        if (cont && cont.index >= 0 && cont.index < this.#queue.length) {
            this.#index = cont.index;
            this.#selection = new Set(cont.selection || []);
            this.#results = Array.isArray(cont.results) ? cont.results : [];
            if (Number.isInteger(cont.seed)) this.#runSeed = cont.seed >>> 0;
        }
        // A continuation from before T-24 carries no seed. Its saved selection
        // is display letters under an order we cannot reconstruct, so the run
        // restarts rather than grading a stale selection against a new order.
        if (cont && !Number.isInteger(cont.seed) && this.#selection.size) {
            this.#index = 0;
            this.#selection = new Set();
            this.#results = [];
        }
        if (this.#runSeed === null) this.#runSeed = newRunSeed();
        return this.#renderQuestion(exam, track);
    }

    #renderQuestion(exam, track) {
        const item = this.#queue[this.#index];
        const multi = item.isMultiSelect;
        const multiNote = multi ? '<span class="multi-note">Select all that apply</span>' : '';
        // Display order is seeded per run (T-24, R-09). The letter shown is the
        // position; the text comes from the stable ID that sits there.
        const options = optionOrder(item, this.#runSeed).map((id, i) => {
            const letter = String.fromCharCode(65 + i);
            const text = item.options[sourceLetterOf(item, id)];
            return `
            <button class="option-row ${this.#selection.has(letter) ? 'selected' : ''}" data-letter="${letter}">
                <span class="option-letter">${letter}</span>
                <span class="option-text">${text}</span>
            </button>`;
        }).join('');
        const progressLine = `${this.#index + 1} / ${this.#queue.length}`;
        const priorNote = this.#restored.attempted
            ? `<p class="practice-prior-note">Saved progress: ${this.#restored.correct}/${this.#restored.attempted} previously answered in this exam pack.</p>`
            : '';
        const resumeNote = this.#index > 0
            ? '<p class="practice-prior-note">Resumed at question ' + (this.#index + 1) + '.</p>'
            : '';
        return this.html(`
            <div class="study-page practice-page">
                <a class="study-back" href="#/tracks/${track?.trackId ?? ''}">‹ ${track?.title ?? 'Tracks'}</a>
                <h1 class="study-title">Practice — ${exam.displayName}</h1>
                <p class="study-sub">Draft pack (${track?.previewLabel ?? 'beginner preview'})${track?.coverageLabel ? ` · ${track.coverageLabel}` : ''} · draws only from reviewed items in this build.</p>
                ${priorNote}
                ${resumeNote}
                <div class="practice-progress">${progressLine}</div>
                <div class="practice-item">
                    <div class="practice-stem">${item.stem}</div>
                    ${multiNote}
                    <div class="option-list">${options}</div>
                    <div class="practice-controls">
                        <button class="study-button secondary" id="practice-skip">Skip</button>
                        <button class="study-button" id="practice-submit" ${this.#selection.size ? '' : 'disabled'}>Check answer</button>
                        <span class="practice-hint-note">${multi ? 'Choose ' + item.keys.length + ' options.' : 'Choose one option.'}</span>
                    </div>
                    <div id="practice-feedback"></div>
                </div>
                <p class="study-disclaimer">${DISCLAIMER}</p>
            </div>`);
    }

    #renderFeedback(exam, track, item, outcome) {
        // The learner never saw the bank's letters, so the feedback names the
        // letters they did see (T-24) — otherwise "correct answer: B" would
        // point at the wrong row.
        const letters = correctDisplayLetters(item, this.#runSeed).join(', ');
        const correctText = item.keys.map(k => item.options[k]).join('; ');
        const verdict = outcome.isCorrect
            ? '<div class="verdict correct">Correct</div>'
            : `<div class="verdict wrong">Not quite — correct answer: ${letters} (${correctText})</div>`;
        return `
            <div class="practice-feedback-inner">
                ${verdict}
                <div class="explanation"><h4>Why</h4><p>${item.explanation}</p></div>
                <button class="study-button" id="practice-next">
                    ${this.#index + 1 < this.#queue.length ? 'Next question ›' : 'See results ›'}
                </button>
                <p class="practice-tutor-entry">Confused by this one?
                    <a href="#/tutor/${exam.examId}">Ask the study coach</a> — the tutor is
                    available once an item is submitted, never while a set is still open.</p>
            </div>`;
    }

    #renderResults(exam, track) {
        const correct = this.#results.filter(r => r.isCorrect).length;
        const total = this.#results.length;
        const rows = this.#queue.map((item, i) => {
            const r = this.#results[i];
            const answer = correctDisplayLetters(item, this.#runSeed).join(', ');
            return `<div class="result-row">
                <span class="result-mark ${r.isCorrect ? 'correct' : 'wrong'}">${r.isCorrect ? '✓' : '✗'}</span>
                <span class="result-stem">${item.stem}</span>
                ${r.isCorrect ? '' : `<span class="result-answer">correct: ${answer}</span>`}
            </div>`;
        }).join('');
        return this.html(`
            <div class="study-page practice-page">
                <a class="study-back" href="#/tracks/${track?.trackId ?? ''}">‹ ${track?.title ?? 'Tracks'}</a>
                <h1 class="study-title">Results — ${exam.displayName}</h1>
                <p class="study-sub">${correct} of ${total} correct (${total ? Math.round(100 * correct / total) : 0}%). Draft pack — scores are practice, never pass prediction.</p>
                <div class="result-list">${rows}</div>
                <div class="lesson-actions">
                    <button class="study-button" id="practice-restart">Practice again</button>
                    <a class="study-button secondary" href="#/tracks/${track?.trackId ?? ''}">Back to track</a>
                    <a class="study-button secondary" href="#/tutor/${exam.examId}">Ask the study coach</a>
                </div>
                <p class="study-disclaimer">${DISCLAIMER}</p>
            </div>`);
    }

    afterRender(params) {
        const exam = EXAMS[params.examId];
        const track = Object.values(TRACKS).find(t => t.examIds.includes(params.examId));
        if (!exam || !this.#queue.length) return;
        const item = this.#queue[this.#index];

        // Restart lives on the results page (afterRender also runs after
        // #rerenderResults, where #submitted is false).
        const restart = this.root.querySelector('#practice-restart');
        restart?.addEventListener('click', () => {
            this.#index = 0;
            this.#results = [];
            this.#selection.clear();
            this.#submitted = false;
            this.#restored = { attempted: 0, correct: 0, items: {} };
            // "Practice again" is a new run, so it draws a new order (T-24) —
            // otherwise the second pass is a memory test of the first.
            this.#runSeed = newRunSeed();
            progress.clearContinuation(exam.examId).catch(() => {});
            this.#rerender(exam, track);
        });

        if (this.#submitted) {
            // Feedback state (in-place after submit; results page has no #practice-next).
            const next = this.root.querySelector('#practice-next');
            next?.addEventListener('click', () => {
                this.#submitted = false;
                if (this.#index + 1 < this.#queue.length) {
                    this.#index += 1;
                    this.#selection.clear();
                    this.#saveContinuation(exam);
                    this.#rerender(exam, track);
                } else {
                    progress.clearContinuation(exam.examId).catch(() => {});
                    this.#rerenderResults(exam, track);
                }
            });
            return;
        }

        const rows = this.root.querySelectorAll('.option-row');
        rows.forEach(row => row.addEventListener('click', () => {
            const letter = row.dataset.letter;
            if (item.isMultiSelect) {
                if (this.#selection.has(letter)) this.#selection.delete(letter);
                else this.#selection.add(letter);
                row.classList.toggle('selected', this.#selection.has(letter));
            } else {
                this.#selection.clear();
                this.#selection.add(letter);
                rows.forEach(r => r.classList.toggle('selected', r.dataset.letter === letter));
            }
            const submit = this.root.querySelector('#practice-submit');
            if (submit) submit.disabled = false;
            this.#saveContinuation(exam);
        }));

        // R-17: Skip is a real skip — ProgressStore.skipItem is the only
        // emitter of progress:skipped. It records a miss and advances.
        this.root.querySelector('#practice-skip')?.addEventListener('click', () => {
            if (this.#submitted) return;
            this.#results[this.#index] = { isCorrect: false };
            progress.skipItem(exam.examId, item.id)
                .then(r => {
                    if (r && !r.saved) this.#showSaveWarning();
                })
                .catch(() => this.#showSaveWarning());
            this.#advance(exam, track);
        });

        const submit = this.root.querySelector('#practice-submit');
        submit?.addEventListener('click', () => {
            if (!this.#selection.size || this.#submitted) return;
            // Display letters in, source letters out — the learner's click is
            // scored by what it chose, never by where it sat (T-24).
            const outcome = grade(item, selectionToKeys(item, this.#runSeed, [...this.#selection]));
            this.#results[this.#index] = { isCorrect: outcome.isCorrect };
            this.#submitted = true;
            // REQ-UI-05: every scored event persists; failure is surfaced,
            // never a silent false save (Plan v2 L-02). recordItem never
            // emits progress:skipped (R-17).
            progress.recordItem(exam.examId, item.id, outcome)
                .then(r => {
                    if (r && !r.saved) this.#showSaveWarning();
                })
                .catch(() => this.#showSaveWarning());
            const feedbackEl = this.root.querySelector('#practice-feedback');
            if (feedbackEl) feedbackEl.innerHTML = this.#renderFeedback(exam, track, item, outcome);
            submit.disabled = true;
            this.root.querySelector('#practice-next')?.addEventListener('click', () => {
                this.#advance(exam, track);
            });
        });
    }

    #advance(exam, track) {
        this.#submitted = false;
        if (this.#index + 1 < this.#queue.length) {
            this.#index += 1;
            this.#selection.clear();
            this.#saveContinuation(exam);
            this.#rerender(exam, track);
        } else {
            progress.clearContinuation(exam.examId).catch(() => {});
            this.#rerenderResults(exam, track);
        }
    }

    #saveContinuation(exam) {
        progress.saveContinuation(exam.examId, {
            index: this.#index,
            selection: [...this.#selection],
            results: this.#results.filter(Boolean),
            total: this.#queue.length,
            // The selection is display letters, so the order they belong to
            // has to travel with them (T-24).
            seed: this.#runSeed,
        }).catch(() => {
            // Continuation is a convenience: a failed write is not a scored
            // save, so it must not raise the scored-save warning. The run
            // itself continues.
        });
    }

    #showSaveWarning() {
        const note = this.root.querySelector('.practice-prior-note') || this.root.querySelector('.practice-progress');
        const warn = document.createElement('div');
        warn.className = 'practice-save-warning';
        warn.textContent = 'Progress could not be saved — your answers count for this run only. Check browser storage settings and try again.';
        note?.after(warn);
    }

    #rerender(exam, track) {
        const el = this.#renderQuestion(exam, track);
        this.#swap(el);
        this.afterRender({ examId: exam.examId });
    }

    #rerenderResults(exam, track) {
        const el = this.#renderResults(exam, track);
        this.#swap(el);
        this.afterRender({ examId: exam.examId });
    }

    #swap(el) {
        const parent = this.root.parentElement;
        if (!parent) return;
        parent.replaceChild(el, this.root);
        this.root = el;
    }
}
