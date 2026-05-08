import { useState, useEffect } from 'react';
import type { MaintenanceEvent, MaintenanceTask } from '../types';
import { loadMaintenance, saveMaintenance } from '../lib/storage';
import { lastEventFor as findLastEvent } from '../lib/maintenance';

export function useMaintenance() {
    const [events, setEvents] = useState<MaintenanceEvent[]>(() => loadMaintenance());

    useEffect(() => { saveMaintenance(events); }, [events]);

    const record = (task: MaintenanceTask, currentShotCount: number) => {
        const event: MaintenanceEvent = {
            task,
            performedAt: new Date().toISOString(),
            shotCountAtTime: currentShotCount,
        };
        setEvents(prev => [event, ...prev]);
    };

    const recordCleaning = (currentShotCount: number) => record('cleaning', currentShotCount);
    const recordDescaling = (currentShotCount: number) => record('descaling', currentShotCount);

    const lastEventFor = (task: MaintenanceTask) => findLastEvent(events, task);

    const replaceAll = (next: MaintenanceEvent[]) => setEvents(next);

    return { events, recordCleaning, recordDescaling, lastEventFor, replaceAll };
}
