import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { computeStats } from './stats';
import type { ShotLog, Rating } from '../types';

const NOW = new Date('2026-05-12T12:00:00Z');

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
});

afterEach(() => {
    vi.useRealTimers();
});

const shot = (over: Partial<ShotLog> & { rating?: Rating }): ShotLog => ({
    id: Math.random().toString(),
    beanName: 'Ethiopia',
    brewType: 'Espresso',
    basket: 'Double',
    grindSize: 12,
    strength: 2,
    rating: 'Balanced',
    timestamp: NOW,
    ...over,
});

describe('computeStats', () => {
    it('returns empty defaults for no shots', () => {
        const s = computeStats([]);
        expect(s.totalShots).toBe(0);
        expect(s.avgGrind).toBeNull();
        expect(s.successRate).toBe(0);
        expect(s.shotsThisWeek).toBe(0);
        expect(s.hasWeekData).toBe(false);
    });

    it('counts shots per rating', () => {
        const s = computeStats([
            shot({ rating: 'Balanced' }),
            shot({ rating: 'Balanced' }),
            shot({ rating: 'Sour' }),
            shot({ rating: 'Bitter' }),
        ]);
        expect(s.ratingCounts['Balanced']).toBe(2);
        expect(s.ratingCounts['Sour']).toBe(1);
        expect(s.ratingCounts['Bitter']).toBe(1);
        expect(s.ratingCounts['Very Sour']).toBe(0);
    });

    it('ranks topBeans by shot count, descending, max 5', () => {
        const beans = ['A', 'A', 'A', 'B', 'B', 'C', 'D', 'E', 'F', 'G'];
        const s = computeStats(beans.map(b => shot({ beanName: b })));
        expect(s.topBeans).toHaveLength(5);
        expect(s.topBeans[0]).toEqual(['A', 3]);
        expect(s.topBeans[1]).toEqual(['B', 2]);
    });

    it('computes avgGrind only from Balanced shots', () => {
        const s = computeStats([
            shot({ rating: 'Balanced', grindSize: 10 }),
            shot({ rating: 'Balanced', grindSize: 14 }),
            shot({ rating: 'Sour', grindSize: 100 }),
        ]);
        expect(s.avgGrind).toBe(12);
    });

    it('rounds successRate to a percentage', () => {
        const s = computeStats([
            shot({ rating: 'Balanced' }),
            shot({ rating: 'Balanced' }),
            shot({ rating: 'Sour' }),
        ]);
        expect(s.successRate).toBe(67);
    });

    it('excludes unrated shots from the balanced rate denominator', () => {
        // Two balanced, two not-yet-tasted. A shot you never rated must not
        // count as a miss, or "save first, rate later" would tank the rate.
        const s = computeStats([
            shot({ rating: 'Balanced' }),
            shot({ rating: 'Balanced' }),
            shot({ rating: undefined }),
            shot({ rating: undefined }),
        ]);
        expect(s.totalShots).toBe(4);
        expect(s.ratedShots).toBe(2);
        expect(s.successRate).toBe(100);
    });

    it('counts shotsThisWeek over the last 7 days only', () => {
        const dayAgo = (d: number) => new Date(NOW.getTime() - d * 24 * 60 * 60 * 1000);
        const s = computeStats([
            shot({ timestamp: dayAgo(0) }),
            shot({ timestamp: dayAgo(3) }),
            shot({ timestamp: dayAgo(6) }),
            shot({ timestamp: dayAgo(10) }),
        ]);
        expect(s.shotsThisWeek).toBe(3);
    });

    it('builds a 7-day window in the days array', () => {
        const s = computeStats([shot({})]);
        expect(s.days).toHaveLength(7);
        expect(s.hasWeekData).toBe(true);
    });

    it('hides the brew breakdown when only one brew type is present', () => {
        const s = computeStats([shot({}), shot({})]);
        expect(s.showBrewBreakdown).toBe(false);
    });

    it('shows the brew breakdown when multiple brew types are present', () => {
        const s = computeStats([
            shot({ brewType: 'Espresso' }),
            shot({ brewType: 'Drip Coffee' }),
        ]);
        expect(s.showBrewBreakdown).toBe(true);
    });
});
