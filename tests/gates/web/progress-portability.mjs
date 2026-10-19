/**
 * S39 (local classroom kit) — learner-progress export/import fixture.
 *
 * The platform has no account and no server, so progress is bound to a browser
 * profile. Export/import is the only way it can follow a learner to another
 * profile or machine, which makes the envelope a trust boundary: it is a file
 * on disk, and the importer must refuse anything that is not learner progress
 * rather than writing it into the store.
 *
 * Drives the real ProgressStore over the real StateStore localStorage path.
 * Every refusal case asserts that NOTHING was written, not merely that an error
 * was reported — a validated import that half-wrote before failing would be
 * worse than one that trusted the file.
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

installDom();
const runner = makeRunner();

const { progress } = await import('../../../RadicalTrainingPlatform.Web/js/core/ProgressStore.js');
const { store } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateStore.js');

const EXAM = 'COMPTIA-A-1201';
const ITEM = 'core1-a2-fixtures.md/Q1';
const ITEM_KEY = `progress/${EXAM}/${ITEM}`;
const SCENARIO_KEY = 'scenario/ticket-one';

await progress.init();

let envelope = null;

await runner.test('export carries the learner keyspaces and excludes simulator state', async () => {
    // A simulator fixture lives in the same store. It must not travel with a
    // learner's progress: importing a progress file must never rewrite a lab.
    await store.set('clusterState', { cluster: { name: 'NTNX-POC-Cluster-01' } });
    await progress.recordItem(EXAM, ITEM, {
        isCorrect: true, reason: '', answeredAt: '2026-10-01T00:00:00Z',
    });
    await progress.recordScenario('ticket-one');

    envelope = await progress.exportProgress();

    assertEqual(envelope.schema, 'rtp-progress-export', 'schema name is stable');
    assertEqual(envelope.schemaVersion, 1, 'schema version is explicit');
    assert(envelope.exportedAt, 'export records when it was taken');
    assert(envelope.entries[ITEM_KEY], 'the answered item is exported');
    assertEqual(envelope.entries[ITEM_KEY].firstCorrect, true, 'firstCorrect travels with the record');
    assert(envelope.entries[SCENARIO_KEY], 'scenario completion is exported');
    assert(!('clusterState' in envelope.entries), 'simulator state is NOT exported');
    assert(!Object.keys(envelope.entries).some(k => k.startsWith('pc_')),
        'no simulator collection leaks into the envelope');
});

await runner.test('import restores records into an empty store', async () => {
    await store.clear();
    assert(!(await store.get(ITEM_KEY)), 'store really is empty before import');

    const result = await progress.importProgress(envelope);

    assertEqual(result.imported, true, 'import reports success');
    assertEqual(result.keys, Object.keys(envelope.entries).length, 'every key is reported');
    const rec = await progress.getItem(EXAM, ITEM);
    assert(rec, 'item record restored');
    assertEqual(rec.firstCorrect, true, 'frozen firstCorrect survives the round trip');
    assert(await progress.getScenario('ticket-one'), 'scenario completion restored');
});

await runner.test('JSON text is accepted, as a real file supplies it', async () => {
    await store.clear();
    const result = await progress.importProgress(JSON.stringify(envelope));
    assertEqual(result.imported, true, 'string envelope imports');
    assert(await progress.getItem(EXAM, ITEM), 'record restored from text');
});

await runner.test('malformed JSON is refused and writes nothing', async () => {
    await store.clear();
    const result = await progress.importProgress('{ not json');
    assertEqual(result.imported, false);
    assertEqual(result.reason, 'invalid-json');
    assertEqual((await store.keys('progress/')).length, 0, 'nothing written');
});

await runner.test('an unknown schema is refused and writes nothing', async () => {
    await store.clear();
    const result = await progress.importProgress({ ...envelope, schema: 'something-else' });
    assertEqual(result.imported, false);
    assertEqual(result.reason, 'invalid-export');
    assert(result.detail.includes('unknown schema'), 'the refusal names the reason');
    assertEqual((await store.keys('progress/')).length, 0, 'nothing written');
});

await runner.test('a future schemaVersion is refused rather than guessed at', async () => {
    await store.clear();
    const result = await progress.importProgress({ ...envelope, schemaVersion: 99 });
    assertEqual(result.imported, false);
    assert(result.detail.includes('unsupported schemaVersion'), 'the refusal names the version');
    assertEqual((await store.keys('progress/')).length, 0, 'nothing written');
});

await runner.test('a key outside the learner keyspaces is refused', async () => {
    await store.clear();
    const hostile = {
        ...envelope,
        entries: { ...envelope.entries, 'clusterState': { cluster: { name: 'injected' } } },
    };
    const result = await progress.importProgress(hostile);
    assertEqual(result.imported, false);
    assert(result.detail.includes('outside the learner keyspaces'), 'the refusal names the key class');
    assertEqual((await store.keys('progress/')).length, 0, 'nothing written — not even the valid keys');
    assert(!(await store.get('clusterState')), 'simulator state untouched');
});

await runner.test('a non-record value is refused', async () => {
    await store.clear();
    const hostile = { ...envelope, entries: { [ITEM_KEY]: 'not a record' } };
    const result = await progress.importProgress(hostile);
    assertEqual(result.imported, false);
    assert(result.detail.includes('is not a record'));
    assertEqual((await store.keys('progress/')).length, 0, 'nothing written');
});

await runner.test('import is additive by default and replace clears only learner keys', async () => {
    await store.clear();
    await progress.importProgress(envelope);
    await store.set(`progress/${EXAM}/kept`, { itemId: 'kept', isCorrect: false });
    await store.set('clusterState', { cluster: { name: 'fixture' } });

    const additive = await progress.importProgress(envelope);
    assertEqual(additive.imported, true);
    assert(await store.get(`progress/${EXAM}/kept`), 'default import leaves other learner keys alone');

    const replaced = await progress.importProgress(envelope, { replace: true });
    assertEqual(replaced.imported, true);
    assert(!(await store.get(`progress/${EXAM}/kept`)), 'replace removes learner keys not in the file');
    assert(await store.get('clusterState'), 'replace never touches simulator state');
});

process.exit(runner.done('progress-portability'));
