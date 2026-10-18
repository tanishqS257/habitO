
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

function MiniBottle({ percentage }) {
    const waterLevel = Math.min(percentage, 100);

    return (
        <div className="hb-bottle-wrap" aria-label={`Bottle ${waterLevel}% full`}>
            <div className="hb-bottle-glow" />

            <svg
                className="hb-bottle-svg"
                viewBox="0 0 180 310"
                role="img"
                aria-label="Water bottle with animated water level"
            >
                <defs>
                    <linearGradient id="hb-glass" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#48a9ff" stopOpacity=".5" />
                        <stop offset="18%" stopColor="#ffffff" stopOpacity=".78" />
                        <stop offset="50%" stopColor="#c9f5ff" stopOpacity=".28" />
                        <stop offset="82%" stopColor="#ffffff" stopOpacity=".65" />
                        <stop offset="100%" stopColor="#1684ef" stopOpacity=".55" />
                    </linearGradient>

                    <linearGradient id="hb-water" x1="0" y1="0" x2="0.8" y2="1">
                        <stop offset="0%" stopColor="#58f1ff" />
                        <stop offset="45%" stopColor="#16bafa" />
                        <stop offset="100%" stopColor="#0870f5" />
                    </linearGradient>

                    <linearGradient id="hb-cap" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#39c9ff" />
                        <stop offset="45%" stopColor="#0879ef" />
                        <stop offset="100%" stopColor="#0644ba" />
                    </linearGradient>

                    <clipPath id="hb-bottle-clip">
                        <path d="M65 48 L115 48 L115 68 Q143 78 143 104 L143 253 Q143 280 118 280 L62 280 Q37 280 37 253 L37 104 Q37 78 65 68 Z" />
                    </clipPath>

                    <filter id="hb-water-shadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="3" />
                    </filter>
                </defs>

                {/* Bottle cap */}
                <path
                    d="M62 18 Q62 10 70 10 L110 10 Q118 10 118 18 L118 34 L62 34 Z"
                    fill="url(#hb-cap)"
                    stroke="#0754bd"
                    strokeWidth="2"
                />
                <path
                    d="M57 30 Q57 25 64 25 L116 25 Q123 25 123 32 L123 46 Q123 54 115 54 L65 54 Q57 54 57 46 Z"
                    fill="url(#hb-cap)"
                    stroke="#0b58bc"
                    strokeWidth="2"
                />
                <path d="M67 33 L113 33" stroke="#8deaff" strokeWidth="2" opacity=".8" />

                {/* Bottle body */}
                <path
                    d="M65 48 L115 48 L115 68 Q143 78 143 104 L143 253 Q143 280 118 280 L62 280 Q37 280 37 253 L37 104 Q37 78 65 68 Z"
                    fill="url(#hb-glass)"
                    stroke="#1478dc"
                    strokeWidth="3"
                />

                {/* Animated water */}
                <g clipPath="url(#hb-bottle-clip)">
                    <rect
                        className="hb-water-fill"
                        x="35"
                        y={280 - 210 * (waterLevel / 100)}
                        width="110"
                        height={210 * (waterLevel / 100) + 8}
                        fill="url(#hb-water)"
                    />
                    <path
                        className="hb-water-wave hb-water-wave-one"
                        d={`M35 ${280 - 210 * (waterLevel / 100)} Q55 ${
                            270 - 210 * (waterLevel / 100)
                        } 75 ${280 - 210 * (waterLevel / 100)} T115 ${
                            280 - 210 * (waterLevel / 100)
                        } T155 ${280 - 210 * (waterLevel / 100)} L155 290 L35 290 Z`}
                        fill="#b8fbff"
                        opacity=".8"
                    />
                    <path
                        className="hb-water-wave hb-water-wave-two"
                        d={`M30 ${284 - 210 * (waterLevel / 100)} Q55 ${
                            270 - 210 * (waterLevel / 100)
                        } 80 ${284 - 210 * (waterLevel / 100)} T130 ${
                            284 - 210 * (waterLevel / 100)
                        } T180 ${284 - 210 * (waterLevel / 100)} L180 290 L30 290 Z`}
                        fill="#37dfff"
                        opacity=".65"
                    />

                    <circle cx="65" cy="210" r="2.5" fill="#e4ffff" opacity=".8" />
                    <circle cx="105" cy="185" r="3" fill="#e4ffff" opacity=".8" />
                    <circle cx="83" cy="242" r="2" fill="#e4ffff" opacity=".8" />
                </g>

                {/* Glass shine */}
                <path
                    d="M49 104 Q49 88 65 81"
                    stroke="#ffffff"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    opacity=".95"
                />
                <path
                    d="M48 121 L48 239"
                    stroke="#ffffff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity=".65"
                />
                <path
                    d="M132 112 L132 245"
                    stroke="#83d8ff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity=".65"
                />

                {/* Measurement marks */}
                {[115, 150, 185, 220, 255].map((y, i) => (
                    <g key={y} opacity=".85">
                        <path
                            d={`M120 ${y} h${i % 2 === 0 ? 11 : 6}`}
                            stroke="#ffffff"
                            strokeWidth="1.5"
                        />
                    </g>
                ))}

                <path
                    d="M43 270 Q90 290 137 270"
                    stroke="#d8fbff"
                    strokeWidth="2"
                    fill="none"
                    opacity=".9"
                />
            </svg>

            <div className="hb-bottle-base">
                <span />
            </div>

            <div className="hb-bottle-percent">
                <Droplets size={13} />
                {Math.round(waterLevel)}%
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
            <div className="hb-card">
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
                        {isPouring && (
                            <div key={pourKey} className="hb-pour-sparkle" aria-hidden="true">
                                <span />
                                <span />
                                <span />
                            </div>
                        )}
                        <div className="hb-visual-caption">YOUR BOTTLE</div>
                        <MiniBottle percentage={percentage} />
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
