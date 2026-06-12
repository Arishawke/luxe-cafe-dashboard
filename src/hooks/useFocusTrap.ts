import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap<T extends HTMLElement = HTMLElement>() {
    const ref = useRef<T>(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const previousActive = document.activeElement as HTMLElement | null;
        const focusables = node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        focusables[0]?.focus({ preventScroll: true });

        const handler = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            const elements = node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
            if (elements.length === 0) return;
            const first = elements[0];
            const last = elements[elements.length - 1];
            const active = document.activeElement;
            if (e.shiftKey && active === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && active === last) {
                e.preventDefault();
                first.focus();
            }
        };

        node.addEventListener('keydown', handler);
        return () => {
            node.removeEventListener('keydown', handler);
            previousActive?.focus({ preventScroll: true });
        };
    }, []);

    return ref;
}
