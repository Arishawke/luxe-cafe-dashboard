import type { ShotLog, FavoritesMap, Rating } from '../types';
import { filterShots } from '../lib/shots';
import Icons from './Icons';
import ShotHistoryRow from './ShotHistoryRow';

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
                    {filteredShots.map((shot) => (
                        <ShotHistoryRow
                            key={shot.id}
                            shot={shot}
                            isFavorite={favorites[shot.beanName.toLowerCase()] === shot.id}
                            justLogged={shot.id === justLoggedId}
                            use24Hour={use24Hour}
                            ratingConfig={ratingConfig}
                            onSelect={onSelectShot}
                            onToggleFavorite={onToggleFavorite}
                            onEdit={onEditShot}
                            onDelete={onDeleteShot}
                        />
                    ))}
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
