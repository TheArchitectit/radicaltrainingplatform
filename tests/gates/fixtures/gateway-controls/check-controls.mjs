import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [modulePath, control] = process.argv.slice(2);
assert(modulePath && control, 'usage: node check-controls.mjs <controls.mjs> <control>');
const controls = await import(pathToFileURL(modulePath).href);
const { RateLimiter, SpendTracker, AuditSink, GuardedProvider } = controls;

async function checkRateLimit() {
    let now = 0;
    const limiter = new RateLimiter({ limitPerMinute: 2, now: () => now });
    assert.equal(limiter.take().ok, true);
    assert.equal(limiter.take().ok, true);
    const limited = limiter.take();
    assert.equal(limited.ok, false);
    assert.equal(limited.retryAfterSeconds, 60);
    now = 30_000;
    assert.equal(limiter.take().retryAfterSeconds, 30);
    now = 60_000;
    assert.equal(limiter.take().ok, true);
}

async function checkSpendSwitch() {
    let providerCalls = 0;
    const spend = new SpendTracker({ budget: 1 });
    const provider = new GuardedProvider({
        async respond() { providerCalls += 1; return { text: 'answer' }; },
    }, spend);

    await provider.respond({});
    await assert.rejects(provider.respond({}), err => err.name === 'SpendKillSwitchTripped');
    await assert.rejects(provider.respond({}), err => err.name === 'SpendKillSwitchTripped');
    assert.equal(providerCalls, 1, 'a tripped switch must stop the provider call');
    assert.equal(spend.tripped, true);
    assert.equal(spend.used, 1);

    const inactiveSpend = new SpendTracker({ budget: 1 });
    const inactive = new GuardedProvider({
        unavailableReason: () => 'not activated',
        async respond() {
            const err = new Error('not activated');
            err.name = 'ProviderNotActivated';
            throw err;
        },
    }, inactiveSpend);
    await assert.rejects(inactive.respond({}), err => err.name === 'ProviderNotActivated');
    assert.equal(inactiveSpend.used, 0, 'an unactivated provider spends nothing');
}

async function checkCors() {
    const origin = 'http://127.0.0.1:8080';
    assert.equal(controls.isLoopbackOrigin(origin), true);
    assert.equal(controls.isLoopbackOrigin('http://localhost:3000'), true);
    assert.equal(controls.isLoopbackOrigin('https://example.com'), false);
    assert.equal(controls.isLoopbackOrigin('http://localhost.example.com'), false);
    assert.equal(controls.isLoopbackOrigin('not a URL'), false);

    const headers = controls.corsHeaders(origin);
    assert.equal(headers['access-control-allow-origin'], origin);
    assert.match(headers['access-control-allow-methods'], /OPTIONS/);
    assert.equal(controls.preflightHeaders(origin)['access-control-allow-origin'], origin);
    assert.equal(controls.corsHeaders('https://example.com')['access-control-allow-origin'], undefined);
}

async function checkAuditSink() {
    const root = await mkdtemp(join(tmpdir(), 'gateway-audit-fixture-'));
    const path = join(root, 'nested', 'audit.jsonl');
    const sink = new AuditSink(path);
    const secret = 'sk-abcdefghijk';
    sink.write({ event: 'fixture', token: secret, at: 123 });
    const raw = await readFile(path, 'utf8');
    assert.equal(raw.includes(secret), false, 'the audit file must redact secrets');
    assert.match(raw, /\[redacted\]/);
    const event = JSON.parse(raw);
    assert.equal(event.event, 'fixture');
    assert.equal(event.at, 123);
}

const checks = {
    rate: checkRateLimit,
    spend: checkSpendSwitch,
    cors: checkCors,
    audit: checkAuditSink,
};
assert(checks[control], `unknown control: ${control}`);
await checks[control]();
console.log(`PASS: ${control}`);
