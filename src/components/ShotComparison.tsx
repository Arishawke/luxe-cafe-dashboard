import type { ShotLog } from '../types';
import { RATING_COLOR_CLASS } from '../lib/ratings';
import Icons from './Icons';

interface ShotComparisonProps {
    shot1: ShotLog | null | undefined;
    shot2: ShotLog | null | undefined;
    onClear: () => void;
    onRemoveAt: (idx: 0 | 1) => void;
}

export default function ShotComparison({ shot1, shot2, onClear, onRemoveAt }: ShotComparisonProps) {
    if (!shot1 && !shot2) return null;
    return (
        <div className="compare-panel">
            <div className="compare-panel__header">
                <h3><Icons.BarChart /> Compare Shots</h3>
                <button className="compare-panel__close" onClick={onClear} aria-label="Clear comparison">
                    <Icons.X />
                </button>
            </div>
            <div className="compare-panel__content">
                {[shot1, shot2].map((shot, idx) => (
                    <div key={idx} className={`compare-panel__shot ${!shot ? 'compare-panel__shot--empty' : ''}`}>
                        {shot ? (
                            <>
                                <div className="compare-panel__shot-header">
                                    <span className="compare-panel__bean">{shot.beanName}</span>
                                    <span className={`compare-panel__rating ${shot.rating ? `compare-panel__rating--${RATING_COLOR_CLASS[shot.rating]}` : 'compare-panel__rating--unrated'}`}>
                                        {shot.rating ?? 'Not rated'}
                                    </span>
                                </div>
                                <div className="compare-panel__details">
                                    <div className="compare-panel__detail">
                                        <span className="compare-panel__label">Grind</span>
                                        <span className="compare-panel__value">{shot.grindSize}</span>
                                    </div>
                                    <div className="compare-panel__detail">
                                        <span className="compare-panel__label">Temp</span>
                                        <span className="compare-panel__value">{shot.temperature || '-'}</span>
                                    </div>
                                    <div className="compare-panel__detail">
                                        <span className="compare-panel__label">Basket</span>
                                        <span className="compare-panel__value">{shot.basket}</span>
                                    </div>
                                    <div className="compare-panel__detail">
                                        <span className="compare-panel__label">Strength</span>
                                        <span className="compare-panel__value">{shot.strength}</span>
                                    </div>
                                </div>
                                <button
                                    className="compare-panel__remove"
                                    onClick={() => onRemoveAt(idx as 0 | 1)}
                                >
                                    Remove
                                </button>
                            </>
                        ) : (
                            <span className="compare-panel__placeholder">Select a shot to compare</span>
                        )}
                    </div>
                ))}
            </div>
            {shot1 && shot2 && (
                <div className="compare-panel__diff">
                    <span className="compare-panel__diff-label">Grind Difference:</span>
                    <span className={`compare-panel__diff-value ${shot2.grindSize > shot1.grindSize ? 'diff--coarser' : shot2.grindSize < shot1.grindSize ? 'diff--finer' : ''}`}>
                        {shot2.grindSize - shot1.grindSize > 0 ? '+' : ''}{shot2.grindSize - shot1.grindSize}
                    </span>
                </div>
            )}
        </div>
    );
}
