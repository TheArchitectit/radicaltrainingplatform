/**
 * html — escaping helpers for innerHTML templates.
 *
 * Entity names are user-typed in the wizards and persisted, so a name like
 * <img src=x onerror=…> ran script wherever it was interpolated raw.
 */

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape a value for an HTML text or attribute context. */
export function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ENTITIES[c]);
}

const RAW = Symbol('raw');

/** Mark trusted markup so {@link html} inserts it unescaped. */
export const raw = (markup) => ({ [RAW]: String(markup ?? '') });

/** Tagged template: literal markup is kept, interpolations are escaped unless wrapped in raw(). */
export function html(strings, ...values) {
    return strings.reduce((out, s, i) =>
        out + s + (i < values.length ? (values[i]?.[RAW] ?? escapeHtml(values[i])) : ''), '');
}
