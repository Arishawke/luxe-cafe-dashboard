import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    loadShots,
    saveShots,
    loadFavorites,
    saveFavorites,
    loadRecipes,
    saveRecipes,
    loadBeans,
    saveBeans,
    loadMaintenance,
    saveMaintenance,
} from './storage';
import type { ShotLog, SavedRecipe, BeanProfile, MaintenanceEvent } from '../types';

function createStorageMock(): Storage {
    const data = new Map<string, string>();
    return {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => { data.set(key, value); },
        removeItem: (key: string) => { data.delete(key); },
        clear: () => { data.clear(); },
        key: (i: number) => Array.from(data.keys())[i] ?? null,
        get length() { return data.size; },
    };
}

beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock());
    vi.spyOn(console, 'error').mockImplementation(() => { });
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('shots storage', () => {
    it('returns an empty array when no shots have been saved', () => {
        expect(loadShots()).toEqual([]);
    });

    it('round-trips shots through save and load', () => {
        const shot: ShotLog = {
            id: '1',
            beanName: 'Ethiopia',
            brewType: 'Espresso',
            basket: 'Double',
            grindSize: 12,
            strength: 2,
            rating: 'Balanced',
            timestamp: new Date('2026-05-01T10:00:00Z'),
        };
        saveShots([shot]);
        const loaded = loadShots();
        expect(loaded).toHaveLength(1);
        expect(loaded[0].id).toBe('1');
        expect(loaded[0].beanName).toBe('Ethiopia');
    });

    it('rehydrates timestamp as a Date instance', () => {
        const shot: ShotLog = {
            id: '1',
            beanName: 'Ethiopia',
            brewType: 'Espresso',
            basket: 'Double',
            grindSize: 12,
            strength: 2,
            rating: 'Balanced',
            timestamp: new Date('2026-05-01T10:00:00Z'),
        };
        saveShots([shot]);
        const loaded = loadShots();
        expect(loaded[0].timestamp).toBeInstanceOf(Date);
        expect(loaded[0].timestamp.toISOString()).toBe('2026-05-01T10:00:00.000Z');
    });

    it('returns an empty array when stored JSON is corrupt', () => {
        localStorage.setItem('espresso-shots', '{not json');
        expect(loadShots()).toEqual([]);
    });
});

describe('favorites storage', () => {
    it('returns an empty object when nothing is saved', () => {
        expect(loadFavorites()).toEqual({});
    });

    it('round-trips a favorites map', () => {
        saveFavorites({ ethiopia: 'shot-1', colombia: 'shot-2' });
        expect(loadFavorites()).toEqual({ ethiopia: 'shot-1', colombia: 'shot-2' });
    });

    it('falls back to an empty object on corrupt JSON', () => {
        localStorage.setItem('espresso-favorites', '{');
        expect(loadFavorites()).toEqual({});
    });
});

describe('recipes storage', () => {
    const recipe: SavedRecipe = {
        id: 'r1',
        name: 'Morning Latte',
        beanName: 'Ethiopia',
        brewType: 'Espresso',
        basket: 'Double',
        grindSize: 12,
        strength: 2,
        createdAt: new Date('2026-05-01T10:00:00Z'),
    };

    it('returns an empty array when no recipes are saved', () => {
        expect(loadRecipes()).toEqual([]);
    });

    it('rehydrates createdAt as a Date', () => {
        saveRecipes([recipe]);
        const loaded = loadRecipes();
        expect(loaded[0].createdAt).toBeInstanceOf(Date);
        expect(loaded[0].name).toBe('Morning Latte');
    });

    it('returns an empty array on corrupt JSON', () => {
        localStorage.setItem('espresso-recipes', 'nope');
        expect(loadRecipes()).toEqual([]);
    });
});

describe('beans storage', () => {
    const bean: BeanProfile = {
        id: 'b1',
        name: 'Ethiopia Yirgacheffe',
        roaster: 'Local Roaster',
        isActive: true,
        createdAt: new Date('2026-05-01T10:00:00Z'),
    };

    it('returns an empty array when no beans are saved', () => {
        expect(loadBeans()).toEqual([]);
    });

    it('rehydrates createdAt as a Date', () => {
        saveBeans([bean]);
        const loaded = loadBeans();
        expect(loaded[0].createdAt).toBeInstanceOf(Date);
        expect(loaded[0].roaster).toBe('Local Roaster');
    });

    it('returns an empty array on corrupt JSON', () => {
        localStorage.setItem('espresso-beans', 'broken');
        expect(loadBeans()).toEqual([]);
    });
});

describe('maintenance storage', () => {
    const event: MaintenanceEvent = {
        task: 'cleaning',
        performedAt: '2026-05-01T10:00:00.000Z',
        shotCountAtTime: 200,
    };

    it('returns an empty array when no events are saved', () => {
        expect(loadMaintenance()).toEqual([]);
    });

    it('round-trips maintenance events', () => {
        saveMaintenance([event]);
        expect(loadMaintenance()).toEqual([event]);
    });

    it('returns an empty array on corrupt JSON', () => {
        localStorage.setItem('luxe-cafe-maintenance', '{');
        expect(loadMaintenance()).toEqual([]);
    });
});
