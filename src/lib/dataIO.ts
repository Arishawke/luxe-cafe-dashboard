import type { ShotLog, SavedRecipe, BeanProfile, FavoritesMap, MaintenanceEvent } from '../types';

export interface BackupPayload {
    version: number;
    exportedAt: string;
    shots: ShotLog[];
    favorites: FavoritesMap;
    recipes: SavedRecipe[];
    beans: BeanProfile[];
    maintenance: MaintenanceEvent[];
}

export interface ImportResult {
    shots: ShotLog[];
    recipes: SavedRecipe[];
    beans: BeanProfile[];
    favorites: FavoritesMap;
    maintenance: MaintenanceEvent[];
}

export function buildJSONBackup(
    shots: ShotLog[],
    recipes: SavedRecipe[],
    beans: BeanProfile[],
    favorites: FavoritesMap,
    maintenance: MaintenanceEvent[],
): string {
    const data: BackupPayload = {
        version: 2,
        exportedAt: new Date().toISOString(),
        shots,
        favorites,
        recipes,
        beans,
        maintenance,
    };
    return JSON.stringify(data, null, 2);
}

export function buildCSV(shots: ShotLog[]): string {
    const headers = ['Date', 'Bean', 'Brew Type', 'Basket', 'Grind', 'Temperature', 'Strength', 'Rating', 'Extraction Time', 'Dose In (g)', 'Dose Out (g)', 'Ratio', 'Milk Type', 'Milk Style', 'Notes'];
    const csvRows = [headers.join(',')];

    shots.forEach(shot => {
        const ratio = shot.doseIn && shot.doseOut ? `1:${(shot.doseOut / shot.doseIn).toFixed(1)}` : '';
        const row = [
            new Date(shot.timestamp).toLocaleString(),
            `"${shot.beanName.replace(/"/g, '""')}"`,
            shot.brewType,
            shot.basket,
            shot.grindSize,
            shot.temperature || '',
            shot.strength,
            shot.rating,
            shot.extractionTime || '',
            shot.doseIn || '',
            shot.doseOut || '',
            ratio,
            shot.milk?.type || '',
            shot.milk?.style || '',
            `"${(shot.notes || '').replace(/"/g, '""')}"`,
        ];
        csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
}

export function downloadFile(filename: string, content: string, mime: string): void {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function parseImportFile(file: File): Promise<ImportResult> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);

                if (!data.shots || !Array.isArray(data.shots)) {
                    throw new Error('Invalid backup file: missing shots data');
                }

                const shots: ShotLog[] = data.shots.map((s: ShotLog) => ({
                    ...s,
                    timestamp: new Date(s.timestamp),
                }));

                const recipes: SavedRecipe[] = Array.isArray(data.recipes)
                    ? data.recipes.map((r: SavedRecipe) => ({
                        ...r,
                        createdAt: new Date(r.createdAt),
                    }))
                    : [];

                const beans: BeanProfile[] = Array.isArray(data.beans)
                    ? data.beans.map((b: BeanProfile) => ({
                        ...b,
                        createdAt: new Date(b.createdAt),
                    }))
                    : [];

                const favorites: FavoritesMap = data.favorites ?? {};

                // older backups predate maintenance, default to empty
                const maintenance: MaintenanceEvent[] = Array.isArray(data.maintenance)
                    ? data.maintenance
                    : [];

                resolve({ shots, recipes, beans, favorites, maintenance });
            } catch (err) {
                reject(err instanceof Error ? err : new Error('Failed to import file'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}
