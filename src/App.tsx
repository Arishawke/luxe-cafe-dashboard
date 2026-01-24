import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { ShotLog, Basket, Temperature, Strength, Rating } from './types';
import { loadShots, saveShots, generateId, formatDate, getBaristaTip } from './utils';

// Options for selectors
const BASKETS: Basket[] = ['Single', 'Double', 'Luxe'];
const TEMPERATURES: Temperature[] = ['Low', 'Med', 'High'];
const STRENGTHS: { value: Strength; label: string }[] = [
  { value: 1, label: '1 Mild' },
  { value: 2, label: '2 Classic' },
  { value: 3, label: '3 Rich' },
];
const RATINGS: Rating[] = ['Sour', 'Balanced', 'Bitter'];

const RATING_ICONS: Record<Rating, string> = {
  Sour: '🍋',
  Balanced: '✨',
  Bitter: '🔥',
};

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
        <div className="header__icon">☕</div>
        <h1 className="header__title">Luxe Cafe Dial-In</h1>
        <p className="header__subtitle">Ninja Luxe Cafe Pro Calibration Dashboard</p>
      </header>

      {/* Main Grid */}
      <div className="dashboard__grid">
        {/* Left Column - Shot Logger */}
        <div className="card">
          <h2 className="card__title">
            <span>📝</span> Log New Shot
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
                {RATINGS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`pill-btn pill-btn--${r.toLowerCase()} ${rating === r ? 'pill-btn--active' : ''}`}
                    onClick={() => setRating(r)}
                  >
                    {RATING_ICONS[r]} {r}
                  </button>
                ))}
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
              <span>🧑‍🍳</span> Smart Barista
            </h2>

            {lastShotForBean ? (
              <div className={`barista-tip barista-tip--${lastShotForBean.rating.toLowerCase()}`}>
                <span className="barista-tip__icon">
                  {getBaristaTip(lastShotForBean.rating).icon}
                </span>
                <div className="barista-tip__content">
                  <h4>Tip for "{lastShotForBean.beanName}"</h4>
                  <p>{getBaristaTip(lastShotForBean.rating).message}</p>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state__icon">💡</div>
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
              <span>📊</span> Shot History
            </h2>

            {shots.length > 0 ? (
              <div className="history-list">
                {shots.map((shot) => (
                  <div key={shot.id} className="history-item">
                    <div className={`history-item__rating history-item__rating--${shot.rating.toLowerCase()}`}>
                      {RATING_ICONS[shot.rating]}
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
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state__icon">📋</div>
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
