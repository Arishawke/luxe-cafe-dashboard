import { useState, useEffect, useRef } from 'react';

export function useTimer() {
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Timer interval logic
    useEffect(() => {
        if (timerRunning) {
            timerRef.current = setInterval(() => {
                setTimerSeconds(prev => prev + 0.1);
            }, 100);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [timerRunning]);

    const startTimer = () => setTimerRunning(true);
    const stopTimer = () => setTimerRunning(false);
    const resetTimer = () => {
        setTimerRunning(false);
        setTimerSeconds(0);
    };

    return {
        timerRunning,
        timerSeconds,
        startTimer,
        stopTimer,
        resetTimer,
    };
}
