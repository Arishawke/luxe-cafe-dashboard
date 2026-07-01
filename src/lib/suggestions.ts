import type { Rating, Temperature, ShotLog, BrewType } from '../types';

// Espresso pulls have a meaningful shot time to reason about; other brews do not.
const ESPRESSO_STYLE_BREWS: BrewType[] = ['Espresso', 'Cold Pressed'];
// Target espresso window in seconds. Faster than MIN reads as under-extracted
// flow, slower than MAX as over-extracted.
const TIME_TARGET_MIN = 25;
const TIME_TARGET_MAX = 32;

export function getBaristaTip(rating: Rating): { message: string; adjustment: 'large' | 'small' | 'none' } {
    switch (rating) {
        case 'Very Sour':
            return { message: 'Heavily under-extracted. Grind significantly finer (2-3 steps) or increase temperature.', adjustment: 'large' };
        case 'Sour':
            return { message: 'Slightly under-extracted. Grind a bit finer (1 step) or try a higher temperature.', adjustment: 'small' };
        case 'Balanced':
            return { message: 'Perfect extraction! Save these settings for this bean.', adjustment: 'none' };
        case 'Bitter':
            return { message: 'Slightly over-extracted. Grind a bit coarser (1 step) or try a lower temperature.', adjustment: 'small' };
        case 'Very Bitter':
            return { message: 'Heavily over-extracted. Grind significantly coarser (2-3 steps) or decrease temperature.', adjustment: 'large' };
    }
}

export interface SuggestedSettings {
    grindSize: number;
    temperature: Temperature;
    adjustmentType: 'grind' | 'temp' | 'both';
    grindDiff: number;
    reason?: string; // set when extraction time drove the lever choice
}

const TEMP_ORDER: Temperature[] = ['Low', 'Med', 'High'];
const GRIND_STEP: Record<Exclude<Rating, 'Balanced'>, number> = {
    'Very Sour': -3,
    'Sour': -1,
    'Bitter': 1,
    'Very Bitter': 3,
};

export function getSuggestedSettings(lastShot: ShotLog | null | undefined): SuggestedSettings | null {
    if (!lastShot || !lastShot.rating || lastShot.rating === 'Balanced') return null;

    const rating = lastShot.rating;
    const currentGrind = lastShot.grindSize;
    const currentTemp = lastShot.temperature || 'Med';
    const tempIndex = TEMP_ORDER.indexOf(currentTemp);
    const isUnderExtracted = rating === 'Very Sour' || rating === 'Sour';

    const grindLever = (reason?: string): SuggestedSettings => {
        const grindSize = Math.max(1, Math.min(25, currentGrind + GRIND_STEP[rating]));
        return { grindSize, temperature: currentTemp, adjustmentType: 'grind', grindDiff: grindSize - currentGrind, reason };
    };
    const tempLever = (dir: 1 | -1, reason: string, maxedReason: string): SuggestedSettings => {
        const nextIndex = tempIndex + dir;
        if (nextIndex < 0 || nextIndex > 2) return grindLever(maxedReason); // no headroom, fall back to grind
        return { grindSize: currentGrind, temperature: TEMP_ORDER[nextIndex], adjustmentType: 'temp', grindDiff: 0, reason };
    };

    // Time-aware path: on an espresso pull with a recorded time, let the flow
    // rate pick the lever instead of taste alone.
    const time = lastShot.extractionTime;
    if (ESPRESSO_STYLE_BREWS.includes(lastShot.brewType) && typeof time === 'number') {
        if (isUnderExtracted) {
            if (time < TIME_TARGET_MIN) {
                return grindLever(`Ran fast (${time}s) and tasted sour, so grind finer to slow the shot.`);
            }
            return tempLever(
                1,
                `Sour, but the ${time}s pull was on target, so raise temperature instead of grinding finer.`,
                `Sour with the temperature already maxed, so grind finer instead.`,
            );
        }
        if (time > TIME_TARGET_MAX) {
            return grindLever(`Ran long (${time}s) and tasted bitter, so grind coarser to speed it up.`);
        }
        return tempLever(
            -1,
            `Bitter, but the ${time}s pull was not long, so lower temperature instead of grinding coarser.`,
            `Bitter with the temperature already at its lowest, so grind coarser instead.`,
        );
    }

    // Rating-only path (no time, or a non-espresso brew): unchanged behavior.
    const grindSize = Math.max(1, Math.min(25, currentGrind + GRIND_STEP[rating]));
    const wantsTempShift = rating === 'Very Sour' || rating === 'Very Bitter';
    let temperature = currentTemp;
    if (wantsTempShift) {
        if (isUnderExtracted && tempIndex < 2) temperature = TEMP_ORDER[tempIndex + 1];
        if (!isUnderExtracted && tempIndex > 0) temperature = TEMP_ORDER[tempIndex - 1];
    }
    return {
        grindSize,
        temperature,
        adjustmentType: wantsTempShift ? 'both' : 'grind',
        grindDiff: grindSize - currentGrind,
    };
}
