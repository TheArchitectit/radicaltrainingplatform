import { BaseView } from './BaseView.js';
import { ITEMS, TRACKS, EXAMS, DISCLAIMER } from '../study-content.js';

/**
 * Practice view (T-11, REQ-UI-03) — scored sets drawn from the compiled
 * released banks. Scoring mirrors Core's ExamSessionViewModel.Grade
 * exactly: set equality (order-insensitive, count-sensitive) for choice
 * items; exact sequence equality for ordered items (R-03).
 *
 * Review mode shows the reviewed explanation after each submission.
 * Assessment-style runs hide hints until submission (Plan v2 L-01); the
 * released banks carry no hints, so nothing is ever pre-revealed.
 */

/** Core-identical grading. `response` is an array of option letters. */
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
        return this.#renderQuestion(exam, track);
    }

    #renderQuestion(exam, track) {
        const item = this.#queue[this.#index];
        const multi = item.isMultiSelect;
        const multiNote = multi ? '<span class="multi-note">Select all that apply</span>' : '';
        const options = Object.entries(item.options).map(([letter, text]) => `
            <button class="option-row ${this.#selection.has(letter) ? 'selected' : ''}" data-letter="${letter}">
                <span class="option-letter">${letter}</span>
                <span class="option-text">${text}</span>
            </button>`).join('');
        const progress = `${this.#index + 1} / ${this.#queue.length}`;
        return this.html(`
            <div class="study-page practice-page">
                <a class="study-back" href="#/tracks/${track?.trackId ?? ''}">‹ ${track?.title ?? 'Tracks'}</a>
                <h1 class="study-title">Practice — ${exam.displayName}</h1>
                <p class="study-sub">Draft pack (${track?.previewLabel ?? 'beginner preview'}) · draws only from reviewed items in this build.</p>
                <div class="practice-progress">${progress}</div>
                <div class="practice-item">
                    <div class="practice-stem">${item.stem}</div>
                    ${multiNote}
                    <div class="option-list">${options}</div>
                    <div class="practice-controls">
                        <button class="study-button" id="practice-submit" ${this.#selection.size ? '' : 'disabled'}>Check answer</button>
                        <span class="practice-hint-note">${multi ? 'Choose ' + item.keys.length + ' options.' : 'Choose one option.'}</span>
                    </div>
                    <div id="practice-feedback"></div>
                </div>
                <p class="study-disclaimer">${DISCLAIMER}</p>
            </div>`);
    }

    #renderFeedback(exam, track, item, outcome) {
        const letters = item.keys.join(', ');
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
            </div>`;
    }

    #renderResults(exam, track) {
        const correct = this.#results.filter(r => r.isCorrect).length;
        const total = this.#results.length;
        const rows = this.#queue.map((item, i) => {
            const r = this.#results[i];
            return `<div class="result-row">
                <span class="result-mark ${r.isCorrect ? 'correct' : 'wrong'}">${r.isCorrect ? '✓' : '✗'}</span>
                <span class="result-stem">${item.stem}</span>
                ${r.isCorrect ? '' : `<span class="result-answer">correct: ${item.keys.join(', ')}</span>`}
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
                    this.#rerender(exam, track);
                } else {
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
        }));

        const submit = this.root.querySelector('#practice-submit');
        submit?.addEventListener('click', () => {
            if (!this.#selection.size || this.#submitted) return;
            const outcome = grade(item, [...this.#selection]);
            this.#results[this.#index] = { isCorrect: outcome.isCorrect };
            this.#submitted = true;
            const feedbackEl = this.root.querySelector('#practice-feedback');
            if (feedbackEl) feedbackEl.innerHTML = this.#renderFeedback(exam, track, item, outcome);
            submit.disabled = true;
            this.root.querySelector('#practice-next')?.addEventListener('click', () => {
                this.#submitted = false;
                if (this.#index + 1 < this.#queue.length) {
                    this.#index += 1;
                    this.#selection.clear();
                    this.#rerender(exam, track);
                } else {
                    this.#rerenderResults(exam, track);
                }
            });
        });
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
