/**
 * TM-34 / R-23 / T-44 — storage recovery boundary fixtures.
 *
 * Three failure modes must each surface an honest recoverable error path
 * (Plan v2 L-02) — never a silent null, never a false save:
 *   1. Corrupt entry   — damaged bytes quarantined + store:corruptEntry;
 *                        get reads as clean start, does not throw.
 *   2. Quota exceeded  — saved:false reason 'storage-quota-exceeded'.
 *   3. Storage blocked — saved:false reason 'storage-blocked'; reads return
 *                        null with store:storageBlocked, app keeps running.
 *   4. IDB open hang   — never deadlock the study loop; fall back to local.
 *
 * Failing side of each defect (would fail before the R-23 fix):
 *   1. bare JSON.parse(raw) on corrupt data threw SyntaxError out of get().
 *   2. a generic 'storage-write-failed' hid quota from the recovery path.
 *   3. localStorage access denial threw out of init()/get() with no mode.
 *   4. indexedDB.open with no onblocked/timeout hung PracticeView.render
 *      forever (observed after deleteDatabase with a live connection).
 *
 * Passing side: StateStore quarantine + mode, and ProgressStore's named
 * reason codes on { saved: false }.
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

installDom();
const runner = makeRunner();

const { progress } = await import('../../../RadicalTrainingPlatform.Web/js/core/ProgressStore.js');
const { store } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateStore.js');
const { bus } = await import('../../../RadicalTrainingPlatform.Web/js/core/EventBus.js');

// Seed a corrupt entry BEFORE init so the first read sees the damaged bytes.
localStorage.setItem('lab_progress/COMPTIA-A-1201/corrupt.md/Q1', '{ not json ');
await progress.init();

// ─── 1. Corrupt entry ────────────────────────────────────────────────

await runner.test('corrupt entry: get returns null, quarantines, emits store:corruptEntry', async () => {
    const events = [];
    const off = bus.on('store:corruptEntry', (e) => events.push(e));

    const rec = await store.get('progress/COMPTIA-A-1201/corrupt.md/Q1');
    off();

    assertEqual(rec, null, 'corrupt entry must read as clean start, not throw');
    assertEqual(events.length, 1, 'corrupt quarantine is never silent');
    assertEqual(events[0].key, 'progress/COMPTIA-A-1201/corrupt.md/Q1');
    assert(events[0].quarantineKey, 'quarantine key is reported');
    assert(events[0].reason, 'parse failure reason is reported');

    const quarantined = localStorage.getItem('lab_progress/COMPTIA-A-1201/corrupt.md/Q1.corrupt');
    assertEqual(quarantined, '{ not json ', 'damaged bytes preserved as evidence');
    assertEqual(localStorage.getItem('lab_progress/COMPTIA-A-1201/corrupt.md/Q1'), null,
        'live corrupt key is removed after quarantine');
});

await runner.test('ProgressStore.getItem on corrupt entry is a clean start, not a crash', async () => {
    localStorage.setItem('lab_progress/COMPTIA-A-1201/corrupt2.md/Q1', 'not-json-at-all');
    const rec = await progress.getItem('COMPTIA-A-1201', 'corrupt2.md/Q1');
    assertEqual(rec, null, 'learner sees no record, not an uncaught SyntaxError');
});

await runner.test('restore() over mixed good+corrupt reports only the readable items', async () => {
    const ok = await progress.recordItem('COMPTIA-A-1201', 'good.md/Q1', {
        isCorrect: true, reason: '',
    });
    assertEqual(ok.saved, true);

    localStorage.setItem('lab_progress/COMPTIA-A-1201/bad.md/Q1', '{ nope');
    const restored = await progress.restore('COMPTIA-A-1201', ['good.md/Q1', 'bad.md/Q1']);

    assertEqual(restored.attempted, 1, 'only the readable item counts');
    assert(restored.items['good.md/Q1'], 'good item present');
    assert(!restored.items['bad.md/Q1'], 'corrupt item absent — restore did not throw');
});

await runner.test('after quarantine the same key is writable again (recoverable)', async () => {
    const r = await progress.recordItem('COMPTIA-A-1201', 'corrupt.md/Q1', {
        isCorrect: true, reason: '',
    });
    assertEqual(r.saved, true, 'clean start is recoverable, not a bricked key');
    const rec = await progress.getItem('COMPTIA-A-1201', 'corrupt.md/Q1');
    assert(rec, 'new record readable after quarantine');
    assertEqual(rec.attempts, 1, 'starts a fresh attempt history');
});

// ─── 2. Quota exceeded ───────────────────────────────────────────────

function throwQuota() {
    const e = new Error('The quota has been exceeded.');
    e.name = 'QuotaExceededError';
    throw e;
}

await runner.test('quota exceeded: saved:false reason storage-quota-exceeded, never a false save', async () => {
    const original = globalThis.localStorage.setItem;
    globalThis.localStorage.setItem = throwQuota;
    const events = [];
    const off = bus.on('progress:saveFailed', (e) => events.push(e));
    try {
        const r = await progress.recordItem('COMPTIA-A-1201', 'quota.md/Q1', {
            isCorrect: true, reason: '',
        });
        assertEqual(r.saved, false, 'quota must not claim a save');
        assertEqual(r.reason, 'storage-quota-exceeded');
    } finally {
        globalThis.localStorage.setItem = original;
        off();
    }
    assert(events.length >= 1, 'save failure is announced');
    assertEqual(events[0].reason, 'storage-quota-exceeded');
    assert(events[0].what, 'failure names the record it could not save');
});

await runner.test('quota on scenario and continuation saves classifies the same way', async () => {
    const original = globalThis.localStorage.setItem;
    globalThis.localStorage.setItem = throwQuota;
    try {
        const s = await progress.recordScenario('mci-quota');
        assertEqual(s.saved, false);
        assertEqual(s.reason, 'storage-quota-exceeded');

        const c = await progress.saveContinuation('COMPTIA-A-1201', {
            index: 2, selection: ['B'], results: [{ isCorrect: true }], total: 5,
        });
        assertEqual(c.saved, false);
        assertEqual(c.reason, 'storage-quota-exceeded');
    } finally {
        globalThis.localStorage.setItem = original;
    }
});

await runner.test('a generic write failure stays storage-write-failed (not misread as quota)', async () => {
    const original = globalThis.localStorage.setItem;
    globalThis.localStorage.setItem = () => {
        throw new Error('QuotaExceededError'); // message mentions quota, name does not
    };
    try {
        const r = await progress.recordItem('COMPTIA-A-1201', 'generic.md/Q1', {
            isCorrect: false, reason: 'set-mismatch',
        });
        assertEqual(r.saved, false);
        assertEqual(r.reason, 'storage-write-failed',
            'classification is name-based; a message that merely says quota is not quota');
    } finally {
        globalThis.localStorage.setItem = original;
    }
});

// ─── 3. Storage blocked (LAST — marks the singleton blocked) ─────────

await runner.test('storage blocked mid-session: saved:false reason storage-blocked, reads stay alive', async () => {
    const originalGet = globalThis.localStorage.getItem;
    const originalSet = globalThis.localStorage.setItem;
    const blocked = (msg) => () => {
        const e = new Error(msg || 'Access denied');
        e.name = 'SecurityError';
        throw e;
    };
    globalThis.localStorage.getItem = blocked();
    globalThis.localStorage.setItem = blocked();

    const blockedEvents = [];
    const failEvents = [];
    const offB = bus.on('store:storageBlocked', (e) => blockedEvents.push(e));
    const offF = bus.on('progress:saveFailed', (e) => failEvents.push(e));

    try {
        // Read path must not throw out to the UI — storage is unavailable,
        // which is reported, not crashed on.
        const rec = await progress.getItem('COMPTIA-A-1201', 'blocked.md/Q1');
        assertEqual(rec, null, 'unreadable storage reads as null, not a throw');
        assertEqual(blockedEvents.length, 1, 'blocked storage is announced on first access');
        assertEqual(store.mode, 'blocked', 'store records the blocked mode');

        const r = await progress.recordItem('COMPTIA-A-1201', 'blocked.md/Q1', {
            isCorrect: true, reason: '',
        });
        assertEqual(r.saved, false, 'blocked storage must not claim a save');
        assertEqual(r.reason, 'storage-blocked');
        assert(failEvents.length >= 1, 'save failure is announced with a reason');
        assertEqual(failEvents[0].reason, 'storage-blocked');
    } finally {
        globalThis.localStorage.getItem = originalGet;
        globalThis.localStorage.setItem = originalSet;
        offB();
        offF();
    }
});

await runner.test('init with both IndexedDB and localStorage blocked marks store blocked (loud)', async () => {
    const originalGet = globalThis.localStorage.getItem;
    const originalSet = globalThis.localStorage.setItem;
    const originalRemove = globalThis.localStorage.removeItem;
    const blocked = () => {
        const e = new Error('Access denied');
        e.name = 'SecurityError';
        throw e;
    };
    globalThis.localStorage.getItem = blocked;
    globalThis.localStorage.setItem = blocked;
    globalThis.localStorage.removeItem = blocked;

    const events = [];
    const off = bus.on('store:storageBlocked', (e) => events.push(e));
    try {
        // Fresh StateStore (cache-busted) so init() runs against blocked storage.
        const fresh = await import('../../../RadicalTrainingPlatform.Web/js/core/StateStore.js?blocked-init');
        await fresh.store.init();
        assertEqual(fresh.store.mode, 'blocked', 'both backends down → blocked, not a fake local mode');
        assert(events.length >= 1, 'blocked-at-init is announced');
        assertEqual(await fresh.store.get('anything'), null);
    } finally {
        globalThis.localStorage.getItem = originalGet;
        globalThis.localStorage.setItem = originalSet;
        globalThis.localStorage.removeItem = originalRemove;
        off();
    }
});

// ─── 4. IDB open hang (never deadlock the study loop) ────────────────

await runner.test('idb open that never settles falls back to localStorage (no hang)', async () => {
    const originalIDB = globalThis.indexedDB;
    globalThis.indexedDB = {
        open() {
            // Observed failure: open stays pending after deleteDatabase with
            // a live connection — no onsuccess/onerror/onblocked ever fires.
            return { onupgradeneeded: null, onblocked: null, onsuccess: null, onerror: null };
        },
    };
    try {
        const fresh = await import('../../../RadicalTrainingPlatform.Web/js/core/StateStore.js?open-hang');
        const t0 = Date.now();
        await Promise.race([
            fresh.store.init(),
            new Promise((_, rej) => setTimeout(() => rej(new Error('init hung')), 1500)),
        ]);
        const ms = Date.now() - t0;
        assert(ms < 1200, `init must fall back promptly (took ${ms}ms)`);
        assertEqual(fresh.store.mode, 'local', 'hung IDB → localStorage fallback, not a dead await');
    } finally {
        globalThis.indexedDB = originalIDB;
    }
});

await runner.test('init is idempotent — second init does not re-open a hung IDB', async () => {
    const originalIDB = globalThis.indexedDB;
    let openCalls = 0;
    globalThis.indexedDB = {
        open() {
            openCalls += 1;
            return {};
        },
    };
    try {
        const fresh = await import('../../../RadicalTrainingPlatform.Web/js/core/StateStore.js?idempotent-init');
        await fresh.store.init(); // first call: IDB hung → local
        const callsAfterFirst = openCalls;
        await fresh.store.init(); // second call must be a no-op
        assertEqual(openCalls, callsAfterFirst, 'second init must not call indexedDB.open again');
        assertEqual(fresh.store.mode, 'local', 'mode stays local after idempotent init');
    } finally {
        globalThis.indexedDB = originalIDB;
    }
});

process.exit(runner.done('storage-recovery'));
