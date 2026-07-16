import { aboutItems } from "../data/homeData";
import AboutItem from "./AboutItem";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="scroll-mt-20 bg-white px-5 py-20 dark:bg-slate-950 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-7 sm:p-10 lg:grid-cols-[1.1fr_.9fr] lg:p-12 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
            About the project
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl dark:text-white">
            A full-stack planner made for student organization and revision
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            The application uses React and Tailwind CSS on the frontend, Axios
            for API communication, Node.js and Express for backend logic,
            MongoDB Atlas for account data, and JWT authentication stored in an
            HttpOnly cookie.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {aboutItems.map((item) => (
            <AboutItem key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
