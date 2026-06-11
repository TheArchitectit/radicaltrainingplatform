import { CLIService } from '../core/CLIService.js';

/**
 * CLITerminal — Interactive terminal component for Nutanix CLI simulation.
 */
export class CLITerminal {
    #el = null;
    #output = null;
    #input = null;
    #cli = new CLIService();
    #history = [];
    #historyIndex = -1;
    #prompt = 'nutanix@cvm$ ';

    render() {
        this.#el = document.createElement('div');
        this.#el.style.cssText = `
            display: flex; flex-direction: column; height: 100%;
            background: #1a1b26; border-radius: 8px; overflow: hidden;
            font-family: var(--font-mono); font-size: 13px;
        `;

        // Toolbar
        const toolbar = document.createElement('div');
        toolbar.style.cssText = `
            display: flex; align-items: center; padding: 8px 12px;
            background: #24253a; border-bottom: 1px solid #2f3044;
            gap: 8px;
        `;
        toolbar.innerHTML = `
            <span style="width:12px;height:12px;border-radius:50%;background:#ff5f57;"></span>
            <span style="width:12px;height:12px;border-radius:50%;background:#febc2e;"></span>
            <span style="width:12px;height:12px;border-radius:50%;background:#28c840;"></span>
            <span style="color:#8a8ca5;font-size:12px;margin-left:auto;">Nutanix CVM Terminal</span>
        `;

        // Output area
        this.#output = document.createElement('div');
        this.#output.style.cssText = `
            flex: 1; overflow-y: auto; padding: 12px; color: #c0caf5;
            white-space: pre-wrap; word-break: break-word; line-height: 1.6;
        `;
        this.#output.innerHTML = `<span style="color:#7aa2f7;">Welcome to Nutanix CVM Terminal (Simulated)</span>
<span style="color:#565f89;">Type 'help' for available commands.</span>\n\n`;

        // Input line
        const inputLine = document.createElement('div');
        inputLine.style.cssText = `
            display: flex; align-items: center; padding: 8px 12px;
            background: #1a1b26; border-top: 1px solid #2f3044;
        `;

        const promptSpan = document.createElement('span');
        promptSpan.textContent = this.#prompt;
        promptSpan.style.cssText = 'color: #7aa2f7; margin-right: 4px; white-space: nowrap;';

        this.#input = document.createElement('input');
        this.#input.type = 'text';
        this.#input.style.cssText = `
            flex: 1; background: none; border: none; outline: none;
            color: #c0caf5; font-family: var(--font-mono); font-size: 13px;
            caret-color: #7aa2f7;
        `;
        this.#input.spellcheck = false;
        this.#input.autocomplete = 'off';

        inputLine.appendChild(promptSpan);
        inputLine.appendChild(this.#input);

        this.#el.appendChild(toolbar);
        this.#el.appendChild(this.#output);
        this.#el.appendChild(inputLine);

        // Wire events
        this.#input.addEventListener('keydown', (e) => this.#onKeyDown(e));
        this.#el.addEventListener('click', () => this.#input.focus());

        return this.#el;
    }

    focus() {
        this.#input?.focus();
    }

    #onKeyDown(e) {
        if (e.key === 'Enter') {
            const cmd = this.#input.value;
            this.#input.value = '';

            // Display command
            this.#appendOutput(`${this.#prompt}${cmd}`, '#7aa2f7');

            if (cmd.trim()) {
                this.#history.unshift(cmd);
                this.#historyIndex = -1;

                const result = this.#cli.execute(cmd);
                if (result === '__CLEAR__') {
                    this.#output.innerHTML = '';
                } else if (result) {
                    this.#appendOutput(result);
                }
            }

            this.#appendOutput('');
            this.#scrollToBottom();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.#historyIndex < this.#history.length - 1) {
                this.#historyIndex++;
                this.#input.value = this.#history[this.#historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.#historyIndex > 0) {
                this.#historyIndex--;
                this.#input.value = this.#history[this.#historyIndex];
            } else {
                this.#historyIndex = -1;
                this.#input.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            this.#autocomplete();
        }
    }

    #appendOutput(text, color) {
        const line = document.createElement('div');
        line.textContent = text;
        if (color) line.style.color = color;
        this.#output.appendChild(line);
    }

    #scrollToBottom() {
        this.#output.scrollTop = this.#output.scrollHeight;
    }

    #autocomplete() {
        const val = this.#input.value.trim().toLowerCase();
        const commands = ['acli', 'ncli', 'ncc', 'genesis', 'cluster', 'logbay', 'curator_cli', 'zeus_config_printer', 'manage_ovs', 'ovs-vsctl', 'ovs-ofctl', 'allssh', 'curl', 'help', 'clear'];
        const acliSubs = ['vm.list', 'vm.create', 'vm.get', 'vm.on', 'vm.off', 'vm.delete', 'net.list', 'net.create', 'image.list'];
        const ncliSubs = ['cluster info', 'container list', 'container create', 'protection-domain list', 'security list'];

        let matches = [];
        if (val.startsWith('acli ')) {
            const sub = val.slice(5);
            matches = acliSubs.filter(s => s.startsWith(sub)).map(s => 'acli ' + s);
        } else if (val.startsWith('ncli ')) {
            const sub = val.slice(5);
            matches = ncliSubs.filter(s => s.startsWith(sub)).map(s => 'ncli ' + s);
        } else {
            matches = commands.filter(c => c.startsWith(val));
        }

        if (matches.length === 1) {
            this.#input.value = matches[0] + ' ';
        } else if (matches.length > 1) {
            this.#appendOutput(matches.join('  '), '#565f89');
        }
    }

    destroy() {}
}
