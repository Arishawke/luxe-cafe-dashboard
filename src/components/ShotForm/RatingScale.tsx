import { RATINGS, RATING_COLORS } from '../../constants';

interface RatingScaleProps {
    ratingIndex: number;
    onChange: (index: number) => void;
    rated: boolean;
    setRated: (v: boolean) => void;
}

export default function RatingScale({ ratingIndex, onChange, rated, setRated }: RatingScaleProps) {
    const rating = RATINGS[ratingIndex];
    return (
        <div className="form-group">
            <div className="rating-header">
                <label className="form-label" htmlFor="shot-rating">Taste Rating</label>
                <button
                    type="button"
                    className="rating-later-toggle"
                    onClick={() => setRated(!rated)}
                    aria-pressed={!rated}
                >
                    {rated ? 'Taste later' : 'Rate now'}
                </button>
            </div>
            {rated ? (
                <div className="rating-slider">
                    <div
                        className="rating-slider__label"
                        style={{ color: RATING_COLORS[rating] }}
                    >
                        {rating}
                    </div>
                    <div className="rating-slider__track">
                        <input
                            id="shot-rating"
                            type="range"
                            className="rating-slider__input"
                            min={0}
                            max={4}
                            step={1}
                            value={ratingIndex}
                            onChange={(e) => onChange(Number(e.target.value))}
                            aria-valuetext={rating}
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
            ) : (
                <p className="rating-later-hint">
                    Logging without a rating. Tap the shot in your history to rate it once you've tasted it.
                </p>
            )}
        </div>
    );
}
