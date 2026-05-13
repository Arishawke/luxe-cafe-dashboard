import { describe, it, expect } from 'vitest';
import {
    lastEventFor,
    getMaintenanceAlerts,
    CLEANING_INTERVAL_SHOTS,
    DESCALING_INTERVAL_DAYS,
} from './maintenance';
import type { MaintenanceEvent } from '../types';

const NOW = new Date('2026-05-12T12:00:00Z');

const daysAgoIso = (days: number): string =>
    new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

describe('lastEventFor', () => {
    it('returns null when no events', () => {
        expect(lastEventFor([], 'cleaning')).toBeNull();
    });

    it('returns null when no events match the task', () => {
        const events: MaintenanceEvent[] = [
            { task: 'descaling', performedAt: daysAgoIso(10), shotCountAtTime: 50 },
        ];
        expect(lastEventFor(events, 'cleaning')).toBeNull();
    });

    it('returns the latest matching event', () => {
        const events: MaintenanceEvent[] = [
            { task: 'cleaning', performedAt: daysAgoIso(30), shotCountAtTime: 50 },
            { task: 'cleaning', performedAt: daysAgoIso(5), shotCountAtTime: 200 },
            { task: 'cleaning', performedAt: daysAgoIso(20), shotCountAtTime: 120 },
        ];
        expect(lastEventFor(events, 'cleaning')?.shotCountAtTime).toBe(200);
    });
});

describe('getMaintenanceAlerts cleaning thresholds', () => {
    const baseline: MaintenanceEvent = { task: 'cleaning', performedAt: daysAgoIso(1), shotCountAtTime: 0 };

    it('produces no alert below 80% of the interval', () => {
        const shotsSince = Math.floor(CLEANING_INTERVAL_SHOTS * 0.79);
        const alerts = getMaintenanceAlerts([baseline], shotsSince, NOW);
        expect(alerts).toEqual([]);
    });

    it('returns approaching at 80% of the interval', () => {
        const shotsSince = Math.ceil(CLEANING_INTERVAL_SHOTS * 0.8);
        const alerts = getMaintenanceAlerts([baseline], shotsSince, NOW);
        expect(alerts[0].variant).toBe('approaching');
    });

    it('returns due at exactly the interval', () => {
        const alerts = getMaintenanceAlerts([baseline], CLEANING_INTERVAL_SHOTS, NOW);
        expect(alerts[0].variant).toBe('due');
    });

    it('returns overdue at 125% of the interval', () => {
        const alerts = getMaintenanceAlerts([baseline], Math.ceil(CLEANING_INTERVAL_SHOTS * 1.25), NOW);
        expect(alerts[0].variant).toBe('overdue');
    });
});

describe('getMaintenanceAlerts descaling thresholds', () => {
    const make = (daysAgo: number): MaintenanceEvent => ({
        task: 'descaling',
        performedAt: daysAgoIso(daysAgo),
        shotCountAtTime: 0,
    });

    it('produces no alert below 80% of the interval', () => {
        const alerts = getMaintenanceAlerts([make(Math.floor(DESCALING_INTERVAL_DAYS * 0.79))], 0, NOW);
        expect(alerts).toEqual([]);
    });

    it('returns approaching when 80% through the interval', () => {
        const alerts = getMaintenanceAlerts([make(Math.ceil(DESCALING_INTERVAL_DAYS * 0.8))], 0, NOW);
        expect(alerts[0].variant).toBe('approaching');
    });

    it('returns due at the interval', () => {
        const alerts = getMaintenanceAlerts([make(DESCALING_INTERVAL_DAYS)], 0, NOW);
        expect(alerts[0].variant).toBe('due');
    });

    it('returns overdue at 120 days', () => {
        const alerts = getMaintenanceAlerts([make(120)], 0, NOW);
        expect(alerts[0].variant).toBe('overdue');
    });
});

describe('getMaintenanceAlerts combined', () => {
    it('returns no alerts when there are no events', () => {
        expect(getMaintenanceAlerts([], 500, NOW)).toEqual([]);
    });

    it('returns both alerts when cleaning and descaling are due', () => {
        const events: MaintenanceEvent[] = [
            { task: 'cleaning', performedAt: daysAgoIso(60), shotCountAtTime: 0 },
            { task: 'descaling', performedAt: daysAgoIso(DESCALING_INTERVAL_DAYS), shotCountAtTime: 0 },
        ];
        const alerts = getMaintenanceAlerts(events, CLEANING_INTERVAL_SHOTS, NOW);
        expect(alerts.map(a => a.task)).toEqual(['cleaning', 'descaling']);
    });
});
