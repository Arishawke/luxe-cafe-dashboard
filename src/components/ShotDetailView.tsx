import type { Rating, ShotLog } from '../types';
import { RATINGS, RATING_COLORS } from '../constants';
import { formatDateLong } from '../lib/format';
import { getRatioLabel } from '../lib/dialIn';
import Icons from './Icons';

interface ShotDetailViewProps {
    shot: ShotLog;
    use24Hour: boolean;
    isFavorite: boolean;
    ratingConfig: Record<Rating, { icon: () => React.JSX.Element; colorClass: string }>;
    onRate: (id: string, rating: Rating) => void;
}

export default function ShotDetailView({ shot, use24Hour, isFavorite, ratingConfig, onRate }: ShotDetailViewProps) {
    const config = shot.rating ? ratingConfig[shot.rating] : null;
    const ShotIcon = config?.icon;
    const ratioLabel = getRatioLabel(shot.doseIn, shot.doseOut, shot.brewType);

    return (
        <>
            {config && ShotIcon ? (
                <div className={`shot-detail__rating shot-detail__rating--${config.colorClass}`}>
                    <ShotIcon />
                    <span>{shot.rating}</span>
                    {isFavorite && <span className="shot-detail__fav-badge"><Icons.Star filled /> Favorite</span>}
                </div>
            ) : (
                <div className="shot-detail__rate-prompt">
                    <span className="shot-detail__label">How did it taste?</span>
                    <div className="rate-chips">
                        {RATINGS.map((r) => (
                            <button
                                key={r}
                                type="button"
                                className="rate-chip"
                                style={{ '--rating-color': RATING_COLORS[r] } as React.CSSProperties}
                                onClick={() => onRate(shot.id, r)}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="shot-detail__timestamp">
                {formatDateLong(shot.timestamp, use24Hour)}
            </div>

            <div className="shot-detail__grid">
                <div className="shot-detail__item">
                    <span className="shot-detail__label">Brew Type</span>
                    <span className="shot-detail__value">{shot.brewType}</span>
                </div>
                <div className="shot-detail__item">
                    <span className="shot-detail__label">Grind Size</span>
                    <span className="shot-detail__value">{shot.grindSize}</span>
                </div>
                {shot.temperature && (
                    <div className="shot-detail__item">
                        <span className="shot-detail__label">Temperature</span>
                        <span className="shot-detail__value">{shot.temperature}</span>
                    </div>
                )}
                <div className="shot-detail__item">
                    <span className="shot-detail__label">Basket</span>
                    <span className="shot-detail__value">{shot.basket}</span>
                </div>
                <div className="shot-detail__item">
                    <span className="shot-detail__label">Strength</span>
                    <span className="shot-detail__value">{shot.strength}</span>
                </div>
                {shot.milk && (
                    <div className="shot-detail__item">
                        <span className="shot-detail__label">Milk</span>
                        <span className="shot-detail__value">{shot.milk.type} {shot.milk.style}</span>
                    </div>
                )}
                {shot.extractionTime && (
                    <div className="shot-detail__item">
                        <span className="shot-detail__label">Extraction Time</span>
                        <span className="shot-detail__value">{shot.extractionTime}s</span>
                    </div>
                )}
                {shot.doseIn && shot.doseOut && (
                    <div className="shot-detail__item">
                        <span className="shot-detail__label">Dose / Yield</span>
                        <span className="shot-detail__value">
                            {shot.doseIn}g → {shot.doseOut}g (1:{(shot.doseOut / shot.doseIn).toFixed(1)})
                            {ratioLabel && <span className="ratio-label">{ratioLabel}</span>}
                        </span>
                    </div>
                )}
            </div>

            {shot.notes && (
                <div className="shot-detail__notes">
                    <span className="shot-detail__label">Notes</span>
                    <p>{shot.notes}</p>
                </div>
            )}
        </>
    );
}
