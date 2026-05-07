import type { ShotLog } from '../types';

export function getDaysSinceRoast(roastDate: string | undefined): number | null {
    if (!roastDate) return null;
    const roast = new Date(roastDate);
    const now = new Date();
    return Math.floor((now.getTime() - roast.getTime()) / (1000 * 60 * 60 * 24));
}

export function getFreshnessStatus(days: number | null): { label: string; color: string } {
    if (days === null) return { label: 'Unknown', color: '#888' };
    if (days < 7) return { label: 'Resting', color: '#E8A045' };
    if (days <= 21) return { label: 'Peak', color: '#7A9E6D' };
    if (days <= 35) return { label: 'Fading', color: '#D4915C' };
    return { label: 'Stale', color: '#C04545' };
}

export function getUniqueBeans(shots: ShotLog[]): string[] {
    return Array.from(new Set(shots.map(s => s.beanName))).sort();
}
