import type { ShotLog, FavoritesMap, SavedRecipe, BeanProfile } from '../types';

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

export function loadFavorites(): FavoritesMap {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return {};
    try {
        return JSON.parse(stored);
    } catch {
        return {};
    }
}

export function saveFavorites(favorites: FavoritesMap): void {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function loadRecipes(): SavedRecipe[] {
    const stored = localStorage.getItem(RECIPES_KEY);
    if (!stored) return [];
    try {
        const parsed = JSON.parse(stored);
        return parsed.map((r: SavedRecipe) => ({
            ...r,
            createdAt: new Date(r.createdAt),
        }));
    } catch {
        return [];
    }
}

export function saveRecipes(recipes: SavedRecipe[]): void {
    localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
}

export function loadBeans(): BeanProfile[] {
    const stored = localStorage.getItem(BEANS_KEY);
    if (!stored) return [];
    try {
        const parsed = JSON.parse(stored);
        return parsed.map((b: BeanProfile) => ({
            ...b,
            createdAt: new Date(b.createdAt),
        }));
    } catch {
        return [];
    }
}

export function saveBeans(beans: BeanProfile[]): void {
    localStorage.setItem(BEANS_KEY, JSON.stringify(beans));
}
