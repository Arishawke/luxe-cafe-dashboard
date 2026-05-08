import { useState, useRef } from 'react';
import type { FormEvent } from 'react';
import type { ShotLog, Rating, SavedRecipe } from './types';
import { COLD_BREW_TYPES } from './types';
import { generateId } from './lib/format';
import { getDaysSinceRoast, getFreshnessStatus, getUniqueBeans } from './lib/beans';
import { getSuggestedSettings } from './lib/suggestions';
import { RATINGS, RATING_COLORS, BALANCED_RATING_INDEX } from './constants';
import { useToast, useConfirm, useTimer, useShots, useBeans, useRecipes, useFavorites, useTheme, useShotForm, useKeyboardShortcuts } from './hooks';
import Icons from './components/Icons';
import Header from './components/Header';
import ShotForm from './components/ShotForm/ShotForm';
import ConfirmDialog from './components/modals/ConfirmDialog';
import RecipeEditorModal from './components/modals/RecipeEditorModal';
import ShotDetailModal from './components/modals/ShotDetailModal';
import BeanLibraryModal from './components/modals/BeanLibraryModal';
import RecipeLibraryModal from './components/modals/RecipeLibraryModal';
import StatsModal from './components/modals/StatsModal';
import CaffeineModal from './components/modals/CaffeineModal';
import HistoryModal from './components/modals/HistoryModal';
import SettingsModal from './components/modals/SettingsModal';
import { buildJSONBackup, buildCSV, downloadFile, parseImportFile } from './lib/dataIO';
import Toast from './components/Toast';
import SuggestionCard from './components/SuggestionCard';
import ShotHistory from './components/ShotHistory';
import ShotComparison from './components/ShotComparison';
import { RATING_COLOR_CLASS } from './lib/ratings';

// Rating config with icons (kept here since it references Icons)
const RATING_CONFIG: Record<Rating, { icon: () => React.JSX.Element; colorClass: string }> = {
  'Very Sour': { icon: Icons.DoubleChevronLeft, colorClass: RATING_COLOR_CLASS['Very Sour'] },
  'Sour': { icon: Icons.Citrus, colorClass: RATING_COLOR_CLASS.Sour },
  'Balanced': { icon: Icons.Sparkles, colorClass: RATING_COLOR_CLASS.Balanced },
  'Bitter': { icon: Icons.Flame, colorClass: RATING_COLOR_CLASS.Bitter },
  'Very Bitter': { icon: Icons.DoubleChevronRight, colorClass: RATING_COLOR_CLASS['Very Bitter'] },
};

function App() {
  const form = useShotForm();

  // Modal state
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [editingRecipe, setEditingRecipe] = useState<SavedRecipe | null>(null);
  const [selectedShot, setSelectedShot] = useState<ShotLog | null>(null);
  const [editingShot, setEditingShot] = useState<ShotLog | null>(null);

  // Bean Library modal
  const [showBeanLibrary, setShowBeanLibrary] = useState(false);

  // Stats modal
  const [showStats, setShowStats] = useState(false);

  // Recipe Library modal
  const [showRecipeLibrary, setShowRecipeLibrary] = useState(false);

  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Caffeine tracker modal
  const [showCaffeine, setShowCaffeine] = useState(false);

  // History filter
  const [beanFilter, setBeanFilter] = useState<string>('');
  const [notesSearch, setNotesSearch] = useState<string>('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [previewShot, setPreviewShot] = useState<ShotLog | null>(null);

  // Shot comparison
  const [compareShots, setCompareShots] = useState<[string | null, string | null]>([null, null]);

  // Custom hooks for UI state
  const { confirmDialog, showConfirm, closeConfirm } = useConfirm();
  const { toast, showToast, hideToast } = useToast(3000);
  const { timerRunning, timerSeconds, startTimer, stopTimer, resetTimer } = useTimer();
  const { shots, addShot, updateShot: replaceShot, deleteShot: removeShot, replaceAll: setShots } = useShots();
  const { beans, addBean, updateBean: replaceBean, deleteBean: removeBean, toggleActive: toggleBeanActiveHook, replaceAll: setBeans } = useBeans();
  const { recipes, pinned: pinnedRecipes, addRecipe, updateRecipe: replaceRecipe, deleteRecipe: removeRecipe, togglePin: togglePinRecipe, replaceAll: setRecipes } = useRecipes();
  const { favorites, toggleFavorite, replaceAll: setFavorites } = useFavorites();
  const { theme, setTheme, use24Hour, setUse24Hour, cycleTheme } = useTheme();

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredBeans, setFilteredBeans] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Keyboard shortcuts panel (desktop only)
  const [showShortcuts, setShowShortcuts] = useState(() => {
    const stored = localStorage.getItem('luxe-cafe-show-shortcuts');
    return stored === null ? true : stored === 'true';
  });

  // Derived state
  const rating = RATINGS[form.ratingIndex];
  const isColdBrew = COLD_BREW_TYPES.includes(form.brewType);

  useKeyboardShortcuts({
    canSubmit: () =>
      !showRecipeModal && !showRecipeLibrary && !showBeanLibrary && !showStats && !showCaffeine
      && !showSettings && !selectedShot && !editingRecipe
      && form.beanName.trim() !== '',
    onSubmit: () => {
      const f = document.querySelector('.shot-form') as HTMLFormElement | null;
      f?.requestSubmit();
    },
    onCycleTheme: cycleTheme,
    onToggleBeanLibrary: () => setShowBeanLibrary(prev => !prev),
    onEscape: () => {
      if (confirmDialog) closeConfirm();
      else if (selectedShot) setSelectedShot(null);
      else if (editingRecipe) setEditingRecipe(null);
      else if (showHistoryModal) { setShowHistoryModal(false); setPreviewShot(null); }
      else if (showBeanLibrary) setShowBeanLibrary(false);
      else if (showRecipeLibrary) setShowRecipeLibrary(false);
      else if (showStats) setShowStats(false);
      else if (showCaffeine) setShowCaffeine(false);
      else if (showRecipeModal) setShowRecipeModal(false);
      else if (showSettings) setShowSettings(false);
    },
  });

  // Filter beans for autocomplete - combine bean library + shot history
  const getAllBeanSuggestions = () => {
    const libraryBeans = beans.filter(b => b.isActive).map(b => b.name);
    const historyBeans = getUniqueBeans(shots);
    // Combine and deduplicate, prioritizing library beans
    const combined = [...new Set([...libraryBeans, ...historyBeans])];
    return combined.sort((a, b) => a.localeCompare(b));
  };

  const handleBeanInput = (value: string) => {
    form.setBeanName(value);
    const allBeans = getAllBeanSuggestions();
    if (value.trim()) {
      const filtered = allBeans.filter(b =>
        b.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredBeans(filtered);
    } else {
      setFilteredBeans(allBeans);
    }
  };

  const handleBeanFocus = () => {
    setFilteredBeans(getAllBeanSuggestions());
    setShowSuggestions(true);
  };

  const selectBean = (bean: string) => {
    form.setBeanName(bean);
    setShowSuggestions(false);
  };

  // Get favorite shot for current bean
  const currentBeanKey = form.beanName.trim().toLowerCase();
  const favoriteId = favorites[currentBeanKey];
  const favoriteShot = favoriteId ? shots.find(s => s.id === favoriteId) : null;

  // Get last shot for current bean (for tips) - prefer favorite if available
  const lastShotForBean = favoriteShot || (form.beanName.trim()
    ? shots.find(s => s.beanName.toLowerCase() === currentBeanKey)
    : null);

  // Get all shots for current bean (for journey view)
  const shotsForBean = form.beanName.trim()
    ? shots.filter(s => s.beanName.toLowerCase() === currentBeanKey).slice(0, 5)
    : [];

  const suggestedSettings = getSuggestedSettings(lastShotForBean);

  const applySuggestedSettings = () => {
    if (!suggestedSettings || !lastShotForBean) return;
    form.applyFromShot(lastShotForBean);
    form.setGrindSize(suggestedSettings.grindSize);
    form.setTemperature(suggestedSettings.temperature);
    form.setRatingIndex(BALANCED_RATING_INDEX);
  };

  // Save current form as recipe
  const saveAsRecipe = () => {
    if (!recipeName.trim() || !form.beanName.trim()) return;

    const newRecipe: SavedRecipe = {
      id: generateId(),
      name: recipeName.trim(),
      beanName: form.beanName.trim(),
      brewType: form.brewType,
      basket: form.basket,
      grindSize: form.grindSize,
      temperature: isColdBrew ? undefined : form.temperature,
      strength: form.strength,
      milk: form.showMilk ? { type: form.milkType, style: form.milkStyle } : undefined,
      notes: form.notes.trim() || undefined,
      createdAt: new Date(),
    };

    addRecipe(newRecipe);
    setShowRecipeModal(false);
    setRecipeName('');
  };

  // Delete a recipe (with confirmation)
  const deleteRecipe = (id: string) => {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;

    showConfirm(
      'Delete Recipe',
      `Are you sure you want to delete "${recipe.name}"?`,
      () => {
        removeRecipe(id);
        showToast('Recipe deleted', 'info');
      }
    );
  };

  // Open edit recipe modal
  const openEditRecipe = (recipe: SavedRecipe) => {
    setEditingRecipe(recipe);
    setRecipeName(recipe.name);
    form.setBeanName(recipe.beanName);
    form.setBrewType(recipe.brewType);
    form.setBasket(recipe.basket);
    form.setGrindSize(recipe.grindSize);
    form.setStrength(recipe.strength);
    if (recipe.temperature) form.setTemperature(recipe.temperature);
    if (recipe.milk) {
      form.setShowMilk(true);
      form.setMilkType(recipe.milk.type);
      form.setMilkStyle(recipe.milk.style);
    } else {
      form.setShowMilk(false);
    }
    form.setNotes(recipe.notes || '');
    // Close library and open edit modal
    setShowRecipeLibrary(false);
    setShowRecipeModal(true);
  };

  // Update existing recipe
  const updateRecipe = () => {
    if (!editingRecipe || !recipeName.trim()) return;

    const updated: SavedRecipe = {
      ...editingRecipe,
      name: recipeName.trim(),
      beanName: form.beanName,
      brewType: form.brewType,
      basket: form.basket,
      grindSize: form.grindSize,
      temperature: isColdBrew ? undefined : form.temperature,
      strength: form.strength,
      milk: form.showMilk ? { type: form.milkType, style: form.milkStyle } : undefined,
      notes: form.notes.trim() || undefined,
    };

    replaceRecipe(updated);
    setEditingRecipe(null);
    setRecipeName('');
    showToast('Recipe updated', 'success');
  };

  // Toggle shot for comparison
  const toggleCompareShot = (id: string) => {
    setCompareShots(prev => {
      if (prev[0] === id) return [null, prev[1]];
      if (prev[1] === id) return [prev[0], null];
      if (prev[0] === null) return [id, prev[1]];
      if (prev[1] === null) return [prev[0], id];
      return [prev[1], id]; // Replace oldest
    });
  };

  // Get shots for comparison
  const shot1 = compareShots[0] ? shots.find(s => s.id === compareShots[0]) : null;
  const shot2 = compareShots[1] ? shots.find(s => s.id === compareShots[1]) : null;

  // Delete a shot (with confirmation)
  const deleteShot = (id: string) => {
    const shot = shots.find(s => s.id === id);
    if (!shot) return;

    showConfirm(
      'Delete Shot',
      `Are you sure you want to delete this shot for "${shot.beanName}"?`,
      () => {
        // Also remove from favorites if it was a favorite
        const beanKey = shot.beanName.toLowerCase();
        if (favorites[beanKey] === id) {
          const updated = { ...favorites };
          delete updated[beanKey];
          setFavorites(updated);
        }
        removeShot(id);
        setSelectedShot(null);
        showToast('Shot deleted', 'info');
      }
    );
  };

  const duplicateShot = (shot: ShotLog) => {
    form.applyFromShot(shot);
    form.setRatingIndex(BALANCED_RATING_INDEX);
    setSelectedShot(null);
  };

  const openEditShot = (shot: ShotLog) => {
    form.applyFromShot(shot);
    const ratingIdx = RATINGS.indexOf(shot.rating);
    form.setRatingIndex(ratingIdx >= 0 ? ratingIdx : BALANCED_RATING_INDEX);
    if (shot.doseIn) {
      form.setShowDose(true);
      form.setDoseIn(shot.doseIn.toString());
    }
    if (shot.doseOut) {
      form.setDoseOut(shot.doseOut.toString());
    }
    if (shot.extractionTime) {
      form.setShowTimer(true);
    }
    setEditingShot(shot);
    setSelectedShot(null);
    setShowHistoryModal(false);
    showToast('Editing shot - make changes and click Update Shot', 'info');
  };

  // Update existing shot
  const updateShot = () => {
    if (!editingShot || !form.beanName.trim()) return;

    const updated: ShotLog = {
      ...editingShot,
      beanName: form.beanName.trim(),
      brewType: form.brewType,
      basket: form.basket,
      grindSize: form.grindSize,
      temperature: isColdBrew ? undefined : form.temperature,
      strength: form.strength,
      rating,
      milk: form.showMilk ? { type: form.milkType, style: form.milkStyle } : undefined,
      notes: form.notes.trim() || undefined,
      doseIn: form.doseIn ? parseFloat(form.doseIn) : undefined,
      doseOut: form.doseOut ? parseFloat(form.doseOut) : undefined,
      // Preserve original timestamp and id
    };

    // Update the shot in state
    replaceShot(updated);

    // Update favorites if bean name changed
    const oldBeanKey = editingShot.beanName.toLowerCase();
    const newBeanKey = form.beanName.trim().toLowerCase();
    if (oldBeanKey !== newBeanKey && favorites[oldBeanKey] === editingShot.id) {
      const updatedFavorites = { ...favorites };
      delete updatedFavorites[oldBeanKey];
      updatedFavorites[newBeanKey] = editingShot.id;
      setFavorites(updatedFavorites);
    }

    // Clear editing state
    setEditingShot(null);
    showToast('Shot updated', 'success');
  };

  // wraps removeBean with a confirm dialog (orchestrator-level)
  const deleteBean = (id: string) => {
    const bean = beans.find(b => b.id === id);
    if (!bean) return;

    showConfirm(
      'Delete Bean',
      `Are you sure you want to delete "${bean.name}"?`,
      () => {
        removeBean(id);
        showToast('Bean deleted', 'info');
      }
    );
  };

  // delegate to lib/dataIO; thin wrapper for toasts
  const exportData = () => {
    const json = buildJSONBackup(shots, recipes, beans, favorites);
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(`luxe-cafe-backup-${date}.json`, json, 'application/json');
    showToast('Backup exported', 'success');
  };

  const exportToCSV = () => {
    if (shots.length === 0) {
      showToast('No shots to export', 'error');
      return;
    }
    const csv = buildCSV(shots);
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(`luxe-cafe-shots-${date}.csv`, csv, 'text/csv;charset=utf-8;');
    showToast(`Exported ${shots.length} shots to CSV`, 'success');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = await parseImportFile(file);
      setShots(data.shots);
      setRecipes(data.recipes);
      setBeans(data.beans);
      setFavorites(data.favorites);
      setImportStatus({
        type: 'success',
        message: `Imported ${data.shots.length} shots, ${data.recipes.length} recipes, ${data.beans.length} beans`,
      });
    } catch (err) {
      setImportStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to import file' });
    }
    // reset file input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Grind size controls
  const decrementGrind = () => form.setGrindSize(Math.max(1, form.grindSize - 1));
  const incrementGrind = () => form.setGrindSize(Math.min(25, form.grindSize + 1));

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.beanName.trim()) return;

    if (editingShot) {
      updateShot();
      form.reset();
      setShowSuggestions(false);
      resetTimer();
      return;
    }

    // Get extraction time from either manual input or stopwatch
    const getExtractionTime = (): number | undefined => {
      if (form.manualTimeInput) {
        const parsed = parseFloat(form.manualTimerValue);
        return parsed > 0 ? Math.round(parsed * 10) / 10 : undefined;
      }
      return timerSeconds > 0 ? Math.round(timerSeconds * 10) / 10 : undefined;
    };

    const newShot: ShotLog = {
      id: generateId(),
      beanName: form.beanName.trim(),
      brewType: form.brewType,
      basket: form.basket,
      grindSize: form.grindSize,
      temperature: isColdBrew ? undefined : form.temperature,
      strength: form.strength,
      rating,
      milk: form.showMilk ? { type: form.milkType, style: form.milkStyle } : undefined,
      notes: form.notes.trim() || undefined,
      extractionTime: getExtractionTime(),
      doseIn: form.doseIn ? parseFloat(form.doseIn) : undefined,
      doseOut: form.doseOut ? parseFloat(form.doseOut) : undefined,
      timestamp: new Date(),
    };

    addShot(newShot);
    form.reset();
    setShowSuggestions(false);
    resetTimer();
    showToast('Shot logged!', 'success');
  };

  // Sort history: favorite for current bean at top, then by date
  const sortedShots = [...shots].sort((a, b) => {
    const aIsFav = favorites[a.beanName.toLowerCase()] === a.id;
    const bIsFav = favorites[b.beanName.toLowerCase()] === b.id;
    if (aIsFav && !bIsFav) return -1;
    if (bIsFav && !aIsFav) return 1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return (
    <div className="dashboard">
      {/* Header */}
      <Header
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        onOpenBeanLibrary={() => { setShowBeanLibrary(true); setMobileMenuOpen(false); }}
        onOpenRecipes={() => { setShowRecipeLibrary(true); setMobileMenuOpen(false); }}
        onOpenStats={() => { setShowStats(true); setMobileMenuOpen(false); }}
        onOpenCaffeine={() => { setShowCaffeine(true); setMobileMenuOpen(false); }}
        onOpenSettings={() => { setShowSettings(true); setMobileMenuOpen(false); }}
      />

      {/* Quick Recipe Hotbar - Only shows starred/pinned recipes */}
      {recipes.filter(r => pinnedRecipes.has(r.id)).length > 0 && (
        <div className="recipe-menu">
          <div className="recipe-menu__label">
            <Icons.Star filled /> Quick Recipes
          </div>
          <div className="recipe-menu__chips">
            {recipes
              .filter(recipe => pinnedRecipes.has(recipe.id))
              .map((recipe) => (
                <div key={recipe.id} className="recipe-chip recipe-chip--pinned">
                  <button
                    className="recipe-chip__btn"
                    onClick={() => {
                      form.applyFromRecipe(recipe);
                      showToast(`Applied "${recipe.name}"`, 'success');
                    }}
                    title={`${recipe.beanName} • ${recipe.brewType}${recipe.notes ? ` • ${recipe.notes}` : ''}`}
                  >
                    {recipe.name}
                  </button>
                  <button
                    className="recipe-chip__dismiss"
                    onClick={() => {
                      togglePinRecipe(recipe.id);
                      showToast(`Removed "${recipe.name}" from quick recipes`, 'info');
                    }}
                    title="Remove from quick recipes"
                  >
                    <Icons.X />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="dashboard__grid">
        {/* Left Column - Shot Logger */}
        <div className="card">
          <h2 className="card__title">
            <Icons.Edit /> {editingShot ? 'Edit Shot' : 'Log New Shot'}
          </h2>

          <ShotForm
            form={form}
            timer={{ timerRunning, timerSeconds, startTimer, stopTimer, resetTimer }}
            isColdBrew={isColdBrew}
            onSubmit={handleSubmit}
            onIncrementGrind={incrementGrind}
            onDecrementGrind={decrementGrind}
            beans={beans}
            hasAnyBeans={shots.length > 0 || beans.length > 0}
            suggestions={filteredBeans}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            onBeanInput={handleBeanInput}
            onBeanFocus={handleBeanFocus}
            onSelectBean={selectBean}
            onToggleDropdown={() => {
              setFilteredBeans(getAllBeanSuggestions());
              setShowSuggestions(!showSuggestions);
            }}
            inputRef={inputRef}
            suggestionsRef={suggestionsRef}
            favoriteShot={favoriteShot ?? null}
            editingShot={editingShot}
            onCancelEdit={() => {
              setEditingShot(null);
              form.setBeanName('');
              form.setNotes('');
              form.setDoseIn('');
              form.setDoseOut('');
              showToast('Edit cancelled', 'info');
            }}
            onOpenRecipeModal={() => setShowRecipeModal(true)}
          />
        </div>

        {/* Right Column */}
        <div className="side-panel">
          {/* Smart Barista Card */}
          <div className="card">
            <h2 className="card__title">
              <Icons.ChefHat /> Smart Barista
            </h2>

            {/* Bean Freshness Alert */}
            {(() => {
              if (!form.beanName.trim()) return null;
              const beanProfile = beans.find(b => b.name.toLowerCase() === form.beanName.toLowerCase());
              if (!beanProfile?.roastDate) return null;

              const days = getDaysSinceRoast(beanProfile.roastDate);
              const freshness = getFreshnessStatus(days);

              // Only show alert for fading or stale beans
              if (days === null || days <= 21) return null;

              return (
                <div className={`freshness-alert freshness-alert--${days > 35 ? 'stale' : 'fading'}`}>
                  <span className="freshness-alert__badge" style={{ background: freshness.color }}>
                    {freshness.label}
                  </span>
                  <span className="freshness-alert__text">
                    {beanProfile.name} was roasted {days} days ago
                    {days > 35
                      ? '. Consider adjusting grind finer to compensate.'
                      : '. Still good, but best to use soon.'}
                  </span>
                </div>
              );
            })()}

            <SuggestionCard
              lastShot={lastShotForBean ?? null}
              suggestion={suggestedSettings}
              shotsForBean={shotsForBean}
              beanName={form.beanName}
              ratingConfig={RATING_CONFIG}
              ratingColors={RATING_COLORS}
              onApply={applySuggestedSettings}
            />
          </div>

          {/* History Log */}
          <ShotHistory
            shots={shots}
            sortedShots={sortedShots}
            favorites={favorites}
            use24Hour={use24Hour}
            beanFilter={beanFilter}
            setBeanFilter={setBeanFilter}
            notesSearch={notesSearch}
            setNotesSearch={setNotesSearch}
            ratingConfig={RATING_CONFIG}
            onSelectShot={setSelectedShot}
            onToggleFavorite={toggleFavorite}
            onEditShot={openEditShot}
            onDeleteShot={deleteShot}
            onOpenHistoryModal={() => setShowHistoryModal(true)}
          />
        </div>
      </div>

      <RecipeEditorModal
        open={showRecipeModal || editingRecipe !== null}
        form={form}
        recipeName={recipeName}
        setRecipeName={setRecipeName}
        editingRecipe={editingRecipe}
        onSave={() => editingRecipe ? updateRecipe() : saveAsRecipe()}
        onCancel={() => { setShowRecipeModal(false); setEditingRecipe(null); setRecipeName(''); }}
      />

      <ShotDetailModal
        shot={selectedShot}
        use24Hour={use24Hour}
        isFavorite={!!selectedShot && favorites[selectedShot.beanName.toLowerCase()] === selectedShot.id}
        isCompared={!!selectedShot && compareShots.includes(selectedShot.id)}
        ratingConfig={RATING_CONFIG}
        onClose={() => setSelectedShot(null)}
        onEdit={openEditShot}
        onDelete={deleteShot}
        onDuplicate={duplicateShot}
        onToggleCompare={(id) => {
          const wasCompared = compareShots.includes(id);
          toggleCompareShot(id);
          showToast(wasCompared ? 'Removed from comparison' : 'Added to comparison', 'info');
        }}
      />

      <BeanLibraryModal
        open={showBeanLibrary}
        beans={beans}
        onAdd={addBean}
        onUpdate={replaceBean}
        onDelete={deleteBean}
        onToggleActive={toggleBeanActiveHook}
        onClose={() => setShowBeanLibrary(false)}
      />

      <RecipeLibraryModal
        open={showRecipeLibrary}
        recipes={recipes}
        pinnedRecipes={pinnedRecipes}
        onApply={(recipe) => {
          form.applyFromRecipe(recipe);
          setShowRecipeLibrary(false);
          showToast(`Applied "${recipe.name}"`, 'success');
        }}
        onEdit={openEditRecipe}
        onDelete={deleteRecipe}
        onTogglePin={(recipe, wasStarred) => {
          togglePinRecipe(recipe.id);
          showToast(
            wasStarred
              ? `Removed "${recipe.name}" from quick recipes`
              : `Added "${recipe.name}" to quick recipes`,
            wasStarred ? 'info' : 'success'
          );
        }}
        onClose={() => setShowRecipeLibrary(false)}
      />

      <StatsModal
        open={showStats}
        shots={shots}
        onClose={() => setShowStats(false)}
      />



      <CaffeineModal
        open={showCaffeine}
        shots={shots}
        onClose={() => setShowCaffeine(false)}
      />

      <HistoryModal
        open={showHistoryModal}
        shots={shots}
        sortedShots={sortedShots}
        favorites={favorites}
        previewShot={previewShot}
        setPreviewShot={setPreviewShot}
        beanFilter={beanFilter}
        setBeanFilter={setBeanFilter}
        notesSearch={notesSearch}
        setNotesSearch={setNotesSearch}
        use24Hour={use24Hour}
        ratingConfig={RATING_CONFIG}
        compareShots={compareShots}
        onClose={() => { setShowHistoryModal(false); setPreviewShot(null); }}
        onSelectShot={(shot) => setSelectedShot(shot)}
        onToggleFavorite={toggleFavorite}
        onToggleCompare={(id) => {
          const wasCompared = compareShots.includes(id);
          toggleCompareShot(id);
          showToast(wasCompared ? 'Removed from comparison' : 'Added to comparison', 'info');
        }}
        onEditShot={openEditShot}
        onDuplicateShot={duplicateShot}
        onDeleteShot={deleteShot}
      />

      <SettingsModal
        open={showSettings}
        theme={theme}
        setTheme={setTheme}
        use24Hour={use24Hour}
        setUse24Hour={setUse24Hour}
        shotsCount={shots.length}
        recipesCount={recipes.length}
        beansCount={beans.length}
        importStatus={importStatus}
        fileInputRef={fileInputRef}
        onExportJSON={exportData}
        onExportCSV={exportToCSV}
        onImport={handleImport}
        onClearAll={() => {
          showConfirm(
            'Clear All Data',
            `Are you sure you want to delete ALL data? This will permanently remove ${shots.length} shots, ${recipes.length} recipes, and ${beans.length} beans. This action cannot be undone.`,
            () => {
              setShots([]);
              setRecipes([]);
              setBeans([]);
              setFavorites({});
              showToast('All data cleared', 'success');
              setShowSettings(false);
            }
          );
        }}
        onClose={() => { setShowSettings(false); setImportStatus(null); }}
      />

      {/* Shot Comparison Panel */}
      <ShotComparison
        shot1={shot1}
        shot2={shot2}
        onClear={() => setCompareShots([null, null])}
        onRemoveAt={(idx) => setCompareShots(prev => idx === 0 ? [null, prev[1]] : [prev[0], null])}
      />
      <ConfirmDialog
        dialog={confirmDialog}
        onConfirm={() => {
          confirmDialog?.onConfirm();
          closeConfirm();
        }}
        onClose={closeConfirm}
      />

      {/* Keyboard Shortcuts Panel (Desktop Only) */}
      <div className={`shortcuts-panel ${showShortcuts ? 'shortcuts-panel--open' : ''}`}>
        {showShortcuts ? (
          <>
            <div className="shortcuts-panel__header">
              <span>⌨️ Shortcuts</span>
              <button
                className="shortcuts-panel__close"
                onClick={() => {
                  setShowShortcuts(false);
                  localStorage.setItem('luxe-cafe-show-shortcuts', 'false');
                }}
                title="Hide shortcuts"
              >
                <Icons.X />
              </button>
            </div>
            <div className="shortcuts-panel__list">
              <div className="shortcuts-panel__item">
                <kbd>Ctrl</kbd>+<kbd>Enter</kbd>
                <span>Log Shot</span>
              </div>
              <div className="shortcuts-panel__item">
                <kbd>Ctrl</kbd>+<kbd>B</kbd>
                <span>Bean Library</span>
              </div>
              <div className="shortcuts-panel__item">
                <kbd>Ctrl</kbd>+<kbd>D</kbd>
                <span>Cycle Theme</span>
              </div>
              <div className="shortcuts-panel__item">
                <kbd>Esc</kbd>
                <span>Close Modal</span>
              </div>
            </div>
          </>
        ) : (
          <button
            className="shortcuts-panel__toggle"
            onClick={() => {
              setShowShortcuts(true);
              localStorage.setItem('luxe-cafe-show-shortcuts', 'true');
            }}
            title="Show keyboard shortcuts"
          >
            ⌨️
          </button>
        )}
      </div>

      {/* Toast Notification */}
      <Toast toast={toast} onDismiss={hideToast} shortcutsOpen={showShortcuts} />
    </div>
  );
}

export default App;
