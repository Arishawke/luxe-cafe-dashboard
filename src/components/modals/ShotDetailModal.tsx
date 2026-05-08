import type { Rating, ShotLog } from '../../types';
import Icons from '../Icons';

interface ShotDetailModalProps {
    shot: ShotLog | null;
    use24Hour: boolean;
    isFavorite: boolean;
    isCompared: boolean;
    ratingConfig: Record<Rating, { icon: () => React.JSX.Element; colorClass: string }>;
    onClose: () => void;
    onEdit: (shot: ShotLog) => void;
    onDelete: (id: string) => void;
    onDuplicate: (shot: ShotLog) => void;
    onToggleCompare: (id: string) => void;
}

export default function ShotDetailModal({
    shot,
    use24Hour,
    isFavorite,
    isCompared,
    ratingConfig,
    onClose,
    onEdit,
    onDelete,
    onDuplicate,
    onToggleCompare,
}: ShotDetailModalProps) {
    if (!shot) return null;
    const config = ratingConfig[shot.rating];
    const ShotIcon = config.icon;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h3>{shot.beanName}</h3>
                    <div className="modal__header-actions">
                        <button
                            className="modal__header-btn"
                            onClick={() => onEdit(shot)}
                            title="Edit shot"
                        >
                            <Icons.Edit />
                        </button>
                        <button
                            className="modal__header-btn modal__header-btn--delete"
                            onClick={(e) => { e.stopPropagation(); onDelete(shot.id); }}
                            title="Delete shot"
                        >
                            <Icons.Trash />
                        </button>
                        <button className="modal__close" onClick={onClose}>
                            <Icons.X />
                        </button>
                    </div>
                </div>
                <div className="modal__body">
                    {/* Rating Banner */}
                    <div className={`shot-detail__rating shot-detail__rating--${config.colorClass}`}>
                        <ShotIcon />
                        <span>{shot.rating}</span>
                        {isFavorite && <span className="shot-detail__fav-badge">⭐ Favorite</span>}
                    </div>

                    {/* Timestamp */}
                    <div className="shot-detail__timestamp">
                        {new Intl.DateTimeFormat('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: !use24Hour,
                        }).format(shot.timestamp)}
                    </div>

                    {/* Settings Grid */}
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

                    {/* Notes */}
                    {shot.notes && (
                        <div className="shot-detail__notes">
                            <span className="shot-detail__label">Notes</span>
                            <p>{shot.notes}</p>
                        </div>
                    )}
                </div>
                <div className="modal__footer">
                    <button
                        className={`btn-action ${isCompared ? 'btn-action--active' : ''}`}
                        onClick={() => onToggleCompare(shot.id)}
                        title="Add to comparison"
                    >
                        <Icons.BarChart /> Compare
                    </button>
                    <button
                        className="btn-action"
                        onClick={() => onDuplicate(shot)}
                        title="Copy settings to form"
                    >
                        <Icons.Copy /> Brew Again
                    </button>
                    <button className="btn-action btn-action--primary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
