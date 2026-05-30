import { describe, it, expect } from 'vitest';
import { generateId, formatDate, formatDateLong } from './format';

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

describe('formatDateLong', () => {
    const date = new Date('2026-05-12T14:30:00');

    it('includes weekday, full month name, and year', () => {
        const out = formatDateLong(date);
        expect(out).toMatch(/Tuesday/);
        expect(out).toMatch(/May/);
        expect(out).toMatch(/2026/);
    });

    it('respects 24-hour preference', () => {
        const out = formatDateLong(date, true);
        expect(out).toMatch(/14:30/);
        expect(out).not.toMatch(/PM/);
    });
});

describe('invalid dates', () => {
    it('formatDate returns a fallback instead of throwing on an Invalid Date', () => {
        expect(formatDate(new Date('not a date'))).toBe('Unknown date');
    });

    it('formatDateLong returns a fallback instead of throwing on an Invalid Date', () => {
        expect(formatDateLong(new Date('not a date'))).toBe('Unknown date');
    });
});
