import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  List,
  MapPin,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import { EmptyState, Modal, PageHeader } from "./DashboardShared";
import {
  iconButtonClass,
  inputClass,
  labelClass,
  pageClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
  selectClass,
} from "./ui";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const longDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const times = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"];
const colors = ["#4f46e5", "#8b5cf6", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e"];

function timePosition(time) {
  const [raw, modifier] = String(time).trim().split(" ");
  let [hour, minute = 0] = raw.split(":").map(Number);
  if (modifier === "PM" && hour !== 12) hour += 12;
  if (modifier === "AM" && hour === 12) hour = 0;
  return Math.max(0, (hour + minute / 60 - 8) * 68);
}

function getWeekDates() {
  const now = new Date();
  const monday = new Date(now);
  const day = now.getDay();
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  return days.map((_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

export default function TimetablePage({ schedules, onAddSchedule, onDeleteSchedule }) {
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [form, setForm] = useState({
    title: "",
    day: "Mon",
    start: "09:00 AM",
    end: "10:00 AM",
    room: "",
    teacher: "",
    type: "Lecture",
    color: colors[0],
  });

  const grouped = useMemo(
    () => Object.fromEntries(days.map((day) => [day, schedules.filter((item) => item.day === day)])),
    [schedules],
  );

  const weekDates = useMemo(() => {
    const base = getWeekDates();
    return base.map((date) => {
      const shifted = new Date(date);
      shifted.setDate(date.getDate() + weekOffset * 7);
      return shifted;
    });
  }, [weekOffset]);

  const weekTitle = `${weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekDates[4].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  const submit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    onAddSchedule({
      ...form,
      id: crypto.randomUUID(),
      title: form.title.trim(),
      room: form.room.trim() || "Room TBA",
      teacher: form.teacher.trim() || "Instructor TBA",
    });
    setShowAdd(false);
    setForm((value) => ({ ...value, title: "", room: "", teacher: "" }));
  };

  return (
    <div className={pageClass}>
      <PageHeader
        eyebrow="Plan your week"
        title="Timetable"
        description="Add classes and study sessions in one compact weekly schedule."
        action={
          <button className={primaryButtonClass} onClick={() => setShowAdd(true)}>
            <Plus size={17} /> Add class
          </button>
        }
      />

      <div className={`${panelClass} mb-3 flex flex-wrap items-center justify-between gap-3 p-3`}>
        <div className="flex items-center gap-2">
          <button className={iconButtonClass} onClick={() => setWeekOffset((value) => value - 1)} aria-label="Previous week">
            <ChevronLeft size={18} />
          </button>
          <button className={secondaryButtonClass} onClick={() => setWeekOffset(0)}>Today</button>
          <button className={iconButtonClass} onClick={() => setWeekOffset((value) => value + 1)} aria-label="Next week">
            <ChevronRight size={18} />
          </button>
        </div>

        <h2 className="text-sm font-bold text-slate-900 dark:text-white">{weekTitle}</h2>

        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setView("week")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${view === "week" ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-300" : "text-slate-500 dark:text-slate-400"}`}
          >
            <CalendarDays size={15} /> Week
          </button>
          <button
            onClick={() => setView("list")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${view === "list" ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-300" : "text-slate-500 dark:text-slate-400"}`}
          >
            <List size={15} /> List
          </button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <section className={`${panelClass} grid min-h-80 place-items-center`}>
          <EmptyState
            title="No classes yet"
            message="Add your first class to build a personal weekly timetable."
            action={<button className={primaryButtonClass} onClick={() => setShowAdd(true)}>Add class</button>}
          />
        </section>
      ) : view === "week" ? (
        <section className={`${panelClass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <div className="min-w-[790px]">
              <div className="grid h-16 grid-cols-[64px_repeat(5,minmax(140px,1fr))] border-b border-slate-200 dark:border-slate-800">
                <div className="grid place-items-center text-[10px] text-slate-400">GMT+6:30</div>
                {days.map((day, index) => {
                  const date = weekDates[index];
                  const isToday = weekOffset === 0 && date.toDateString() === new Date().toDateString();
                  return (
                    <div className="grid place-items-center border-l border-slate-100 dark:border-slate-800" key={day}>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{longDays[index]}</span>
                      <strong className={`mt-1 grid h-8 w-8 place-items-center rounded-xl text-sm ${isToday ? "bg-indigo-600 text-white" : "text-slate-800 dark:text-slate-100"}`}>
                        {date.getDate()}
                      </strong>
                    </div>
                  );
                })}
              </div>

              <div className="grid h-[680px] grid-cols-[64px_repeat(5,minmax(140px,1fr))] overflow-y-auto">
                <div className="relative">
                  {times.map((time) => (
                    <span className="block h-[68px] pr-2 pt-2 text-right text-[10px] text-slate-400" key={time}>{time}</span>
                  ))}
                </div>

                {days.map((day) => (
                  <div className="relative border-l border-slate-100 dark:border-slate-800" key={day}>
                    {times.map((time) => <i className="block h-[68px] border-b border-slate-100 dark:border-slate-800/80" key={time} />)}
                    {grouped[day].map((item) => {
                      const top = timePosition(item.start);
                      const height = Math.max(56, timePosition(item.end) - top - 4);
                      return (
                        <div
                          className="absolute left-1.5 right-1.5 z-[2] overflow-hidden rounded-xl border border-l-4 p-2.5 text-left shadow-sm"
                          key={item.id || `${item.title}-${item.start}`}
                          style={{
                            top,
                            height,
                            color: item.color,
                            borderColor: `${item.color}38`,
                            borderLeftColor: item.color,
                            backgroundColor: `${item.color}13`,
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <strong className="truncate text-xs text-slate-900 dark:text-white">{item.title}</strong>
                            <button
                              className="shrink-0 rounded-md p-0.5 text-slate-400 hover:bg-white/70 hover:text-rose-500 dark:hover:bg-slate-900"
                              onClick={() => onDeleteSchedule?.(item.id)}
                              aria-label="Delete class"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <span className="mt-1 block text-[10px] text-slate-500 dark:text-slate-400">{item.start} – {item.end}</span>
                          {height > 70 && <small className="mt-2 flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400"><MapPin size={12} /> {item.room}</small>}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className={`${panelClass} overflow-hidden`}>
          {days.map((day, index) => (
            <div key={day} className="border-b border-slate-100 p-4 last:border-b-0 dark:border-slate-800">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{longDays[index]}</h3>
                  <p className="text-[11px] text-slate-400">{weekDates[index].toLocaleDateString("en-US", { month: "long", day: "numeric" })}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">{grouped[day].length}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {grouped[day].length === 0 ? (
                  <p className="text-xs text-slate-400">No classes</p>
                ) : grouped[day].map((item) => (
                  <article key={item.id || `${item.title}-${item.start}`} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <i className="h-10 w-1 rounded-full" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-sm text-slate-900 dark:text-white">{item.title}</strong>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{item.start} – {item.end} · {item.room}</p>
                    </div>
                    <button className={iconButtonClass} onClick={() => onDeleteSchedule?.(item.id)}><Trash2 size={15} /></button>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {showAdd && (
        <Modal title="Add timetable entry" description="Add a class, lab, or personal study session." onClose={() => setShowAdd(false)}>
          <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={submit}>
            <label className={`${labelClass} sm:col-span-2`}>
              Class or session name
              <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Data Structures" autoFocus />
            </label>
            <label className={labelClass}>
              Day
              <select className={selectClass} value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
                {days.map((day) => <option key={day}>{day}</option>)}
              </select>
            </label>
            <label className={labelClass}>
              Type
              <select className={selectClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option>Lecture</option><option>Lab</option><option>Seminar</option><option>Study</option>
              </select>
            </label>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5"><Clock3 size={14} /> Start time</span>
              <input className={inputClass} value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} placeholder="09:00 AM" />
            </label>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5"><Clock3 size={14} /> End time</span>
              <input className={inputClass} value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} placeholder="10:00 AM" />
            </label>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5"><UserRound size={14} /> Instructor</span>
              <input className={inputClass} value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} placeholder="Dr. Smith" />
            </label>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5"><MapPin size={14} /> Room</span>
              <input className={inputClass} value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="Building A · 204" />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Color
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className="h-8 w-8 rounded-full border-4 border-white shadow-sm dark:border-slate-900"
                    style={{ backgroundColor: color, outline: form.color === color ? `2px solid ${color}` : "1px solid transparent" }}
                    aria-label={`Choose ${color}`}
                  />
                ))}
              </div>
            </label>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button type="button" className={secondaryButtonClass} onClick={() => setShowAdd(false)}>Cancel</button>
              <button className={primaryButtonClass} type="submit">Add to timetable</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
