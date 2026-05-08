import type { Rating } from '../types';

export const RATING_COLOR_CLASS: Record<Rating, string> = {
    'Very Sour': 'very-sour',
    'Sour': 'sour',
    'Balanced': 'balanced',
    'Bitter': 'bitter',
    'Very Bitter': 'very-bitter',
};
