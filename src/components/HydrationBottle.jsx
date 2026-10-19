
import { useEffect, useState } from "react";
import {
    Droplets,
    GlassWater,
    RotateCcw,
    Pencil,
    Check,
    Minus,
    Plus,
    Target,
    Sparkles,
    Waves,
} from "lucide-react";
import "./HydrationBottle.css";

const QUICK_AMOUNTS = [100, 250, 500];

function formatLitres(ml) {
    return `${(ml / 1000).toFixed(2)} L`;
}


function CircularTank({ percentage }) {
    const level = Math.min(100, Math.max(0, percentage));
    const waterTop = 202 - 132 * (level / 100);

    return (
        <div
            className="hb-tank-wrap"
            aria-label={`Circular water tank ${level}% full`}
        >
            <div className="hb-tank-aura" />

            <svg
                className="hb-tank-svg"
                viewBox="0 0 180 220"
                role="img"
                aria-label={`Water level ${level}%`}
            >
                <defs>
                    <linearGradient id="hb-tank-glass" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity=".22" />
                        <stop offset="50%" stopColor="#cbd5e1" stopOpacity=".035" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity=".16" />
                    </linearGradient>

                    <linearGradient id="hb-tank-water" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a5f3fc" />
                        <stop offset="35%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#0369a1" />
                    </linearGradient>

                    <clipPath id="hb-tank-clip">
                        <circle cx="90" cy="135" r="66" />
                    </clipPath>
                </defs>

                {/* Circular glass tank */}
                <circle
                    cx="90"
                    cy="135"
                    r="72"
                    fill="#0b1720"
                    stroke="#8ca6b8"
                    strokeOpacity=".65"
                    strokeWidth="2"
                />

                <circle
                    cx="90"
                    cy="135"
                    r="67"
                    fill="url(#hb-tank-glass)"
                    stroke="#e0f2fe"
                    strokeOpacity=".65"
                    strokeWidth="1.5"
                />

                {/* Animated water inside the circular tank */}
                <g clipPath="url(#hb-tank-clip)">
                    <rect
                        x="23"
                        y={waterTop}
                        width="134"
                        height={204 - waterTop}
                        fill="url(#hb-tank-water)"
                        className="hb-tank-fill"
                    />

                    <path
                        d={`M20 ${waterTop} Q40 ${waterTop - 8} 60 ${waterTop} T100 ${waterTop} T140 ${waterTop} T180 ${waterTop} V210 H20 Z`}
                        className="hb-tank-wave hb-tank-wave-a"
                        fill="#cffafe"
                        opacity=".8"
                    />

                    <path
                        d={`M20 ${waterTop + 4} Q40 ${waterTop - 1} 60 ${waterTop + 4} T100 ${waterTop + 4} T140 ${waterTop + 4} T180 ${waterTop + 4} V210 H20 Z`}
                        className="hb-tank-wave hb-tank-wave-b"
                        fill="#22d3ee"
                        opacity=".5"
                    />

                    <circle className="hb-tank-bubble hb-tank-bubble-a" cx="62" cy="175" r="3" />
                    <circle className="hb-tank-bubble hb-tank-bubble-b" cx="111" cy="165" r="2.5" />
                    <circle className="hb-tank-bubble hb-tank-bubble-c" cx="88" cy="190" r="2" />
                </g>

                {/* Glass reflections */}
                <path
                    d="M43 105 A55 55 0 0 1 67 83"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity=".7"
                />

                <circle
                    cx="90"
                    cy="135"
                    r="72"
                    fill="none"
                    stroke="#d1fae5"
                    strokeOpacity=".6"
                    strokeWidth="1.5"
                />
            </svg>

            <div className="hb-tank-base" />

            <div className="hb-tank-level-pill">
                <Droplets size={13} />
                <strong>{level}%</strong>
                <span>filled</span>
            </div>
        </div>
    );
}


export default function HydrationBottle({
                                            intakeMl = 0,
                                            capacityMl = 3000,
                                            onAdd,
                                            onUndo,
                                            onCapacityChange,
                                        }) {
    const [customAmount, setCustomAmount] = useState("100");
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [isPouring, setIsPouring] = useState(false);
    const [pourKey, setPourKey] = useState(0);
    const [localIntake, setLocalIntake] = useState(intakeMl);
    const [localCapacity, setLocalCapacity] = useState(capacityMl);

    // Supports both controlled props and standalone preview use.
    const currentIntake = typeof onAdd === "function" ? intakeMl : localIntake;
    const currentCapacity =
        typeof onCapacityChange === "function" ? capacityMl : localCapacity;

    const safeCapacity = Math.max(1, currentCapacity || 3000);
    const percentage = Math.min(
        100,
        Math.round((Math.max(0, currentIntake) / safeCapacity) * 100)
    );
    const remaining = Math.max(0, safeCapacity - currentIntake);

    useEffect(() => {
        if (!isPouring) return undefined;
        const timer = setTimeout(() => setIsPouring(false), 850);
        return () => clearTimeout(timer);
    }, [isPouring, pourKey]);

    function addWater(amount) {
        const value = Math.round(Number(amount));
        if (!Number.isFinite(value) || value <= 0) return;

        if (typeof onAdd === "function") {
            onAdd(value);
        } else {
            setLocalIntake((prev) => prev + value);
        }

        setIsPouring(true);
        setPourKey((prev) => prev + 1);
    }

    function undoWater() {
        if (typeof onUndo === "function") {
            onUndo();
        } else {
            setLocalIntake((prev) => Math.max(0, prev - 100));
        }
    }

    function updateCapacity(value) {
        const nextCapacity = Number(value);
        if (typeof onCapacityChange === "function") {
            onCapacityChange(nextCapacity);
        } else {
            setLocalCapacity(nextCapacity);
        }
        setIsEditingGoal(false);
    }

    function submitCustomAmount(event) {
        event.preventDefault();
        addWater(customAmount);
    }

    const message =
        percentage >= 100
            ? "Goal completed! Amazing work."
            : percentage >= 70
                ? "You're in the home stretch!"
                : percentage >= 40
                    ? "You're building a great habit."
                    : "Every sip is a fresh start.";

    return (
        <section className="hb-section">
            <div className={`hb-card ${isPouring ? "hb-card-pouring" : ""}`}>
                <span className="hb-sr-only" aria-live="polite">
                    {isPouring ? "Pouring water into your bottle" : "Hydration tracker ready"}
                </span>
                {/* Header */}
                <header className="hb-header">
                    <div className="hb-brand-icon">
                        <Droplets size={22} strokeWidth={2.3} />
                    </div>
                    <div className="hb-heading">
                        <span className="hb-eyebrow">DAILY WELLNESS</span>
                        <h2>Hydration</h2>
                        <p>A little water goes a long way.</p>
                    </div>
                    <div className="hb-live-pill">
                        <span className="hb-live-dot" />
                        Today
                    </div>
                </header>

                {/* Main bottle and progress */}
                <div className="hb-main">
                    <div className="hb-progress-panel">
                        <div className="hb-progress-label">
                            <span>YOUR DAILY INTAKE</span>
                            <Sparkles size={15} />
                        </div>

                        <div className="hb-big-number">
                            <strong>{formatLitres(currentIntake)}</strong>
                        </div>
                        <div className="hb-goal-caption">
                            of {formatLitres(safeCapacity)} daily goal
                        </div>

                        <div
                            className="hb-progress-track"
                            role="progressbar"
                            aria-label="Daily hydration progress"
                            aria-valuenow={percentage}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        >
                            <div
                                className="hb-progress-value"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>

                        <div className="hb-progress-bottom">
                            <span>{percentage}% complete</span>
                            <span>{formatLitres(remaining)} to go</span>
                        </div>

                        <div className="hb-motivation">
                            <div className="hb-motivation-icon">
                                <Waves size={20} />
                            </div>
                            <div>
                                <strong>{message}</strong>
                                <p>
                                    {remaining > 0
                                        ? "Keep sipping. You've got this!"
                                        : "You reached your hydration goal today."}
                                </p>
                            </div>
                        </div>
                    </div>


                    <div className={`hb-visual-panel ${isPouring ? "is-pouring" : ""}`}>
                        <div className="hb-visual-caption">YOUR WATER TANK</div>

                        {isPouring && (
                            <div
                                key={pourKey}
                                className="hb-pour-scene"
                                aria-hidden="true"
                            >
                                <div className="hb-pour-glass">
                                    <div className="hb-pour-glass-rim" />
                                    <div className="hb-pour-glass-water" />
                                    <div className="hb-pour-glass-shine" />
                                </div>

                                <span className="hb-pour-stream" />
                                <span className="hb-pour-drop hb-pour-drop-a" />
                                <span className="hb-pour-drop hb-pour-drop-b" />
                            </div>
                        )}
                        <CircularTank percentage={percentage} />

                        {isPouring && (
                            <span
                                key={`splash-${pourKey}`}
                                className="hb-tank-splash"
                                aria-hidden="true"
                            />
                        )}

                        <div className="hb-visual-amount">
                            <Droplets size={15} />
                            <span>{formatLitres(currentIntake)}</span>
                        </div>

                        <div className="hb-visual-subtitle">
                            {formatLitres(safeCapacity)} capacity
                        </div>
                    </div>

                </div>

                {/* Stats */}
                <div className="hb-stats">
                    <div className="hb-stat">
                        <div className="hb-stat-icon">
                            <GlassWater size={19} />
                        </div>
                        <div>
                            <span>DRANK TODAY</span>
                            <strong>{formatLitres(currentIntake)}</strong>
                        </div>
                    </div>

                    <div className="hb-stat">
                        <div className="hb-stat-icon">
                            <Target size={19} />
                        </div>
                        <div>
                            <span>GOAL LEFT</span>
                            <strong>{formatLitres(remaining)}</strong>
                        </div>
                    </div>

                    <button
                        className="hb-stat hb-capacity-stat"
                        type="button"
                        onClick={() => setIsEditingGoal((prev) => !prev)}
                        aria-expanded={isEditingGoal}
                    >
                        <div className="hb-stat-icon">
                            <Droplets size={19} />
                        </div>
                        <div>
                            <span>BOTTLE CAPACITY</span>
                            <strong>{formatLitres(safeCapacity)}</strong>
                        </div>
                        <Pencil className="hb-edit-icon" size={14} />
                    </button>
                </div>

                {/* Capacity controls */}
                {isEditingGoal && (
                    <div className="hb-capacity-editor">
                        <div className="hb-section-label">Choose your daily goal</div>
                        <div className="hb-capacity-options">
                            {[2000, 2500, 3000, 3500, 4000].map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    className={`hb-capacity-option ${
                                        safeCapacity === amount ? "active" : ""
                                    }`}
                                    onClick={() => updateCapacity(amount)}
                                >
                                    {formatLitres(amount)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add water */}
                <div className="hb-add-section">
                    <div className="hb-add-heading">
                        <div className="hb-add-icon">
                            <Plus size={20} />
                        </div>
                        <div>
                            <h3>Add water</h3>
                            <p>Choose a quick amount</p>
                        </div>
                    </div>

                    <div className="hb-quick-actions">
                        {QUICK_AMOUNTS.map((amount) => (
                            <button
                                key={amount}
                                type="button"
                                className="hb-quick-button"
                                onClick={() => addWater(amount)}
                            >
                <span className="hb-quick-icon">
                  <GlassWater size={20} />
                </span>
                                <span className="hb-quick-amount">
                  <Plus size={14} />
                                    {amount}
                                    <small>ml</small>
                </span>
                            </button>
                        ))}
                    </div>

                    <form className="hb-custom-form" onSubmit={submitCustomAmount}>
                        <label htmlFor="hb-custom-amount">Custom amount</label>
                        <div className="hb-custom-input-row">
                            <input
                                id="hb-custom-amount"
                                type="number"
                                min="1"
                                max="5000"
                                step="1"
                                value={customAmount}
                                onChange={(event) => setCustomAmount(event.target.value)}
                                inputMode="numeric"
                                required
                            />
                            <span>ml</span>
                        </div>
                        <button className="hb-add-button" type="submit">
                            <Droplets size={18} />
                            Add water
                        </button>
                    </form>
                </div>

                {/* Undo */}
                <button className="hb-undo-button" type="button" onClick={undoWater}>
          <span className="hb-undo-icon">
            <RotateCcw size={17} />
          </span>
                    <span>Undo last addition</span>
                    <span className="hb-undo-hint">Made a mistake?</span>
                </button>
            </div>

            <footer className="hb-footer">
                <Droplets size={15} />
                <span>Small sips. Big changes. Stay hydrated.</span>
            </footer>
        </section>
    );
}
