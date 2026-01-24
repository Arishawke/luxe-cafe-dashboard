import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { ShotLog, Basket, Temperature, Strength, Rating } from './types';
import { loadShots, saveShots, generateId, formatDate, getBaristaTip } from './utils';

// SVG Icons Component
const Icons = {
  Coffee: () => (
    <svg className="header__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
      <path d="M6 2v2" />
      <path d="M10 2v2" />
      <path d="M14 2v2" />
    </svg>
  ),
  Edit: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  ChefHat: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6a4 4 0 0 1 1.41 7.87V21H6v-7.13z" />
    </svg>
  ),
  BarChart: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
  Lightbulb: () => (
    <svg className="icon icon--xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  ),
  Clipboard: () => (
    <svg className="icon icon--xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  // Rating icons
  Citrus: () => (
    <svg className="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a7 7 0 0 0 0 14 7 7 0 0 0 0-14" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  ),
  Flame: () => (
    <svg className="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
};

// Rating icon map
const RATING_ICONS: Record<Rating, () => JSX.Element> = {
  Sour: Icons.Citrus,
  Balanced: Icons.Sparkles,
  Bitter: Icons.Flame,
};

// Options for selectors
const BASKETS: Basket[] = ['Single', 'Double', 'Luxe'];
const TEMPERATURES: Temperature[] = ['Low', 'Med', 'High'];
const STRENGTHS: { value: Strength; label: string }[] = [
  { value: 1, label: '1 Mild' },
  { value: 2, label: '2 Classic' },
  { value: 3, label: '3 Rich' },
];
const RATINGS: Rating[] = ['Sour', 'Balanced', 'Bitter'];

function App() {
  // Shot history
  const [shots, setShots] = useState<ShotLog[]>([]);

  // Form state
  const [beanName, setBeanName] = useState('');
  const [basket, setBasket] = useState<Basket>('Double');
  const [grindSize, setGrindSize] = useState(12);
  const [temperature, setTemperature] = useState<Temperature>('Med');
  const [strength, setStrength] = useState<Strength>(2);
  const [rating, setRating] = useState<Rating>('Balanced');

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

  // Get last shot for current bean (for tips)
  const lastShotForBean = beanName.trim()
    ? shots.find(s => s.beanName.toLowerCase() === beanName.toLowerCase().trim())
    : null;

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!beanName.trim()) return;

    const newShot: ShotLog = {
      id: generateId(),
      beanName: beanName.trim(),
      basket,
      grindSize,
      temperature,
      strength,
      rating,
      timestamp: new Date(),
    };

    setShots([newShot, ...shots]);
    setBeanName('');
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
            {/* Bean Name */}
            <div className="form-group">
              <label className="form-label">Bean Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ethiopian Yirgacheffe"
                value={beanName}
                onChange={(e) => setBeanName(e.target.value)}
                required
              />
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

            {/* Grind Size */}
            <div className="form-group">
              <label className="form-label">Grind Size</label>
              <div className="slider-container">
                <input
                  type="range"
                  className="slider"
                  min={1}
                  max={25}
                  value={grindSize}
                  onChange={(e) => setGrindSize(Number(e.target.value))}
                />
                <span className="slider-value">{grindSize}</span>
              </div>
              <div className="slider-labels">
                <span>1 Fine</span>
                <span>25 Coarse</span>
              </div>
            </div>

            {/* Temperature */}
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

            {/* Rating */}
            <div className="form-group">
              <label className="form-label">Taste Rating</label>
              <div className="pill-group">
                {RATINGS.map((r) => {
                  const RatingIcon = RATING_ICONS[r];
                  return (
                    <button
                      key={r}
                      type="button"
                      className={`pill-btn pill-btn--${r.toLowerCase()} ${rating === r ? 'pill-btn--active' : ''}`}
                      onClick={() => setRating(r)}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
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

            {lastShotForBean ? (
              <div className={`barista-tip barista-tip--${lastShotForBean.rating.toLowerCase()}`}>
                <span className="barista-tip__icon">
                  {(() => {
                    const TipIcon = RATING_ICONS[lastShotForBean.rating];
                    return <TipIcon />;
                  })()}
                </span>
                <div className="barista-tip__content">
                  <h4>Tip for "{lastShotForBean.beanName}"</h4>
                  <p>{getBaristaTip(lastShotForBean.rating).message}</p>
                </div>
              </div>
            ) : (
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
                  const ShotIcon = RATING_ICONS[shot.rating];
                  return (
                    <div key={shot.id} className="history-item">
                      <div className={`history-item__rating history-item__rating--${shot.rating.toLowerCase()}`}>
                        <ShotIcon />
                      </div>
                      <div className="history-item__details">
                        <div className="history-item__bean">{shot.beanName}</div>
                        <div className="history-item__meta">{formatDate(shot.timestamp)}</div>
                        <div className="history-item__settings">
                          <span className="setting-tag">Grind {shot.grindSize}</span>
                          <span className="setting-tag">{shot.temperature}</span>
                          <span className="setting-tag">{shot.basket}</span>
                          <span className="setting-tag">S{shot.strength}</span>
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
