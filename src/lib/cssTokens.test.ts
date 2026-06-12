import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Guards the design-token layer in index.css. A mechanical hex -> token
// migration once rewrote `--color-sour: #D4915C` into `--color-sour:
// var(--color-sour)`, a circular definition that silently resolved to
// transparent in the default theme. These checks make that class of bug fail
// the suite instead of shipping.
const css = readFileSync(
    fileURLToPath(new URL('../index.css', import.meta.url)),
    'utf8',
);

describe('design tokens in index.css', () => {
    it('has no circular custom-property definitions', () => {
        const circular: string[] = [];
        const re = /(--[a-z0-9-]+)\s*:\s*var\((--[a-z0-9-]+)[\s,)]/g;
        for (const m of css.matchAll(re)) {
            if (m[1] === m[2]) circular.push(m[1]);
        }
        expect(circular).toEqual([]);
    });

    it('leaves no raw rating/accent hex literals in rules (tokens only)', () => {
        // The five themes own these colors; a literal here is right in one
        // theme and wrong in the other four.
        const offenders = ['#D4915C', '#7A9E6D', '#B85C5C', '#E8A045', '#C04545', '#FFD700'];
        const body = css.slice(css.indexOf('/* Reset & Base */'));
        const found = offenders.filter(hex => body.toUpperCase().includes(hex));
        expect(found).toEqual([]);
    });
});
