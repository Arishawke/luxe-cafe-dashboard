import type { useTimer } from '../../hooks/useTimer';
import Icons from '../Icons';

interface TimerInputProps {
    showTimer: boolean;
    setShowTimer: (v: boolean) => void;
    showDose: boolean;
    setShowDose: (v: boolean) => void;
    manualTimeInput: boolean;
    setManualTimeInput: (v: boolean) => void;
    manualTimerValue: string;
    setManualTimerValue: (v: string) => void;
    doseIn: string;
    setDoseIn: (v: string) => void;
    doseOut: string;
    setDoseOut: (v: string) => void;
    timer: ReturnType<typeof useTimer>;
}

export default function TimerInput({
    showTimer,
    setShowTimer,
    showDose,
    setShowDose,
    manualTimeInput,
    setManualTimeInput,
    manualTimerValue,
    setManualTimerValue,
    doseIn,
    setDoseIn,
    doseOut,
    setDoseOut,
    timer,
}: TimerInputProps) {
    const { timerRunning, timerSeconds, startTimer, stopTimer, resetTimer } = timer;
    return (
        <div className="advanced-tools">
            <div className="advanced-group">
                <button
                    type="button"
                    className={`advanced-toggle ${showTimer ? 'advanced-toggle--active' : ''}`}
                    onClick={() => setShowTimer(!showTimer)}
                    aria-expanded={showTimer}
                >
                    <Icons.Zap />
                    <span>Shot Timer</span>
                    <span className="advanced-toggle__badge">{showTimer ? 'On' : 'Off'}</span>
                    {showTimer ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                </button>
                <div className={`collapsible ${showTimer ? 'collapsible--open' : ''}`}>
                    <div className="collapsible__inner" inert={!showTimer ? true : undefined}>
                        <div className="shot-timer">
                            <div className="shot-timer__mode-toggle" role="group" aria-label="Timer mode">
                                <button
                                    type="button"
                                    className={`shot-timer__mode-btn ${!manualTimeInput ? 'shot-timer__mode-btn--active' : ''}`}
                                    onClick={() => setManualTimeInput(false)}
                                    aria-pressed={!manualTimeInput}
                                >
                                    Stopwatch
                                </button>
                                <button
                                    type="button"
                                    className={`shot-timer__mode-btn ${manualTimeInput ? 'shot-timer__mode-btn--active' : ''}`}
                                    onClick={() => setManualTimeInput(true)}
                                    aria-pressed={manualTimeInput}
                                >
                                    Manual
                                </button>
                            </div>
                            {manualTimeInput ? (
                                <div className="shot-timer__manual">
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.1"
                                        min="0"
                                        max="120"
                                        placeholder="0.0"
                                        value={manualTimerValue}
                                        onChange={(e) => setManualTimerValue(e.target.value)}
                                        className="shot-timer__input"
                                        aria-label="Extraction time in seconds"
                                    />
                                    <span className="shot-timer__unit">seconds</span>
                                </div>
                            ) : (
                                <>
                                    <div className="shot-timer__display">
                                        <span className="shot-timer__time">{timerSeconds.toFixed(1)}s</span>
                                    </div>
                                    <div className="shot-timer__controls">
                                        {timerRunning ? (
                                            <button type="button" className="shot-timer__btn shot-timer__btn--stop" onClick={stopTimer} title="Stop" aria-label="Stop timer">
                                                <span aria-hidden="true">⏸</span>
                                            </button>
                                        ) : (
                                            <button type="button" className="shot-timer__btn shot-timer__btn--start" onClick={startTimer} title="Start" aria-label="Start timer">
                                                <span aria-hidden="true">▶</span>
                                            </button>
                                        )}
                                        <button type="button" className="shot-timer__btn shot-timer__btn--reset" onClick={resetTimer} title="Reset" disabled={timerSeconds === 0} aria-label="Reset timer">
                                            <span aria-hidden="true">↺</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="advanced-group">
                <button
                    type="button"
                    className={`advanced-toggle ${showDose ? 'advanced-toggle--active' : ''}`}
                    onClick={() => setShowDose(!showDose)}
                    aria-expanded={showDose}
                >
                    <Icons.Scale />
                    <span>Dose & Yield</span>
                    <span className="advanced-toggle__badge">{showDose ? 'On' : 'Off'}</span>
                    {showDose ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                </button>
                <div className={`collapsible ${showDose ? 'collapsible--open' : ''}`}>
                    <div className="collapsible__inner" inert={!showDose ? true : undefined}>
                        <div className="dose-yield">
                            <div className="dose-yield__inputs">
                                <div className="dose-yield__field">
                                    <label htmlFor="shot-dose-in">In (g)</label>
                                    <input
                                        id="shot-dose-in"
                                        type="number"
                                        inputMode="decimal"
                                        step="0.1"
                                        min="0"
                                        placeholder="18.0"
                                        value={doseIn}
                                        onChange={(e) => setDoseIn(e.target.value)}
                                    />
                                </div>
                                <span className="dose-yield__arrow" aria-hidden="true">→</span>
                                <div className="dose-yield__field">
                                    <label htmlFor="shot-dose-out">Out (g)</label>
                                    <input
                                        id="shot-dose-out"
                                        type="number"
                                        inputMode="decimal"
                                        step="0.1"
                                        min="0"
                                        placeholder="36.0"
                                        value={doseOut}
                                        onChange={(e) => setDoseOut(e.target.value)}
                                    />
                                </div>
                            </div>
                            {doseIn && doseOut && parseFloat(doseIn) > 0 && (
                                <div className="dose-yield__ratio">
                                    <span className="dose-yield__ratio-label">Ratio</span>
                                    <span className="dose-yield__ratio-value">
                                        1:{(parseFloat(doseOut) / parseFloat(doseIn)).toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
