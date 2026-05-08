import { useState } from 'react';
import type { BeanProfile, ProcessMethod, RoastLevel } from '../../types';
import { PROCESS_METHODS, ROAST_LEVELS } from '../../constants';
import { generateId } from '../../lib/format';
import { getDaysSinceRoast, getFreshnessStatus } from '../../lib/beans';
import Icons from '../Icons';

interface BeanLibraryModalProps {
    open: boolean;
    beans: BeanProfile[];
    onAdd: (bean: BeanProfile) => void;
    onUpdate: (bean: BeanProfile) => void;
    onDelete: (id: string) => void;
    onToggleActive: (id: string) => void;
    onClose: () => void;
}

export default function BeanLibraryModal({
    open,
    beans,
    onAdd,
    onUpdate,
    onDelete,
    onToggleActive,
    onClose,
}: BeanLibraryModalProps) {
    // form state owned by modal — purely UI state, no value when closed
    const [name, setName] = useState('');
    const [roaster, setRoaster] = useState('');
    const [origin, setOrigin] = useState('');
    const [roastLevel, setRoastLevel] = useState<RoastLevel>('Medium');
    const [process, setProcess] = useState<ProcessMethod>('Washed');
    const [roastDate, setRoastDate] = useState('');
    const [flavorNotes, setFlavorNotes] = useState('');
    const [editing, setEditing] = useState<BeanProfile | null>(null);

    if (!open) return null;

    const reset = () => {
        setName('');
        setRoaster('');
        setOrigin('');
        setRoastLevel('Medium');
        setProcess('Washed');
        setRoastDate('');
        setFlavorNotes('');
        setEditing(null);
    };

    const startEdit = (bean: BeanProfile) => {
        setEditing(bean);
        setName(bean.name);
        setRoaster(bean.roaster ?? '');
        setOrigin(bean.origin ?? '');
        setRoastLevel(bean.roastLevel ?? 'Medium');
        setProcess(bean.processMethod ?? 'Washed');
        setRoastDate(bean.roastDate ?? '');
        setFlavorNotes(bean.flavorNotes ?? '');
    };

    const save = () => {
        if (!name.trim()) return;
        if (editing) {
            onUpdate({
                ...editing,
                name: name.trim(),
                roaster: roaster.trim() || undefined,
                origin: origin.trim() || undefined,
                roastLevel,
                processMethod: process,
                roastDate: roastDate || undefined,
                flavorNotes: flavorNotes.trim() || undefined,
            });
        } else {
            onAdd({
                id: generateId(),
                name: name.trim(),
                roaster: roaster.trim() || undefined,
                origin: origin.trim() || undefined,
                roastLevel,
                processMethod: process,
                roastDate: roastDate || undefined,
                flavorNotes: flavorNotes.trim() || undefined,
                isActive: true,
                createdAt: new Date(),
            });
        }
        reset();
    };

    const handleDelete = (id: string) => {
        onDelete(id);
        // clear editor if user was editing the deleted bean
        if (editing?.id === id) reset();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h3><Icons.Bean /> Bean Library</h3>
                    <button className="modal__close" onClick={handleClose}>
                        <Icons.X />
                    </button>
                </div>
                <div className="modal__body modal__body--split">
                    {/* Bean Form */}
                    <div className="bean-form">
                        <h4>{editing ? 'Edit Bean' : 'Add New Bean'}</h4>
                        <div className="form-group">
                            <label className="form-label">Bean Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Ethiopian Yirgacheffe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Roaster</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Counter Culture"
                                    value={roaster}
                                    onChange={(e) => setRoaster(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Origin</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Ethiopia"
                                    value={origin}
                                    onChange={(e) => setOrigin(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Roast Level</label>
                                <div className="select-wrap">
                                    <select
                                        className="form-select"
                                        value={roastLevel}
                                        onChange={(e) => setRoastLevel(e.target.value as RoastLevel)}
                                    >
                                        {ROAST_LEVELS.map((level) => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                    <Icons.ChevronDown />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Process</label>
                                <div className="select-wrap">
                                    <select
                                        className="form-select"
                                        value={process}
                                        onChange={(e) => setProcess(e.target.value as ProcessMethod)}
                                    >
                                        {PROCESS_METHODS.map((method) => (
                                            <option key={method} value={method}>{method}</option>
                                        ))}
                                    </select>
                                    <Icons.ChevronDown />
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Roast Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={roastDate}
                                onChange={(e) => setRoastDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Flavor Notes</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Blueberry, Chocolate, Citrus"
                                value={flavorNotes}
                                onChange={(e) => setFlavorNotes(e.target.value)}
                            />
                        </div>
                        <div className="bean-form__actions">
                            {editing && (
                                <button className="btn-cancel" onClick={reset}>Cancel</button>
                            )}
                            <button
                                className="btn-submit"
                                onClick={save}
                                disabled={!name.trim()}
                            >
                                {editing ? 'Update Bean' : 'Add Bean'}
                            </button>
                        </div>
                    </div>

                    {/* Bean List */}
                    <div className="bean-list">
                        <h4>Your Beans ({beans.length})</h4>
                        {beans.length > 0 ? (
                            <div className="bean-list__items">
                                {beans.map((bean) => {
                                    const days = getDaysSinceRoast(bean.roastDate);
                                    const freshness = getFreshnessStatus(days);
                                    return (
                                        <div
                                            key={bean.id}
                                            className={`bean-card ${!bean.isActive ? 'bean-card--inactive' : ''} ${editing?.id === bean.id ? 'bean-card--editing' : ''}`}
                                        >
                                            <div className="bean-card__main" onClick={() => startEdit(bean)}>
                                                <div className="bean-card__name">{bean.name}</div>
                                                <div className="bean-card__meta">
                                                    {bean.roaster && <span>{bean.roaster}</span>}
                                                    {bean.origin && <span>{bean.origin}</span>}
                                                    {bean.roastLevel && <span>{bean.roastLevel}</span>}
                                                </div>
                                                {bean.roastDate && (
                                                    <div
                                                        className="bean-card__freshness"
                                                        style={{ color: freshness.color }}
                                                    >
                                                        <Icons.Calendar />
                                                        {days} days • {freshness.label}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="bean-card__actions">
                                                <button
                                                    className={`bean-card__toggle ${bean.isActive ? 'bean-card__toggle--active' : ''}`}
                                                    onClick={() => onToggleActive(bean.id)}
                                                    title={bean.isActive ? 'Mark as inactive' : 'Mark as active'}
                                                >
                                                    {bean.isActive ? '✓' : '○'}
                                                </button>
                                                <button
                                                    className="bean-card__delete"
                                                    onClick={() => handleDelete(bean.id)}
                                                    title="Delete bean"
                                                >
                                                    <Icons.Trash />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="empty-state empty-state--small">
                                <Icons.Bean />
                                <p>No beans yet. Add your first bean using the form!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
