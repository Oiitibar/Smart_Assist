export default function FeatureCard({ icon: Icon, title, description, iconClass }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800">
      <span className={`grid h-11 w-11 place-items-center rounded-2xl ${iconClass}`}>
        <Icon size={21} />
      </span>
      <h3 className="mt-5 text-lg font-extrabold text-slate-950 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </article>
  );
}
