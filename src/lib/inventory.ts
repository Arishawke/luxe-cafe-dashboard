import type { BeanProfile, ShotLog } from '../types';

// A typical double dose; used to estimate consumption when a shot did not
// record its own dose, and to convert grams-left into shots-left.
export const DEFAULT_DOSE_G = 18;

export interface BeanInventory {
    bagSizeGrams: number;
    gramsUsed: number;
    gramsLeft: number;
    shotsLeft: number;
    costPerShot: number | null;
    isLow: boolean; // running low: some left, under 100g
    isEmpty: boolean; // depleted
}

// Returns null when the bean has no bag size recorded (inventory is opt-in).
export function getBeanInventory(bean: BeanProfile, shots: ShotLog[]): BeanInventory | null {
    if (!bean.bagSizeGrams || bean.bagSizeGrams <= 0) return null;

    const key = bean.name.toLowerCase();
    const gramsUsed = shots
        .filter(s => s.beanName.toLowerCase() === key)
        .reduce((sum, s) => sum + (s.doseIn && s.doseIn > 0 ? s.doseIn : DEFAULT_DOSE_G), 0);

    const gramsLeft = Math.max(0, bean.bagSizeGrams - gramsUsed);
    const shotsLeft = Math.floor(gramsLeft / DEFAULT_DOSE_G);
    const costPerShot = bean.pricePaid && bean.pricePaid > 0
        ? (bean.pricePaid / bean.bagSizeGrams) * DEFAULT_DOSE_G
        : null;

    return {
        bagSizeGrams: bean.bagSizeGrams,
        gramsUsed: Math.round(gramsUsed * 10) / 10,
        gramsLeft: Math.round(gramsLeft * 10) / 10,
        shotsLeft,
        costPerShot: costPerShot != null ? Math.round(costPerShot * 100) / 100 : null,
        isLow: gramsLeft > 0 && gramsLeft < 100,
        isEmpty: gramsLeft <= 0,
    };
}
