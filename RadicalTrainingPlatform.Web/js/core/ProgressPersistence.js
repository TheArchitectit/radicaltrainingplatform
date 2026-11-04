import { bus } from './EventBus.js';

/**
 * ProgressPersistence — the learner-progress keyspace layer behind
 * ProgressStore.
 *
 * ProgressStore records and reads one item at a time; this module owns the
 * parts that treat the durable store as a keyspace: which prefixes are
 * learner-owned and portable, the export/import envelope and its validation,
 * and the mapping from a storage failure to the honest recovery reason every
 * write reports (R-23 / Plan v2 L-02).
 *
 * Split out of ProgressStore.js so each file stays reviewable. Behaviour is
 * unchanged: the same prefixes, schema and reasons, the same bus events, and
 * the same [ProgressStore] log prefix.
 */

/** The only keyspaces that belong to the learner and may travel in a file. */
export const PORTABLE_PREFIXES = ['progress/', 'scenario/'];
export const EXPORT_SCHEMA = 'rtp-progress-export';
export const EXPORT_SCHEMA_VERSION = 1;

/**
 * Export the learner-owned keyspaces so progress can move between browser
 * profiles or machines **without an account and without a server**.
 *
 * Only `progress/` and `scenario/` are portable. Simulator fixtures
 * (`clusterState`, `pc_settings`, …) belong to StateEngine and are not
 * learner progress; exporting them here would conflate a study record with
 * a demo station's seed state, and importing them would let a progress file
 * rewrite a lab environment. They are deliberately excluded.
 */
export async function exportProgress(store) {
    const entries = {};
    for (const prefix of PORTABLE_PREFIXES) {
        for (const key of await store.keys(prefix)) {
            entries[key] = await store.get(key);
        }
    }
    return {
        schema: EXPORT_SCHEMA,
        schemaVersion: EXPORT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        entries,
    };
}

/**
 * Restore progress from an `exportProgress()` envelope (object or JSON
 * text). Import is additive over the same keys and leaves keys the file
 * does not contain untouched; `{ replace: true }` clears the learner
 * keyspaces first.
 *
 * A file is untrusted input, so the envelope is validated before a single
 * key is written: unknown schema, unknown version, a key outside the
 * portable prefixes, or a non-object record is refused rather than guessed
 * at. Storage failure is reported, never presented as a successful import
 * (the same honest-failure rule as `recordItem`).
 */
export async function importProgress(store, envelope, { replace = false } = {}) {
    let data = envelope;
    if (typeof envelope === 'string') {
        try {
            data = JSON.parse(envelope);
        } catch (e) {
            return { imported: false, reason: 'invalid-json' };
        }
    }
    const invalid = validateExport(data);
    if (invalid) return { imported: false, reason: 'invalid-export', detail: invalid };

    const keys = Object.keys(data.entries);
    try {
        if (replace) {
            for (const prefix of PORTABLE_PREFIXES) {
                for (const key of await store.keys(prefix)) await store.delete(key);
            }
        }
        for (const key of keys) await store.set(key, data.entries[key]);
    } catch (e) {
        const reason = classifyWriteFailure(e);
        reportSaveFailure(e, 'progress import', reason);
        return { imported: false, reason };
    }
    return { imported: true, keys: keys.length, exportedAt: data.exportedAt || null };
}

/** Return a human-readable reason the envelope is unusable, or null. */
function validateExport(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return 'not an object';
    }
    if (data.schema !== EXPORT_SCHEMA) {
        return `unknown schema '${data.schema}'`;
    }
    if (data.schemaVersion !== EXPORT_SCHEMA_VERSION) {
        return `unsupported schemaVersion '${data.schemaVersion}'`;
    }
    const entries = data.entries;
    if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
        return 'entries is not an object';
    }
    for (const [key, value] of Object.entries(entries)) {
        if (typeof key !== 'string' || !PORTABLE_PREFIXES.some(p => key.startsWith(p) && key.length > p.length)) {
            return `key '${key}' is outside the learner keyspaces`;
        }
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return `value for '${key}' is not a record`;
        }
    }
    return null;
}

/**
 * Map a storage error to the honest recovery reason (R-23). Name-based
 * (DOMException.name is standardized) so a message that merely mentions
 * quota is not misclassified.
 */
export function classifyWriteFailure(err) {
    const name = String(err?.name || '');
    if (name === 'StorageBlockedError') return 'storage-blocked';
    if (name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        return 'storage-quota-exceeded';
    }
    return 'storage-write-failed';
}

/** Log and announce a failed write; callers get { saved: false, reason }. */
export function reportSaveFailure(err, what, reason) {
    console.error('[ProgressStore] save failed for', what, reason, err);
    bus.emit('progress:saveFailed', {
        what,
        reason: reason || 'storage-write-failed',
        message: String(err?.message || err),
    });
}
