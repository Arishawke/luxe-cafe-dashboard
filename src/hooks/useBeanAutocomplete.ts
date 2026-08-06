import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import type { ShotLog, BeanProfile } from '../types';
import { getUniqueBeans } from '../lib/beans';

export function useBeanAutocomplete(beans: BeanProfile[], shots: ShotLog[]) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredBeans, setFilteredBeans] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const allSuggestions = () => {
        const libraryBeans = beans.filter(b => b.isActive).map(b => b.name);
        const historyBeans = getUniqueBeans(shots);
        return [...new Set([...libraryBeans, ...historyBeans])].sort((a, b) => a.localeCompare(b));
    };

    const handleInput = (value: string, setBeanName: (v: string) => void) => {
        setBeanName(value);
        const all = allSuggestions();
        const filtered = value.trim()
            ? all.filter(b => b.toLowerCase().includes(value.toLowerCase()))
            : all;
        setFilteredBeans(filtered);
        setShowSuggestions(filtered.length > 0);
        setActiveIndex(-1);
    };

    const handleFocus = () => {
        setFilteredBeans(allSuggestions());
        setShowSuggestions(true);
        setActiveIndex(-1);
    };

    const select = (bean: string, setBeanName: (v: string) => void) => {
        setBeanName(bean);
        setShowSuggestions(false);
        setActiveIndex(-1);
    };

    const toggleDropdown = () => {
        setFilteredBeans(allSuggestions());
        setShowSuggestions(!showSuggestions);
        setActiveIndex(-1);
    };

    const closeSuggestions = () => {
        setShowSuggestions(false);
        setActiveIndex(-1);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, setBeanName: (v: string) => void) => {
        if (event.key === 'Escape') {
            closeSuggestions();
            return;
        }
        if (event.key === 'Enter' && activeIndex >= 0) {
            event.preventDefault();
            select(filteredBeans[activeIndex], setBeanName);
            return;
        }
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        if (!showSuggestions) {
            const all = allSuggestions();
            const filtered = event.currentTarget.value.trim()
                ? all.filter(bean => bean.toLowerCase().includes(event.currentTarget.value.toLowerCase()))
                : all;
            setFilteredBeans(filtered);
            setShowSuggestions(filtered.length > 0);
            setActiveIndex(filtered.length > 0 ? 0 : -1);
            return;
        }
        setActiveIndex(current => {
            if (filteredBeans.length === 0) return -1;
            if (event.key === 'ArrowDown') return Math.min(current + 1, filteredBeans.length - 1);
            return current <= 0 ? 0 : current - 1;
        });
    };

    useEffect(() => {
        if (activeIndex < 0) return;
        suggestionsRef.current
            ?.querySelector<HTMLElement>(`[data-option-index="${activeIndex}"]`)
            ?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    return {
        showSuggestions,
        filteredBeans,
        activeIndex,
        inputRef,
        suggestionsRef,
        handleInput,
        handleFocus,
        handleKeyDown,
        select,
        toggleDropdown,
        closeSuggestions,
    };
}
