import type { ShotLog, Rating } from '../types';
import type { SuggestedSettings } from '../lib/suggestions';
import { getBaristaTip } from '../lib/suggestions';
import Icons from './Icons';

interface SuggestionCardProps {
    lastShot: ShotLog | null;
    suggestion: SuggestedSettings | null;
    shotsForBean: ShotLog[];
    beanName: string;
    ratingConfig: Record<Rating, { icon: () => React.JSX.Element; colorClass: string }>;
    ratingColors: Record<Rating, string>;
    onApply: () => void;
}

export default function SuggestionCard({
    lastShot,
    suggestion,
    shotsForBean,
    beanName,
    ratingConfig,
    ratingColors,
    onApply,
}: SuggestionCardProps) {
    if (!lastShot) {
        return (
            <div className="empty-state">
                <Icons.Lightbulb />
                <p className="empty-state__title">
                    {beanName.trim() ? `No history for "${beanName}" yet` : 'Dial in with the Smart Barista'}
                </p>
                <p className="empty-state__text">
                    {beanName.trim()
                        ? 'Log a shot with this bean and your next-shot tips will appear here.'
                        : 'Enter a bean name and your last shot will guide the next one, from sour toward balanced.'}
                </p>
            </div>
        );
    }

    const config = ratingConfig[lastShot.rating];
    const tip = getBaristaTip(lastShot.rating);
    const TipIcon = config.icon;

    return (
        <>
            <div className={`barista-tip barista-tip--${config.colorClass}`}>
                <span className="barista-tip__icon">
                    <TipIcon />
                </span>
                <div className="barista-tip__content">
                    <h4>
                        Tip for "{lastShot.beanName}"
                        {tip.adjustment !== 'none' && (
                            <span className={`adjustment-badge adjustment-badge--${tip.adjustment}`}>
                                {tip.adjustment === 'large' ? 'Major Adj.' : 'Minor Adj.'}
                            </span>
                        )}
                    </h4>
                    <p>{tip.message}</p>
                </div>
            </div>

            {suggestion && (
                <div className="suggested-settings">
                    <div className="suggested-settings__header">
                        <Icons.Target />
                        <span>Suggested Next Shot</span>
                    </div>
                    <div className="suggested-settings__values">
                        <div className="suggested-setting">
                            <span className="suggested-setting__label">Grind</span>
                            <span className="suggested-setting__value">
                                {suggestion.grindSize}
                                <span className={`suggested-setting__diff ${suggestion.grindDiff > 0 ? 'diff--coarser' : 'diff--finer'}`}>
                                    ({suggestion.grindDiff > 0 ? '+' : ''}{suggestion.grindDiff})
                                </span>
                            </span>
                        </div>
                        {suggestion.adjustmentType === 'both' && (
                            <div className="suggested-setting">
                                <span className="suggested-setting__label">Temp</span>
                                <span className="suggested-setting__value">{suggestion.temperature}</span>
                            </div>
                        )}
                    </div>
                    <button
                        className="btn-apply-suggestion"
                        onClick={onApply}
                        title="Apply suggested settings to form"
                    >
                        <Icons.Zap /> Apply to Form
                    </button>
                </div>
            )}

            {shotsForBean.length > 1 && (() => {
                const displayShots = shotsForBean.slice(0, 5).reverse();
                const grindSizes = displayShots.map(s => s.grindSize);
                const minGrind = Math.min(...grindSizes);
                const maxGrind = Math.max(...grindSizes);
                const grindRange = maxGrind - minGrind || 1;

                return (
                    <div className="dialin-journey">
                        <div className="dialin-journey__label">
                            <Icons.TrendingUp /> Recent Journey
                        </div>
                        <div className="dialin-journey__timeline">
                            {displayShots.map((shot, idx) => {
                                const shotConfig = ratingConfig[shot.rating];
                                const ShotIcon = shotConfig.icon;
                                return (
                                    <div
                                        key={shot.id}
                                        className={`journey-step journey-step--${shotConfig.colorClass}`}
                                        title={`Grind ${shot.grindSize} • ${shot.rating}`}
                                    >
                                        <ShotIcon />
                                        <span className="journey-step__grind">G{shot.grindSize}</span>
                                        {idx < displayShots.length - 1 && <span className="journey-step__arrow">→</span>}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="grind-history" title="Grind size trend">
                            {displayShots.map((shot, idx) => (
                                <div
                                    key={shot.id}
                                    className={`grind-history__bar ${idx === displayShots.length - 1 ? 'grind-history__bar--current' : ''}`}
                                    style={{
                                        height: `${20 + ((shot.grindSize - minGrind) / grindRange) * 80}%`,
                                        background: ratingColors[shot.rating]
                                    }}
                                    title={`G${shot.grindSize}`}
                                />
                            ))}
                        </div>
                    </div>
                );
            })()}
        </>
    );
}
