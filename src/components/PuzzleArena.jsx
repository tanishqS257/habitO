
import { useEffect, useMemo, useState } from "react";

const BASE =
    "https://raw.githubusercontent.com/atmamoon/ultimate-aptitude/main/banks/";

const BANKS = [
    { name: "Numerical Aptitude", file: "questions-numerical.json" },
    { name: "Logic", file: "questions-logic.json" },
    { name: "Advanced Problem Solving", file: "questions-quant-advanced.json" },
    { name: "Data Sufficiency", file: "questions-data-sufficiency.json" },
    { name: "Data Interpretation & Logic", file: "questions-dilr.json" },
    { name: "Verbal Reasoning", file: "questions-verbal.json" },
    { name: "Data Insights", file: "questions-data-insights.json" },
];

const PROGRESS_KEY = "daybyday-puzzle-progress-v1";
const MOCK_HISTORY_KEY = "daybyday-mock-test-history-v1";

const CATEGORIES = [
    "All",
    "Numerical",
    "Logic",
    "Advanced Problem Solving",
    "Data Sufficiency",
    "Data Interpretation & Logic",
    "Verbal Reasoning",
    "Data Insights",
];

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard", "Very Hard"];

function readProgress() {
    try {
        return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {
            completed: [],
            attempts: 0,
            correct: 0,
        };
    } catch {
        return { completed: [], attempts: 0, correct: 0 };
    }
}

function readMockHistory() {
    try {
        const saved = JSON.parse(localStorage.getItem(MOCK_HISTORY_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function formatDuration(totalSeconds) {
    const seconds = Math.max(0, Number(totalSeconds) || 0);
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes}m ${String(remainder).padStart(2, "0")}s`;
}

function shuffle(items) {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

function normalizeDifficulty(value) {
    const difficulty = String(value || "").toLowerCase();

    if (difficulty === "very-hard" || difficulty === "very hard") {
        return "Very Hard";
    }

    if (difficulty === "hard") return "Hard";
    if (difficulty === "medium") return "Medium";
    if (difficulty === "easy") return "Easy";

    return "Unspecified";
}

function normalizeCategory(question, bankName) {
    const value = String(question.category || bankName).toLowerCase();

    if (value.includes("numer")) return "Numerical";
    if (value.includes("logic") || value.includes("dilr")) {
        return value.includes("dilr")
            ? "Data Interpretation & Logic"
            : "Logic";
    }
    if (value.includes("sufficiency")) return "Data Sufficiency";
    if (value.includes("insights")) return "Data Insights";
    if (value.includes("verbal")) return "Verbal Reasoning";
    if (value.includes("problem")) return "Advanced Problem Solving";
    if (value.includes("quant")) return "Numerical";

    return bankName;
}

export default function PuzzleArena() {
    const [arenaMode, setArenaMode] = useState("practice");

    const [mockQuestions, setMockQuestions] = useState([]);
    const [mockIndex, setMockIndex] = useState(0);
    const [mockAnswers, setMockAnswers] = useState({});
    const [mockStatus, setMockStatus] = useState("idle");

    const [timeLeft, setTimeLeft] = useState(30 * 60);
    const [deadline, setDeadline] = useState(null);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [mockHistory, setMockHistory] = useState(readMockHistory);
    const [activeMockId, setActiveMockId] = useState(null);
    const [mockStartedAt, setMockStartedAt] = useState(null);

    useEffect(() => {
        if (mockStatus !== "running" || !deadline) return;

        const updateTimer = () => {
            const remaining = Math.max(
                0,
                Math.ceil((deadline - Date.now()) / 1000)
            );

            setTimeLeft(remaining);

            if (remaining === 0) {
                setMockStatus("submitted");
                setDeadline(null);
                setShowSubmitConfirm(false);
            }
        };

        updateTimer();

        const timerId = setInterval(updateTimer, 1000);

        return () => clearInterval(timerId);
    }, [mockStatus, deadline]);


    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [loadedBanks, setLoadedBanks] = useState(0);

    const [category, setCategory] = useState("All");
    const [difficulty, setDifficulty] = useState("All");
    const [topic, setTopic] = useState("All");
    const [index, setIndex] = useState(0);

    const [selected, setSelected] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [progress, setProgress] = useState(readProgress);

    useEffect(() => {
        let cancelled = false;

        async function loadQuestionBanks() {
            setLoading(true);
            setLoadError("");

            const results = await Promise.allSettled(
                BANKS.map(async (bank) => {
                    const response = await fetch(BASE + bank.file);

                    if (!response.ok) {
                        throw new Error(
                            `${bank.file}: HTTP ${response.status}`
                        );
                    }

                    const data = await response.json();

                    if (!Array.isArray(data)) {
                        throw new Error(`${bank.file} is not a JSON array`);
                    }

                    return data.map((question, questionIndex) => ({
                        ...question,
                        id: `${bank.file}-${question.id ?? questionIndex}`,
                        bankName: bank.name,
                        category: normalizeCategory(question, bank.name),
                        difficulty: normalizeDifficulty(question.difficulty),
                        topic: question.topic || "General",
                    }));
                })
            );

            if (cancelled) return;

            const successful = results
                .filter((result) => result.status === "fulfilled")
                .flatMap((result) => result.value);

            const failed = results
                .filter((result) => result.status === "rejected");

            setQuestions(shuffle(successful));
            setLoadedBanks(results.length - failed.length);

            if (successful.length === 0) {
                setLoadError(
                    "The question banks could not be loaded. Check your internet connection or try again."
                );
            } else if (failed.length > 0) {
                setLoadError(
                    `${failed.length} bank(s) could not load. You can still practise the questions that loaded.`
                );
            }

            setLoading(false);
        }

        loadQuestionBanks();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
        } catch {
            // Practice can continue if browser storage is unavailable.
        }
    }, [progress]);

    const filteredQuestions = useMemo(() => {
        return questions.filter((question) => {
            const categoryMatch =
                category === "All" || question.category === category;

            const difficultyMatch =
                difficulty === "All" ||
                question.difficulty.toLowerCase() ===
                difficulty.toLowerCase();

            const topicMatch = topic === "All" || question.topic === topic;

            return categoryMatch && difficultyMatch && topicMatch;
        });
    }, [questions, category, difficulty, topic]);

    const MOCK_QUESTION_COUNT = 20;
    const MOCK_DURATION_SECONDS = 30 * 60;

    function startMockTest() {
        if (filteredQuestions.length < MOCK_QUESTION_COUNT) {
            window.alert(
                `Only ${filteredQuestions.length} questions match your current filters. ` +
                `Choose broader filters so at least ${MOCK_QUESTION_COUNT} questions are available.`
            );
            return;
        }

        setMockQuestions(shuffle(filteredQuestions).slice(0, MOCK_QUESTION_COUNT));
        setActiveMockId(`mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
        setMockStartedAt(Date.now());
        setMockIndex(0);
        setMockAnswers({});
        setTimeLeft(MOCK_DURATION_SECONDS);
        setDeadline(Date.now() + MOCK_DURATION_SECONDS * 1000);
        setShowSubmitConfirm(false);
        setMockStatus("running");
        setArenaMode("mock");
    }

    function submitMockTest() {
        setMockStatus("submitted");
        setDeadline(null);
        setShowSubmitConfirm(false);
    }

    function formatTime(seconds) {
        const safeSeconds = Math.max(0, seconds);
        const minutes = Math.floor(safeSeconds / 60);
        const remainingSeconds = safeSeconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    }

    const mockAnsweredCount = mockQuestions.filter(
        (item) => mockAnswers[item.id] !== undefined
    ).length;

    const mockCorrectCount = mockQuestions.reduce((total, item) => {
        const correctAnswer = Number(item.correct);
        return total + (
            mockAnswers[item.id] !== undefined &&
            Number(mockAnswers[item.id]) === correctAnswer ? 1 : 0
        );
    }, 0);

    const mockIncorrectCount = mockAnsweredCount - mockCorrectCount;
    const mockUnansweredCount = mockQuestions.length - mockAnsweredCount;
    const mockAccuracy = mockQuestions.length
        ? Math.round((mockCorrectCount / mockQuestions.length) * 100)
        : 0;

    useEffect(() => {
        if (mockStatus !== "submitted" || !activeMockId || mockQuestions.length === 0) {
            return;
        }

        // Read the latest saved list and use the attempt ID to prevent duplicate records.
        const savedHistory = readMockHistory();
        if (savedHistory.some((attempt) => attempt.id === activeMockId)) {
            setMockHistory(savedHistory);
            return;
        }

        const answered = mockQuestions.filter(
            (item) => mockAnswers[item.id] !== undefined
        ).length;
        const correct = mockQuestions.reduce((total, item) => {
            return total + (
                mockAnswers[item.id] !== undefined &&
                Number(mockAnswers[item.id]) === Number(item.correct) ? 1 : 0
            );
        }, 0);
        const completedAt = new Date().toISOString();
        const durationSeconds = mockStartedAt
            ? Math.min(MOCK_DURATION_SECONDS, Math.max(0, Math.round((Date.now() - mockStartedAt) / 1000)))
            : MOCK_DURATION_SECONDS;
        const attempt = {
            id: activeMockId,
            completedAt,
            total: mockQuestions.length,
            score: correct,
            percentage: Math.round((correct / mockQuestions.length) * 100),
            correct,
            incorrect: answered - correct,
            unanswered: mockQuestions.length - answered,
            durationSeconds,
        };
        const updatedHistory = [attempt, ...savedHistory].slice(0, 100);

        try {
            localStorage.setItem(MOCK_HISTORY_KEY, JSON.stringify(updatedHistory));
        } catch {
            // The current result remains visible even if browser storage is unavailable.
        }
        setMockHistory(updatedHistory);
    }, [mockStatus, activeMockId, mockQuestions, mockAnswers, mockStartedAt]);

    function clearMockHistory() {
        const confirmed = window.confirm("Clear all saved mock test history from this browser?");
        if (!confirmed) return;

        try {
            localStorage.removeItem(MOCK_HISTORY_KEY);
        } catch {
            // Keep the page usable even if browser storage is unavailable.
        }
        setMockHistory([]);
    }

    const question = filteredQuestions.length
        ? filteredQuestions[index % filteredQuestions.length]
        : null;

    const topics = useMemo(() => {
        const relevant = questions.filter(
            (item) => category === "All" || item.category === category
        );

        return [...new Set(relevant.map((item) => item.topic))]
            .sort((a, b) => a.localeCompare(b));
    }, [questions, category]);

    function resetQuestion() {
        setSelected(null);
        setSubmitted(false);
    }

    function changeCategory(value) {
        setCategory(value);
        setTopic("All");
        setIndex(0);
        resetQuestion();
    }

    function changeDifficulty(value) {
        setDifficulty(value);
        setIndex(0);
        resetQuestion();
    }

    function changeTopic(value) {
        setTopic(value);
        setIndex(0);
        resetQuestion();
    }

    function nextQuestion() {
        if (!filteredQuestions.length) return;

        setIndex((current) => (current + 1) % filteredQuestions.length);
        resetQuestion();
    }

    function submitAnswer() {
        if (selected === null || submitted || !question) return;

        const isCorrect = selected === question.correct;

        setSubmitted(true);

        setProgress((previous) => ({
            ...previous,
            attempts: previous.attempts + 1,
            correct: previous.correct + (isCorrect ? 1 : 0),
            completed: isCorrect
                ? [...new Set([...previous.completed, question.id])]
                : previous.completed,
        }));
    }

    const accuracy = progress.attempts
        ? Math.round((progress.correct / progress.attempts) * 100)
        : 0;

    return (
        <div className="min-h-screen rounded-3xl bg-slate-950 p-5 text-white sm:p-8 lg:p-10">
            <header className="mb-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
                    DAYBYDAY / PLACEMENT PREP
                </p>

                <h1 className="text-3xl font-bold sm:text-5xl">
                    Mind Arena<span className="text-emerald-400">.</span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                    Practise quantitative aptitude, reasoning, verbal ability,
                    and advanced problem-solving with questions loaded from
                    an external open-source question bank.
                </p>
            </header>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <p className="text-sm text-slate-400">Questions available</p>
                    <p className="mt-2 text-3xl font-bold">
                        {loading ? "…" : questions.length.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        {loadedBanks} of {BANKS.length} banks loaded
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <p className="text-sm text-slate-400">Correct answers</p>
                    <p className="mt-2 text-3xl font-bold">{progress.correct}</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <p className="text-sm text-slate-400">Overall accuracy</p>
                    <p className="mt-2 text-3xl font-bold">{accuracy}%</p>
                    <p className="mt-1 text-xs text-slate-500">
                        {progress.attempts} submitted answers
                    </p>
                </div>
            </div>

            {!loading && questions.length > 0 && arenaMode === "practice" && (
                <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/5 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-lg font-bold">Timed Placement Mock Test</p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                            20 random questions · 30 minutes · No negative marking
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Questions are selected from the currently filtered external question bank.
                        </p>
                    </div>
                    <button
                        onClick={startMockTest}
                        disabled={filteredQuestions.length < MOCK_QUESTION_COUNT}
                        className="shrink-0 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Start Mock Test →
                    </button>
                </section>
            )}

            {!loading && arenaMode === "practice" && (
                <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Your progress</p>
                            <h2 className="mt-2 text-xl font-bold">Mock Test History</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Your latest completed tests are saved in this browser.
                            </p>
                        </div>
                        {mockHistory.length > 0 && (
                            <button
                                type="button"
                                onClick={clearMockHistory}
                                className="self-start rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-rose-500/50 hover:text-rose-300 sm:self-auto"
                            >
                                Clear history
                            </button>
                        )}
                    </div>

                    {mockHistory.length === 0 ? (
                        <div className="mt-5 rounded-xl border border-dashed border-slate-700 p-6 text-center">
                            <p className="font-semibold text-slate-200">No mock tests completed yet</p>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                Finish your first 20-question mock test and its score, accuracy, and time taken will appear here.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="text-sm text-slate-400">Tests completed</p>
                                    <p className="mt-1 text-2xl font-bold">{mockHistory.length}</p>
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="text-sm text-slate-400">Best score</p>
                                    <p className="mt-1 text-2xl font-bold text-emerald-300">
                                        {Math.max(...mockHistory.map((attempt) => Number(attempt.percentage) || 0))}%
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="text-sm text-slate-400">Average score</p>
                                    <p className="mt-1 text-2xl font-bold text-cyan-300">
                                        {Math.round(mockHistory.reduce((sum, attempt) => sum + (Number(attempt.percentage) || 0), 0) / mockHistory.length)}%
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                {mockHistory.map((attempt, attemptIndex) => {
                                    const date = new Date(attempt.completedAt);
                                    const dateLabel = Number.isNaN(date.getTime())
                                        ? "Date unavailable"
                                        : date.toLocaleString(undefined, {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        });

                                    return (
                                        <article key={attempt.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4 sm:p-5">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="font-bold">Mock Test #{mockHistory.length - attemptIndex}</p>
                                                    <p className="mt-1 text-xs text-slate-500">{dateLabel}</p>
                                                </div>
                                                <div className="sm:text-right">
                                                    <p className="text-2xl font-bold text-emerald-300">
                                                        {attempt.score}/{attempt.total}
                                                        <span className="ml-2 text-sm font-semibold text-slate-400">({attempt.percentage}%)</span>
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">Time taken: {formatDuration(attempt.durationSeconds)}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                                                <div className="rounded-lg bg-emerald-500/10 p-3">
                                                    <p className="text-xs text-slate-400">Correct</p>
                                                    <p className="mt-1 font-bold text-emerald-300">{attempt.correct}</p>
                                                </div>
                                                <div className="rounded-lg bg-rose-500/10 p-3">
                                                    <p className="text-xs text-slate-400">Incorrect</p>
                                                    <p className="mt-1 font-bold text-rose-300">{attempt.incorrect}</p>
                                                </div>
                                                <div className="rounded-lg bg-slate-800 p-3">
                                                    <p className="text-xs text-slate-400">Unanswered</p>
                                                    <p className="mt-1 font-bold text-slate-200">{attempt.unanswered}</p>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </section>
            )}

            {loading && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />
                    <p className="font-semibold">Loading external question banks…</p>
                    <p className="mt-2 text-sm text-slate-400">
                        The first load may take a little longer.
                    </p>
                </div>
            )}

            {!loading && loadError && (
                <div
                    role="status"
                    className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200"
                >
                    {loadError}
                    {questions.length === 0 && (
                        <button
                            onClick={() => window.location.reload()}
                            className="ml-3 font-bold underline"
                        >
                            Retry
                        </button>
                    )}
                </div>
            )}

            {!loading && questions.length > 0 && arenaMode === "mock" && (
                <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-8">
                    {mockStatus !== "submitted" ? (
                        <>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                                        Timed assessment
                                    </p>
                                    <h2 className="mt-2 text-2xl font-bold">Placement Mock Test</h2>
                                    <p className="mt-2 text-sm text-slate-400">
                                        20 questions · 30 minutes · No negative marking
                                    </p>
                                </div>
                                <div
                                    aria-live="polite"
                                    className={`rounded-xl border px-5 py-3 text-center font-mono text-2xl font-bold ${
                                        timeLeft <= 300
                                            ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                                            : "border-slate-700 bg-slate-950 text-white"
                                    }`}
                                >
                                    {formatTime(timeLeft)}
                                    <p className="mt-1 font-sans text-xs font-medium text-slate-500">TIME LEFT</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                                <span className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-sm bg-emerald-500" /> Answered
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-sm bg-slate-800 ring-1 ring-slate-600" /> Unanswered
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-sm bg-indigo-500" /> Current
                                </span>
                                <span className="ml-auto">
                                    {mockAnsweredCount}/{mockQuestions.length} answered
                                </span>
                            </div>

                            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                                {mockQuestions.map((item, questionIndex) => {
                                    const answered = mockAnswers[item.id] !== undefined;
                                    const current = questionIndex === mockIndex;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setMockIndex(questionIndex)}
                                            aria-label={`Go to question ${questionIndex + 1}${answered ? ", answered" : ", unanswered"}`}
                                            aria-current={current ? "step" : undefined}
                                            className={`h-10 rounded-lg border text-sm font-bold transition ${
                                                current
                                                    ? "border-indigo-300 bg-indigo-500 text-white ring-2 ring-indigo-400/30"
                                                    : answered
                                                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                                                        : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                                            }`}
                                        >
                                            {questionIndex + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            {mockQuestions[mockIndex] && (
                                <article className="rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:p-7">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                                            {mockQuestions[mockIndex].category}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            Question {mockIndex + 1} of {mockQuestions.length}
                                        </span>
                                    </div>

                                    <div
                                        className="mt-5 space-y-3 text-base leading-8 text-slate-200 [&_svg]:max-w-full [&_table]:my-4 [&_table]:border-collapse [&_td]:border [&_td]:border-slate-700 [&_td]:p-2 [&_th]:border [&_th]:border-slate-700 [&_th]:p-2"
                                        dangerouslySetInnerHTML={{
                                            __html: mockQuestions[mockIndex].promptHTML ||
                                                mockQuestions[mockIndex].question ||
                                                "Question text unavailable.",
                                        }}
                                    />

                                    <div className="mt-6 grid gap-3">
                                        {(mockQuestions[mockIndex].options || []).map((option, optionIndex) => {
                                            const active = Number(mockAnswers[mockQuestions[mockIndex].id]) === optionIndex;
                                            return (
                                                <button
                                                    key={optionIndex}
                                                    type="button"
                                                    onClick={() => setMockAnswers((previous) => ({
                                                        ...previous,
                                                        [mockQuestions[mockIndex].id]: optionIndex,
                                                    }))}
                                                    className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                                                        active
                                                            ? "border-indigo-400 bg-indigo-500/15"
                                                            : "border-slate-700 bg-slate-900 hover:border-slate-500"
                                                    }`}
                                                >
                                                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                                        active ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-300"
                                                    }`}>
                                                        {String.fromCharCode(65 + optionIndex)}
                                                    </span>
                                                    {mockQuestions[mockIndex].optionsHTML ? (
                                                        <span
                                                            className="min-w-0 flex-1 [&_svg]:max-w-full"
                                                            dangerouslySetInnerHTML={{ __html: String(option) }}
                                                        />
                                                    ) : (
                                                        <span className="min-w-0 flex-1">{option}</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </article>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <button
                                    type="button"
                                    disabled={mockIndex === 0}
                                    onClick={() => setMockIndex((current) => Math.max(0, current - 1))}
                                    className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    ← Previous
                                </button>
                                <button
                                    type="button"
                                    disabled={mockIndex === mockQuestions.length - 1}
                                    onClick={() => setMockIndex((current) => Math.min(mockQuestions.length - 1, current + 1))}
                                    className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next →
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowSubmitConfirm(true)}
                                    className="rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-300"
                                >
                                    Submit Test
                                </button>
                            </div>

                            {showSubmitConfirm && (
                                <div role="dialog" aria-modal="true" aria-labelledby="submit-mock-title" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
                                    <h3 id="submit-mock-title" className="font-bold text-amber-200">Submit your test?</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                        You have answered {mockAnsweredCount} of {mockQuestions.length} questions.
                                        Unanswered questions will receive zero marks.
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowSubmitConfirm(false)}
                                            className="rounded-lg border border-slate-600 px-4 py-2 font-semibold"
                                        >
                                            Continue test
                                        </button>
                                        <button
                                            type="button"
                                            onClick={submitMockTest}
                                            className="rounded-lg bg-emerald-400 px-4 py-2 font-bold text-slate-950"
                                        >
                                            Confirm submit
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 p-6">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Mock test complete</p>
                                <h2 className="mt-2 text-2xl font-bold">Your Results</h2>
                                <p className="mt-5 text-5xl font-bold text-emerald-300">
                                    {mockCorrectCount}<span className="text-2xl text-slate-400"> / {mockQuestions.length}</span>
                                </p>
                                <p className="mt-2 text-slate-300">{mockAccuracy}% score · No negative marking</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                                    <p className="text-sm text-slate-400">Correct</p>
                                    <p className="mt-1 text-2xl font-bold text-emerald-300">{mockCorrectCount}</p>
                                </div>
                                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
                                    <p className="text-sm text-slate-400">Incorrect</p>
                                    <p className="mt-1 text-2xl font-bold text-rose-300">{mockIncorrectCount}</p>
                                </div>
                                <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                                    <p className="text-sm text-slate-400">Unanswered</p>
                                    <p className="mt-1 text-2xl font-bold">{mockUnansweredCount}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold">Answer Review</h3>
                                <p className="mt-1 text-sm text-slate-400">
                                    Review each answer and read the explanation when one is available.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {mockQuestions.map((item, questionIndex) => {
                                    const chosen = mockAnswers[item.id];
                                    const correctAnswer = Number(item.correct);
                                    const isAnswered = chosen !== undefined;
                                    const isCorrect = isAnswered && Number(chosen) === correctAnswer;

                                    return (
                                        <article key={item.id} className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <h4 className="font-bold">Question {questionIndex + 1}</h4>
                                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                                                    isCorrect
                                                        ? "bg-emerald-500/10 text-emerald-300"
                                                        : isAnswered
                                                            ? "bg-rose-500/10 text-rose-300"
                                                            : "bg-slate-800 text-slate-300"
                                                }`}>
                                                    {isCorrect ? "Correct" : isAnswered ? "Incorrect" : "Unanswered"}
                                                </span>
                                            </div>

                                            <div
                                                className="mt-3 text-sm leading-7 text-slate-200 [&_svg]:max-w-full [&_table]:my-3 [&_table]:border-collapse [&_td]:border [&_td]:border-slate-700 [&_td]:p-2 [&_th]:border [&_th]:border-slate-700 [&_th]:p-2"
                                                dangerouslySetInnerHTML={{
                                                    __html: item.promptHTML || item.question || "Question text unavailable.",
                                                }}
                                            />

                                            <p className="mt-4 text-sm text-slate-400">
                                                Your answer:{" "}
                                                <span className={isCorrect ? "text-emerald-300" : "text-rose-300"}>
                                                    {isAnswered
                                                        ? `${String.fromCharCode(65 + Number(chosen))}. ${item.options?.[Number(chosen)] ?? "Unavailable"}`
                                                        : "Not answered"}
                                                </span>
                                            </p>
                                            <p className="mt-2 text-sm text-emerald-300">
                                                Correct answer: {Number.isInteger(correctAnswer) && item.options?.[correctAnswer] !== undefined
                                                ? `${String.fromCharCode(65 + correctAnswer)}. ${item.options[correctAnswer]}`
                                                : "Correct answer data unavailable"}
                                            </p>

                                            {item.explanation && (
                                                <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900 p-4">
                                                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Explanation</p>
                                                    <div
                                                        className="text-sm leading-7 text-slate-300 [&_svg]:max-w-full"
                                                        dangerouslySetInnerHTML={{ __html: item.explanation }}
                                                    />
                                                </div>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={startMockTest}
                                    className="rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-300"
                                >
                                    Retake Mock Test
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setArenaMode("practice");
                                        setMockStatus("idle");
                                        setDeadline(null);
                                        setShowSubmitConfirm(false);
                                    }}
                                    className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 hover:border-slate-500"
                                >
                                    Return to Practice
                                </button>
                            </div>
                        </>
                    )}
                </section>
            )}

            {!loading && questions.length > 0 && arenaMode === "practice" && (
                <>
                    <section className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:grid-cols-3">
                        <label className="text-sm text-slate-300">
                            Question category
                            <select
                                value={category}
                                onChange={(event) => changeCategory(event.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
                            >
                                {CATEGORIES.map((item) => (
                                    <option key={item}>{item}</option>
                                ))}
                            </select>
                        </label>

                        <label className="text-sm text-slate-300">
                            Difficulty
                            <select
                                value={difficulty}
                                onChange={(event) => changeDifficulty(event.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
                            >
                                {DIFFICULTIES.map((item) => (
                                    <option key={item}>{item}</option>
                                ))}
                            </select>
                        </label>

                        <label className="text-sm text-slate-300">
                            Topic
                            <select
                                value={topic}
                                onChange={(event) => changeTopic(event.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
                            >
                                <option>All</option>
                                {topics.map((item) => (
                                    <option key={item}>{item}</option>
                                ))}
                            </select>
                        </label>
                    </section>

                    <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5 sm:p-8">
                        {question ? (
                            <>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                    {question.category}
                  </span>

                                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                    {question.difficulty}
                  </span>
                                </div>

                                <div className="mt-6 text-xs text-slate-500">
                                    Question {index + 1} of {filteredQuestions.length}
                                    {" · "}
                                    Topic: {question.topic}
                                </div>

                                <div
                                    className="mt-4 space-y-3 text-base leading-8 text-slate-200 [&_svg]:max-w-full [&_table]:my-4 [&_table]:border-collapse [&_td]:border [&_td]:border-slate-700 [&_td]:p-2 [&_th]:border [&_th]:border-slate-700 [&_th]:p-2"
                                    dangerouslySetInnerHTML={{
                                        __html: question.promptHTML || question.question || "Question text unavailable.",
                                    }}
                                />

                                <div className="mt-7 grid gap-3">
                                    {(question.options || []).map((option, optionIndex) => {
                                        const isSelected = selected === optionIndex;
                                        const isCorrect = question.correct === optionIndex;

                                        let style =
                                            "border-slate-700 bg-slate-950 hover:border-slate-500";

                                        if (isSelected && !submitted) {
                                            style = "border-emerald-400 bg-emerald-400/10";
                                        }

                                        if (submitted && isCorrect) {
                                            style = "border-emerald-400 bg-emerald-400/10";
                                        } else if (submitted && isSelected && !isCorrect) {
                                            style = "border-rose-400 bg-rose-400/10";
                                        }

                                        return (
                                            <button
                                                key={optionIndex}
                                                disabled={submitted}
                                                onClick={() => setSelected(optionIndex)}
                                                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${style} disabled:cursor-default`}
                                            >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>

                                                {question.optionsHTML ? (
                                                    <span
                                                        className="min-w-0 flex-1 [&_svg]:max-w-full"
                                                        dangerouslySetInnerHTML={{ __html: String(option) }}
                                                    />
                                                ) : (
                                                    <span className="min-w-0 flex-1">
                            {option}
                          </span>
                                                )}

                                                {submitted && isCorrect && (
                                                    <span className="text-emerald-300">✓</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {submitted && (
                                    <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-5">
                                        <p
                                            className={`font-bold ${
                                                selected === question.correct
                                                    ? "text-emerald-300"
                                                    : "text-rose-300"
                                            }`}
                                        >
                                            {selected === question.correct
                                                ? "Correct answer!"
                                                : `Incorrect. Correct option: ${String.fromCharCode(65 + question.correct)}.`}
                                        </p>

                                        {question.explanation && (
                                            <>
                                                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                                                    Worked solution
                                                </p>
                                                <div
                                                    className="mt-2 text-sm leading-7 text-slate-300 [&_svg]:max-w-full"
                                                    dangerouslySetInnerHTML={{
                                                        __html: question.explanation,
                                                    }}
                                                />
                                            </>
                                        )}
                                    </div>
                                )}

                                <div className="mt-6 flex flex-wrap gap-3">
                                    {!submitted ? (
                                        <button
                                            onClick={submitAnswer}
                                            disabled={selected === null}
                                            className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Submit answer
                                        </button>
                                    ) : (
                                        <button
                                            onClick={nextQuestion}
                                            className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-emerald-300"
                                        >
                                            Next question →
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            setIndex(Math.floor(Math.random() * filteredQuestions.length));
                                            resetQuestion();
                                        }}
                                        className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:border-slate-500"
                                    >
                                        Random question
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="py-10 text-center text-slate-400">
                                No questions match these filters. Try another category or difficulty.
                            </p>
                        )}
                    </section>
                </>
            )}

            <footer className="mt-8 border-t border-slate-800 pt-5 text-xs leading-6 text-slate-500">
                Question content: Ultimate Aptitude by atmamoon, licensed under
                CC BY 4.0. Source:{" "}
                <a
                    href="https://github.com/atmamoon/ultimate-aptitude"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-300 underline"
                >
                    GitHub repository
                </a>
                . Question data is fetched online. Your practice statistics and mock test history are stored
                locally in this browser; clearing browser site data can remove them.
            </footer>
        </div>
    );
}
