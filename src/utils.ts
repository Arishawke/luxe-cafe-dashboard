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

export function getBaristaTip(rating: Rating): { message: string; icon: string } {
    switch (rating) {
        case 'Sour':
            return {
                message: 'Under-extracted. Try grinding finer (lower number) or increase temperature.',
                icon: '🍋',
            };
        case 'Balanced':
            return {
                message: 'Perfect shot! Save these settings for this bean.',
                icon: '✨',
            };
        case 'Bitter':
            return {
                message: 'Over-extracted. Try grinding coarser (higher number) or decrease temperature.',
                icon: '🔥',
            };
    }
}
