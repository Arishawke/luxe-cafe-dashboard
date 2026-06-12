import { useEffect } from 'react';

// Pin the body while a sheet is open so the background can't scroll behind it
// and iOS doesn't shift the fixed overlay (the "jump" on open). Bottom-sheet
// breakpoint only, so desktop keeps its scrollbar (removing it would shift content).
export function useScrollLock(active: boolean) {
    useEffect(() => {
        if (!active || !window.matchMedia('(max-width: 640px)').matches) return;
        const scrollY = window.scrollY;
        const body = document.body;
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.width = '100%';
        return () => {
            body.style.position = '';
            body.style.top = '';
            body.style.width = '';
            window.scrollTo(0, scrollY);
        };
    }, [active]);
}
