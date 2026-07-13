import { Inbox, X } from "lucide-react";
import {
  iconButtonClass,
  panelClass,
  primaryButtonClass,
  sectionKickerClass,
} from "./ui";

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <span className={sectionKickerClass}>{eyebrow}</span>}
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {action && <div className="w-full sm:w-auto [&>button]:w-full sm:[&>button]:w-auto">{action}</div>}
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="grid max-w-sm justify-items-center px-5 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
        <Inbox size={24} />
      </span>
      <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Modal({ title, description, children, onClose, maxWidth = "max-w-xl" }) {
  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className={`${panelClass} ${maxWidth} max-h-[calc(100vh-32px)] w-full overflow-y-auto p-5 shadow-2xl`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
          <button className={iconButtonClass} onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function ProgressBar({ value, color = "#4f46e5" }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-label={`${value}% complete`}>
      <span
        className="block h-full rounded-full transition-[width] duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }}
      />
    </div>
  );
}

export { iconButtonClass, panelClass, primaryButtonClass };
