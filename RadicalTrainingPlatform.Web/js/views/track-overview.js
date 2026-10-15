import { BaseView } from './BaseView.js';
import { TRACKS, LESSONS, EXAMS, DISCLAIMER } from '../study-content.js';

/**
 * Track overview (T-11, REQ-UI-01/02) — one track's exams and lesson modules.
 * Released lessons link to the lesson reader; unreleased modules render as
 * "planned" outlines, never dead links (REQ-UI-02). Exam screens show the
 * exact disclaimer (REQ-BRAND-02) and per-exam objective coverage.
 */
export class TrackOverviewView extends BaseView {
    async render(params) {
        const track = TRACKS[params.trackId];
        if (!track) {
            return this.html(`<div class="study-page"><h1 class="study-title">Unknown track</h1>
                <p><a href="#/tracks">Back to tracks</a></p></div>`);
        }
        const examBlocks = track.examIds.map(examId => {
            const exam = EXAMS[examId];
            const cov = track.coverage.examCoverage[examId] ||
                { total: 0, covered: 0, percent: 0 };
            const modules = Object.values(LESSONS).filter(l => l.examId === examId)
                .sort((a, b) => a.domainNumber.localeCompare(b.domainNumber, undefined, { numeric: true }));
            const moduleList = modules.map(m => m.status === 'released'
                ? `<a class="module-item released" href="#/tracks/${track.trackId}/lessons/${m.examId}/${m.lessonId}">
                     <span class="module-id">${m.lessonId}</span>
                     <span class="module-title">${m.title}</span>
                     <span class="module-tag released-tag">released</span></a>`
                : `<div class="module-item planned">
                     <span class="module-id">${m.lessonId}</span>
                     <span class="module-title">${m.title}</span>
                     <span class="module-tag planned-tag">planned</span></div>`).join('');
            const worked = (exam.workedExamples || []).map(we => `
                <article class="worked-example">
                    <p class="worked-example-label">${we.label}</p>
                    <h3 class="worked-example-title">${we.title}</h3>
                    <p class="worked-example-gap">declared gap: ${we.gap}</p>
                    <p class="worked-example-body">${we.body}</p>
                </article>`).join('');
            // S37-05: the deck is derived from this exam's released bank, so the
            // track is where a learner should meet it — beside the practice set
            // rather than only inside the flashcard route.
            const deckLink = `<a class="study-button secondary module-actions-link" href="#/flashcards/${examId}">Review this exam as flashcards</a>`;
            const gapList = (exam.gaps || []).length
                ? `<div class="gap-list"><p class="study-sub">Declared gaps (labeled worked examples, not interactive labs):
                    ${exam.gaps.map(g => `<span class="gap-tag">${g}</span>`).join('')}</p></div>`
                : '';
            return `
                <section class="exam-block">
                    <div class="exam-block-head">
                        <h2 class="exam-name">${exam.displayName}</h2>
                        <span class="coverage-text">coverage ${cov.covered}/${cov.total} objectives (${cov.percent}%)</span>
                    </div>
                    <div class="module-list">${moduleList}</div>
                    <div class="module-actions">${deckLink}</div>
                    ${gapList}
                    ${worked}
                </section>`;
        }).join('');
        const coverageLabel = track.coverageLabel
            ? ` · <span class="coverage-label">${track.coverageLabel}</span>`
            : '';
        return this.html(`
            <div class="study-page">
                <a class="study-back" href="#/tracks">‹ All tracks</a>
                <h1 class="study-title">${track.title}</h1>
                <p class="study-sub">${track.audience} · <span class="preview-label">${track.previewLabel}</span>${coverageLabel}</p>
                ${examBlocks}
                <p class="study-disclaimer">${DISCLAIMER}</p>
            </div>`);
    }
}
