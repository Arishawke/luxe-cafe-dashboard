import type { SavedRecipe } from '../../types';
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
    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h3><Icons.Book /> Recipe Library</h3>
                    <button className="modal__close" onClick={onClose}>
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
                                                >
                                                    <Icons.Star filled={isStarred} />
                                                </button>
                                                <button
                                                    className="recipe-library__action-btn"
                                                    onClick={() => onApply(recipe)}
                                                    title="Apply Recipe"
                                                >
                                                    <Icons.Check />
                                                </button>
                                                <button
                                                    className="recipe-library__action-btn"
                                                    onClick={() => onEdit(recipe)}
                                                    title="Edit Recipe"
                                                >
                                                    <Icons.Edit />
                                                </button>
                                                <button
                                                    className="recipe-library__action-btn recipe-library__action-btn--danger"
                                                    onClick={() => onDelete(recipe.id)}
                                                    title="Delete Recipe"
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
                                                <span className="setting-tag">S{recipe.strength}</span>
                                                {recipe.milk && (
                                                    <span className="setting-tag setting-tag--milk">
                                                        🥛 {recipe.milk.type} {recipe.milk.style}
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
