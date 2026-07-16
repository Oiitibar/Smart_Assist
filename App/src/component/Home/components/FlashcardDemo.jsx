import { Brain, Check, FileText } from "lucide-react";

export default function FlashcardDemo() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="absolute -inset-6 rounded-[2rem] bg-white/10 blur-2xl" />
      <div className="relative rounded-[1.75rem] border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
        <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                <Brain size={18} />
              </span>
              <div>
                <p className="text-sm font-extrabold">Database Systems</p>
                <p className="text-[11px] text-slate-400">Card 4 of 20</p>
              </div>
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
              DBMS
            </span>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
              Question
            </p>
            <p className="mt-3 text-base font-extrabold">
              What is a primary key in a relational database?
            </p>
            <div className="my-5 h-px bg-slate-200 dark:bg-slate-800" />
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Answer
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              A field, or group of fields, that uniquely identifies each record
              in a table.
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              className="min-h-10 flex-1 rounded-xl border border-slate-200 text-xs font-bold dark:border-slate-700"
            >
              Review later
            </button>
            <button
              type="button"
              className="min-h-10 flex-1 rounded-xl bg-emerald-500 text-xs font-bold text-white"
            >
              I know this
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
            <FileText size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold">Database_Lecture_Notes.pdf</p>
            <p className="mt-1 text-[10px] text-indigo-200">
              Selected material · Ready to generate
            </p>
          </div>
          <Check size={17} className="text-emerald-300" />
        </div>
      </div>
    </div>
  );
}
