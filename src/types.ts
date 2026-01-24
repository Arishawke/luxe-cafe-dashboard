export type Basket = 'Single' | 'Double' | 'Luxe';
export type Temperature = 'Low' | 'Med' | 'High';
export type Strength = 1 | 2 | 3;
export type Rating = 'Sour' | 'Balanced' | 'Bitter';

export interface ShotLog {
  id: string;
  beanName: string;
  basket: Basket;
  grindSize: number; // 1 (Fine) to 25 (Coarse)
  temperature: Temperature;
  strength: Strength;
  rating: Rating;
  timestamp: Date;
}
