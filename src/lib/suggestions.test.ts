import { describe, it, expect } from 'vitest';
import { getBaristaTip, getSuggestedSettings } from './suggestions';
import type { ShotLog, Rating, Temperature } from '../types';

const shot = (rating: Rating, grindSize: number, temperature: Temperature = 'Med'): ShotLog => ({
    id: '1',
    beanName: 'Ethiopia',
    brewType: 'Espresso',
    basket: 'Double',
    grindSize,
    temperature,
    strength: 2,
    rating,
    timestamp: new Date(),
});

describe('getBaristaTip', () => {
    it('returns large adjustment for Very Sour', () => {
        expect(getBaristaTip('Very Sour').adjustment).toBe('large');
    });

    it('returns small adjustment for Sour', () => {
        expect(getBaristaTip('Sour').adjustment).toBe('small');
    });

    it('returns no adjustment for Balanced', () => {
        const tip = getBaristaTip('Balanced');
        expect(tip.adjustment).toBe('none');
        expect(tip.message).toMatch(/Perfect/);
    });

    it('returns small adjustment for Bitter', () => {
        expect(getBaristaTip('Bitter').adjustment).toBe('small');
    });

    it('returns large adjustment for Very Bitter', () => {
        expect(getBaristaTip('Very Bitter').adjustment).toBe('large');
    });
});

describe('getSuggestedSettings', () => {
    it('returns null when there is no last shot', () => {
        expect(getSuggestedSettings(null)).toBeNull();
        expect(getSuggestedSettings(undefined)).toBeNull();
    });

    it('returns null when the last shot has no rating yet', () => {
        // A logged-but-untasted shot carries no taste signal, so there is
        // nothing to dial toward; the UI prompts to rate it instead.
        expect(getSuggestedSettings({ ...shot('Balanced', 12), rating: undefined })).toBeNull();
    });

    it('returns null for a Balanced last shot', () => {
        expect(getSuggestedSettings(shot('Balanced', 12))).toBeNull();
    });

    it('Very Sour drops grind by 3 and raises temperature', () => {
        const out = getSuggestedSettings(shot('Very Sour', 12, 'Med'));
        expect(out).toEqual({
            grindSize: 9,
            temperature: 'High',
            adjustmentType: 'both',
            grindDiff: -3,
        });
    });

    it('Sour drops grind by 1 and keeps temperature', () => {
        const out = getSuggestedSettings(shot('Sour', 12, 'Med'));
        expect(out?.grindSize).toBe(11);
        expect(out?.temperature).toBe('Med');
        expect(out?.adjustmentType).toBe('grind');
    });

    it('Bitter raises grind by 1', () => {
        const out = getSuggestedSettings(shot('Bitter', 12, 'Med'));
        expect(out?.grindSize).toBe(13);
        expect(out?.adjustmentType).toBe('grind');
    });

    it('Very Bitter raises grind by 3 and lowers temperature', () => {
        const out = getSuggestedSettings(shot('Very Bitter', 12, 'High'));
        expect(out).toEqual({
            grindSize: 15,
            temperature: 'Med',
            adjustmentType: 'both',
            grindDiff: 3,
        });
    });

    it('clamps grind to floor of 1 for Very Sour at minimum', () => {
        const out = getSuggestedSettings(shot('Very Sour', 2, 'Med'));
        expect(out?.grindSize).toBe(1);
    });

    it('clamps grind to ceiling of 25 for Very Bitter at maximum', () => {
        const out = getSuggestedSettings(shot('Very Bitter', 24, 'Med'));
        expect(out?.grindSize).toBe(25);
    });

    it('does not raise temperature above High for Very Sour', () => {
        const out = getSuggestedSettings(shot('Very Sour', 12, 'High'));
        expect(out?.temperature).toBe('High');
    });

    it('does not lower temperature below Low for Very Bitter', () => {
        const out = getSuggestedSettings(shot('Very Bitter', 12, 'Low'));
        expect(out?.temperature).toBe('Low');
    });

    it('defaults missing temperature to Med', () => {
        const out = getSuggestedSettings({ ...shot('Very Sour', 12, 'Med'), temperature: undefined });
        expect(out?.temperature).toBe('High');
    });
});
