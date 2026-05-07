import type { ShotLog } from './types';

export function getUniqueBeans(shots: ShotLog[]): string[] {
    const unique = new Set(shots.map(s => s.beanName));
    return Array.from(unique).sort();
}
