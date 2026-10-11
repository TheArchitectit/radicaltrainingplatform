import { store } from './StateStore.js';
import { bus } from './EventBus.js';

/**
 * ProgressStore (T-12, REQ-UI-04/05) — durable learner progress over
 * StateStore's IndexedDB (RadicalTrainingPlatformLab) / localStorage (lab_)
 * stack. Keys:
 *   progress/<examId>/<itemId>  — per scored item { isCorrect, reason,
 *                                 attempts, lastAnswered }
 *   progress/<examId>/summary   — per exam { attempted, correct, updatedAt }
 *   scenario/<scenarioId>       — scenario completion { completedAt }
 *   progress/meta               — { streak, lastStudyDate, updatedAt }
 *
 * Storage failure is never a false save: recordItem returns { saved: false,
 * reason } on failure and emits progress:saveFailed so the UI can surface an
 * honest recoverable error (Plan v2 L-02).
 */

class ProgressStore {
    #ready = false;

    async init() {
        await store.init();
        this.#ready = true;
    }

    #assertReady() {
        if (!this.#ready) throw new Error('ProgressStore used before init()');
    }

    async recordItem(examId, itemId, outcome) {
        this.#assertReady();
        const key = `progress/${examId}/${itemId}`;
        const existing = await store.get(key);
        const record = {
            itemId,
            isCorrect: !!outcome.isCorrect,
            reason: outcome.reason || '',
            attempts: (existing?.attempts || 0) + 1,
            lastAnswered: outcome.answeredAt || new Date().toISOString(),
        };
        try {
            await store.set(key, record);
            await this.#bumpSummary(examId, record.isCorrect);
        } catch (e) {
            this.#reportFailure(e, `progress record ${key}`);
            return { saved: false, reason: 'storage-write-failed' };
        }
        return { saved: true, record };
    }

    async getItem(examId, itemId) {
        this.#assertReady();
        return store.get(`progress/${examId}/${itemId}`);
    }

    /** Restore all progress records for an exam (REQ-UI-04). */
    async restore(examId, itemIds) {
        this.#assertReady();
        const restored = {};
        let attempted = 0;
        let correct = 0;
        for (const itemId of itemIds) {
            const rec = await store.get(`progress/${examId}/${itemId}`);
            if (rec) {
                restored[itemId] = rec;
                attempted += 1;
                if (rec.isCorrect) correct += 1;
            }
        }
        return { examId, attempted, correct, items: restored };
    }

    async recordScenario(scenarioId) {
        this.#assertReady();
        const key = `scenario/${scenarioId}`;
        try {
            await store.set(key, { scenarioId, completedAt: new Date().toISOString() });
        } catch (e) {
            this.#reportFailure(e, `scenario record ${key}`);
            return { saved: false, reason: 'storage-write-failed' };
        }
        return { saved: true };
    }

    async getScenario(scenarioId) {
        this.#assertReady();
        return store.get(`scenario/${scenarioId}`);
    }

    async clearExam(examId) {
        this.#assertReady();
        // StateStore has no key-iteration; summary deletion plus per-item
        // deletes driven by the caller's known itemIds.
        await store.delete(`progress/${examId}/summary`);
    }

    async #bumpSummary(examId, wasCorrect) {
        const key = `progress/${examId}/summary`;
        const prev = (await store.get(key)) || { attempted: 0, correct: 0 };
        const next = {
            examId,
            attempted: prev.attempted + 1,
            correct: prev.correct + (wasCorrect ? 1 : 0),
            updatedAt: new Date().toISOString(),
        };
        await store.set(key, next);
    }

    #reportFailure(err, what) {
        console.error('[ProgressStore] save failed for', what, err);
        bus.emit('progress:saveFailed', { what, message: String(err?.message || err) });
    }
}

export const progress = new ProgressStore();
