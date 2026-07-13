import { Bell, Menu, Moon, Search, Sun } from "lucide-react";

export default function Topbar({ pageTitle, onMenu, onSearch, user, darkMode, onToggleTheme }) {
  const initials = (user?.name || user?.fullName || "Student")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-7 dark:border-slate-800 dark:bg-slate-950/85">
      <button
        className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 lg:hidden dark:border-slate-700 dark:text-slate-300"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      <div className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Workspace</span>
        <strong className="block truncate text-sm text-slate-900 dark:text-white">{pageTitle}</strong>
      </div>

      <label className="ml-auto hidden h-10 w-full max-w-sm items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 md:flex dark:border-slate-700 dark:bg-slate-900">
        <Search size={17} />
        <input
          className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
          type="search"
          placeholder="Search your workspace"
          onChange={(event) => onSearch?.(event.target.value)}
        />
      </label>

      <button
        type="button"
        onClick={onToggleTheme}
        className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label={darkMode ? "Use light mode" : "Use dark mode"}
      >
        {darkMode ? <Sun size={19} /> : <Moon size={19} />}
      </button>

      {/* <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <Bell size={18} />
        <i className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500 dark:border-slate-900" />
      </button> */}

      <button className="flex items-center gap-2 rounded-xl p-1.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-xs font-bold text-white dark:bg-indigo-500">
          {initials}
        </span>
        <span className="hidden min-w-0 sm:block">
          <strong className="block max-w-[130px] truncate text-xs text-slate-900 dark:text-white">{user?.name || user?.fullName || "Student"}</strong>
          <small className="text-[10px] text-slate-400">Student</small>
        </span>
      </button>
    </header>
  );
}
