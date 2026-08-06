import { loadShots, loadRecipes, loadBeans, loadFavorites, loadMaintenance } from './storage';
import { buildBackupObject } from './dataIO';

// One-time data bridge for the move to luxecafe.arishawke.com. localStorage is
// origin-scoped, so the old origin packs its data into the URL and the new origin
// unpacks it: each side only ever touches its own storage, sidestepping browser
// storage partitioning. Delete this module and its hooks (main.tsx, the App
// landing effect, MigrationNotice) once the old domain is retired.

const OLD_HOST = 'luxe-cafe-dashboard.vercel.app';
const NEW_HOST = 'luxecafe.arishawke.com';
const OLD_ORIGIN = `https://${OLD_HOST}`;
const NEW_ORIGIN = `https://${NEW_HOST}`;

const SEND_HASH = '#export-to-new';
const PAYLOAD_HASH_PREFIX = '#migrate=';
const TOOBIG_HASH = '#migrate-toobig';
const DISMISS_KEY = 'luxe-cafe-migration-dismissed';

// Stay well under browser address-bar limits; larger sets fall back to Export/Import.
const MAX_PAYLOAD = 1_500_000;

interface LocationLike {
    hostname: string;
    hash: string;
    search: string;
    assign(url: string): void;
    replace(url: string): void;
}

interface WindowLike {
    history: { replaceState(data: unknown, unused: string, url: string): void };
    location: { pathname: string; search: string };
}

export interface MigrationLanding {
    json?: string;
    tooBig?: boolean;
    invalid?: boolean;
}

// Old origin carrying the send flag: serialize this origin's data and redirect to
// the new origin. Returns true when it redirected, so the caller skips rendering.
export function handleMigrationSend(loc: LocationLike = window.location): boolean {
    if (loc.hostname !== OLD_HOST || loc.hash !== SEND_HASH) return false;
    const backup = buildBackupObject(loadShots(), loadRecipes(), loadBeans(), loadFavorites(), loadMaintenance());
    const payload = encodeURIComponent(JSON.stringify(backup));
    loc.replace(payload.length > MAX_PAYLOAD ? `${NEW_ORIGIN}/${TOOBIG_HASH}` : `${NEW_ORIGIN}/${PAYLOAD_HASH_PREFIX}${payload}`);
    return true;
}

// New origin: pull a migration payload (or the too-big sentinel) out of the hash.
// Pure read; the caller clears the hash after applying.
export function readMigrationLanding(loc: LocationLike = window.location): MigrationLanding | null {
    if (loc.hash === TOOBIG_HASH) return { tooBig: true };
    if (loc.hash.startsWith(PAYLOAD_HASH_PREFIX)) {
        try {
            return { json: decodeURIComponent(loc.hash.slice(PAYLOAD_HASH_PREFIX.length)) };
        } catch {
            return { invalid: true };
        }
    }
    return null;
}

export function clearMigrationHash(win: WindowLike = window): void {
    win.history.replaceState(null, '', win.location.pathname + win.location.search);
}

// Show the offer only on the new domain with no data yet (or via the dev preview
// param), and never after the user dismisses it.
export function shouldOfferMigration(loc: LocationLike = window.location): boolean {
    if (loc.search.includes('migrate-preview')) return true;
    if (localStorage.getItem(DISMISS_KEY) === 'true') return false;
    if (loc.hostname !== NEW_HOST) return false;
    return loadShots().length === 0 && loadRecipes().length === 0 && loadBeans().length === 0;
}

export function startMigration(loc: LocationLike = window.location): void {
    loc.assign(`${OLD_ORIGIN}/${SEND_HASH}`);
}

export function dismissMigration(): void {
    try {
        localStorage.setItem(DISMISS_KEY, 'true');
    } catch { /* private mode or quota: nothing to persist, fine */ }
}
