import type { ShotLog } from '../../types';
import { computeCaffeine } from '../../lib/caffeine';
import { useFocusTrap } from '../../hooks';
import Icons from '../Icons';

interface CaffeineModalProps {
    open: boolean;
    shots: ShotLog[];
    onClose: () => void;
}

export default function CaffeineModal({ open, shots, onClose }: CaffeineModalProps) {
    const modalRef = useFocusTrap<HTMLDivElement>();
    if (!open) return null;
    const data = computeCaffeine(shots);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                ref={modalRef}
                className="modal modal--caffeine"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="caffeine-modal-title"
            >
                <div className="modal__header">
                    <h2 id="caffeine-modal-title"><Icons.Caffeine /> Caffeine Tracker</h2>
                    <button className="modal__close" aria-label="Close" onClick={onClose}>
                        <Icons.X />
                    </button>
                </div>
                <div className="modal__body">
                    <div className={`caffeine-gauge caffeine-gauge--${data.status}`}>
                        <div className="caffeine-gauge__circle">
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" className="caffeine-gauge__bg" />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    className="caffeine-gauge__fill"
                                    strokeDasharray={`${data.percentage * 2.83} 283`}
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                            <div className="caffeine-gauge__value">
                                <span className="caffeine-gauge__number">{data.todayCaffeine}</span>
                                <span className="caffeine-gauge__unit">mg</span>
                            </div>
                        </div>
                        <p className="caffeine-gauge__status">{data.statusText}</p>
                    </div>

                    <div className="caffeine-stats">
                        <div className="caffeine-stat">
                            <span className="caffeine-stat__value">{data.todayShotCount}</span>
                            <span className="caffeine-stat__label">Shots Today</span>
                        </div>
                        <div className="caffeine-stat">
                            <span className="caffeine-stat__value">{data.avgDaily}</span>
                            <span className="caffeine-stat__label">Daily Avg (mg)</span>
                        </div>
                        <div className="caffeine-stat">
                            <span className="caffeine-stat__value">{data.weekShotCount}</span>
                            <span className="caffeine-stat__label">Shots This Week</span>
                        </div>
                    </div>

                    <div className="caffeine-info">
                        <h3>Caffeine by Basket</h3>
                        <div className="caffeine-breakdown">
                            <div className="caffeine-breakdown__item">
                                <span className="caffeine-breakdown__basket">Single</span>
                                <span className="caffeine-breakdown__mg">~32mg per shot</span>
                            </div>
                            <div className="caffeine-breakdown__item">
                                <span className="caffeine-breakdown__basket">Double</span>
                                <span className="caffeine-breakdown__mg">~63mg per shot</span>
                            </div>
                            <div className="caffeine-breakdown__item">
                                <span className="caffeine-breakdown__basket">Luxe</span>
                                <span className="caffeine-breakdown__mg">~80mg per shot</span>
                            </div>
                        </div>
                        <p className="caffeine-limit">
                            Recommended daily limit: <strong>{data.dailyLimit}mg</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
