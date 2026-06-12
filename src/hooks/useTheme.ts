import { useState, useEffect } from 'react';
import type { ThemeType } from '../types';

const VALID_THEMES: ThemeType[] = ['dark', 'light', 'catppuccin', 'rosepine', 'rosepine-moon', 'fadetouched'];

function loadTheme(): ThemeType {
    const saved = localStorage.getItem('theme');
    return VALID_THEMES.includes(saved as ThemeType) ? (saved as ThemeType) : 'dark';
}

function load24Hour(): boolean {
    return localStorage.getItem('luxe-cafe-24hour') === 'true';
}

export function useTheme() {
    const [theme, setTheme] = useState<ThemeType>(() => loadTheme());
    const [use24Hour, setUse24HourState] = useState<boolean>(() => load24Hour());

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const setUse24Hour = (v: boolean) => {
        setUse24HourState(v);
        localStorage.setItem('luxe-cafe-24hour', String(v));
    };

    const cycleTheme = () =>
        setTheme(prev => VALID_THEMES[(VALID_THEMES.indexOf(prev) + 1) % VALID_THEMES.length]);

    return { theme, setTheme, use24Hour, setUse24Hour, cycleTheme };
}
