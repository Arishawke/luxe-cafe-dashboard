import { useState, useRef } from 'react';
import type { FormEvent } from 'react';
import type { ShotLog, Rating, SavedRecipe, BeanProfile, ProcessMethod, RoastLevel } from './types';
import { COLD_BREW_TYPES } from './types';
import { generateId, formatDate } from './lib/format';
import { getDaysSinceRoast, getFreshnessStatus, getUniqueBeans } from './lib/beans';
import { getSuggestedSettings } from './lib/suggestions';
import { RATINGS, RATING_COLORS, BASKETS, TEMPERATURES, STRENGTHS, PROCESS_METHODS, ROAST_LEVELS, BALANCED_RATING_INDEX } from './constants';
import { useToast, useConfirm, useTimer, useShots, useBeans, useRecipes, useFavorites, useTheme, useShotForm, useKeyboardShortcuts } from './hooks';
import Icons from './components/Icons';
import Header from './components/Header';
import ShotForm from './components/ShotForm/ShotForm';
import ConfirmDialog from './components/modals/ConfirmDialog';
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
  const [editingBean, setEditingBean] = useState<BeanProfile | null>(null);
  const [newBeanName, setNewBeanName] = useState('');
  const [newBeanRoaster, setNewBeanRoaster] = useState('');
  const [newBeanOrigin, setNewBeanOrigin] = useState('');
  const [newBeanRoastLevel, setNewBeanRoastLevel] = useState<RoastLevel>('Medium');
  const [newBeanProcess, setNewBeanProcess] = useState<ProcessMethod>('Washed');
  const [newBeanRoastDate, setNewBeanRoastDate] = useState('');
  const [newBeanFlavorNotes, setNewBeanFlavorNotes] = useState('');

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
  const [showThemePicker, setShowThemePicker] = useState(false);

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
      !showRecipeModal && !showBeanLibrary && !showStats && !showCaffeine
      && !showThemePicker && !selectedShot && !editingRecipe
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
      else if (showStats) setShowStats(false);
      else if (showCaffeine) setShowCaffeine(false);
      else if (showRecipeModal) setShowRecipeModal(false);
      else if (showThemePicker) setShowThemePicker(false);
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

  // Bean Library functions
  const resetBeanForm = () => {
    setEditingBean(null);
    setNewBeanName('');
    setNewBeanRoaster('');
    setNewBeanOrigin('');
    setNewBeanRoastLevel('Medium');
    setNewBeanProcess('Washed');
    setNewBeanRoastDate('');
    setNewBeanFlavorNotes('');
  };

  const openEditBean = (bean: BeanProfile) => {
    setEditingBean(bean);
    setNewBeanName(bean.name);
    setNewBeanRoaster(bean.roaster || '');
    setNewBeanOrigin(bean.origin || '');
    setNewBeanRoastLevel(bean.roastLevel || 'Medium');
    setNewBeanProcess(bean.processMethod || 'Washed');
    setNewBeanRoastDate(bean.roastDate || '');
    setNewBeanFlavorNotes(bean.flavorNotes || '');
  };

  const saveBean = () => {
    if (!newBeanName.trim()) return;

    if (editingBean) {
      replaceBean({
        ...editingBean,
        name: newBeanName.trim(),
        roaster: newBeanRoaster.trim() || undefined,
        origin: newBeanOrigin.trim() || undefined,
        roastLevel: newBeanRoastLevel,
        processMethod: newBeanProcess,
        roastDate: newBeanRoastDate || undefined,
        flavorNotes: newBeanFlavorNotes.trim() || undefined,
      });
    } else {
      const newBean: BeanProfile = {
        id: generateId(),
        name: newBeanName.trim(),
        roaster: newBeanRoaster.trim() || undefined,
        origin: newBeanOrigin.trim() || undefined,
        roastLevel: newBeanRoastLevel,
        processMethod: newBeanProcess,
        roastDate: newBeanRoastDate || undefined,
        flavorNotes: newBeanFlavorNotes.trim() || undefined,
        isActive: true,
        createdAt: new Date(),
      };
      addBean(newBean);
    }
    resetBeanForm();
  };

  const deleteBean = (id: string) => {
    const bean = beans.find(b => b.id === id);
    if (!bean) return;

    showConfirm(
      'Delete Bean',
      `Are you sure you want to delete "${bean.name}"?`,
      () => {
        removeBean(id);
        if (editingBean?.id === id) resetBeanForm();
        showToast('Bean deleted', 'info');
      }
    );
  };

  // Export all data as JSON
  const exportData = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      shots: shots,
      favorites: favorites,
      recipes: recipes,
      beans: beans,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luxe-cafe-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup exported', 'success');
  };

  // Export shots to CSV
  const exportToCSV = () => {
    if (shots.length === 0) {
      showToast('No shots to export', 'error');
      return;
    }

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
        `"${(shot.notes || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luxe-cafe-shots-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${shots.length} shots to CSV`, 'success');
  };

  // Import data from JSON file
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        // Validate structure
        if (!data.shots || !Array.isArray(data.shots)) {
          throw new Error('Invalid backup file: missing shots data');
        }

        // Import shots with date conversion
        const importedShots = data.shots.map((s: ShotLog) => ({
          ...s,
          timestamp: new Date(s.timestamp),
        }));
        setShots(importedShots);

        // Import favorites
        if (data.favorites) {
          setFavorites(data.favorites);
        }

        // Import recipes with date conversion
        if (data.recipes && Array.isArray(data.recipes)) {
          const importedRecipes = data.recipes.map((r: SavedRecipe) => ({
            ...r,
            createdAt: new Date(r.createdAt),
          }));
          setRecipes(importedRecipes);
        }

        // Import beans with date conversion
        if (data.beans && Array.isArray(data.beans)) {
          const importedBeans = data.beans.map((b: BeanProfile) => ({
            ...b,
            createdAt: new Date(b.createdAt),
          }));
          setBeans(importedBeans);
        }

        setImportStatus({ type: 'success', message: `Imported ${importedShots.length} shots, ${data.recipes?.length || 0} recipes, ${data.beans?.length || 0} beans` });
      } catch (err) {
        setImportStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to import file' });
      }
    };
    reader.readAsText(file);

    // Reset file input
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
        onOpenSettings={() => { setShowThemePicker(true); setMobileMenuOpen(false); }}
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

      {/* Save Recipe Modal */}
      {showRecipeModal && (
        <div className="modal-overlay" onClick={() => setShowRecipeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Save as Recipe</h3>
              <button className="modal__close" onClick={() => setShowRecipeModal(false)}>
                <Icons.X />
              </button>
            </div>
            <div className="modal__body">
              <p className="modal__desc">
                Save your current settings as a quick recipe for "{form.beanName}"
              </p>
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
              <div className="modal__preview">
                <div className="modal__preview-label">Will save:</div>
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
              <button className="btn-cancel" onClick={() => setShowRecipeModal(false)}>
                Cancel
              </button>
              <button
                className="btn-submit"
                onClick={saveAsRecipe}
                disabled={!recipeName.trim()}
              >
                Save Recipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Recipe Modal */}
      {editingRecipe && (
        <div className="modal-overlay" onClick={() => { setEditingRecipe(null); setRecipeName(''); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3><Icons.Edit /> Edit Recipe</h3>
              <button className="modal__close" onClick={() => { setEditingRecipe(null); setRecipeName(''); }}>
                <Icons.X />
              </button>
            </div>
            <div className="modal__body">
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

              {/* Notes/Add-ins */}
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

              <div className="modal__preview">
                <div className="modal__preview-label">Updated recipe:</div>
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
              <button className="btn-cancel" onClick={() => { setEditingRecipe(null); setRecipeName(''); }}>
                Cancel
              </button>
              <button
                className="btn-submit"
                onClick={updateRecipe}
                disabled={!recipeName.trim()}
              >
                Update Recipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shot Details Modal */}
      {selectedShot && (() => {
        const config = RATING_CONFIG[selectedShot.rating];
        const ShotIcon = config.icon;
        const isFavorite = favorites[selectedShot.beanName.toLowerCase()] === selectedShot.id;
        return (
          <div className="modal-overlay" onClick={() => setSelectedShot(null)}>
            <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
              <div className="modal__header">
                <h3>{selectedShot.beanName}</h3>
                <div className="modal__header-actions">
                  <button
                    className="modal__header-btn"
                    onClick={() => openEditShot(selectedShot)}
                    title="Edit shot"
                  >
                    <Icons.Edit />
                  </button>
                  <button
                    className="modal__header-btn modal__header-btn--delete"
                    onClick={(e) => { e.stopPropagation(); deleteShot(selectedShot.id); }}
                    title="Delete shot"
                  >
                    <Icons.Trash />
                  </button>
                  <button className="modal__close" onClick={() => setSelectedShot(null)}>
                    <Icons.X />
                  </button>
                </div>
              </div>
              <div className="modal__body">
                {/* Rating Banner */}
                <div className={`shot-detail__rating shot-detail__rating--${config.colorClass}`}>
                  <ShotIcon />
                  <span>{selectedShot.rating}</span>
                  {isFavorite && <span className="shot-detail__fav-badge">⭐ Favorite</span>}
                </div>

                {/* Timestamp */}
                <div className="shot-detail__timestamp">
                  {new Intl.DateTimeFormat('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: !use24Hour,
                  }).format(selectedShot.timestamp)}
                </div>

                {/* Settings Grid */}
                <div className="shot-detail__grid">
                  <div className="shot-detail__item">
                    <span className="shot-detail__label">Brew Type</span>
                    <span className="shot-detail__value">{selectedShot.brewType}</span>
                  </div>
                  <div className="shot-detail__item">
                    <span className="shot-detail__label">Grind Size</span>
                    <span className="shot-detail__value">{selectedShot.grindSize}</span>
                  </div>
                  {selectedShot.temperature && (
                    <div className="shot-detail__item">
                      <span className="shot-detail__label">Temperature</span>
                      <span className="shot-detail__value">{selectedShot.temperature}</span>
                    </div>
                  )}
                  <div className="shot-detail__item">
                    <span className="shot-detail__label">Basket</span>
                    <span className="shot-detail__value">{selectedShot.basket}</span>
                  </div>
                  <div className="shot-detail__item">
                    <span className="shot-detail__label">Strength</span>
                    <span className="shot-detail__value">{selectedShot.strength}</span>
                  </div>
                  {selectedShot.milk && (
                    <div className="shot-detail__item">
                      <span className="shot-detail__label">Milk</span>
                      <span className="shot-detail__value">{selectedShot.milk.type} {selectedShot.milk.style}</span>
                    </div>
                  )}
                  {selectedShot.extractionTime && (
                    <div className="shot-detail__item">
                      <span className="shot-detail__label">Extraction Time</span>
                      <span className="shot-detail__value">{selectedShot.extractionTime}s</span>
                    </div>
                  )}
                  {selectedShot.doseIn && selectedShot.doseOut && (
                    <div className="shot-detail__item">
                      <span className="shot-detail__label">Dose / Yield</span>
                      <span className="shot-detail__value">
                        {selectedShot.doseIn}g → {selectedShot.doseOut}g (1:{(selectedShot.doseOut / selectedShot.doseIn).toFixed(1)})
                      </span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedShot.notes && (
                  <div className="shot-detail__notes">
                    <span className="shot-detail__label">Notes</span>
                    <p>{selectedShot.notes}</p>
                  </div>
                )}
              </div>
              <div className="modal__footer">
                <button
                  className={`btn-action ${compareShots.includes(selectedShot.id) ? 'btn-action--active' : ''}`}
                  onClick={() => {
                    toggleCompareShot(selectedShot.id);
                    showToast(
                      compareShots.includes(selectedShot.id)
                        ? 'Removed from comparison'
                        : 'Added to comparison',
                      'info'
                    );
                  }}
                  title="Add to comparison"
                >
                  <Icons.BarChart /> Compare
                </button>
                <button
                  className="btn-action"
                  onClick={() => duplicateShot(selectedShot)}
                  title="Copy settings to form"
                >
                  <Icons.Copy /> Brew Again
                </button>
                <button className="btn-action btn-action--primary" onClick={() => setSelectedShot(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Bean Library Modal */}
      {showBeanLibrary && (
        <div className="modal-overlay" onClick={() => { setShowBeanLibrary(false); resetBeanForm(); }}>
          <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3><Icons.Bean /> Bean Library</h3>
              <button className="modal__close" onClick={() => { setShowBeanLibrary(false); resetBeanForm(); }}>
                <Icons.X />
              </button>
            </div>
            <div className="modal__body modal__body--split">
              {/* Bean Form */}
              <div className="bean-form">
                <h4>{editingBean ? 'Edit Bean' : 'Add New Bean'}</h4>
                <div className="form-group">
                  <label className="form-label">Bean Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ethiopian Yirgacheffe"
                    value={newBeanName}
                    onChange={(e) => setNewBeanName(e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Roaster</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Counter Culture"
                      value={newBeanRoaster}
                      onChange={(e) => setNewBeanRoaster(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Origin</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Ethiopia"
                      value={newBeanOrigin}
                      onChange={(e) => setNewBeanOrigin(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Roast Level</label>
                    <div className="select-wrap">
                      <select
                        className="form-select"
                        value={newBeanRoastLevel}
                        onChange={(e) => setNewBeanRoastLevel(e.target.value as RoastLevel)}
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
                        value={newBeanProcess}
                        onChange={(e) => setNewBeanProcess(e.target.value as ProcessMethod)}
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
                    value={newBeanRoastDate}
                    onChange={(e) => setNewBeanRoastDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Flavor Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Blueberry, Chocolate, Citrus"
                    value={newBeanFlavorNotes}
                    onChange={(e) => setNewBeanFlavorNotes(e.target.value)}
                  />
                </div>
                <div className="bean-form__actions">
                  {editingBean && (
                    <button className="btn-cancel" onClick={resetBeanForm}>Cancel</button>
                  )}
                  <button
                    className="btn-submit"
                    onClick={saveBean}
                    disabled={!newBeanName.trim()}
                  >
                    {editingBean ? 'Update Bean' : 'Add Bean'}
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
                          className={`bean-card ${!bean.isActive ? 'bean-card--inactive' : ''} ${editingBean?.id === bean.id ? 'bean-card--editing' : ''}`}
                        >
                          <div className="bean-card__main" onClick={() => openEditBean(bean)}>
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
                              onClick={() => toggleBeanActiveHook(bean.id)}
                              title={bean.isActive ? 'Mark as inactive' : 'Mark as active'}
                            >
                              {bean.isActive ? '✓' : '○'}
                            </button>
                            <button
                              className="bean-card__delete"
                              onClick={() => deleteBean(bean.id)}
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
      )}

      {/* Recipe Library Modal */}
      {showRecipeLibrary && (
        <div className="modal-overlay" onClick={() => setShowRecipeLibrary(false)}>
          <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3><Icons.Book /> Recipe Library</h3>
              <button className="modal__close" onClick={() => setShowRecipeLibrary(false)}>
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
                              onClick={() => {
                                togglePinRecipe(recipe.id);
                                if (isStarred) {
                                  showToast(`Removed "${recipe.name}" from quick recipes`, 'info');
                                } else {
                                  showToast(`Added "${recipe.name}" to quick recipes`, 'success');
                                }
                              }}
                              title={isStarred ? 'Remove from quick recipes' : 'Add to quick recipes'}
                            >
                              <Icons.Star filled={isStarred} />
                            </button>
                            <button
                              className="recipe-library__action-btn"
                              onClick={() => {
                                // Apply recipe to form
                                form.setBeanName(recipe.beanName);
                                form.setBrewType(recipe.brewType);
                                form.setBasket(recipe.basket);
                                form.setGrindSize(recipe.grindSize);
                                if (recipe.temperature) form.setTemperature(recipe.temperature);
                                form.setStrength(recipe.strength);
                                if (recipe.milk) {
                                  form.setMilkType(recipe.milk.type);
                                  form.setMilkStyle(recipe.milk.style);
                                  form.setShowMilk(true);
                                }
                                if (recipe.notes) form.setNotes(recipe.notes);
                                setShowRecipeLibrary(false);
                                showToast(`Applied "${recipe.name}"`, 'success');
                              }}
                              title="Apply Recipe"
                            >
                              <Icons.Check />
                            </button>
                            <button
                              className="recipe-library__action-btn"
                              onClick={() => openEditRecipe(recipe)}
                              title="Edit Recipe"
                            >
                              <Icons.Edit />
                            </button>
                            <button
                              className="recipe-library__action-btn recipe-library__action-btn--danger"
                              onClick={() => deleteRecipe(recipe.id)}
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
      )}

      {/* Statistics Modal */}
      {showStats && (() => {
        // Calculate statistics
        const totalShots = shots.length;
        const ratingCounts = RATINGS.reduce((acc, r) => {
          acc[r] = shots.filter(s => s.rating === r).length;
          return acc;
        }, {} as Record<Rating, number>);
        const maxRatingCount = Math.max(...Object.values(ratingCounts), 1);

        // Shots per bean (top 5)
        const beanCounts = shots.reduce((acc, s) => {
          acc[s.beanName] = (acc[s.beanName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const topBeans = Object.entries(beanCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        const maxBeanCount = Math.max(...topBeans.map(([, c]) => c), 1);

        // Average grind for balanced shots
        const balancedShots = shots.filter(s => s.rating === 'Balanced');
        const avgGrind = balancedShots.length > 0
          ? Math.round(balancedShots.reduce((sum, s) => sum + s.grindSize, 0) / balancedShots.length * 10) / 10
          : null;

        // Success rate (Balanced)
        const successRate = totalShots > 0
          ? Math.round((balancedShots.length / totalShots) * 100)
          : 0;

        // Shots this week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const shotsThisWeek = shots.filter(s => s.timestamp >= weekAgo).length;

        return (
          <div className="modal-overlay" onClick={() => setShowStats(false)}>
            <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
              <div className="modal__header">
                <h3><Icons.PieChart /> Statistics</h3>
                <button className="modal__close" onClick={() => setShowStats(false)}>
                  <Icons.X />
                </button>
              </div>
              <div className="modal__body">
                {totalShots === 0 ? (
                  <div className="empty-state">
                    <Icons.BarChart />
                    <p className="empty-state__text">Log some shots to see your statistics!</p>
                  </div>
                ) : (
                  <>
                    {/* Summary Stats */}
                    <div className="stats-summary">
                      <div className="stat-card">
                        <div className="stat-card__value">{totalShots}</div>
                        <div className="stat-card__label">Total Shots</div>
                      </div>
                      <div className="stat-card stat-card--success">
                        <div className="stat-card__value">{successRate}%</div>
                        <div className="stat-card__label">Balanced Rate</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-card__value">{shotsThisWeek}</div>
                        <div className="stat-card__label">This Week</div>
                      </div>
                      {avgGrind && (
                        <div className="stat-card stat-card--accent">
                          <div className="stat-card__value">{avgGrind}</div>
                          <div className="stat-card__label">Avg Balanced Grind</div>
                        </div>
                      )}
                    </div>

                    {/* Rating Distribution */}
                    <div className="stats-section">
                      <h4>Rating Distribution</h4>
                      <div className="bar-chart">
                        {RATINGS.map((r) => (
                          <div key={r} className="bar-chart__row">
                            <div className="bar-chart__label">{r}</div>
                            <div className="bar-chart__bar-wrap">
                              <div
                                className="bar-chart__bar"
                                style={{
                                  width: `${(ratingCounts[r] / maxRatingCount) * 100}%`,
                                  backgroundColor: RATING_COLORS[r]
                                }}
                              />
                            </div>
                            <div className="bar-chart__value">{ratingCounts[r]}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Beans */}
                    {topBeans.length > 0 && (
                      <div className="stats-section">
                        <h4>Top Beans</h4>
                        <div className="bar-chart bar-chart--beans">
                          {topBeans.map(([bean, count]) => (
                            <div key={bean} className="bar-chart__row">
                              <div className="bar-chart__label bar-chart__label--bean">{bean}</div>
                              <div className="bar-chart__bar-wrap">
                                <div
                                  className="bar-chart__bar bar-chart__bar--caramel"
                                  style={{ width: `${(count / maxBeanCount) * 100}%` }}
                                />
                              </div>
                              <div className="bar-chart__value">{count}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Success Rate Over Time */}
                    {(() => {
                      // Get last 7 days data
                      const days: { date: string; balanced: number; total: number }[] = [];
                      for (let i = 6; i >= 0; i--) {
                        const date = new Date();
                        date.setDate(date.getDate() - i);
                        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const dayShots = shots.filter(s => {
                          const shotDate = new Date(s.timestamp);
                          return shotDate.toDateString() === date.toDateString();
                        });
                        days.push({
                          date: dateStr,
                          balanced: dayShots.filter(s => s.rating === 'Balanced').length,
                          total: dayShots.length
                        });
                      }
                      const maxDayTotal = Math.max(...days.map(d => d.total), 1);

                      if (days.every(d => d.total === 0)) return null;

                      return (
                        <div className="stats-section">
                          <h4>Success Rate (Last 7 Days)</h4>
                          <div className="success-chart">
                            {days.map((d, idx) => (
                              <div key={idx} className="success-chart__day">
                                <div className="success-chart__bars">
                                  <div
                                    className="success-chart__bar success-chart__bar--total"
                                    style={{ height: `${(d.total / maxDayTotal) * 100}%` }}
                                    title={`${d.total} total`}
                                  />
                                  <div
                                    className="success-chart__bar success-chart__bar--balanced"
                                    style={{ height: `${(d.balanced / maxDayTotal) * 100}%` }}
                                    title={`${d.balanced} balanced`}
                                  />
                                </div>
                                <span className="success-chart__label">{d.date}</span>
                                <span className="success-chart__rate">
                                  {d.total > 0 ? Math.round((d.balanced / d.total) * 100) : 0}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Brew Type Breakdown */}
                    {(() => {
                      const brewCounts = shots.reduce((acc, s) => {
                        acc[s.brewType] = (acc[s.brewType] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);
                      const brewEntries = Object.entries(brewCounts).sort((a, b) => b[1] - a[1]);
                      const maxBrewCount = Math.max(...brewEntries.map(([, c]) => c), 1);

                      if (brewEntries.length <= 1) return null;

                      return (
                        <div className="stats-section">
                          <h4>Brew Types</h4>
                          <div className="bar-chart">
                            {brewEntries.map(([brew, count]) => (
                              <div key={brew} className="bar-chart__row">
                                <div className="bar-chart__label">{brew}</div>
                                <div className="bar-chart__bar-wrap">
                                  <div
                                    className="bar-chart__bar bar-chart__bar--muted"
                                    style={{ width: `${(count / maxBrewCount) * 100}%` }}
                                  />
                                </div>
                                <div className="bar-chart__value">{count}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}



      {/* Caffeine Tracker Modal */}
      {showCaffeine && (
        <div className="modal-overlay" onClick={() => setShowCaffeine(false)}>
          <div className="modal modal--caffeine" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2><Icons.Caffeine /> Caffeine Tracker</h2>
              <button className="modal__close" onClick={() => setShowCaffeine(false)}>
                <Icons.X />
              </button>
            </div>
            <div className="modal__body">
              {(() => {
                // Caffeine amounts per basket type (mg)
                const CAFFEINE_MG: Record<string, number> = { 'Single': 32, 'Double': 63, 'Luxe': 80 };
                // Actual espresso shots per basket type
                const SHOTS_PER_BASKET: Record<string, number> = { 'Single': 1, 'Double': 2, 'Luxe': 4 };

                // Get today's date (start of day)
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Calculate today's caffeine
                const todayShots = shots.filter(s => {
                  const shotDate = new Date(s.timestamp);
                  shotDate.setHours(0, 0, 0, 0);
                  return shotDate.getTime() === today.getTime();
                });

                const todayCaffeine = todayShots.reduce((sum, s) =>
                  sum + (CAFFEINE_MG[s.basket] || 63), 0);

                // Calculate actual shot count (not entries)
                const todayShotCount = todayShots.reduce((sum, s) =>
                  sum + (SHOTS_PER_BASKET[s.basket] || 2), 0);

                // Calculate 7-day stats
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);

                const weekShots = shots.filter(s => {
                  const shotDate = new Date(s.timestamp);
                  return shotDate >= weekAgo;
                });

                const weekCaffeine = weekShots.reduce((sum, s) =>
                  sum + (CAFFEINE_MG[s.basket] || 63), 0);
                const avgDaily = Math.round(weekCaffeine / 7);

                // Calculate actual shot count for the week
                const weekShotCount = weekShots.reduce((sum, s) =>
                  sum + (SHOTS_PER_BASKET[s.basket] || 2), 0);

                // Recommended daily limit is ~400mg
                const dailyLimit = 400;
                const percentage = Math.min((todayCaffeine / dailyLimit) * 100, 100);

                // Determine status
                let status = 'low';
                let statusText = 'Feeling fresh';
                if (todayCaffeine > 300) {
                  status = 'high';
                  statusText = 'Consider slowing down';
                } else if (todayCaffeine > 200) {
                  status = 'moderate';
                  statusText = 'Nicely caffeinated';
                } else if (todayCaffeine > 0) {
                  status = 'low';
                  statusText = 'Room for more';
                }

                return (
                  <>
                    <div className={`caffeine-gauge caffeine-gauge--${status}`}>
                      <div className="caffeine-gauge__circle">
                        <svg viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" className="caffeine-gauge__bg" />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            className="caffeine-gauge__fill"
                            strokeDasharray={`${percentage * 2.83} 283`}
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="caffeine-gauge__value">
                          <span className="caffeine-gauge__number">{todayCaffeine}</span>
                          <span className="caffeine-gauge__unit">mg</span>
                        </div>
                      </div>
                      <p className="caffeine-gauge__status">{statusText}</p>
                    </div>

                    <div className="caffeine-stats">
                      <div className="caffeine-stat">
                        <span className="caffeine-stat__value">{todayShotCount}</span>
                        <span className="caffeine-stat__label">Shots Today</span>
                      </div>
                      <div className="caffeine-stat">
                        <span className="caffeine-stat__value">{avgDaily}</span>
                        <span className="caffeine-stat__label">Daily Avg (mg)</span>
                      </div>
                      <div className="caffeine-stat">
                        <span className="caffeine-stat__value">{weekShotCount}</span>
                        <span className="caffeine-stat__label">Shots This Week</span>
                      </div>
                    </div>

                    <div className="caffeine-info">
                      <h3>Caffeine by Basket</h3>
                      <div className="caffeine-breakdown">
                        <div className="caffeine-breakdown__item">
                          <span className="caffeine-breakdown__basket">Single</span>
                          <span className="caffeine-breakdown__mg">~32mg per shot</span>
                        </div>
                        <div className="caffeine-breakdown__item">
                          <span className="caffeine-breakdown__basket">Double</span>
                          <span className="caffeine-breakdown__mg">~63mg per shot</span>
                        </div>
                        <div className="caffeine-breakdown__item">
                          <span className="caffeine-breakdown__basket">Luxe</span>
                          <span className="caffeine-breakdown__mg">~80mg per shot</span>
                        </div>
                      </div>
                      <p className="caffeine-limit">
                        Recommended daily limit: <strong>400mg</strong>
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Expanded Shot History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => { setShowHistoryModal(false); setPreviewShot(null); }}>
          <div className="modal modal--history" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3><Icons.BarChart /> Shot History ({shots.length})</h3>
              <button className="modal__close" onClick={() => { setShowHistoryModal(false); setPreviewShot(null); }}>
                <Icons.X />
              </button>
            </div>
            <div className="modal__body">
              {/* Filters */}
              <div className="history-modal__filters">
                <div className="history-filter">
                  <select
                    className="history-filter__select"
                    value={beanFilter}
                    onChange={(e) => setBeanFilter(e.target.value)}
                  >
                    <option value="">All Beans</option>
                    {[...new Set(shots.map(s => s.beanName))]
                      .sort((a, b) => a.localeCompare(b))
                      .map(bean => (
                        <option key={bean} value={bean}>{bean}</option>
                      ))
                    }
                  </select>
                  {beanFilter && (
                    <button
                      className="history-filter__clear"
                      onClick={() => setBeanFilter('')}
                      title="Clear filter"
                    >
                      ×
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  className="history-filter__search"
                  placeholder="Search notes..."
                  value={notesSearch}
                  onChange={(e) => setNotesSearch(e.target.value)}
                />
              </div>

              {/* Split content area */}
              <div className="history-modal__content">
                {/* Shot List */}
                <div className="history-modal__list">
                  {(() => {
                    let filteredShots = beanFilter
                      ? sortedShots.filter(s => s.beanName === beanFilter)
                      : sortedShots;

                    if (notesSearch.trim()) {
                      const searchLower = notesSearch.toLowerCase();
                      filteredShots = filteredShots.filter(s =>
                        s.notes?.toLowerCase().includes(searchLower)
                      );
                    }

                    return filteredShots.length > 0 ? (
                      filteredShots.map((shot) => {
                        const config = RATING_CONFIG[shot.rating];
                        const ShotIcon = config.icon;
                        const isFavorite = favorites[shot.beanName.toLowerCase()] === shot.id;
                        const isSelected = previewShot?.id === shot.id;
                        return (
                          <div
                            key={shot.id}
                            className={`history-item history-item--clickable ${isFavorite ? 'history-item--favorite' : ''} ${isSelected ? 'history-item--selected' : ''}`}
                            onClick={() => setPreviewShot(shot)}
                            onDoubleClick={() => { setSelectedShot(shot); setShowHistoryModal(false); setPreviewShot(null); }}
                          >
                            <div className={`history-item__rating history-item__rating--${config.colorClass}`}>
                              <ShotIcon />
                            </div>
                            <div className="history-item__details">
                              <div className="history-item__bean">{shot.beanName}</div>
                              <div className="history-item__meta">
                                {shot.brewType} • {formatDate(shot.timestamp, use24Hour)}
                              </div>
                              {/* Compact view - no settings tags */}
                            </div>
                            <div className="history-item__actions">
                              <button
                                className={`star-btn ${isFavorite ? 'star-btn--active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(shot); }}
                                title={isFavorite ? 'Remove from favorites' : 'Set as target recipe'}
                              >
                                <Icons.Star filled={isFavorite} />
                              </button>
                              <button
                                className="history-item__delete-btn"
                                onClick={(e) => { e.stopPropagation(); deleteShot(shot.id); if (previewShot?.id === shot.id) setPreviewShot(null); }}
                                title="Delete shot"
                              >
                                <Icons.Trash />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="empty-state">
                        <Icons.Clipboard />
                        <p className="empty-state__text">
                          {beanFilter || notesSearch ? 'No shots match your filters.' : 'No shots logged yet.'}
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* Preview Pane (Desktop only) */}
                <div className="history-modal__preview">
                  {previewShot ? (() => {
                    const config = RATING_CONFIG[previewShot.rating];
                    const PreviewIcon = config.icon;
                    const isFavorite = favorites[previewShot.beanName.toLowerCase()] === previewShot.id;
                    return (
                      <>
                        {/* Rating Banner */}
                        <div className={`shot-detail__rating shot-detail__rating--${config.colorClass}`}>
                          <PreviewIcon />
                          <span>{previewShot.rating}</span>
                          {isFavorite && <span className="shot-detail__fav-badge">⭐ Favorite</span>}
                        </div>

                        {/* Timestamp */}
                        <div className="shot-detail__timestamp">
                          {new Intl.DateTimeFormat('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: !use24Hour,
                          }).format(previewShot.timestamp)}
                        </div>

                        {/* Settings Grid */}
                        <div className="shot-detail__grid">
                          <div className="shot-detail__item">
                            <span className="shot-detail__label">Brew Type</span>
                            <span className="shot-detail__value">{previewShot.brewType}</span>
                          </div>
                          <div className="shot-detail__item">
                            <span className="shot-detail__label">Grind Size</span>
                            <span className="shot-detail__value">{previewShot.grindSize}</span>
                          </div>
                          {previewShot.temperature && (
                            <div className="shot-detail__item">
                              <span className="shot-detail__label">Temperature</span>
                              <span className="shot-detail__value">{previewShot.temperature}</span>
                            </div>
                          )}
                          <div className="shot-detail__item">
                            <span className="shot-detail__label">Basket</span>
                            <span className="shot-detail__value">{previewShot.basket}</span>
                          </div>
                          <div className="shot-detail__item">
                            <span className="shot-detail__label">Strength</span>
                            <span className="shot-detail__value">{previewShot.strength}</span>
                          </div>
                          {previewShot.milk && (
                            <div className="shot-detail__item">
                              <span className="shot-detail__label">Milk</span>
                              <span className="shot-detail__value">{previewShot.milk.type} {previewShot.milk.style}</span>
                            </div>
                          )}
                          {previewShot.extractionTime && (
                            <div className="shot-detail__item">
                              <span className="shot-detail__label">Extraction Time</span>
                              <span className="shot-detail__value">{previewShot.extractionTime}s</span>
                            </div>
                          )}
                          {previewShot.doseIn && previewShot.doseOut && (
                            <div className="shot-detail__item">
                              <span className="shot-detail__label">Dose / Yield</span>
                              <span className="shot-detail__value">
                                {previewShot.doseIn}g → {previewShot.doseOut}g (1:{(previewShot.doseOut / previewShot.doseIn).toFixed(1)})
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {previewShot.notes && (
                          <div className="shot-detail__notes">
                            <span className="shot-detail__label">Notes</span>
                            <p>{previewShot.notes}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="history-modal__preview-actions">
                          <button
                            className="btn-action"
                            onClick={() => openEditShot(previewShot)}
                            title="Edit shot details"
                          >
                            <Icons.Edit /> Edit
                          </button>
                          <button
                            className="btn-action"
                            onClick={() => duplicateShot(previewShot)}
                            title="Copy settings to form"
                          >
                            <Icons.Copy /> Brew Again
                          </button>
                          <button
                            className={`btn-action ${compareShots.includes(previewShot.id) ? 'btn-action--active' : 'btn-action--primary'}`}
                            onClick={() => toggleCompareShot(previewShot.id)}
                          >
                            <Icons.BarChart /> {compareShots.includes(previewShot.id) ? 'In Compare' : 'Add to Compare'}
                          </button>
                        </div>
                      </>
                    );
                  })() : (
                    <div className="history-modal__preview-empty">
                      <Icons.Coffee />
                      <p>Select a shot to preview details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unified Settings Modal */}
      {showThemePicker && (
        <div className="modal-overlay" onClick={() => { setShowThemePicker(false); setImportStatus(null); }}>
          <div className="modal modal--settings" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3><Icons.Sliders /> Settings</h3>
              <button className="modal__close" onClick={() => { setShowThemePicker(false); setImportStatus(null); }}>
                <Icons.X />
              </button>
            </div>
            <div className="modal__body">
              {/* Appearance Section */}
              <div className="settings-section">
                <h4 className="settings-section__title">🎨 Appearance</h4>

                <div className="prefs-section">
                  <label className="prefs-section__label">Theme</label>
                  <div className="theme-picker__options">
                    {[
                      { value: 'dark', label: 'Coffee Dark', emoji: '☕' },
                      { value: 'light', label: 'Coffee Light', emoji: '🥛' },
                      { value: 'catppuccin', label: 'Catppuccin', emoji: '🍵' },
                      { value: 'rosepine', label: 'Rose Pine', emoji: '🌹' },
                      { value: 'rosepine-moon', label: 'Rose Pine Moon', emoji: '🌙' },
                    ].map((t) => (
                      <button
                        key={t.value}
                        className={`theme-picker__option ${theme === t.value ? 'theme-picker__option--active' : ''}`}
                        onClick={() => { setTheme(t.value as typeof theme); }}
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

              {/* Data Section */}
              <div className="settings-section">
                <h4 className="settings-section__title">💾 Data</h4>

                {/* Data Summary */}
                <div className="data-summary">
                  <div className="data-summary__item">
                    <span className="data-summary__count">{shots.length}</span>
                    <span className="data-summary__label">Shots</span>
                  </div>
                  <div className="data-summary__item">
                    <span className="data-summary__count">{recipes.length}</span>
                    <span className="data-summary__label">Recipes</span>
                  </div>
                  <div className="data-summary__item">
                    <span className="data-summary__count">{beans.length}</span>
                    <span className="data-summary__label">Beans</span>
                  </div>
                </div>

                {/* Import Status */}
                {importStatus && (
                  <div className={`import-status import-status--${importStatus.type}`}>
                    {importStatus.type === 'success' ? '✓' : '✗'} {importStatus.message}
                  </div>
                )}

                {/* Export/Import Buttons */}
                <div className="data-actions">
                  <button className="data-action-btn" onClick={exportData}>
                    <Icons.Download />
                    <span>Export Backup</span>
                    <small>Download all data as JSON</small>
                  </button>
                  <button className="data-action-btn" onClick={exportToCSV}>
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
                    onClick={() => {
                      showConfirm(
                        'Clear All Data',
                        `Are you sure you want to delete ALL data? This will permanently remove ${shots.length} shots, ${recipes.length} recipes, and ${beans.length} beans. This action cannot be undone.`,
                        () => {
                          setShots([]);
                          setRecipes([]);
                          setBeans([]);
                          setFavorites({});
                          showToast('All data cleared', 'success');
                          setShowThemePicker(false);
                        }
                      );
                    }}
                  >
                    <Icons.Trash />
                    <span>Clear All Data</span>
                    <small>Permanently delete everything</small>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
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
      )}

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
