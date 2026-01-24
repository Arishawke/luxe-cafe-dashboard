import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import type { ShotLog, Basket, Temperature, Strength, Rating, BrewType, MilkType, MilkStyle, MilkSettings } from './types';
import { COLD_BREW_TYPES } from './types';
import { loadShots, saveShots, generateId, formatDate, getBaristaTip, getUniqueBeans } from './utils';

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
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6a4 4 0 0 1 1.41 7.87V21H6v-7.13z" />
    </svg>
  ),
  BarChart: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
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
const BASKETS: Basket[] = ['Single', 'Double', 'Luxe'];
const TEMPERATURES: Temperature[] = ['Low', 'Med', 'High'];
const STRENGTHS: { value: Strength; label: string }[] = [
  { value: 1, label: '1 Mild' },
  { value: 2, label: '2 Classic' },
  { value: 3, label: '3 Rich' },
];
const MILK_TYPES: MilkType[] = ['Dairy', 'Plant'];
const MILK_STYLES: MilkStyle[] = ['Steamed', 'Thin', 'Thick', 'Cold Foam'];

function App() {
  // Shot history
  const [shots, setShots] = useState<ShotLog[]>([]);

  // Form state
  const [beanName, setBeanName] = useState('');
  const [brewType, setBrewType] = useState<BrewType>('Espresso');
  const [basket, setBasket] = useState<Basket>('Double');
  const [grindSize, setGrindSize] = useState(12);
  const [temperature, setTemperature] = useState<Temperature>('Med');
  const [strength, setStrength] = useState<Strength>(2);
  const [ratingIndex, setRatingIndex] = useState(2); // 0-4 index, default Balanced

  // Milk settings
  const [showMilk, setShowMilk] = useState(false);
  const [milkType, setMilkType] = useState<MilkType>('Dairy');
  const [milkStyle, setMilkStyle] = useState<MilkStyle>('Steamed');

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredBeans, setFilteredBeans] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Derived state
  const rating = RATINGS[ratingIndex];
  const isColdBrew = COLD_BREW_TYPES.includes(brewType);

  // Load shots from localStorage on mount
  useEffect(() => {
    const stored = loadShots();
    if (stored.length > 0) {
      setShots(stored);
    }
  }, []);

  // Save shots to localStorage when changed
  useEffect(() => {
    if (shots.length > 0) {
      saveShots(shots);
    }
  }, [shots]);

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

  // Filter beans for autocomplete
  const handleBeanInput = (value: string) => {
    setBeanName(value);
    const allBeans = getUniqueBeans(shots);
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
    setFilteredBeans(getUniqueBeans(shots));
    setShowSuggestions(true);
  };

  const selectBean = (bean: string) => {
    setBeanName(bean);
    setShowSuggestions(false);
  };

  // Get last shot for current bean (for tips)
  const lastShotForBean = beanName.trim()
    ? shots.find(s => s.beanName.toLowerCase() === beanName.toLowerCase().trim())
    : null;

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
      timestamp: new Date(),
    };

    setShots([newShot, ...shots]);
    setBeanName('');
    setShowSuggestions(false);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <Icons.Coffee />
        <h1 className="header__title">Luxe Cafe Dial-In</h1>
        <p className="header__subtitle">Ninja Luxe Cafe Pro Calibration Dashboard</p>
      </header>

      {/* Main Grid */}
      <div className="dashboard__grid">
        {/* Left Column - Shot Logger */}
        <div className="card">
          <h2 className="card__title">
            <Icons.Edit /> Log New Shot
          </h2>

          <form onSubmit={handleSubmit}>
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
                  {shots.length > 0 && (
                    <button
                      type="button"
                      className="autocomplete__toggle"
                      onClick={() => {
                        setFilteredBeans(getUniqueBeans(shots));
                        setShowSuggestions(!showSuggestions);
                      }}
                    >
                      <Icons.ChevronDown />
                    </button>
                  )}
                </div>
                {showSuggestions && filteredBeans.length > 0 && (
                  <div ref={suggestionsRef} className="autocomplete__dropdown">
                    {filteredBeans.map((bean) => (
                      <button
                        key={bean}
                        type="button"
                        className="autocomplete__option"
                        onClick={() => selectBean(bean)}
                      >
                        {bean}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

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
                    className="slider"
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
                    <div className="pill-group">
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
                    <div className="pill-group">
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

            <button type="submit" className="btn-submit">
              Log Shot
            </button>
          </form>
        </div>

        {/* Right Column */}
        <div className="side-panel">
          {/* Smart Barista Card */}
          <div className="card">
            <h2 className="card__title">
              <Icons.ChefHat /> Smart Barista
            </h2>

            {lastShotForBean ? (() => {
              const config = RATING_CONFIG[lastShotForBean.rating];
              const tip = getBaristaTip(lastShotForBean.rating);
              const TipIcon = config.icon;
              return (
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
            </h2>

            {shots.length > 0 ? (
              <div className="history-list">
                {shots.map((shot) => {
                  const config = RATING_CONFIG[shot.rating];
                  const ShotIcon = config.icon;
                  return (
                    <div key={shot.id} className="history-item">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
