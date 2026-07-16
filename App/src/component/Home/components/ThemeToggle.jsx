import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ darkMode, onToggle, className = "" }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300 ${className}`}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
