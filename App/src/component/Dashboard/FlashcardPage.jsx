import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Layers3,
  Plus,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { EmptyState, Modal, PageHeader, ProgressBar } from "./DashboardShared";
import {
  inputClass,
  labelClass,
  pageClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
  selectClass,
  textareaClass,
} from "./ui";

export default function FlashcardPage({
  categories,
  materials,
  flashcards,
  onAddFlashcard,
  onGenerateFlashcards,
  onReviewFlashcard,
  onNavigate,
}) {
  const [selectedId, setSelectedId] = useState(categories[0]?.id || "");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [generateCount, setGenerateCount] = useState(5);
  const [showManual, setShowManual] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [savingManual, setSavingManual] = useState(false);
  const [savingReview, setSavingReview] = useState(false);

  useEffect(() => {
    if (!categories.some((item) => item.id === selectedId)) setSelectedId(categories[0]?.id || "");
  }, [categories, selectedId]);

  const category = categories.find((item) => item.id === selectedId);
  const cards = useMemo(() => flashcards[selectedId] || [], [flashcards, selectedId]);
  const current = cards.length ? cards[index % cards.length] : null;
  const categoryMaterials = useMemo(
    () => materials.filter((item) => item.categoryId === selectedId),
    [materials, selectedId],
  );

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    setSelectedMaterialId(categoryMaterials[0]?.id || "");
  }, [selectedId]);

  useEffect(() => {
    setMastered(cards.filter((card) => card.reviewed && card.correct).map((card) => card.id));
  }, [selectedId, cards]);

  useEffect(() => {
    if (!categoryMaterials.some((item) => item.id === selectedMaterialId)) {
      setSelectedMaterialId(categoryMaterials[0]?.id || "");
    }
  }, [categoryMaterials, selectedMaterialId]);

  const move = (direction) => {
    if (!cards.length) return;
    setIndex((value) => (value + direction + cards.length) % cards.length);
    setFlipped(false);
  };

  const submitManual = async (event) => {
    event.preventDefault();
    if (!selectedId || !question.trim() || !answer.trim() || savingManual) return;
    setSavingManual(true);
    try {
      await onAddFlashcard(selectedId, {
        question: question.trim(),
        answer: answer.trim(),
        source: "Manual",
      });
      setQuestion("");
      setAnswer("");
      setShowManual(false);
    } finally {
      setSavingManual(false);
    }
  };

  const generate = async () => {
    if (!selectedId || !selectedMaterialId) return;
    setGenerating(true);
    await Promise.resolve(onGenerateFlashcards(selectedId, selectedMaterialId, Number(generateCount)));
    setGenerating(false);
    setIndex(0);
    setFlipped(false);
  };

  if (!categories.length) {
    return (
      <div className={pageClass}>
        <PageHeader title="Flashcards" description="Review cards by subject and generate them from saved materials." />
        <section className={`${panelClass} grid min-h-80 place-items-center`}>
          <EmptyState
            title="Create a category first"
            message="Add a subject category and material before generating flashcards."
            action={<button className={primaryButtonClass} onClick={() => onNavigate("material")}>Go to materials</button>}
          />
        </section>
      </div>
    );
  }

  const currentMastered = current ? (current.reviewed && current.correct) || mastered.includes(current.id) : false;

  const toggleKnown = async () => {
    if (!current || savingReview) return;
    const nextKnown = !currentMastered;
    setSavingReview(true);
    setMastered((items) => nextKnown
      ? [...new Set([...items, current.id])]
      : items.filter((id) => id !== current.id));
    try {
      await onReviewFlashcard?.(current, nextKnown);
    } finally {
      setSavingReview(false);
    }
  };

  return (
    <div className={pageClass}>
      <PageHeader
        eyebrow="Active recall"
        title="Flashcards"
        description="Review by subject, generate cards from an existing material, or create a card manually."
        action={
          <button className={secondaryButtonClass} onClick={() => setShowManual(true)}>
            <Plus size={17} /> Manual card
          </button>
        }
      />

      <div className="mb-3 flex gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-slate-900" role="tablist">
        {categories.map((item) => {
          const active = selectedId === item.id;
          return (
            <button
              role="tab"
              aria-selected={active}
              className={`flex min-w-max items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                  : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
              onClick={() => setSelectedId(item.id)}
              key={item.id}
            >
              <span>{item.emoji}</span>
              {item.name}
              <small className={`grid h-5 min-w-5 place-items-center rounded-md px-1 text-[10px] ${active ? "bg-white dark:bg-slate-900" : "bg-slate-100 dark:bg-slate-800"}`}>
                {flashcards[item.id]?.length || 0}
              </small>
            </button>
          );
        })}
      </div>

      <section className={`${panelClass} mb-4 p-3 sm:p-4`}>
        <div className="grid gap-3 lg:grid-cols-[minmax(180px,1fr)_minmax(220px,1.4fr)_110px_auto] lg:items-end">
          <label className={labelClass}>
            Subject category
            <select className={selectClass} value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              {categories.map((item) => <option key={item.id} value={item.id}>{item.emoji} {item.name}</option>)}
            </select>
          </label>

          <label className={labelClass}>
            Select saved material
            <select
              className={selectClass}
              value={selectedMaterialId}
              onChange={(event) => setSelectedMaterialId(event.target.value)}
              disabled={!categoryMaterials.length}
            >
              {!categoryMaterials.length && <option value="">No material in this category</option>}
              {categoryMaterials.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          </label>

          <label className={labelClass}>
            Cards
            <select className={selectClass} value={generateCount} onChange={(event) => setGenerateCount(event.target.value)}>
              <option value="3">3 cards</option><option value="5">5 cards</option><option value="10">10 cards</option>
            </select>
          </label>

          <button className={primaryButtonClass} onClick={generate} disabled={!selectedMaterialId || generating}>
            <Sparkles size={17} /> {generating ? "Generating..." : "Generate with AI"}
          </button>
        </div>
        {!categoryMaterials.length && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">
            Add a material to {category?.name} before using AI generation.
          </p>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <article className={`${panelClass} min-w-0 p-4 sm:p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400">Review deck</p>
              <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{category?.emoji} {category?.name}</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              {cards.length ? `${index + 1} / ${cards.length}` : "0 cards"}
            </span>
          </div>

          {cards.length === 0 ? (
            <div className="grid min-h-[390px] place-items-center">
              <EmptyState
                title={`No ${category?.name} cards yet`}
                message="Choose one of your saved materials above for AI generation, or add a manual card."
                action={<button className={secondaryButtonClass} onClick={() => setShowManual(true)}>Create manual card</button>}
              />
            </div>
          ) : (
            <>
              <div className="relative mx-auto my-5 h-[310px] w-full max-w-[620px] [perspective:1400px] sm:h-[340px]">
                <i className="absolute inset-x-5 bottom-0 top-5 rotate-1 rounded-3xl border border-indigo-100 bg-indigo-50/70 dark:border-indigo-900/50 dark:bg-indigo-500/5" />
                <i className="absolute inset-x-2 bottom-2 top-2 -rotate-1 rounded-3xl border border-indigo-100 bg-indigo-50/90 dark:border-indigo-900/50 dark:bg-indigo-500/10" />
                <button
                  className={`absolute inset-0 z-10 rounded-3xl border-0 bg-transparent p-0 shadow-xl transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
                  onClick={() => setFlipped((value) => !value)}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-6 text-center [backface-visibility:hidden] dark:border-indigo-900/50 dark:from-slate-900 dark:to-indigo-950/40 sm:p-10">
                    <span className="absolute top-5 rounded-lg bg-indigo-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">Question</span>
                    <h3 className="max-w-lg text-xl font-bold leading-8 text-slate-950 sm:text-2xl dark:text-white">{current?.question}</h3>
                    <small className="absolute bottom-5 flex items-center gap-1.5 text-[11px] text-slate-400"><RotateCcw size={14} /> Tap to reveal the answer</small>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-indigo-500 bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 text-center text-white [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-10">
                    <span className="absolute top-5 rounded-lg bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">Answer</span>
                    <p className="max-w-lg text-base font-semibold leading-7 sm:text-xl">{current?.answer}</p>
                    <small className="absolute bottom-5 flex items-center gap-1.5 text-[11px] text-white/70"><RotateCcw size={14} /> Tap to see the question</small>
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <button className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" onClick={() => move(-1)} aria-label="Previous card">
                  <ArrowLeft size={20} />
                </button>
                <button
                  className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
                    currentMastered
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  }`}
                  onClick={toggleKnown}
                  disabled={savingReview}
                >
                  <Check size={17} /> {savingReview ? "Saving..." : currentMastered ? "Mastered" : "Mark as known"}
                </button>
                <button className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" onClick={() => move(1)} aria-label="Next card">
                  <ArrowRight size={20} />
                </button>
              </div>

              <div className="mx-auto mt-4 max-w-[620px] rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="mb-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Deck progress</span><strong>{mastered.length} of {cards.length} mastered</strong>
                </div>
                <ProgressBar value={(mastered.length / cards.length) * 100} color={category?.color || "#4f46e5"} />
              </div>
            </>
          )}
        </article>

        <aside className={`${panelClass} h-fit p-4`}>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"><Layers3 size={19} /></span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Deck details</h3>
              <p className="text-[11px] text-slate-400">Current subject summary</p>
            </div>
          </div>
          <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            <div className="flex items-center justify-between p-3 text-xs"><span className="text-slate-500 dark:text-slate-400">Cards</span><strong className="text-slate-900 dark:text-white">{cards.length}</strong></div>
            <div className="flex items-center justify-between p-3 text-xs"><span className="text-slate-500 dark:text-slate-400">Materials</span><strong className="text-slate-900 dark:text-white">{categoryMaterials.length}</strong></div>
            <div className="flex items-center justify-between p-3 text-xs"><span className="text-slate-500 dark:text-slate-400">Known</span><strong className="text-slate-900 dark:text-white">{mastered.length}</strong></div>
          </div>
          {current?.source && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
              <FileText size={16} className="mt-0.5 shrink-0 text-indigo-500" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Current source</p>
                <p className="mt-0.5 truncate text-xs font-bold text-slate-800 dark:text-slate-100">{current.source}</p>
              </div>
            </div>
          )}
        </aside>
      </section>

      {showManual && (
        <Modal title="Create a manual flashcard" description="Save a custom question and answer to the selected subject." onClose={() => setShowManual(false)}>
          <form className="grid gap-4" onSubmit={submitManual}>
            <label className={labelClass}>
              Category
              <select className={selectClass} value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
                {categories.map((item) => <option value={item.id} key={item.id}>{item.emoji} {item.name}</option>)}
              </select>
            </label>
            <label className={labelClass}>
              Question
              <textarea className={textareaClass} rows="4" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What do you want to remember?" autoFocus />
            </label>
            <label className={labelClass}>
              Answer
              <textarea className={textareaClass} rows="5" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Write a clear answer..." />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" className={secondaryButtonClass} onClick={() => setShowManual(false)}>Cancel</button>
              <button className={primaryButtonClass} type="submit" disabled={savingManual}><Plus size={17} /> {savingManual ? "Saving..." : "Add card"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
