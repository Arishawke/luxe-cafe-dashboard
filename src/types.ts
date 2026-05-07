export type ThemeType = 'dark' | 'light' | 'catppuccin' | 'rosepine' | 'rosepine-moon';

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
  notes?: string; // Add-ins / Notes
  extractionTime?: number; // Shot timer in seconds
  doseIn?: number; // Grams of coffee in
  doseOut?: number; // Grams of espresso out (yield)
  timestamp: Date;
  isFavorite?: boolean; // Starred as favorite for this bean
}

// Favorites storage: maps lowercase bean name to shot ID
export interface FavoritesMap {
  [beanName: string]: string; // shot ID
}

// Saved Recipe - stores all settings for quick recall
export interface SavedRecipe {
  id: string;
  name: string;
  beanName: string;
  brewType: BrewType;
  basket: Basket;
  grindSize: number;
  temperature?: Temperature;
  strength: Strength;
  milk?: MilkSettings;
  notes?: string;
  createdAt: Date;
}

// Bean Profile - stores bean metadata
export type ProcessMethod = 'Washed' | 'Natural' | 'Honey' | 'Anaerobic' | 'Other';
export type RoastLevel = 'Light' | 'Medium' | 'Medium-Dark' | 'Dark';

export interface BeanProfile {
  id: string;
  name: string;
  roaster?: string;
  origin?: string;
  roastLevel?: RoastLevel;
  processMethod?: ProcessMethod;
  roastDate?: string; // ISO date string
  flavorNotes?: string;
  isActive: boolean; // Currently in rotation
  createdAt: Date;
}

