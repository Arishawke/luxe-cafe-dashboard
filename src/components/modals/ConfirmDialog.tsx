import type { ConfirmDialog as ConfirmState } from '../../hooks/useConfirm';
import { useFocusTrap } from '../../hooks';
import Icons from '../Icons';

interface ConfirmDialogProps {
    dialog: ConfirmState | null;
    onConfirm: () => void;
    onClose: () => void;
}

export default function ConfirmDialog({ dialog, onConfirm, onClose }: ConfirmDialogProps) {
    const modalRef = useFocusTrap<HTMLDivElement>();
    if (!dialog) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                ref={modalRef}
                className="modal modal--confirm"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
            >
                <div className="modal__header">
                    <h2 id="confirm-dialog-title">{dialog.title}</h2>
                    <button className="modal__close" aria-label="Close" onClick={onClose}>
                        <Icons.X />
                    </button>
                </div>
                <div className="modal__body">
                    <p className="confirm-message">{dialog.message}</p>
                </div>
                <div className="modal__footer modal__footer--confirm">
                    <button className="btn btn--secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn btn--danger"
                        onClick={onConfirm}
                    >
                        {dialog.confirmLabel ?? 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
