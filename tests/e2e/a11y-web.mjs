#!/usr/bin/env node
/**
 * Web accessibility gate (Sprints 35-36, S35-01..S35-07).
 *
 * Failing side this gate names: nothing in the repository measured the PWA's
 * accessibility. Sprint 25 built the foundation for the *desktop* Avalonia
 * client (AutomationPeers, live regions, focus indicators) and the Web PWA —
 * which is what the October demo actually runs — was never audited at all.
 * Measured on 2026-10-14, the shell had no `<h1>`, no skip link, unnamed icon
 * buttons, a toast container with no live region, a modal with no dialog
 * semantics or focus management, no `prefers-color-scheme` support, and header
 * text painted at 1.05:1 — dark-on-dark — because `.header-bar` and
 * `.pc-sidebar` use `--text-inverse`, a token the dark theme flips, on
 * backgrounds that stay dark in both themes.
 *
 * This script:
 *   1. serves RadicalTrainingPlatform.Web/ over a loopback static server,
 *   2. launches headless Chrome and drives it over the DevTools Protocol,
 *   3. opens every study route and runs an in-page WCAG 2.1 AA audit —
 *      contrast, accessible names, landmarks, heading order, skip link,
 *      live regions, image alternatives, focus indicators,
 *   4. drives the modal dialog through the keyboard to check role, name,
 *      initial focus, focus trap, Escape, and focus restore,
 *   5. repeats the contrast audit in the light theme and verifies that an
 *      explicit theme choice wins while an absent one follows the OS.
 *
 * Zero npm dependencies on purpose: the repo has no package.json, and a gate
 * that needs an install step is a gate that gets skipped. Node's global
 * WebSocket (Node >= 22) speaks CDP directly.
 *
 * What this gate does NOT check, so a green run is not read as more than it is:
 *   - **Only routes the router registers.** The route list is read out of
 *     `js/app.js` rather than hand-written, and the gate fails if it cannot
 *     parse a registration or has no concrete instance for a parameterized
 *     route — but a view reachable only by clicking, with no route of its own,
 *     is still never opened. Coverage of the *route table* is asserted; coverage
 *     of the *application* is not.
 *   - **Contrast is computed from solid `background-color` only.** An element
 *     painted over a gradient, an image, or a `backdrop-filter` layer is
 *     measured against the nearest solid ancestor colour, so a genuinely low
 *     ratio over a gradient would not be reported. This app uses solid fills;
 *     a future gradient would need this check revisited.
 *   - **Non-text contrast (WCAG 1.4.11) is not measured** — component
 *     boundaries and graphical objects are not classified here.
 *   - **Nothing about screen readers, switch access, or a real assistive
 *     technology.** This measures the DOM and the computed styles a screen
 *     reader reads *from*; it does not run one.
 *   - **No human has read the pages.** S35-01 asks for an auditor; this is the
 *     engine half of that audit, and the conformance report says so.
 *
 * Env:
 *   CHROME_BIN      path to the browser (else PATH is searched)
 *   A11Y_WEB_ROOT   artifact directory to serve (default: the repo's Web dir);
 *                   tests/gates/run_a11y_fixtures.sh points this at a
 *                   deliberately broken copy to prove the gate can fail
 *   A11Y_TARGETS    comma-separated paths to audit instead of the real routes
 *   A11Y_LOG_OUT    write the audit log to this path (archived as S35-01 evidence)
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const WEB_ROOT = resolve(process.env.A11Y_WEB_ROOT || 'RadicalTrainingPlatform.Web');

// Every study surface a student can reach from the router. The PE/PC simulator
// screens are the bulk of the app but share the shell's chrome, which the
// routes below already exercise; the study routes are the ones the October
// demo runs and the ones Sprint 46/47 added.
//
// `/pc/clusters` and `/pc/vms` are here for a different reason: they are the
// two routes whose EntityTable is `selectable: true`, so they are the only
// coverage of the per-row checkbox and the per-row action button — the class of
// control that the audit found unnamed and that no amount of shell testing
// reaches. A component class covered on one route is covered.
const DEFAULT_TARGETS = [
    'index.html#/pe/dashboard',
    'index.html#/tracks',
    'index.html#/tracks/track-nca',
    'index.html#/tracks/track-nca/lessons/NCA-75/s1_1',
    'index.html#/practice/NCA-75',
    'index.html#/demo',
    'index.html#/tutor',
    'index.html#/pc/scenarios',
    'index.html#/pc/clusters',
    'index.html#/pc/vms',
];

// Concrete instances of the app's parameterized routes. The router table names
// them as patterns (`/tracks/:trackId`), and the gate cannot invent a track id —
// so these are the one hand-maintained part of the route list. The content IDs
// are stable by contract (SPEC-16: never renumber or silently remap an existing
// content ID), so a failure here means content moved, which is worth knowing.
const PARAMETERIZED_TARGETS = [
    'index.html#/tracks/track-nca',
    'index.html#/tracks/track-nca/lessons/NCA-75/s1_1',
    'index.html#/practice/NCA-75',
    'index.html#/tutor/NCA-75',
    // S37-03. The deck picker (/flashcards) is unparameterized and is picked up
    // from the router table; this is the review run it links into.
    'index.html#/flashcards/NCA-75',
];

/**
 * The routes to audit, read from the app's own router table.
 *
 * A hand-written list is a coverage claim that drifts: every view added since it
 * was written is silently unaudited, and the gate keeps passing while its
 * surface shrinks. Reading `router.register(...)` out of `js/app.js` makes the
 * gate's surface the app's surface. Fixture roots have no `app.js`, so those
 * fall back to `DEFAULT_TARGETS` (and in practice set `A11Y_TARGETS` anyway).
 */
function discoverTargets() {
    const appJs = join(WEB_ROOT, 'js/app.js');
    if (!existsSync(appJs)) {
        return { routes: DEFAULT_TARGETS, registered: [], covered: true, uncovered: [], unparsed: 0 };
    }
    const source = readFileSync(appJs, 'utf8');
    const registered = [...source.matchAll(/router\.register\(\s*'([^']+)'/g)].map((m) => m[1]);
    const routes = [
        ...registered.filter((p) => !p.includes(':')).map((p) => `index.html#${p}`),
        ...PARAMETERIZED_TARGETS,
    ];
    // Two ways a view can end up unaudited, and both are checked, because a
    // coverage claim that is only approximately true is not a coverage claim:
    //
    //   1. A registration this regex cannot see — a path held in a variable, a
    //      call spread over lines with the path on the next one. Counting the
    //      call sites catches it, because the parse found fewer paths than there
    //      are calls.
    //   2. A parameterized route with no concrete instance above, which would
    //      otherwise be dropped silently (the gate cannot invent a track id).
    const calls = (source.match(/router\.register\(/g) || []).length;
    const unparsed = calls - registered.length;
    const uncovered = registered.filter((p) => p.includes(':')
        && !PARAMETERIZED_TARGETS.some((t) => t.includes(p.slice(0, p.indexOf(':')))));
    return {
        routes,
        registered,
        covered: uncovered.length === 0 && unparsed === 0,
        uncovered,
        unparsed,
    };
}

const TARGETS = (process.env.A11Y_TARGETS || '').split(',').map((s) => s.trim()).filter(Boolean);
const DISCOVERY = discoverTargets();
const ROUTES = TARGETS.length ? TARGETS : DISCOVERY.routes;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json',
};

// At most this many findings of one rule on one target are printed; the total
// is always printed. Without a cap a missing focus indicator prints one line
// per focusable element and buries every other finding.
const PER_RULE_CAP = 6;

const log = [];
function say(line) {
    log.push(line);
    process.stdout.write(line + '\n');
}

// ── The in-page audit ───────────────────────────────────────────────────────
// Written as a real function and injected with String(fn), so the browser-side
// code is readable JavaScript rather than an escaped template literal. It must
// stay self-contained: no reference to anything outside its own body.

function pageAudit() {
    const out = [];
    const add = (rule, detail) => out.push({ rule, detail });

    // ── colour maths (WCAG 2.x relative luminance) ──
    const parseColor = (c) => {
        const m = /^rgba?\(([^)]+)\)$/.exec(c || '');
        if (!m) return null;
        const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
        if (p.length < 3 || p.some((n) => Number.isNaN(n))) return null;
        return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const over = (fg, bg) => ({
        r: fg.r * fg.a + bg.r * (1 - fg.a),
        g: fg.g * fg.a + bg.g * (1 - fg.a),
        b: fg.b * fg.a + bg.b * (1 - fg.a),
        a: 1,
    });
    const lum = (c) => {
        const f = (v) => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const ratio = (a, b) => {
        const l1 = lum(a), l2 = lum(b);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };

    // ── visibility ──
    // The `hidden` attribute is honoured explicitly because `.demo-banner`
    // sets `display: flex`, which would otherwise beat the UA `hidden` rule.
    const shown = (el) => {
        if (el.closest('[hidden]')) return false;
        for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
            const cs = getComputedStyle(n);
            if (cs.display === 'none' || cs.visibility === 'hidden') return false;
            if (parseFloat(cs.opacity) === 0) return false;
        }
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
    };

    const describe = (el) => {
        let s = el.tagName.toLowerCase();
        if (el.id) s += '#' + el.id;
        const cls = typeof el.className === 'string' ? el.className.trim() : '';
        if (cls) s += '.' + cls.split(/\s+/).join('.');
        return s;
    };

    // Effective background: composite every solid ancestor fill, root first,
    // starting from the browser's white canvas.
    const effectiveBg = (el) => {
        const chain = [];
        for (let n = el; n && n.nodeType === 1; n = n.parentElement) chain.push(n);
        chain.reverse();
        let bg = { r: 255, g: 255, b: 255, a: 1 };
        for (const n of chain) {
            const c = parseColor(getComputedStyle(n).backgroundColor);
            if (c && c.a > 0) bg = over(c, bg);
        }
        return bg;
    };

    // ── accessible name (a deliberately reduced accname computation) ──
    // `fromContent` is the accname "name from content" step, and it is only
    // valid for roles that allow it — button, link, heading, cell. A landmark
    // is NOT one of them: a <nav> wrapping a link named "Home" is still an
    // unnamed landmark, and two of them cannot be told apart. Falling back to
    // textContent for landmarks would make this rule unable to fire at all.
    const nameOf = (el, { fromContent = true } = {}) => {
        const by = el.getAttribute('aria-labelledby');
        if (by) {
            const parts = by.split(/\s+/)
                .map((id) => document.getElementById(id))
                .filter(Boolean)
                .map((n) => n.textContent.trim())
                .filter(Boolean);
            if (parts.length) return { name: parts.join(' '), src: 'aria-labelledby' };
        }
        const al = el.getAttribute('aria-label');
        if (al && al.trim()) return { name: al.trim(), src: 'aria-label' };

        if (el.tagName === 'IMG') {
            const alt = el.getAttribute('alt');
            return alt && alt.trim() ? { name: alt.trim(), src: 'alt' } : { name: '', src: 'alt' };
        }

        if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
            if (el.id) {
                const lab = document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
                if (lab && lab.textContent.trim()) return { name: lab.textContent.trim(), src: 'label' };
            }
            const wrap = el.closest('label');
            if (wrap && wrap.textContent.trim()) return { name: wrap.textContent.trim(), src: 'wrapping label' };
            const title = el.getAttribute('title');
            if (title && title.trim()) return { name: title.trim(), src: 'title' };
            const ph = el.getAttribute('placeholder');
            if (ph && ph.trim()) return { name: ph.trim(), src: 'placeholder-only' };
            if ((el.type === 'submit' || el.type === 'button') && el.value) {
                return { name: el.value, src: 'value' };
            }
            return { name: '', src: 'none' };
        }

        if (fromContent) {
            const text = (el.textContent || '').trim();
            if (text) return { name: text, src: 'text' };
        }
        const title = el.getAttribute('title');
        if (title && title.trim()) return { name: title.trim(), src: 'title' };
        return { name: '', src: 'none' };
    };

    const FOCUSABLE = 'a[href], button, input:not([type="hidden"]), select, textarea,'
        + ' [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
    const focusableNow = () => [...document.querySelectorAll(FOCUSABLE)]
        .filter((el) => shown(el) && !el.closest('[inert]') && !el.hasAttribute('disabled'));

    // ── 3.1.1 Language of page ──
    if (!(document.documentElement.getAttribute('lang') || '').trim()) {
        add('html-lang', '<html> has no lang attribute');
    }

    // ── 1.4.3 Contrast (minimum) ──
    // Only elements that directly own a text node: an element's `color` is what
    // applies to its own text, and its children are visited on their own. The
    // direct text is kept per element so an emoji-only run can be recognised
    // below from the glyphs actually painted in the measured colour.
    const hosts = new Map();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
        const t = walker.currentNode;
        if (!t.nodeValue || !t.nodeValue.trim()) continue;
        const el = t.parentElement;
        if (!el) continue;
        hosts.set(el, (hosts.get(el) || '') + t.nodeValue);
    }
    // Emoji render as colour glyphs from a font, not in the CSS `color`, so a
    // ratio computed from `color` says nothing about them. A run of nothing but
    // pictographs is therefore not a text-contrast question — but a run that
    // mixes glyphs with words is, and is measured. Non-text contrast (1.4.11)
    // is not measured either way; see the header.
    const PICTOGRAPHIC = /^[\p{Extended_Pictographic}\p{Emoji_Component}️‍\s]+$/u;
    for (const [el, directText] of hosts) {
        if (!shown(el)) continue;
        if (PICTOGRAPHIC.test(directText)) continue;
        const cs = getComputedStyle(el);
        const raw = parseColor(cs.color);
        if (!raw) continue;
        const bg = effectiveBg(el);
        const fg = raw.a < 1 ? over(raw, bg) : raw;
        const px = parseFloat(cs.fontSize) || 16;
        const weight = parseInt(cs.fontWeight, 10) || 400;
        const large = px >= 24 || (px >= 18.66 && weight >= 700);
        const need = large ? 3 : 4.5;
        const got = ratio(fg, bg);
        if (got + 0.005 < need) {
            add('contrast', describe(el) + ' — ' + got.toFixed(2) + ':1, needs ' + need
                + ':1 (text "' + directText.trim().replace(/\s+/g, ' ').slice(0, 40) + '")');
        }
    }

    // ── 4.1.2 Name, Role, Value ──
    for (const el of focusableNow()) {
        const { name, src } = nameOf(el);
        if (!name) add('control-name', describe(el) + ' has no accessible name');
        else if (src === 'placeholder-only') {
            add('input-placeholder-only', describe(el) + ' is named only by its placeholder ('
                + JSON.stringify(name) + ')');
        }
    }

    // ── 1.4.1 Use of Colour: a link in prose must differ by more than colour ──
    // Scoped to links whose parent owns a real run of text of its own, so nav
    // items and breadcrumbs (a link beside a `›` separator) are not in scope.
    for (const a of document.querySelectorAll('a[href]')) {
        if (!shown(a)) continue;
        const parent = a.parentElement;
        if (!parent) continue;
        let prose = '';
        for (const n of parent.childNodes) if (n.nodeType === 3) prose += n.nodeValue;
        if (prose.replace(/\s+/g, ' ').trim().length < 12) continue;
        const cs = getComputedStyle(a);
        const ps = getComputedStyle(parent);
        const differsByMore = cs.textDecorationLine !== ps.textDecorationLine
            || cs.borderBottomWidth !== ps.borderBottomWidth
            || cs.fontWeight !== ps.fontWeight
            || cs.fontStyle !== ps.fontStyle
            || cs.backgroundColor !== ps.backgroundColor;
        if (!differsByMore) {
            add('link-in-text-block', describe(a) + ' ("'
                + (a.textContent || '').trim().slice(0, 30)
                + '") is a link in a run of prose that differs from the surrounding'
                + ' text by colour alone');
        }
    }

    // ── 1.1.1 Non-text Content ──
    for (const img of document.querySelectorAll('img')) {
        if (!shown(img)) continue;
        if (!img.hasAttribute('alt')) {
            add('img-alt', 'img ' + (img.getAttribute('src') || '(no src)') + ' has no alt attribute');
        }
    }

    // ── 1.3.1 / 2.4.1 Landmarks ──
    const LANDMARK = {
        NAV: 'navigation', ASIDE: 'complementary', MAIN: 'main',
        HEADER: 'banner', FOOTER: 'contentinfo', FORM: 'form',
    };
    const landmarks = [];
    for (const el of document.querySelectorAll(
        'nav, aside, main, header, footer, form,'
        + ' [role="navigation"], [role="complementary"], [role="main"],'
        + ' [role="banner"], [role="contentinfo"], [role="search"], [role="region"]')) {
        if (!shown(el)) continue;
        const role = el.getAttribute('role') || LANDMARK[el.tagName] || null;
        if (!role) continue;
        landmarks.push({ el, role, name: nameOf(el, { fromContent: false }).name });
    }
    const counts = {};
    for (const l of landmarks) counts[l.role] = (counts[l.role] || 0) + 1;
    const mains = landmarks.filter((l) => l.role === 'main');
    if (mains.length !== 1) {
        add('landmark-main', 'found ' + mains.length + ' main landmarks, expected exactly 1');
    }
    for (const l of landmarks) {
        if (counts[l.role] > 1 && !l.name) {
            add('landmark-named', describe(l.el) + ' is one of ' + counts[l.role] + ' "' + l.role
                + '" landmarks with no accessible name, so they cannot be told apart');
        }
    }

    // ── 1.3.1 Heading structure, 2.4.6 Headings and Labels ──
    const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter(shown);
    const h1s = headings.filter((h) => h.tagName === 'H1');
    if (h1s.length === 0) {
        add('page-has-heading-one', 'the page has no <h1>');
    } else if (h1s.length > 1) {
        add('page-has-heading-one', 'the page has ' + h1s.length + ' <h1> elements: '
            + h1s.map((h) => JSON.stringify(h.textContent.trim().slice(0, 30))).join(', '));
    }
    let prev = 0;
    for (const h of headings) {
        const level = Number(h.tagName[1]);
        if (prev && level > prev + 1) {
            add('heading-order', '<' + h.tagName.toLowerCase() + '> "'
                + h.textContent.trim().replace(/\s+/g, ' ').slice(0, 40)
                + '" follows <h' + prev + '>, skipping a level');
        }
        prev = level;
    }

    // ── 2.4.1 Bypass Blocks (skip link) ──
    const mainEl = document.querySelector('main, [role="main"]');
    if (mainEl) {
        const first = focusableNow()[0];
        let ok = false;
        if (first && first.tagName === 'A' && /skip/i.test(first.textContent || '')) {
            const href = first.getAttribute('href') || '';
            if (href.startsWith('#')) {
                const target = document.getElementById(href.slice(1));
                ok = !!target && (target === mainEl || target.contains(mainEl) || mainEl.contains(target));
            }
        }
        if (!ok) {
            add('skip-link', first
                ? 'the first focusable element is ' + describe(first) + ' ('
                    + JSON.stringify((first.textContent || '').trim().slice(0, 30))
                    + '), not a skip link to the main content'
                : 'the document has no focusable elements at all');
        }
    }

    // ── 4.1.3 Status Messages (live region) ──
    const toasts = document.getElementById('toast-container');
    if (toasts) {
        const role = toasts.getAttribute('role');
        const live = toasts.getAttribute('aria-live');
        if (!live && role !== 'status' && role !== 'alert' && role !== 'log') {
            add('live-region', '#toast-container is not a live region (no aria-live,'
                + ' no role=status/alert) — toast messages are never announced');
        }
    }

    // ── 2.4.7 Focus Visible ──
    // Differential measurement: fingerprint the computed styles unfocused and
    // focused. `focus({focusVisible:true})` is what makes `:focus-visible`
    // match for a programmatically focused element.
    const fingerprint = (el) => {
        const cs = getComputedStyle(el);
        // Position and opacity are in here because "reveal on focus" is a real
        // indicator technique — the skip link is the one in this tree — and a
        // fingerprint of colours and borders alone would report it as missing.
        return [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow,
            cs.borderColor, cs.backgroundColor, cs.textDecorationLine,
            cs.position, cs.left, cs.top, cs.transform, cs.opacity, cs.visibility].join('|');
    };
    for (const el of focusableNow().slice(0, 25)) {
        const before = fingerprint(el);
        let focused = false;
        try {
            el.focus({ focusVisible: true });
            focused = document.activeElement === el;
        } catch (e) {
            try { el.focus(); focused = document.activeElement === el; } catch (e2) { focused = false; }
        }
        const after = focused ? fingerprint(el) : before;
        if (focused && document.activeElement === el) document.activeElement.blur();
        // Skip rather than flag when focus could not be placed: an element that
        // cannot take focus is a different (and separately reported) problem,
        // not evidence of a missing focus indicator.
        if (!focused) continue;
        if (before === after) {
            add('focus-visible', describe(el) + ' shows no visible focus indicator'
                + ' (computed styles are identical focused and unfocused)');
        }
    }

    return {
        violations: out,
        stats: { textHosts: hosts.size, focusables: focusableNow().length, headings: headings.length },
    };
}

// The dialog probe: open the app's own confirm dialog and report its semantics.
function dialogOpen() {
    return (async () => {
        const mod = await import('/js/components/Confirm.js');
        const opener = document.getElementById('theme-toggle-btn')
            || document.querySelector('button')
            || document.body;
        opener.focus();
        window.__a11yOpener = opener;
        window.__a11yPromise = mod.confirm({
            title: 'Accessibility probe',
            message: 'This dialog is opened by the accessibility gate.',
        });
        await new Promise((r) => setTimeout(r, 60));
        return !!document.querySelector('.modal-overlay');
    })();
}

function dialogInspect() {
    const overlay = document.querySelector('.modal-overlay');
    if (!overlay) return { present: false };
    const dialog = overlay.querySelector('[role="dialog"]')
        || overlay.querySelector('[role="alertdialog"]')
        || overlay.querySelector('.modal')
        || overlay;
    const labelledby = dialog.getAttribute('aria-labelledby') || overlay.getAttribute('aria-labelledby');
    const target = labelledby ? document.getElementById(labelledby.split(/\s+/)[0]) : null;
    const focusables = [...dialog.querySelectorAll(
        'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])')]
        .filter((el) => !el.hasAttribute('disabled'));
    return {
        present: true,
        role: dialog.getAttribute('role') || overlay.getAttribute('role') || null,
        ariaModal: dialog.getAttribute('aria-modal') || overlay.getAttribute('aria-modal') || null,
        labelledby,
        labelledbyResolves: !!target,
        ariaLabel: dialog.getAttribute('aria-label') || overlay.getAttribute('aria-label') || null,
        activeInside: dialog.contains(document.activeElement),
        activeTag: document.activeElement.tagName + (document.activeElement.id ? '#' + document.activeElement.id : ''),
        unnamedButtons: [...dialog.querySelectorAll('button')]
            .filter((b) => !(b.getAttribute('aria-label') || b.getAttribute('title') || b.textContent.trim()).trim())
            .map((b) => b.className || b.outerHTML.slice(0, 60)),
        focusables: focusables.length,
    };
}

function dialogFocusLast() {
    const overlay = document.querySelector('.modal-overlay');
    if (!overlay) return false;
    const dialog = overlay.querySelector('[role="dialog"]') || overlay.querySelector('.modal') || overlay;
    const focusables = [...dialog.querySelectorAll(
        'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])')]
        .filter((el) => !el.hasAttribute('disabled'));
    if (!focusables.length) return false;
    focusables[focusables.length - 1].focus();
    return true;
}

function dialogState() {
    const overlay = document.querySelector('.modal-overlay');
    return {
        open: !!overlay,
        inside: overlay ? overlay.contains(document.activeElement) : false,
        active: document.activeElement
            ? document.activeElement.tagName + (document.activeElement.id ? '#' + document.activeElement.id : '')
            : null,
        openerFocused: document.activeElement === window.__a11yOpener,
    };
}

// ── Static server over the exact artifact that would be published ──

function startServer() {
    const server = createServer((req, res) => {
        const url = new URL(req.url, 'http://127.0.0.1');
        let pathname = decodeURIComponent(url.pathname);
        if (pathname === '/') pathname = '/index.html';
        // Refuse traversal: the gate serves the artifact, not the repo.
        const target = resolve(join(WEB_ROOT, pathname));
        if (!target.startsWith(WEB_ROOT) || !existsSync(target)) {
            res.writeHead(404, { 'content-type': 'text/plain' });
            res.end('not found');
            return;
        }
        res.writeHead(200, { 'content-type': MIME[extname(target)] || 'application/octet-stream' });
        res.end(readFileSync(target));
    });
    return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

// ── Browser discovery: fail loudly, never skip ──

function findBrowser() {
    const candidates = [
        process.env.CHROME_BIN,
        '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium', '/usr/bin/chromium-browser',
        '/snap/bin/chromium',
    ].filter(Boolean);
    for (const c of candidates) if (existsSync(c)) return c;
    for (const name of ['google-chrome', 'chromium', 'chromium-browser', 'chrome']) {
        const found = spawnSyncPath(name);
        if (found) return found;
    }
    return null;
}

function spawnSyncPath(name) {
    for (const dir of (process.env.PATH || '').split(':')) {
        const full = join(dir, name);
        if (dir && existsSync(full)) return full;
    }
    return null;
}

// ── Minimal CDP client ──

class Cdp {
    #ws; #id = 0; #pending = new Map(); #handlers = [];
    constructor(ws) {
        this.#ws = ws;
        ws.addEventListener('message', (ev) => {
            const msg = JSON.parse(ev.data);
            if (msg.id != null) {
                const p = this.#pending.get(msg.id);
                if (!p) return;
                this.#pending.delete(msg.id);
                if (msg.error) p.reject(new Error(`${p.method}: ${msg.error.message}`));
                else p.resolve(msg.result);
            } else {
                for (const h of this.#handlers) h(msg);
            }
        });
    }
    static async connect(url) {
        const ws = new WebSocket(url);
        await new Promise((ok, no) => {
            ws.addEventListener('open', ok, { once: true });
            ws.addEventListener('error', () => no(new Error(`cannot connect to ${url}`)), { once: true });
        });
        return new Cdp(ws);
    }
    on(handler) { this.#handlers.push(handler); }
    send(method, params = {}, sessionId) {
        const id = ++this.#id;
        const payload = { id, method, params };
        if (sessionId) payload.sessionId = sessionId;
        this.#ws.send(JSON.stringify(payload));
        return new Promise((resolve, reject) => this.#pending.set(id, { resolve, reject, method }));
    }
    close() { try { this.#ws.close(); } catch { /* already closing */ } }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForHttp(url, timeoutMs = 15000) {
    const deadline = Date.now() + timeoutMs;
    let lastErr;
    while (Date.now() < deadline) {
        try {
            const res = await fetch(url);
            if (res.ok) return await res.json();
        } catch (e) { lastErr = e; }
        await sleep(120);
    }
    throw new Error(`browser endpoint ${url} never came up (${lastErr?.message || 'timeout'})`);
}

/**
 * Chrome writes the port it chose here when launched with
 * `--remote-debugging-port=0`. The file appears asynchronously, so poll.
 */
async function readDevToolsPort(profileDir, timeoutMs = 15000) {
    const file = join(profileDir, 'DevToolsActivePort');
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (existsSync(file)) {
            const line = readFileSync(file, 'utf8').split('\n')[0].trim();
            if (line) return line;
        }
        await sleep(120);
    }
    throw new Error('Chrome never wrote DevToolsActivePort — it may have failed to start');
}

// ── The audit ──

const failures = [];

// Findings are printed capped (PER_RULE_CAP per rule per route) so one broken
// token cannot bury the run under 400 identical lines — but the headline must
// not be the printed count. It was: `failures.length` reported 1,095 for a tree
// that had 1,689 findings, because 594 sat behind "+N more not shown". A gate
// that under-reports its own findings reads as a gate that found less than it
// did, which is the same defect as a sweep covering fewer routes than it names.
// The true total is counted separately and both are reported.
let findingsFound = 0;

function fail(what) { failures.push(what); say(`  FAIL ${what}`); }
function pass(what) { say(`  PASS ${what}`); }

async function main() {
    if (!existsSync(WEB_ROOT)) {
        fail(`artifact directory missing: ${WEB_ROOT}`);
        return;
    }
    const browser = findBrowser();
    if (!browser) {
        // Fail closed: an unavailable browser means the gate did not run, and
        // a gate that did not run must never read as green.
        fail('no Chrome/Chromium found (set CHROME_BIN) — the audit did not run');
        return;
    }
    say(`browser: ${browser}`);

    const server = await startServer();
    const port = server.address().port;
    const origin = `http://127.0.0.1:${port}`;
    say(`serving ${WEB_ROOT} at ${origin}`);

    const profile = mkdtempSync(join(tmpdir(), 'rtp-a11y-'));
    const proc = spawn(browser, [
        '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
        '--disable-dev-shm-usage', '--remote-debugging-port=0',
        `--user-data-dir=${profile}`, 'about:blank',
    ], { stdio: ['ignore', 'ignore', 'pipe'] });

    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    let cdp;
    try {
        const devtoolsPort = await readDevToolsPort(profile);
        const version = await waitForHttp(`http://127.0.0.1:${devtoolsPort}/json/version`);
        cdp = await Cdp.connect(version.webSocketDebuggerUrl);

        const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
        const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

        const consoleErrors = [];
        cdp.on((msg) => {
            if (msg.sessionId !== sessionId) return;
            if (msg.method === 'Runtime.exceptionThrown') {
                const d = msg.params.exceptionDetails;
                consoleErrors.push(`uncaught: ${d.exception?.description || d.text}`);
            } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
                consoleErrors.push(`console.error: ${msg.params.args.map(a => a.value ?? a.description).join(' ')}`);
            }
        });

        await cdp.send('Runtime.enable', {}, sessionId);
        await cdp.send('Page.enable', {}, sessionId);
        // Headless Chrome does not consider its window focused, and an
        // unfocused window applies no `:focus-visible` and moves no focus on
        // Tab. Every focus assertion below depends on this.
        await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true }, sessionId);

        const evaluate = async (expression) => {
            const r = await cdp.send('Runtime.evaluate',
                { expression, returnByValue: true, awaitPromise: true }, sessionId);
            if (r.exceptionDetails) {
                throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
            }
            return r.result.value;
        };
        const waitForExpr = async (expression, what, timeoutMs = 15000) => {
            const deadline = Date.now() + timeoutMs;
            while (Date.now() < deadline) {
                try { if (await evaluate(expression)) return true; } catch { /* mid-navigation */ }
                await sleep(120);
            }
            throw new Error(`timed out waiting for ${what}`);
        };
        // Every target gets a unique query string. Without it, moving between
        // two hash routes is a *fragment* navigation: Chrome reuses the same
        // document, `initTheme` never re-runs, and an attribute set on the
        // previous route survives into the next — which is exactly how a first
        // version of this gate reported a `prefers-color-scheme` pass for an
        // app that has no system-theme support at all. The nonce forces a real
        // document load, which is also how a student arriving at a deep link
        // gets the page.
        let nonce = 0;
        const navigate = async (path) => {
            const i = path.indexOf('#');
            const url = `${origin}/${i === -1 ? `${path}?a11y=${++nonce}` : `${path.slice(0, i)}?a11y=${++nonce}${path.slice(i)}`}`;
            await cdp.send('Page.navigate', { url }, sessionId);
            await waitForExpr(
                `location.href === ${JSON.stringify(url)} && document.readyState === 'complete'`,
                `${path} to load`);
            // The app shell always has #view-container; a fixture page need not.
            if (await evaluate(`!!document.getElementById('view-container')`)) {
                await waitForExpr(
                    `document.querySelector('#view-container').children.length > 0`,
                    `the router to render ${path}`);
            }
            // One frame for the view's own afterRender work to settle.
            await sleep(120);
        };
        const pressKey = async (key, code, vk) => {
            for (const type of ['rawKeyDown', 'keyUp']) {
                await cdp.send('Input.dispatchKeyEvent', {
                    type, key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk,
                }, sessionId);
            }
            await sleep(80);
        };

        // ── Per-route audit ──
        // A route that will not render must not end the sweep. It did: a single
        // `navigate` timeout threw out of this loop into the outer catch, the
        // remaining routes were never audited, and the run still printed a
        // summary as if it had covered them — 34 of 54 routes went unmeasured
        // while the gate looked like it had finished. A route that fails is now
        // one failure and the sweep continues; `routesAudited` is reported at
        // the end so a short sweep can never be mistaken for a clean one.
        const auditExpr = `(${String(pageAudit)})()`;
        let routesAudited = 0;
        for (const route of ROUTES) {
            try {
                await navigate(route);
            } catch (first) {
                // One retry. A route that renders on the second attempt is a
                // slow render, not an inaccessible page — `/pc/api` was observed
                // timing out once in a 54-route sweep and passing every other
                // time — and a gate that reds on a transient is a gate that gets
                // ignored. A route that fails twice is reported.
                try {
                    await navigate(route);
                } catch (second) {
                    fail(`${route}: did not render — ${second.message} (after a retry; `
                        + `first attempt: ${first.message})`);
                    continue;
                }
            }
            const result = await evaluate(auditExpr);
            routesAudited++;
            if (!result || !Array.isArray(result.violations)) {
                fail(`${route}: the audit returned no result (the page may not have rendered)`);
                continue;
            }
            findingsFound += result.violations.length;
            const byRule = new Map();
            for (const v of result.violations) {
                if (!byRule.has(v.rule)) byRule.set(v.rule, []);
                byRule.get(v.rule).push(v.detail);
            }
            if (!result.violations.length) {
                pass(`${route} — no findings (${result.stats.textHosts} text runs, `
                    + `${result.stats.focusables} focusable, ${result.stats.headings} headings)`);
                continue;
            }
            for (const [rule, details] of byRule) {
                const shown = details.slice(0, PER_RULE_CAP);
                const extra = details.length > shown.length
                    ? ` (+${details.length - shown.length} more not shown)` : '';
                for (const d of shown) fail(`${rule} @ ${route}: ${d}`);
                if (extra) say(`  ... ${rule} @ ${route}:${extra}`);
            }
        }

        // Every route that was asked for must have been audited. This is the
        // tripwire for the abort above ever coming back in another form: a sweep
        // that quietly covers fewer routes than it was given is a gate reporting
        // on a smaller surface than the one it names. It sits immediately after
        // the sweep, before anything else can throw, so it is always reached.
        // …and every route the app registers must have been *in* the list to
        // begin with. Without this the discovery step could quietly miss a view
        // — a `router.register` written across two lines, a path built from a
        // variable — and the sweep would report full coverage of a list that
        // was never the app's.
        if (DISCOVERY.unparsed > 0) {
            fail(`${DISCOVERY.unparsed} router.register call(s) could not be parsed, so those `
                + 'views are not in the audit list — give each one a literal path string');
        }
        if (DISCOVERY.uncovered.length) {
            fail(`the gate's route list is missing ${DISCOVERY.uncovered.length} registered route(s) `
                + `— they would never be audited: ${DISCOVERY.uncovered.join(', ')}`);
        }

        if (routesAudited !== ROUTES.length) {
            fail(`${ROUTES.length - routesAudited} of ${ROUTES.length} routes were never audited `
                + '(the sweep did not cover what it was given)');
        } else {
            pass(`all ${ROUTES.length} routes rendered and were audited`);
        }

        // ── The app shell only ──
        // Everything below drives the real shell: its Confirm.js dialog, its
        // ThemeToggle, its hamburger navigation. A fixture page is a plain
        // document with none of them, so these sections are skipped there and
        // the page-level audit above is the whole run. `#view-container` is
        // how the shell is recognised; every route of the real app has one.
        const isAppShell = await evaluate(`!!document.getElementById('view-container')`);
        if (isAppShell) {
            // ── Dialog semantics, focus management (S35-06) ──
            say('');
                say('modal dialog (role, name, focus move, trap, Escape, restore):');
                await navigate(ROUTES[0]);
                await evaluate(`(${String(dialogOpen)})()`);
                const info = await evaluate(`(${String(dialogInspect)})()`);
                if (!info.present) {
                    fail('the confirm dialog did not open — the modal could not be audited');
                } else {
                    if (info.role !== 'dialog' && info.role !== 'alertdialog') {
                        fail(`the modal has no role="dialog" (role is ${JSON.stringify(info.role)})`);
                    }
                    if (info.ariaModal !== 'true') {
                        fail(`the modal does not set aria-modal="true" (it is ${JSON.stringify(info.ariaModal)})`);
                    }
                    if (!(info.labelledby && info.labelledbyResolves) && !info.ariaLabel) {
                        fail('the modal has no accessible name (no resolving aria-labelledby, no aria-label)');
                    }
                    if (!info.activeInside) {
                        fail(`opening the modal left focus outside it (active element is ${info.activeTag})`);
                    }
                    if (info.unnamedButtons.length) {
                        fail(`the modal has ${info.unnamedButtons.length} button(s) with no accessible name: `
                            + info.unnamedButtons.join(', '));
                    }
                    if (info.role === 'dialog' && info.ariaModal === 'true' && info.activeInside
                        && !info.unnamedButtons.length) {
                        pass(`the modal is a named, modal, focus-moving dialog (${info.focusables} focusable controls)`);
                    }

                    // Focus trap: focus the last control, Tab, and require focus to
                    // stay inside. Without a trap, Tab leaves for the page behind.
                    if (await evaluate(`(${String(dialogFocusLast)})()`)) {
                        await pressKey('Tab', 'Tab', 9);
                        let state = await evaluate(`(${String(dialogState)})()`);
                        if (!state.inside) {
                            fail(`Tab from the last control in the modal moved focus outside it (to ${state.active})`);
                        } else {
                            pass('Tab from the last control stays inside the modal');
                        }
                        // Escape must close it.
                        await pressKey('Escape', 'Escape', 27);
                        state = await evaluate(`(${String(dialogState)})()`);
                        if (state.open) fail('Escape did not close the modal');
                        else pass('Escape closes the modal');
                        // …and focus must come back to whatever opened it.
                        if (state.openerFocused) pass('closing the modal restores focus to the opener');
                        else fail(`closing the modal did not restore focus to the opener (focus is on ${state.active})`);
                    }
                }
                // Resolve the promise the probe left pending so it is not an
                // unhandled rejection in the console check below.
                await evaluate(`(async () => { const m = document.querySelector('.modal-overlay');`
                    + ` if (m) { const b = m.querySelector('.cancel-btn'); if (b) b.click(); else m.remove(); }`
                    + ` try { await window.__a11yPromise; } catch (e) {} return true; })()`);

            // ── The hamburger overlay (S35-07) ──
            // This is the primary navigation surface on Prism Element routes and it
            // exists only while open, so the per-route audit above never sees it.
            // Opening it also makes the breadcrumb and the overlay two visible
            // `<nav>` landmarks, which is the condition under which they have to be
            // told apart by name.
            say('');
            say('hamburger overlay (PE navigation):');
            await navigate(ROUTES[0]);
            await evaluate(`document.getElementById('hamburger-btn').click()`);
            await waitForExpr(
                `!document.getElementById('hamburger-overlay').hasAttribute('inert')`,
                'the hamburger overlay to open');
            const overlayResult = await evaluate(auditExpr);
            const overlayFindings = (overlayResult?.violations || [])
                .filter((v) => v.rule === 'contrast' || v.rule === 'landmark-named' || v.rule === 'control-name');
            if (!overlayFindings.length) {
                pass('the open overlay is a named landmark with no contrast findings');
            } else {
                for (const v of overlayFindings.slice(0, PER_RULE_CAP * 2)) {
                    fail(`${v.rule} @ open hamburger overlay: ${v.detail}`);
                }
            }
            // Closing it must take it out of the tab order again, not merely hide it.
            await evaluate(`document.getElementById('hamburger-btn').click()`);
            await sleep(200);
            const closedReachable = await evaluate(
                `(() => { const o = document.getElementById('hamburger-overlay');`
                + ` if (o.hasAttribute('inert')) return false;`
                + ` const cs = getComputedStyle(o);`
                + ` return cs.display !== 'none' && cs.visibility !== 'hidden'; })()`);
            if (closedReachable) fail('the closed hamburger overlay is still reachable (not inert and still rendered)');
            else pass('the closed hamburger overlay is inert and out of the tab order');

            // ── Runtime component semantics (S35-02 / S35-06 / S35-07) ──
            // Three claims the conformance report makes that no static check can
            // hold, because each is a value a component writes at runtime: the
            // hamburger's `aria-expanded` tracks the overlay, the theme toggle's
            // `aria-pressed` tracks the theme, and a toast lands in the live
            // region with a named dismiss control. Driving them here means a
            // regression fails the gate instead of quietly invalidating a claim
            // in the report. They are asserted as *state tracking* — the value
            // must change with the thing it describes — not as a fixed literal,
            // so this cannot pass by the attribute being hard-coded.
            say('');
            say('runtime component semantics:');
            await navigate(ROUTES[0]);

            const hamState = await evaluate(
                `(() => { const b = document.getElementById('hamburger-btn');`
                + ` const o = document.getElementById('hamburger-overlay');`
                + ` return { expanded: b.getAttribute('aria-expanded'),`
                + `          controls: b.getAttribute('aria-controls'),`
                + `          resolves: !!(b.getAttribute('aria-controls')`
                + `              && document.getElementById(b.getAttribute('aria-controls')) === o),`
                + `          name: (b.getAttribute('aria-label') || b.textContent || '').trim() }; })()`);
            if (!hamState.name) fail('the hamburger button has no accessible name');
            if (!hamState.resolves) {
                fail(`the hamburger's aria-controls=${JSON.stringify(hamState.controls)} `
                    + 'does not resolve to the overlay it controls');
            }
            if (hamState.expanded !== 'false') {
                fail(`the closed hamburger button reports aria-expanded=${JSON.stringify(hamState.expanded)}`);
            } else {
                await evaluate(`document.getElementById('hamburger-btn').click()`);
                await waitForExpr(
                    `!document.getElementById('hamburger-overlay').hasAttribute('inert')`,
                    'the hamburger overlay to open');
                const opened = await evaluate(
                    `document.getElementById('hamburger-btn').getAttribute('aria-expanded')`);
                await evaluate(`document.getElementById('hamburger-btn').click()`);
                await sleep(200);
                const reclosed = await evaluate(
                    `document.getElementById('hamburger-btn').getAttribute('aria-expanded')`);
                if (opened !== 'true' || reclosed !== 'false') {
                    fail('the hamburger button does not track the overlay it controls '
                        + `(closed=${JSON.stringify(hamState.expanded)}, open=${JSON.stringify(opened)}, `
                        + `re-closed=${JSON.stringify(reclosed)})`);
                } else if (hamState.name && hamState.resolves) {
                    pass('the hamburger button is named and its aria-expanded tracks the overlay');
                }
            }

            // The theme toggle is a two-state control: `aria-pressed` has to
            // agree with the theme actually applied, both before and after a
            // click. Clicking twice restores the starting theme.
            const toggleBefore = await evaluate(
                `(() => { const b = document.getElementById('theme-toggle-btn');`
                + ` return { pressed: b.getAttribute('aria-pressed'),`
                + `          theme: document.documentElement.getAttribute('data-theme'),`
                + `          name: (b.getAttribute('aria-label') || b.textContent || '').trim() }; })()`);
            const agrees = (s) => (s.theme === 'dark') === (s.pressed === 'true');
            await evaluate(`document.getElementById('theme-toggle-btn').click()`);
            await sleep(120);
            const toggleAfter = await evaluate(
                `(() => { const b = document.getElementById('theme-toggle-btn');`
                + ` return { pressed: b.getAttribute('aria-pressed'),`
                + `          theme: document.documentElement.getAttribute('data-theme') }; })()`);
            await evaluate(`document.getElementById('theme-toggle-btn').click()`);
            await sleep(120);
            if (!toggleBefore.name) {
                fail('the theme toggle has no accessible name');
            } else if (!agrees(toggleBefore) || !agrees(toggleAfter)
                || toggleBefore.theme === toggleAfter.theme) {
                fail('the theme toggle does not track the theme it applies '
                    + `(before: theme=${JSON.stringify(toggleBefore.theme)} `
                    + `aria-pressed=${JSON.stringify(toggleBefore.pressed)}; after: `
                    + `theme=${JSON.stringify(toggleAfter.theme)} `
                    + `aria-pressed=${JSON.stringify(toggleAfter.pressed)})`);
            } else {
                pass('the theme toggle is named and its aria-pressed tracks the applied theme');
            }

            // A toast must land in the live region, be dismissable by a named
            // control, and an *error* toast must be the interrupting kind —
            // otherwise every toast reads the same and a failure queues behind
            // whatever the reader is saying.
            const toastState = await evaluate(
                `(async () => { const m = await import('/js/components/Toast.js');`
                + ` const c = document.getElementById('toast-container');`
                + ` const live = c.getAttribute('aria-live');`
                + ` const region = c.getAttribute('role');`
                + ` m.toast.error('a11y gate: synthetic error toast');`
                + ` m.toast.success('a11y gate: synthetic success toast');`
                + ` const toasts = [...c.querySelectorAll('.toast')];`
                + ` const read = (t) => ({ cls: t.className,`
                + `     role: t.getAttribute('role'),`
                + `     dismiss: (() => { const b = t.querySelector('.toast-close');`
                + `         return b ? (b.getAttribute('aria-label') || b.textContent || '').trim() : null; })() });`
                + ` const out = { live, region, toasts: toasts.map(read) };`
                + ` toasts.forEach((t) => t.remove());`
                + ` return out; })()`);
            const errToast = (toastState?.toasts || []).find((t) => /\berror\b/.test(t.cls));
            const okToast = (toastState?.toasts || []).find((t) => /\bsuccess\b/.test(t.cls));
            if (toastState?.live !== 'polite' || !toastState?.region) {
                fail(`the toast container is not a live region (role=${JSON.stringify(toastState?.region)}, `
                    + `aria-live=${JSON.stringify(toastState?.live)})`);
            } else if (!errToast || !okToast) {
                fail('a toast did not render into #toast-container');
            } else if (errToast.role !== 'alert') {
                fail(`an error toast is not role="alert" (role=${JSON.stringify(errToast.role)})`);
            } else if (okToast.role === 'alert') {
                fail('a non-error toast is also role="alert" — the two kinds are indistinguishable');
            } else if (!errToast.dismiss || !okToast.dismiss) {
                fail(`a toast dismiss control has no accessible name `
                    + `(error=${JSON.stringify(errToast.dismiss)}, success=${JSON.stringify(okToast.dismiss)})`);
            } else {
                pass('a toast is a live-region message with a named dismiss control, '
                    + 'and only the error kind is role="alert"');
            }

            // ── Light theme must also meet AA (S35-04) ──
            // Chosen through the app's own ThemeToggle rather than by setting the
            // attribute, so this also proves the toggle persists a choice.
            say('');
            say('light theme contrast (S35-04):');
            await navigate(ROUTES[0]);
            await evaluate(`(async () => { const m = await import('/js/components/ThemeToggle.js');`
                + ` m.setTheme('light'); return true; })()`);
            for (const route of ROUTES) {
                await navigate(route);
                const theme = await evaluate(`document.documentElement.getAttribute('data-theme')`);
                if (theme !== 'light') {
                    fail(`${route}: chose the light theme but the page rendered ${JSON.stringify(theme)}`);
                }
                const result = await evaluate(auditExpr);
                const contrast = (result?.violations || []).filter((v) => v.rule === 'contrast');
                findingsFound += contrast.length;
                if (!contrast.length) {
                    pass(`${route} (light) — no contrast findings`);
                } else {
                    for (const v of contrast.slice(0, PER_RULE_CAP)) {
                        fail(`contrast (light) @ ${route}: ${v.detail}`);
                    }
                    if (contrast.length > PER_RULE_CAP) {
                        say(`  ... contrast (light) @ ${route}: +${contrast.length - PER_RULE_CAP} more not shown`);
                    }
                }
            }

            // ── System theme detection (S35-05) ──
            // The stored choice must be absent for the OS to be consulted at all,
            // so it is cleared before every document in this section.
            say('');
            say('system theme detection (S35-05):');
            const cleared = await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
                source: `try { localStorage.removeItem('nutanix-lab-theme'); } catch (e) {}`,
            }, sessionId);
            for (const preference of ['light', 'dark']) {
                await cdp.send('Emulation.setEmulatedMedia', {
                    features: [{ name: 'prefers-color-scheme', value: preference }],
                }, sessionId);
                await navigate(ROUTES[0]);
                const theme = await evaluate(`document.documentElement.getAttribute('data-theme')`);
                if (theme === preference) {
                    pass(`with no stored choice and prefers-color-scheme: ${preference}, the app renders ${preference}`);
                } else {
                    fail(`with no stored choice and prefers-color-scheme: ${preference}, `
                        + `the app renders ${JSON.stringify(theme)}`);
                }
            }
            await cdp.send('Page.removeScriptToEvaluateOnNewDocument',
                { identifier: cleared.identifier }, sessionId);

            // ── An explicit choice must beat the OS ──
            say('');
            say('explicit choice over the OS:');
            await navigate(ROUTES[0]);
            await evaluate(`(async () => { const m = await import('/js/components/ThemeToggle.js');`
                + ` m.setTheme('dark'); return true; })()`);
            await cdp.send('Emulation.setEmulatedMedia', {
                features: [{ name: 'prefers-color-scheme', value: 'light' }],
            }, sessionId);
            await navigate(ROUTES[0]);
            const kept = await evaluate(`document.documentElement.getAttribute('data-theme')`);
            if (kept === 'dark') pass('an explicit dark choice overrides prefers-color-scheme: light');
            else fail(`an explicit dark choice was overridden by prefers-color-scheme: light (got ${JSON.stringify(kept)})`);
            await cdp.send('Emulation.setEmulatedMedia', { features: [] }, sessionId);
        }


        // Console must be clean — a thrown view is an accessibility problem too.
        const realErrors = consoleErrors.filter((e) => !/favicon/i.test(e));
        if (realErrors.length) fail(`console errors: ${realErrors.join(' | ')}`);
        else pass('zero console errors or uncaught exceptions across every route');
    } catch (e) {
        fail(e.message);
    } finally {
        cdp?.close();
        proc.kill('SIGKILL');
        server.close();
        // Chrome keeps writing to its profile for a moment after SIGKILL, so an
        // immediate rmSync races it and throws ENOTEMPTY. A leftover temp
        // directory is not a gate failure: wait for the process to go, then
        // remove best-effort with retries.
        if (proc.exitCode === null && proc.signalCode === null) {
            await new Promise((done) => {
                proc.once('exit', done);
                setTimeout(done, 2000);   // never hang on a process that will not die
            });
        }
        for (let attempt = 0; attempt < 20; attempt++) {
            try {
                rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
                break;
            } catch {
                await sleep(250);
            }
        }
        if (failures.length && stderr) say(`browser stderr (tail): ${stderr.slice(-600)}`);
    }
}

await main();

say('');
say(failures.length === 0
    ? 'A11Y WEB: PASS — every audited route meets the WCAG 2.1 AA checks this gate implements'
    : `A11Y WEB: FAIL — ${findingsFound} finding(s)`
        + (findingsFound > failures.length
            ? ` (${failures.length} printed, the rest behind the per-rule cap)` : ''));

const out = process.env.A11Y_LOG_OUT;
if (out) {
    writeFileSync(out, `# Web accessibility audit log (S35-01)\n\n\`\`\`\n${log.join('\n')}\n\`\`\`\n`);
    process.stdout.write(`[a11y] wrote log to ${out}\n`);
}

process.exit(failures.length === 0 ? 0 : 1);
