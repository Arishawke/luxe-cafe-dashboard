import { useState, useEffect } from 'react';
import type { ShotLog } from '../types';
import { loadShots, saveShots } from '../lib/storage';

export function useShots() {
    const [shots, setShots] = useState<ShotLog[]>(() => loadShots());

    useEffect(() => { saveShots(shots); }, [shots]);

    const addShot = (shot: ShotLog) => setShots(prev => [shot, ...prev]);
    const updateShot = (updated: ShotLog) =>
        setShots(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    const deleteShot = (id: string) => setShots(prev => prev.filter(s => s.id !== id));
    const replaceAll = (next: ShotLog[]) => setShots(next);

    return { shots, addShot, updateShot, deleteShot, replaceAll };
}
