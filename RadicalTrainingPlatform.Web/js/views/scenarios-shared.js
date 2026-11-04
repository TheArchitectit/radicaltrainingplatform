/**
 * Shared scenario contract helpers (SPEC-07).
 *
 * The validator result shape and the action-trace predicates every scenario
 * registry module builds on, so the catalogue, the ticket labs and the NCA
 * labs share one definition of "met" and of an observation.
 */

export const DISCLAIMER = 'This is independent study material. It is not official training and is not endorsed or approved by CompTIA, Nutanix, or any other certification body.';

// ── Validator result builders (SPEC-07 shape) ──

export const met = () => ({ passed: true, unmetConditions: [] });
export const unmet = (...msgs) => ({ passed: false, unmetConditions: msgs });

// ── Action-trace helpers ──

export function visited(trace, route) {
    return (trace || []).some(t => t.action === 'route-entered' && t.route === route);
}
export function ranCli(trace, pattern) {
    return (trace || []).some(t => t.action === 'cli-command' && pattern.test(t.command || ''));
}
export function ranAction(trace, action) {
    return (trace || []).some(t => t.action === action);
}

/**
 * T-21 (REQ-DEMO-06): a recorded interpretation response for one objective.
 * The response must be non-empty text the learner actually wrote — an empty
 * or whitespace-only submission is not an interpretation, so the objective
 * stays unmet. Keyed by scenario AND objective so an interpretation of one
 * dashboard cannot satisfy a different observation task.
 */
export function interpreted(trace, scenarioId, objectiveId) {
    return (trace || []).some(t =>
        t.action === 'interpretation'
        && t.scenarioId === scenarioId
        && t.objectiveId === objectiveId
        && typeof t.response === 'string'
        && t.response.trim().length > 0);
}

/**
 * Observation-objective completion. An observation task ("review the
 * dashboard", "identify degraded endpoints") is complete only when the
 * learner both reached the route AND recorded what they read there —
 * visiting without responding fails, which is the whole point of the rule.
 *
 * @param {Array}  trace
 * @param {string} route          the route the learner must observe
 * @param {string} scenarioId
 * @param {string} objectiveId
 * @param {Object} [opts]
 * @param {string} [opts.what]    subject of the "has not been opened" message
 * @param {Function} [opts.also]  extra state predicate; returns a result
 */
export function observation(trace, route, scenarioId, objectiveId, opts = {}) {
    const what = opts.what || `the ${route} view`;
    if (!visited(trace, route)) return unmet(`${what} has not been opened`);
    if (!interpreted(trace, scenarioId, objectiveId)) {
        return unmet(`${what} was opened but no interpretation response was recorded — visiting alone is not completion`);
    }
    return opts.also ? opts.also() : met();
}
