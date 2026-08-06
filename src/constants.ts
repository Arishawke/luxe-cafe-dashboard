import type { Rating, BrewType, Basket, Temperature, Strength, MilkType, MilkStyle, ProcessMethod, RoastLevel } from './types';

export const RATINGS: Rating[] = ['Very Sour', 'Sour', 'Balanced', 'Bitter', 'Very Bitter'];

// CSS custom properties so inline styles re-skin across all six themes
export const RATING_COLORS: Record<Rating, string> = {
    'Very Sour': 'var(--color-very-sour)',
    'Sour': 'var(--color-sour)',
    'Balanced': 'var(--color-balanced)',
    'Bitter': 'var(--color-bitter)',
    'Very Bitter': 'var(--color-very-bitter)',
};

export const BREW_TYPES: BrewType[] = ['Espresso', 'Drip Coffee', 'Cold Brew', 'Cold Pressed', 'Over Ice'];
export const BASKETS: Basket[] = ['Single', 'Double', 'Luxe'];
export const TEMPERATURES: Temperature[] = ['Low', 'Med', 'High'];
export const STRENGTHS: { value: Strength; label: string }[] = [
    { value: 1, label: '1 Mild' },
    { value: 2, label: '2 Classic' },
    { value: 3, label: '3 Rich' },
];
export const MILK_TYPES: MilkType[] = ['Dairy', 'Plant'];
export const MILK_STYLES: MilkStyle[] = ['Steamed', 'Thin', 'Thick', 'Extra-Thick', 'Cold Foam'];
export const PROCESS_METHODS: ProcessMethod[] = ['Washed', 'Natural', 'Honey', 'Anaerobic', 'Other'];
export const ROAST_LEVELS: RoastLevel[] = ['Light', 'Medium', 'Medium-Dark', 'Dark'];

export const BALANCED_RATING_INDEX = 2;
