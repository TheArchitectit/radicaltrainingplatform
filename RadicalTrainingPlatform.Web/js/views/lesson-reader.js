import { BaseView } from './BaseView.js';
import { TRACKS, LESSONS, EXAMS, DISCLAIMER } from '../study-content.js';

/**
 * Lesson reader (T-11, REQ-UI-02) — renders a reviewed lesson's markdown
 * with the objective IDs the manifest maps it to. Markdown rendering is
 * deliberately minimal and escape-first: paragraphs, ##/### headings, bold,
 * inline code, lists. No raw HTML from lesson files reaches the DOM.
 */
export class LessonReaderView extends BaseView {
    async render(params) {
        const key = `${params.examId}/${params.lessonId}`;
        const lesson = LESSONS[key];
        const track = TRACKS[params.trackId];
        if (!lesson || lesson.status !== 'released' || !track) {
            return this.html(`<div class="study-page"><h1 class="study-title">Lesson not available</h1>
                <p><a href="#/tracks">Back to tracks</a></p></div>`);
        }
        const exam = EXAMS[lesson.examId];
        const objectives = lesson.objectiveIds
            .map(id => {
                const obj = exam.sections.flatMap(s => s.objectives).find(o => o.id === id);
                return obj ? `<li><span class="objective-id">${obj.id}</span> ${obj.title}</li>` : '';
            })
            .filter(Boolean).join('');
        return this.html(`
            <div class="study-page lesson-page">
                <a class="study-back" href="#/tracks/${track.trackId}">‹ ${track.title}</a>
                <h1 class="study-title">${lesson.title}</h1>
                <p class="study-sub">${exam.displayName} · Domain ${lesson.domainNumber} · <span class="preview-label">${track.previewLabel}</span></p>
                ${objectives ? `<div class="lesson-objectives"><h3>Exam objectives covered</h3><ul>${objectives}</ul></div>` : ''}
                <div class="lesson-body">${this.#renderMarkdown(lesson.markdown)}</div>
                <div class="lesson-actions">
                    <a class="study-button" href="#/practice/${lesson.examId}">Practice this exam ›</a>
                </div>
                <p class="study-disclaimer">${DISCLAIMER}</p>
            </div>`);
    }

    /** Escape-first markdown subset: headings, lists, bold, code, paragraphs. */
    #renderMarkdown(md) {
        const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const inline = (s) => esc(s)
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/`([^`]+)`/g, '<code>$1</code>');
        const out = [];
        let inList = false;
        let listType = null;
        const closeList = () => {
            if (inList) { out.push(`</${listType}>`); inList = false; listType = null; }
        };
        for (const rawLine of md.split('\n')) {
            const line = rawLine.trimEnd();
            if (/^---\s*$/.test(line) || line === '') { closeList(); continue; }
            if (/^\*\*.*\*\*$/.test(line) && line.length < 200) {
                // Standalone bold line = a heading-like callout.
                closeList();
                out.push(`<h3>${inline(line)}</h3>`);
                continue;
            }
            const h = line.match(/^(#{1,4})\s+(.*)$/);
            if (h) {
                closeList();
                const level = Math.min(h[1].length + 1, 5);
                out.push(`<h${level}>${inline(h[2])}</h${level}>`);
                continue;
            }
            const li = line.match(/^[-*]\s+(.*)$/);
            if (li) {
                if (!inList || listType !== 'ul') { closeList(); out.push('<ul>'); inList = true; listType = 'ul'; }
                out.push(`<li>${inline(li[1])}</li>`);
                continue;
            }
            const ol = line.match(/^\d+\.\s+(.*)$/);
            if (ol) {
                if (!inList || listType !== 'ol') { closeList(); out.push('<ol>'); inList = true; listType = 'ol'; }
                out.push(`<li>${inline(ol[1])}</li>`);
                continue;
            }
            closeList();
            out.push(`<p>${inline(line)}</p>`);
        }
        closeList();
        return out.join('\n');
    }
}
