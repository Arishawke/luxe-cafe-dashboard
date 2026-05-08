import type { ShotLog } from '../types';

export function filterShots(shots: ShotLog[], beanFilter: string, notesSearch: string): ShotLog[] {
    const search = notesSearch.toLowerCase().trim();
    return shots.filter(shot => {
        if (beanFilter && shot.beanName !== beanFilter) return false;
        if (search && !(shot.notes ?? '').toLowerCase().includes(search)) return false;
        return true;
    });
}
