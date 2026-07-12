import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Flame, Layers, Sparkles, Target, Calendar } from "lucide-react";
import { getDashboardSummary } from "../../service/dashboardApi";
import { getErrorMessage } from "../../service/axios";
import {
  asArray,
  CardShell,
  CardTitle,
  ErrorNotice,
  formatTime,
  isTodayClass,
  LoadingCard,
  TimetableList,
} from "./DashboardShared";

export default function DashboardHome({ setActivePage }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getDashboardSummary();
      setSummary(data || {});
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load dashboard summary."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const todayTimetable = useMemo(() => {
    const list = asArray(summary?.todayTimetable || summary?.timetable);
    return list.length ? list : [];
  }, [summary]);

  const nextClass = summary?.todayFocus?.nextClass || todayTimetable[0] || null;
  const suggestion = summary?.todayFocus?.aiSuggestion || summary?.aiSuggestion || "Add timetable and materials to receive a personalized AI study suggestion.";
  const flashcards = summary?.flashcards || {};
  const progress = summary?.progress || {};

  if (loading) return <LoadingCard message="Loading your dashboard from database..." />;

  return (
    <>
      <ErrorNotice message={error} onRetry={loadSummary} />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <CardShell className="xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardTitle
              icon={Calendar}
              title="Today's Timetable"
              subtitle="Current and upcoming classes from your saved timetable."
            />
            <button
              onClick={() => setActivePage("timetable")}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
              View full timetable <ArrowRight size={16} />
            </button>
          </div>
          <div className="mt-6">
            <TimetableList items={todayTimetable.filter(isTodayClass).length ? todayTimetable.filter(isTodayClass) : todayTimetable} />
          </div>
        </CardShell>

        <CardShell>
          <CardTitle
            icon={Target}
            title="Today's Focus"
            subtitle="Next class and AI suggestion."
            iconClass="bg-violet-50 text-violet-600"
          />

          <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
            <p className="text-xs font-medium text-indigo-500">Next Class</p>
            {nextClass ? (
              <div className="mt-2 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-slate-950">{nextClass.subject}</h3>
                  <p className="mt-1 text-sm text-slate-500">{nextClass.room || nextClass.location || "No room"}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-indigo-600 shadow-sm">
                  {formatTime(nextClass.startTime || nextClass.time)}
                </span>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No class schedule added yet.</p>
            )}
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="font-semibold text-slate-900">AI Study Suggestion</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{suggestion}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActivePage("flashcard")}
            className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Review now
          </button>
        </CardShell>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <CardShell>
          <CardTitle icon={Layers} title="AI Flashcards" subtitle="Cards generated from your materials." />
          <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5">
            <p className="text-5xl font-bold tracking-tight text-indigo-600">
              {flashcards.readyCount ?? flashcards.totalCards ?? 0}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-600">cards ready to review</p>
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
        </CardShell>

        <CardShell className="xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">Progress</h2>
              <p className="mt-0.5 text-sm text-slate-500">Task completion and flashcard review from database.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Today</span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ProgressBox
              icon={CheckCircle2}
              title="Tasks Completed"
              value={`${progress.tasksCompleted ?? 0}/${progress.totalTasks ?? 0}`}
              percent={progress.totalTasks ? Math.round((progress.tasksCompleted / progress.totalTasks) * 100) : 0}
              color="emerald"
            />
            <ProgressBox
              icon={Layers}
              title="Cards Reviewed"
              value={progress.cardsReviewed ?? flashcards.reviewedToday ?? 0}
              label="today"
              percent={progress.cardProgress ?? 0}
              color="blue"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <Flame size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Study Streak</p>
                  <p className="text-sm text-slate-500">{progress.studyStreak ?? 0} days consistent learning</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
              <p className="text-sm font-semibold text-indigo-700">Next best action</p>
              <p className="mt-1 text-sm text-slate-600">{summary?.nextBestAction || "Review flashcards after your next class."}</p>
            </div>
          </div>
        </CardShell>
      </section>
    </>
  );
}

function ProgressBox({ icon: Icon, title, value, label = "", percent = 0, color = "emerald" }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600 bg-emerald-500",
    blue: "bg-blue-50 text-blue-600 bg-blue-500",
  };
  const iconClass = color === "blue" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600";
  const barClass = color === "blue" ? "bg-blue-500" : "bg-emerald-500";

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}>
            <Icon size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">{title}</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">{value}</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-slate-500">{label || `${percent}%`}</span>
      </div>
      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${Math.min(Number(percent) || 0, 100)}%` }} />
      </div>
    </div>
  );
}
