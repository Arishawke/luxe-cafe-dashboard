export type Basket = 'Single' | 'Double' | 'Luxe';
export type Temperature = 'Low' | 'Med' | 'High';
export type Strength = 1 | 2 | 3;

// Expanded 5-point rating scale
export type Rating = 'Very Sour' | 'Sour' | 'Balanced' | 'Bitter' | 'Very Bitter';

// Brew types
export type BrewType = 'Espresso' | 'Drip Coffee' | 'Cold Brew' | 'Cold Pressed' | 'Over Ice';

// Cold brew types that don't need temperature control
export const COLD_BREW_TYPES: BrewType[] = ['Cold Brew', 'Cold Pressed', 'Over Ice'];

// Milk settings
export type MilkType = 'Dairy' | 'Plant';
export type MilkStyle = 'Steamed' | 'Thin' | 'Thick' | 'Cold Foam';

export interface MilkSettings {
  type: MilkType;
  style: MilkStyle;
}

export interface ShotLog {
  id: string;
  beanName: string;
  brewType: BrewType;
  basket: Basket;
  grindSize: number; // 1 (Fine) to 25 (Coarse)
  temperature?: Temperature; // Optional for cold brews
  strength: Strength;
  rating: Rating;
  milk?: MilkSettings; // Optional milk settings
  timestamp: Date;
}
