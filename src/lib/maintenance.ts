import type { MaintenanceEvent, MaintenanceAlert, MaintenanceTask } from '../types';

export const CLEANING_INTERVAL_SHOTS = 200;
export const DESCALING_INTERVAL_DAYS = 90;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function lastEventFor(
    events: MaintenanceEvent[],
    task: MaintenanceTask,
): MaintenanceEvent | null {
    const matching = events.filter(e => e.task === task);
    if (matching.length === 0) return null;
    return matching.reduce((latest, e) =>
        e.performedAt > latest.performedAt ? e : latest,
    );
}

function cleaningAlert(
    events: MaintenanceEvent[],
    totalShots: number,
): MaintenanceAlert | null {
    const last = lastEventFor(events, 'cleaning');
    // no event yet means a fresh install or pre-feature user, treat as baseline
    if (!last) return null;

    const shotsSince = Math.max(0, totalShots - last.shotCountAtTime);
    if (shotsSince < CLEANING_INTERVAL_SHOTS * 0.8) return null;

    const overdueThreshold = CLEANING_INTERVAL_SHOTS * 1.25;
    const variant: MaintenanceAlert['variant'] =
        shotsSince >= overdueThreshold
            ? 'overdue'
            : shotsSince >= CLEANING_INTERVAL_SHOTS
                ? 'due'
                : 'approaching';

    const text =
        variant === 'overdue'
            ? `${shotsSince} shots since last cleaning. Run a cleaning cycle soon.`
            : variant === 'due'
                ? `${shotsSince} shots since last cleaning. Cleaning cycle due.`
                : `${shotsSince} shots since last cleaning. Cleaning due in ${CLEANING_INTERVAL_SHOTS - shotsSince} shots.`;

    return {
        task: 'cleaning',
        variant,
        label: variant === 'approaching' ? 'Cleaning soon' : variant === 'due' ? 'Cleaning due' : 'Cleaning overdue',
        text,
    };
}

function descalingAlert(
    events: MaintenanceEvent[],
    now: Date,
): MaintenanceAlert | null {
    const last = lastEventFor(events, 'descaling');
    if (!last) return null;

    const performed = new Date(last.performedAt);
    const daysSince = Math.floor((now.getTime() - performed.getTime()) / MS_PER_DAY);
    if (daysSince < DESCALING_INTERVAL_DAYS * 0.8) return null;

    const overdueThreshold = Math.round(DESCALING_INTERVAL_DAYS * 4 / 3); // 120
    const variant: MaintenanceAlert['variant'] =
        daysSince >= overdueThreshold
            ? 'overdue'
            : daysSince >= DESCALING_INTERVAL_DAYS
                ? 'due'
                : 'approaching';

    const text =
        variant === 'overdue'
            ? `${daysSince} days since last descale. Run a descale cycle soon.`
            : variant === 'due'
                ? `${daysSince} days since last descale. Descale cycle due.`
                : `${daysSince} days since last descale. Descale due in ${DESCALING_INTERVAL_DAYS - daysSince} days.`;

    return {
        task: 'descaling',
        variant,
        label: variant === 'approaching' ? 'Descale soon' : variant === 'due' ? 'Descale due' : 'Descale overdue',
        text,
    };
}

export function getMaintenanceAlerts(
    events: MaintenanceEvent[],
    totalShots: number,
    now: Date = new Date(),
): MaintenanceAlert[] {
    const alerts: MaintenanceAlert[] = [];
    const cleaning = cleaningAlert(events, totalShots);
    if (cleaning) alerts.push(cleaning);
    const descaling = descalingAlert(events, now);
    if (descaling) alerts.push(descaling);
    return alerts;
}
