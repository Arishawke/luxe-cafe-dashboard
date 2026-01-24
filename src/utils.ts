import type { ShotLog, Rating } from './types';

const STORAGE_KEY = 'espresso-shots';

export function loadShots(): ShotLog[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    try {
        const parsed = JSON.parse(stored);
        return parsed.map((s: ShotLog) => ({
            ...s,
            timestamp: new Date(s.timestamp),
        }));
    } catch (e) {
        console.error('Failed to parse stored shots', e);
        return [];
    }
}

export function saveShots(shots: ShotLog[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shots));
}

export function generateId(): string {
    return crypto.randomUUID();
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(date);
}

// Updated barista tips for 5-point rating scale
export function getBaristaTip(rating: Rating): { message: string; adjustment: 'large' | 'small' | 'none' } {
    switch (rating) {
        case 'Very Sour':
            return {
                message: 'Heavily under-extracted. Grind significantly finer (2-3 steps) or increase temperature.',
                adjustment: 'large',
            };
        case 'Sour':
            return {
                message: 'Slightly under-extracted. Grind a bit finer (1 step) or try a higher temperature.',
                adjustment: 'small',
            };
        case 'Balanced':
            return {
                message: 'Perfect extraction! Save these settings for this bean.',
                adjustment: 'none',
            };
        case 'Bitter':
            return {
                message: 'Slightly over-extracted. Grind a bit coarser (1 step) or try a lower temperature.',
                adjustment: 'small',
            };
        case 'Very Bitter':
            return {
                message: 'Heavily over-extracted. Grind significantly coarser (2-3 steps) or decrease temperature.',
                adjustment: 'large',
            };
    }
}

// Get unique bean names from shot history
export function getUniqueBeans(shots: ShotLog[]): string[] {
    const unique = new Set(shots.map(s => s.beanName));
    return Array.from(unique).sort();
}
