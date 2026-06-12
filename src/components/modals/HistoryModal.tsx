import { useState } from 'react';
import type { ShotLog, FavoritesMap, Rating } from '../../types';
import { formatDate } from '../../lib/format';
import { filterShots } from '../../lib/shots';
import { useFocusTrap } from '../../hooks';
import Icons from '../Icons';
import ShotDetailView from '../ShotDetailView';

interface HistoryModalProps {
    open: boolean;
    shots: ShotLog[];
    sortedShots: ShotLog[];
    favorites: FavoritesMap;
    beanFilter: string;
    setBeanFilter: (v: string) => void;
    notesSearch: string;
    setNotesSearch: (v: string) => void;
    use24Hour: boolean;
    ratingConfig: Record<Rating, { icon: () => React.JSX.Element; colorClass: string }>;
    compareShots: [string | null, string | null];
    onClose: () => void;
    onSelectShot: (shot: ShotLog) => void;
    onToggleFavorite: (shot: ShotLog) => void;
    onToggleCompare: (id: string) => void;
    onEditShot: (shot: ShotLog) => void;
    onDuplicateShot: (shot: ShotLog) => void;
    onDeleteShot: (id: string) => void;
    onRate: (id: string, rating: Rating) => void;
}

export default function HistoryModal({
    open,
    shots,
    sortedShots,
    favorites,
    beanFilter,
    setBeanFilter,
    notesSearch,
    setNotesSearch,
    use24Hour,
    ratingConfig,
    compareShots,
    onClose,
    onSelectShot,
    onToggleFavorite,
    onToggleCompare,
    onEditShot,
    onDuplicateShot,
    onDeleteShot,
    onRate,
}: HistoryModalProps) {
    const [previewShot, setPreviewShot] = useState<ShotLog | null>(null);
    const modalRef = useFocusTrap<HTMLDivElement>();

    if (!open) return null;

    const filteredShots = filterShots(sortedShots, beanFilter, notesSearch);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                ref={modalRef}
                className="modal modal--history"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="history-modal-title"
            >
                <div className="modal__header">
                    <h3 id="history-modal-title"><Icons.BarChart /> Shot History ({shots.length})</h3>
                    <button className="modal__close" aria-label="Close" onClick={onClose}>
                        <Icons.X />
                    </button>
                </div>
                <div className="modal__body">
                    <div className="history-modal__filters">
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

                    <div className="history-modal__content">
                        <div className="history-modal__list">
                            {filteredShots.length > 0 ? (
                                filteredShots.map((shot) => {
                                    const config = shot.rating ? ratingConfig[shot.rating] : null;
                                    const ShotIcon = config?.icon;
                                    const isFavorite = favorites[shot.beanName.toLowerCase()] === shot.id;
                                    const isSelected = previewShot?.id === shot.id;
                                    return (
                                        <div
                                            key={shot.id}
                                            className={`history-item history-item--clickable ${isFavorite ? 'history-item--favorite' : ''} ${isSelected ? 'history-item--selected' : ''}`}
                                            onClick={() => setPreviewShot(shot)}
                                            onDoubleClick={() => { onSelectShot(shot); onClose(); }}
                                        >
                                            <div className={`history-item__rating ${config ? `history-item__rating--${config.colorClass}` : 'history-item__rating--unrated'}`} title={config ? undefined : 'Not rated yet'}>
                                                {ShotIcon ? <ShotIcon /> : <span className="rating-unrated-mark" aria-hidden="true">?</span>}
                                            </div>
                                            <div className="history-item__details">
                                                <div className="history-item__bean">{shot.beanName}</div>
                                                <div className="history-item__meta">
                                                    {shot.brewType} • {formatDate(shot.timestamp, use24Hour)}
                                                </div>
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
                                                    className="history-item__delete-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteShot(shot.id);
                                                        if (previewShot?.id === shot.id) setPreviewShot(null);
                                                    }}
                                                    title="Delete shot"
                                                    aria-label="Delete shot"
                                                >
                                                    <Icons.Trash />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="empty-state">
                                    <Icons.Clipboard />
                                    <p className="empty-state__text">
                                        {beanFilter || notesSearch ? 'No shots match your filters.' : 'No shots logged yet.'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="history-modal__preview">
                            {previewShot ? (
                                <>
                                    <ShotDetailView
                                        shot={previewShot}
                                        use24Hour={use24Hour}
                                        isFavorite={favorites[previewShot.beanName.toLowerCase()] === previewShot.id}
                                        ratingConfig={ratingConfig}
                                        onRate={(id, rating) => {
                                            onRate(id, rating);
                                            setPreviewShot(prev => (prev && prev.id === id ? { ...prev, rating } : prev));
                                        }}
                                    />

                                    <div className="history-modal__preview-actions">
                                        <button
                                            className="btn-action"
                                            onClick={() => onEditShot(previewShot)}
                                            title="Edit shot details"
                                        >
                                            <Icons.Edit /> Edit
                                        </button>
                                        <button
                                            className="btn-action"
                                            onClick={() => onDuplicateShot(previewShot)}
                                            title="Copy settings to form"
                                        >
                                            <Icons.Copy /> Brew Again
                                        </button>
                                        <button
                                            className={`btn-action ${compareShots.includes(previewShot.id) ? 'btn-action--active' : 'btn-action--primary'}`}
                                            onClick={() => onToggleCompare(previewShot.id)}
                                        >
                                            <Icons.BarChart /> {compareShots.includes(previewShot.id) ? 'In Compare' : 'Add to Compare'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="history-modal__preview-empty">
                                    <Icons.Coffee />
                                    <p>Select a shot to preview details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
