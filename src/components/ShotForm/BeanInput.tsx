import { useEffect } from 'react';
import type { ShotLog, BeanProfile } from '../../types';
import type { useBeanAutocomplete } from '../../hooks/useBeanAutocomplete';
import Icons from '../Icons';

interface BeanInputProps {
    beanName: string;
    setBeanName: (v: string) => void;
    autocomplete: ReturnType<typeof useBeanAutocomplete>;
    hasAnyBeans: boolean;
    beans: BeanProfile[];
    favoriteShot: ShotLog | null;
}

export default function BeanInput({
    beanName,
    setBeanName,
    autocomplete,
    hasAnyBeans,
    beans,
    favoriteShot,
}: BeanInputProps) {
    const {
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
    } = autocomplete;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(e.target as Node) &&
                suggestionsRef.current &&
                !suggestionsRef.current.contains(e.target as Node)
            ) {
                closeSuggestions();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [inputRef, suggestionsRef, closeSuggestions]);

    return (
        <>
            <div className="form-group">
                <label className="form-label" htmlFor="shot-bean-name">Bean Name</label>
                <div className="autocomplete">
                    <div className="autocomplete__input-wrap">
                        <input
                            ref={inputRef}
                            id="shot-bean-name"
                            type="text"
                            className="form-input"
                            placeholder="e.g. Ethiopian Yirgacheffe"
                            value={beanName}
                            onChange={(e) => handleInput(e.target.value, setBeanName)}
                            onFocus={handleFocus}
                            onKeyDown={(e) => handleKeyDown(e, setBeanName)}
                            role="combobox"
                            aria-autocomplete="list"
                            aria-expanded={showSuggestions && filteredBeans.length > 0}
                            aria-controls="shot-bean-listbox"
                            aria-activedescendant={activeIndex >= 0 ? `shot-bean-option-${activeIndex}` : undefined}
                            required
                        />
                        {hasAnyBeans && (
                            <button
                                type="button"
                                className="autocomplete__toggle"
                                onClick={toggleDropdown}
                                aria-label="Show saved beans"
                            >
                                <Icons.ChevronDown />
                            </button>
                        )}
                    </div>
                    {showSuggestions && filteredBeans.length > 0 && (
                        <div ref={suggestionsRef} id="shot-bean-listbox" className="autocomplete__dropdown" role="listbox">
                            {filteredBeans.map((name, index) => {
                                const libraryBean = beans.find(b => b.name.toLowerCase() === name.toLowerCase() && b.isActive);
                                return (
                                    <button
                                        key={name}
                                        id={`shot-bean-option-${index}`}
                                        type="button"
                                        role="option"
                                        tabIndex={-1}
                                        data-option-index={index}
                                        aria-selected={activeIndex === index}
                                        className={`autocomplete__option ${libraryBean ? 'autocomplete__option--library' : ''} ${activeIndex === index ? 'autocomplete__option--active' : ''}`}
                                        onClick={() => select(name, setBeanName)}
                                    >
                                        {libraryBean && <Icons.Bean />}
                                        <span className="autocomplete__option-name">{name}</span>
                                        {libraryBean?.roaster && (
                                            <span className="autocomplete__option-roaster">{libraryBean.roaster}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {favoriteShot && (
                <div className="target-recipe">
                    <div className="target-recipe__header">
                        <Icons.Target />
                        <span>Target Recipe for {favoriteShot.beanName}</span>
                    </div>
                    <div className="target-recipe__settings">
                        <span className="setting-tag setting-tag--gold">Grind {favoriteShot.grindSize}</span>
                        {favoriteShot.temperature && <span className="setting-tag setting-tag--gold">{favoriteShot.temperature}</span>}
                        <span className="setting-tag setting-tag--gold">{favoriteShot.basket}</span>
                        <span className="setting-tag setting-tag--gold">S{favoriteShot.strength}</span>
                    </div>
                </div>
            )}
        </>
    );
}
