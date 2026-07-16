import { ArrowRight, ChevronRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { flashcardHighlights } from "../data/homeData";
import { HOME_ROUTES } from "../routes";
import FlashcardDemo from "./FlashcardDemo";

export default function AIFlashcardsSection() {
  return (
    <section
      id="ai-flashcards"
      className="scroll-mt-20 overflow-hidden bg-indigo-600 px-5 py-20 text-white dark:bg-indigo-950 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold">
            <Zap size={13} /> Flashcard workflow
          </div>
          <h2 className="mt-5 text-3xl font-black tracking-[-0.035em] sm:text-5xl">
            Turn selected study materials into review cards
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-indigo-100">
            Choose a material you have already uploaded, select a category and
            create a flashcard set. You can also write every question and answer
            manually.
          </p>

          <ul className="mt-6 space-y-3">
            {flashcardHighlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm font-semibold text-indigo-50"
              >
                <ChevronRight
                  size={17}
                  className="mt-0.5 shrink-0 text-indigo-200"
                />
                {item}
              </li>
            ))}
          </ul>

          <Link
            to={HOME_ROUTES.register}
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-extrabold text-indigo-700 transition hover:bg-indigo-50"
          >
            Create flashcards <ArrowRight size={16} />
          </Link>
        </div>

        <FlashcardDemo />
      </div>
    </section>
  );
}
