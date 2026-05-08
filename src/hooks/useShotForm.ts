import { useState } from 'react';
import type { Basket, Temperature, Strength, BrewType, MilkType, MilkStyle, ShotLog, SavedRecipe } from '../types';
import { BALANCED_RATING_INDEX } from '../constants';

export function useShotForm() {
    const [beanName, setBeanName] = useState('');
    const [brewType, setBrewType] = useState<BrewType>('Espresso');
    const [basket, setBasket] = useState<Basket>('Double');
    const [grindSize, setGrindSize] = useState(12);
    const [temperature, setTemperature] = useState<Temperature>('Med');
    const [strength, setStrength] = useState<Strength>(2);
    const [ratingIndex, setRatingIndex] = useState(BALANCED_RATING_INDEX);
    const [notes, setNotes] = useState('');

    const [showMilk, setShowMilk] = useState(false);
    const [milkType, setMilkType] = useState<MilkType>('Dairy');
    const [milkStyle, setMilkStyle] = useState<MilkStyle>('Steamed');

    const [showTimer, setShowTimer] = useState(false);
    const [showDose, setShowDose] = useState(false);
    const [manualTimeInput, setManualTimeInput] = useState(false);
    const [manualTimerValue, setManualTimerValue] = useState<string>('');
    const [doseIn, setDoseIn] = useState<string>('');
    const [doseOut, setDoseOut] = useState<string>('');

    const reset = () => {
        setBeanName('');
        setNotes('');
        setManualTimerValue('');
        setDoseIn('');
        setDoseOut('');
    };

    const applyFromShot = (shot: ShotLog) => {
        setBeanName(shot.beanName);
        setBrewType(shot.brewType);
        setBasket(shot.basket);
        setGrindSize(shot.grindSize);
        if (shot.temperature) setTemperature(shot.temperature);
        setStrength(shot.strength);
        if (shot.milk) {
            setShowMilk(true);
            setMilkType(shot.milk.type);
            setMilkStyle(shot.milk.style);
        } else {
            setShowMilk(false);
        }
        setNotes(shot.notes ?? '');
    };

    const applyFromRecipe = (r: SavedRecipe) => {
        setBeanName(r.beanName);
        setBrewType(r.brewType);
        setBasket(r.basket);
        setGrindSize(r.grindSize);
        if (r.temperature) setTemperature(r.temperature);
        setStrength(r.strength);
        if (r.milk) {
            setShowMilk(true);
            setMilkType(r.milk.type);
            setMilkStyle(r.milk.style);
        } else {
            setShowMilk(false);
        }
        setNotes(r.notes ?? '');
    };

    return {
        beanName, setBeanName,
        brewType, setBrewType,
        basket, setBasket,
        grindSize, setGrindSize,
        temperature, setTemperature,
        strength, setStrength,
        ratingIndex, setRatingIndex,
        notes, setNotes,
        showMilk, setShowMilk,
        milkType, setMilkType,
        milkStyle, setMilkStyle,
        showTimer, setShowTimer,
        showDose, setShowDose,
        manualTimeInput, setManualTimeInput,
        manualTimerValue, setManualTimerValue,
        doseIn, setDoseIn,
        doseOut, setDoseOut,
        reset,
        applyFromShot,
        applyFromRecipe,
    };
}
