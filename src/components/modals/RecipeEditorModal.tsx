import type { useShotForm } from '../../hooks/useShotForm';
import type { SavedRecipe } from '../../types';
import { COLD_BREW_TYPES } from '../../types';
import { BASKETS, TEMPERATURES, STRENGTHS } from '../../constants';
import Icons from '../Icons';

interface RecipeEditorModalProps {
    open: boolean;
    form: ReturnType<typeof useShotForm>;
    recipeName: string;
    setRecipeName: (v: string) => void;
    editingRecipe: SavedRecipe | null;
    onSave: () => void;
    onCancel: () => void;
}

export default function RecipeEditorModal({
    open,
    form,
    recipeName,
    setRecipeName,
    editingRecipe,
    onSave,
    onCancel,
}: RecipeEditorModalProps) {
    if (!open) return null;
    const isColdBrew = COLD_BREW_TYPES.includes(form.brewType);
    const isEdit = editingRecipe !== null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h3>{isEdit ? <><Icons.Edit /> Edit Recipe</> : 'Save as Recipe'}</h3>
                    <button className="modal__close" aria-label="Close" onClick={onCancel}>
                        <Icons.X />
                    </button>
                </div>
                <div className="modal__body">
                    {!isEdit && (
                        <p className="modal__desc">
                            Save your current settings as a quick recipe for "{form.beanName}"
                        </p>
                    )}
                    <div className="form-group">
                        <label className="form-label">Recipe Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. My Sunday Vanilla Latte"
                            value={recipeName}
                            onChange={(e) => setRecipeName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {isEdit && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Bean Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.beanName}
                                    onChange={(e) => form.setBeanName(e.target.value)}
                                />
                            </div>

                            <div className="edit-recipe__grid">
                                <div className="form-group">
                                    <label className="form-label">Grind Size</label>
                                    <input
                                        type="number"
                                        className="form-input form-input--sm"
                                        min={1}
                                        max={25}
                                        value={form.grindSize}
                                        onChange={(e) => form.setGrindSize(Number(e.target.value))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Strength</label>
                                    <div className="pill-group pill-group--sm">
                                        {STRENGTHS.map((s) => (
                                            <button
                                                key={s.value}
                                                type="button"
                                                className={`pill-btn pill-btn--sm ${form.strength === s.value ? 'pill-btn--active' : ''}`}
                                                onClick={() => form.setStrength(s.value)}
                                                title={s.label}
                                            >
                                                {s.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="edit-recipe__grid">
                                <div className="form-group">
                                    <label className="form-label">Basket</label>
                                    <div className="pill-group pill-group--sm">
                                        {BASKETS.map((b) => (
                                            <button
                                                key={b}
                                                type="button"
                                                className={`pill-btn pill-btn--sm ${form.basket === b ? 'pill-btn--active' : ''}`}
                                                onClick={() => form.setBasket(b)}
                                            >
                                                {b}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {!isColdBrew && (
                                    <div className="form-group">
                                        <label className="form-label">Temperature</label>
                                        <div className="pill-group pill-group--sm">
                                            {TEMPERATURES.map((t) => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    className={`pill-btn pill-btn--sm ${form.temperature === t ? 'pill-btn--active' : ''}`}
                                                    onClick={() => form.setTemperature(t)}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Add-Ins / Notes</label>
                                <textarea
                                    className="form-input form-input--textarea"
                                    placeholder="e.g. Vanilla syrup, extra foam, specific techniques..."
                                    value={form.notes}
                                    onChange={(e) => form.setNotes(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </>
                    )}

                    <div className="modal__preview">
                        <div className="modal__preview-label">{isEdit ? 'Updated recipe:' : 'Will save:'}</div>
                        <div className="setting-tags-wrap">
                            <span className="setting-tag">{form.brewType}</span>
                            <span className="setting-tag">{form.beanName}</span>
                            <span className="setting-tag">Grind {form.grindSize}</span>
                            {!isColdBrew && <span className="setting-tag">{form.temperature}</span>}
                            <span className="setting-tag">{form.basket}</span>
                            <span className="setting-tag">S{form.strength}</span>
                            {form.showMilk && <span className="setting-tag setting-tag--milk">{form.milkType} {form.milkStyle}</span>}
                            {form.notes && <span className="setting-tag">{form.notes}</span>}
                        </div>
                    </div>
                </div>
                <div className="modal__footer">
                    <button className="btn-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        className="btn-submit"
                        onClick={onSave}
                        disabled={!recipeName.trim()}
                    >
                        {isEdit ? 'Update Recipe' : 'Save Recipe'}
                    </button>
                </div>
            </div>
        </div>
    );
}
