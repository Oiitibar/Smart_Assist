import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { HOME_ROUTES } from "../routes";

export default function FinalCTASection() {
  return (
    <section className="bg-slate-50 px-5 pb-20 dark:bg-slate-900/55 sm:px-6 lg:px-8 lg:pb-24">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-indigo-700 to-violet-700 px-6 py-12 text-center text-white shadow-2xl shadow-indigo-950/20 sm:px-10 sm:py-16">
        <h2 className="text-3xl font-black tracking-[-0.035em] sm:text-5xl">
          Bring your timetable, materials and revision into one place
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
          Create your account, build your personal workspace and start planning
          your study week with less clutter.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to={HOME_ROUTES.register}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-extrabold text-indigo-700 transition hover:bg-indigo-50"
          >
            Register now <ArrowRight size={16} />
          </Link>
          <Link
            to={HOME_ROUTES.login}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 text-sm font-extrabold text-white transition hover:bg-white/15"
          >
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}
