import type { ShotLog, Rating } from '../types';
import { formatDate } from '../lib/format';
import Icons from './Icons';

interface ShotHistoryRowProps {
    shot: ShotLog;
    isFavorite: boolean;
    isSelected?: boolean;
    justLogged?: boolean;
    use24Hour: boolean;
    ratingConfig: Record<Rating, { icon: () => React.JSX.Element; colorClass: string }>;
    onSelect: (shot: ShotLog) => void;
    onOpen?: (shot: ShotLog) => void;
    onToggleFavorite: (shot: ShotLog) => void;
    onEdit: (shot: ShotLog) => void;
    onDelete: (id: string) => void;
}

// Shared between the dashboard side panel and the History modal so the two
// can never drift in density or layout again.
export default function ShotHistoryRow({
    shot,
    isFavorite,
    isSelected,
    justLogged,
    use24Hour,
    ratingConfig,
    onSelect,
    onOpen,
    onToggleFavorite,
    onEdit,
    onDelete,
}: ShotHistoryRowProps) {
    const config = shot.rating ? ratingConfig[shot.rating] : null;
    const ShotIcon = config?.icon;

    return (
        <div
            className={`history-item history-item--clickable ${isFavorite ? 'history-item--favorite' : ''} ${isSelected ? 'history-item--selected' : ''} ${justLogged ? 'history-item--just-logged' : ''}`}
            onClick={() => onSelect(shot)}
            onDoubleClick={onOpen ? () => onOpen(shot) : undefined}
        >
            <div className={`history-item__rating ${config ? `history-item__rating--${config.colorClass}` : 'history-item__rating--unrated'}`} title={config ? undefined : 'Not rated yet'}>
                {ShotIcon ? <ShotIcon /> : <span className="rating-unrated-mark" aria-hidden="true">?</span>}
            </div>
            <div className="history-item__details">
                <div className="history-item__bean">{shot.beanName}</div>
                <div className="history-item__meta">
                    {shot.brewType} • {formatDate(shot.timestamp, use24Hour)}
                </div>
                <div className="history-item__settings">
                    <span className="setting-tag">Grind {shot.grindSize}</span>
                    {shot.temperature && <span className="setting-tag">{shot.temperature}</span>}
                    <span className="setting-tag">{shot.basket}</span>
                    <span className="setting-tag">Str {shot.strength}</span>
                    {shot.extractionTime && (
                        <span className="setting-tag setting-tag--timer"><Icons.Timer /> {shot.extractionTime}s</span>
                    )}
                    {shot.doseIn && shot.doseOut && (
                        <span className="setting-tag setting-tag--dose">
                            {shot.doseIn}→{shot.doseOut}g (1:{(shot.doseOut / shot.doseIn).toFixed(1)})
                        </span>
                    )}
                    {shot.milk && (
                        <span className="setting-tag setting-tag--milk">
                            {shot.milk.type} {shot.milk.style}
                        </span>
                    )}
                </div>
                {shot.notes && (
                    <div className="history-item__notes">
                        {shot.notes}
                    </div>
                )}
            </div>
            <div className="history-item__actions">
                <button
                    className={`star-btn ${isFavorite ? 'star-btn--active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(shot); }}
                    title={isFavorite ? 'Remove from favorites' : 'Set as target recipe'}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Set as target recipe'}
                    aria-pressed={isFavorite}
                >
                    <Icons.Star filled={isFavorite} />
                </button>
                <button
                    className="history-item__edit-btn"
                    onClick={(e) => { e.stopPropagation(); onEdit(shot); }}
                    title="Edit shot"
                    aria-label="Edit shot"
                >
                    <Icons.Edit />
                </button>
                <button
                    className="history-item__delete-btn"
                    onClick={(e) => { e.stopPropagation(); onDelete(shot.id); }}
                    title="Delete shot"
                    aria-label="Delete shot"
                >
                    <Icons.Trash />
                </button>
            </div>
        </div>
    );
}
