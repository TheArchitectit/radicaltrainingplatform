import { bus } from './EventBus.js';

/**
 * StateStore — Persistent state using IndexedDB with localStorage fallback.
 */
class StateStore {
    #db = null;
    #dbName = 'CertForgeLab';
    #dbVersion = 1;
    #fallback = false;

    async init() {
        try {
            this.#db = await this.#openDB();
        } catch (e) {
            console.warn('[StateStore] IndexedDB unavailable, using localStorage fallback:', e);
            this.#fallback = true;
        }
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

    async get(key) {
        if (this.#fallback) {
            const raw = localStorage.getItem(`lab_${key}`);
            return raw ? JSON.parse(raw) : null;
        }
        return new Promise((resolve, reject) => {
            const tx = this.#db.transaction('state', 'readonly');
            const req = tx.objectStore('state').get(key);
            req.onsuccess = () => resolve(req.result?.value ?? null);
            req.onerror = () => reject(req.error);
        });
    }

    async set(key, value) {
        if (this.#fallback) {
            localStorage.setItem(`lab_${key}`, JSON.stringify(value));
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
        if (this.#fallback) {
            localStorage.removeItem(`lab_${key}`);
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
        if (this.#fallback) {
            Object.keys(localStorage)
                .filter(k => k.startsWith('lab_'))
                .forEach(k => localStorage.removeItem(k));
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
