export default function AboutItem({ icon: Icon, title, description }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-950">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
        <Icon size={19} />
      </span>
      <div>
        <p className="text-sm font-extrabold text-slate-950 dark:text-white">
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}
