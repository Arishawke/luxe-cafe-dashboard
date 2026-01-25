import type { ShotLog, Rating, FavoritesMap, SavedRecipe, BeanProfile } from './types';

const STORAGE_KEY = 'espresso-shots';
const FAVORITES_KEY = 'espresso-favorites';
const RECIPES_KEY = 'espresso-recipes';
const BEANS_KEY = 'espresso-beans';

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

// Favorites: Maps bean name (lowercase) to favorite shot ID
export function loadFavorites(): FavoritesMap {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return {};
    try {
        return JSON.parse(stored);
    } catch (e) {
        return {};
    }
}

export function saveFavorites(favorites: FavoritesMap): void {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

// Saved Recipes
export function loadRecipes(): SavedRecipe[] {
    const stored = localStorage.getItem(RECIPES_KEY);
    if (!stored) return [];
    try {
        const parsed = JSON.parse(stored);
        return parsed.map((r: SavedRecipe) => ({
            ...r,
            createdAt: new Date(r.createdAt),
        }));
    } catch (e) {
        return [];
    }
}

export function saveRecipes(recipes: SavedRecipe[]): void {
    localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
}

// Bean Profiles
export function loadBeans(): BeanProfile[] {
    const stored = localStorage.getItem(BEANS_KEY);
    if (!stored) return [];
    try {
        const parsed = JSON.parse(stored);
        return parsed.map((b: BeanProfile) => ({
            ...b,
            createdAt: new Date(b.createdAt),
        }));
    } catch (e) {
        return [];
    }
}

export function saveBeans(beans: BeanProfile[]): void {
    localStorage.setItem(BEANS_KEY, JSON.stringify(beans));
}

export function generateId(): string {
    return crypto.randomUUID();
}

export function formatDate(date: Date, use24Hour: boolean = false): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: !use24Hour,
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
