/**
 * R-22 bullet 4 — persistence write ordering: audit entry written after
 * persist.
 *
 * Defect: StateEngine.create/update/remove call `await this.#persist()`
 * BEFORE `this.#logAudit(...)`. The audit entry lives only in
 * this.#state.audit_log (in memory) until the NEXT persist, so a crash
 * between the entity persist and the next write loses the audit trail for
 * an already-durable entity change.
 *
 * Fixture proves ordering by observing what was actually persisted: after a
 * single create() completes, the persisted clusterState snapshot must
 * already contain the audit entry for that create.
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

const dom = installDom();
const runner = makeRunner();

function interceptPersist(store, dom) {
    // Capture what the fallback layer actually serializes — a real copy at
    // write time, not a live reference to #state.
    let lastSerialized = null;
    const origSetItem = dom.localStorage.setItem.bind(dom.localStorage);
    dom.localStorage.setItem = (k, v) => {
        if (k === 'lab_clusterState') lastSerialized = v;
        return origSetItem(k, v);
    };
    return () => (lastSerialized ? JSON.parse(lastSerialized) : null);
}

await runner.test('create: audit entry is durable in the same persist as the entity change', async () => {
    const { store } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateStore.js');
    const { state } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateEngine.js');

    await state.init();
    const lastPersisted = interceptPersist(store, dom);

    const created = await state.create('widgets', { name: 'probe-entity' });
    assert(created.uuid, 'create() must assign a uuid');

    // The entity itself must be in the persisted snapshot...
    const persistedEntities = (lastPersisted().widgets || []).map(e => e.name);
    assert(persistedEntities.includes('probe-entity'), 'created entity must be persisted');

    // ...and so must its audit entry, in the SAME write.
    const persistedAudit = lastPersisted().audit_log || [];
    const entry = persistedAudit.find(a =>
        a.collection === 'widgets' && a.action === 'create'
        && a.entity_name === 'probe-entity');
    assert(entry, 'audit entry for the create must be inside the same persisted snapshot; '
        + `persisted audit_log had ${persistedAudit.length} entries: `
        + JSON.stringify(persistedAudit.map(a => `${a.action}:${a.collection}:${a.entity_name}`)));

    assertEqual(entry.action, 'create', 'audit action should be create');
    assertEqual(entry.entity_name, 'probe-entity', 'audit entity_name should match');
});

await runner.test('update: audit entry is durable in the same persist as the entity change', async () => {
    const { store } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateStore.js');
    const { state } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateEngine.js');

    await state.init();
    await state.create('widgets', { name: 'probe-two' });
    const lastPersisted = interceptPersist(store, dom);

    await state.update('widgets', state.getAll('widgets').find(w => w.name === 'probe-two').uuid,
        { name: 'probe-two-renamed' });

    const persistedAudit = lastPersisted().audit_log || [];
    const entry = persistedAudit.find(a =>
        a.collection === 'widgets' && a.action === 'update'
        && a.entity_name === 'probe-two-renamed');
    assert(entry, 'audit entry for the update must be inside the same persisted snapshot');
});

await runner.test('remove: audit entry is durable in the same persist as the entity change', async () => {
    const { store } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateStore.js');
    const { state } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateEngine.js');

    await state.init();
    await state.create('widgets', { name: 'probe-three' });
    const item = state.getAll('widgets').find(w => w.name === 'probe-three');
    const lastPersisted = interceptPersist(store, dom);

    await state.remove('widgets', item.uuid);

    const persistedAudit = lastPersisted().audit_log || [];
    const entry = persistedAudit.find(a =>
        a.collection === 'widgets' && a.action === 'delete'
        && a.entity_name === 'probe-three');
    assert(entry, 'audit entry for the remove must be inside the same persisted snapshot');
});

process.exit(runner.done('audit-log-ordering fixture'));
