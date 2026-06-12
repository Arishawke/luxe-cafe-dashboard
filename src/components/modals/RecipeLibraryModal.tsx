import type { SavedRecipe } from '../../types';
import { useFocusTrap } from '../../hooks';
import Icons from '../Icons';

interface RecipeLibraryModalProps {
    open: boolean;
    recipes: SavedRecipe[];
    pinnedRecipes: Set<string>;
    onApply: (recipe: SavedRecipe) => void;
    onEdit: (recipe: SavedRecipe) => void;
    onDelete: (id: string) => void;
    onTogglePin: (recipe: SavedRecipe, wasStarred: boolean) => void;
    onClose: () => void;
}

export default function RecipeLibraryModal({
    open,
    recipes,
    pinnedRecipes,
    onApply,
    onEdit,
    onDelete,
    onTogglePin,
    onClose,
}: RecipeLibraryModalProps) {
    const modalRef = useFocusTrap<HTMLDivElement>();
    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                ref={modalRef}
                className="modal modal--large"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="recipe-library-title"
            >
                <div className="modal__header">
                    <h3 id="recipe-library-title"><Icons.Book /> Recipe Library</h3>
                    <button className="modal__close" aria-label="Close" onClick={onClose}>
                        <Icons.X />
                    </button>
                </div>
                <div className="modal__body">
                    {recipes.length === 0 ? (
                        <div className="empty-state">
                            <Icons.Book />
                            <p>No recipes saved yet</p>
                            <small>Save a recipe after logging a shot to quickly recall your favorite settings</small>
                        </div>
                    ) : (
                        <div className="recipe-library">
                            {recipes.map((recipe) => {
                                const isStarred = pinnedRecipes.has(recipe.id);
                                return (
                                    <div key={recipe.id} className={`recipe-library__item ${isStarred ? 'recipe-library__item--starred' : ''}`}>
                                        <div className="recipe-library__header">
                                            <h4 className="recipe-library__name">{recipe.name}</h4>
                                            <div className="recipe-library__actions">
                                                <button
                                                    className={`recipe-library__action-btn ${isStarred ? 'recipe-library__action-btn--starred' : ''}`}
                                                    onClick={() => onTogglePin(recipe, isStarred)}
                                                    title={isStarred ? 'Remove from quick recipes' : 'Add to quick recipes'}
                                                    aria-label={isStarred ? 'Remove from quick recipes' : 'Add to quick recipes'}
                                                    aria-pressed={isStarred}
                                                >
                                                    <Icons.Star filled={isStarred} />
                                                </button>
                                                <button
                                                    className="recipe-library__action-btn recipe-library__apply-btn"
                                                    onClick={() => onApply(recipe)}
                                                    title="Apply these settings to the form"
                                                    aria-label="Apply recipe"
                                                >
                                                    Apply
                                                </button>
                                                <button
                                                    className="recipe-library__action-btn"
                                                    onClick={() => onEdit(recipe)}
                                                    title="Edit Recipe"
                                                    aria-label="Edit recipe"
                                                >
                                                    <Icons.Edit />
                                                </button>
                                                <button
                                                    className="recipe-library__action-btn recipe-library__action-btn--danger"
                                                    onClick={() => onDelete(recipe.id)}
                                                    title="Delete Recipe"
                                                    aria-label="Delete recipe"
                                                >
                                                    <Icons.Trash />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="recipe-library__details">
                                            <span className="recipe-library__bean">
                                                <Icons.Bean /> {recipe.beanName}
                                            </span>
                                            <div className="recipe-library__settings">
                                                <span className="setting-tag">{recipe.brewType}</span>
                                                <span className="setting-tag">Grind {recipe.grindSize}</span>
                                                {recipe.temperature && <span className="setting-tag">{recipe.temperature}</span>}
                                                <span className="setting-tag">{recipe.basket}</span>
                                                <span className="setting-tag">Str {recipe.strength}</span>
                                                {recipe.milk && (
                                                    <span className="setting-tag setting-tag--milk">
                                                        <Icons.Milk /> {recipe.milk.type} {recipe.milk.style}
                                                    </span>
                                                )}
                                            </div>
                                            {recipe.notes && (
                                                <p className="recipe-library__notes">{recipe.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
