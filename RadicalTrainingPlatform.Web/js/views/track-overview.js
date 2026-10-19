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
                { total: 0, covered: 0, percent: 0, coveredObjectiveIds: [] };
            // S39: the percentage is not actionable on its own. A teacher or a
            // learner needs to know WHICH published objectives have no released
            // lesson-and-item pair yet, so the detail names them. The list is
            // derived from the exam's own objective structure rather than a
            // second hand-maintained list, and is empty when the compiler's
            // covered set already spans every objective.
            const objectiveIds = new Set(cov.coveredObjectiveIds || []);
            const allObjectives = (exam.sections || []).flatMap(section =>
                (section.objectives || []).map(objective => ({ ...objective, section: section.number })));
            const uncovered = allObjectives.filter(objective => !objectiveIds.has(objective.id));
            const coverageDetail = allObjectives.length === 0
                ? ''
                : uncovered.length === 0
                    ? `<p class="coverage-detail-empty">Every published objective in this exam has a released lesson and practice items.</p>`
                    : `<details class="coverage-detail">
                        <summary>${uncovered.length} of ${allObjectives.length} published objectives have no released lesson and item yet</summary>
                        <ul class="coverage-detail-list">${uncovered.map(objective =>
                            `<li><span class="objective-id">${objective.id}</span> ${objective.title}</li>`).join('')}</ul>
                    </details>`;
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
                    ${coverageDetail}
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
