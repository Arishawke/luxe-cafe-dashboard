import type { ShotLog, FavoritesMap, Rating } from '../types';
import { formatDate } from '../lib/format';
import { filterShots } from '../lib/shots';
import Icons from './Icons';

interface ShotHistoryProps {
    shots: ShotLog[];
    sortedShots: ShotLog[];
    favorites: FavoritesMap;
    justLoggedId?: string | null;
    use24Hour: boolean;
    beanFilter: string;
    setBeanFilter: (v: string) => void;
    notesSearch: string;
    setNotesSearch: (v: string) => void;
    ratingConfig: Record<Rating, { icon: () => React.JSX.Element; colorClass: string }>;
    onSelectShot: (shot: ShotLog) => void;
    onToggleFavorite: (shot: ShotLog) => void;
    onEditShot: (shot: ShotLog) => void;
    onDeleteShot: (id: string) => void;
    onOpenHistoryModal: () => void;
}

export default function ShotHistory({
    shots,
    sortedShots,
    favorites,
    justLoggedId,
    use24Hour,
    beanFilter,
    setBeanFilter,
    notesSearch,
    setNotesSearch,
    ratingConfig,
    onSelectShot,
    onToggleFavorite,
    onEditShot,
    onDeleteShot,
    onOpenHistoryModal,
}: ShotHistoryProps) {
    const filteredShots = filterShots(sortedShots, beanFilter, notesSearch);

    return (
        <div className="card">
            <h2 className="card__title">
                <Icons.BarChart /> Shot History
                {shots.length > 0 && (
                    <button
                        className="card__expand-btn"
                        onClick={onOpenHistoryModal}
                        title="Expand shot history"
                        aria-label="Expand shot history"
                    >
                        <Icons.Expand />
                    </button>
                )}
            </h2>

            {shots.length > 0 && (
                <div className="history-filters">
                    <div className="history-filter">
                        <select
                            className="history-filter__select"
                            value={beanFilter}
                            onChange={(e) => setBeanFilter(e.target.value)}
                        >
                            <option value="">All Beans</option>
                            {[...new Set(shots.map(s => s.beanName))]
                                .sort((a, b) => a.localeCompare(b))
                                .map(bean => (
                                    <option key={bean} value={bean}>{bean}</option>
                                ))
                            }
                        </select>
                        {beanFilter && (
                            <button
                                className="history-filter__clear"
                                onClick={() => setBeanFilter('')}
                                title="Clear filter"
                                aria-label="Clear bean filter"
                            >
                                <span aria-hidden="true">×</span>
                            </button>
                        )}
                    </div>
                    <input
                        type="text"
                        className="history-filter__search"
                        placeholder="Search notes..."
                        value={notesSearch}
                        onChange={(e) => setNotesSearch(e.target.value)}
                    />
                </div>
            )}

            {filteredShots.length > 0 ? (
                <div className="history-list">
                    {filteredShots.map((shot) => {
                        const config = shot.rating ? ratingConfig[shot.rating] : null;
                        const ShotIcon = config?.icon;
                        const isFavorite = favorites[shot.beanName.toLowerCase()] === shot.id;
                        return (
                            <div
                                key={shot.id}
                                className={`history-item history-item--clickable ${isFavorite ? 'history-item--favorite' : ''} ${shot.id === justLoggedId ? 'history-item--just-logged' : ''}`}
                                onClick={() => onSelectShot(shot)}
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
                                        <span className="setting-tag">S{shot.strength}</span>
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
                                        onClick={(e) => { e.stopPropagation(); onEditShot(shot); }}
                                        title="Edit shot"
                                        aria-label="Edit shot"
                                    >
                                        <Icons.Edit />
                                    </button>
                                    <button
                                        className="history-item__delete-btn"
                                        onClick={(e) => { e.stopPropagation(); onDeleteShot(shot.id); }}
                                        title="Delete shot"
                                        aria-label="Delete shot"
                                    >
                                        <Icons.Trash />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <Icons.Clipboard />
                    <p className="empty-state__text">No shots logged yet. Start dialing in!</p>
                </div>
            )}
        </div>
    );
}
