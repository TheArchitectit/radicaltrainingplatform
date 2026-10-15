/**
 * Tutor panel (T-23, REQ-AI-01..07).
 *
 * One component, mounted from the lesson reader and the practice view in study
 * mode only — assessment runs have no tutor until submission (Plan v2 L-01),
 * so `mountTutorPanel` refuses to attach while a set is unsubmitted.
 *
 * The panel's job is to be honest about three things:
 *
 *   - what it is. The mode label is always present: "recorded example" when the
 *     shipped fallback is answering, "live tutor" only when the learner has
 *     been told what that means and agreed. There is no state in which a
 *     prewritten answer is presented as a live one (REQ-AI-07).
 *   - what it is not. It is general IT-skills coaching over the original
 *     lessons — never vendor-endorsed exam preparation (REQ-BRAND-01). It
 *     cannot grade, change a score, or run anything on any system.
 *   - what it cannot do. Unavailable and insufficient-evidence are rendered
 *     states with their own text, not failures that fall back to a plausible
 *     guess (REQ-AI-05).
 *
 * Rendering is escape-first: every model-supplied string goes through
 * `textContent`. The gateway sanitizes too — neither layer trusts the other.
 */
import { BaseView } from './BaseView.js';
import { EXAMS, LESSONS, TRACKS, DISCLAIMER } from '../study-content.js';
import { tutor, MODE_LIVE } from '../core/TutorClient.js';
import { RECORDED_EXAMPLE_LABEL, RECORDED_EXAMPLE_NOTE } from '../data/tutor-recorded.js';

/** Map a corpus source ID to the local route that opens it. */
export function citationLink(sourceId) {
    const m = /^lesson:([^/]+)\/(.+)$/.exec(sourceId || '');
    if (!m) return null;
    const [, examId, lessonId] = m;
    const key = `${examId}/${lessonId}`;
    const lesson = LESSONS[key];
    const track = Object.values(TRACKS).find(t => t.examIds.includes(examId));
    if (!lesson || lesson.status !== 'released' || !track) return null;
    return {
        href: `#/tracks/${track.trackId}/lessons/${examId}/${lessonId}`,
        title: lesson.title,
    };
}

/** Where the panel should ask from — the lesson the learner is standing in. */
function contextFor({ examId, lessonId, objectiveId, trackId }) {
    const exam = EXAMS[examId];
    return {
        examId,
        lessonId: lessonId || null,
        objectiveId: objectiveId || null,
        trackId: trackId || Object.values(TRACKS).find(t => t.examIds.includes(examId))?.trackId || null,
        examVersion: exam ? `${exam.officialVersion} / objectives ${exam.objectivesDocVersion}` : null,
    };
}

export class TutorPanel {
    #context;
    #root = null;
    #onSubmit = null;

    constructor(context) {
        this.#context = contextFor(context);
    }

    /** Build the panel element. Does not attach it — the caller decides where. */
    element() {
        const panel = document.createElement('section');
        panel.className = 'tutor-panel';
        panel.id = 'tutor-panel';
        panel.innerHTML = `
            <div class="tutor-head">
                <h2 class="tutor-title">Study coach</h2>
                <span class="tutor-mode" id="tutor-mode"></span>
            </div>
            <p class="tutor-frame" id="tutor-frame"></p>
            <form class="tutor-form" id="tutor-form">
                <label class="tutor-label" for="tutor-question">Your question about this lesson</label>
                <textarea id="tutor-question" class="tutor-input" rows="2"
                    placeholder="Ask about the section you are on — not for the answer to a practice item."></textarea>
                <div class="tutor-form-row">
                    <button type="submit" class="study-button" id="tutor-ask">Ask</button>
                    <span class="tutor-privacy" id="tutor-privacy"></span>
                </div>
            </form>
            <div class="tutor-response" id="tutor-response" hidden></div>
            <div class="tutor-settings" id="tutor-settings"></div>
        `;
        this.#root = panel;
        panel.querySelector('#tutor-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.#ask();
        });
        this.#renderMode();
        this.#renderSettings();
        return panel;
    }

    /** The mode label + the sentence that says what the label means. */
    #renderMode() {
        const mode = this.#root.querySelector('#tutor-mode');
        const frame = this.#root.querySelector('#tutor-frame');
        const privacy = this.#root.querySelector('#tutor-privacy');
        if (tutor.mode() === MODE_LIVE) {
            mode.textContent = 'live tutor';
            mode.className = 'tutor-mode live';
            frame.textContent = 'General IT-skills coaching over the original lessons in this track. '
                + 'It cannot grade, change a score, or operate the simulation — and it is not '
                + 'vendor exam preparation.';
            privacy.textContent = 'No name, email or account is sent — only your question and the lesson you are on.';
        } else {
            mode.textContent = RECORDED_EXAMPLE_LABEL;
            mode.className = 'tutor-mode recorded';
            frame.textContent = RECORDED_EXAMPLE_NOTE;
            privacy.textContent = 'No name, email or account — nothing is sent anywhere.';
        }
    }

    /**
     * Online AI is optional and disclosed before first use (REQ-AI-05). This
     * is that disclosure: nothing here is on by default, and turning it on is
     * a deliberate act by the learner, not a default they inherit.
     */
    #renderSettings() {
        const box = this.#root.querySelector('#tutor-settings');
        const url = tutor.gatewayUrl();
        if (!url) {
            box.textContent = 'This station runs recorded examples only. No AI service is connected.';
            return;
        }
        const on = tutor.mode() === MODE_LIVE;
        box.innerHTML = `
            <label class="tutor-consent">
                <input type="checkbox" id="tutor-live-toggle" ${on ? 'checked' : ''}>
                <span>Use the online tutor for this session</span>
            </label>
            <p class="tutor-consent-note">
                Turning this on sends your question and the lesson you are on to the study platform's
                own AI gateway. It sends no name, email or account. Everything else on this station
                works with it off.
            </p>
        `;
        box.querySelector('#tutor-live-toggle').addEventListener('change', (e) => {
            if (e.target.checked) tutor.grantLiveConsent();
            else tutor.revokeLiveConsent();
            this.#renderMode();
        });
    }

    async #ask() {
        const input = this.#root.querySelector('#tutor-question');
        const question = input.value.trim();
        if (!question) return;
        const button = this.#root.querySelector('#tutor-ask');
        button.disabled = true;
        this.#renderResponse({ status: 'pending', text: 'Thinking…' });
        try {
            const result = await tutor.ask({ ...this.#context, question });
            this.#renderResponse(result);
            this.#onSubmit?.(result);
        } finally {
            button.disabled = false;
        }
    }

    /** Every model-supplied string is set with textContent, never innerHTML. */
    #renderResponse(result) {
        const box = this.#root.querySelector('#tutor-response');
        box.hidden = false;
        box.replaceChildren();

        const label = document.createElement('div');
        label.className = `tutor-response-label ${result.status}`;
        label.textContent = result.status === 'answer' ? (result.label || 'answer')
            : result.status === 'insufficient-evidence' ? 'not enough evidence'
                : result.status === 'unavailable' ? 'tutor unavailable'
                    : 'waiting';
        box.appendChild(label);

        const text = document.createElement('p');
        text.className = 'tutor-response-text';
        text.textContent = result.text;
        box.appendChild(text);

        if (result.citations?.length) {
            const list = document.createElement('ul');
            list.className = 'tutor-citations';
            for (const id of result.citations) {
                const link = citationLink(id);
                const li = document.createElement('li');
                if (link) {
                    const a = document.createElement('a');
                    a.href = link.href;
                    a.textContent = link.title;
                    li.appendChild(a);
                } else {
                    li.textContent = id;
                }
                list.appendChild(li);
            }
            box.appendChild(list);
        }

        if (result.nextAction) {
            const next = document.createElement('p');
            next.className = 'tutor-next';
            const strong = document.createElement('strong');
            strong.textContent = 'Next: ';
            next.appendChild(strong);
            next.appendChild(document.createTextNode(result.nextAction));
            box.appendChild(next);
        }

        const disclaimer = document.createElement('p');
        disclaimer.className = 'study-disclaimer';
        disclaimer.textContent = DISCLAIMER;
        box.appendChild(disclaimer);
    }
}

/**
 * Mount a tutor panel into a lesson or practice view.
 *
 * Refuses in assessment mode: a tutor available during an unsubmitted set is
 * an oracle, which is the one thing this component must not become.
 */
export function mountTutorPanel(host, context, { assessment = false } = {}) {
    if (assessment) return null;
    const panel = new TutorPanel(context);
    const element = panel.element();
    host.appendChild(element);
    return panel;
}

/**
 * The `/tutor` route — the standalone study-coach page.
 *
 * It exists so the tutor is reachable when the learner is *not* inside a
 * lesson: after a practice run, from a track page, or on its own. It carries
 * the same panel and therefore the same mode label and the same limits.
 */
export class TutorView extends BaseView {
    #panel = null;

    async render(params) {
        const examId = params.examId && EXAMS[params.examId] ? params.examId : null;
        const exam = examId ? EXAMS[examId] : null;
        const track = examId
            ? Object.values(TRACKS).find(t => t.examIds.includes(examId))
            : null;
        const released = examId
            ? Object.values(LESSONS).filter(l => l.examId === examId && l.status === 'released')
            : [];

        const el = this.html(`
            <div class="study-page tutor-page">
                <a class="study-back" href="#/tracks${track ? `/${track.trackId}` : ''}">‹ ${track?.title ?? 'Tracks'}</a>
                <h1 class="study-title">Study coach</h1>
                <p class="study-sub">${exam ? exam.displayName : 'Ask about any lesson in this build'}${track ? ` · ${track.previewLabel}` : ''}</p>
                <p class="tutor-limits">
                    This is general IT-skills coaching over the original lessons in this platform. It is
                    independent study material — never vendor exam preparation. It cannot grade your work,
                    change a score, or operate the simulator.
                </p>
                ${examId && !released.length
                    ? '<p class="study-sub">No lessons for this exam are released yet.</p>'
                    : ''}
                <div id="tutor-host"></div>
                <p class="study-disclaimer">${DISCLAIMER}</p>
            </div>`);

        // With no exam in the route, scope to the first exam that actually has
        // a released lesson rather than a hardcoded id — a pack that changes
        // shape must not leave the tutor quietly asking about a stale exam.
        const fallbackExamId = Object.values(LESSONS)
            .find(l => l.status === 'released')?.examId ?? null;
        this.#panel = mountTutorPanel(el.querySelector('#tutor-host'), {
            examId: examId || fallbackExamId,
            lessonId: null,
            objectiveId: null,
            trackId: track?.trackId ?? null,
        });
        return el;
    }
}
