import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  Layers3,
  MapPin,
  Plus,
  Target,
} from "lucide-react";
import { PageHeader } from "./DashboardShared";
import {
  pageClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./ui";

const dayLabel = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
}).format(new Date());

const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const longDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function timeToMinutes(value) {
  if (!value || typeof value !== "string") return null;

  const normalized = value.trim().toUpperCase();
  const twelveHour = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);

  if (twelveHour) {
    let hour = Number(twelveHour[1]);
    const minute = Number(twelveHour[2]);
    const period = twelveHour[3];

    if (hour === 12) hour = 0;
    if (period === "PM") hour += 12;

    return hour * 60 + minute;
  }

  const twentyFourHour = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHour) {
    return Number(twentyFourHour[1]) * 60 + Number(twentyFourHour[2]);
  }

  return null;
}

export default function DashboardHome({
  user,
  categories,
  materials,
  flashcards,
  schedules,
  tasks,
  onNavigate,
  onAddTask,
  onCompleteTask,
}) {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskSaving, setTaskSaving] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const cardsCount = Object.values(flashcards).reduce((total, cards) => total + cards.length, 0);
  const flashcardCategories = categories.filter((category) => (flashcards[category.id] || []).length > 0).length;

  const todayShort = shortDays[now.getDay()];
  const todayLong = longDays[now.getDay()];

  // Keep every class for today in the same order returned by the timetable API.
  // Past classes are not removed and the list is not rearranged by the clock.
  const todaysClasses = useMemo(
    () => schedules.filter((item) => item.day === todayShort || item.day === todayLong),
    [schedules, todayLong, todayShort],
  );

  // Today's Focus is calculated separately. Only a class that has not started yet
  // can become the focus class. Sorting a copied array does not change the timetable list.
  const nextClass = useMemo(() => {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return todaysClasses
      .map((item) => ({ item, startMinutes: timeToMinutes(item.start) }))
      .filter(({ startMinutes }) => startMinutes !== null && startMinutes > currentMinutes)
      .sort((a, b) => a.startMinutes - b.startMinutes)[0]?.item || null;
  }, [now, todaysClasses]);

  const addTask = async (event) => {
    event.preventDefault();
    if (!taskTitle.trim() || taskSaving) return;
    setTaskSaving(true);
    try {
      await onAddTask({
        title: taskTitle.trim(),
        detail: "Added just now",
      });
      setTaskTitle("");
    } finally {
      setTaskSaving(false);
    }
  };

  return (
    <div className={pageClass}>
      <PageHeader
        eyebrow={dayLabel}
        title={`Good morning, ${(user?.name || user?.fullName || "Student").split(" ")[0]} 👋`}
        description="Your timetable, study focus, flashcards, and tasks are ready for today."
      />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className={`${panelClass} p-4 sm:p-5 xl:col-span-2`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                <CalendarDays size={21} />
              </span>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">Today&apos;s timetable</h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Current and upcoming classes</p>
              </div>
            </div>
            <button className={secondaryButtonClass} onClick={() => onNavigate("timetable")}>
              Full timetable <ArrowRight size={16} />
            </button>
          </div>

          <div className="relative mt-4 space-y-2 pl-0 sm:pl-1">
            {todaysClasses.length > 0 && (
              <div className="absolute bottom-8 left-[78px] top-8 hidden w-px bg-indigo-100 sm:block dark:bg-indigo-900/60" />
            )}

            {todaysClasses.length === 0 ? (
              <div className="grid min-h-32 place-items-center rounded-2xl border border-dashed border-slate-200 text-center dark:border-slate-800">
                <div>
                  <CalendarDays className="mx-auto text-slate-300 dark:text-slate-600" size={25} />
                  <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">No classes scheduled for today</p>
                </div>
              </div>
            ) : (
              todaysClasses.map((item, index) => (
                <div key={`${item.id || item.title}-${index}`} className="relative grid grid-cols-1 gap-2 sm:grid-cols-[68px_1fr] sm:gap-5">
                  <div className="hidden pt-3 text-right sm:block">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.start}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{item.end}</p>
                  </div>
                  <span className="absolute left-[73px] top-6 z-10 hidden h-3 w-3 rounded-full border-2 border-white bg-slate-300 sm:block dark:border-slate-900 dark:bg-slate-600" />
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 dark:border-slate-800 dark:bg-slate-900">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold"
                      style={{ color: item.color, backgroundColor: `${item.color}18` }}
                    >
                      {item.title?.slice(0, 1)?.toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-slate-950 dark:text-white">{item.title}</h3>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1"><Clock3 size={13} /> {item.start} – {item.end}</span>
                        <span className="inline-flex items-center gap-1"><MapPin size={13} /> {item.room}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <aside className={`${panelClass} p-4 sm:p-5`}>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
              <Target size={22} />
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">Today&apos;s focus</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Your next class for today</p>
            </div>
          </div>

          {nextClass ? (
            <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/60 dark:bg-indigo-500/10">
              <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-300">Next class</p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-extrabold text-slate-950 dark:text-white">{nextClass.title}</h3>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{nextClass.room}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <Clock3 size={13} /> {nextClass.start} – {nextClass.end}
                  </p>
                </div>
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold"
                  style={{ color: nextClass.color, backgroundColor: `${nextClass.color}18` }}
                >
                  {nextClass.title?.slice(0, 1)?.toUpperCase()}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid min-h-40 place-items-center rounded-2xl border border-dashed border-slate-200 text-center dark:border-slate-800">
              <div>
                <Target className="mx-auto text-slate-300 dark:text-slate-600" size={26} />
                <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Nothing to show</p>
                <p className="mt-1 text-xs text-slate-400">There is no upcoming class for today.</p>
              </div>
            </div>
          )}
        </aside>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className={`${panelClass} p-4 sm:p-5`}>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
              <Layers3 size={21} />
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">Flashcards</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Your generated and manual cards</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4 dark:border-indigo-900/60 dark:from-indigo-500/10 dark:to-slate-900">
            <p className="text-4xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-300">{cardsCount}</p>
            <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">cards ready to review</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
              <p className="text-lg font-bold text-slate-950 dark:text-white">{flashcardCategories}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">categories</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
              <p className="text-lg font-bold text-slate-950 dark:text-white">{materials.length}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">materials</p>
            </div>
          </div>

          <button className={`${primaryButtonClass} mt-3 w-full`} onClick={() => onNavigate("flashcard")}>
            Review cards <ArrowRight size={16} />
          </button>
        </article>

        <article className={`${panelClass} p-4 sm:p-5 xl:col-span-2`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">Tasks</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Add a task and check it when finished.</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">{tasks.length} left</span>
          </div>

          <form className="mt-3 flex gap-2" onSubmit={addTask}>
            <input
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder="Add a new task..."
              className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-500/15"
            />
            <button className={primaryButtonClass} type="submit" disabled={taskSaving}><Plus size={17} /><span className="hidden sm:inline">{taskSaving ? "Adding..." : "Add"}</span></button>
          </form>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.length === 0 ? (
              <div className="grid min-h-28 place-items-center text-center">
                <div>
                  <Check className="mx-auto text-emerald-500" size={26} />
                  <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">All tasks completed</p>
                </div>
              </div>
            ) : (
              tasks.map((task) => (
                <label key={task.id} className="group flex cursor-pointer items-center gap-3 py-3">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    onChange={() => onCompleteTask(task.id)}
                  />
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-slate-300 text-transparent transition peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:text-white dark:border-slate-600">
                    <Check size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm text-slate-800 dark:text-slate-100">{task.title}</strong>
                    <small className="mt-0.5 block text-[11px] text-slate-400">{task.detail || "Personal task"}</small>
                  </span>
                </label>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
