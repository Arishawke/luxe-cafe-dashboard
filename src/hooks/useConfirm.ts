import { useState } from 'react';

export interface ConfirmDialog {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
}

export function useConfirm() {
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog | null>(null);

    const showConfirm = (
        title: string,
        message: string,
        onConfirm: () => void,
        confirmLabel?: string,
    ) => {
        setConfirmDialog({ isOpen: true, title, message, confirmLabel, onConfirm });
    };

    const closeConfirm = () => setConfirmDialog(null);

    return { confirmDialog, showConfirm, closeConfirm };
}
