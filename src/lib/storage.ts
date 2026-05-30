import type { ShotLog, FavoritesMap, SavedRecipe, BeanProfile, MaintenanceEvent } from '../types';

const STORAGE_KEY = 'espresso-shots';
const FAVORITES_KEY = 'espresso-favorites';
const RECIPES_KEY = 'espresso-recipes';
const BEANS_KEY = 'espresso-beans';
const MAINTENANCE_KEY = 'luxe-cafe-maintenance';

// Date revival, shared with the import path in dataIO.ts
export const reviveShot = (s: ShotLog): ShotLog => ({ ...s, timestamp: new Date(s.timestamp) });
export const reviveRecipe = (r: SavedRecipe): SavedRecipe => ({ ...r, createdAt: new Date(r.createdAt) });
export const reviveBean = (b: BeanProfile): BeanProfile => ({ ...b, createdAt: new Date(b.createdAt) });

function readParsed(key: string): unknown {
    const stored = localStorage.getItem(key);
    if (stored === null) return undefined;
    try {
        return JSON.parse(stored);
    } catch (e) {
        // keep the unreadable value so a save does not silently overwrite recoverable data
        console.warn(`Corrupt data in ${key}, backing up and resetting`, e);
        try { localStorage.setItem(`${key}:corrupt`, stored); } catch { /* best effort */ }
        return undefined;
    }
}

function loadArray<T>(key: string, revive: (item: T) => T = (x) => x): T[] {
    const parsed = readParsed(key);
    if (!Array.isArray(parsed)) {
        if (parsed !== undefined && parsed !== null) console.warn(`Expected an array in ${key}, resetting`);
        return [];
    }
    return (parsed as T[]).map(revive);
}

function loadRecord<T extends object>(key: string, fallback: T): T {
    const parsed = readParsed(key);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        if (parsed !== undefined && parsed !== null) console.warn(`Expected an object in ${key}, resetting`);
        return fallback;
    }
    return parsed as T;
}

function saveJSON(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        // quota exceeded or storage disabled (private mode); never crash the render
        console.warn(`Failed to save ${key}`, e);
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('luxe:storage-error'));
        }
    }
}

export function loadShots(): ShotLog[] { return loadArray(STORAGE_KEY, reviveShot); }
export function saveShots(shots: ShotLog[]): void { saveJSON(STORAGE_KEY, shots); }

export function loadFavorites(): FavoritesMap { return loadRecord<FavoritesMap>(FAVORITES_KEY, {}); }
export function saveFavorites(favorites: FavoritesMap): void { saveJSON(FAVORITES_KEY, favorites); }

export function loadRecipes(): SavedRecipe[] { return loadArray(RECIPES_KEY, reviveRecipe); }
export function saveRecipes(recipes: SavedRecipe[]): void { saveJSON(RECIPES_KEY, recipes); }

export function loadBeans(): BeanProfile[] { return loadArray(BEANS_KEY, reviveBean); }
export function saveBeans(beans: BeanProfile[]): void { saveJSON(BEANS_KEY, beans); }

export function loadMaintenance(): MaintenanceEvent[] { return loadArray<MaintenanceEvent>(MAINTENANCE_KEY); }
export function saveMaintenance(events: MaintenanceEvent[]): void { saveJSON(MAINTENANCE_KEY, events); }
