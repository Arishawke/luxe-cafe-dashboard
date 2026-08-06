import type { ShotLog, BeanProfile } from '../types';

export function getDaysSinceRoast(roastDate: string | undefined): number | null {
    if (!roastDate) return null;
    const roast = new Date(roastDate);
    const now = new Date();
    return Math.floor((now.getTime() - roast.getTime()) / (1000 * 60 * 60 * 24));
}

export function getFreshnessStatus(days: number | null): { label: string; color: string } {
    // CSS custom properties so freshness badges re-skin across all six themes
    if (days === null) return { label: 'Unknown', color: 'var(--color-muted)' };
    if (days < 7) return { label: 'Resting', color: 'var(--color-very-sour)' };
    if (days <= 21) return { label: 'Peak', color: 'var(--color-balanced)' };
    if (days <= 35) return { label: 'Fading', color: 'var(--color-sour)' };
    return { label: 'Stale', color: 'var(--color-very-bitter)' };
}

export function getUniqueBeans(shots: ShotLog[]): string[] {
    return Array.from(new Set(shots.map(s => s.beanName))).sort();
}

export interface FreshnessAlert {
    variant: 'fading' | 'stale';
    label: string;
    color: string;
    text: string;
}

export function getFreshnessAlert(beanName: string, beans: BeanProfile[]): FreshnessAlert | null {
    if (!beanName.trim()) return null;
    const profile = beans.find(b => b.name.toLowerCase() === beanName.toLowerCase());
    if (!profile?.roastDate) return null;

    const days = getDaysSinceRoast(profile.roastDate);
    if (days === null || days <= 21) return null; // only fading or stale

    const freshness = getFreshnessStatus(days);
    const text = `${profile.name} was roasted ${days} days ago${
        days > 35
            ? '. Consider adjusting grind finer to compensate.'
            : '. Still good, but best to use soon.'
    }`;

    return {
        variant: days > 35 ? 'stale' : 'fading',
        label: freshness.label,
        color: freshness.color,
        text,
    };
}
