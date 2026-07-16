import { ArrowRight, Check, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { HOME_ROUTES } from "../routes";
import DashboardPreview from "./DashboardPreview";

const trustItems = [
  "Private user accounts",
  "Responsive design",
  "Light and dark modes",
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white px-5 pb-20 pt-28 dark:bg-slate-950 sm:px-6 lg:px-8 lg:pb-28 lg:pt-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(99,102,241,0.10),transparent_30%),radial-gradient(circle_at_85%_25%,rgba(139,92,246,0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_15%_15%,rgba(99,102,241,0.16),transparent_30%),radial-gradient(circle_at_85%_25%,rgba(139,92,246,0.12),transparent_28%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-extrabold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Zap size={13} /> One workspace for your study life
          </div>

          <h1 className="mt-6 text-5xl font-black leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
            Plan smarter.
            <span className="block bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              Study with focus.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
            Smart Student Planner helps you manage classes, tasks and study
            materials, then turn selected materials into useful flashcards from
            one secure dashboard.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to={HOME_ROUTES.register}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              Create your account <ArrowRight size={16} />
            </Link>

            <Link
              to={HOME_ROUTES.login}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-extrabold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:bg-slate-800"
            >
              Open your dashboard
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {trustItems.map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-emerald-500" /> {item}
              </span>
            ))}
          </div>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
}
