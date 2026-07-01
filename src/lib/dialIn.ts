import type { BrewType, ShotLog, Rating } from '../types';
import { RATINGS, BALANCED_RATING_INDEX } from '../constants';

// Ratio labels apply to espresso-style pulls only.
const ESPRESSO_STYLE_BREWS: BrewType[] = ['Espresso', 'Cold Pressed'];

// Ratio r = doseOut / doseIn. Below RISTRETTO_MAX is restricted, above
// LUNGO_MIN is long, the band between is a normal shot.
const RISTRETTO_MAX = 1.6;
const LUNGO_MIN = 2.4;

export type RatioLabel = 'Ristretto' | 'Normale' | 'Lungo';

export function getRatioLabel(
    doseIn: number | undefined,
    doseOut: number | undefined,
    brewType: BrewType,
): RatioLabel | null {
    if (!ESPRESSO_STYLE_BREWS.includes(brewType)) return null;
    if (!doseIn || doseIn <= 0 || !doseOut) return null;

    const ratio = doseOut / doseIn;
    if (ratio < RISTRETTO_MAX) return 'Ristretto';
    if (ratio > LUNGO_MIN) return 'Lungo';
    return 'Normale';
}

function matchesBean(shot: ShotLog, beanName: string): boolean {
    return shot.beanName.trim().toLowerCase() === beanName.trim().toLowerCase();
}

// How far a taste rating sits from Balanced. Smaller is better.
function distanceFromBalanced(rating: Rating): number {
    return Math.abs(RATINGS.indexOf(rating) - BALANCED_RATING_INDEX);
}

// The shot to repeat for this bean: closest to Balanced, most recent wins ties.
export function getBestDialIn(beanName: string, shots: ShotLog[]): ShotLog | null {
    const rated = shots.filter((s) => matchesBean(s, beanName) && s.rating);
    if (rated.length === 0) return null;

    return rated.reduce((best, s) => {
        const d = distanceFromBalanced(s.rating!);
        const bestD = distanceFromBalanced(best.rating!);
        if (d < bestD) return s;
        if (d === bestD && s.timestamp.getTime() > best.timestamp.getTime()) return s;
        return best;
    });
}

export interface ProgressionPoint {
    grindSize: number;
    rating?: Rating;
    timestamp: Date;
}

// This bean's shots oldest to newest, capped to the most recent `limit`.
export function getDialInProgression(
    beanName: string,
    shots: ShotLog[],
    limit = 12,
): ProgressionPoint[] {
    return shots
        .filter((s) => matchesBean(s, beanName))
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        .slice(-limit)
        .map((s) => ({ grindSize: s.grindSize, rating: s.rating, timestamp: s.timestamp }));
}
