/**
 * Harness self-test: this fixture MUST fail.
 *
 * run_web_fixtures.sh requires a non-zero exit from this file so a runner
 * that silently accepts a broken harness cannot report green. Not an
 * R-22 fixture — do not "fix" this.
 */
import { makeRunner, assert } from './helpers.mjs';

const runner = makeRunner();
await runner.test('harness self-test must fail', async () => {
    assert(false, 'deliberate failure: the runner must treat this fixture as failing');
});
process.exit(runner.done('selftest-fails'));
