import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const temp = await mkdtemp(join(tmpdir(), 'gateway-live-fixture-'));
const auditPath = join(temp, 'audit.jsonl');
const configPath = join(temp, 'config.json');
await writeFile(configPath, JSON.stringify({
    activation: false,
    rateLimitPerMinute: 2,
    spendKillSwitch: 1,
    auditLogPath: auditPath,
}));

const socket = createServer();
await new Promise((resolveListen, reject) => {
    socket.once('error', reject);
    socket.listen(0, '127.0.0.1', resolveListen);
});
const port = socket.address().port;
await new Promise(resolveClose => socket.close(resolveClose));
const base = `http://127.0.0.1:${port}`;

const child = spawn(process.execPath, [
    'services/ai-gateway/server.mjs',
    '--root', ROOT,
    '--port', String(port),
    '--config', configPath,
], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
let output = '';
child.stdout.on('data', chunk => { output += chunk; });
child.stderr.on('data', chunk => { output += chunk; });

const requestBody = JSON.stringify({ examId: 'NCA-75', question: 'How do I begin?' });
const origin = 'http://127.0.0.1:8080';
const post = () => fetch(`${base}/tutor/ask`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin },
    body: requestBody,
});

try {
    let healthy = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
        if (child.exitCode !== null) throw new Error(`gateway exited early\n${output}`);
        try {
            const response = await fetch(`${base}/health`);
            if (response.ok) { healthy = true; break; }
        } catch { /* Listener is not ready yet. */ }
        await new Promise(resolveWait => setTimeout(resolveWait, 50));
    }
    assert.equal(healthy, true, `gateway did not become healthy\n${output}`);

    const preflight = await fetch(`${base}/tutor/ask`, {
        method: 'OPTIONS',
        headers: {
            origin,
            'access-control-request-method': 'POST',
            'access-control-request-headers': 'content-type',
        },
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
    assert.match(preflight.headers.get('access-control-allow-methods'), /POST/);
    assert.match(preflight.headers.get('access-control-allow-headers'), /content-type/);

    const remote = await fetch(`${base}/health`, { headers: { origin: 'https://example.com' } });
    assert.equal(remote.headers.get('access-control-allow-origin'), null);

    for (let i = 0; i < 2; i += 1) {
        const response = await post();
        assert.equal(response.status, 503, 'the unactivated provider remains unavailable');
        assert.equal(response.headers.get('access-control-allow-origin'), origin);
        assert.equal((await response.json()).status, 'unavailable');
    }

    const limited = await post();
    assert.equal(limited.status, 429);
    assert.ok(Number(limited.headers.get('retry-after')) >= 1);
    assert.equal((await limited.json()).status, 'rate-limited');

    const events = (await readFile(auditPath, 'utf8')).trim().split('\n').map(JSON.parse);
    assert.deepEqual(events.map(event => event.event), [
        'provider-unavailable', 'provider-unavailable', 'rate-limited',
    ]);
    console.log('PASS: live gateway enforced CORS, preflight, rate limiting and JSONL auditing');
} catch (err) {
    console.error(output);
    throw err;
} finally {
    if (child.exitCode === null) child.kill('SIGTERM');
    await rm(temp, { recursive: true, force: true });
}
