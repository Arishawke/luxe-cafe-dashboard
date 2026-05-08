import { useState, useRef } from 'react';
import type { ShotLog, BeanProfile } from '../types';
import { getUniqueBeans } from '../lib/beans';

export function useBeanAutocomplete(beans: BeanProfile[], shots: ShotLog[]) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredBeans, setFilteredBeans] = useState<string[]>([]);
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
        if (value.trim()) {
            setFilteredBeans(all.filter(b => b.toLowerCase().includes(value.toLowerCase())));
        } else {
            setFilteredBeans(all);
        }
    };

    const handleFocus = () => {
        setFilteredBeans(allSuggestions());
        setShowSuggestions(true);
    };

    const select = (bean: string, setBeanName: (v: string) => void) => {
        setBeanName(bean);
        setShowSuggestions(false);
    };

    const toggleDropdown = () => {
        setFilteredBeans(allSuggestions());
        setShowSuggestions(!showSuggestions);
    };

    return {
        showSuggestions,
        setShowSuggestions,
        filteredBeans,
        inputRef,
        suggestionsRef,
        handleInput,
        handleFocus,
        select,
        toggleDropdown,
    };
}
