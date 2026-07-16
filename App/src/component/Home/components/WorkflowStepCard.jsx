export default function WorkflowStepCard({ icon: Icon, number, title, description }) {
  return (
    <article className="relative rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
          <Icon size={24} />
        </span>
        <span className="text-sm font-black text-indigo-200 dark:text-indigo-800">
          {number}
        </span>
      </div>
      <h3 className="mt-6 text-lg font-extrabold text-slate-950 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </article>
  );
}
