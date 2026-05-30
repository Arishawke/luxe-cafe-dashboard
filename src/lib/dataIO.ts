import type { ShotLog, SavedRecipe, BeanProfile, FavoritesMap, MaintenanceEvent } from '../types';
import { RATINGS } from '../constants';
import { reviveShot, reviveRecipe, reviveBean } from './storage';

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
    skipped: { shots: number; recipes: number; beans: number; maintenance: number };
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

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function parsesToValidDate(value: unknown): boolean {
    if (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) return false;
    return !isNaN(new Date(value).getTime());
}

function validShotRecord(s: unknown): s is ShotLog {
    if (!isRecord(s)) return false;
    if (typeof s.beanName !== 'string' || s.beanName.trim() === '') return false;
    if (typeof s.rating !== 'string' || !(RATINGS as readonly string[]).includes(s.rating)) return false;
    if (typeof s.grindSize !== 'number' || !Number.isFinite(s.grindSize)) return false;
    return parsesToValidDate(s.timestamp);
}

function validMaintenanceRecord(m: unknown): m is MaintenanceEvent {
    if (!isRecord(m)) return false;
    if (m.task !== 'cleaning' && m.task !== 'descaling') return false;
    if (typeof m.shotCountAtTime !== 'number') return false;
    return parsesToValidDate(m.performedAt);
}

function validRecipeRecord(r: unknown): r is SavedRecipe {
    if (!isRecord(r)) return false;
    if (typeof r.name !== 'string' || typeof r.beanName !== 'string') return false;
    return parsesToValidDate(r.createdAt);
}

function validBeanRecord(b: unknown): b is BeanProfile {
    if (!isRecord(b)) return false;
    if (typeof b.name !== 'string') return false;
    return parsesToValidDate(b.createdAt);
}

// keep every well-formed record, drop and count the rest (a damaged backup still restores)
function collect<T>(arr: unknown, valid: (x: unknown) => x is T, revive: (x: T) => T = (x) => x): { items: T[]; skipped: number } {
    if (!Array.isArray(arr)) return { items: [], skipped: 0 };
    const items: T[] = [];
    let skipped = 0;
    for (const el of arr) {
        if (valid(el)) items.push(revive(el));
        else skipped++;
    }
    return { items, skipped };
}

export function parseBackup(text: string): ImportResult {
    const data: unknown = JSON.parse(text);
    if (!isRecord(data) || !Array.isArray(data.shots)) {
        throw new Error('Invalid backup file: missing shots data');
    }

    const shots = collect<ShotLog>(data.shots, validShotRecord, reviveShot);
    const recipes = collect<SavedRecipe>(data.recipes, validRecipeRecord, reviveRecipe);
    const beans = collect<BeanProfile>(data.beans, validBeanRecord, reviveBean);
    // older backups predate maintenance, default to empty
    const maintenance = collect<MaintenanceEvent>(data.maintenance, validMaintenanceRecord);

    const favorites: FavoritesMap = isRecord(data.favorites)
        ? Object.fromEntries(Object.entries(data.favorites).filter(([, v]) => typeof v === 'string')) as FavoritesMap
        : {};

    return {
        shots: shots.items,
        recipes: recipes.items,
        beans: beans.items,
        favorites,
        maintenance: maintenance.items,
        skipped: { shots: shots.skipped, recipes: recipes.skipped, beans: beans.skipped, maintenance: maintenance.skipped },
    };
}

export function parseImportFile(file: File): Promise<ImportResult> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                resolve(parseBackup(e.target?.result as string));
            } catch (err) {
                reject(err instanceof Error ? err : new Error('Failed to import file'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}
