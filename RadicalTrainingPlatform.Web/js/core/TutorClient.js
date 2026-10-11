/**
 * Tutor client (REQ-AI-04/05/07).
 *
 * The browser half of the tutor. Its most important property is what it does
 * *not* have: no provider key, no provider endpoint, no way to reach a model
 * directly. It can only ask the gateway, and the gateway is the only thing
 * that holds a secret (REQ-AI-04).
 *
 * Two modes, and the default is the honest one:
 *
 *   'recorded'    — the shipped fallback. Reviewed prewritten responses,
 *                   labelled "recorded example". Zero network calls (TM-67).
 *   'live'        — opt-in, and only when the learner has been told what it
 *                   means before first use (REQ-AI-05: "optional and
 *                   disclosed before first use"). If the gateway is
 *                   unreachable, the tutor reports itself unavailable and
 *                   invents nothing.
 *
 * AI-off loses nothing else: lessons, practice, scenarios and progress never
 * touch this module.
 */
import { findRecordedExample, RECORDED_EXAMPLE_LABEL } from '../data/tutor-recorded.js';

export const MODE_RECORDED = 'recorded';
export const MODE_LIVE = 'live';

const GATEWAY_URL_KEY = 'tutor/gatewayUrl';
const LIVE_CONSENT_KEY = 'tutor/liveConsent';

export class TutorClient {
    #storage;
    #fetchImpl;
    #timeoutMs;

    constructor({ storage = globalThis.localStorage, fetchImpl = globalThis.fetch,
                  timeoutMs = 20000 } = {}) {
        this.#storage = storage;
        this.#fetchImpl = fetchImpl;
        this.#timeoutMs = timeoutMs;
    }

    /** Where the gateway lives, if the operator configured one. */
    gatewayUrl() {
        return this.#storage?.getItem(GATEWAY_URL_KEY) || null;
    }

    setGatewayUrl(url) {
        if (url) this.#storage?.setItem(GATEWAY_URL_KEY, url);
        else this.#storage?.removeItem(GATEWAY_URL_KEY);
    }

    /** Has the learner been told what online AI means and agreed to it? */
    hasLiveConsent() {
        return this.#storage?.getItem(LIVE_CONSENT_KEY) === 'yes';
    }

    grantLiveConsent() { this.#storage?.setItem(LIVE_CONSENT_KEY, 'yes'); }
    revokeLiveConsent() { this.#storage?.removeItem(LIVE_CONSENT_KEY); }

    /**
     * The mode in force. Live requires all three: a configured gateway, the
     * learner's informed consent, and the learner having chosen it. Any one
     * missing falls back to recorded — never to an unlabelled live call.
     */
    mode() {
        return (this.gatewayUrl() && this.hasLiveConsent()) ? MODE_LIVE : MODE_RECORDED;
    }

    /**
     * Ask one question.
     *
     * @param {{question, examId, lessonId?, objectiveId?, examVersion?, trackId?}} request
     * @returns {Promise<{status, text, citations, nextAction, mode, label}>}
     */
    async ask(request) {
        if (this.mode() === MODE_RECORDED) {
            return this.#recorded(request);
        }
        return this.#live(request);
    }

    /** The fallback path. Local lookup only — nothing leaves the page. */
    #recorded(request) {
        const example = findRecordedExample(request.question, { lessonId: request.lessonId });
        if (!example) {
            return {
                status: 'insufficient-evidence',
                text: 'I do not have a reviewed answer for that question. This station runs recorded examples only, so it cannot improvise one. Try asking about the section of the lesson you are on, or ask about one of the objectives in this track.',
                citations: [],
                nextAction: 'Open the lesson for the objective you are studying and ask about a section of it.',
                mode: MODE_RECORDED,
                label: RECORDED_EXAMPLE_LABEL,
                exampleId: null,
            };
        }
        return {
            status: example.state,
            text: example.text,
            citations: example.citations,
            nextAction: example.nextAction,
            mode: MODE_RECORDED,
            label: RECORDED_EXAMPLE_LABEL,
            exampleId: example.id,
        };
    }

    /**
     * The live path. The request carries exactly the REQ-AI-01 contract — no
     * identity, no repository, no bank — and the answer comes back only after
     * the gateway has validated it.
     */
    async #live(request) {
        const url = this.gatewayUrl();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.#timeoutMs);
        try {
            const response = await this.#fetchImpl(`${url.replace(/\/$/, '')}/tutor/ask`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    examId: request.examId,
                    trackId: request.trackId ?? null,
                    examVersion: request.examVersion ?? null,
                    lessonId: request.lessonId ?? null,
                    objectiveId: request.objectiveId ?? null,
                    question: request.question,
                }),
                signal: controller.signal,
            });
            const body = await response.json();
            if (!response.ok || body.status === 'unavailable' || body.status === 'rejected') {
                return this.#unavailable(body.detail);
            }
            return {
                status: body.status,
                text: body.text,
                citations: body.citations || [],
                nextAction: body.nextAction,
                mode: MODE_LIVE,
                label: 'live tutor',
                exampleId: null,
            };
        } catch {
            // Unreachable, timed out, or refused. The panel shows an
            // unavailable tutor — it never invents output (REQ-AI-05).
            return this.#unavailable('the tutor service did not respond');
        } finally {
            clearTimeout(timer);
        }
    }

    #unavailable(detail) {
        return {
            status: 'unavailable',
            text: 'The online tutor is not available right now. Everything else on this station — lessons, practice, scenarios and your progress — works without it.',
            citations: [],
            nextAction: 'Keep studying from the lesson; you can ask again when the tutor is reachable.',
            mode: MODE_LIVE,
            label: 'tutor unavailable',
            detail,
            exampleId: null,
        };
    }
}

export const tutor = new TutorClient();
