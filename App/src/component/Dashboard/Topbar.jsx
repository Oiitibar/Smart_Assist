import { Search, Bell } from "lucide-react";

export default function Topbar({ userName = "Student", initials = "KL" }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Good morning, {userName}
        </h1>

        <p className="text-[12.5px] text-gray-500 mt-0.5">
          Here's your study overview and plan for today.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 min-w-[200px]">
          <Search size={16} className="text-gray-400" />

          <input
            type="text"
            placeholder="Search subjects, materials…"
            className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder:text-gray-400"
            aria-label="Search subjects and materials"
          />
        </div>

        {/* <button
          className="relative w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
          aria-label="3 notifications"
        >
          <Bell size={18} className="text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white" />
        </button> */}

        <button
          className="w-9 h-9 rounded-full bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center hover:bg-indigo-600 transition-colors"
          aria-label="User menu"
        >
          {initials}
        </button>
      </div>
    </header>
  );
}