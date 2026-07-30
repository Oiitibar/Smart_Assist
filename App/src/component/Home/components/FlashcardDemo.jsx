import {
  Bot,
  Brain,
  CheckCircle2,
  FileText,
  Languages,
  Maximize2,
  Search,
  Sparkles,
} from "lucide-react";

export default function StudyWorkspaceDemo() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -inset-6 rounded-[2rem] bg-white/10 blur-2xl" />
      <div className="relative rounded-[1.75rem] border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
        <div className="overflow-hidden rounded-2xl bg-slate-50 text-slate-900 shadow-2xl dark:bg-slate-950 dark:text-white">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="text-xs font-extrabold">Study workspace</p>
              <p className="text-[9px] text-slate-400">Database · Company Database.pdf</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[9px] font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
              Category selected
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 border-b border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
            {[
              [FileText, "Materials", true],
              [Brain, "Flashcards", false],
              [CheckCircle2, "Quiz", false],
            ].map(([Icon, label, active]) => (
              <div
                key={label}
                className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[9px] font-bold ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <Icon size={12} /> {label}
              </div>
            ))}
          </div>

          <div className="grid min-h-[315px] gap-3 p-3 sm:grid-cols-[1.15fr_.85fr]">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-800">
                <span className="rounded-md bg-rose-50 px-2 py-1 text-[8px] font-black text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                  PDF
                </span>
                <p className="min-w-0 flex-1 truncate text-[9px] font-bold">
                  Company Database.pdf
                </p>
                <Search size={12} className="text-slate-400" />
                <Maximize2 size={12} className="text-slate-400" />
              </div>

              <div className="m-3 rounded-lg bg-slate-100 p-3 dark:bg-slate-950">
                <div className="mx-auto min-h-[205px] max-w-[220px] rounded-md bg-white p-4 shadow-sm dark:bg-slate-900">
                  <div className="h-2 w-24 rounded bg-slate-800 dark:bg-slate-200" />
                  <div className="mt-4 space-y-2">
                    <div className="h-1.5 w-full rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-1.5 w-11/12 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-1.5 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-900 dark:bg-indigo-500/10">
                    <div className="h-1.5 w-20 rounded bg-indigo-300 dark:bg-indigo-700" />
                    <div className="mt-2 h-12 rounded bg-white dark:bg-slate-800" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-1.5 w-full rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-1.5 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              </div>
            </section>

            <aside className="flex flex-col rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                  <Bot size={16} />
                </span>
                <div>
                  <p className="text-[10px] font-extrabold">Material AI</p>
                  <p className="text-[8px] text-slate-400">Uses the whole selected file</p>
                </div>
              </div>

              <div className="mt-3 grid gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2 text-[8px] font-bold dark:border-slate-700">
                  <Languages size={12} className="text-indigo-500" /> Explain in English
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2 text-[8px] font-bold dark:border-slate-700">
                  <Languages size={12} className="text-indigo-500" /> မြန်မာဘာသာဖြင့် ရှင်းပြရန်
                </div>
              </div>

              <div className="mt-3 flex-1 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-950">
                <div className="flex gap-2">
                  <Sparkles size={12} className="mt-0.5 shrink-0 text-indigo-500" />
                  <p className="text-[8px] leading-4 text-slate-600 dark:text-slate-300">
                    Ask a question and receive an explanation grounded in this material.
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <strong className="block text-[11px]">15</strong>
                  <span className="text-[7px]">flashcards</span>
                </div>
                <div className="rounded-lg bg-violet-50 p-2 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                  <strong className="block text-[11px]">8</strong>
                  <span className="text-[7px]">quiz questions</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
