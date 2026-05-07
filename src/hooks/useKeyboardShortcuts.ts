import { useEffect, useRef } from 'react';

export interface ShortcutHandlers {
    onSubmit: () => void;
    onCycleTheme: () => void;
    onToggleBeanLibrary: () => void;
    onEscape: () => void;
    canSubmit: () => boolean;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
    const ref = useRef(handlers);

    useEffect(() => {
        ref.current = handlers;
    });

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const target = document.activeElement;
            const inField = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';

            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && ref.current.canSubmit()) {
                e.preventDefault();
                ref.current.onSubmit();
                return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'd' && !inField) {
                e.preventDefault();
                ref.current.onCycleTheme();
                return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'b' && !inField) {
                e.preventDefault();
                ref.current.onToggleBeanLibrary();
                return;
            }
            if (e.key === 'Escape') {
                ref.current.onEscape();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, []);
}
