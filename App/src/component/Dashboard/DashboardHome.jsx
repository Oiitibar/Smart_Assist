import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Flame,
  Layers,
  Sparkles,
  Target,
} from "lucide-react";
import { CardTitle, TimetableList } from "./DashboardShared";

export default function DashboardHome({ setActivePage }) {
  return (
    <>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardTitle
              icon={Calendar}
              title="Today's Timetable"
              subtitle="Monday, 13 May 2024 • Current and upcoming classes"
            />

            <button
              onClick={() => setActivePage("timetable")}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
              View full timetable <ArrowRight size={16} />
            </button>
          </div>

          <div className="mt-6">
            <TimetableList />
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <CardTitle
            icon={Target}
            title="Today's Focus"
            subtitle="Next class and AI study suggestion"
            iconClass="bg-violet-50 text-violet-600"
          />

          <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
            <p className="text-xs font-medium text-indigo-500">Next Class</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold text-slate-950">ICT</h3>
                <p className="mt-1 text-sm text-slate-500">Computer Lab</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-indigo-600 shadow-sm">
                10:30 AM
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="font-semibold text-slate-900">AI Study Suggestion</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Review Science notes for 10 minutes before your quiz tomorrow.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={() => setActivePage("flashcard")}
              className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Review now
            </button>
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50">
              Later
            </button>
          </div>
        </aside>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <CardTitle icon={Layers} title="AI Flashcards" subtitle="From ICT notes" />

          <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5">
            <p className="text-5xl font-bold tracking-tight text-indigo-600">18</p>
            <p className="mt-1 text-sm font-medium text-slate-600">
              cards ready to review
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <button
              onClick={() => setActivePage("flashcard")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Review Cards <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setActivePage("flashcard")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-white px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
              Generate More <Sparkles size={15} />
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                Progress
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Focused on task completion and flashcard review
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              Today
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Tasks Completed
                    </p>
                    <p className="mt-1 text-3xl font-bold text-slate-950">4/6</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-emerald-600">67%</span>
              </div>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[67%] rounded-full bg-emerald-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Layers size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Cards Reviewed</p>
                    <p className="mt-1 text-3xl font-bold text-slate-950">32</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-blue-600">today</span>
              </div>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[76%] rounded-full bg-blue-500" />
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <Flame size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Study Streak</p>
                  <p className="text-sm text-slate-500">5 days consistent learning</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
              <p className="text-sm font-semibold text-indigo-700">Next best action</p>
              <p className="mt-1 text-sm text-slate-600">
                Review 10 ICT cards after your current class.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
