import type { MilkType, MilkStyle } from '../../types';
import { MILK_TYPES, MILK_STYLES } from '../../constants';
import Icons from '../Icons';

interface MilkControlsProps {
    showMilk: boolean;
    setShowMilk: (v: boolean) => void;
    milkType: MilkType;
    setMilkType: (t: MilkType) => void;
    milkStyle: MilkStyle;
    setMilkStyle: (s: MilkStyle) => void;
    isColdBrew: boolean;
}

export default function MilkControls({
    showMilk,
    setShowMilk,
    milkType,
    setMilkType,
    milkStyle,
    setMilkStyle,
    isColdBrew,
}: MilkControlsProps) {
    // hide milk for cold brews
    if (isColdBrew) return null;
    return (
        <div className="advanced-tools">
            <button
                type="button"
                className={`advanced-toggle ${showMilk ? 'advanced-toggle--active' : ''}`}
                onClick={() => setShowMilk(!showMilk)}
            >
                <Icons.Milk />
                <span>Froth Lab</span>
                <span className="advanced-toggle__badge">{showMilk ? 'On' : 'Off'}</span>
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
    );
}
