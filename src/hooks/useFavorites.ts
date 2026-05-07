import { useState, useEffect } from 'react';
import type { FavoritesMap, ShotLog } from '../types';
import { loadFavorites, saveFavorites } from '../lib/storage';

export function useFavorites() {
    const [favorites, setFavorites] = useState<FavoritesMap>(() => loadFavorites());

    useEffect(() => { saveFavorites(favorites); }, [favorites]);

    const toggleFavorite = (shot: ShotLog) => {
        const key = shot.beanName.toLowerCase();
        setFavorites(prev => {
            if (prev[key] === shot.id) {
                const next = { ...prev };
                delete next[key];
                return next;
            }
            return { ...prev, [key]: shot.id };
        });
    };

    const isFavorite = (shot: ShotLog) =>
        favorites[shot.beanName.toLowerCase()] === shot.id;

    const replaceAll = (next: FavoritesMap) => setFavorites(next);

    return { favorites, toggleFavorite, isFavorite, replaceAll };
}
