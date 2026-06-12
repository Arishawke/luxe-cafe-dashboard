import type { Rating, Temperature, ShotLog } from '../types';

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
}

export function getSuggestedSettings(lastShot: ShotLog | null | undefined): SuggestedSettings | null {
    if (!lastShot || !lastShot.rating) return null;

    const currentGrind = lastShot.grindSize;
    const currentTemp = lastShot.temperature || 'Med';
    const rating = lastShot.rating;

    const tempOrder: Temperature[] = ['Low', 'Med', 'High'];
    const tempIndex = tempOrder.indexOf(currentTemp);

    let suggestedGrind = currentGrind;
    let suggestedTemp = currentTemp;
    let adjustmentType: 'grind' | 'temp' | 'both' = 'grind';

    switch (rating) {
        case 'Very Sour':
            suggestedGrind = Math.max(1, currentGrind - 3);
            if (tempIndex < 2) suggestedTemp = tempOrder[tempIndex + 1];
            adjustmentType = 'both';
            break;
        case 'Sour':
            suggestedGrind = Math.max(1, currentGrind - 1);
            adjustmentType = 'grind';
            break;
        case 'Balanced':
            return null;
        case 'Bitter':
            suggestedGrind = Math.min(25, currentGrind + 1);
            adjustmentType = 'grind';
            break;
        case 'Very Bitter':
            suggestedGrind = Math.min(25, currentGrind + 3);
            if (tempIndex > 0) suggestedTemp = tempOrder[tempIndex - 1];
            adjustmentType = 'both';
            break;
    }

    return {
        grindSize: suggestedGrind,
        temperature: suggestedTemp as Temperature,
        adjustmentType,
        grindDiff: suggestedGrind - currentGrind,
    };
}
