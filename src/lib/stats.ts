import type { ShotLog, Rating } from '../types';
import { RATINGS } from '../constants';

export interface DayStat {
    date: string;
    balanced: number;
    total: number;
}

export interface ShotStats {
    totalShots: number;
    ratedShots: number;
    ratingCounts: Record<Rating, number>;
    maxRatingCount: number;
    topBeans: [string, number][];
    maxBeanCount: number;
    avgGrind: number | null;
    successRate: number;
    shotsThisWeek: number;
    days: DayStat[];
    maxDayTotal: number;
    hasWeekData: boolean;
    brewEntries: [string, number][];
    maxBrewCount: number;
    showBrewBreakdown: boolean;
}

export function computeStats(shots: ShotLog[]): ShotStats {
    const totalShots = shots.length;

    const ratingCounts = RATINGS.reduce((acc, r) => {
        acc[r] = shots.filter(s => s.rating === r).length;
        return acc;
    }, {} as Record<Rating, number>);
    const maxRatingCount = Math.max(...Object.values(ratingCounts), 1);

    const beanCounts = shots.reduce((acc, s) => {
        acc[s.beanName] = (acc[s.beanName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const topBeans = Object.entries(beanCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    const maxBeanCount = Math.max(...topBeans.map(([, c]) => c), 1);

    const ratedShots = shots.filter(s => s.rating).length;

    const balancedShots = shots.filter(s => s.rating === 'Balanced');
    const avgGrind = balancedShots.length > 0
        ? Math.round(balancedShots.reduce((sum, s) => sum + s.grindSize, 0) / balancedShots.length * 10) / 10
        : null;

    // Balanced rate is out of rated shots only; unrated shots don't count against it
    const successRate = ratedShots > 0
        ? Math.round((balancedShots.length / ratedShots) * 100)
        : 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const shotsThisWeek = shots.filter(s => s.timestamp >= weekAgo).length;

    const days: DayStat[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayShots = shots.filter(s => {
            const shotDate = new Date(s.timestamp);
            return shotDate.toDateString() === date.toDateString();
        });
        days.push({
            date: dateStr,
            balanced: dayShots.filter(s => s.rating === 'Balanced').length,
            total: dayShots.length,
        });
    }
    const maxDayTotal = Math.max(...days.map(d => d.total), 1);
    const hasWeekData = !days.every(d => d.total === 0);

    const brewCounts = shots.reduce((acc, s) => {
        acc[s.brewType] = (acc[s.brewType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const brewEntries = Object.entries(brewCounts).sort((a, b) => b[1] - a[1]);
    const maxBrewCount = Math.max(...brewEntries.map(([, c]) => c), 1);
    const showBrewBreakdown = brewEntries.length > 1;

    return {
        totalShots,
        ratedShots,
        ratingCounts,
        maxRatingCount,
        topBeans,
        maxBeanCount,
        avgGrind,
        successRate,
        shotsThisWeek,
        days,
        maxDayTotal,
        hasWeekData,
        brewEntries,
        maxBrewCount,
        showBrewBreakdown,
    };
}
