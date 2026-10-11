/**
 * Toast API usage (R-22 web runtime). `toast` is a ToastManager instance,
 * not a function — `toast('msg', 'success')` throws `toast is not a function`
 * and silently kills the rest of the handler (observed on PC Settings reset:
 * state cleared but no toast and no refresh).
 *
 * Failing side: bare `toast(...)` call sites in pc-settings, pc-network,
 * pc-projects, pc-lcm, pc-alerts, ai-monitoring.
 * Passing side: every call is `toast.show` / `toast.success` / `.error` /
 * `.warning` / `.info`, and the source scan stays clean.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { installDom, makeRunner, assert, assertEqual } from './helpers.mjs';

installDom();
const runner = makeRunner();

const { toast } = await import('../../../RadicalTrainingPlatform.Web/js/components/Toast.js');

await runner.test('toast is a manager, not a callable function', async () => {
    assert(typeof toast === 'object', 'toast export is a ToastManager instance');
    assert(typeof toast !== 'function', 'toast must not be called as a function');
    assertEqual(typeof toast.show, 'function');
    assertEqual(typeof toast.success, 'function');
    assertEqual(typeof toast.error, 'function');
    assertEqual(typeof toast.warning, 'function');
    assertEqual(typeof toast.info, 'function');
});

await runner.test('no view calls toast as a bare function', async () => {
    const viewsDir = fileURLToPath(new URL('../../../RadicalTrainingPlatform.Web/js/', import.meta.url));
    const offenders = [];
    const walk = (dir) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            const full = join(dir, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (entry.name.endsWith('.js')) {
                readFileSync(full, 'utf8').split('\n').forEach((line, i) => {
                    if (/(?<![\w.])toast\(/.test(line)) {
                        offenders.push(`${full.replace(viewsDir, '')}:${i + 1}: ${line.trim()}`);
                    }
                });
            }
        }
    };
    walk(viewsDir);
    assertEqual(offenders.length, 0, 'bare toast() call sites:\n' + offenders.join('\n'));
});

await runner.test('toast.show / toast.success do not throw', async () => {
    // Smoke: the manager methods are callable. (Container attach is
    // browser-verified in the acceptance walkthrough; the stub DOM's
    // getElementById is not a real document index.)
    toast.show('hello', 'success');
    toast.success('ok');
    toast.warning('careful');
    toast.info('note');
    toast.error('bad');
});

process.exit(runner.done('toast-api'));
