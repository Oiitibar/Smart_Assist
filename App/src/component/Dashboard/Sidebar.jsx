import {
  LayoutDashboard,
  Calendar,
  Layers,
  BookOpen,
  Settings,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Calendar, label: "Timetable", id: "timetable" },
  { icon: Layers, label: "Flashcard", id: "flashcard" },
  { icon: BookOpen, label: "Material", id: "material" },
  { icon: Settings, label: "Setting", id: "setting" },
];

function NavItem({ item, active, collapsed, onClick }) {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] mb-1 transition-all text-left ${
        collapsed ? "justify-center px-0" : ""
      } ${
        active
          ? "bg-white text-indigo-600 font-semibold shadow-sm"
          : "text-white/75 hover:bg-white/15 hover:text-white"
      }`}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </button>
  );
}

export default function Sidebar({
  activePage = "dashboard",
  onNavigate,
  collapsed = false,
  onToggle,
}) {
  return (
    <aside
      className={`flex flex-col h-full bg-indigo-500 min-h-screen shrink-0 transition-all duration-300 ease-in-out ${
        collapsed ? "w-[68px]" : "w-56"
      }`}
    >
      <div
        className={`flex items-center gap-3 px-5 py-5 border-b border-white/15 ${
          collapsed ? "px-0 justify-center" : "justify-between"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/25 flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-white" />
          </div>

          {!collapsed && (
            <span className="text-white font-semibold text-[15px] whitespace-nowrap">
              Smart Assist
            </span>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-colors shrink-0"
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="px-3 pt-3">
          <button
            onClick={onToggle}
            aria-label="Expand sidebar"
            className="w-full h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-colors"
          >
            <PanelLeftOpen size={16} />
          </button>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 overflow-hidden">
        {!collapsed && (
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 px-2 pb-2">
            Menu
          </p>
        )}

        {navItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={activePage === item.id}
            collapsed={collapsed}
            onClick={() => onNavigate?.(item.id)}
          />
        ))}
      </nav>

      {!collapsed ? (
        <div className="px-3 py-4 border-t border-white/15">
          <div className="bg-white/15 rounded-xl p-3">
            <span className="inline-flex items-center gap-1 bg-white/25 text-white text-[10px] font-semibold px-2 py-1 rounded-full mb-2">
              <Sparkles size={11} /> Today Goal
            </span>

            <p className="text-white/85 text-xs leading-relaxed mb-3">
              Finish 4 study actions and keep your learning streak alive.
            </p>

            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-white rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        <div className="px-3 py-4 border-t border-white/15 flex justify-center">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
        </div>
      )}
    </aside>
  );
}
