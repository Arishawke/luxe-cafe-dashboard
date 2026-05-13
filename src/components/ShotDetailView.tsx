import type { Rating, ShotLog } from '../types';
import { formatDateLong } from '../lib/format';

interface ShotDetailViewProps {
    shot: ShotLog;
    use24Hour: boolean;
    isFavorite: boolean;
    ratingConfig: Record<Rating, { icon: () => React.JSX.Element; colorClass: string }>;
}

export default function ShotDetailView({ shot, use24Hour, isFavorite, ratingConfig }: ShotDetailViewProps) {
    const config = ratingConfig[shot.rating];
    const ShotIcon = config.icon;

    return (
        <>
            <div className={`shot-detail__rating shot-detail__rating--${config.colorClass}`}>
                <ShotIcon />
                <span>{shot.rating}</span>
                {isFavorite && <span className="shot-detail__fav-badge">⭐ Favorite</span>}
            </div>

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
