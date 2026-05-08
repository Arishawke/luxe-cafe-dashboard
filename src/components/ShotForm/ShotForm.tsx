import type { FormEvent } from 'react';
import type { BrewType, ShotLog, BeanProfile } from '../../types';
import type { useShotForm } from '../../hooks/useShotForm';
import type { useTimer } from '../../hooks/useTimer';
import type { useBeanAutocomplete } from '../../hooks/useBeanAutocomplete';
import { BREW_TYPES } from '../../constants';
import Icons from '../Icons';
import BeanInput from './BeanInput';
import BrewControls from './BrewControls';
import MilkControls from './MilkControls';
import TimerInput from './TimerInput';
import RatingScale from './RatingScale';

interface ShotFormProps {
    form: ReturnType<typeof useShotForm>;
    timer: ReturnType<typeof useTimer>;
    isColdBrew: boolean;
    onSubmit: (e: FormEvent) => void;
    onIncrementGrind: () => void;
    onDecrementGrind: () => void;
    beans: BeanProfile[];
    hasAnyBeans: boolean;
    autocomplete: ReturnType<typeof useBeanAutocomplete>;
    favoriteShot: ShotLog | null;
    editingShot: ShotLog | null;
    onCancelEdit: () => void;
    onOpenRecipeModal: () => void;
}

export default function ShotForm({
    form,
    timer,
    isColdBrew,
    onSubmit,
    onIncrementGrind,
    onDecrementGrind,
    beans,
    hasAnyBeans,
    autocomplete,
    favoriteShot,
    editingShot,
    onCancelEdit,
    onOpenRecipeModal,
}: ShotFormProps) {
    return (
        <form className="shot-form" onSubmit={onSubmit}>
            <div className="form-group">
                <label className="form-label">Brew Type</label>
                <div className="select-wrap">
                    <select
                        className="form-select"
                        value={form.brewType}
                        onChange={(e) => form.setBrewType(e.target.value as BrewType)}
                    >
                        {BREW_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <Icons.ChevronDown />
                </div>
            </div>

            <BeanInput
                beanName={form.beanName}
                setBeanName={form.setBeanName}
                autocomplete={autocomplete}
                hasAnyBeans={hasAnyBeans}
                beans={beans}
                favoriteShot={favoriteShot}
            />

            <BrewControls
                basket={form.basket}
                setBasket={form.setBasket}
                grindSize={form.grindSize}
                setGrindSize={form.setGrindSize}
                temperature={form.temperature}
                setTemperature={form.setTemperature}
                strength={form.strength}
                setStrength={form.setStrength}
                isColdBrew={isColdBrew}
                onIncrementGrind={onIncrementGrind}
                onDecrementGrind={onDecrementGrind}
            />

            <RatingScale
                ratingIndex={form.ratingIndex}
                onChange={form.setRatingIndex}
            />

            <MilkControls
                showMilk={form.showMilk}
                setShowMilk={form.setShowMilk}
                milkType={form.milkType}
                setMilkType={form.setMilkType}
                milkStyle={form.milkStyle}
                setMilkStyle={form.setMilkStyle}
                isColdBrew={isColdBrew}
            />

            <TimerInput
                showTimer={form.showTimer}
                setShowTimer={form.setShowTimer}
                showDose={form.showDose}
                setShowDose={form.setShowDose}
                manualTimeInput={form.manualTimeInput}
                setManualTimeInput={form.setManualTimeInput}
                manualTimerValue={form.manualTimerValue}
                setManualTimerValue={form.setManualTimerValue}
                doseIn={form.doseIn}
                setDoseIn={form.setDoseIn}
                doseOut={form.doseOut}
                setDoseOut={form.setDoseOut}
                timer={timer}
            />

            <div className="form-group">
                <label className="form-label">Add-ins / Notes</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Vanilla syrup, Cinnamon, Extra hot"
                    value={form.notes}
                    onChange={(e) => form.setNotes(e.target.value)}
                />
            </div>

            <div className="form-actions">
                <button type="submit" className={editingShot ? 'btn-submit btn-submit--edit' : 'btn-submit'}>
                    {editingShot ? 'Update Shot' : 'Log Shot'}
                </button>
                {editingShot ? (
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={onCancelEdit}
                    >
                        Cancel Edit
                    </button>
                ) : (
                    <button
                        type="button"
                        className="btn-save-recipe"
                        onClick={onOpenRecipeModal}
                        disabled={!form.beanName.trim()}
                    >
                        <Icons.Save /> Save as Recipe
                    </button>
                )}
            </div>
        </form>
    );
}
