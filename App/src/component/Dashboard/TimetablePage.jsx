import {
  ArrowRight,
  Brain,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Target,
} from "lucide-react";
import {
  CardTitle,
  Field,
  PageHeader,
  SelectBox,
  TextInput,
  TIMETABLE,
  TimetableList,
  WeeklyTimetableGrid,
} from "./DashboardShared";

export default function TimetablePage({ setActivePage }) {
  return (
    <>
      <PageHeader
        title="Timetable"
        subtitle="Schedule, input, and display your school classes for the week."
        action={
          <button
            onClick={() => setActivePage("dashboard")}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
          >
            Back to dashboard <ArrowRight size={16} />
          </button>
        }
      />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <CardTitle
            icon={Calendar}
            title="Add Class Schedule"
            subtitle="Input timetable data that will be displayed on today and weekly views."
          />

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Subject">
              <SelectBox
                placeholder="Select subject"
                options={["ICT", "Mathematics", "Physics", "English"]}
              />
            </Field>
            <Field label="Day">
              <SelectBox
                placeholder="Select day"
                options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]}
              />
            </Field>
            <Field label="Start Time">
              <TextInput value="09:00 AM" icon={Clock} />
            </Field>
            <Field label="End Time">
              <TextInput value="10:00 AM" icon={Clock} />
            </Field>
            <Field label="Room">
              <TextInput placeholder="e.g., Room 101" />
            </Field>
            <Field label="Teacher">
              <TextInput placeholder="e.g., Dr. Smith" />
            </Field>
          </div>

          <div className="mt-5 flex justify-end">
            <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
              <Plus size={16} /> Save Schedule
            </button>
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <CardTitle
            icon={Target}
            title="Today's Focus"
            subtitle="AI suggestion from the next class and related materials."
            iconClass="bg-violet-50 text-violet-600"
          />

          <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-indigo-500">Next Class</p>
                <h3 className="mt-2 text-xl font-bold text-slate-950">Data Structures</h3>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <Clock size={15} /> 10:00 AM – 11:30 AM
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={15} /> Room 201
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 shadow-sm">
                In 45 mins
              </span>
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
                  Review linked lists and tree traversal notes, then try 5 related flashcards before class.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle
              icon={Calendar}
              title="Weekly Timetable"
              subtitle="Display saved class schedules by day and time."
            />
            <div className="flex items-center gap-2">
              <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                Today
              </button>
              <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                Week of May 19 – May 25
              </button>
            </div>
          </div>

          <div className="mt-6">
            <WeeklyTimetableGrid />
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <CardTitle icon={Calendar} title="Today's Classes" />
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              View All
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {TIMETABLE.map((item) => (
              <div key={item.subject} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-950">{item.subject}</h3>
                    <p className="mt-1 text-sm text-slate-500">{item.range}</p>
                    <p className="text-xs text-slate-400">{item.location}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      item.live
                        ? "bg-indigo-50 text-indigo-600"
                        : item.status === "Next"
                        ? "bg-violet-50 text-violet-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.status === "Now" ? "Current" : item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </>
  );
}
