import { useEffect } from 'react';
import type { ShotLog, BeanProfile } from '../../types';
import Icons from '../Icons';

interface BeanInputProps {
    beanName: string;
    onBeanInput: (v: string) => void;
    onBeanFocus: () => void;
    onSelectBean: (b: string) => void;
    suggestions: string[];
    showSuggestions: boolean;
    setShowSuggestions: (v: boolean) => void;
    onToggleDropdown: () => void;
    hasAnyBeans: boolean;
    beans: BeanProfile[];
    favoriteShot: ShotLog | null;
    inputRef: React.RefObject<HTMLInputElement | null>;
    suggestionsRef: React.RefObject<HTMLDivElement | null>;
}

export default function BeanInput({
    beanName,
    onBeanInput,
    onBeanFocus,
    onSelectBean,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    onToggleDropdown,
    hasAnyBeans,
    beans,
    favoriteShot,
    inputRef,
    suggestionsRef,
}: BeanInputProps) {
    // close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(e.target as Node) &&
                suggestionsRef.current &&
                !suggestionsRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [inputRef, suggestionsRef, setShowSuggestions]);

    return (
        <>
            <div className="form-group">
                <label className="form-label">Bean Name</label>
                <div className="autocomplete">
                    <div className="autocomplete__input-wrap">
                        <input
                            ref={inputRef}
                            type="text"
                            className="form-input"
                            placeholder="e.g. Ethiopian Yirgacheffe"
                            value={beanName}
                            onChange={(e) => onBeanInput(e.target.value)}
                            onFocus={onBeanFocus}
                            required
                        />
                        {hasAnyBeans && (
                            <button
                                type="button"
                                className="autocomplete__toggle"
                                onClick={onToggleDropdown}
                            >
                                <Icons.ChevronDown />
                            </button>
                        )}
                    </div>
                    {showSuggestions && suggestions.length > 0 && (
                        <div ref={suggestionsRef} className="autocomplete__dropdown">
                            {suggestions.map((name) => {
                                const libraryBean = beans.find(b => b.name.toLowerCase() === name.toLowerCase() && b.isActive);
                                return (
                                    <button
                                        key={name}
                                        type="button"
                                        className={`autocomplete__option ${libraryBean ? 'autocomplete__option--library' : ''}`}
                                        onClick={() => onSelectBean(name)}
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
