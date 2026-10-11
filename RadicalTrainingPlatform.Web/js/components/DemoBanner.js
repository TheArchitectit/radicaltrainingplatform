import { bus } from '../core/EventBus.js';
import { demo } from '../core/DemoMode.js';

/**
 * DemoBanner (T-21, REQ-DEMO-02) — the "demo mode" label.
 *
 * REQ-DEMO-02 requires the label on every screen, so it lives in the app
 * shell (index.html) rather than in any one view: a view-mounted banner
 * would disappear exactly when the presenter navigates. This module only
 * toggles that shell element, and it is the single place that decides
 * visibility — so "is the label showing?" has one answer.
 *
 * The element is `role="status"` and text-only: it is not a hover tooltip,
 * not a color-only signal, and it stays legible at projector distance
 * (see `.demo-banner` in css/study.css).
 */

export function initDemoBanner() {
    const el = document.getElementById('demo-banner');
    if (!el) return;

    const sync = () => {
        el.hidden = !demo.active;
        el.classList.toggle('demo-banner-active', demo.active);
        // Projector readability (REQ-DEMO-05 / REQ-UI-06): demo mode bumps
        // the base type scale so the presenter's screen reads from the back
        // of a room. Scoped to demo mode — learner mode keeps its own scale.
        document.body.classList.toggle('demo-mode', demo.active);
    };

    bus.on('demo:entered', sync);
    bus.on('demo:exited', sync);
    sync();
}
