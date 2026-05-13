import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    getDaysSinceRoast,
    getFreshnessStatus,
    getUniqueBeans,
    getFreshnessAlert,
} from './beans';
import type { ShotLog, BeanProfile } from '../types';

const NOW = new Date('2026-05-12T12:00:00Z');

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
});

afterEach(() => {
    vi.useRealTimers();
});

describe('getDaysSinceRoast', () => {
    it('returns null when roast date is undefined', () => {
        expect(getDaysSinceRoast(undefined)).toBeNull();
    });

    it('returns whole days elapsed since the roast date', () => {
        expect(getDaysSinceRoast('2026-05-01T12:00:00Z')).toBe(11);
        expect(getDaysSinceRoast('2026-05-12T12:00:00Z')).toBe(0);
    });
});

describe('getFreshnessStatus', () => {
    it('returns Unknown for null', () => {
        expect(getFreshnessStatus(null).label).toBe('Unknown');
    });

    it('returns Resting under 7 days', () => {
        expect(getFreshnessStatus(0).label).toBe('Resting');
        expect(getFreshnessStatus(6).label).toBe('Resting');
    });

    it('returns Peak between 7 and 21 days inclusive', () => {
        expect(getFreshnessStatus(7).label).toBe('Peak');
        expect(getFreshnessStatus(21).label).toBe('Peak');
    });

    it('returns Fading between 22 and 35 days inclusive', () => {
        expect(getFreshnessStatus(22).label).toBe('Fading');
        expect(getFreshnessStatus(35).label).toBe('Fading');
    });

    it('returns Stale past 35 days', () => {
        expect(getFreshnessStatus(36).label).toBe('Stale');
        expect(getFreshnessStatus(120).label).toBe('Stale');
    });
});

describe('getUniqueBeans', () => {
    it('returns sorted unique bean names', () => {
        const shots = [
            { beanName: 'Colombia' },
            { beanName: 'Ethiopia' },
            { beanName: 'Colombia' },
            { beanName: 'Brazil' },
        ] as ShotLog[];
        expect(getUniqueBeans(shots)).toEqual(['Brazil', 'Colombia', 'Ethiopia']);
    });

    it('returns empty array for no shots', () => {
        expect(getUniqueBeans([])).toEqual([]);
    });
});

describe('getFreshnessAlert', () => {
    const makeBean = (over: Partial<BeanProfile>): BeanProfile => ({
        id: '1',
        name: 'Ethiopia',
        isActive: true,
        createdAt: new Date(),
        ...over,
    });

    it('returns null for empty bean name', () => {
        expect(getFreshnessAlert('   ', [makeBean({})])).toBeNull();
    });

    it('returns null when no matching bean profile', () => {
        expect(getFreshnessAlert('Mystery', [makeBean({ name: 'Ethiopia' })])).toBeNull();
    });

    it('returns null when matching bean has no roast date', () => {
        expect(getFreshnessAlert('Ethiopia', [makeBean({})])).toBeNull();
    });

    it('returns null when bean is 21 days or fresher', () => {
        const roast21 = new Date(NOW.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString();
        expect(getFreshnessAlert('Ethiopia', [makeBean({ roastDate: roast21 })])).toBeNull();
    });

    it('returns fading variant between 22 and 35 days', () => {
        const roast30 = new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const alert = getFreshnessAlert('Ethiopia', [makeBean({ roastDate: roast30 })]);
        expect(alert?.variant).toBe('fading');
        expect(alert?.text).toMatch(/30 days/);
    });

    it('returns stale variant past 35 days', () => {
        const roast50 = new Date(NOW.getTime() - 50 * 24 * 60 * 60 * 1000).toISOString();
        const alert = getFreshnessAlert('Ethiopia', [makeBean({ roastDate: roast50 })]);
        expect(alert?.variant).toBe('stale');
        expect(alert?.text).toMatch(/grind finer/);
    });

    it('matches bean name case-insensitively', () => {
        const roast40 = new Date(NOW.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString();
        const alert = getFreshnessAlert('ETHIOPIA', [makeBean({ name: 'Ethiopia', roastDate: roast40 })]);
        expect(alert).not.toBeNull();
    });
});
