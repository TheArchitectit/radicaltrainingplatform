import { BaseView } from './BaseView.js';
import { TRACKS, DISCLAIMER } from '../study-content.js';
import { progress } from '../core/ProgressStore.js';
import { toast } from '../components/Toast.js';

/**
 * Track picker (T-11, REQ-UI-01) — lists the tracks from the compiled
 * manifests only: display name, audience, preview label, objective coverage
 * (REQ-MAN-07) and the exact non-endorsement disclaimer (REQ-BRAND-02,
 * rendered by reference from the manifest string).
 *
 * Also carries the classroom kit's progress portability controls (S39). The
 * platform has no account and no server, so a learner's history belongs to a
 * browser profile; export/import is the only way it can follow them to
 * another profile or machine. It writes a local file and touches no network.
 */
export class TrackPickerView extends BaseView {
    async render() {
        const tracks = Object.values(TRACKS).sort((a, b) => a.order - b.order);
        const cards = tracks.map(t => `
            <a class="track-card" href="#/tracks/${t.trackId}">
                <div class="track-card-head">
                    <span class="track-title">${t.title}</span>
                    <span class="preview-label">${t.previewLabel}</span>
                </div>
                <div class="track-audience">${t.audience}</div>
                <div class="track-coverage">
                    <div class="coverage-bar"><div class="coverage-fill" style="width:${t.coverage.percent}%"></div></div>
                    <span class="coverage-text">objective coverage ${t.coverage.covered}/${t.coverage.total} (${t.coverage.percent}%)</span>
                </div>
                <div class="track-cta">Open track ›</div>
            </a>`).join('');
        return this.html(`
            <div class="study-page">
                <h1 class="study-title">Study Tracks</h1>
                <p class="study-sub">Pick a certification track to begin. Coverage shows how much of the exam's published objective list currently has released lessons and practice items.</p>
                <div class="track-grid">${cards}</div>
                <section class="study-kit" aria-labelledby="study-kit-heading">
                    <h2 id="study-kit-heading" class="study-section-title">Move your progress</h2>
                    <p class="study-sub">Progress is stored in this browser profile — there is no account and no server. Export it to a file to carry it to another machine or browser profile, or import a file to restore it. Nothing leaves this device.</p>
                    <div class="study-kit-actions">
                        <button class="study-button" id="kit-export" type="button">Export progress</button>
                        <button class="study-button secondary" id="kit-import" type="button">Import progress</button>
                        <input type="file" id="kit-import-file" accept=".json,application/json" hidden />
                    </div>
                    <p class="study-sub" id="kit-status" role="status" aria-live="polite"></p>
                </section>
                <p class="study-disclaimer">${DISCLAIMER}</p>
            </div>`);
    }

    async afterRender() {
        await progress.init();
        const exportBtn = document.getElementById('kit-export');
        const importBtn = document.getElementById('kit-import');
        const importFile = document.getElementById('kit-import-file');
        const status = document.getElementById('kit-status');
        if (!exportBtn || !importBtn || !importFile) return;

        exportBtn.addEventListener('click', async () => {
            const envelope = await progress.exportProgress();
            const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rtp-progress-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            const count = Object.keys(envelope.entries).length;
            if (status) status.textContent = `Exported ${count} progress record${count === 1 ? '' : 's'}.`;
            toast.success('Progress exported.');
        });

        importBtn.addEventListener('click', () => importFile.click());

        importFile.addEventListener('change', async () => {
            const file = importFile.files?.[0];
            if (!file) return;
            const result = await progress.importProgress(await file.text());
            importFile.value = '';
            if (!result.imported) {
                const why = result.detail ? `${result.reason}: ${result.detail}` : result.reason;
                if (status) status.textContent = `Import refused — ${why}. Nothing was changed.`;
                toast.warning(`Import refused: ${why}`);
                return;
            }
            if (status) status.textContent = `Imported ${result.keys} record${result.keys === 1 ? '' : 's'}.`;
            toast.success('Progress imported. Reloading…');
            setTimeout(() => location.reload(), 800);
        });
    }
}
