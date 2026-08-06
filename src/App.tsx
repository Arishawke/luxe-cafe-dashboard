import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import type { FormEvent } from 'react';
import type { ShotLog, Rating, SavedRecipe, BeanProfile, FavoritesMap, MaintenanceEvent } from './types';
import { COLD_BREW_TYPES } from './types';
import { generateId } from './lib/format';
import { getFreshnessAlert } from './lib/beans';
import { getBeanInventory } from './lib/inventory';
import { getLogMessage } from './lib/milestones';
import { getSuggestedSettings } from './lib/suggestions';
import { getMaintenanceAlerts } from './lib/maintenance';
import { RATINGS, RATING_COLORS, BALANCED_RATING_INDEX } from './constants';
import { useToast, useConfirm, useTimer, useShots, useBeans, useRecipes, useFavorites, useTheme, useShotForm, useKeyboardShortcuts, useBeanAutocomplete, useMaintenance, useScrollLock } from './hooks';
import Icons from './components/Icons';
import Header from './components/Header';
import ShotForm from './components/ShotForm/ShotForm';
import ConfirmDialog from './components/modals/ConfirmDialog';
import ShotDetailModal from './components/modals/ShotDetailModal';
import { buildJSONBackup, buildCSV, downloadFile, parseImportFile, parseBackup } from './lib/dataIO';
import type { ImportResult } from './lib/dataIO';
import { readMigrationLanding, clearMigrationHash, shouldOfferMigration, startMigration, dismissMigration } from './lib/migration';
import Toast from './components/Toast';
import MigrationNotice from './components/MigrationNotice';
import SuggestionCard from './components/SuggestionCard';
import ShotHistory from './components/ShotHistory';
import ShotComparison from './components/ShotComparison';
import { RATING_COLOR_CLASS } from './lib/ratings';
import { saveStorageValue } from './lib/storage';
import { getRecentShotsForBean } from './lib/shots';

const RecipeEditorModal = lazy(() => import('./components/modals/RecipeEditorModal'));
const BeanLibraryModal = lazy(() => import('./components/modals/BeanLibraryModal'));
const RecipeLibraryModal = lazy(() => import('./components/modals/RecipeLibraryModal'));
const StatsModal = lazy(() => import('./components/modals/StatsModal'));
const CaffeineModal = lazy(() => import('./components/modals/CaffeineModal'));
const HistoryModal = lazy(() => import('./components/modals/HistoryModal'));
const SettingsModal = lazy(() => import('./components/modals/SettingsModal'));

const RATING_CONFIG: Record<Rating, { icon: () => React.JSX.Element; colorClass: string }> = {
  'Very Sour': { icon: Icons.DoubleChevronLeft, colorClass: RATING_COLOR_CLASS['Very Sour'] },
  'Sour': { icon: Icons.Citrus, colorClass: RATING_COLOR_CLASS.Sour },
  'Balanced': { icon: Icons.Sparkles, colorClass: RATING_COLOR_CLASS.Balanced },
  'Bitter': { icon: Icons.Flame, colorClass: RATING_COLOR_CLASS.Bitter },
  'Very Bitter': { icon: Icons.DoubleChevronRight, colorClass: RATING_COLOR_CLASS['Very Bitter'] },
};

function App() {
  const form = useShotForm();

  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [editingRecipe, setEditingRecipe] = useState<SavedRecipe | null>(null);
  const [selectedShot, setSelectedShot] = useState<ShotLog | null>(null);
  const [editingShot, setEditingShot] = useState<ShotLog | null>(null);
  const [showBeanLibrary, setShowBeanLibrary] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showRecipeLibrary, setShowRecipeLibrary] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [importBackup, setImportBackup] = useState<{
    shots: ShotLog[];
    recipes: SavedRecipe[];
    beans: BeanProfile[];
    favorites: FavoritesMap;
    maintenance: MaintenanceEvent[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMigration, setShowMigration] = useState(() => shouldOfferMigration());
  const [showCaffeine, setShowCaffeine] = useState(false);
  const [beanFilter, setBeanFilter] = useState<string>('');
  const [notesSearch, setNotesSearch] = useState<string>('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [compareShots, setCompareShots] = useState<[string | null, string | null]>([null, null]);

  const { confirmDialog, showConfirm, closeConfirm } = useConfirm();
  const { toast, showToast, hideToast } = useToast(3000);
  const { timerRunning, timerSeconds, startTimer, stopTimer, resetTimer } = useTimer();
  const { shots, addShot, updateShot, deleteShot, replaceAll: setShots } = useShots();
  const { beans, addBean, updateBean, deleteBean, toggleActive, replaceAll: setBeans } = useBeans();
  const { recipes, pinned: pinnedRecipes, addRecipe, updateRecipe, deleteRecipe, togglePin: togglePinRecipe, replaceAll: setRecipes } = useRecipes();
  const { favorites, toggleFavorite, replaceAll: setFavorites } = useFavorites();
  const { theme, setTheme, use24Hour, setUse24Hour, cycleTheme } = useTheme();
  const { events: maintenanceEvents, recordCleaning, recordDescaling, lastEventFor: lastMaintenanceFor, replaceAll: setMaintenance } = useMaintenance();

  const autocomplete = useBeanAutocomplete(beans, shots);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [justLoggedId, setJustLoggedId] = useState<string | null>(null);

  useEffect(() => {
    if (!justLoggedId) return;
    const t = setTimeout(() => setJustLoggedId(null), 1600);
    return () => clearTimeout(t);
  }, [justLoggedId]);

  const [showShortcuts, setShowShortcuts] = useState(() => {
    const stored = localStorage.getItem('luxe-cafe-show-shortcuts');
    return stored === null ? false : stored === 'true';
  });

  useEffect(() => {
    const onStorageError = () =>
      showToast('Storage full. Your latest change was not saved. Export a backup.', 'error');
    window.addEventListener('luxe:storage-error', onStorageError);
    return () => window.removeEventListener('luxe:storage-error', onStorageError);
  }, [showToast]);

  // Land a one-time migration payload from the old domain (see lib/migration).
  const migrationLanded = useRef(false);
  useEffect(() => {
    if (migrationLanded.current) return;
    migrationLanded.current = true;
    const landing = readMigrationLanding();
    if (!landing) return;
    clearMigrationHash();
    if (landing.invalid) {
      showToast('Could not read the data from the old site. Try Export and Import instead.', 'error');
      return;
    }
    if (landing.tooBig) {
      showToast('Your data is large. On the old site use Settings, Export, then Import here.', 'error');
      return;
    }
    try {
      const data = parseBackup(landing.json!);
      applyResult(data);
      setShowMigration(false);
      showToast(`Brought over ${data.shots.length} shots, ${data.recipes.length} recipes, ${data.beans.length} beans`, 'success');
    } catch {
      showToast('Could not read the data from the old site. Try Export and Import instead.', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rating = RATINGS[form.ratingIndex];
  const isColdBrew = COLD_BREW_TYPES.includes(form.brewType);

  const anyModalOpen =
    showRecipeModal || showRecipeLibrary || showBeanLibrary || showStats || showCaffeine
    || showSettings || showHistoryModal || selectedShot !== null || editingRecipe !== null
    || confirmDialog !== null;
  useScrollLock(anyModalOpen);

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
      else if (showHistoryModal) setShowHistoryModal(false);
      else if (showBeanLibrary) setShowBeanLibrary(false);
      else if (showRecipeLibrary) setShowRecipeLibrary(false);
      else if (showStats) setShowStats(false);
      else if (showCaffeine) setShowCaffeine(false);
      else if (showRecipeModal) setShowRecipeModal(false);
      else if (showSettings) setShowSettings(false);
    },
  });

  const currentBeanKey = form.beanName.trim().toLowerCase();
  const favoriteId = favorites[currentBeanKey];
  const favoriteShot = favoriteId ? shots.find(s => s.id === favoriteId) : null;

  const shotsForBean = getRecentShotsForBean(shots, form.beanName, 5);
  const lastShotForBean = shotsForBean[0] ?? null;

  const suggestedSettings = getSuggestedSettings(lastShotForBean);

  const applySuggestedSettings = () => {
    if (!suggestedSettings || !lastShotForBean) return;
    form.applyFromShot(lastShotForBean);
    form.setGrindSize(suggestedSettings.grindSize);
    form.setTemperature(suggestedSettings.temperature);
    form.setRatingIndex(BALANCED_RATING_INDEX);
    form.setRated(true);
  };

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

  const confirmDeleteRecipe = (id: string) => {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;

    showConfirm(
      'Delete Recipe',
      `Are you sure you want to delete "${recipe.name}"?`,
      () => {
        deleteRecipe(id);
        showToast('Recipe deleted', 'info');
      }
    );
  };

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
    setShowRecipeLibrary(false);
    setShowRecipeModal(true);
  };

  const submitRecipeEdits = () => {
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

    updateRecipe(updated);
    setEditingRecipe(null);
    setRecipeName('');
    showToast('Recipe updated', 'success');
  };

  const toggleCompareShot = (id: string) => {
    setCompareShots(prev => {
      if (prev[0] === id) return [null, prev[1]];
      if (prev[1] === id) return [prev[0], null];
      if (prev[0] === null) return [id, prev[1]];
      if (prev[1] === null) return [prev[0], id];
      return [prev[1], id]; // replace oldest
    });
  };

  const shot1 = compareShots[0] ? shots.find(s => s.id === compareShots[0]) : null;
  const shot2 = compareShots[1] ? shots.find(s => s.id === compareShots[1]) : null;

  const confirmDeleteShot = (id: string) => {
    const shot = shots.find(s => s.id === id);
    if (!shot) return;

    showConfirm(
      'Delete Shot',
      `Are you sure you want to delete this shot for "${shot.beanName}"?`,
      () => {
        const beanKey = shot.beanName.toLowerCase();
        if (favorites[beanKey] === id) {
          const updated = { ...favorites };
          delete updated[beanKey];
          setFavorites(updated);
        }
        deleteShot(id);
        showToast('Shot deleted', 'info');
      }
    );
  };

  const duplicateShot = (shot: ShotLog) => {
    form.applyFromShot(shot);
    form.setRatingIndex(BALANCED_RATING_INDEX);
    form.setRated(true);
  };

  const applyBestDialIn = (shot: ShotLog) => {
    form.applyFromShot(shot);
    form.setRatingIndex(BALANCED_RATING_INDEX);
    form.setRated(true);
    setShowBeanLibrary(false);
    showToast(`Loaded best dial-in for ${shot.beanName}`, 'success');
  };

  const rateShot = (shotId: string, rating: Rating) => {
    const shot = shots.find(s => s.id === shotId);
    if (!shot) return;
    updateShot({ ...shot, rating });
    setSelectedShot(prev => (prev && prev.id === shotId ? { ...prev, rating } : prev));
    showToast(`Rated ${rating}`, 'success');
  };

  const openEditShot = (shot: ShotLog) => {
    form.applyFromShot(shot);
    const ratingIdx = shot.rating ? RATINGS.indexOf(shot.rating) : -1;
    form.setRated(ratingIdx >= 0);
    form.setRatingIndex(ratingIdx >= 0 ? ratingIdx : BALANCED_RATING_INDEX);
    form.setShowDose(shot.doseIn !== undefined || shot.doseOut !== undefined);
    form.setDoseIn(shot.doseIn?.toString() ?? '');
    form.setDoseOut(shot.doseOut?.toString() ?? '');
    if (shot.extractionTime) {
      form.setShowTimer(true);
    }
    setEditingShot(shot);
    setShowHistoryModal(false);
    showToast('Editing shot - make changes and click Update Shot', 'info');
  };

  const submitShotEdits = () => {
    if (!editingShot || !form.beanName.trim()) return;

    const updated: ShotLog = {
      ...editingShot,
      beanName: form.beanName.trim(),
      brewType: form.brewType,
      basket: form.basket,
      grindSize: form.grindSize,
      temperature: isColdBrew ? undefined : form.temperature,
      strength: form.strength,
      rating: form.rated ? rating : undefined,
      milk: form.showMilk ? { type: form.milkType, style: form.milkStyle } : undefined,
      notes: form.notes.trim() || undefined,
      doseIn: form.doseIn ? parseFloat(form.doseIn) : undefined,
      doseOut: form.doseOut ? parseFloat(form.doseOut) : undefined,
    };

    updateShot(updated);

    const oldBeanKey = editingShot.beanName.toLowerCase();
    const newBeanKey = form.beanName.trim().toLowerCase();
    if (oldBeanKey !== newBeanKey && favorites[oldBeanKey] === editingShot.id) {
      const updatedFavorites = { ...favorites };
      delete updatedFavorites[oldBeanKey];
      updatedFavorites[newBeanKey] = editingShot.id;
      setFavorites(updatedFavorites);
    }

    setEditingShot(null);
    showToast('Shot updated', 'success');
  };

  const confirmDeleteBean = (id: string) => {
    const bean = beans.find(b => b.id === id);
    if (!bean) return;

    showConfirm(
      'Delete Bean',
      `Are you sure you want to delete "${bean.name}"?`,
      () => {
        deleteBean(id);
        showToast('Bean deleted', 'info');
      }
    );
  };

  const exportData = () => {
    const json = buildJSONBackup(shots, recipes, beans, favorites, maintenanceEvents);
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

  const applyResult = (data: ImportResult) => {
    setShots(data.shots);
    setRecipes(data.recipes);
    setBeans(data.beans);
    setFavorites(data.favorites);
    setMaintenance(data.maintenance);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const previous = { shots, recipes, beans, favorites, maintenance: maintenanceEvents };
      const data = await parseImportFile(file);
      applyResult(data);
      setImportBackup(previous); // enables one-click Undo import
      const skipped = data.skipped.shots + data.skipped.recipes + data.skipped.beans + data.skipped.maintenance;
      let message = `Imported ${data.shots.length} shots, ${data.recipes.length} recipes, ${data.beans.length} beans`;
      if (skipped > 0) message += `; skipped ${skipped} unreadable ${skipped === 1 ? 'entry' : 'entries'}`;
      setImportStatus({ type: 'success', message });
    } catch (err) {
      setImportStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to import file' });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // allow re-selecting same file
    }
  };

  const undoImport = () => {
    if (!importBackup) return;
    setShots(importBackup.shots);
    setRecipes(importBackup.recipes);
    setBeans(importBackup.beans);
    setFavorites(importBackup.favorites);
    setMaintenance(importBackup.maintenance);
    setImportBackup(null);
    setImportStatus({ type: 'success', message: 'Import reverted' });
    showToast('Import reverted', 'info');
  };

  const decrementGrind = () => form.setGrindSize(Math.max(1, form.grindSize - 1));
  const incrementGrind = () => form.setGrindSize(Math.min(25, form.grindSize + 1));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.beanName.trim()) return;

    if (editingShot) {
      submitShotEdits();
      form.reset();
      autocomplete.closeSuggestions();
      resetTimer();
      return;
    }

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
      rating: form.rated ? rating : undefined,
      milk: form.showMilk ? { type: form.milkType, style: form.milkStyle } : undefined,
      notes: form.notes.trim() || undefined,
      extractionTime: getExtractionTime(),
      doseIn: form.doseIn ? parseFloat(form.doseIn) : undefined,
      doseOut: form.doseOut ? parseFloat(form.doseOut) : undefined,
      timestamp: new Date(),
    };

    addShot(newShot);
    setJustLoggedId(newShot.id);
    const beanShots = shots.filter(s => s.beanName.toLowerCase() === newShot.beanName.toLowerCase()).length + 1;
    form.reset();
    autocomplete.closeSuggestions();
    resetTimer();
    showToast(getLogMessage(shots.length + 1, beanShots, newShot.beanName), 'success');
  };

  const sortedShots = [...shots].sort((a, b) => {
    const aIsFav = favorites[a.beanName.toLowerCase()] === a.id;
    const bIsFav = favorites[b.beanName.toLowerCase()] === b.id;
    if (aIsFav && !bIsFav) return -1;
    if (bIsFav && !aIsFav) return 1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  const openModal = (setter: (v: boolean) => void) => () => {
    setter(true);
    setMobileMenuOpen(false);
  };

  return (
    <main className="dashboard">
      <Header
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        onOpenBeanLibrary={openModal(setShowBeanLibrary)}
        onOpenRecipes={openModal(setShowRecipeLibrary)}
        onOpenStats={openModal(setShowStats)}
        onOpenCaffeine={openModal(setShowCaffeine)}
        onOpenSettings={openModal(setShowSettings)}
      />

      {showMigration && (
        <MigrationNotice
          onMigrate={() => startMigration()}
          onDismiss={() => { dismissMigration(); setShowMigration(false); }}
        />
      )}

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

      <div className="dashboard__grid">
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
            autocomplete={autocomplete}
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

        <div className="side-panel">
          <div className="card">
            <h2 className="card__title">
              <Icons.ChefHat /> Smart Barista
            </h2>

            {(() => {
              const alert = getFreshnessAlert(form.beanName, beans);
              if (!alert) return null;
              return (
                <div className={`freshness-alert freshness-alert--${alert.variant}`}>
                  <span className="freshness-alert__badge" style={{ background: alert.color }}>
                    {alert.label}
                  </span>
                  <span className="freshness-alert__text">{alert.text}</span>
                </div>
              );
            })()}

            {(() => {
              const key = form.beanName.trim().toLowerCase();
              const profile = key ? beans.find(b => b.name.toLowerCase() === key) : undefined;
              if (!profile) return null;
              const inv = getBeanInventory(profile, shots);
              if (!inv || (!inv.isLow && !inv.isEmpty)) return null;
              return (
                <div className={`freshness-alert freshness-alert--${inv.isEmpty ? 'stale' : 'fading'}`}>
                  <span className="freshness-alert__badge" style={{ background: inv.isEmpty ? 'var(--color-very-bitter)' : 'var(--color-sour)' }}>
                    {inv.isEmpty ? 'Empty' : 'Low Bag'}
                  </span>
                  <span className="freshness-alert__text">
                    {inv.isEmpty
                      ? `Your ${profile.name} bag is out. Time to restock.`
                      : `About ${inv.gramsLeft}g (~${inv.shotsLeft} shots) of ${profile.name} left.`}
                  </span>
                </div>
              );
            })()}

            {getMaintenanceAlerts(maintenanceEvents, shots.length).map(alert => (
              <div key={alert.task} className={`maintenance-alert maintenance-alert--${alert.variant}`}>
                <span className="maintenance-alert__badge">{alert.label}</span>
                <span className="maintenance-alert__text">{alert.text}</span>
                <button
                  className="maintenance-alert__action"
                  onClick={() => {
                    if (alert.task === 'cleaning') {
                      recordCleaning(shots.length);
                      showToast('Cleaning logged', 'success');
                    } else {
                      recordDescaling(shots.length);
                      showToast('Descale logged', 'success');
                    }
                  }}
                >
                  Mark done
                </button>
              </div>
            ))}

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

          <ShotHistory
            shots={shots}
            sortedShots={sortedShots}
            favorites={favorites}
            justLoggedId={justLoggedId}
            use24Hour={use24Hour}
            beanFilter={beanFilter}
            setBeanFilter={setBeanFilter}
            notesSearch={notesSearch}
            setNotesSearch={setNotesSearch}
            ratingConfig={RATING_CONFIG}
            onSelectShot={setSelectedShot}
            onToggleFavorite={toggleFavorite}
            onEditShot={openEditShot}
            onDeleteShot={confirmDeleteShot}
            onOpenHistoryModal={() => setShowHistoryModal(true)}
          />
        </div>
      </div>

      {(showRecipeModal || editingRecipe !== null) && (
        <Suspense fallback={null}>
          <RecipeEditorModal
            open={true}
            form={form}
            recipeName={recipeName}
            setRecipeName={setRecipeName}
            editingRecipe={editingRecipe}
            onSave={() => editingRecipe ? submitRecipeEdits() : saveAsRecipe()}
            onCancel={() => { setShowRecipeModal(false); setEditingRecipe(null); setRecipeName(''); }}
          />
        </Suspense>
      )}

      <ShotDetailModal
        shot={selectedShot}
        use24Hour={use24Hour}
        isFavorite={!!selectedShot && favorites[selectedShot.beanName.toLowerCase()] === selectedShot.id}
        isCompared={!!selectedShot && compareShots.includes(selectedShot.id)}
        ratingConfig={RATING_CONFIG}
        onClose={() => setSelectedShot(null)}
        onEdit={openEditShot}
        onDelete={confirmDeleteShot}
        onDuplicate={duplicateShot}
        onRate={rateShot}
        onToggleCompare={(id) => {
          const wasCompared = compareShots.includes(id);
          toggleCompareShot(id);
          showToast(wasCompared ? 'Removed from comparison' : 'Added to comparison', 'info');
        }}
      />

      <Suspense fallback={null}>
        {showBeanLibrary && (
          <BeanLibraryModal
            open={true}
            beans={beans}
            shots={shots}
            onAdd={addBean}
            onUpdate={updateBean}
            onDelete={confirmDeleteBean}
            onToggleActive={toggleActive}
            onApplyDialIn={applyBestDialIn}
            onClose={() => setShowBeanLibrary(false)}
          />
        )}

        {showRecipeLibrary && (
          <RecipeLibraryModal
            open={true}
            recipes={recipes}
            pinnedRecipes={pinnedRecipes}
            onApply={(recipe) => {
              form.applyFromRecipe(recipe);
              setShowRecipeLibrary(false);
              showToast(`Applied "${recipe.name}"`, 'success');
            }}
            onEdit={openEditRecipe}
            onDelete={confirmDeleteRecipe}
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
        )}

        {showStats && (
          <StatsModal
            open={true}
            shots={shots}
            onClose={() => setShowStats(false)}
          />
        )}

        {showCaffeine && (
          <CaffeineModal
            open={true}
            shots={shots}
            onClose={() => setShowCaffeine(false)}
          />
        )}

        {showHistoryModal && (
          <HistoryModal
            open={true}
            shots={shots}
            sortedShots={sortedShots}
            favorites={favorites}
            beanFilter={beanFilter}
            setBeanFilter={setBeanFilter}
            notesSearch={notesSearch}
            setNotesSearch={setNotesSearch}
            use24Hour={use24Hour}
            ratingConfig={RATING_CONFIG}
            compareShots={compareShots}
            onClose={() => setShowHistoryModal(false)}
            onSelectShot={(shot) => setSelectedShot(shot)}
            onToggleFavorite={toggleFavorite}
            onToggleCompare={(id) => {
              const wasCompared = compareShots.includes(id);
              toggleCompareShot(id);
              showToast(wasCompared ? 'Removed from comparison' : 'Added to comparison', 'info');
            }}
            onEditShot={openEditShot}
            onDuplicateShot={duplicateShot}
            onDeleteShot={confirmDeleteShot}
            onRate={rateShot}
          />
        )}

        {showSettings && (
          <SettingsModal
            open={true}
            theme={theme}
            setTheme={setTheme}
            use24Hour={use24Hour}
            setUse24Hour={setUse24Hour}
            shotsCount={shots.length}
            recipesCount={recipes.length}
            beansCount={beans.length}
            importStatus={importStatus}
            canUndoImport={importBackup !== null}
            onUndoImport={undoImport}
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
                  setMaintenance([]);
                  setImportBackup(null);
                  showToast('All data cleared', 'success');
                  setShowSettings(false);
                }
              );
            }}
            onClose={() => { setShowSettings(false); setImportStatus(null); }}
            lastCleaning={lastMaintenanceFor('cleaning')}
            lastDescaling={lastMaintenanceFor('descaling')}
            onRecordCleaning={() => {
              recordCleaning(shots.length);
              showToast('Cleaning logged', 'success');
            }}
            onRecordDescaling={() => {
              recordDescaling(shots.length);
              showToast('Descale logged', 'success');
            }}
          />
        )}
      </Suspense>

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

      <div className={`shortcuts-panel ${showShortcuts ? 'shortcuts-panel--open' : ''}`}>
        {showShortcuts ? (
          <>
            <div className="shortcuts-panel__header">
              <span className="shortcuts-panel__title"><Icons.Keyboard /> Shortcuts</span>
              <button
                className="shortcuts-panel__close"
                onClick={() => {
                  setShowShortcuts(false);
                  saveStorageValue('luxe-cafe-show-shortcuts', 'false');
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
              saveStorageValue('luxe-cafe-show-shortcuts', 'true');
            }}
            title="Show keyboard shortcuts"
            aria-label="Show keyboard shortcuts"
          >
            <Icons.Keyboard />
          </button>
        )}
      </div>

      <Toast toast={toast} onDismiss={hideToast} shortcutsOpen={showShortcuts} />
    </main>
  );
}

export default App;
