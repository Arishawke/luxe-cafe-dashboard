import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import type { ShotLog, Basket, Temperature, Strength, Rating, BrewType, MilkType, MilkStyle, FavoritesMap, SavedRecipe, BeanProfile, ProcessMethod, RoastLevel } from './types';
import { COLD_BREW_TYPES, getDaysSinceRoast, getFreshnessStatus } from './types';
import { loadShots, saveShots, loadFavorites, saveFavorites, loadRecipes, saveRecipes, loadBeans, saveBeans, generateId, formatDate, getBaristaTip, getUniqueBeans } from './utils';

// SVG Icons Component
const Icons = {
  Coffee: () => (
    <svg className="header__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
      <path d="M6 2v2" /><path d="M10 2v2" /><path d="M14 2v2" />
    </svg>
  ),
  Edit: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  ChefHat: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6v-7.13z" />
    </svg>
  ),
  BarChart: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
  Star: ({ filled }: { filled?: boolean }) => (
    <svg className="icon" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Target: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Lightbulb: () => (
    <svg className="icon icon--xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" /><path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  ),
  Clipboard: () => (
    <svg className="icon icon--xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  ChevronUp: () => (
    <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 15-6-6-6 6" />
    </svg>
  ),
  Minus: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Plus: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Milk: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2h8l2 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6l2-4z" />
      <path d="M6 6h12" /><path d="M12 12v4" />
    </svg>
  ),
  Save: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  Zap: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  X: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Trash: () => (
    <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  // Rating icons
  Citrus: () => (
    <svg className="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 8v8" /><path d="M8 12h8" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  ),
  Flame: () => (
    <svg className="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  DoubleChevronLeft: () => (
    <svg className="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m11 17-5-5 5-5" /><path d="m18 17-5-5 5-5" />
    </svg>
  ),
  DoubleChevronRight: () => (
    <svg className="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 17 5-5-5-5" /><path d="m13 17 5-5-5-5" />
    </svg>
  ),
  Bean: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7c0 4-3.5 7.5-8 11-4.5-3.5-8-7-8-11a8 8 0 1 1 16 0Z" />
      <path d="M11 13c2-2.5 4-4 4-7" />
    </svg>
  ),
  Calendar: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  PieChart: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  ),
  Download: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Upload: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Settings: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Sun: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  Moon: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Caffeine: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  ),
  Copy: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Menu: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Palette: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  Check: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Expand: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  ),
};

// Rating config
const RATINGS: Rating[] = ['Very Sour', 'Sour', 'Balanced', 'Bitter', 'Very Bitter'];
const RATING_COLORS: Record<Rating, string> = {
  'Very Sour': '#E8A045',
  'Sour': '#D4915C',
  'Balanced': '#7A9E6D',
  'Bitter': '#B85C5C',
  'Very Bitter': '#C04545',
};

const RATING_CONFIG: Record<Rating, { icon: () => React.JSX.Element; colorClass: string }> = {
  'Very Sour': { icon: Icons.DoubleChevronLeft, colorClass: 'very-sour' },
  'Sour': { icon: Icons.Citrus, colorClass: 'sour' },
  'Balanced': { icon: Icons.Sparkles, colorClass: 'balanced' },
  'Bitter': { icon: Icons.Flame, colorClass: 'bitter' },
  'Very Bitter': { icon: Icons.DoubleChevronRight, colorClass: 'very-bitter' },
};

// Options for selectors
const BREW_TYPES: BrewType[] = ['Espresso', 'Drip Coffee', 'Cold Brew', 'Cold Pressed', 'Over Ice'];
const BASKETS: Basket[] = ['Double', 'Luxe'];
const TEMPERATURES: Temperature[] = ['Low', 'Med', 'High'];
const STRENGTHS: { value: Strength; label: string }[] = [
  { value: 1, label: '1 Mild' },
  { value: 2, label: '2 Classic' },
  { value: 3, label: '3 Rich' },
];
const MILK_TYPES: MilkType[] = ['Dairy', 'Plant'];
const MILK_STYLES: MilkStyle[] = ['Steamed', 'Thin', 'Thick', 'Cold Foam'];
const PROCESS_METHODS: ProcessMethod[] = ['Washed', 'Natural', 'Honey', 'Anaerobic', 'Other'];
const ROAST_LEVELS: RoastLevel[] = ['Light', 'Medium', 'Medium-Dark', 'Dark'];

function App() {
  // Shot history, favorites, recipes, beans
  const [shots, setShots] = useState<ShotLog[]>([]);
  const [favorites, setFavorites] = useState<FavoritesMap>({});
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [beans, setBeans] = useState<BeanProfile[]>([]);

  // Form state
  const [beanName, setBeanName] = useState('');
  const [brewType, setBrewType] = useState<BrewType>('Espresso');
  const [basket, setBasket] = useState<Basket>('Double');
  const [grindSize, setGrindSize] = useState(12);
  const [temperature, setTemperature] = useState<Temperature>('Med');
  const [strength, setStrength] = useState<Strength>(2);
  const [ratingIndex, setRatingIndex] = useState(2); // 0-4 index, default Balanced
  const [notes, setNotes] = useState('');

  // Milk settings
  const [showMilk, setShowMilk] = useState(false);
  const [milkType, setMilkType] = useState<MilkType>('Dairy');
  const [milkStyle, setMilkStyle] = useState<MilkStyle>('Steamed');

  // Modal state
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [editingRecipe, setEditingRecipe] = useState<SavedRecipe | null>(null);
  const [selectedShot, setSelectedShot] = useState<ShotLog | null>(null);

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

  // Data Management modal
  const [showDataModal, setShowDataModal] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Theme state - supports multiple themes
  type ThemeType = 'dark' | 'light' | 'catppuccin' | 'rosepine' | 'rosepine-moon';
  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('theme');
    const validThemes: ThemeType[] = ['dark', 'light', 'catppuccin', 'rosepine', 'rosepine-moon'];
    return (validThemes.includes(saved as ThemeType)) ? saved as ThemeType : 'dark';
  });

  // Caffeine tracker modal
  const [showCaffeine, setShowCaffeine] = useState(false);

  // History filter
  const [beanFilter, setBeanFilter] = useState<string>('');
  const [notesSearch, setNotesSearch] = useState<string>('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [previewShot, setPreviewShot] = useState<ShotLog | null>(null);

  // Shot comparison
  const [compareShots, setCompareShots] = useState<[string | null, string | null]>([null, null]);

  // Pinned recipes
  const [pinnedRecipes, setPinnedRecipes] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('luxe-cafe-pinned-recipes');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

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

  // Shot timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derived state
  const rating = RATINGS[ratingIndex];
  const isColdBrew = COLD_BREW_TYPES.includes(brewType);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadShots();
    if (stored.length > 0) setShots(stored);
    setFavorites(loadFavorites());
    setRecipes(loadRecipes());
    setBeans(loadBeans());
  }, []);

  // Save shots to localStorage when changed
  useEffect(() => {
    if (shots.length > 0) saveShots(shots);
  }, [shots]);

  // Save favorites when changed
  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  // Save recipes when changed
  useEffect(() => {
    saveRecipes(recipes);
  }, [recipes]);

  // Save beans when changed
  useEffect(() => {
    saveBeans(beans);
  }, [beans]);

  // Apply theme to document and save to localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Save pinned recipes when changed
  useEffect(() => {
    localStorage.setItem('luxe-cafe-pinned-recipes', JSON.stringify([...pinnedRecipes]));
  }, [pinnedRecipes]);

  // Toggle pin status for a recipe
  const togglePinRecipe = (id: string) => {
    setPinnedRecipes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Timer interval logic
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 0.1);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRunning]);

  // Timer control functions
  const startTimer = () => setTimerRunning(true);
  const stopTimer = () => setTimerRunning(false);
  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
  };

  // Helper to show toast notifications
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // Helper to show confirmation dialog
  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };

  const closeConfirm = () => setConfirmDialog(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter to log shot (when not in modal)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!showRecipeModal && !showBeanLibrary && !showStats && !showDataModal && !showCaffeine && !selectedShot && !editingRecipe) {
          e.preventDefault();
          if (beanName.trim()) {
            // Trigger form submit
            const form = document.querySelector('.shot-form') as HTMLFormElement;
            if (form) form.requestSubmit();
          }
        }
      }
      // Ctrl+D to cycle themes (when not typing)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          const themes: ('dark' | 'light' | 'catppuccin' | 'rosepine' | 'rosepine-moon')[] = ['dark', 'light', 'catppuccin', 'rosepine', 'rosepine-moon'];
          setTheme(prev => {
            const currentIndex = themes.indexOf(prev);
            return themes[(currentIndex + 1) % themes.length];
          });
        }
      }
      // Escape to close any open modal
      if (e.key === 'Escape') {
        if (confirmDialog) {
          closeConfirm();
        } else if (selectedShot) {
          setSelectedShot(null);
        } else if (editingRecipe) {
          setEditingRecipe(null);
        } else if (showHistoryModal) {
          setShowHistoryModal(false);
          setPreviewShot(null);
        } else if (showBeanLibrary) {
          setShowBeanLibrary(false);
        } else if (showStats) {
          setShowStats(false);
        } else if (showCaffeine) {
          setShowCaffeine(false);
        } else if (showDataModal) {
          setShowDataModal(false);
        } else if (showRecipeModal) {
          setShowRecipeModal(false);
        } else if (showThemePicker) {
          setShowThemePicker(false);
        }
      }
      // Ctrl+B to open Bean Library
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setShowBeanLibrary(prev => !prev);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [beanName, showRecipeModal, showBeanLibrary, showStats, showDataModal, showCaffeine, selectedShot, editingRecipe, showHistoryModal, previewShot, confirmDialog, showThemePicker]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter beans for autocomplete - combine bean library + shot history
  const getAllBeanSuggestions = () => {
    const libraryBeans = beans.filter(b => b.isActive).map(b => b.name);
    const historyBeans = getUniqueBeans(shots);
    // Combine and deduplicate, prioritizing library beans
    const combined = [...new Set([...libraryBeans, ...historyBeans])];
    return combined.sort((a, b) => a.localeCompare(b));
  };

  const handleBeanInput = (value: string) => {
    setBeanName(value);
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
    setBeanName(bean);
    setShowSuggestions(false);
  };

  // Get favorite shot for current bean
  const currentBeanKey = beanName.trim().toLowerCase();
  const favoriteId = favorites[currentBeanKey];
  const favoriteShot = favoriteId ? shots.find(s => s.id === favoriteId) : null;

  // Get last shot for current bean (for tips) - prefer favorite if available
  const lastShotForBean = favoriteShot || (beanName.trim()
    ? shots.find(s => s.beanName.toLowerCase() === currentBeanKey)
    : null);

  // Get all shots for current bean (for journey view)
  const shotsForBean = beanName.trim()
    ? shots.filter(s => s.beanName.toLowerCase() === currentBeanKey).slice(0, 5)
    : [];

  // Calculate suggested settings based on last shot
  const getSuggestedSettings = () => {
    if (!lastShotForBean) return null;

    const currentGrind = lastShotForBean.grindSize;
    const currentTemp = lastShotForBean.temperature || 'Med';
    const rating = lastShotForBean.rating;

    // Temperature order for adjustments
    const tempOrder: Temperature[] = ['Low', 'Med', 'High'];
    const tempIndex = tempOrder.indexOf(currentTemp);

    let suggestedGrind = currentGrind;
    let suggestedTemp = currentTemp;
    let adjustmentType: 'grind' | 'temp' | 'both' = 'grind';

    switch (rating) {
      case 'Very Sour':
        // Major under-extraction: grind finer by 2-3
        suggestedGrind = Math.max(1, currentGrind - 3);
        if (tempIndex < 2) suggestedTemp = tempOrder[tempIndex + 1];
        adjustmentType = 'both';
        break;
      case 'Sour':
        // Minor under-extraction: grind finer by 1
        suggestedGrind = Math.max(1, currentGrind - 1);
        adjustmentType = 'grind';
        break;
      case 'Balanced':
        // Perfect - no changes needed
        return null;
      case 'Bitter':
        // Minor over-extraction: grind coarser by 1
        suggestedGrind = Math.min(25, currentGrind + 1);
        adjustmentType = 'grind';
        break;
      case 'Very Bitter':
        // Major over-extraction: grind coarser by 2-3
        suggestedGrind = Math.min(25, currentGrind + 3);
        if (tempIndex > 0) suggestedTemp = tempOrder[tempIndex - 1];
        adjustmentType = 'both';
        break;
    }

    return {
      grindSize: suggestedGrind,
      temperature: suggestedTemp as Temperature,
      adjustmentType,
      grindDiff: suggestedGrind - currentGrind,
    };
  };

  const suggestedSettings = getSuggestedSettings();

  // Apply suggested settings to form
  const applySuggestedSettings = () => {
    if (!suggestedSettings || !lastShotForBean) return;

    // Copy all settings from last shot
    setBeanName(lastShotForBean.beanName);
    setBrewType(lastShotForBean.brewType);
    setBasket(lastShotForBean.basket);
    setStrength(lastShotForBean.strength);
    if (lastShotForBean.milk) {
      setShowMilk(true);
      setMilkType(lastShotForBean.milk.type);
      setMilkStyle(lastShotForBean.milk.style);
    } else {
      setShowMilk(false);
    }
    setNotes(lastShotForBean.notes || '');

    // Apply suggested adjustments
    setGrindSize(suggestedSettings.grindSize);
    setTemperature(suggestedSettings.temperature);
    setRatingIndex(2); // Reset to Balanced
  };

  // Toggle favorite for a shot
  const toggleFavorite = (shot: ShotLog) => {
    const beanKey = shot.beanName.toLowerCase();
    if (favorites[beanKey] === shot.id) {
      const updated = { ...favorites };
      delete updated[beanKey];
      setFavorites(updated);
    } else {
      setFavorites({ ...favorites, [beanKey]: shot.id });
    }
  };

  // Apply a saved recipe to the form
  const applyRecipe = (recipe: SavedRecipe) => {
    setBeanName(recipe.beanName);
    setBrewType(recipe.brewType);
    setBasket(recipe.basket);
    setGrindSize(recipe.grindSize);
    if (recipe.temperature) setTemperature(recipe.temperature);
    setStrength(recipe.strength);
    if (recipe.milk) {
      setShowMilk(true);
      setMilkType(recipe.milk.type);
      setMilkStyle(recipe.milk.style);
    } else {
      setShowMilk(false);
    }
    setNotes(recipe.notes || '');
  };

  // Save current form as recipe
  const saveAsRecipe = () => {
    if (!recipeName.trim() || !beanName.trim()) return;

    const newRecipe: SavedRecipe = {
      id: generateId(),
      name: recipeName.trim(),
      beanName: beanName.trim(),
      brewType,
      basket,
      grindSize,
      temperature: isColdBrew ? undefined : temperature,
      strength,
      milk: showMilk ? { type: milkType, style: milkStyle } : undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date(),
    };

    setRecipes([newRecipe, ...recipes]);
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
        setRecipes(recipes.filter(r => r.id !== id));
        showToast('Recipe deleted', 'info');
      }
    );
  };

  // Open edit recipe modal
  const openEditRecipe = (recipe: SavedRecipe) => {
    setEditingRecipe(recipe);
    setRecipeName(recipe.name);
    setBeanName(recipe.beanName);
    setBrewType(recipe.brewType);
    setBasket(recipe.basket);
    setGrindSize(recipe.grindSize);
    setStrength(recipe.strength);
    if (recipe.temperature) setTemperature(recipe.temperature);
    if (recipe.milk) {
      setShowMilk(true);
      setMilkType(recipe.milk.type);
      setMilkStyle(recipe.milk.style);
    } else {
      setShowMilk(false);
    }
    setNotes(recipe.notes || '');
  };

  // Update existing recipe
  const updateRecipe = () => {
    if (!editingRecipe || !recipeName.trim()) return;

    const updated: SavedRecipe = {
      ...editingRecipe,
      name: recipeName.trim(),
      beanName,
      brewType,
      basket,
      grindSize,
      temperature: isColdBrew ? undefined : temperature,
      strength,
      milk: showMilk ? { type: milkType, style: milkStyle } : undefined,
      notes: notes.trim() || undefined,
    };

    setRecipes(recipes.map(r => r.id === editingRecipe.id ? updated : r));
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
        setShots(shots.filter(s => s.id !== id));
        setSelectedShot(null);
        showToast('Shot deleted', 'info');
      }
    );
  };

  // Duplicate a shot (copy settings to form)
  const duplicateShot = (shot: ShotLog) => {
    setBeanName(shot.beanName);
    setBrewType(shot.brewType);
    setGrindSize(shot.grindSize);
    setBasket(shot.basket);
    setStrength(shot.strength);
    if (shot.temperature) setTemperature(shot.temperature);
    if (shot.milk) {
      setShowMilk(true);
      setMilkType(shot.milk.type);
      setMilkStyle(shot.milk.style);
    } else {
      setShowMilk(false);
    }
    setNotes(shot.notes || '');
    // Reset rating to Balanced for new shot
    setRatingIndex(2);
    setSelectedShot(null);
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
      // Update existing
      setBeans(beans.map(b => b.id === editingBean.id ? {
        ...b,
        name: newBeanName.trim(),
        roaster: newBeanRoaster.trim() || undefined,
        origin: newBeanOrigin.trim() || undefined,
        roastLevel: newBeanRoastLevel,
        processMethod: newBeanProcess,
        roastDate: newBeanRoastDate || undefined,
        flavorNotes: newBeanFlavorNotes.trim() || undefined,
      } : b));
    } else {
      // Add new
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
      setBeans([newBean, ...beans]);
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
        setBeans(beans.filter(b => b.id !== id));
        if (editingBean?.id === id) resetBeanForm();
        showToast('Bean deleted', 'info');
      }
    );
  };

  const toggleBeanActive = (id: string) => {
    setBeans(beans.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b));
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

    const headers = ['Date', 'Bean', 'Brew Type', 'Basket', 'Grind', 'Temperature', 'Strength', 'Rating', 'Milk Type', 'Milk Style', 'Notes'];
    const csvRows = [headers.join(',')];

    shots.forEach(shot => {
      const row = [
        new Date(shot.timestamp).toLocaleString(),
        `"${shot.beanName.replace(/"/g, '""')}"`,
        shot.brewType,
        shot.basket,
        shot.grindSize,
        shot.temperature || '',
        shot.strength,
        shot.rating,
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
  const decrementGrind = () => setGrindSize(prev => Math.max(1, prev - 1));
  const incrementGrind = () => setGrindSize(prev => Math.min(25, prev + 1));

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!beanName.trim()) return;

    const newShot: ShotLog = {
      id: generateId(),
      beanName: beanName.trim(),
      brewType,
      basket,
      grindSize,
      temperature: isColdBrew ? undefined : temperature,
      strength,
      rating,
      milk: showMilk ? { type: milkType, style: milkStyle } : undefined,
      notes: notes.trim() || undefined,
      timestamp: new Date(),
    };

    setShots([newShot, ...shots]);
    setBeanName('');
    setNotes('');
    setShowSuggestions(false);
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
      <header className="header">
        <Icons.Coffee />
        <h1 className="header__title">Luxe Cafe Dial-In</h1>
        <p className="header__subtitle">Ninja Luxe Cafe Pro Calibration Dashboard</p>

        {/* Hamburger button for mobile */}
        <button
          className="header__hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
        </button>

        {/* Navigation buttons */}
        <div className={`header__btns ${mobileMenuOpen ? 'header__btns--open' : ''}`}>
          <button
            className="header__btn"
            onClick={() => { setShowBeanLibrary(true); setMobileMenuOpen(false); }}
            title="Manage Bean Library"
          >
            <Icons.Bean /> Bean Library
          </button>
          <button
            className="header__btn"
            onClick={() => { setShowStats(true); setMobileMenuOpen(false); }}
            title="View Statistics"
          >
            <Icons.PieChart /> Stats
          </button>
          <button
            className="header__btn header__btn--icon"
            onClick={() => { setShowCaffeine(true); setMobileMenuOpen(false); }}
            title="Caffeine Tracker"
          >
            <Icons.Caffeine />
          </button>
          {/* Theme selector - dropdown for desktop, button for mobile */}
          <div className="header__theme-select header__theme-select--desktop">
            <select
              className="header__theme-dropdown"
              value={theme}
              onChange={(e) => { setTheme(e.target.value as typeof theme); setMobileMenuOpen(false); }}
              title="Select Theme"
            >
              <option value="dark">☕ Coffee Dark</option>
              <option value="light">🥛 Coffee Light</option>
              <option value="catppuccin">🍵 Catppuccin</option>
              <option value="rosepine">🌹 Rose Pine</option>
              <option value="rosepine-moon">🌙 Rose Pine Moon</option>
            </select>
          </div>
          <button
            className="header__btn header__theme-btn"
            onClick={() => { setShowThemePicker(true); setMobileMenuOpen(false); }}
            title="Change Theme"
          >
            <Icons.Palette /> {theme === 'dark' ? 'Coffee Dark' : theme === 'light' ? 'Coffee Light' : theme === 'catppuccin' ? 'Catppuccin' : theme === 'rosepine' ? 'Rose Pine' : 'Rose Pine Moon'}
          </button>
          <button
            className="header__btn header__btn--icon"
            onClick={() => { setShowDataModal(true); setMobileMenuOpen(false); }}
            title="Data Management"
          >
            <Icons.Settings />
          </button>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div
            className="header__overlay"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </header>

      {/* Quick Recipe Menu */}
      {recipes.length > 0 && (
        <div className="recipe-menu">
          <div className="recipe-menu__label">
            <Icons.Zap /> Quick Recipes
          </div>
          <div className="recipe-menu__chips">
            {[...recipes]
              .sort((a, b) => {
                const aPinned = pinnedRecipes.has(a.id);
                const bPinned = pinnedRecipes.has(b.id);
                if (aPinned && !bPinned) return -1;
                if (bPinned && !aPinned) return 1;
                return 0;
              })
              .map((recipe) => {
                const isPinned = pinnedRecipes.has(recipe.id);
                return (
                  <div key={recipe.id} className={`recipe-chip ${isPinned ? 'recipe-chip--pinned' : ''}`}>
                    <button
                      className="recipe-chip__pin"
                      onClick={() => togglePinRecipe(recipe.id)}
                      title={isPinned ? 'Unpin recipe' : 'Pin to top'}
                    >
                      <Icons.Star filled={isPinned} />
                    </button>
                    <button
                      className="recipe-chip__btn"
                      onClick={() => {
                        applyRecipe(recipe);
                        showToast(`Applied "${recipe.name}"`, 'success');
                      }}
                      title={`${recipe.beanName} • ${recipe.brewType}${recipe.notes ? ` • ${recipe.notes}` : ''}`}
                    >
                      {recipe.name}
                    </button>
                    <button
                      className="recipe-chip__edit"
                      onClick={() => openEditRecipe(recipe)}
                      title="Edit recipe"
                    >
                      <Icons.Edit />
                    </button>
                    <button
                      className="recipe-chip__delete"
                      onClick={() => deleteRecipe(recipe.id)}
                      title="Delete recipe"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="dashboard__grid">
        {/* Left Column - Shot Logger */}
        <div className="card">
          <h2 className="card__title">
            <Icons.Edit /> Log New Shot
          </h2>

          <form className="shot-form" onSubmit={handleSubmit}>
            {/* Brew Type Selector */}
            <div className="form-group">
              <label className="form-label">Brew Type</label>
              <div className="select-wrap">
                <select
                  className="form-select"
                  value={brewType}
                  onChange={(e) => setBrewType(e.target.value as BrewType)}
                >
                  {BREW_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <Icons.ChevronDown />
              </div>
            </div>

            {/* Bean Name with Autocomplete */}
            <div className="form-group">
              <label className="form-label">Bean Name</label>
              <div className="autocomplete">
                <div className="autocomplete__input-wrap">
                  <input
                    ref={inputRef}
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ethiopian Yirgacheffe"
                    value={beanName}
                    onChange={(e) => handleBeanInput(e.target.value)}
                    onFocus={handleBeanFocus}
                    required
                  />
                  {(shots.length > 0 || beans.length > 0) && (
                    <button
                      type="button"
                      className="autocomplete__toggle"
                      onClick={() => {
                        setFilteredBeans(getAllBeanSuggestions());
                        setShowSuggestions(!showSuggestions);
                      }}
                    >
                      <Icons.ChevronDown />
                    </button>
                  )}
                </div>
                {showSuggestions && filteredBeans.length > 0 && (
                  <div ref={suggestionsRef} className="autocomplete__dropdown">
                    {filteredBeans.map((beanName) => {
                      const libraryBean = beans.find(b => b.name.toLowerCase() === beanName.toLowerCase() && b.isActive);
                      return (
                        <button
                          key={beanName}
                          type="button"
                          className={`autocomplete__option ${libraryBean ? 'autocomplete__option--library' : ''}`}
                          onClick={() => selectBean(beanName)}
                        >
                          {libraryBean && <Icons.Bean />}
                          <span className="autocomplete__option-name">{beanName}</span>
                          {libraryBean?.roaster && (
                            <span className="autocomplete__option-roaster">{libraryBean.roaster}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Target Recipe Box - Shows when a favorite exists */}
            {favoriteShot && (
              <div className="target-recipe">
                <div className="target-recipe__header">
                  <Icons.Target />
                  <span>Target Recipe for {favoriteShot.beanName}</span>
                </div>
                <div className="target-recipe__settings">
                  <span className="setting-tag setting-tag--gold">Grind {favoriteShot.grindSize}</span>
                  {favoriteShot.temperature && <span className="setting-tag setting-tag--gold">{favoriteShot.temperature}</span>}
                  <span className="setting-tag setting-tag--gold">{favoriteShot.basket}</span>
                  <span className="setting-tag setting-tag--gold">S{favoriteShot.strength}</span>
                </div>
              </div>
            )}

            {/* Basket Size */}
            <div className="form-group">
              <label className="form-label">Basket Size</label>
              <div className="pill-group">
                {BASKETS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    className={`pill-btn ${basket === b ? 'pill-btn--active' : ''}`}
                    onClick={() => setBasket(b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Grind Size with +/- Controls */}
            <div className="form-group">
              <label className="form-label">Grind Size</label>
              <div className="grind-control">
                <button
                  type="button"
                  className="grind-control__btn"
                  onClick={decrementGrind}
                  disabled={grindSize <= 1}
                >
                  <Icons.Minus />
                </button>
                <div className="grind-control__slider-wrap">
                  <input
                    type="range"
                    className="slider slider--thick"
                    min={1}
                    max={25}
                    value={grindSize}
                    onChange={(e) => setGrindSize(Number(e.target.value))}
                  />
                  <span className="grind-control__value">{grindSize}</span>
                </div>
                <button
                  type="button"
                  className="grind-control__btn"
                  onClick={incrementGrind}
                  disabled={grindSize >= 25}
                >
                  <Icons.Plus />
                </button>
              </div>
              <div className="slider-labels">
                <span>1 Fine</span>
                <span>25 Coarse</span>
              </div>
            </div>

            {/* Temperature - Hidden for cold brews */}
            {!isColdBrew && (
              <div className="form-group">
                <label className="form-label">Temperature</label>
                <div className="pill-group">
                  {TEMPERATURES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`pill-btn ${temperature === t ? 'pill-btn--active' : ''}`}
                      onClick={() => setTemperature(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Strength */}
            <div className="form-group">
              <label className="form-label">Strength</label>
              <div className="pill-group">
                {STRENGTHS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={`pill-btn ${strength === s.value ? 'pill-btn--active' : ''}`}
                    onClick={() => setStrength(s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Discrete Rating Slider */}
            <div className="form-group">
              <label className="form-label">Taste Rating</label>
              <div className="rating-slider">
                <div
                  className="rating-slider__label"
                  style={{ color: RATING_COLORS[rating] }}
                >
                  {rating}
                </div>
                <div className="rating-slider__track">
                  <input
                    type="range"
                    className="rating-slider__input"
                    min={0}
                    max={4}
                    step={1}
                    value={ratingIndex}
                    onChange={(e) => setRatingIndex(Number(e.target.value))}
                    style={{
                      '--rating-color': RATING_COLORS[rating],
                    } as React.CSSProperties}
                  />
                  <div className="rating-slider__markers">
                    {RATINGS.map((_, i) => (
                      <span
                        key={i}
                        className={`rating-slider__marker ${i === ratingIndex ? 'rating-slider__marker--active' : ''}`}
                        style={i === ratingIndex ? { background: RATING_COLORS[rating] } : {}}
                      />
                    ))}
                  </div>
                </div>
                <div className="rating-slider__scale">
                  <span>Sour</span>
                  <span>Bitter</span>
                </div>
              </div>
            </div>

            {/* Froth Lab - Collapsible Milk Settings */}
            <div className="form-group">
              <button
                type="button"
                className="froth-toggle"
                onClick={() => setShowMilk(!showMilk)}
              >
                <Icons.Milk />
                <span>Froth Lab</span>
                <span className="froth-toggle__badge">{showMilk ? 'On' : 'Off'}</span>
                {showMilk ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
              </button>

              {showMilk && (
                <div className="froth-panel">
                  <div className="froth-panel__row">
                    <label className="form-label">Milk Type</label>
                    <div className="pill-group pill-group--wrap">
                      {MILK_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`pill-btn pill-btn--sm ${milkType === type ? 'pill-btn--active' : ''}`}
                          onClick={() => setMilkType(type)}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="froth-panel__row">
                    <label className="form-label">Style</label>
                    <div className="pill-group pill-group--wrap">
                      {MILK_STYLES.map((style) => (
                        <button
                          key={style}
                          type="button"
                          className={`pill-btn pill-btn--sm ${milkStyle === style ? 'pill-btn--active' : ''}`}
                          onClick={() => setMilkStyle(style)}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Add-ins / Notes */}
            <div className="form-group">
              <label className="form-label">Add-ins / Notes</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Vanilla syrup, Cinnamon, Extra hot"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Shot Timer */}
            <div className="shot-timer">
              <div className="shot-timer__display">
                <span className="shot-timer__time">{timerSeconds.toFixed(1)}s</span>
              </div>
              <div className="shot-timer__controls">
                {timerRunning ? (
                  <button type="button" className="shot-timer__btn shot-timer__btn--stop" onClick={stopTimer} title="Stop">
                    ⏸
                  </button>
                ) : (
                  <button type="button" className="shot-timer__btn shot-timer__btn--start" onClick={startTimer} title="Start">
                    ▶
                  </button>
                )}
                <button type="button" className="shot-timer__btn shot-timer__btn--reset" onClick={resetTimer} title="Reset" disabled={timerSeconds === 0}>
                  ↺
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button type="submit" className="btn-submit">
                Log Shot
              </button>
              <button
                type="button"
                className="btn-save-recipe"
                onClick={() => setShowRecipeModal(true)}
                disabled={!beanName.trim()}
              >
                <Icons.Save /> Save as Recipe
              </button>
            </div>
          </form>
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
              if (!beanName.trim()) return null;
              const beanProfile = beans.find(b => b.name.toLowerCase() === beanName.toLowerCase());
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

            {lastShotForBean ? (() => {
              const config = RATING_CONFIG[lastShotForBean.rating];
              const tip = getBaristaTip(lastShotForBean.rating);
              const TipIcon = config.icon;
              return (
                <>
                  {/* Current Rating & Tip */}
                  <div className={`barista-tip barista-tip--${config.colorClass}`}>
                    <span className="barista-tip__icon">
                      <TipIcon />
                    </span>
                    <div className="barista-tip__content">
                      <h4>
                        Tip for "{lastShotForBean.beanName}"
                        {tip.adjustment !== 'none' && (
                          <span className={`adjustment-badge adjustment-badge--${tip.adjustment}`}>
                            {tip.adjustment === 'large' ? 'Major Adj.' : 'Minor Adj.'}
                          </span>
                        )}
                      </h4>
                      <p>{tip.message}</p>
                    </div>
                  </div>

                  {/* Suggested Next Settings */}
                  {suggestedSettings && (
                    <div className="suggested-settings">
                      <div className="suggested-settings__header">
                        <Icons.Target />
                        <span>Suggested Next Shot</span>
                      </div>
                      <div className="suggested-settings__values">
                        <div className="suggested-setting">
                          <span className="suggested-setting__label">Grind</span>
                          <span className="suggested-setting__value">
                            {suggestedSettings.grindSize}
                            <span className={`suggested-setting__diff ${suggestedSettings.grindDiff > 0 ? 'diff--coarser' : 'diff--finer'}`}>
                              ({suggestedSettings.grindDiff > 0 ? '+' : ''}{suggestedSettings.grindDiff})
                            </span>
                          </span>
                        </div>
                        {suggestedSettings.adjustmentType === 'both' && (
                          <div className="suggested-setting">
                            <span className="suggested-setting__label">Temp</span>
                            <span className="suggested-setting__value">{suggestedSettings.temperature}</span>
                          </div>
                        )}
                      </div>
                      <button
                        className="btn-apply-suggestion"
                        onClick={applySuggestedSettings}
                        title="Apply suggested settings to form"
                      >
                        <Icons.Zap /> Apply to Form
                      </button>
                    </div>
                  )}

                  {/* Dial-in Journey */}
                  {shotsForBean.length > 1 && (() => {
                    const displayShots = shotsForBean.slice(0, 5).reverse();
                    const grindSizes = displayShots.map(s => s.grindSize);
                    const minGrind = Math.min(...grindSizes);
                    const maxGrind = Math.max(...grindSizes);
                    const grindRange = maxGrind - minGrind || 1;

                    return (
                      <div className="dialin-journey">
                        <div className="dialin-journey__label">
                          <Icons.TrendingUp /> Recent Journey
                        </div>
                        <div className="dialin-journey__timeline">
                          {displayShots.map((shot, idx) => {
                            const shotConfig = RATING_CONFIG[shot.rating];
                            const ShotIcon = shotConfig.icon;
                            return (
                              <div
                                key={shot.id}
                                className={`journey-step journey-step--${shotConfig.colorClass}`}
                                title={`Grind ${shot.grindSize} • ${shot.rating}`}
                              >
                                <ShotIcon />
                                <span className="journey-step__grind">G{shot.grindSize}</span>
                                {idx < displayShots.length - 1 && <span className="journey-step__arrow">→</span>}
                              </div>
                            );
                          })}
                        </div>
                        {/* Grind History Chart */}
                        <div className="grind-history" title="Grind size trend">
                          {displayShots.map((shot, idx) => (
                            <div
                              key={shot.id}
                              className={`grind-history__bar ${idx === displayShots.length - 1 ? 'grind-history__bar--current' : ''}`}
                              style={{
                                height: `${20 + ((shot.grindSize - minGrind) / grindRange) * 80}%`,
                                background: RATING_COLORS[shot.rating]
                              }}
                              title={`G${shot.grindSize}`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </>
              );
            })() : (
              <div className="empty-state">
                <Icons.Lightbulb />
                <p className="empty-state__text">
                  {beanName.trim()
                    ? `No history for "${beanName}" yet. Log a shot to get tips!`
                    : 'Enter a bean name to see calibration tips.'}
                </p>
              </div>
            )}
          </div>

          {/* History Log */}
          <div className="card">
            <h2 className="card__title">
              <Icons.BarChart /> Shot History
              {shots.length > 0 && (
                <button
                  className="card__expand-btn"
                  onClick={() => setShowHistoryModal(true)}
                  title="Expand shot history"
                >
                  <Icons.Expand />
                </button>
              )}
            </h2>

            {/* Bean Filter & Notes Search */}
            {shots.length > 0 && (
              <div className="history-filters">
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
            )}

            {(() => {
              let filteredShots = beanFilter
                ? sortedShots.filter(s => s.beanName === beanFilter)
                : sortedShots;

              // Apply notes search filter
              if (notesSearch.trim()) {
                const searchLower = notesSearch.toLowerCase();
                filteredShots = filteredShots.filter(s =>
                  s.notes?.toLowerCase().includes(searchLower)
                );
              }

              return filteredShots.length > 0 ? (
                <div className="history-list">
                  {filteredShots.map((shot) => {
                    const config = RATING_CONFIG[shot.rating];
                    const ShotIcon = config.icon;
                    const isFavorite = favorites[shot.beanName.toLowerCase()] === shot.id;
                    return (
                      <div
                        key={shot.id}
                        className={`history-item history-item--clickable ${isFavorite ? 'history-item--favorite' : ''}`}
                        onClick={() => setSelectedShot(shot)}
                      >
                        <div className={`history-item__rating history-item__rating--${config.colorClass}`}>
                          <ShotIcon />
                        </div>
                        <div className="history-item__details">
                          <div className="history-item__bean">{shot.beanName}</div>
                          <div className="history-item__meta">
                            {shot.brewType} • {formatDate(shot.timestamp)}
                          </div>
                          <div className="history-item__settings">
                            <span className="setting-tag">Grind {shot.grindSize}</span>
                            {shot.temperature && <span className="setting-tag">{shot.temperature}</span>}
                            <span className="setting-tag">{shot.basket}</span>
                            <span className="setting-tag">S{shot.strength}</span>
                            {shot.milk && (
                              <span className="setting-tag setting-tag--milk">
                                {shot.milk.type} {shot.milk.style}
                              </span>
                            )}
                          </div>
                          {shot.notes && (
                            <div className="history-item__notes">
                              {shot.notes}
                            </div>
                          )}
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
                            onClick={(e) => { e.stopPropagation(); deleteShot(shot.id); }}
                            title="Delete shot"
                          >
                            <Icons.Trash />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <Icons.Clipboard />
                  <p className="empty-state__text">No shots logged yet. Start dialing in!</p>
                </div>
              )
            })()}
          </div>
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
                Save your current settings as a quick recipe for "{beanName}"
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
                  <span className="setting-tag">{brewType}</span>
                  <span className="setting-tag">{beanName}</span>
                  <span className="setting-tag">Grind {grindSize}</span>
                  {!isColdBrew && <span className="setting-tag">{temperature}</span>}
                  <span className="setting-tag">{basket}</span>
                  <span className="setting-tag">S{strength}</span>
                  {showMilk && <span className="setting-tag setting-tag--milk">{milkType} {milkStyle}</span>}
                  {notes && <span className="setting-tag">{notes}</span>}
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
                  value={beanName}
                  onChange={(e) => setBeanName(e.target.value)}
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
                    value={grindSize}
                    onChange={(e) => setGrindSize(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Strength</label>
                  <div className="pill-group pill-group--sm">
                    {STRENGTHS.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        className={`pill-btn pill-btn--sm ${strength === s.value ? 'pill-btn--active' : ''}`}
                        onClick={() => setStrength(s.value)}
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
                        className={`pill-btn pill-btn--sm ${basket === b ? 'pill-btn--active' : ''}`}
                        onClick={() => setBasket(b)}
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
                          className={`pill-btn pill-btn--sm ${temperature === t ? 'pill-btn--active' : ''}`}
                          onClick={() => setTemperature(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal__preview">
                <div className="modal__preview-label">Updated recipe:</div>
                <div className="setting-tags-wrap">
                  <span className="setting-tag">{brewType}</span>
                  <span className="setting-tag">{beanName}</span>
                  <span className="setting-tag">Grind {grindSize}</span>
                  {!isColdBrew && <span className="setting-tag">{temperature}</span>}
                  <span className="setting-tag">{basket}</span>
                  <span className="setting-tag">S{strength}</span>
                  {showMilk && <span className="setting-tag setting-tag--milk">{milkType} {milkStyle}</span>}
                  {notes && <span className="setting-tag">{notes}</span>}
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
                    hour12: true,
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
                              onClick={() => toggleBeanActive(bean.id)}
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

      {/* Data Management Modal */}
      {showDataModal && (
        <div className="modal-overlay" onClick={() => { setShowDataModal(false); setImportStatus(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3><Icons.Settings /> Data Management</h3>
              <button className="modal__close" onClick={() => { setShowDataModal(false); setImportStatus(null); }}>
                <Icons.X />
              </button>
            </div>
            <div className="modal__body">
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
      )}

      {/* Caffeine Tracker Modal */}
      {showCaffeine && (
        <div className="modal-overlay" onClick={() => setShowCaffeine(false)}>
          <div className="modal modal--caffeine" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2><Icons.Caffeine /> Caffeine Tracker</h2>
              <button className="modal__close" onClick={() => setShowCaffeine(false)}>×</button>
            </div>
            <div className="modal__body">
              {(() => {
                // Caffeine amounts per basket type (mg)
                const CAFFEINE_MG = { 'Double': 63, 'Luxe': 80 };

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
                        <span className="caffeine-stat__value">{todayShots.length}</span>
                        <span className="caffeine-stat__label">Shots Today</span>
                      </div>
                      <div className="caffeine-stat">
                        <span className="caffeine-stat__value">{avgDaily}</span>
                        <span className="caffeine-stat__label">Daily Avg (mg)</span>
                      </div>
                      <div className="caffeine-stat">
                        <span className="caffeine-stat__value">{weekShots.length}</span>
                        <span className="caffeine-stat__label">Shots This Week</span>
                      </div>
                    </div>

                    <div className="caffeine-info">
                      <h3>Caffeine by Basket</h3>
                      <div className="caffeine-breakdown">
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
                                {shot.brewType} • {formatDate(shot.timestamp)}
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
                            hour12: true,
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

      {/* Theme Picker Modal (Mobile) */}
      {showThemePicker && (
        <div className="modal-overlay" onClick={() => setShowThemePicker(false)}>
          <div className="modal modal--theme-picker" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3><Icons.Palette /> Choose Theme</h3>
              <button className="modal__close" onClick={() => setShowThemePicker(false)}>
                <Icons.X />
              </button>
            </div>
            <div className="modal__body">
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
                    onClick={() => { setTheme(t.value as typeof theme); setShowThemePicker(false); }}
                  >
                    <span className="theme-picker__emoji">{t.emoji}</span>
                    <span className="theme-picker__label">{t.label}</span>
                    {theme === t.value && <Icons.Check />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shot Comparison Panel */}
      {(shot1 || shot2) && (
        <div className="compare-panel">
          <div className="compare-panel__header">
            <h3><Icons.BarChart /> Compare Shots</h3>
            <button className="compare-panel__close" onClick={() => setCompareShots([null, null])}>
              <Icons.X />
            </button>
          </div>
          <div className="compare-panel__content">
            {[shot1, shot2].map((shot, idx) => (
              <div key={idx} className={`compare-panel__shot ${!shot ? 'compare-panel__shot--empty' : ''}`}>
                {shot ? (
                  <>
                    <div className="compare-panel__shot-header">
                      <span className="compare-panel__bean">{shot.beanName}</span>
                      <span className={`compare-panel__rating compare-panel__rating--${RATING_CONFIG[shot.rating].colorClass}`}>
                        {shot.rating}
                      </span>
                    </div>
                    <div className="compare-panel__details">
                      <div className="compare-panel__detail">
                        <span className="compare-panel__label">Grind</span>
                        <span className="compare-panel__value">{shot.grindSize}</span>
                      </div>
                      <div className="compare-panel__detail">
                        <span className="compare-panel__label">Temp</span>
                        <span className="compare-panel__value">{shot.temperature || '-'}</span>
                      </div>
                      <div className="compare-panel__detail">
                        <span className="compare-panel__label">Basket</span>
                        <span className="compare-panel__value">{shot.basket}</span>
                      </div>
                      <div className="compare-panel__detail">
                        <span className="compare-panel__label">Strength</span>
                        <span className="compare-panel__value">{shot.strength}</span>
                      </div>
                    </div>
                    <button
                      className="compare-panel__remove"
                      onClick={() => setCompareShots(prev => idx === 0 ? [null, prev[1]] : [prev[0], null])}
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <span className="compare-panel__placeholder">Select a shot to compare</span>
                )}
              </div>
            ))}
          </div>
          {shot1 && shot2 && (
            <div className="compare-panel__diff">
              <span className="compare-panel__diff-label">Grind Difference:</span>
              <span className={`compare-panel__diff-value ${shot2.grindSize > shot1.grindSize ? 'diff--coarser' : shot2.grindSize < shot1.grindSize ? 'diff--finer' : ''}`}>
                {shot2.grindSize - shot1.grindSize > 0 ? '+' : ''}{shot2.grindSize - shot1.grindSize}
              </span>
            </div>
          )}
        </div>
      )}
      {confirmDialog && (
        <div className="modal-overlay" onClick={closeConfirm}>
          <div className="modal modal--confirm" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2>{confirmDialog.title}</h2>
              <button className="modal__close" onClick={closeConfirm}>
                <Icons.X />
              </button>
            </div>
            <div className="modal__body">
              <p className="confirm-message">{confirmDialog.message}</p>
            </div>
            <div className="modal__footer modal__footer--confirm">
              <button className="btn btn--secondary" onClick={closeConfirm}>
                Cancel
              </button>
              <button
                className="btn btn--danger"
                onClick={() => {
                  confirmDialog.onConfirm();
                  closeConfirm();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          <span className="toast__message">{toast.message}</span>
          <button className="toast__close" onClick={() => setToast(null)}>
            <Icons.X />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
