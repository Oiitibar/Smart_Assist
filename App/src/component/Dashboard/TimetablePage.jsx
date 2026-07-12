import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Calendar, Clock, MapPin, Plus, Target, Brain } from "lucide-react";
import {
  createTimetableItem,
  deleteTimetableItem,
  getTimetable,
  getTodayTimetable,
} from "../../service/timetableApi";
import { getErrorMessage } from "../../service/axios";
import {
  asArray,
  CardShell,
  CardTitle,
  ErrorNotice,
  Field,
  formatRange,
  formatTime,
  getItemId,
  isTodayClass,
  LoadingCard,
  PageHeader,
  SelectBox,
  TextInput,
  TimetableList,
  WeeklyTimetableGrid,
} from "./DashboardShared";

const initialForm = {
  subject: "",
  day: "",
  startTime: "",
  endTime: "",
  room: "",
  teacher: "",
};

const subjectOptions = ["ICT", "Mathematics", "Physics", "English", "Science", "History"];
const dayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TimetablePage({ setActivePage }) {
  const [timetable, setTimetable] = useState([]);
  const [todayTimetable, setTodayTimetable] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTimetable = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [all, today] = await Promise.allSettled([getTimetable(), getTodayTimetable()]);
      if (all.status === "fulfilled") setTimetable(asArray(all.value));
      if (today.status === "fulfilled") setTodayTimetable(asArray(today.value));
      if (all.status === "rejected" && today.status === "rejected") {
        throw all.reason;
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load timetable."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTimetable();
  }, [loadTimetable]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.subject || !form.day || !form.startTime || !form.endTime) {
      setError("Please fill subject, day, start time, and end time.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await createTimetableItem(form);
      setSuccess("Schedule saved successfully.");
      setForm(initialForm);
      await loadTimetable();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save schedule."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class schedule?")) return;
    try {
      setError("");
      await deleteTimetableItem(id);
      await loadTimetable();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete schedule."));
    }
  };

  const displayToday = useMemo(() => {
    if (todayTimetable.length) return todayTimetable;
    const filtered = timetable.filter(isTodayClass);
    return filtered.length ? filtered : timetable.slice(0, 4);
  }, [todayTimetable, timetable]);

  const nextClass = displayToday[0] || null;

  if (loading) return <LoadingCard message="Loading timetable from database..." />;

  return (
    <>
      <PageHeader
        title="Timetable"
        subtitle="Input class schedules and display saved timetable data for this user account."
        action={
          <button
            onClick={() => setActivePage("dashboard")}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
          >
            Back to dashboard <ArrowRight size={16} />
          </button>
        }
      />

      <ErrorNotice message={error} onRetry={loadTimetable} />
      {success && <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <CardShell className="xl:col-span-2">
          <CardTitle
            icon={Calendar}
            title="Add Class Schedule"
            subtitle="Save timetable data to the backend database."
          />

          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Subject">
              <SelectBox name="subject" value={form.subject} onChange={handleChange} placeholder="Select subject" options={subjectOptions} />
            </Field>
            <Field label="Day">
              <SelectBox name="day" value={form.day} onChange={handleChange} placeholder="Select day" options={dayOptions} />
            </Field>
            <Field label="Start Time">
              <TextInput name="startTime" value={form.startTime} onChange={handleChange} type="time" icon={Clock} />
            </Field>
            <Field label="End Time">
              <TextInput name="endTime" value={form.endTime} onChange={handleChange} type="time" icon={Clock} />
            </Field>
            <Field label="Room">
              <TextInput name="room" value={form.room} onChange={handleChange} placeholder="e.g., Room 101" />
            </Field>
            <Field label="Teacher">
              <TextInput name="teacher" value={form.teacher} onChange={handleChange} placeholder="e.g., Dr. Smith" />
            </Field>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={16} /> {saving ? "Saving..." : "Save Schedule"}
              </button>
            </div>
          </form>
        </CardShell>

        <CardShell>
          <CardTitle
            icon={Target}
            title="Today's Focus"
            subtitle="AI suggestion from the next class."
            iconClass="bg-violet-50 text-violet-600"
          />

          <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-indigo-500">Next Class</p>
                <h3 className="mt-2 text-xl font-bold text-slate-950">{nextClass?.subject || "No class"}</h3>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <Clock size={15} /> {nextClass ? formatRange(nextClass) : "Add schedule first"}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={15} /> {nextClass?.room || nextClass?.location || "No room"}
                </p>
              </div>
              {nextClass && (
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 shadow-sm">
                  {formatTime(nextClass.startTime || nextClass.time)}
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                <Brain size={19} />
              </div>
              <div>
                <p className="font-semibold text-slate-900">AI Study Suggestion</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {nextClass
                    ? `Review materials linked to ${nextClass.subject} and practice related flashcards before class.`
                    : "Add your timetable and study materials to receive suggestions."}
                </p>
              </div>
            </div>
          </div>
        </CardShell>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <CardShell className="xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle icon={Calendar} title="Weekly Timetable" subtitle="Displays saved schedules by day and time." />
            <span className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">
              {timetable.length} saved classes
            </span>
          </div>
          <div className="mt-6">
            <WeeklyTimetableGrid items={timetable} />
          </div>
        </CardShell>

        <CardShell>
          <div className="flex items-center justify-between">
            <CardTitle icon={Calendar} title="Today's Classes" />
            <button onClick={loadTimetable} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Refresh</button>
          </div>
          <div className="mt-5">
            <TimetableList items={displayToday} onDelete={handleDelete} />
          </div>
        </CardShell>
      </section>
    </>
  );
}
