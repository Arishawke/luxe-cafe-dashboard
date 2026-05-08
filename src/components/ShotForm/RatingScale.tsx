import { RATINGS, RATING_COLORS } from '../../constants';

interface RatingScaleProps {
    ratingIndex: number;
    onChange: (index: number) => void;
}

export default function RatingScale({ ratingIndex, onChange }: RatingScaleProps) {
    const rating = RATINGS[ratingIndex];
    return (
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
                        onChange={(e) => onChange(Number(e.target.value))}
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
    );
}
