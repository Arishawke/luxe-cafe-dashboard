import type { ShotLog } from '../types';

const CAFFEINE_MG: Record<string, number> = { 'Single': 32, 'Double': 63, 'Luxe': 80 };
const SHOTS_PER_BASKET: Record<string, number> = { 'Single': 1, 'Double': 2, 'Luxe': 4 };

export const DAILY_LIMIT = 400; // mg

export type CaffeineStatus = 'low' | 'moderate' | 'high';

export interface CaffeineStats {
    todayCaffeine: number;
    todayShotCount: number;
    avgDaily: number;
    weekShotCount: number;
    percentage: number;
    status: CaffeineStatus;
    statusText: string;
    dailyLimit: number;
}

export function computeCaffeine(shots: ShotLog[]): CaffeineStats {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayShots = shots.filter(s => {
        const shotDate = new Date(s.timestamp);
        shotDate.setHours(0, 0, 0, 0);
        return shotDate.getTime() === today.getTime();
    });

    const todayCaffeine = todayShots.reduce((sum, s) =>
        sum + (CAFFEINE_MG[s.basket] || 63), 0);
    const todayShotCount = todayShots.reduce((sum, s) =>
        sum + (SHOTS_PER_BASKET[s.basket] || 2), 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekShots = shots.filter(s => {
        const shotDate = new Date(s.timestamp);
        return shotDate >= weekAgo;
    });

    const weekCaffeine = weekShots.reduce((sum, s) =>
        sum + (CAFFEINE_MG[s.basket] || 63), 0);
    const avgDaily = Math.round(weekCaffeine / 7);
    const weekShotCount = weekShots.reduce((sum, s) =>
        sum + (SHOTS_PER_BASKET[s.basket] || 2), 0);

    const percentage = Math.min((todayCaffeine / DAILY_LIMIT) * 100, 100);

    let status: CaffeineStatus = 'low';
    let statusText = 'Feeling fresh';
    if (todayCaffeine > 300) {
        status = 'high';
        statusText = 'Consider slowing down';
    } else if (todayCaffeine > 200) {
        status = 'moderate';
        statusText = 'Nicely caffeinated';
    } else if (todayCaffeine > 0) {
        status = 'low';
        statusText = 'Room for more';
    }

    return {
        todayCaffeine,
        todayShotCount,
        avgDaily,
        weekShotCount,
        percentage,
        status,
        statusText,
        dailyLimit: DAILY_LIMIT,
    };
}
