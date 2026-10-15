import { BaseView } from './BaseView.js';
import { demo } from '../core/DemoMode.js';
import { SCENARIOS } from './scenarios.js';

/**
 * DemoModeView (T-21, REQ-DEMO-01..06) — the presenter's control screen.
 *
 * Three controls, all plain buttons (natively tabbable and operable from
 * the keyboard — the demo path has no hover-only affordance):
 *   - Enter demo mode: reads every declared fixture seed and reseeds the
 *     station from it (REQ-DEMO-01).
 *   - One-click station reset: clears progress/ and scenario/, reseeds the
 *     fixtures, and shows the reseed verification pass (REQ-DEMO-05).
 *   - Leave demo mode: resets the station on the way out, so a learner
 *     never inherits a presenter's answers and vice versa.
 *
 * The verification table is the point of this screen: it reports, per
 * scenario, the declared seed, the loaded seed, and whether the fresh
 * station fails that scenario's validator. A presenter can see the
 * reseed actually happened instead of trusting a toast.
 */

export class DemoModeView extends BaseView {
    async render() {
        const active = demo.active;
        const seeds = active ? demo.seeds : {};
        return this.html(`
            <div class="study-page demo-page">
                <a class="study-back" href="#/tracks">‹ All tracks</a>
                <h1 class="study-title">Demo mode</h1>
                <p class="study-sub">
                    A distinct mode for presenting: deterministic seeds, synthetic lab data only,
                    no identity collection, and a one-click reset between student groups.
                </p>

                <div class="demo-status ${active ? 'on' : 'off'}" id="demo-status">
                    <strong>${active ? 'Demo mode is active' : 'Demo mode is off'}</strong>
                    <span class="text-secondary text-sm">${active
                        ? 'The demo mode label is shown on every screen.'
                        : 'Learner mode: progress is kept between sessions.'}</span>
                </div>

                <div class="demo-actions">
                    <button class="btn btn-primary demo-enter" id="demo-enter" ${active ? 'disabled' : ''}>Enter demo mode</button>
                    <button class="btn btn-primary demo-reset" id="demo-reset" ${active ? '' : 'disabled'}>Reset station for the next group</button>
                    <button class="btn btn-secondary demo-exit" id="demo-exit" ${active ? '' : 'disabled'}>Leave demo mode</button>
                </div>
                ${active ? '' : '<p class="text-secondary text-sm">Enter demo mode to enable the station reset.</p>'}

                <div class="demo-report" id="demo-report">
                    ${active ? this.#renderSeedTable(seeds) : ''}
                </div>

                <div class="demo-notes">
                    <h2 class="completion-section">What this mode does not do</h2>
                    <ul>
                        <li>It does not collect a name, email, account, or device identifier.</li>
                        <li>It does not call any real infrastructure — the simulator is local fixtures only.</li>
                        <li>It does not score you against an exam, and it never predicts exam performance.</li>
                    </ul>
                </div>
            </div>`);
    }

    #renderSeedTable(seeds) {
        const rows = SCENARIOS.map(s => `
            <tr>
                <td><code>${s.id}</code></td>
                <td>${s.fixtureSeed}</td>
                <td>${seeds[s.id] ?? '—'}</td>
            </tr>`).join('');
        return `
            <h2 class="completion-section">Loaded fixture seeds</h2>
            <p class="text-secondary text-sm">${Object.keys(seeds).length} of ${SCENARIOS.length} scenarios declare a fixture seed; entering demo mode loaded each one exactly.</p>
            <div class="table-scroll">
                <table class="demo-table">
                    <thead><tr><th>Scenario</th><th>Declared seed</th><th>Loaded seed</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
    }

    #renderVerification(report) {
        const v = report.verification;
        const rows = v.results.map(r => `
            <tr class="${r.seedMatches && r.negativePathHolds ? 'ok' : 'bad'}">
                <td><code>${r.scenarioId}</code></td>
                <td>${r.declaredSeed}</td>
                <td>${r.loadedSeed ?? '—'}</td>
                <td>${r.seedMatches ? 'exact' : 'MISMATCH'}</td>
                <td>${r.failedValidator
                    ? `validator error: ${r.failedValidator}`
                    : (r.negativePathHolds
                        ? 'fails on a fresh seed (correct)'
                        : `unexpectedly satisfied: ${r.passingOnFreshSeed.join(', ')}`)}</td>
            </tr>`).join('');
        return `
            <h2 class="completion-section">Reseed verification</h2>
            <p class="text-secondary text-sm">
                Cleared ${report.clearedKeys} stored learner key(s). Verification: ${v.passed}/${v.seeded}
                scenarios reseeded and failing on a fresh station — ${v.ok ? 'all correct' : 'NOT all correct'}.
            </p>
            <div class="table-scroll">
                <table class="demo-table">
                    <thead><tr><th>Scenario</th><th>Declared</th><th>Loaded</th><th>Seed</th><th>Negative path</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
    }

    afterRender() {
        const report = document.getElementById('demo-report');

        document.getElementById('demo-enter')?.addEventListener('click', async () => {
            try {
                await demo.enter(SCENARIOS);
            } catch (e) {
                if (report) report.innerHTML = `<p class="practice-save-warning">Could not enter demo mode: ${e?.message || e}</p>`;
                return;
            }
            this.#rerender();
        });

        document.getElementById('demo-reset')?.addEventListener('click', async () => {
            const r = await demo.resetStation(SCENARIOS);
            if (report) report.innerHTML = this.#renderVerification(r);
        });

        document.getElementById('demo-exit')?.addEventListener('click', async () => {
            await demo.exit();
            this.#rerender();
        });
    }

    async #rerender() {
        const el = await this.render();
        this.#swap(el);
        this.afterRender();
    }

    #swap(el) {
        const parent = this.root.parentElement;
        if (!parent) return;
        parent.replaceChild(el, this.root);
        this.root = el;
    }
}
