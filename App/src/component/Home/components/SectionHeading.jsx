export default function SectionHeading({ eyebrow, title, description, align = "center" }) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
          {description}
        </p>
      )}
    </div>
  );
}
