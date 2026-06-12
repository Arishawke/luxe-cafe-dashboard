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
    if (isColdBrew) return null;
    return (
        <div className="advanced-tools">
            <div className="advanced-group">
            <button
                type="button"
                className={`advanced-toggle ${showMilk ? 'advanced-toggle--active' : ''}`}
                onClick={() => setShowMilk(!showMilk)}
                aria-expanded={showMilk}
            >
                <Icons.Milk />
                <span>Froth Lab</span>
                <span className="advanced-toggle__badge">{showMilk ? 'On' : 'Off'}</span>
                {showMilk ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
            </button>

            <div className={`collapsible ${showMilk ? 'collapsible--open' : ''}`}>
            <div className="collapsible__inner" inert={!showMilk ? true : undefined}>
                <div className="froth-panel">
                    <div className="froth-panel__row">
                        <span className="form-label" id="shot-milk-type-label">Milk Type</span>
                        <div className="pill-group pill-group--wrap" role="group" aria-labelledby="shot-milk-type-label">
                            {MILK_TYPES.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    className={`pill-btn pill-btn--sm ${milkType === type ? 'pill-btn--active' : ''}`}
                                    onClick={() => setMilkType(type)}
                                    aria-pressed={milkType === type}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="froth-panel__row">
                        <span className="form-label" id="shot-milk-style-label">Style</span>
                        <div className="pill-group pill-group--wrap" role="group" aria-labelledby="shot-milk-style-label">
                            {MILK_STYLES.map((style) => (
                                <button
                                    key={style}
                                    type="button"
                                    className={`pill-btn pill-btn--sm ${milkStyle === style ? 'pill-btn--active' : ''}`}
                                    onClick={() => setMilkStyle(style)}
                                    aria-pressed={milkStyle === style}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            </div>
            </div>
        </div>
    );
}
