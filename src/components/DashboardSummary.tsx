import { useMemo } from 'react';
import type { ShotLog } from '../types';
import { computeStats } from '../lib/stats';

interface DashboardSummaryProps {
    shots: ShotLog[];
}

export default function DashboardSummary({ shots }: DashboardSummaryProps) {
    const stats = useMemo(() => computeStats(shots), [shots]);

    if (stats.totalShots === 0) {
        return (
            <section className="dashboard-summary dashboard-summary--empty">
                <p className="dashboard-summary__welcome">
                    Log your first shot to start tracking your dial-in.
                </p>
            </section>
        );
    }

    const topBean = stats.topBeans[0]?.[0];

    return (
        <section className="dashboard-summary">
            <div className="summary-hero">
                <div className="summary-hero__value">{stats.successRate}%</div>
                <div className="summary-hero__label">Balanced Rate</div>
            </div>
            <div className="summary-tiles">
                <div className="summary-tile">
                    <div className="summary-tile__value">{stats.totalShots}</div>
                    <div className="summary-tile__label">Shots Logged</div>
                </div>
                <div className="summary-tile">
                    <div className="summary-tile__value">{stats.shotsThisWeek}</div>
                    <div className="summary-tile__label">This Week</div>
                </div>
                {topBean && (
                    <div className="summary-tile">
                        <div className="summary-tile__value summary-tile__value--bean">{topBean}</div>
                        <div className="summary-tile__label">Top Bean</div>
                    </div>
                )}
            </div>
        </section>
    );
}
