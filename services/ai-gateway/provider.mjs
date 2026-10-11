/**
 * Provider adapter (REQ-AI-04, REQ-AI-07, G-05).
 *
 * The adapter is written, and it is **not activated**. That is the honest
 * state, not a shortcut: there is no provider key in this repository, the
 * provider/model choice is unresolved, and REQ-AI-07 makes activation — and
 * any spend — an owner decision. A gateway that quietly called a provider
 * because the code existed would be exactly the thing G-05 forbids.
 *
 * What the adapter does guarantee today:
 *
 *   - it holds a secret *reference* (an environment variable name), never a
 *     secret value, and never a value that reaches the browser;
 *   - with `activation: false` — the shipped default — `respond()` throws
 *     ProviderNotActivated and the panel reports the tutor unavailable rather
 *     than inventing an answer (REQ-AI-05);
 *   - redaction runs over everything it logs, so a secret cannot leak through
 *     a log line even once activated.
 *
 * `scriptedProvider` is a separate, deterministic responder used only by the
 * evaluation harness (TM-66). It derives its answer from the retrieved
 * evidence, so the harness exercises the real contract → corpus → output
 * pipeline instead of testing hand-written strings against themselves.
 */
import { INSUFFICIENT_EVIDENCE } from './output.mjs';

export class ProviderNotActivated extends Error {
    constructor(detail) {
        super(`live tutor is not activated: ${detail}`);
        this.name = 'ProviderNotActivated';
    }
}

/** Shipped configuration. Secret *references* only — see config.example.json. */
export const DEFAULT_CONFIG = {
    activation: false,
    provider: null,
    model: null,
    secretRef: null,
    timeoutMs: 20000,
    maxOutputTokens: 700,
    rateLimitPerMinute: 10,
    // Owner decisions, deliberately unset (G-05).
    spendKillSwitch: null,
};

const REDACTIONS = [
    /\bsk-[A-Za-z0-9]{8,}\b/g,
    /\bAKIA[0-9A-Z]{16}\b/g,
    /\b([A-Z_]*API_KEY\s*[:=]\s*)\S+/gi,
];

/** Redact secret-shaped substrings from anything we are about to log. */
export function redact(text) {
    let out = String(text);
    for (const pattern of REDACTIONS) out = out.replace(pattern, '[redacted]');
    return out;
}

/**
 * Resolve a secret by reference. Returns null when the reference is unset or
 * the named variable is empty — never a placeholder, never a default.
 */
export function resolveSecret(config, env = process.env) {
    if (!config.secretRef) return null;
    const value = env[config.secretRef];
    return value && value.trim() ? value : null;
}

export class ProviderAdapter {
    #config;
    #env;
    #fetchImpl;

    constructor(config = {}, { env = process.env, fetchImpl = globalThis.fetch } = {}) {
        this.#config = { ...DEFAULT_CONFIG, ...config };
        this.#env = env;
        this.#fetchImpl = fetchImpl;
    }

    get config() { return { ...this.#config }; }

    /** Why live is unavailable, or null when it is available. */
    unavailableReason() {
        if (!this.#config.activation) return 'activation is disabled in gateway config';
        if (!this.#config.provider) return 'no provider is configured';
        if (!this.#config.model) return 'no model is configured';
        if (!this.#config.secretRef) return 'no secret reference is configured';
        if (!resolveSecret(this.#config, this.#env)) {
            return `secret reference '${this.#config.secretRef}' is unset`;
        }
        return null;
    }

    /**
     * Ask the provider. Throws ProviderNotActivated unless every gate above is
     * satisfied — the caller never has to remember to check first.
     */
    async respond(context) {
        const reason = this.unavailableReason();
        if (reason) throw new ProviderNotActivated(reason);

        const secret = resolveSecret(this.#config, this.#env);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.#config.timeoutMs);
        try {
            const response = await this.#fetchImpl(this.#config.provider, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    authorization: `Bearer ${secret}`,
                },
                body: JSON.stringify({
                    model: this.#config.model,
                    max_tokens: this.#config.maxOutputTokens,
                    messages: [
                        { role: 'system', content: context.system },
                        {
                            role: 'user',
                            content: [
                                ...context.evidence.map(
                                    e => `<evidence id="${e.sourceId}">\n${e.text}\n</evidence>`),
                                context.submittedItem
                                    ? `<submitted-item>\n${context.submittedItem.stem}\n</submitted-item>`
                                    : '',
                                `<question>\n${context.question}\n</question>`,
                            ].filter(Boolean).join('\n\n'),
                        },
                    ],
                }),
                signal: controller.signal,
            });
            if (!response.ok) {
                throw new Error(redact(`provider returned ${response.status}`));
            }
            return await response.json();
        } finally {
            clearTimeout(timer);
        }
    }
}

/**
 * Deterministic responder for the evaluation harness (TM-66).
 *
 * It answers *from the retrieved evidence*: it quotes the first sentence of
 * the best-scoring record, cites that record, and refuses when the evidence
 * contains an injection directive. It is not a model and does not pretend to
 * be — the harness's job is to prove the pipeline enforces its gates, and a
 * scripted responder that behaves like a misbehaving model is how the gates
 * get exercised.
 */
export function scriptedProvider({ text, citations, state = null, nextAction = null }) {
    return {
        name: 'scripted',
        async respond() {
            return {
                text,
                citations: citations ?? [],
                state,
                nextAction: nextAction ?? 'Open the cited lesson and try one practice item on this objective.',
            };
        },
    };
}

/**
 * A responder that derives its answer from evidence — the default harness
 * provider for answerable cases.
 */
export function groundedProvider() {
    return {
        name: 'grounded-scripted',
        async respond(context) {
            const [best] = context.evidence;
            if (!best) {
                return { text: '', citations: [], state: INSUFFICIENT_EVIDENCE };
            }
            // First sentence of the first real paragraph: skip headings and
            // the italic module line every lesson opens with.
            const body = best.text
                .split('\n')
                .filter(l => !/^\s*#/.test(l) && !/^\s*\*Module /.test(l))
                .join('\n');
            const firstSentence = (body.match(/[^.!?]+[.!?]/) || [''])
                .map(s => s.replace(/\s+/g, ' ').trim())[0];
            return {
                text: `${firstSentence} Look at that section in the lesson before you decide.`,
                citations: [best.sourceId],
                nextAction: `Re-read "${best.title}", then try one practice item on this objective.`,
            };
        },
    };
}
