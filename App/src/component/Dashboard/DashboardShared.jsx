import {
  BookOpen,
  Calendar,
  Calculator,
  ChevronDown,
  Clock,
  FlaskConical,
  MapPin,
  Monitor,
} from "lucide-react";

// Sample data now. Later you can replace these with API/database values.
export const TIMETABLE = [
  {
    time: "10:30 AM",
    range: "10:30 AM – 11:30 AM",
    subject: "ICT",
    location: "Computer Lab",
    status: "Now",
    live: true,
    Icon: Monitor,
  },
  {
    time: "12:00 PM",
    range: "12:00 PM – 1:00 PM",
    subject: "Mathematics",
    location: "Room 203",
    status: "Next",
    Icon: Calculator,
  },
  {
    time: "2:00 PM",
    range: "2:00 PM – 3:00 PM",
    subject: "Physics",
    location: "Lab 1",
    status: "Later",
    Icon: FlaskConical,
  },
  {
    time: "3:30 PM",
    range: "3:30 PM – 4:30 PM",
    subject: "English",
    location: "Room 105",
    status: "Later",
    Icon: BookOpen,
  },
];

export const WEEK_DAYS = [
  { day: "Mon", date: "May 19" },
  { day: "Tue", date: "May 20" },
  { day: "Wed", date: "May 21" },
  { day: "Thu", date: "May 22" },
  { day: "Fri", date: "May 23" },
];

export const TIME_ROWS = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
];

export const WEEKLY_CLASSES = [
  { day: "Mon", time: "9:00 AM", subject: "Calculus I", room: "Room 101", tone: "blue" },
  { day: "Mon", time: "11:00 AM", subject: "Physics", room: "Room 203", tone: "violet" },
  { day: "Mon", time: "2:00 PM", subject: "English Comp", room: "Room 105", tone: "green" },
  { day: "Tue", time: "10:00 AM", subject: "Data Structures", room: "Room 201", tone: "rose" },
  { day: "Tue", time: "1:00 PM", subject: "Discrete Math", room: "Room 204", tone: "amber" },
  { day: "Wed", time: "9:00 AM", subject: "Calculus I", room: "Room 101", tone: "blue" },
  { day: "Wed", time: "11:00 AM", subject: "Physics", room: "Room 203", tone: "violet" },
  { day: "Wed", time: "2:00 PM", subject: "English Comp", room: "Room 105", tone: "green" },
  { day: "Thu", time: "10:00 AM", subject: "Data Structures", room: "Room 201", tone: "rose" },
  { day: "Thu", time: "1:00 PM", subject: "Discrete Math", room: "Room 204", tone: "amber" },
  { day: "Fri", time: "9:00 AM", subject: "Calculus I", room: "Room 101", tone: "blue" },
  { day: "Fri", time: "11:00 AM", subject: "Physics", room: "Room 203", tone: "violet" },
  { day: "Fri", time: "2:00 PM", subject: "English Comp", room: "Room 105", tone: "green" },
];

export const MATERIALS = [
  {
    title: "Data Structures Notes.pdf",
    type: "PDF",
    category: "ICT",
    uploaded: "May 23, 2025 • 10:24 AM",
    size: "2.4 MB",
  },
  {
    title: "Physics Formulas.docx",
    type: "DOCX",
    category: "Physics",
    uploaded: "May 22, 2025 • 03:15 PM",
    size: "1.1 MB",
  },
  {
    title: "Math Exercises Set 1.pdf",
    type: "PDF",
    category: "Math",
    uploaded: "May 21, 2025 • 09:45 AM",
    size: "3.7 MB",
  },
  {
    title: "Chemical Reactions.pptx",
    type: "PPTX",
    category: "Science",
    uploaded: "May 20, 2025 • 05:30 PM",
    size: "5.2 MB",
  },
  {
    title: "English Essay Guide.txt",
    type: "TXT",
    category: "English",
    uploaded: "May 19, 2025 • 11:10 AM",
    size: "850 KB",
  },
];

export const CATEGORIES = [
  { name: "ICT", count: 12, Icon: Monitor, tone: "violet" },
  { name: "Physics", count: 10, Icon: FlaskConical, tone: "blue" },
  { name: "Math", count: 14, Icon: Calculator, tone: "amber" },
  { name: "English", count: 9, Icon: BookOpen, tone: "green" },
  { name: "Science", count: 8, Icon: FlaskConical, tone: "rose" },
];

export const FLASHCARD_TOPICS = [
  { name: "ICT", cards: 32, Icon: Monitor, tone: "violet" },
  { name: "Physics", cards: 28, Icon: FlaskConical, tone: "blue" },
  { name: "Math", cards: 26, Icon: Calculator, tone: "amber" },
  { name: "English", cards: 24, Icon: BookOpen, tone: "green" },
];

export const SUGGESTED_SETS = [
  { title: "Data Structures Basics", cards: 24 },
  { title: "Arrays & Linked Lists", cards: 18 },
  { title: "Stacks & Queues", cards: 16 },
  { title: "Trees & Graphs", cards: 22 },
  { title: "Sorting Algorithms", cards: 20 },
];

export const toneStyles = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
};

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function CardTitle({
  icon: Icon,
  title,
  subtitle,
  iconClass = "bg-indigo-50 text-indigo-600",
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClass}`}>
        <Icon size={21} />
      </div>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export function TextInput({ placeholder, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm focus-within:border-indigo-300">
      {Icon && <Icon size={17} className="shrink-0 text-slate-400" />}
      <input
        value={value ?? ""}
        readOnly
        placeholder={placeholder}
        className="w-full bg-transparent outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

export function SelectBox({ placeholder, options = [] }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500 shadow-sm">
      <span>{placeholder}</span>
      <ChevronDown size={17} className="text-slate-400" />
      <select className="sr-only" aria-label={placeholder}>
        <option>{placeholder}</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

export function TimetableList() {
  return (
    <div className="relative space-y-3 pl-2">
      <div className="absolute bottom-8 left-[5.35rem] top-8 w-px bg-indigo-100" />

      {TIMETABLE.map((item, index) => {
        const Icon = item.Icon;

        return (
          <div
            key={item.subject}
            className="relative grid grid-cols-[78px_1fr] items-stretch gap-5"
          >
            <div className="pt-4 text-right">
              <p
                className={`text-sm font-bold ${
                  item.live ? "text-indigo-600" : "text-slate-700"
                }`}
              >
                {item.time}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">{item.status}</p>
            </div>

            <span
              className={`absolute left-[4.95rem] top-7 z-10 h-3 w-3 rounded-full border-2 border-white ${
                item.live ? "bg-indigo-600" : "bg-slate-300"
              }`}
            />

            <div
              className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                item.live
                  ? "border-indigo-200 bg-indigo-50/80 shadow-sm"
                  : "border-slate-200 bg-white hover:border-indigo-100 hover:bg-slate-50"
              }`}
            >
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    item.live
                      ? "bg-white text-indigo-600 shadow-sm"
                      : index === 1
                      ? "bg-violet-50 text-violet-600"
                      : index === 2
                      ? "bg-blue-50 text-blue-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  <Icon size={20} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-semibold text-slate-950">
                      {item.subject}
                    </h3>
                    {item.live && (
                      <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                        Live
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={14} /> {item.range}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={14} /> {item.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function WeeklyTimetableGrid() {
  const findClass = (day, time) =>
    WEEKLY_CLASSES.find((item) => item.day === day && item.time === time);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[820px] rounded-2xl border border-slate-200">
        <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-600">
          <div className="border-r border-slate-200 px-3 py-3">Time</div>
          {WEEK_DAYS.map((day) => (
            <div key={day.day} className="border-r border-slate-200 px-3 py-3 last:border-r-0">
              <p>{day.day}</p>
              <p className="font-normal text-slate-400">{day.date}</p>
            </div>
          ))}
        </div>

        {TIME_ROWS.map((time) => (
          <div key={time} className="grid min-h-[70px] grid-cols-6 border-b border-slate-100 last:border-b-0">
            <div className="border-r border-slate-200 px-3 py-4 text-xs font-medium text-slate-500">
              {time}
            </div>
            {WEEK_DAYS.map((day) => {
              const block = findClass(day.day, time);
              return (
                <div key={`${day.day}-${time}`} className="border-r border-slate-100 p-2 last:border-r-0">
                  {block && (
                    <div className={`rounded-xl border px-3 py-2 text-xs ${toneStyles[block.tone]}`}>
                      <p className="font-bold">{block.subject}</p>
                      <p className="mt-0.5 text-[11px] opacity-80">{block.room}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
