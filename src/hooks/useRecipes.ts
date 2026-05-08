import { useState, useEffect } from 'react';
import type { SavedRecipe } from '../types';
import { loadRecipes, saveRecipes } from '../lib/storage';

const PINNED_KEY = 'luxe-cafe-pinned-recipes';

function loadPinned(): Set<string> {
    const stored = localStorage.getItem(PINNED_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
}

export function useRecipes() {
    const [recipes, setRecipes] = useState<SavedRecipe[]>(() => loadRecipes());
    const [pinned, setPinned] = useState<Set<string>>(() => loadPinned());

    useEffect(() => { saveRecipes(recipes); }, [recipes]);
    useEffect(() => {
        localStorage.setItem(PINNED_KEY, JSON.stringify([...pinned]));
    }, [pinned]);

    const addRecipe = (r: SavedRecipe) => setRecipes(prev => [r, ...prev]);
    const updateRecipe = (updated: SavedRecipe) =>
        setRecipes(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    const deleteRecipe = (id: string) => {
        setRecipes(prev => prev.filter(r => r.id !== id));
        setPinned(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };
    const togglePin = (id: string) =>
        setPinned(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    const replaceAll = (next: SavedRecipe[]) => setRecipes(next);

    return { recipes, pinned, addRecipe, updateRecipe, deleteRecipe, togglePin, replaceAll };
}
