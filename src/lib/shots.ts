import type { ShotLog } from '../types';

export function filterShots(shots: ShotLog[], beanFilter: string, notesSearch: string): ShotLog[] {
    const search = notesSearch.toLowerCase().trim();
    return shots.filter(shot => {
        if (beanFilter && shot.beanName !== beanFilter) return false;
        if (search && !(shot.notes ?? '').toLowerCase().includes(search)) return false;
        return true;
    });
}

export function getRecentShotsForBean(shots: ShotLog[], beanName: string, limit?: number): ShotLog[] {
    const key = beanName.trim().toLowerCase();
    if (!key) return [];
    const matching = shots
        .filter(shot => shot.beanName.trim().toLowerCase() === key)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return limit === undefined ? matching : matching.slice(0, limit);
}
