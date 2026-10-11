#!/usr/bin/env node
/**
 * AI gateway — minimal single-purpose service (SPEC-08.3, REQ-AI-04).
 *
 * Holds the provider secret; the browser never receives one. Endpoints:
 *
 *   GET  /health        { status, liveAvailable, reason, corpus }
 *   GET  /corpus/report the index build report — what was included, and every
 *                       record that was excluded and why (REQ-AI-02)
 *   POST /tutor/ask     one tutor turn; see contract.mjs for the request shape
 *
 * Zero dependencies, deliberately. This service is small enough to read in one
 * sitting, and a service that holds a provider secret should be.
 *
 * Usage: node services/ai-gateway/server.mjs [--port 8787] [--root <repo>]
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ask, loadCorpus } from './pipeline.mjs';
import { ProviderAdapter, DEFAULT_CONFIG, redact } from './provider.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

function arg(name, fallback) {
    const i = process.argv.indexOf(`--${name}`);
    return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const ROOT = resolve(arg('root', join(HERE, '..', '..')));
const PORT = Number(arg('port', 8787));
const CONFIG_PATH = arg('config', join(HERE, 'config.json'));

function loadConfig() {
    if (!existsSync(CONFIG_PATH)) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
    // A config file may name a secret *reference*; it must never contain a
    // secret value. Refuse rather than ignore, so a mis-shaped config is loud.
    for (const key of Object.keys(parsed)) {
        if (/secret(value|key|token)$/i.test(key)) {
            throw new Error(
                `config key '${key}' looks like a secret value; use a secretRef (an ` +
                `environment variable name) — the gateway resolves it at call time`);
        }
    }
    return { ...DEFAULT_CONFIG, ...parsed };
}

const config = loadConfig();
const provider = new ProviderAdapter(config);
const corpus = loadCorpus({ root: ROOT });

function json(res, status, body) {
    const payload = JSON.stringify(body);
    res.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        'content-length': Buffer.byteLength(payload),
        'cache-control': 'no-store',
    });
    res.end(payload);
}

async function readBody(req, limit = 64 * 1024) {
    let size = 0;
    const chunks = [];
    for await (const chunk of req) {
        size += chunk.length;
        if (size > limit) throw new Error('request body too large');
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf8');
}

const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    try {
        if (req.method === 'GET' && url.pathname === '/health') {
            const reason = provider.unavailableReason();
            return json(res, 200, {
                status: 'ok',
                liveAvailable: reason === null,
                reason,
                corpus: {
                    version: corpus.corpusVersion,
                    transmissible: corpus.index.length,
                    excluded: corpus.excluded.length,
                },
            });
        }

        if (req.method === 'GET' && url.pathname === '/corpus/report') {
            return json(res, 200, {
                corpusVersion: corpus.corpusVersion,
                report: corpus.report,
                excluded: corpus.excluded,
            });
        }

        if (req.method === 'POST' && url.pathname === '/tutor/ask') {
            const body = JSON.parse(await readBody(req));
            const result = await ask(body, { root: ROOT, provider });
            if (result.logged) console.log('[gateway]', redact(JSON.stringify(result.logged)));
            const status = result.status === 'rejected' ? 400
                : result.status === 'unavailable' ? 503
                    : 200;
            return json(res, status, result);
        }

        return json(res, 404, { status: 'not-found' });
    } catch (err) {
        // Never echo a raw error: it could carry a secret from a provider call.
        console.error('[gateway] error:', redact(err.message));
        return json(res, 500, { status: 'error', detail: redact(err.message) });
    }
});

server.listen(PORT, '127.0.0.1', () => {
    const reason = provider.unavailableReason();
    console.log(`[gateway] listening on http://127.0.0.1:${PORT}`);
    console.log(`[gateway] corpus: ${corpus.index.length} transmissible, ` +
                `${corpus.excluded.length} excluded`);
    console.log(`[gateway] live tutor: ${reason === null ? 'available' : `unavailable — ${reason}`}`);
});
