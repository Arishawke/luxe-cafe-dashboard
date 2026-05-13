import type { ShotLog } from '../../types';
import { RATINGS, RATING_COLORS } from '../../constants';
import { computeStats } from '../../lib/stats';
import Icons from '../Icons';

interface StatsModalProps {
    open: boolean;
    shots: ShotLog[];
    onClose: () => void;
}

export default function StatsModal({ open, shots, onClose }: StatsModalProps) {
    if (!open) return null;
    const stats = computeStats(shots);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h3><Icons.PieChart /> Statistics</h3>
                    <button className="modal__close" aria-label="Close" onClick={onClose}>
                        <Icons.X />
                    </button>
                </div>
                <div className="modal__body">
                    {stats.totalShots === 0 ? (
                        <div className="empty-state">
                            <Icons.BarChart />
                            <p className="empty-state__text">Log some shots to see your statistics!</p>
                        </div>
                    ) : (
                        <>
                            <div className="stats-summary">
                                <div className="stat-card">
                                    <div className="stat-card__value">{stats.totalShots}</div>
                                    <div className="stat-card__label">Total Shots</div>
                                </div>
                                <div className="stat-card stat-card--success">
                                    <div className="stat-card__value">{stats.successRate}%</div>
                                    <div className="stat-card__label">Balanced Rate</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card__value">{stats.shotsThisWeek}</div>
                                    <div className="stat-card__label">This Week</div>
                                </div>
                                {stats.avgGrind && (
                                    <div className="stat-card stat-card--accent">
                                        <div className="stat-card__value">{stats.avgGrind}</div>
                                        <div className="stat-card__label">Avg Balanced Grind</div>
                                    </div>
                                )}
                            </div>

                            <div className="stats-section">
                                <h4>Rating Distribution</h4>
                                <div className="bar-chart">
                                    {RATINGS.map((r) => (
                                        <div key={r} className="bar-chart__row">
                                            <div className="bar-chart__label">{r}</div>
                                            <div className="bar-chart__bar-wrap">
                                                <div
                                                    className="bar-chart__bar"
                                                    style={{
                                                        width: `${(stats.ratingCounts[r] / stats.maxRatingCount) * 100}%`,
                                                        backgroundColor: RATING_COLORS[r],
                                                    }}
                                                />
                                            </div>
                                            <div className="bar-chart__value">{stats.ratingCounts[r]}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {stats.topBeans.length > 0 && (
                                <div className="stats-section">
                                    <h4>Top Beans</h4>
                                    <div className="bar-chart bar-chart--beans">
                                        {stats.topBeans.map(([bean, count]) => (
                                            <div key={bean} className="bar-chart__row">
                                                <div className="bar-chart__label bar-chart__label--bean">{bean}</div>
                                                <div className="bar-chart__bar-wrap">
                                                    <div
                                                        className="bar-chart__bar bar-chart__bar--caramel"
                                                        style={{ width: `${(count / stats.maxBeanCount) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="bar-chart__value">{count}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {stats.hasWeekData && (
                                <div className="stats-section">
                                    <h4>Success Rate (Last 7 Days)</h4>
                                    <div className="success-chart">
                                        {stats.days.map((d, idx) => (
                                            <div key={idx} className="success-chart__day">
                                                <div className="success-chart__bars">
                                                    <div
                                                        className="success-chart__bar success-chart__bar--total"
                                                        style={{ height: `${(d.total / stats.maxDayTotal) * 100}%` }}
                                                        title={`${d.total} total`}
                                                    />
                                                    <div
                                                        className="success-chart__bar success-chart__bar--balanced"
                                                        style={{ height: `${(d.balanced / stats.maxDayTotal) * 100}%` }}
                                                        title={`${d.balanced} balanced`}
                                                    />
                                                </div>
                                                <span className="success-chart__label">{d.date}</span>
                                                <span className="success-chart__rate">
                                                    {d.total > 0 ? Math.round((d.balanced / d.total) * 100) : 0}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {stats.showBrewBreakdown && (
                                <div className="stats-section">
                                    <h4>Brew Types</h4>
                                    <div className="bar-chart">
                                        {stats.brewEntries.map(([brew, count]) => (
                                            <div key={brew} className="bar-chart__row">
                                                <div className="bar-chart__label">{brew}</div>
                                                <div className="bar-chart__bar-wrap">
                                                    <div
                                                        className="bar-chart__bar bar-chart__bar--muted"
                                                        style={{ width: `${(count / stats.maxBrewCount) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="bar-chart__value">{count}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
