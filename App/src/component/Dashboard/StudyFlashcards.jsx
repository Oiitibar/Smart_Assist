import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { EmptyState, ProgressBar } from "./DashboardShared";
import {
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
  selectClass,
} from "./ui";

export default function StudyFlashcards({
  category,
  materials = [],
  cards = [],
  onGenerateFlashcards,
  onReviewFlashcard,
  onDeleteFlashcard,
  onNavigate,
}) {
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [generateCount, setGenerateCount] = useState(5);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState("");

  useEffect(() => {
    if (!materials.some((item) => item.id === selectedMaterialId)) {
      setSelectedMaterialId(materials[0]?.id || "");
    }
  }, [materials, selectedMaterialId]);

  const materialCards = useMemo(
    () => cards.filter((card) => card.materialId === selectedMaterialId),
    [cards, selectedMaterialId],
  );

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [selectedMaterialId, materialCards.length]);

  const current = materialCards.length
    ? materialCards[index % materialCards.length]
    : null;
  const knownCount = materialCards.filter(
    (card) => card.reviewed && card.correct,
  ).length;
  const currentKnown = Boolean(current?.reviewed && current?.correct);

  const move = (direction) => {
    if (!materialCards.length) return;
    setIndex(
      (value) =>
        (value + direction + materialCards.length) % materialCards.length,
    );
    setFlipped(false);
  };

  const generate = async () => {
    if (!category?.id || !selectedMaterialId || generating) return;
    setGenerating(true);
    try {
      await onGenerateFlashcards?.(
        category.id,
        selectedMaterialId,
        Number(generateCount),
      );
      setIndex(0);
      setFlipped(false);
    } finally {
      setGenerating(false);
    }
  };

  const toggleKnown = async () => {
    if (!current || savingReview) return;
    setSavingReview(true);
    try {
      await onReviewFlashcard?.(current, !currentKnown);
    } finally {
      setSavingReview(false);
    }
  };

  const deleteCurrent = async () => {
    if (!current || deletingCardId) return;
    if (!window.confirm("Delete this flashcard permanently?")) return;
    setDeletingCardId(current.id);
    try {
      await onDeleteFlashcard?.(current);
      setFlipped(false);
    } finally {
      setDeletingCardId("");
    }
  };

  if (!materials.length) {
    return (
      <section className={`${panelClass} grid min-h-96 place-items-center p-6`}>
        <EmptyState
          title={`No materials in ${category?.name || "this category"}`}
          message="Add a material to this category before generating flashcards."
          action={
            <button
              className={primaryButtonClass}
              onClick={() => onNavigate?.("material")}
            >
              Add material
            </button>
          }
        />
      </section>
    );
  }

  const selectedMaterial = materials.find(
    (item) => item.id === selectedMaterialId,
  );

  return (
    <div className="space-y-4">
      <section className={`${panelClass} p-4`}>
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_130px_auto] lg:items-end">
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Material in {category?.name}
            <select
              className={selectClass}
              value={selectedMaterialId}
              onChange={(event) => setSelectedMaterialId(event.target.value)}
            >
              {materials.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Cards
            <select
              className={selectClass}
              value={generateCount}
              onChange={(event) => setGenerateCount(Number(event.target.value))}
            >
              <option value="3">3 cards</option>
              <option value="5">5 cards</option>
              <option value="10">10 cards</option>
            </select>
          </label>

          <button
            className={primaryButtonClass}
            onClick={generate}
            disabled={generating}
          >
            <Sparkles size={17} />
            {generating ? "Generating..." : "Generate with AI"}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Only flashcards generated from the selected material are shown below.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <article className={`${panelClass} min-w-0 p-4 sm:p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400">
                Review deck
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                {category?.emoji} {selectedMaterial?.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {materialCards.length
                  ? `${index + 1} / ${materialCards.length}`
                  : "0 cards"}
              </span>
              {current && (
                <button
                  type="button"
                  onClick={deleteCurrent}
                  disabled={Boolean(deletingCardId)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60 dark:border-rose-900/60 dark:bg-slate-900 dark:text-rose-300"
                >
                  <Trash2 size={15} />
                  {deletingCardId ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </div>

          {!materialCards.length ? (
            <div className="grid min-h-[390px] place-items-center">
              <EmptyState
                title="No flashcards for this material"
                message="Generate 3, 5, or 10 grounded cards from the selected material."
                action={
                  <button className={primaryButtonClass} onClick={generate}>
                    <Sparkles size={17} /> Generate cards
                  </button>
                }
              />
            </div>
          ) : (
            <>
              <div className="relative mx-auto my-5 h-[310px] w-full max-w-[620px] [perspective:1400px] sm:h-[340px]">
                <i className="absolute inset-x-5 bottom-0 top-5 rotate-1 rounded-3xl border border-indigo-100 bg-indigo-50/70 dark:border-indigo-900/50 dark:bg-indigo-500/5" />
                <i className="absolute inset-x-2 bottom-2 top-2 -rotate-1 rounded-3xl border border-indigo-100 bg-indigo-50/90 dark:border-indigo-900/50 dark:bg-indigo-500/10" />
                <button
                  type="button"
                  className={`absolute inset-0 z-10 rounded-3xl border-0 bg-transparent p-0 shadow-xl transition-transform duration-500 [transform-style:preserve-3d] ${
                    flipped ? "[transform:rotateY(180deg)]" : ""
                  }`}
                  onClick={() => setFlipped((value) => !value)}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-6 text-center [backface-visibility:hidden] dark:border-indigo-900/50 dark:from-slate-900 dark:to-indigo-950/40 sm:p-10">
                    <span className="absolute top-5 rounded-lg bg-indigo-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                      Question
                    </span>
                    <h3 className="max-w-lg text-xl font-bold leading-8 text-slate-950 sm:text-2xl dark:text-white">
                      {current?.question}
                    </h3>
                    <p className="absolute bottom-5 text-xs text-slate-400">
                      Click the card to reveal the answer
                    </p>
                  </div>

                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-indigo-200 bg-indigo-600 p-6 text-center text-white [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-10">
                    <span className="absolute top-5 rounded-lg bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">
                      Answer
                    </span>
                    <p className="max-w-lg text-base font-semibold leading-7 sm:text-lg">
                      {current?.answer}
                    </p>
                    {current?.sourceReference && (
                      <p className="absolute bottom-5 max-w-[90%] truncate text-xs text-indigo-100">
                        Source: {current.sourceReference}
                      </p>
                    )}
                  </div>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  className={secondaryButtonClass}
                  onClick={() => move(-1)}
                >
                  <ArrowLeft size={17} /> Previous
                </button>
                <button
                  className={secondaryButtonClass}
                  onClick={() => setFlipped((value) => !value)}
                >
                  <RotateCcw size={17} /> Flip
                </button>
                <button
                  className={secondaryButtonClass}
                  onClick={() => move(1)}
                >
                  Next <ArrowRight size={17} />
                </button>
              </div>
            </>
          )}
        </article>

        <aside className={`${panelClass} p-4`}>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
              <FileText size={18} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Material progress
              </h3>
              <p className="text-[11px] text-slate-400">
                Saved review state
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-300">
              <span>Mastered</span>
              <span>
                {knownCount}/{materialCards.length}
              </span>
            </div>
            <ProgressBar
              value={
                materialCards.length
                  ? (knownCount / materialCards.length) * 100
                  : 0
              }
            />
          </div>

          {current && (
            <button
              className={`mt-5 w-full ${
                currentKnown ? secondaryButtonClass : primaryButtonClass
              }`}
              onClick={toggleKnown}
              disabled={savingReview}
            >
              <Check size={17} />
              {savingReview
                ? "Saving..."
                : currentKnown
                  ? "Mark as learning"
                  : "I know this card"}
            </button>
          )}
        </aside>
      </section>
    </div>
  );
}
