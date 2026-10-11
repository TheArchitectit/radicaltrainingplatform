import { BaseView } from './BaseView.js';
import { TRACKS, DISCLAIMER } from '../study-content.js';

/**
 * Track picker (T-11, REQ-UI-01) — lists the tracks from the compiled
 * manifests only: display name, audience, preview label, objective coverage
 * (REQ-MAN-07) and the exact non-endorsement disclaimer (REQ-BRAND-02,
 * rendered by reference from the manifest string).
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
                <p class="study-disclaimer">${DISCLAIMER}</p>
            </div>`);
    }
}
