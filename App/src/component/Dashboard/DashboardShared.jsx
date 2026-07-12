import {
  BookOpen,
  Calculator,
  Calendar,
  ChevronDown,
  Clock,
  FileText,
  FlaskConical,
  MapPin,
  Monitor,
} from "lucide-react";

export const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const TIME_ROWS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

export const toneStyles = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
};

export function asArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

export function getItemId(item) {
  return item?._id || item?.id || item?.materialId || item?.setId || item?.categoryId;
}

export function subjectIcon(subject = "") {
  const name = subject.toLowerCase();
  if (name.includes("math") || name.includes("calculus")) return Calculator;
  if (name.includes("phys") || name.includes("science") || name.includes("chem")) return FlaskConical;
  if (name.includes("ict") || name.includes("data") || name.includes("computer")) return Monitor;
  return BookOpen;
}

export function fileIcon(type = "") {
  return FileText;
}

export function formatTime(value = "") {
  if (!value) return "--:--";
  if (value.includes("AM") || value.includes("PM")) return value;

  const [hourRaw, minute = "00"] = String(value).split(":");
  const hour = Number(hourRaw);
  if (Number.isNaN(hour)) return value;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.padStart(2, "0")} ${suffix}`;
}

export function formatRange(item = {}) {
  if (item.range) return item.range;
  return `${formatTime(item.startTime || item.time)} – ${formatTime(item.endTime)}`;
}

export function getTodayName() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

export function isTodayClass(item = {}) {
  const today = getTodayName().toLowerCase();
  return String(item.day || "").toLowerCase() === today;
}

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

export function CardTitle({ icon: Icon, title, subtitle, iconClass = "bg-indigo-50 text-indigo-600" }) {
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

export function TextInput({ value, onChange, placeholder, type = "text", icon: Icon, name }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm focus-within:border-indigo-300">
      {Icon && <Icon size={17} className="shrink-0 text-slate-400" />}
      <input
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

export function SelectBox({ value, onChange, placeholder, options = [], name }) {
  return (
    <div className="relative">
      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-9 text-sm text-slate-700 shadow-sm outline-none focus:border-indigo-300"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;
          return (
            <option key={optionValue} value={optionValue}>
              {label}
            </option>
          );
        })}
      </select>
      <ChevronDown size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

export function LoadingCard({ message = "Loading..." }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
      {message}
    </div>
  );
}

export function ErrorNotice({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="font-semibold text-rose-700 underline">
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function TimetableList({ items = [], onDelete }) {
  if (!items.length) {
    return (
      <EmptyState
        title="No classes yet"
        text="Add class schedule data on the Timetable page to display today's schedule."
      />
    );
  }

  return (
    <div className="relative space-y-3 pl-2">
      <div className="absolute bottom-8 left-[5.35rem] top-8 w-px bg-indigo-100" />
      {items.map((item, index) => {
        const Icon = subjectIcon(item.subject);
        const id = getItemId(item);
        const live = item.live || item.status === "Now" || index === 0;

        return (
          <div key={id || `${item.subject}-${index}`} className="relative grid grid-cols-[78px_1fr] items-stretch gap-5">
            <div className="pt-4 text-right">
              <p className={`text-sm font-bold ${live ? "text-indigo-600" : "text-slate-700"}`}>
                {formatTime(item.startTime || item.time)}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">{live ? "Now" : item.status || item.day}</p>
            </div>

            <span className={`absolute left-[4.95rem] top-7 z-10 h-3 w-3 rounded-full border-2 border-white ${live ? "bg-indigo-600" : "bg-slate-300"}`} />

            <div className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition ${live ? "border-indigo-200 bg-indigo-50/80 shadow-sm" : "border-slate-200 bg-white hover:border-indigo-100 hover:bg-slate-50"}`}>
              <div className="flex min-w-0 items-center gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${live ? "bg-white text-indigo-600 shadow-sm" : "bg-slate-50 text-slate-500"}`}>
                  <Icon size={20} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-semibold text-slate-950">{item.subject || "Untitled class"}</h3>
                    {live && <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Live</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {formatRange(item)}</span>
                    <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {item.room || item.location || "No room"}</span>
                  </div>
                </div>
              </div>

              {onDelete && id && (
                <button onClick={() => onDelete(id)} className="rounded-xl border border-rose-100 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50">
                  Delete
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function WeeklyTimetableGrid({ items = [] }) {
  const days = WEEK_DAYS;
  const rows = TIME_ROWS;
  const findClass = (day, hour) =>
    items.find((item) => {
      const itemDay = String(item.day || "").toLowerCase();
      const itemHour = String(item.startTime || item.time || "").slice(0, 2);
      return itemDay === day.toLowerCase() && itemHour === hour.slice(0, 2);
    });

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[820px] rounded-2xl border border-slate-200">
        <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-600">
          <div className="border-r border-slate-200 px-3 py-3">Time</div>
          {days.map((day) => (
            <div key={day} className="border-r border-slate-200 px-3 py-3 last:border-r-0">
              {day.slice(0, 3)}
            </div>
          ))}
        </div>
        {rows.map((time) => (
          <div key={time} className="grid min-h-[70px] grid-cols-6 border-b border-slate-100 last:border-b-0">
            <div className="border-r border-slate-200 px-3 py-4 text-xs font-medium text-slate-500">{formatTime(time)}</div>
            {days.map((day) => {
              const item = findClass(day, time);
              return (
                <div key={`${day}-${time}`} className="border-r border-slate-100 p-2 last:border-r-0">
                  {item && (
                    <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                      <p className="font-bold">{item.subject}</p>
                      <p className="mt-0.5 text-[11px] opacity-80">{item.room || item.location}</p>
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

export function MaterialTypeBadge({ type }) {
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase text-slate-600">
      {type || "FILE"}
    </span>
  );
}

export function CardShell({ children, className = "" }) {
  return <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>{children}</div>;
}

export { Calendar, Clock, MapPin };
