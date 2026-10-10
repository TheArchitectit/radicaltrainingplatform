/**
 * R-22 bullet 3 — async/sync Promise leak: CLIService.execute is sync but
 * #alertCmd is async.
 *
 * Defect: execute() returns handler() without awaiting, so `alert resolve`
 * hands the terminal a Promise. CLITerminal stringifies it and prints
 * "[object Promise]" instead of the resolved message.
 *
 * Fixture drives the real CLITerminal + CLIService + StateEngine and asserts
 * the terminal prints "Alert alert-001 resolved." and never "[object Promise]".
 */
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

const dom = installDom();
const runner = makeRunner();

await runner.test('terminal prints resolved text, not [object Promise]', async () => {
    const { state } = await import('../../../RadicalTrainingPlatform.Web/js/core/StateEngine.js');
    const { CLITerminal } = await import('../../../RadicalTrainingPlatform.Web/js/components/CLITerminal.js');

    await state.init();
    const alert = state.getById('alerts', 'alert-001');
    assert(alert && !alert.resolved, 'seed alert-001 must exist and be unresolved');

    const terminal = new CLITerminal();
    const el = terminal.render();
    dom.document.body.appendChild(el);

    // The input is the last child of the input line (the only <input>).
    const inputs = el.querySelectorAll('input');
    assertEqual(inputs.length, 1, 'terminal should render one input');
    const input = inputs[0];
    const output = el.children[1];
    assert(output, 'terminal output area should exist');

    input.value = 'alert resolve alert-001';
    input.dispatchEvent({ type: 'keydown', key: 'Enter', preventDefault() {} });

    // Post-fix the terminal awaits execute(); give the microtasks a tick.
    await new Promise(r => setTimeout(r, 25));

    const printed = output.children.map(c => String(c.textContent)).join('\n');
    assert(!printed.includes('[object Promise]'),
        `terminal must not print a raw Promise; printed:\n${printed}`);
    assert(printed.includes('Alert alert-001 resolved.'),
        `terminal should print the resolved message; printed:\n${printed}`);

    const updated = state.getById('alerts', 'alert-001');
    assert(updated.resolved, 'alert-001 should be marked resolved in state');
});

await runner.test('sync commands still print plain text', async () => {
    const { CLIService } = await import('../../../RadicalTrainingPlatform.Web/js/core/CLIService.js');
    const cli = new CLIService();
    const out = await cli.execute('alert list');
    assert(typeof out === 'string', 'alert list should resolve to a string');
    assert(out.includes('Alert List'), 'alert list should render the alert table');

    const help = await cli.execute('help');
    assert(typeof help === 'string', 'help should resolve to a string');
    assert(help.includes('acli'), 'help should list supported tools');
});

process.exit(runner.done('cli-async fixture'));
