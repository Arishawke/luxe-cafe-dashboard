import { describe, it, expect } from 'vitest';
import { generateId, formatDate } from './format';

describe('generateId', () => {
    it('returns a UUID-shaped string', () => {
        const id = generateId();
        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('returns a different value on each call', () => {
        expect(generateId()).not.toBe(generateId());
    });
});

describe('formatDate', () => {
    const date = new Date('2026-05-12T14:30:00');

    it('formats with 12-hour clock by default', () => {
        const out = formatDate(date);
        expect(out).toMatch(/May/);
        expect(out).toMatch(/12/);
        expect(out).toMatch(/2:30/);
        expect(out).toMatch(/PM/);
    });

    it('formats with 24-hour clock when requested', () => {
        const out = formatDate(date, true);
        expect(out).toMatch(/14:30/);
        expect(out).not.toMatch(/PM/);
        expect(out).not.toMatch(/AM/);
    });
});
