import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { HOME_ROUTES } from "../routes";

export default function BrandLogo({ compact = false }) {
  return (
    <Link
      to={HOME_ROUTES.home}
      className="inline-flex items-center gap-2.5"
      aria-label="Smart Student Planner home"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 dark:bg-indigo-500">
        <GraduationCap size={19} />
      </span>

      <span
        className={`font-extrabold tracking-tight text-slate-950 dark:text-white ${
          compact ? "text-sm" : "text-[15px] sm:text-base"
        }`}
      >
        Smart Student{" "}
        <span className="text-indigo-600 dark:text-indigo-400">Planner</span>
      </span>
    </Link>
  );
}
