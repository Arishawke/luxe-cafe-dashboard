// Configuration constants - Extracted from App.tsx for better organization
import type { Rating, BrewType, Basket, Temperature, Strength, MilkType, MilkStyle, ProcessMethod, RoastLevel } from './types';

// Rating config
export const RATINGS: Rating[] = ['Very Sour', 'Sour', 'Balanced', 'Bitter', 'Very Bitter'];

export const RATING_COLORS: Record<Rating, string> = {
    'Very Sour': '#E8A045',
    'Sour': '#D4915C',
    'Balanced': '#7A9E6D',
    'Bitter': '#B85C5C',
    'Very Bitter': '#C04545',
};

// Options for selectors
export const BREW_TYPES: BrewType[] = ['Espresso', 'Drip Coffee', 'Cold Brew', 'Cold Pressed', 'Over Ice'];
export const BASKETS: Basket[] = ['Double', 'Luxe'];
export const TEMPERATURES: Temperature[] = ['Low', 'Med', 'High'];
export const STRENGTHS: { value: Strength; label: string }[] = [
    { value: 1, label: '1 Mild' },
    { value: 2, label: '2 Classic' },
    { value: 3, label: '3 Rich' },
];
export const MILK_TYPES: MilkType[] = ['Dairy', 'Plant'];
export const MILK_STYLES: MilkStyle[] = ['Steamed', 'Thin', 'Thick', 'Cold Foam'];
export const PROCESS_METHODS: ProcessMethod[] = ['Washed', 'Natural', 'Honey', 'Anaerobic', 'Other'];
export const ROAST_LEVELS: RoastLevel[] = ['Light', 'Medium', 'Medium-Dark', 'Dark'];
