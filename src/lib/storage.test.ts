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
    loadStringArray,
    saveStorageValue,
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

    it('skips malformed and duplicate records without overwriting the raw data', () => {
        const raw = JSON.stringify([
            { id: '1', beanName: 'Ethiopia', brewType: 'Espresso', basket: 'Double', grindSize: 12, strength: 2, timestamp: '2026-05-01T10:00:00Z' },
            { id: '1', beanName: 'Duplicate', brewType: 'Espresso', basket: 'Double', grindSize: 12, strength: 2, timestamp: '2026-05-01T10:00:00Z' },
            { id: '2', beanName: null, timestamp: '2026-05-01T10:00:00Z' },
        ]);
        localStorage.setItem('espresso-shots', raw);
        expect(loadShots().map(shot => shot.beanName)).toEqual(['Ethiopia']);
        expect(localStorage.getItem('espresso-shots')).toBe(raw);
        expect(localStorage.getItem('espresso-shots:corrupt')).toBe(raw);
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

describe('storage robustness', () => {
    it('loads only unique non-empty strings from preference arrays', () => {
        localStorage.setItem('pins', JSON.stringify(['r1', '', 3, 'r1', 'r2']));
        expect(loadStringArray('pins')).toEqual(['r1', 'r2']);
    });

    it('returns an empty string array for corrupt preference JSON', () => {
        localStorage.setItem('pins', '{');
        expect(loadStringArray('pins')).toEqual([]);
    });

    it('returns the array default when stored JSON is the wrong type (object)', () => {
        localStorage.setItem('espresso-shots', '{}');
        expect(loadShots()).toEqual([]);
    });

    it('returns the array default when stored JSON is the wrong type (number)', () => {
        localStorage.setItem('espresso-recipes', '5');
        expect(loadRecipes()).toEqual([]);
    });

    it('returns the object default when favorites JSON is an array', () => {
        localStorage.setItem('espresso-favorites', '[1,2,3]');
        expect(loadFavorites()).toEqual({});
    });

    it('preserves the raw value under a :corrupt key before falling back', () => {
        localStorage.setItem('espresso-shots', '{not json');
        loadShots();
        expect(localStorage.getItem('espresso-shots:corrupt')).toBe('{not json');
    });

    it('treats a stored JSON null as empty without logging a warning', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => { });
        localStorage.setItem('espresso-shots', 'null');
        expect(loadShots()).toEqual([]);
        expect(warn).not.toHaveBeenCalled();
    });

    it('does not throw when setItem fails (quota exceeded / private mode)', () => {
        const throwing: Storage = {
            getItem: () => null,
            setItem: () => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); },
            removeItem: () => { },
            clear: () => { },
            key: () => null,
            get length() { return 0; },
        };
        vi.stubGlobal('localStorage', throwing);
        vi.spyOn(console, 'warn').mockImplementation(() => { });
        expect(() => saveShots([])).not.toThrow();
    });

    it('signals a storage-error event when a save fails', () => {
        const throwing: Storage = {
            getItem: () => null,
            setItem: () => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); },
            removeItem: () => { },
            clear: () => { },
            key: () => null,
            get length() { return 0; },
        };
        vi.stubGlobal('localStorage', throwing);
        vi.spyOn(console, 'warn').mockImplementation(() => { });
        const dispatch = vi.fn();
        vi.stubGlobal('window', { dispatchEvent: dispatch });
        saveShots([]);
        expect(dispatch).toHaveBeenCalledOnce();
        expect(dispatch.mock.calls[0][0].type).toBe('luxe:storage-error');
    });

    it('guards raw preference writes with the same storage-error event', () => {
        const throwing = {
            ...createStorageMock(),
            setItem: () => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); },
        };
        vi.stubGlobal('localStorage', throwing);
        vi.spyOn(console, 'warn').mockImplementation(() => { });
        const dispatch = vi.fn();
        vi.stubGlobal('window', { dispatchEvent: dispatch });
        expect(() => saveStorageValue('theme', 'dark')).not.toThrow();
        expect(dispatch).toHaveBeenCalledOnce();
    });
});
