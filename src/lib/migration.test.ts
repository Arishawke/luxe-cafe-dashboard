import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    handleMigrationSend,
    readMigrationLanding,
    clearMigrationHash,
    shouldOfferMigration,
    startMigration,
    dismissMigration,
} from './migration';
import { saveShots, saveRecipes, saveBeans } from './storage';
import type { ShotLog, SavedRecipe, BeanProfile } from '../types';

const OLD_ORIGIN = 'https://luxe-cafe-dashboard.vercel.app';
const NEW_ORIGIN = 'https://luxecafe.arishawke.com';

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

interface FakeLocation {
    hostname: string;
    hash: string;
    search: string;
    assign: ReturnType<typeof vi.fn<(url: string) => void>>;
    replace: ReturnType<typeof vi.fn<(url: string) => void>>;
}

function fakeLoc(over: Partial<FakeLocation> = {}): FakeLocation {
    return { hostname: '', hash: '', search: '', assign: vi.fn(), replace: vi.fn(), ...over };
}

const sampleShot: ShotLog = {
    id: 's1',
    beanName: 'Ethiopia Yirgacheffe',
    brewType: 'Espresso',
    basket: 'Double',
    grindSize: 12,
    strength: 2,
    timestamp: new Date('2026-01-01T08:00:00Z'),
};

const sampleRecipe: SavedRecipe = {
    id: 'r1',
    name: 'Morning Double',
    beanName: 'Ethiopia Yirgacheffe',
    brewType: 'Espresso',
    basket: 'Double',
    grindSize: 12,
    strength: 2,
    createdAt: new Date('2026-01-01T08:00:00Z'),
};

const sampleBean: BeanProfile = {
    id: 'b1',
    name: 'Ethiopia Yirgacheffe',
    isActive: true,
    createdAt: new Date('2026-01-01T08:00:00Z'),
};

beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock());
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('handleMigrationSend', () => {
    it('does nothing on a host other than the old domain', () => {
        const loc = fakeLoc({ hostname: 'localhost', hash: '#export-to-new' });
        expect(handleMigrationSend(loc)).toBe(false);
        expect(loc.replace).not.toHaveBeenCalled();
    });

    it('does nothing without the send flag', () => {
        const loc = fakeLoc({ hostname: 'luxe-cafe-dashboard.vercel.app', hash: '' });
        expect(handleMigrationSend(loc)).toBe(false);
        expect(loc.replace).not.toHaveBeenCalled();
    });

    it('packs this origin data into the new origin URL and redirects', () => {
        saveShots([sampleShot]);
        const loc = fakeLoc({ hostname: 'luxe-cafe-dashboard.vercel.app', hash: '#export-to-new' });

        expect(handleMigrationSend(loc)).toBe(true);
        expect(loc.replace).toHaveBeenCalledTimes(1);

        const url: string = loc.replace.mock.calls[0][0];
        expect(url.startsWith(`${NEW_ORIGIN}/#migrate=`)).toBe(true);

        const payload = decodeURIComponent(url.split('#migrate=')[1]);
        const backup = JSON.parse(payload);
        expect(backup.shots[0].beanName).toBe('Ethiopia Yirgacheffe');
    });

    it('redirects to the too-big sentinel when the payload exceeds the URL budget', () => {
        saveShots([{ ...sampleShot, notes: 'x'.repeat(1_600_000) }]);
        const loc = fakeLoc({ hostname: 'luxe-cafe-dashboard.vercel.app', hash: '#export-to-new' });

        expect(handleMigrationSend(loc)).toBe(true);
        expect(loc.replace).toHaveBeenCalledWith(`${NEW_ORIGIN}/#migrate-toobig`);
    });
});

describe('readMigrationLanding', () => {
    it('returns null when no migration hash is present', () => {
        expect(readMigrationLanding(fakeLoc({ hash: '#settings' }))).toBeNull();
    });

    it('flags the too-big sentinel', () => {
        expect(readMigrationLanding(fakeLoc({ hash: '#migrate-toobig' }))).toEqual({ tooBig: true });
    });

    it('decodes a payload hash back to JSON', () => {
        const json = JSON.stringify({ shots: [{ beanName: 'Test' }] });
        const loc = fakeLoc({ hash: `#migrate=${encodeURIComponent(json)}` });
        expect(readMigrationLanding(loc)).toEqual({ json });
    });

    it('flags malformed URI encoding instead of throwing', () => {
        expect(readMigrationLanding(fakeLoc({ hash: '#migrate=%' }))).toEqual({ invalid: true });
    });
});

describe('clearMigrationHash', () => {
    it('replaces history with the hash-free path', () => {
        const replaceState = vi.fn();
        const win = { history: { replaceState }, location: { pathname: '/', search: '?a=1' } };
        clearMigrationHash(win);
        expect(replaceState).toHaveBeenCalledWith(null, '', '/?a=1');
    });
});

describe('shouldOfferMigration', () => {
    it('offers on the new domain when there is no data yet', () => {
        const loc = fakeLoc({ hostname: 'luxecafe.arishawke.com' });
        expect(shouldOfferMigration(loc)).toBe(true);
    });

    it('does not offer on the new domain once data exists', () => {
        saveShots([sampleShot]);
        const loc = fakeLoc({ hostname: 'luxecafe.arishawke.com' });
        expect(shouldOfferMigration(loc)).toBe(false);
    });

    it('counts recipes and beans as existing data', () => {
        saveRecipes([sampleRecipe]);
        expect(shouldOfferMigration(fakeLoc({ hostname: 'luxecafe.arishawke.com' }))).toBe(false);
        saveRecipes([]);
        saveBeans([sampleBean]);
        expect(shouldOfferMigration(fakeLoc({ hostname: 'luxecafe.arishawke.com' }))).toBe(false);
    });

    it('does not offer on other hosts', () => {
        expect(shouldOfferMigration(fakeLoc({ hostname: 'luxe-cafe-dashboard.vercel.app' }))).toBe(false);
    });

    it('does not offer after dismissal', () => {
        dismissMigration();
        expect(shouldOfferMigration(fakeLoc({ hostname: 'luxecafe.arishawke.com' }))).toBe(false);
    });

    it('always offers under the dev preview param', () => {
        saveShots([sampleShot]);
        const loc = fakeLoc({ hostname: 'localhost', search: '?migrate-preview=1' });
        expect(shouldOfferMigration(loc)).toBe(true);
    });
});

describe('startMigration', () => {
    it('sends the browser to the old origin with the send flag', () => {
        const loc = fakeLoc();
        startMigration(loc);
        expect(loc.assign).toHaveBeenCalledWith(`${OLD_ORIGIN}/#export-to-new`);
    });
});

describe('dismissMigration', () => {
    it('persists the dismissal flag', () => {
        dismissMigration();
        expect(localStorage.getItem('luxe-cafe-migration-dismissed')).toBe('true');
    });
});
