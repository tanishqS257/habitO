
import { Mail, MessageSquareText, Sparkles, Bug, Lightbulb } from "lucide-react";

export default function Feedback() {
    return (
        <div className="mx-auto w-full max-w-4xl p-4 sm:p-8">
            <div className="mb-8">
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-lime-400">
                    Your voice matters
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Feedback <span className="text-lime-400">Corner</span>
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
                    HabitO is a work in progress, and your ideas can help
                    make it better. Tell me about your experience, suggest
                    features, or report something that isn't working.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.08] bg-[#11151b] p-5">
                    <Lightbulb className="mb-4 text-lime-400" size={26} />
                    <h2 className="font-semibold text-white">Suggest a feature</h2>
                    <p className="mt-2 text-sm leading-6 text-gray-400">
                        Have an idea that could make HabitO more useful?
                        I'd love to hear it.
                    </p>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-[#11151b] p-5">
                    <Bug className="mb-4 text-lime-400" size={26} />
                    <h2 className="font-semibold text-white">Report a problem</h2>
                    <p className="mt-2 text-sm leading-6 text-gray-400">
                        Found a bug or something confusing? Let me know
                        so I can improve your experience.
                    </p>
                </div>
            </div>

            <div className="mt-6 rounded-2xl border border-lime-400/20 bg-gradient-to-br from-lime-400/[0.08] to-transparent p-6 sm:p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-lime-400/10">
                    <MessageSquareText size={25} className="text-lime-400" />
                </div>

                <h2 className="text-xl font-bold text-white">
                    Help make HabitO better <Sparkles className="inline text-lime-400" size={19} />
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
                    Share your honest experience using HabitO. What do you
                    like? What should change? Which feature would you love
                    to see next?
                </p>

                <a
                    href="mailto:xyztanishq@gmail.com?subject=HabitO%20Feedback"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-3 font-semibold text-gray-950 transition hover:bg-lime-300"
                >
                    <Mail size={18} />
                    Email Your Feedback
                </a>

                <p className="mt-4 text-sm text-gray-400">
                    Or email me directly at{" "}
                    <a
                        href="mailto:xyztanishq@gmail.com"
                        className="font-medium text-lime-400 hover:underline"
                    >
                        xyztanishq@gmail.com
                    </a>
                </p>
            </div>

            <p className="mt-8 text-center text-xs text-gray-500">
                HabitO · In Progress · Made with care
            </p>
        </div>
    );
}
