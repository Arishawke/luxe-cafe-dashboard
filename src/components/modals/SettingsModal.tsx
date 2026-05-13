import type { ChangeEvent, RefObject } from 'react';
import type { ThemeType, MaintenanceEvent } from '../../types';
import { useFocusTrap } from '../../hooks';
import Icons from '../Icons';

interface SettingsModalProps {
    open: boolean;
    theme: ThemeType;
    setTheme: (t: ThemeType) => void;
    use24Hour: boolean;
    setUse24Hour: (v: boolean) => void;
    shotsCount: number;
    recipesCount: number;
    beansCount: number;
    importStatus: { type: 'success' | 'error'; message: string } | null;
    fileInputRef: RefObject<HTMLInputElement | null>;
    onExportJSON: () => void;
    onExportCSV: () => void;
    onImport: (e: ChangeEvent<HTMLInputElement>) => void;
    onClearAll: () => void;
    onClose: () => void;
    lastCleaning: MaintenanceEvent | null;
    lastDescaling: MaintenanceEvent | null;
    onRecordCleaning: () => void;
    onRecordDescaling: () => void;
}

function formatLastDone(event: MaintenanceEvent | null): string {
    if (!event) return 'Never';
    return new Date(event.performedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

const THEME_OPTIONS: { value: ThemeType; label: string; emoji: string }[] = [
    { value: 'dark', label: 'Coffee Dark', emoji: '☕' },
    { value: 'light', label: 'Coffee Light', emoji: '🥛' },
    { value: 'catppuccin', label: 'Catppuccin', emoji: '🍵' },
    { value: 'rosepine', label: 'Rose Pine', emoji: '🌹' },
    { value: 'rosepine-moon', label: 'Rose Pine Moon', emoji: '🌙' },
];

export default function SettingsModal({
    open,
    theme,
    setTheme,
    use24Hour,
    setUse24Hour,
    shotsCount,
    recipesCount,
    beansCount,
    importStatus,
    fileInputRef,
    onExportJSON,
    onExportCSV,
    onImport,
    onClearAll,
    onClose,
    lastCleaning,
    lastDescaling,
    onRecordCleaning,
    onRecordDescaling,
}: SettingsModalProps) {
    const modalRef = useFocusTrap<HTMLDivElement>();
    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                ref={modalRef}
                className="modal modal--settings"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-modal-title"
            >
                <div className="modal__header">
                    <h3 id="settings-modal-title"><Icons.Sliders /> Settings</h3>
                    <button className="modal__close" aria-label="Close" onClick={onClose}>
                        <Icons.X />
                    </button>
                </div>
                <div className="modal__body">
                    <div className="settings-section">
                        <h4 className="settings-section__title">🎨 Appearance</h4>

                        <div className="prefs-section">
                            <label className="prefs-section__label">Theme</label>
                            <div className="theme-picker__options">
                                {THEME_OPTIONS.map((t) => (
                                    <button
                                        key={t.value}
                                        className={`theme-picker__option ${theme === t.value ? 'theme-picker__option--active' : ''}`}
                                        onClick={() => setTheme(t.value)}
                                    >
                                        <span className="theme-picker__emoji">{t.emoji}</span>
                                        <span className="theme-picker__label">{t.label}</span>
                                        {theme === t.value && <Icons.Check />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="prefs-section">
                            <label className="prefs-section__label">Time Format</label>
                            <div className="prefs-toggle">
                                <button
                                    className={`prefs-toggle__option ${!use24Hour ? 'prefs-toggle__option--active' : ''}`}
                                    onClick={() => setUse24Hour(false)}
                                >
                                    🕐 12-hour
                                </button>
                                <button
                                    className={`prefs-toggle__option ${use24Hour ? 'prefs-toggle__option--active' : ''}`}
                                    onClick={() => setUse24Hour(true)}
                                >
                                    🕒 24-hour
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h4 className="settings-section__title">Maintenance</h4>

                        <div className="maintenance-rows">
                            <div className="maintenance-row">
                                <div className="maintenance-row__info">
                                    <span className="maintenance-row__label">Cleaning cycle</span>
                                    <span className="maintenance-row__last">
                                        Last: {formatLastDone(lastCleaning)}
                                        {lastCleaning && ` (at ${lastCleaning.shotCountAtTime} shots)`}
                                    </span>
                                </div>
                                <button className="maintenance-row__btn" onClick={onRecordCleaning}>
                                    Mark done now
                                </button>
                            </div>

                            <div className="maintenance-row">
                                <div className="maintenance-row__info">
                                    <span className="maintenance-row__label">Descale cycle</span>
                                    <span className="maintenance-row__last">
                                        Last: {formatLastDone(lastDescaling)}
                                    </span>
                                </div>
                                <button className="maintenance-row__btn" onClick={onRecordDescaling}>
                                    Mark done now
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h4 className="settings-section__title">💾 Data</h4>

                        <div className="data-summary">
                            <div className="data-summary__item">
                                <span className="data-summary__count">{shotsCount}</span>
                                <span className="data-summary__label">Shots</span>
                            </div>
                            <div className="data-summary__item">
                                <span className="data-summary__count">{recipesCount}</span>
                                <span className="data-summary__label">Recipes</span>
                            </div>
                            <div className="data-summary__item">
                                <span className="data-summary__count">{beansCount}</span>
                                <span className="data-summary__label">Beans</span>
                            </div>
                        </div>

                        {importStatus && (
                            <div className={`import-status import-status--${importStatus.type}`}>
                                {importStatus.type === 'success' ? '✓' : '✗'} {importStatus.message}
                            </div>
                        )}

                        <div className="data-actions">
                            <button className="data-action-btn" onClick={onExportJSON}>
                                <Icons.Download />
                                <span>Export Backup</span>
                                <small>Download all data as JSON</small>
                            </button>
                            <button className="data-action-btn" onClick={onExportCSV}>
                                <Icons.BarChart />
                                <span>Export to CSV</span>
                                <small>Shot history as spreadsheet</small>
                            </button>
                            <button className="data-action-btn" onClick={() => fileInputRef.current?.click()}>
                                <Icons.Upload />
                                <span>Import Backup</span>
                                <small>Restore from JSON file</small>
                            </button>
                            <button
                                className="data-action-btn data-action-btn--danger"
                                onClick={onClearAll}
                            >
                                <Icons.Trash />
                                <span>Clear All Data</span>
                                <small>Permanently delete everything</small>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={onImport}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <p className="data-warning">
                            ⚠️ Importing will replace all existing data
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
