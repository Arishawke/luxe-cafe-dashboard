import { describe, it, expect } from 'vitest';
import { filterShots } from './shots';
import type { ShotLog } from '../types';

const baseShot = (over: Partial<ShotLog>): ShotLog => ({
    id: 'a',
    beanName: 'Ethiopia Yirgacheffe',
    brewType: 'Espresso',
    basket: 'Double',
    grindSize: 12,
    strength: 2,
    rating: 'Balanced',
    timestamp: new Date('2026-05-01'),
    ...over,
});

describe('filterShots', () => {
    const shots: ShotLog[] = [
        baseShot({ id: '1', beanName: 'Ethiopia', notes: 'Bright and floral' }),
        baseShot({ id: '2', beanName: 'Colombia', notes: 'Chocolate finish' }),
        baseShot({ id: '3', beanName: 'Ethiopia', notes: undefined }),
    ];

    it('returns all shots when filters are empty', () => {
        expect(filterShots(shots, '', '')).toHaveLength(3);
    });

    it('filters by exact bean name', () => {
        const out = filterShots(shots, 'Ethiopia', '');
        expect(out.map(s => s.id)).toEqual(['1', '3']);
    });

    it('searches notes case-insensitively', () => {
        expect(filterShots(shots, '', 'CHOCOLATE').map(s => s.id)).toEqual(['2']);
    });

    it('treats shots with undefined notes as no match for a notes search', () => {
        expect(filterShots(shots, '', 'bright').map(s => s.id)).toEqual(['1']);
    });

    it('combines bean and notes filters', () => {
        expect(filterShots(shots, 'Ethiopia', 'floral').map(s => s.id)).toEqual(['1']);
    });
});
