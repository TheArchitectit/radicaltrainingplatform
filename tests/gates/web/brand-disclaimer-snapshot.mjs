/**
 * REQ-BRAND-02 snapshot — the exact non-endorsement disclaimer appears
 * byte-for-byte on every study surface that renders it:
 *   - track picker (`/tracks`)
 *   - exam/track overview (`/tracks/:trackId`)
 *   - the compiled DISCLAIMER constant (stored once, rendered by reference)
 *
 * The demo-script surface (T-30, Sprint 47) is asserted when the script
 * exists; until then the fixture reports it as pending rather than
 * silently claiming coverage.
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

const EXPECTED = 'This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.';

installDom();
const runner = makeRunner();

const { DISCLAIMER, TRACKS, EXAMS } = await import('../../../RadicalTrainingPlatform.Web/js/study-content.js');
const { TrackPickerView } = await import('../../../RadicalTrainingPlatform.Web/js/views/track-picker.js');
const { TrackOverviewView } = await import('../../../RadicalTrainingPlatform.Web/js/views/track-overview.js');

await runner.test('compiled DISCLAIMER is the exact REQ-BRAND-02 string', async () => {
    assertEqual(DISCLAIMER, EXPECTED, 'DISCLAIMER constant must match the normative string byte-for-byte');
});

await runner.test('every track manifest disclaimer matches the normative string', async () => {
    for (const track of Object.values(TRACKS)) {
        assertEqual(track.disclaimer, EXPECTED, `track ${track.trackId} disclaimer`);
    }
});

await runner.test('track picker renders the exact disclaimer', async () => {
    const view = new TrackPickerView();
    const el = await view.render();
    assert(el.textContent.includes(EXPECTED), 'track picker must render the exact disclaimer');
});

await runner.test('track overview renders the exact disclaimer', async () => {
    const trackId = Object.keys(TRACKS)[0];
    assert(trackId, 'at least one track must exist');
    const view = new TrackOverviewView();
    const el = await view.render({ trackId });
    assert(el.textContent.includes(EXPECTED), 'track overview must render the exact disclaimer');
});

await runner.test('every exam screen (track overview exam blocks) is covered by the overview disclaimer', async () => {
    for (const track of Object.values(TRACKS)) {
        const view = new TrackOverviewView();
        const el = await view.render({ trackId: track.trackId });
        for (const examId of track.examIds) {
            const exam = EXAMS[examId];
            assert(exam, `exam ${examId} must exist for track ${track.trackId}`);
            assert(
                el.textContent.includes(exam.displayName),
                `overview for ${track.trackId} must show exam ${examId}`
            );
        }
        assert(el.textContent.includes(EXPECTED), `overview for ${track.trackId} must carry the disclaimer`);
    }
});

await runner.test('demo script carries the exact disclaimer (or is reported pending)', async () => {
    const { readFileSync, existsSync } = await import('node:fs');
    const candidates = [
        'docs/demo/DEMO-SCRIPT.md',
        'docs/DEMO-SCRIPT.md',
    ];
    const found = candidates.filter(p => existsSync(p));
    if (!found.length) {
        console.log('  pending: demo script not yet authored (T-30, Sprint 47) — REQ-BRAND-02 surface tracked');
        return;
    }
    for (const p of found) {
        const text = readFileSync(p, 'utf8');
        assert(text.includes(EXPECTED), `${p} must contain the exact disclaimer`);
    }
});

process.exit(runner.done('brand-disclaimer-snapshot'));
