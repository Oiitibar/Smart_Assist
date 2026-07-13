import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  Layers3,
  LogOut,
  Settings,
  Sparkles,
  X,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "timetable", label: "Timetable", icon: CalendarDays },
  { id: "flashcard", label: "Flashcards", icon: Layers3 },
  { id: "material", label: "Materials", icon: BookOpen },
  { id: "setting", label: "Settings", icon: Settings },
];

export default function Sidebar({ activePage, onNavigate, mobileOpen, onClose, user, onLogout }) {
  const initials = (user?.name || user?.fullName || "Student")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navigate = (page) => {
    onNavigate(page);
    onClose?.();
  };

  return (
    <>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[236px] flex-col border-r border-indigo-400/20 bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-xl transition-transform duration-300 dark:from-slate-950 dark:to-slate-900 dark:border-slate-800 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[68px] items-center justify-between border-b border-white/15 px-4">
          <button className="flex items-center gap-3 text-left" onClick={() => navigate("dashboard")}>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 shadow-inner">
              <GraduationCap size={22} />
            </span>
            <span>
              <strong className="block text-sm font-bold">Smart Assist</strong>
              <small className="text-[11px] text-white/65">Student planner</small>
            </span>
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 lg:hidden" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">Workspace</p>
          <div className="space-y-1">
            {navItems.map(({ id, label, icon: Icon }) => {
              const active = activePage === id;
              return (
                <button
                  key={id}
                  onClick={() => navigate(id)}
                  className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition ${
                    active
                      ? "bg-white text-indigo-700 shadow-sm dark:bg-indigo-500 dark:text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="m-3 rounded-2xl border border-white/15 bg-white/10 p-3.5">
          <div className="flex items-start gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/15">
              <Sparkles size={16} />
            </span>
            <div>
              <strong className="text-xs">Study smarter today</strong>
              <p className="mt-1 text-[11px] leading-5 text-white/65">Review one deck and finish your priority tasks.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/15 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/10 p-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-xs font-bold text-indigo-700">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-xs">{user?.name || user?.fullName || "Student"}</strong>
              <small className="block truncate text-[10px] text-white/55">{user?.email || "student@example.com"}</small>
            </div>
          </div>
          <button
            className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            onClick={onLogout}
          >
            <LogOut size={17} /> Log out
          </button>
        </div>
      </aside>
    </>
  );
}
