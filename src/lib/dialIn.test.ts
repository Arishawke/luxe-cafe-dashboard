import { describe, it, expect } from 'vitest';
import { getRatioLabel, getBestDialIn, getDialInProgression } from './dialIn';
import type { ShotLog, Rating } from '../types';

function shot(overrides: Partial<ShotLog> & { id: string }): ShotLog {
    return {
        beanName: 'Ethiopia',
        brewType: 'Espresso',
        basket: 'Double',
        grindSize: 12,
        strength: 2,
        timestamp: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    };
}

// Ratio label only means something for espresso-style pulls, where the
// dose-out to dose-in ratio names the shot: restricted, normal, or long.
describe('getRatioLabel', () => {
    it('labels a short ratio as Ristretto', () => {
        expect(getRatioLabel(18, 27, 'Espresso')).toBe('Ristretto'); // 1:1.5
    });

    it('labels an around-1:2 ratio as Normale', () => {
        expect(getRatioLabel(18, 32.4, 'Espresso')).toBe('Normale'); // 1:1.8
    });

    it('labels a long ratio as Lungo', () => {
        expect(getRatioLabel(18, 45, 'Espresso')).toBe('Lungo'); // 1:2.5
    });

    it('treats 1.6 as the Ristretto/Normale boundary (inclusive Normale)', () => {
        expect(getRatioLabel(100, 159, 'Espresso')).toBe('Ristretto'); // 1.59
        expect(getRatioLabel(10, 16, 'Espresso')).toBe('Normale'); // 1.60
    });

    it('treats 2.4 as the Normale/Lungo boundary (inclusive Normale)', () => {
        expect(getRatioLabel(10, 24, 'Espresso')).toBe('Normale'); // 2.40
        expect(getRatioLabel(100, 241, 'Espresso')).toBe('Lungo'); // 2.41
    });

    it('applies to Cold Pressed espresso too', () => {
        expect(getRatioLabel(18, 27, 'Cold Pressed')).toBe('Ristretto');
    });

    it('returns null for non-espresso brews where ratio is meaningless', () => {
        expect(getRatioLabel(18, 27, 'Drip Coffee')).toBeNull();
        expect(getRatioLabel(18, 27, 'Cold Brew')).toBeNull();
        expect(getRatioLabel(18, 27, 'Over Ice')).toBeNull();
    });

    it('returns null when dose data is missing or zero', () => {
        expect(getRatioLabel(undefined, 27, 'Espresso')).toBeNull();
        expect(getRatioLabel(18, undefined, 'Espresso')).toBeNull();
        expect(getRatioLabel(0, 27, 'Espresso')).toBeNull();
    });
});

// The best dial-in is the shot the user should repeat: the one whose taste
// landed closest to Balanced, breaking ties toward the most recent try.
describe('getBestDialIn', () => {
    const rated = (id: string, rating: Rating, grindSize: number): ShotLog =>
        shot({ id, rating, grindSize });

    it('prefers the Balanced shot over sour or bitter ones', () => {
        const shots = [
            rated('a', 'Sour', 10),
            rated('b', 'Balanced', 14),
            rated('c', 'Bitter', 18),
        ];
        expect(getBestDialIn('Ethiopia', shots)?.id).toBe('b');
    });

    it('picks the closest-to-Balanced when none are Balanced', () => {
        const shots = [rated('a', 'Very Sour', 8), rated('b', 'Bitter', 16)];
        expect(getBestDialIn('Ethiopia', shots)?.id).toBe('b'); // Bitter is 1 step off, Very Sour is 2
    });

    it('breaks ties toward the most recent shot', () => {
        const shots = [
            shot({ id: 'old', rating: 'Balanced', timestamp: new Date('2026-01-01T00:00:00Z') }),
            shot({ id: 'new', rating: 'Balanced', timestamp: new Date('2026-03-01T00:00:00Z') }),
        ];
        expect(getBestDialIn('Ethiopia', shots)?.id).toBe('new');
    });

    it('returns null when the bean has no rated shots', () => {
        const shots = [shot({ id: 'a', rating: undefined })];
        expect(getBestDialIn('Ethiopia', shots)).toBeNull();
    });

    it('ignores shots from other beans', () => {
        const shots = [
            shot({ id: 'other', beanName: 'Colombia', rating: 'Balanced' }),
            shot({ id: 'mine', beanName: 'Ethiopia', rating: 'Sour' }),
        ];
        expect(getBestDialIn('Ethiopia', shots)?.id).toBe('mine');
    });

    it('matches the bean name case-insensitively', () => {
        const shots = [shot({ id: 'a', beanName: 'ethiopia', rating: 'Balanced' })];
        expect(getBestDialIn('Ethiopia', shots)?.id).toBe('a');
    });
});

// The progression feeds the sparkline: this bean's shots oldest to newest.
describe('getDialInProgression', () => {
    it('returns the bean shots in chronological order', () => {
        const shots = [
            shot({ id: 'b', grindSize: 14, timestamp: new Date('2026-02-01T00:00:00Z') }),
            shot({ id: 'a', grindSize: 12, timestamp: new Date('2026-01-01T00:00:00Z') }),
        ];
        const out = getDialInProgression('Ethiopia', shots);
        expect(out.map((p) => p.grindSize)).toEqual([12, 14]);
    });

    it('keeps only the most recent shots up to the limit, still chronological', () => {
        const shots = [1, 2, 3, 4].map((n) =>
            shot({ id: `s${n}`, grindSize: n, timestamp: new Date(`2026-0${n}-01T00:00:00Z`) }),
        );
        const out = getDialInProgression('Ethiopia', shots, 2);
        expect(out.map((p) => p.grindSize)).toEqual([3, 4]);
    });

    it('includes unrated shots with an undefined rating', () => {
        const shots = [shot({ id: 'a', rating: undefined, grindSize: 10 })];
        const out = getDialInProgression('Ethiopia', shots);
        expect(out).toEqual([{ grindSize: 10, rating: undefined, timestamp: shots[0].timestamp }]);
    });

    it('ignores shots from other beans', () => {
        const shots = [
            shot({ id: 'a', beanName: 'Colombia' }),
            shot({ id: 'b', beanName: 'Ethiopia' }),
        ];
        expect(getDialInProgression('Ethiopia', shots)).toHaveLength(1);
    });
});
