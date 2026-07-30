import {
  BookOpen,
  CalendarDays,
  Check,
  CheckSquare,
  FileQuestion,
  FolderOpen,
  GraduationCap,
  Layers3,
  MapPin,
  Settings,
  Sparkles,
  Target,
} from "lucide-react";
import { dashboardSchedule, dashboardTasks } from "../data/homeData";

const dashboardNavigation = [
  { icon: Layers3, label: "Dashboard", active: true },
  { icon: CalendarDays, label: "Timetable" },
  { icon: GraduationCap, label: "Study" },
  { icon: FolderOpen, label: "Materials" },
  { icon: Settings, label: "Settings" },
];

function PreviewSidebar() {
  return (
    <aside className="border-r border-indigo-500/20 bg-gradient-to-b from-indigo-600 to-violet-600 p-3 text-white">
      <div className="mb-4 flex items-center gap-2 px-1">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/15 text-white">
          <GraduationCap size={14} />
        </span>
        <span className="hidden text-[10px] font-extrabold sm:block">
          Smart Assist
        </span>
      </div>

      <div className="space-y-1">
        {dashboardNavigation.map(({ icon: Icon, label, active }) => (
          <div
            key={label}
            className={`flex items-center gap-2 rounded-lg px-2 py-2 text-[9px] font-semibold ${
              active ? "bg-white text-indigo-700" : "text-indigo-100"
            }`}
          >
            <Icon size={13} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-white/15 bg-white/10 p-2.5">
        <div className="flex gap-2">
          <Sparkles size={12} className="mt-0.5 shrink-0" />
          <p className="text-[7px] leading-3.5 text-indigo-50">
            Review one deck and finish your priority tasks.
          </p>
        </div>
      </div>
    </aside>
  );
}

function PreviewTimetable() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
            <CalendarDays size={14} />
          </span>
          <div>
            <p className="text-[10px] font-extrabold text-slate-900 dark:text-white">
              Today&apos;s timetable
            </p>
            <p className="text-[7px] text-slate-400">Current and upcoming classes</p>
          </div>
        </div>
        <span className="text-[7px] font-bold text-indigo-600 dark:text-indigo-300">
          Full timetable
        </span>
      </div>

      <div className="space-y-1.5">
        {dashboardSchedule.map((item) => (
          <div
            key={`${item.time}-${item.title}`}
            className="flex items-center gap-2 rounded-xl border border-slate-100 px-2 py-2 dark:border-slate-800"
          >
            <span className="w-12 text-[7px] font-bold text-slate-500 dark:text-slate-400">
              {item.time}
            </span>
            <span
              className="h-7 w-1 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[9px] font-bold text-slate-900 dark:text-white">
                {item.title}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[7px] text-slate-400">
                {item.time} – {item.endTime} <MapPin size={7} /> {item.room}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PreviewNextClass() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
          <Target size={14} />
        </span>
        <div>
          <p className="text-[10px] font-extrabold text-slate-900 dark:text-white">
            Next class
          </p>
          <p className="text-[7px] text-slate-400">Your next class for today</p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/60 p-3 text-center dark:border-indigo-900 dark:bg-indigo-500/10">
        <p className="text-[7px] font-bold text-indigo-500">01:00 PM</p>
        <p className="mt-1 text-[10px] font-extrabold text-slate-950 dark:text-white">
          Digital Communication
        </p>
        <p className="mt-1 text-[7px] text-slate-500 dark:text-slate-400">
          F-14 · 100 minutes
        </p>
      </div>
    </section>
  );
}

const studyStats = [
  { label: "Materials", value: "37", icon: BookOpen, tone: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300" },
  { label: "Flashcards", value: "15", icon: Layers3, tone: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300" },
  { label: "AI quizzes", value: "3", icon: FileQuestion, tone: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300" },
  { label: "Saved reviews", value: "7", icon: CheckSquare, tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" },
];

function PreviewStudyStatus() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
          <Layers3 size={14} />
        </span>
        <div>
          <p className="text-[10px] font-extrabold text-slate-900 dark:text-white">
            Study status
          </p>
          <p className="text-[7px] text-slate-400">Materials, cards, quizzes and reviews</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {studyStats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className={`rounded-xl p-2 ${tone}`}>
            <div className="flex items-center justify-between">
              <Icon size={11} />
              <strong className="text-[12px]">{value}</strong>
            </div>
            <span className="mt-1 block text-[7px] font-semibold opacity-80">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PreviewTasks() {
  const remainingTaskCount = dashboardTasks.filter((task) => !task.done).length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-extrabold text-slate-900 dark:text-white">
            Tasks
          </p>
          <p className="text-[7px] text-slate-400">Your personal study checklist</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[7px] font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
          {remainingTaskCount} left
        </span>
      </div>

      <div className="space-y-1.5">
        {dashboardTasks.map((task) => (
          <div
            key={task.title}
            className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-950"
          >
            <span
              className={`grid h-3.5 w-3.5 place-items-center rounded ${
                task.done
                  ? "bg-emerald-500 text-white"
                  : "border border-slate-300 dark:border-slate-600"
              }`}
            >
              {task.done && <Check size={9} />}
            </span>
            <span
              className={`truncate text-[8px] ${
                task.done
                  ? "text-slate-400 line-through"
                  : "text-slate-700 dark:text-slate-200"
              }`}
            >
              {task.title}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[700px] select-none">
      <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-indigo-200/70 via-violet-100/50 to-sky-100/60 blur-3xl dark:from-indigo-900/30 dark:via-violet-900/20 dark:to-sky-900/20" />

      <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 shadow-2xl shadow-indigo-950/10 dark:border-slate-700 dark:bg-slate-950 dark:shadow-black/40">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="rounded-lg bg-slate-100 px-3 py-1 text-[9px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            smart-assist / dashboard
          </div>
          <div className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-500/20" />
        </div>

        <div className="grid min-h-[430px] grid-cols-[132px_1fr] sm:grid-cols-[155px_1fr]">
          <PreviewSidebar />

          <main className="min-w-0 p-3 sm:p-4">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
                  Workspace · Dashboard
                </p>
                <h3 className="mt-1 text-sm font-extrabold text-slate-950 sm:text-base dark:text-white">
                  Good afternoon, Student 👋
                </h3>
                <p className="mt-1 hidden text-[9px] text-slate-500 sm:block dark:text-slate-400">
                  Your timetable, study resources, quizzes and tasks are ready.
                </p>
              </div>
              <div className="shrink-0">
                <div className="hidden items-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2 shadow-lg sm:flex dark:border-indigo-900 dark:bg-slate-900">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                    <GraduationCap size={14} />
                  </span>
                  <div className="text-left">
                    <p className="text-[9px] font-bold text-slate-900 dark:text-white">
                      Smart study
                    </p>
                    <p className="text-[7px] text-slate-400">
                      Read · Ask · Review
                    </p>
                  </div>
                </div>

                <span className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-indigo-600 sm:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-300">
                  <Sparkles size={14} />
                </span>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1.35fr_.8fr]">
              <PreviewTimetable />
              <PreviewNextClass />
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[.95fr_1.15fr]">
              <PreviewStudyStatus />
              <PreviewTasks />
            </div>
          </main>
        </div>
      </div>

    </div>
  );
}
