import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { navigationLinks } from "../data/homeData";
import { HOME_ROUTES } from "../routes";
import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";

export default function HomeHeader({ darkMode, onToggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-17 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <BrandLogo />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {navigationLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle darkMode={darkMode} onToggle={onToggleTheme} />

          <Link
            to={HOME_ROUTES.login}
            className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Log in
          </Link>

          <Link
            to={HOME_ROUTES.register}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Get started <ArrowRight size={15} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-5 py-5 shadow-lg md:hidden dark:border-slate-800 dark:bg-slate-950">
          <nav className="mx-auto grid max-w-7xl gap-2" aria-label="Mobile navigation">
            {navigationLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                {item.label}
              </a>
            ))}

            <div className="mt-2 grid grid-cols-[44px_1fr_1fr] gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
              <ThemeToggle
                darkMode={darkMode}
                onToggle={onToggleTheme}
                className="h-11 w-full bg-transparent dark:bg-transparent"
              />

              <Link
                to={HOME_ROUTES.login}
                onClick={closeMobileMenu}
                className="grid h-11 place-items-center rounded-xl border border-slate-200 text-sm font-bold dark:border-slate-700"
              >
                Log in
              </Link>

              <Link
                to={HOME_ROUTES.register}
                onClick={closeMobileMenu}
                className="grid h-11 place-items-center rounded-xl bg-indigo-600 text-sm font-bold text-white dark:bg-indigo-500"
              >
                Register
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
