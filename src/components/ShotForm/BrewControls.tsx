import type { Basket, Temperature, Strength } from '../../types';
import { BASKETS, TEMPERATURES, STRENGTHS } from '../../constants';
import Icons from '../Icons';

interface BrewControlsProps {
    basket: Basket;
    setBasket: (b: Basket) => void;
    grindSize: number;
    setGrindSize: (g: number) => void;
    temperature: Temperature;
    setTemperature: (t: Temperature) => void;
    strength: Strength;
    setStrength: (s: Strength) => void;
    isColdBrew: boolean;
    onIncrementGrind: () => void;
    onDecrementGrind: () => void;
}

export default function BrewControls({
    basket,
    setBasket,
    grindSize,
    setGrindSize,
    temperature,
    setTemperature,
    strength,
    setStrength,
    isColdBrew,
    onIncrementGrind,
    onDecrementGrind,
}: BrewControlsProps) {
    return (
        <>
            <div className="form-group">
                <span className="form-label" id="shot-basket-label">Basket Size</span>
                <div className="pill-group" role="group" aria-labelledby="shot-basket-label">
                    {BASKETS.map((b) => (
                        <button
                            key={b}
                            type="button"
                            className={`pill-btn ${basket === b ? 'pill-btn--active' : ''}`}
                            onClick={() => setBasket(b)}
                            aria-pressed={basket === b}
                        >
                            {b}
                        </button>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="shot-grind-size">Grind Size</label>
                <div className="grind-control">
                    <button
                        type="button"
                        className="grind-control__btn"
                        onClick={onDecrementGrind}
                        disabled={grindSize <= 1}
                        aria-label="Decrease grind size"
                    >
                        <Icons.Minus />
                    </button>
                    <div className="grind-control__slider-wrap">
                        <input
                            id="shot-grind-size"
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
                        onClick={onIncrementGrind}
                        disabled={grindSize >= 25}
                        aria-label="Increase grind size"
                    >
                        <Icons.Plus />
                    </button>
                </div>
                <div className="slider-labels">
                    <span>1 Fine</span>
                    <span>25 Coarse</span>
                </div>
            </div>

            {!isColdBrew && (
                <div className="form-group">
                    <span className="form-label" id="shot-temperature-label">Temperature</span>
                    <div className="pill-group" role="group" aria-labelledby="shot-temperature-label">
                        {TEMPERATURES.map((t) => (
                            <button
                                key={t}
                                type="button"
                                className={`pill-btn ${temperature === t ? 'pill-btn--active' : ''}`}
                                onClick={() => setTemperature(t)}
                                aria-pressed={temperature === t}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="form-group">
                <span className="form-label" id="shot-strength-label">Strength</span>
                <div className="pill-group" role="group" aria-labelledby="shot-strength-label">
                    {STRENGTHS.map((s) => (
                        <button
                            key={s.value}
                            type="button"
                            className={`pill-btn ${strength === s.value ? 'pill-btn--active' : ''}`}
                            onClick={() => setStrength(s.value)}
                            aria-pressed={strength === s.value}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
