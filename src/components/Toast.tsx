import type { Toast as ToastState } from '../hooks/useToast';
import Icons from './Icons';

interface ToastProps {
    toast: ToastState | null;
    onDismiss: () => void;
    shortcutsOpen?: boolean;
}

export default function Toast({ toast, onDismiss, shortcutsOpen = false }: ToastProps) {
    if (!toast) return null;
    return (
        <div className={`toast toast--${toast.type} ${shortcutsOpen ? 'toast--shortcuts-open' : ''}`}>
            <span className="toast__message">{toast.message}</span>
            <button className="toast__close" onClick={onDismiss}>
                <Icons.X />
            </button>
        </div>
    );
}
