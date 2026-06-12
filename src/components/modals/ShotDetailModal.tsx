import type { Rating, ShotLog } from '../../types';
import { useFocusTrap } from '../../hooks';
import Icons from '../Icons';
import ShotDetailView from '../ShotDetailView';

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
    onRate: (id: string, rating: Rating) => void;
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
    onRate,
}: ShotDetailModalProps) {
    const modalRef = useFocusTrap<HTMLDivElement>();
    if (!shot) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                ref={modalRef}
                className="modal modal--wide"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="shot-detail-title"
            >
                <div className="modal__header">
                    <h3 id="shot-detail-title">{shot.beanName}</h3>
                    <div className="modal__header-actions">
                        <button
                            className="modal__header-btn"
                            onClick={() => { onClose(); onEdit(shot); }}
                            title="Edit shot"
                            aria-label="Edit shot"
                        >
                            <Icons.Edit />
                        </button>
                        <button
                            className="modal__header-btn modal__header-btn--delete"
                            onClick={(e) => { e.stopPropagation(); onClose(); onDelete(shot.id); }}
                            title="Delete shot"
                            aria-label="Delete shot"
                        >
                            <Icons.Trash />
                        </button>
                        <button className="modal__close" aria-label="Close" onClick={onClose}>
                            <Icons.X />
                        </button>
                    </div>
                </div>
                <div className="modal__body">
                    <ShotDetailView
                        shot={shot}
                        use24Hour={use24Hour}
                        isFavorite={isFavorite}
                        ratingConfig={ratingConfig}
                        onRate={onRate}
                    />
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
                        className="btn-action btn-action--primary"
                        onClick={() => { onClose(); onDuplicate(shot); }}
                        title="Copy settings to form"
                    >
                        <Icons.Copy /> Brew Again
                    </button>
                    <button className="btn-action" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
