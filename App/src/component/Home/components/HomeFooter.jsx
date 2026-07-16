import { Link } from "react-router-dom";
import { navigationLinks } from "../data/homeData";
import { HOME_ROUTES } from "../routes";
import BrandLogo from "./BrandLogo";

export default function HomeFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-10 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.4fr_.6fr_.6fr]">
        <div>
          <BrandLogo compact />
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            A secure full-stack academic planning system for schedules, tasks,
            materials and flashcard revision.
          </p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            Product
          </p>
          <div className="mt-4 grid gap-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {navigationLinks.slice(0, 3).map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            Account
          </p>
          <div className="mt-4 grid gap-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link
              to={HOME_ROUTES.login}
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Log in
            </Link>
            <Link
              to={HOME_ROUTES.register}
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Register
            </Link>
            <Link
              to={HOME_ROUTES.dashboard}
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-9 flex max-w-7xl flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <p>© {new Date().getFullYear()} Smart Student Planner.</p>
        <p>React · Tailwind CSS · Node.js · Express · MongoDB</p>
      </div>
    </footer>
  );
}
