/**
 * Gateway controls (SPEC-08 REQ-AI-06/07, CARRY-FORWARD "Gateway controls").
 *
 * These four controls were advertised in config and never in force. They are
 * here so the config stops lying, and so the day a provider is activated the
 * rails around it are already real (G-05: a gateway that quietly spends
 * without a budget is the thing we are trying not to build).
 *
 *   RateLimiter   — fixed-window counter, 429 with retry-after
 *   SpendTracker  — budget for provider-call units; trips once and stays tripped
 *   AuditSink     — JSONL append-only log; every line runs through redact()
 *   corsHeaders   — loopback-only CORS + OPTIONS preflight
 *
 * Everything here is pure enough to unit-test without an HTTP server. The
 * server wires them; the harness exercises the same classes.
 */
import { appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { redact } from './provider.mjs';

/** Fixed-window rate limiter: N requests per 60 seconds. */
export class RateLimiter {
    #limitPerMinute;
    #windowMs;
    #now;
    #count = 0;
    #windowStart = 0;

    constructor({ limitPerMinute = 60, windowMs = 60_000, now = () => Date.now() } = {}) {
        if (!Number.isInteger(limitPerMinute) || limitPerMinute <= 0) {
            throw new Error(`rateLimitPerMinute must be a positive integer, got ${limitPerMinute}`);
        }
        this.#limitPerMinute = limitPerMinute;
        this.#windowMs = windowMs;
        this.#now = now;
    }

    get limit() { return this.#limitPerMinute; }

    /**
     * Consume one request slot. Returns `{ ok: true }` or
     * `{ ok: false, retryAfterSeconds }` — the caller maps that to 429.
     */
    take() {
        const t = this.#now();
        if (t - this.#windowStart >= this.#windowMs) {
            this.#windowStart = t;
            this.#count = 0;
        }
        if (this.#count >= this.#limitPerMinute) {
            const elapsed = t - this.#windowStart;
            return {
                ok: false,
                retryAfterSeconds: Math.max(1, Math.ceil((this.#windowMs - elapsed) / 1000)),
            };
        }
        this.#count += 1;
        return { ok: true };
    }

    /** Snapshot for tests and the /health response. */
    get state() {
        return { count: this.#count, limit: this.#limitPerMinute, windowStart: this.#windowStart };
    }
}

/**
 * Spend kill switch: a budget of provider-call units. `null` means no budget
 * (the shipped default — an owner decision). Once the budget is exhausted the
 * switch is tripped for the life of the process and cannot be un-tripped
 * without a restart, which is the point of a kill switch.
 */
export class SpendTracker {
    #budget;
    #used = 0;
    #now;
    #trippedAt = null;

    constructor({ budget = null, now = () => Date.now() } = {}) {
        if (budget !== null && (!Number.isInteger(budget) || budget <= 0)) {
            throw new Error(`spendKillSwitch must be a positive integer or null, got ${budget}`);
        }
        this.#budget = budget;
        this.#now = now;
    }

    get budget() { return this.#budget; }
    get used() { return this.#used; }
    get tripped() { return this.#budget !== null && this.#used >= this.#budget; }

    /**
     * Charge one provider-call unit before the call. Returns
     * `{ ok: true }` or `{ ok: false, detail }` when the budget is gone.
     */
    charge() {
        if (this.#budget === null) {
            this.#used += 1;
            return { ok: true };
        }
        if (this.#used >= this.#budget) {
            this.#trippedAt ??= this.#now();
            return {
                ok: false,
                detail: `spend kill switch tripped after ${this.#budget} unit(s)`,
            };
        }
        this.#used += 1;
        return { ok: true };
    }

    get state() {
        return {
            budget: this.#budget,
            used: this.#used,
            tripped: this.tripped,
            trippedAt: this.#trippedAt,
        };
    }
}

/**
 * JSONL audit sink. Every line is one event object. `redact()` runs on the
 * serialized line so a secret cannot reach the file even if a caller forgets.
 *
 * A sink whose path cannot be created fails loud at construction: an audit
 * log that silently no-ops is worse than none.
 */
export class AuditSink {
    #path;

    constructor(path, { repoRoot = process.cwd() } = {}) {
        if (!path || typeof path !== 'string') {
            throw new Error('AuditSink requires a file path');
        }
        this.#path = isAbsolute(path) ? path : resolve(repoRoot, path);
        const dir = dirname(this.#path);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    }

    get path() { return this.#path; }

    write(event) {
        const line = redact(JSON.stringify({ ...event, at: event.at ?? Date.now() }));
        appendFileSync(this.#path, line + '\n', 'utf8');
    }
}

/**
 * CORS for a loopback-only gateway. The gateway binds 127.0.0.1, so the only
 * legitimate callers are a browser page served from a loopback origin (the
 * PWA on :8080 in dev, a file:// page is not CORS-relevant). We allow an
 * Origin whose host is a loopback address; anything else gets no CORS headers
 * and the browser blocks it, which is the correct answer.
 */
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

export function isLoopbackOrigin(origin) {
    if (!origin) return false;
    try {
        const url = new URL(origin);
        return LOOPBACK_HOSTS.has(url.hostname);
    } catch {
        return false;
    }
}

/** Headers to merge into every response; empty when the origin is not loopback. */
export function corsHeaders(origin) {
    if (!isLoopbackOrigin(origin)) return {};
    return {
        'access-control-allow-origin': origin,
        'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers': 'content-type',
        'access-control-max-age': '600',
        'vary': 'origin',
    };
}

/** Respond to a preflight. The server calls this and returns 204. */
export function preflightHeaders(origin) {
    return corsHeaders(origin);
}

/**
 * Wraps a provider so the spend kill switch is enforced at the spend point —
 * before the call reaches the wire. `ProviderNotActivated` still propagates
 * unchanged: the guard must not make an unactivated provider look available.
 */
export class GuardedProvider {
    #inner;
    #spend;

    constructor(inner, spendTracker) {
        this.#inner = inner;
        this.#spend = spendTracker;
    }

    unavailableReason() {
        return this.#inner.unavailableReason?.() ?? null;
    }

    async respond(context) {
        if (this.#inner.unavailableReason?.()) {
            return this.#inner.respond(context);
        }
        const charge = this.#spend.charge();
        if (!charge.ok) {
            const err = new Error(charge.detail);
            err.name = 'SpendKillSwitchTripped';
            throw err;
        }
        return this.#inner.respond(context);
    }
}
