import { store } from './StateStore.js';
import { bus } from './EventBus.js';

/**
 * ProgressStore (T-12, REQ-UI-04/05) — durable learner progress over
 * StateStore's IndexedDB (RadicalTrainingPlatformLab) / localStorage (lab_)
 * stack. Keys:
 *   progress/<examId>/<itemId>       — per scored item { isCorrect, reason,
 *                                      firstCorrect, latestCorrect, attempts,
 *                                      lastAnswered }
 *   progress/<examId>/summary        — per exam { attempted, correct,
 *                                      firstCorrect, updatedAt }
 *   progress/<examId>/continuation   — mid-run position { index, selection,
 *                                      results, total, savedAt } (R-15)
 *   scenario/<scenarioId>            — scenario completion { completedAt }
 *   progress/meta                    — { streak, bestStreak, streakItems,
 *                                      lastStudyDate, updatedAt }
 *
 * Item identity (R-13): itemId is the source-aware semantic ID
 * (examId/sourceFile/Qn — see SemanticItemId.cs / generate-study-content.py).
 * A bare exam+number is ambiguous across multi-part banks and must not be
 * used as a storage key.
 *
 * Retry outcome set (R-14 / D9): firstCorrect is frozen at the first attempt
 * and never moves; latestCorrect (and the isCorrect alias) is the displayed
 * outcome. When the two disagree, BOTH are stored and BOTH are reported —
 * no state where they contradict without both being visible.
 *
 * Streak (R-17): derives from attempt history, never a counter retries
 * inflate. streakItems holds the distinct items in the current run so a
 * correct retry of an already-counted item cannot add a phantom step; any
 * miss (wrong answer or skip) resets the run.
 *
 * Skip (R-17): skipItem is the ONLY emitter of progress:skipped. Submit and
 * retry never fire that notification.
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
        return this.#recordOutcome(examId, itemId, outcome);
    }

    /**
     * R-17: a real skip. Records the item as a miss (same shape as a wrong
     * submit) and emits progress:skipped — the ONLY place that event fires.
     * Submit/retry must never notify skip.
     */
    async skipItem(examId, itemId) {
        this.#assertReady();
        const result = await this.#recordOutcome(examId, itemId, {
            isCorrect: false,
            reason: 'skipped',
        });
        if (result.saved) {
            bus.emit('progress:skipped', { examId, itemId });
        }
        return result;
    }

    async #recordOutcome(examId, itemId, outcome) {
        this.#assertReady();
        const key = `progress/${examId}/${itemId}`;
        const existing = await store.get(key);
        const latest = !!outcome.isCorrect;

        // R-14/D9: firstCorrect is frozen at the first attempt. A legacy
        // record without an explicit firstCorrect keeps its only recorded
        // outcome as the first when attempts === 1; otherwise the first is
        // honestly unknown (null) rather than guessed from the latest.
        let firstCorrect;
        if (!existing) {
            firstCorrect = latest;
        } else if (typeof existing.firstCorrect === 'boolean') {
            firstCorrect = existing.firstCorrect;
        } else if (existing.attempts === 1) {
            firstCorrect = !!existing.isCorrect;
        } else {
            firstCorrect = null;
        }

        const record = {
            itemId,
            // isCorrect stays the displayed outcome = latest (R-14/D9).
            isCorrect: latest,
            firstCorrect,
            latestCorrect: latest,
            reason: outcome.reason || '',
            attempts: (existing?.attempts || 0) + 1,
            lastAnswered: outcome.answeredAt || new Date().toISOString(),
        };
        try {
            await store.set(key, record);
            await this.#bumpSummary(examId, {
                isNew: !existing,
                previousLatest: existing ? !!existing.isCorrect : undefined,
                latest,
                firstCorrect,
            });
            await this.#recordAttemptInMeta(examId, itemId, latest);
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

    /**
     * Restore all progress records for an exam (REQ-UI-04).
     * attempted/correct count unique items with display = latest;
     * firstCorrect counts items whose FIRST attempt was correct. When the
     * two disagree the difference is visible in these two numbers.
     */
    async restore(examId, itemIds) {
        this.#assertReady();
        const restored = {};
        let attempted = 0;
        let correct = 0;
        let firstCorrect = 0;
        for (const itemId of itemIds) {
            const rec = await store.get(`progress/${examId}/${itemId}`);
            if (rec) {
                restored[itemId] = rec;
                attempted += 1;
                if (rec.isCorrect) correct += 1;
                if (rec.firstCorrect === true) firstCorrect += 1;
            }
        }
        return { examId, attempted, correct, firstCorrect, items: restored };
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
        // deletes driven by the caller's known itemIds. Continuation dies
        // with the exam's progress (R-15: a reset never leaves a stale
        // mid-run pointer behind).
        await store.delete(`progress/${examId}/summary`);
        await store.delete(`progress/${examId}/continuation`);
    }

    // ─── Study continuation (R-15) ─────────────────────────────────

    /**
     * Persist mid-run position: which item, the in-progress selection, and
     * the results collected so far. Written on every index/selection change
     * so leaving for Stats/Blueprint or closing the tab restores exactly.
     */
    async saveContinuation(examId, state) {
        this.#assertReady();
        const key = `progress/${examId}/continuation`;
        const record = {
            examId,
            index: Number.isInteger(state.index) ? state.index : 0,
            selection: Array.isArray(state.selection) ? [...state.selection] : [],
            results: Array.isArray(state.results)
                ? state.results.map(r => ({ isCorrect: !!r?.isCorrect }))
                : [],
            total: Number.isInteger(state.total) ? state.total : 0,
            savedAt: new Date().toISOString(),
        };
        try {
            await store.set(key, record);
        } catch (e) {
            this.#reportFailure(e, `continuation ${key}`);
            return { saved: false, reason: 'storage-write-failed' };
        }
        return { saved: true, record };
    }

    async loadContinuation(examId) {
        this.#assertReady();
        return store.get(`progress/${examId}/continuation`);
    }

    async clearContinuation(examId) {
        this.#assertReady();
        await store.delete(`progress/${examId}/continuation`);
    }

    // ─── Streak from attempt history (R-17) ────────────────────────

    /**
     * Update progress/meta streak state from one scored attempt. A correct
     * attempt of an item already in the current run is a retry and does not
     * extend the streak; any miss resets the run.
     */
    async #recordAttemptInMeta(examId, itemId, correct) {
        const key = 'progress/meta';
        const prev = (await store.get(key)) || {};
        const runKey = `${examId}/${itemId}`;
        let streak = prev.streak || 0;
        let streakItems = Array.isArray(prev.streakItems) ? [...prev.streakItems] : [];
        let bestStreak = prev.bestStreak || 0;

        if (!correct) {
            streak = 0;
            streakItems = [];
        } else if (!streakItems.includes(runKey)) {
            streak += 1;
            streakItems.push(runKey);
        }

        if (streak > bestStreak) bestStreak = streak;

        const next = {
            streak,
            bestStreak,
            streakItems,
            lastStudyDate: new Date().toISOString().slice(0, 10),
            updatedAt: new Date().toISOString(),
        };
        await store.set(key, next);
        return next;
    }

    async getMeta() {
        this.#assertReady();
        return (await store.get('progress/meta')) || {
            streak: 0, bestStreak: 0, streakItems: [], lastStudyDate: null, updatedAt: null,
        };
    }

    /**
     * Summary counts UNIQUE items, not scored events (R-14/R-04: a retry
     * must not inflate totals). display = latest: `correct` tracks items
     * whose latest outcome is correct; `firstCorrect` tracks items whose
     * first attempt was correct. A pass-then-fail item keeps its
     * firstCorrect win and loses its latest win — both numbers move, so
     * the disagreement is visible.
     */
    async #bumpSummary(examId, { isNew, previousLatest, latest, firstCorrect }) {
        const key = `progress/${examId}/summary`;
        const prev = (await store.get(key)) || { attempted: 0, correct: 0, firstCorrect: 0 };
        const next = {
            examId,
            attempted: prev.attempted + (isNew ? 1 : 0),
            correct: prev.correct + (isNew
                ? (latest ? 1 : 0)
                : (previousLatest === latest ? 0 : (latest ? 1 : -1))),
            firstCorrect: prev.firstCorrect + (isNew && firstCorrect === true ? 1 : 0),
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
