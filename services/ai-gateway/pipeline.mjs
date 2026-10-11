/**
 * The request path, in one place: contract → corpus → provider → output.
 *
 * Having it as a module rather than inline in the HTTP handler means the
 * evaluation harness (TM-66) and the server run *the same* path. A harness
 * that re-implements the pipeline tests the harness.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateRequest, assembleContext, ContractError, SYSTEM_PROMPT_VERSION } from './contract.mjs';
import { buildIndex, retrieve, allowedCitations } from './corpus.mjs';
import { validateOutput, INSUFFICIENT_EVIDENCE } from './output.mjs';
import { ProviderAdapter, ProviderNotActivated, redact } from './provider.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_CORPUS_PATH = join(HERE, 'corpus.json');

/** Load and index the corpus once; the index is immutable afterwards. */
export function loadCorpus({ root, corpusPath = DEFAULT_CORPUS_PATH } = {}) {
    const corpus = JSON.parse(readFileSync(corpusPath, 'utf8'));
    const { index, excluded, report } = buildIndex(corpus, root);
    return { corpusVersion: corpus.corpusVersion, index, excluded, report };
}

/**
 * Answer one tutor request.
 *
 * Returns a discriminated result — never throws for the states the panel must
 * render (contract violation, unavailable, insufficient evidence). Throwing is
 * reserved for genuine programming errors.
 *
 * @returns {{
 *   status: 'answer'|'insufficient-evidence'|'unavailable'|'rejected',
 *   text?: string, citations?: string[], nextAction?: string,
 *   detail?: string, rejected?: string[], logged?: object
 * }}
 */
export async function ask(rawRequest, { root, provider, corpusPath, now = () => 0 } = {}) {
    let request;
    try {
        request = validateRequest(rawRequest);
    } catch (err) {
        if (err instanceof ContractError) {
            // Rejections are logged, not silently dropped (REQ-AI-01): a
            // repeated attempt to send a field outside the contract is
            // something a reviewer should be able to see.
            return {
                status: 'rejected',
                detail: redact(err.message),
                rejected: err.rejected,
                logged: { event: 'contract-rejection', fields: err.rejected, at: now() },
            };
        }
        throw err;
    }

    const { index, excluded } = loadCorpus({ root, corpusPath });
    const evidence = retrieve(index, request);
    const context = assembleContext(request, evidence);

    const adapter = provider instanceof ProviderAdapter || (provider && provider.respond)
        ? provider
        : new ProviderAdapter(provider || {});

    let raw;
    try {
        raw = await adapter.respond(context);
    } catch (err) {
        if (err instanceof ProviderNotActivated) {
            return {
                status: 'unavailable',
                detail: redact(err.message),
                logged: { event: 'provider-unavailable', at: now() },
            };
        }
        // Timeouts and rate limits land here (REQ-AI-06). The panel shows an
        // unavailable tutor; it never invents output.
        return {
            status: 'unavailable',
            detail: redact(err.message),
            logged: { event: 'provider-error', at: now() },
        };
    }

    const validated = validateOutput(raw, allowedCitations(evidence));
    return {
        status: validated.state === INSUFFICIENT_EVIDENCE ? 'insufficient-evidence' : 'answer',
        text: validated.text,
        citations: validated.citations,
        nextAction: validated.nextAction,
        strippedCitations: validated.stripped,
        promptVersion: SYSTEM_PROMPT_VERSION,
        evidenceIds: evidence.map(e => e.sourceId),
        excludedSources: excluded.map(e => e.sourceId),
        logged: validated.stripped.length
            ? { event: 'citations-stripped', ids: validated.stripped, at: now() }
            : null,
    };
}
