import { useState, useEffect } from 'react';

export interface Toast {
    message: string;
    type: 'success' | 'error' | 'info';
}

export function useToast(autoDismissMs: number = 3000) {
    const [toast, setToast] = useState<Toast | null>(null);

    // Auto-dismiss toast after specified time
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), autoDismissMs);
            return () => clearTimeout(timer);
        }
    }, [toast, autoDismissMs]);

    const showToast = (message: string, type: Toast['type'] = 'success') => {
        setToast({ message, type });
    };

    const hideToast = () => setToast(null);

    return { toast, showToast, hideToast };
}
