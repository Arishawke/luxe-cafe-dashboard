import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { computeCaffeine, DAILY_LIMIT } from './caffeine';
import type { ShotLog, Basket } from '../types';

const NOW = new Date('2026-05-12T12:00:00Z');

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
});

afterEach(() => {
    vi.useRealTimers();
});

const shot = (basket: Basket, daysAgo = 0): ShotLog => ({
    id: Math.random().toString(),
    beanName: 'Ethiopia',
    brewType: 'Espresso',
    basket,
    grindSize: 12,
    strength: 2,
    rating: 'Balanced',
    timestamp: new Date(NOW.getTime() - daysAgo * 24 * 60 * 60 * 1000),
});

describe('computeCaffeine', () => {
    it('returns all zeros for an empty shot list', () => {
        const stats = computeCaffeine([]);
        expect(stats.todayCaffeine).toBe(0);
        expect(stats.todayShotCount).toBe(0);
        expect(stats.avgDaily).toBe(0);
        expect(stats.percentage).toBe(0);
        expect(stats.statusText).toBe('Feeling fresh');
    });

    it('sums caffeine by basket size for today only', () => {
        const stats = computeCaffeine([
            shot('Single'),
            shot('Double'),
            shot('Luxe'),
            shot('Double', 3),
        ]);
        expect(stats.todayCaffeine).toBe(32 + 63 + 80);
        expect(stats.todayShotCount).toBe(1 + 2 + 4);
    });

    it('computes average daily caffeine over the past week', () => {
        const stats = computeCaffeine([
            shot('Double', 0),
            shot('Double', 1),
            shot('Double', 2),
            shot('Double', 8),
        ]);
        expect(stats.avgDaily).toBe(Math.round((63 * 3) / 7));
    });

    it('flags low status under 200mg', () => {
        const stats = computeCaffeine([shot('Single'), shot('Single')]);
        expect(stats.status).toBe('low');
        expect(stats.statusText).toBe('Room for more');
    });

    it('flags moderate status between 200 and 300mg', () => {
        const stats = computeCaffeine([shot('Double'), shot('Double'), shot('Double'), shot('Double')]);
        expect(stats.todayCaffeine).toBe(252);
        expect(stats.status).toBe('moderate');
    });

    it('flags high status above 300mg', () => {
        const stats = computeCaffeine([
            shot('Luxe'), shot('Luxe'), shot('Luxe'), shot('Luxe'),
        ]);
        expect(stats.todayCaffeine).toBe(320);
        expect(stats.status).toBe('high');
    });

    it('caps percentage at 100', () => {
        const stats = computeCaffeine(Array.from({ length: 10 }, () => shot('Luxe')));
        expect(stats.percentage).toBe(100);
    });

    it('reports DAILY_LIMIT in the result', () => {
        expect(computeCaffeine([]).dailyLimit).toBe(DAILY_LIMIT);
    });
});
