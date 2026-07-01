export type ThemeType = 'dark' | 'light' | 'catppuccin' | 'rosepine' | 'rosepine-moon' | 'fadetouched';

export type Basket = 'Single' | 'Double' | 'Luxe';
export type Temperature = 'Low' | 'Med' | 'High';
export type Strength = 1 | 2 | 3;

export type Rating = 'Very Sour' | 'Sour' | 'Balanced' | 'Bitter' | 'Very Bitter';

export type BrewType = 'Espresso' | 'Drip Coffee' | 'Cold Brew' | 'Cold Pressed' | 'Over Ice';

export const COLD_BREW_TYPES: BrewType[] = ['Cold Brew', 'Cold Pressed', 'Over Ice']; // skip temperature

export type MilkType = 'Dairy' | 'Plant';
export type MilkStyle = 'Steamed' | 'Thin' | 'Thick' | 'Extra-Thick' | 'Cold Foam';

export interface MilkSettings {
  type: MilkType;
  style: MilkStyle;
}

export interface ShotLog {
  id: string;
  beanName: string;
  brewType: BrewType;
  basket: Basket;
  grindSize: number; // 1 fine, 25 coarse
  temperature?: Temperature;
  strength: Strength;
  rating?: Rating; // omitted when logged without tasting yet
  milk?: MilkSettings;
  notes?: string;
  extractionTime?: number; // seconds
  doseIn?: number; // grams in
  doseOut?: number; // grams out
  timestamp: Date;
  isFavorite?: boolean;
}

export interface FavoritesMap {
  [beanName: string]: string; // lowercase bean name -> shot id
}

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

export type ProcessMethod = 'Washed' | 'Natural' | 'Honey' | 'Anaerobic' | 'Other';
export type RoastLevel = 'Light' | 'Medium' | 'Medium-Dark' | 'Dark';

export interface BeanProfile {
  id: string;
  name: string;
  roaster?: string;
  origin?: string;
  roastLevel?: RoastLevel;
  processMethod?: ProcessMethod;
  roastDate?: string; // ISO date
  flavorNotes?: string;
  bagSizeGrams?: number; // for inventory + cost-per-shot
  pricePaid?: number; // in the user's own currency
  isActive: boolean;
  createdAt: Date;
}

export type MaintenanceTask = 'cleaning' | 'descaling';

export interface MaintenanceEvent {
  task: MaintenanceTask;
  performedAt: string; // ISO date
  shotCountAtTime: number;
}

export interface MaintenanceAlert {
  task: MaintenanceTask;
  variant: 'approaching' | 'due' | 'overdue';
  label: string;
  text: string;
}

