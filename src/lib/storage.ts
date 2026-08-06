import type { ShotLog, FavoritesMap, SavedRecipe, BeanProfile, MaintenanceEvent } from '../types';
import {
    BASKETS,
    BREW_TYPES,
    MILK_STYLES,
    MILK_TYPES,
    PROCESS_METHODS,
    RATINGS,
    ROAST_LEVELS,
    STRENGTHS,
    TEMPERATURES,
} from '../constants';

const STORAGE_KEY = 'espresso-shots';
const FAVORITES_KEY = 'espresso-favorites';
const RECIPES_KEY = 'espresso-recipes';
const BEANS_KEY = 'espresso-beans';
const MAINTENANCE_KEY = 'luxe-cafe-maintenance';

// Date revival, shared with the import path in dataIO.ts
export const reviveShot = (s: ShotLog): ShotLog => ({ ...s, timestamp: new Date(s.timestamp) });
export const reviveRecipe = (r: SavedRecipe): SavedRecipe => ({ ...r, createdAt: new Date(r.createdAt) });
export const reviveBean = (b: BeanProfile): BeanProfile => ({ ...b, createdAt: new Date(b.createdAt) });

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim() !== '';
}

function isOptionalString(value: unknown): boolean {
    return value === undefined || typeof value === 'string';
}

function isOptionalFiniteNumber(value: unknown): boolean {
    return value === undefined || (typeof value === 'number' && Number.isFinite(value));
}

function parsesToValidDate(value: unknown): boolean {
    if (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) return false;
    return !Number.isNaN(new Date(value).getTime());
}

function isOneOf(value: unknown, options: readonly unknown[]): boolean {
    return options.includes(value);
}

export function validShotRecord(value: unknown): value is ShotLog {
    if (!isRecord(value)) return false;
    if (!isNonEmptyString(value.id) || !isNonEmptyString(value.beanName)) return false;
    if (!isOneOf(value.brewType, BREW_TYPES) || !isOneOf(value.basket, BASKETS)) return false;
    if (typeof value.grindSize !== 'number' || !Number.isFinite(value.grindSize)) return false;
    if (!STRENGTHS.some(({ value: strength }) => strength === value.strength)) return false;
    if (value.rating !== undefined && !isOneOf(value.rating, RATINGS)) return false;
    if (value.temperature !== undefined && !isOneOf(value.temperature, TEMPERATURES)) return false;
    if (!isOptionalString(value.notes) || !isOptionalFiniteNumber(value.extractionTime)
        || !isOptionalFiniteNumber(value.doseIn) || !isOptionalFiniteNumber(value.doseOut)) return false;
    if (value.milk !== undefined) {
        if (!isRecord(value.milk) || !isOneOf(value.milk.type, MILK_TYPES) || !isOneOf(value.milk.style, MILK_STYLES)) return false;
    }
    return parsesToValidDate(value.timestamp);
}

export function validRecipeRecord(value: unknown): value is SavedRecipe {
    if (!isRecord(value)) return false;
    if (!isNonEmptyString(value.id) || !isNonEmptyString(value.name) || !isNonEmptyString(value.beanName)) return false;
    if (!isOneOf(value.brewType, BREW_TYPES) || !isOneOf(value.basket, BASKETS)) return false;
    if (typeof value.grindSize !== 'number' || !Number.isFinite(value.grindSize)) return false;
    if (!STRENGTHS.some(({ value: strength }) => strength === value.strength)) return false;
    if (value.temperature !== undefined && !isOneOf(value.temperature, TEMPERATURES)) return false;
    if (!isOptionalString(value.notes)) return false;
    if (value.milk !== undefined) {
        if (!isRecord(value.milk) || !isOneOf(value.milk.type, MILK_TYPES) || !isOneOf(value.milk.style, MILK_STYLES)) return false;
    }
    return parsesToValidDate(value.createdAt);
}

export function validBeanRecord(value: unknown): value is BeanProfile {
    if (!isRecord(value)) return false;
    if (!isNonEmptyString(value.id) || !isNonEmptyString(value.name) || typeof value.isActive !== 'boolean') return false;
    if (!isOptionalString(value.roaster) || !isOptionalString(value.origin) || !isOptionalString(value.roastDate)
        || !isOptionalString(value.flavorNotes) || !isOptionalFiniteNumber(value.bagSizeGrams)
        || !isOptionalFiniteNumber(value.pricePaid)) return false;
    if (value.roastLevel !== undefined && !isOneOf(value.roastLevel, ROAST_LEVELS)) return false;
    if (value.processMethod !== undefined && !isOneOf(value.processMethod, PROCESS_METHODS)) return false;
    return parsesToValidDate(value.createdAt);
}

export function validMaintenanceRecord(value: unknown): value is MaintenanceEvent {
    if (!isRecord(value)) return false;
    if (value.task !== 'cleaning' && value.task !== 'descaling') return false;
    return typeof value.shotCountAtTime === 'number'
        && Number.isFinite(value.shotCountAtTime)
        && parsesToValidDate(value.performedAt);
}

function backupRaw(key: string): void {
    const stored = localStorage.getItem(key);
    if (stored === null) return;
    try { localStorage.setItem(`${key}:corrupt`, stored); } catch { /* best effort */ }
}

function readParsed(key: string): unknown {
    const stored = localStorage.getItem(key);
    if (stored === null) return undefined;
    try {
        return JSON.parse(stored);
    } catch (e) {
        // keep the unreadable value so a save does not silently overwrite recoverable data
        console.warn(`Corrupt data in ${key}, backing up and resetting`, e);
        backupRaw(key);
        return undefined;
    }
}

function loadArray<T>(
    key: string,
    valid: (item: unknown) => item is T,
    revive: (item: T) => T = (item) => item,
    identity?: (item: T) => string,
): T[] {
    const parsed = readParsed(key);
    if (!Array.isArray(parsed)) {
        if (parsed !== undefined && parsed !== null) {
            console.warn(`Expected an array in ${key}, resetting`);
            backupRaw(key);
        }
        return [];
    }
    const items: T[] = [];
    const seen = new Set<string>();
    let rejected = false;
    for (const item of parsed) {
        if (!valid(item)) {
            rejected = true;
            continue;
        }
        const id = identity?.(item);
        if (id !== undefined && seen.has(id)) {
            rejected = true;
            continue;
        }
        if (id !== undefined) seen.add(id);
        items.push(revive(item));
    }
    if (rejected) {
        console.warn(`Invalid entries in ${key}, backing up and skipping them`);
        backupRaw(key);
    }
    return items;
}

function loadRecord<T extends object>(key: string, fallback: T): T {
    const parsed = readParsed(key);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        if (parsed !== undefined && parsed !== null) console.warn(`Expected an object in ${key}, resetting`);
        return fallback;
    }
    return parsed as T;
}

export function saveStorageValue(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        // quota exceeded or storage disabled (private mode); never crash the render
        console.warn(`Failed to save ${key}`, e);
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('luxe:storage-error'));
        }
    }
}

function saveJSON(key: string, value: unknown): void {
    saveStorageValue(key, JSON.stringify(value));
}

export function loadStringArray(key: string): string[] {
    return loadArray(key, isNonEmptyString, (value) => value, (value) => value);
}

export function saveStringArray(key: string, values: string[]): void {
    saveJSON(key, values);
}

export function loadShots(): ShotLog[] { return loadArray(STORAGE_KEY, validShotRecord, reviveShot, (shot) => shot.id); }
export function saveShots(shots: ShotLog[]): void { saveJSON(STORAGE_KEY, shots); }

export function loadFavorites(): FavoritesMap { return loadRecord<FavoritesMap>(FAVORITES_KEY, {}); }
export function saveFavorites(favorites: FavoritesMap): void { saveJSON(FAVORITES_KEY, favorites); }

export function loadRecipes(): SavedRecipe[] { return loadArray(RECIPES_KEY, validRecipeRecord, reviveRecipe, (recipe) => recipe.id); }
export function saveRecipes(recipes: SavedRecipe[]): void { saveJSON(RECIPES_KEY, recipes); }

export function loadBeans(): BeanProfile[] { return loadArray(BEANS_KEY, validBeanRecord, reviveBean, (bean) => bean.id); }
export function saveBeans(beans: BeanProfile[]): void { saveJSON(BEANS_KEY, beans); }

export function loadMaintenance(): MaintenanceEvent[] { return loadArray(MAINTENANCE_KEY, validMaintenanceRecord); }
export function saveMaintenance(events: MaintenanceEvent[]): void { saveJSON(MAINTENANCE_KEY, events); }
