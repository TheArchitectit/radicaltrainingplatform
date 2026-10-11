import { bus } from './EventBus.js';
import { store } from './StateStore.js';
import { state } from './StateEngine.js';
import { progress } from './ProgressStore.js';

/**
 * DemoMode (T-21, REQ-DEMO-01..06) — the presenter's station contract.
 *
 * Demo mode is a DISTINCT mode, not learner mode with the sign-in hidden:
 *   - deterministic seed on entry — every scenario declares `fixtureSeed`
 *     and entering demo mode loads those declared seeds exactly;
 *   - synthetic data only — the simulator's seed fixtures are invented
 *     lab data, never real infrastructure (the scenario sweep scans the
 *     simulator sources for outbound-call primitives and fails on any);
 *   - no identity collection anywhere (REQ-UI-08) — this module stores a
 *     mode flag and seeds, nothing else, and never reads or writes a name,
 *     email, account, or device identifier;
 *   - one-click station reset clears the `progress/` and `scenario/`
 *     keyspaces, reseeds every fixture, and is confirmed by a reseed
 *     verification pass that drives each scenario's validator negative
 *     path (a freshly seeded station must satisfy nothing).
 *
 * The module deliberately does not import the scenario registry: callers
 * pass it in (app.js, the demo view, the sweep fixture). That keeps this
 * core module free of a view-layer dependency and keeps the "which
 * scenarios exist" question in exactly one place.
 *
 * Persisted keys (all under the learner store, all synthetic):
 *   demo/mode   — { active, enteredAt }
 *   demo/seeds  — { <scenarioId>: <fixtureSeed> }
 */

export const DEMO_MODE_KEY = 'demo/mode';
export const DEMO_SEEDS_KEY = 'demo/seeds';

/** The seed is a declared 32-bit integer, not a wall-clock or random value. */
export function isValidFixtureSeed(seed) {
    return Number.isInteger(seed) && seed > 0 && seed <= 0xFFFFFFFF;
}

/**
 * mulberry32 — a small deterministic PRNG. Given the same declared seed it
 * produces the same stream on every machine and every run, which is what
 * makes "loads that seed exactly" checkable rather than a claim.
 */
export function makeRng(seed) {
    let a = seed >>> 0;
    return function rng() {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

class DemoMode {
    #active = false;
    #seeds = {};
    #scenarios = [];

    /** Declared seeds, keyed by scenario ID (empty until enter()). */
    get seeds() {
        return { ...this.#seeds };
    }

    get active() {
        return this.#active;
    }

    /**
     * Restore a previously entered demo mode (a presenter reloading the
     * page mid-session must not drop out of the mode). Idempotent.
     */
    async init(scenarios = []) {
        if (scenarios.length) this.#scenarios = scenarios;
        const saved = await store.get(DEMO_MODE_KEY);
        if (saved?.active) {
            this.#active = true;
            this.#seeds = (await store.get(DEMO_SEEDS_KEY)) || {};
            bus.emit('demo:entered', { seeds: this.#seeds, restored: true });
        }
        return this.#active;
    }

    /**
     * Declared seeds for the given registry. Throws on a scenario that does
     * not declare one — a scenario with no seed is not demo-capable, and
     * silently defaulting it would make the "loads that seed exactly" claim
     * untrue for that scenario.
     */
    declaredSeeds(scenarios = this.#scenarios) {
        const seeds = {};
        for (const s of scenarios) {
            if (!isValidFixtureSeed(s.fixtureSeed)) {
                throw new Error(`scenario "${s.id}" declares no valid fixtureSeed (got ${JSON.stringify(s.fixtureSeed)})`);
            }
            seeds[s.id] = s.fixtureSeed;
        }
        return seeds;
    }

    /** The declared seed for one scenario, or null when it declares none. */
    seedFor(scenarioId) {
        return this.#seeds[scenarioId] ?? null;
    }

    /**
     * A deterministic PRNG bound to a scenario's declared seed. Option
     * shuffling (S47-06) and any fixture jitter draw from this so the same
     * seed reproduces the same station.
     */
    rngFor(scenarioId) {
        const seed = this.seedFor(scenarioId);
        if (!isValidFixtureSeed(seed)) {
            throw new Error(`no loaded seed for scenario "${scenarioId}" — enter demo mode first`);
        }
        return makeRng(seed);
    }

    /**
     * Enter demo mode. Order matters and is the contract:
     *   1. read every declared seed (fail before touching any state);
     *   2. reset the simulator to its seed fixtures (synthetic data only);
     *   3. persist the mode flag and the loaded seeds.
     * Returns the loaded seed map so the caller can report it honestly.
     */
    async enter(scenarios = this.#scenarios) {
        const seeds = this.declaredSeeds(scenarios);
        this.#scenarios = scenarios;

        await state.reset();

        this.#seeds = seeds;
        this.#active = true;
        await store.set(DEMO_SEEDS_KEY, seeds);
        await store.set(DEMO_MODE_KEY, { active: true, enteredAt: new Date().toISOString() });

        bus.emit('demo:entered', { seeds });
        return seeds;
    }

    /**
     * Leave demo mode. The station is reset on the way out so a learner
     * never inherits a presenter's answers (the reverse must also hold:
     * entering demo mode never inherits a learner's).
     */
    async exit() {
        await this.resetStation();
        this.#active = false;
        this.#seeds = {};
        await store.delete(DEMO_MODE_KEY);
        await store.delete(DEMO_SEEDS_KEY);
        bus.emit('demo:exited', {});
        return { active: false };
    }

    /**
     * One-click station reset (REQ-DEMO-05). Clears the learner keyspaces,
     * reseeds the simulator fixtures, and then VERIFIES the reseed rather
     * than asserting it: every scenario's validator is driven against the
     * fresh state and must report unmet (a seeded station that already
     * satisfies a scenario would hand the next group a free pass).
     *
     * Returns a report, never a bare boolean — the presenter and the sweep
     * fixture both read the same structure.
     */
    async resetStation(scenarios = this.#scenarios) {
        const cleared = await progress.clearStation();
        await state.reset();
        const verification = this.verifyReseed(scenarios);
        const report = {
            clearedKeys: cleared.cleared,
            seededScenarios: verification.seeded,
            verification,
        };
        bus.emit('demo:stationReset', report);
        return report;
    }

    /**
     * Reseed verification pass. Two independent checks per scenario:
     *   - the declared seed is loaded exactly (equal to the registry's);
     *   - the fresh station fails the scenario (validator negative path).
     * A scenario whose validator throws counts as failed-to-seed, not as
     * "passed" — a poisoned validator must never read as a clean station.
     */
    verifyReseed(scenarios = this.#scenarios) {
        const results = [];
        const trace = state.getAll('action_trace');
        for (const scenario of scenarios) {
            const declared = scenario.fixtureSeed;
            const loaded = this.#seeds[scenario.id] ?? null;
            const seedMatches = loaded === declared;

            const unmetObjectives = [];
            let threw = null;
            for (const obj of scenario.objectives || []) {
                let passed = false;
                try {
                    passed = obj.validate(state, trace)?.passed === true;
                } catch (e) {
                    threw = `${scenario.id}/${obj.id}: ${e?.message || e}`;
                    passed = false;
                }
                if (passed) unmetObjectives.push(obj.id);
            }

            results.push({
                scenarioId: scenario.id,
                declaredSeed: declared,
                loadedSeed: loaded,
                seedMatches,
                failedValidator: threw,
                // The negative path holds when nothing passes on a fresh seed.
                negativePathHolds: unmetObjectives.length === 0 && !threw,
                passingOnFreshSeed: unmetObjectives,
            });
        }
        return {
            seeded: results.length,
            passed: results.filter(r => r.seedMatches && r.negativePathHolds).length,
            ok: results.every(r => r.seedMatches && r.negativePathHolds),
            results,
        };
    }
}

export const demo = new DemoMode();
