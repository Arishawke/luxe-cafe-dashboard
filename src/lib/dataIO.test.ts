import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseBackup, buildJSONBackup, buildCSV } from './dataIO';
import type { ShotLog, SavedRecipe, BeanProfile, MaintenanceEvent } from '../types';

afterEach(() => { vi.restoreAllMocks(); });

const validShot = {
    id: '1',
    beanName: 'Ethiopia',
    brewType: 'Espresso',
    basket: 'Double',
    grindSize: 12,
    strength: 2,
    rating: 'Balanced',
    timestamp: '2026-05-01T10:00:00.000Z',
};

function backup(extra: Record<string, unknown>): string {
    return JSON.stringify({ version: 2, exportedAt: '2026-05-01', shots: [validShot], ...extra });
}

describe('parseBackup', () => {
    it('imports a valid backup and rehydrates timestamp as a Date', () => {
        const result = parseBackup(backup({}));
        expect(result.shots).toHaveLength(1);
        expect(result.shots[0].timestamp).toBeInstanceOf(Date);
        expect(result.shots[0].beanName).toBe('Ethiopia');
        expect(result.skipped.shots).toBe(0);
    });

    it('throws on malformed JSON', () => {
        expect(() => parseBackup('{not json')).toThrow();
    });

    it('throws when the shots key is missing', () => {
        expect(() => parseBackup(JSON.stringify({ version: 2 }))).toThrow(/shots/i);
    });

    it('throws when shots is not an array', () => {
        expect(() => parseBackup(JSON.stringify({ shots: 'nope' }))).toThrow(/shots/i);
    });

    it('skips a shot with an unparseable timestamp and counts it', () => {
        const text = JSON.stringify({
            shots: [validShot, { ...validShot, id: '2', timestamp: 'garbage' }],
        });
        const result = parseBackup(text);
        expect(result.shots).toHaveLength(1);
        expect(result.shots[0].id).toBe('1');
        expect(result.skipped.shots).toBe(1);
    });

    it('skips a shot whose rating is not a known rating', () => {
        const text = JSON.stringify({
            shots: [validShot, { ...validShot, id: '2', rating: 'Delicious' }],
        });
        const result = parseBackup(text);
        expect(result.shots.map((s: ShotLog) => s.id)).toEqual(['1']);
        expect(result.skipped.shots).toBe(1);
    });

    it('keeps a shot with no rating (logged but not yet tasted)', () => {
        // "Save first, rate later" shots round-trip through export/import.
        const { rating, ...unrated } = validShot;
        void rating;
        const text = JSON.stringify({ shots: [{ ...unrated, id: '2' }] });
        const result = parseBackup(text);
        expect(result.shots.map((s: ShotLog) => s.id)).toEqual(['2']);
        expect(result.skipped.shots).toBe(0);
    });

    it('skips a shot whose grindSize is not a finite number', () => {
        const text = JSON.stringify({
            shots: [validShot, { ...validShot, id: '2', grindSize: 'twelve' }],
        });
        const result = parseBackup(text);
        expect(result.shots.map((s: ShotLog) => s.id)).toEqual(['1']);
        expect(result.skipped.shots).toBe(1);
    });

    it('skips a shot missing a bean name', () => {
        const { beanName: _drop, ...noBean } = validShot;
        void _drop;
        const text = JSON.stringify({ shots: [{ ...noBean, id: '2' }] });
        const result = parseBackup(text);
        expect(result.shots).toHaveLength(0);
        expect(result.skipped.shots).toBe(1);
    });

    it('defaults recipes, beans, and maintenance to empty when absent', () => {
        const result = parseBackup(backup({}));
        expect(result.recipes).toEqual([]);
        expect(result.beans).toEqual([]);
        expect(result.maintenance).toEqual([]);
    });

    it('defaults favorites to an empty object when missing or the wrong type', () => {
        expect(parseBackup(backup({})).favorites).toEqual({});
        expect(parseBackup(backup({ favorites: [1, 2] })).favorites).toEqual({});
    });

    it('imports an older v1 backup that predates maintenance', () => {
        const text = JSON.stringify({ version: 1, shots: [validShot] });
        const result = parseBackup(text);
        expect(result.shots).toHaveLength(1);
        expect(result.maintenance).toEqual([]);
    });

    it('skips a recipe with an unparseable createdAt and counts it', () => {
        const goodRecipe = { id: 'r1', name: 'Latte', beanName: 'Ethiopia', brewType: 'Espresso', basket: 'Double', grindSize: 12, strength: 2, createdAt: '2026-05-01T10:00:00.000Z' };
        const text = JSON.stringify({ shots: [validShot], recipes: [goodRecipe, { ...goodRecipe, id: 'r2', createdAt: 'nope' }] });
        const result = parseBackup(text);
        expect(result.recipes).toHaveLength(1);
        expect(result.recipes[0].createdAt).toBeInstanceOf(Date);
        expect(result.skipped.recipes).toBe(1);
    });
});

describe('buildCSV formula-injection safety', () => {
    const base: ShotLog = {
        id: '1', beanName: 'Ethiopia', brewType: 'Espresso', basket: 'Double',
        grindSize: 12, strength: 2, rating: 'Balanced', timestamp: new Date('2026-05-01T10:00:00Z'),
    };

    it('neutralizes a bean name that starts with a formula character', () => {
        expect(buildCSV([{ ...base, beanName: '=SUM(A1:A2)' }])).toContain(`"'=SUM(A1:A2)"`);
    });

    it('neutralizes notes starting with +, -, or @', () => {
        expect(buildCSV([{ ...base, notes: '+1' }])).toContain(`"'+1"`);
        expect(buildCSV([{ ...base, notes: '-1' }])).toContain(`"'-1"`);
        expect(buildCSV([{ ...base, notes: '@cmd' }])).toContain(`"'@cmd"`);
    });

    it('leaves ordinary text unprefixed', () => {
        const csv = buildCSV([{ ...base, beanName: 'Ethiopia', notes: 'tasty' }]);
        expect(csv).toContain('"Ethiopia"');
        expect(csv).not.toContain(`"'Ethiopia"`);
        expect(csv).toContain('"tasty"');
    });

    it('still escapes embedded double quotes', () => {
        expect(buildCSV([{ ...base, notes: 'say "hi"' }])).toContain(`"say ""hi"""`);
    });
});

describe('buildJSONBackup -> parseBackup round-trip', () => {
    it('preserves every collection a real export produces, with no entries skipped', () => {
        const shots: ShotLog[] = [{
            id: 's1', beanName: 'Ethiopia', brewType: 'Espresso', basket: 'Double',
            grindSize: 12, strength: 2, rating: 'Balanced', timestamp: new Date('2026-05-01T10:00:00Z'),
        }];
        const recipes: SavedRecipe[] = [{
            id: 'r1', name: 'Latte', beanName: 'Ethiopia', brewType: 'Espresso',
            basket: 'Double', grindSize: 12, strength: 2, createdAt: new Date('2026-05-01T10:00:00Z'),
        }];
        const beans: BeanProfile[] = [{
            id: 'b1', name: 'Ethiopia Yirgacheffe', isActive: true, createdAt: new Date('2026-05-01T10:00:00Z'),
        }];
        const favorites = { ethiopia: 's1' };
        const maintenance: MaintenanceEvent[] = [{ task: 'cleaning', performedAt: '2026-05-01T10:00:00.000Z', shotCountAtTime: 200 }];

        const result = parseBackup(buildJSONBackup(shots, recipes, beans, favorites, maintenance));

        expect(result.skipped).toEqual({ shots: 0, recipes: 0, beans: 0, maintenance: 0 });
        expect(result.shots[0].timestamp).toBeInstanceOf(Date);
        expect(result.recipes[0].createdAt).toBeInstanceOf(Date);
        expect(result.beans[0].createdAt).toBeInstanceOf(Date);
        expect(result.favorites).toEqual(favorites);
        expect(result.maintenance).toEqual(maintenance);
    });
});

describe('parseBackup bean inventory validation', () => {
    const validBean = { id: 'b1', name: 'Ethiopia', isActive: true, createdAt: '2026-05-01T10:00:00.000Z' };

    it('keeps numeric and absent inventory fields', () => {
        const text = JSON.stringify({ shots: [], beans: [
            { ...validBean, id: 'b1', bagSizeGrams: 250, pricePaid: 18 },
            { ...validBean, id: 'b2' },
        ] });
        const result = parseBackup(text);
        expect(result.beans.map((b: BeanProfile) => b.id)).toEqual(['b1', 'b2']);
        expect(result.skipped.beans).toBe(0);
    });

    it('drops a bean whose inventory field is non-numeric (no NaN in the UI)', () => {
        const text = JSON.stringify({ shots: [], beans: [
            validBean,
            { ...validBean, id: 'b2', bagSizeGrams: 'lots' },
        ] });
        const result = parseBackup(text);
        expect(result.beans.map((b: BeanProfile) => b.id)).toEqual(['b1']);
        expect(result.skipped.beans).toBe(1);
    });
});

describe('parseBackup maintenance and favorites validation', () => {
    const goodEvent = { task: 'cleaning', performedAt: '2026-05-01T10:00:00.000Z', shotCountAtTime: 200 };

    it('skips a maintenance event with an invalid performedAt and counts it', () => {
        const text = JSON.stringify({ shots: [validShot], maintenance: [goodEvent, { ...goodEvent, performedAt: 'nope' }] });
        const result = parseBackup(text);
        expect(result.maintenance).toHaveLength(1);
        expect(result.skipped.maintenance).toBe(1);
    });

    it('drops a null maintenance entry without throwing', () => {
        const text = JSON.stringify({ shots: [validShot], maintenance: [goodEvent, null] });
        const result = parseBackup(text);
        expect(result.maintenance).toHaveLength(1);
        expect(result.skipped.maintenance).toBe(1);
    });

    it('skips a maintenance event with an unknown task', () => {
        const text = JSON.stringify({ shots: [validShot], maintenance: [{ ...goodEvent, task: 'polishing' }] });
        const result = parseBackup(text);
        expect(result.maintenance).toHaveLength(0);
    });

    it('drops favorites entries whose value is not a string', () => {
        const text = JSON.stringify({ shots: [validShot], favorites: { ethiopia: 'shot-1', bad: 5 } });
        const result = parseBackup(text);
        expect(result.favorites).toEqual({ ethiopia: 'shot-1' });
    });
});
