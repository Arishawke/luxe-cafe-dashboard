import { describe, it, expect } from 'vitest';
import { getBeanInventory, DEFAULT_DOSE_G } from './inventory';
import type { BeanProfile, ShotLog } from '../types';

const bean = (over: Partial<BeanProfile> = {}): BeanProfile => ({
    id: 'b1',
    name: 'Ethiopia',
    isActive: true,
    createdAt: new Date(),
    ...over,
});

const shot = (over: Partial<ShotLog> = {}): ShotLog => ({
    id: Math.random().toString(),
    beanName: 'Ethiopia',
    brewType: 'Espresso',
    basket: 'Double',
    grindSize: 12,
    strength: 2,
    rating: 'Balanced',
    timestamp: new Date(),
    ...over,
});

describe('getBeanInventory', () => {
    it('returns null when no bag size is recorded (inventory is opt-in)', () => {
        expect(getBeanInventory(bean(), [shot()])).toBeNull();
    });

    it('subtracts each shot dose, defaulting to a standard dose when missing', () => {
        // One 20g shot + one dose-less shot (counts as DEFAULT_DOSE_G).
        const inv = getBeanInventory(bean({ bagSizeGrams: 250 }), [
            shot({ doseIn: 20 }),
            shot({ doseIn: undefined }),
        ]);
        expect(inv?.gramsUsed).toBe(20 + DEFAULT_DOSE_G);
        expect(inv?.gramsLeft).toBe(250 - 20 - DEFAULT_DOSE_G);
    });

    it('only counts shots of the same bean (case-insensitive)', () => {
        const inv = getBeanInventory(bean({ name: 'Ethiopia', bagSizeGrams: 100 }), [
            shot({ beanName: 'ethiopia', doseIn: 18 }),
            shot({ beanName: 'Colombia', doseIn: 18 }),
        ]);
        expect(inv?.gramsUsed).toBe(18);
    });

    it('floors grams-left at zero and flags an empty bag', () => {
        const inv = getBeanInventory(bean({ bagSizeGrams: 30 }), [shot({ doseIn: 18 }), shot({ doseIn: 18 })]);
        expect(inv?.gramsLeft).toBe(0);
        expect(inv?.isEmpty).toBe(true);
        expect(inv?.shotsLeft).toBe(0);
    });

    it('flags a low bag under 100g while some remains', () => {
        const inv = getBeanInventory(bean({ bagSizeGrams: 120 }), [shot({ doseIn: 40 })]);
        expect(inv?.gramsLeft).toBe(80);
        expect(inv?.isLow).toBe(true);
        expect(inv?.isEmpty).toBe(false);
    });

    it('derives cost per shot from price and bag size, null without a price', () => {
        // $20 for 250g => $0.08/g => 18g shot => $1.44
        const priced = getBeanInventory(bean({ bagSizeGrams: 250, pricePaid: 20 }), []);
        expect(priced?.costPerShot).toBe(1.44);
        const unpriced = getBeanInventory(bean({ bagSizeGrams: 250 }), []);
        expect(unpriced?.costPerShot).toBeNull();
    });
});
