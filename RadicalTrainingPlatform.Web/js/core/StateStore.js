import { bus } from './EventBus.js';

/**
 * StateStore — Persistent state using IndexedDB with localStorage fallback.
 *
 * Storage recovery boundary (R-23 / Plan v2 L-02). Each failure mode has an
 * honest recoverable path — never a silent null, never a false save:
 *   - Corrupt entry: quarantined to `lab_<key>.corrupt` (damaged bytes kept
 *     as evidence), `store:corruptEntry` emitted, get returns null (clean
 *     start). Previously bare `JSON.parse` threw and bricked the read.
 *   - Quota exceeded: set rethrows the QuotaExceededError so the caller
 *     reports saved:false with a specific reason.
 *   - Storage blocked (localStorage access denied): init probes and marks
 *     the store blocked; get returns null with `store:storageBlocked`, set
 *     throws StorageBlockedError. The app keeps running — persistence is
 *     honestly reported unavailable, not pretended.
 */
class StateStore {
    #db = null;
    #dbName = 'RadicalTrainingPlatformLab';
    #dbVersion = 1;
    #mode = 'idb'; // 'idb' | 'local' | 'blocked'

    /** Observed storage mode — 'idb', 'local', or 'blocked'. */
    get mode() {
        return this.#mode;
    }

    async init() {
        try {
            this.#db = await this.#openDB();
            this.#mode = 'idb';
            return;
        } catch (e) {
            console.warn('[StateStore] IndexedDB unavailable, using localStorage fallback:', e);
        }
        try {
            const probe = 'lab_#probe';
            localStorage.setItem(probe, '1');
            localStorage.removeItem(probe);
            this.#mode = 'local';
        } catch (blocked) {
            this.#markBlocked(blocked);
        }
    }

    #markBlocked(err) {
        this.#mode = 'blocked';
        console.error('[StateStore] localStorage unavailable; progress cannot be persisted:', err);
        bus.emit('store:storageBlocked', { message: String(err?.message || err) });
    }

    #openDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(this.#dbName, this.#dbVersion);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('state')) {
                    db.createObjectStore('state', { keyPath: 'key' });
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * Corrupt ≠ "no progress" silently (R-23, mirroring R-20 quarantine).
     * Damaged bytes are preserved under lab_<key>.corrupt, a notice fires,
     * and the caller gets null so the learner gets a clean start.
     */
    #quarantineCorrupt(key, raw, err) {
        const quarantineKey = `lab_${key}.corrupt`;
        try {
            localStorage.setItem(quarantineKey, raw);
            localStorage.removeItem(`lab_${key}`);
        } catch (qErr) {
            // Quarantine write can itself hit quota/blocks — still report;
            // the notice is what keeps this from being silent.
            console.error('[StateStore] corrupt-entry quarantine write failed:', qErr);
        }
        console.error('[StateStore] corrupt entry quarantined:', key, err);
        bus.emit('store:corruptEntry', {
            key,
            quarantineKey,
            reason: String(err?.message || err),
        });
    }

    async get(key) {
        if (this.#mode === 'blocked') {
            return null;
        }
        if (this.#mode === 'local') {
            let raw;
            try {
                raw = localStorage.getItem(`lab_${key}`);
            } catch (e) {
                this.#markBlocked(e);
                return null;
            }
            if (raw == null) return null;
            try {
                return JSON.parse(raw);
            } catch (parseErr) {
                this.#quarantineCorrupt(key, raw, parseErr);
                return null;
            }
        }
        return new Promise((resolve, reject) => {
            const tx = this.#db.transaction('state', 'readonly');
            const req = tx.objectStore('state').get(key);
            req.onsuccess = () => resolve(req.result?.value ?? null);
            req.onerror = () => reject(req.error);
        });
    }

    async set(key, value) {
        if (this.#mode === 'blocked') {
            const err = new Error('storage-blocked: progress cannot be persisted');
            err.name = 'StorageBlockedError';
            throw err;
        }
        if (this.#mode === 'local') {
            try {
                localStorage.setItem(`lab_${key}`, JSON.stringify(value));
            } catch (e) {
                if (e?.name === 'SecurityError') {
                    this.#markBlocked(e);
                    const err = new Error('storage-blocked: progress cannot be persisted');
                    err.name = 'StorageBlockedError';
                    throw err;
                }
                // QuotaExceededError and other write failures rethrow as-is
                // so callers can classify (never a false save).
                throw e;
            }
            return;
        }
        return new Promise((resolve, reject) => {
            const tx = this.#db.transaction('state', 'readwrite');
            tx.objectStore('state').put({ key, value });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async delete(key) {
        if (this.#mode === 'blocked') return;
        if (this.#mode === 'local') {
            try {
                localStorage.removeItem(`lab_${key}`);
            } catch (e) {
                this.#markBlocked(e);
            }
            return;
        }
        return new Promise((resolve, reject) => {
            const tx = this.#db.transaction('state', 'readwrite');
            tx.objectStore('state').delete(key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async clear() {
        if (this.#mode === 'blocked') return;
        if (this.#mode === 'local') {
            try {
                Object.keys(localStorage)
                    .filter(k => k.startsWith('lab_'))
                    .forEach(k => localStorage.removeItem(k));
            } catch (e) {
                this.#markBlocked(e);
            }
            return;
        }
        return new Promise((resolve, reject) => {
            const tx = this.#db.transaction('state', 'readwrite');
            tx.objectStore('state').clear();
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
}

export const store = new StateStore();
