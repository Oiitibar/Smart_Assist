import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Trash2,
  Trophy,
} from "lucide-react";
import { EmptyState, ProgressBar } from "./DashboardShared";
import {
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
  selectClass,
} from "./ui";

export default function StudyQuiz({
  category,
  materials = [],
  quizSets = [],
  onGenerateQuiz,
  onSubmitQuiz,
  onDeleteQuiz,
  onNavigate,
}) {
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!materials.some((item) => item.id === selectedMaterialId)) {
      setSelectedMaterialId(materials[0]?.id || "");
    }
  }, [materials, selectedMaterialId]);

  const materialQuizSets = useMemo(
    () => quizSets.filter((set) => set.materialId === selectedMaterialId),
    [quizSets, selectedMaterialId],
  );

  const materialQuizIds = useMemo(
    () => materialQuizSets.map((set) => set.id).join("|"),
    [materialQuizSets],
  );

  useEffect(() => {
    if (!materialQuizSets.some((set) => set.id === selectedQuizId)) {
      setSelectedQuizId(materialQuizSets[0]?.id || "");
    }
  }, [materialQuizIds, materialQuizSets, selectedQuizId]);

  useEffect(() => {
    setQuestionIndex(0);
    setAnswers({});
    setResult(null);
  }, [selectedMaterialId, selectedQuizId]);

  const activeQuiz = materialQuizSets.find(
    (set) => set.id === selectedQuizId,
  );
  const questions = activeQuiz?.questions || [];
  const current = questions[questionIndex] || null;
  const answeredCount = Object.keys(answers).length;

  const generate = async () => {
    if (!category?.id || !selectedMaterialId || generating) return;
    setGenerating(true);
    try {
      const created = await onGenerateQuiz?.(
        category.id,
        selectedMaterialId,
      );
      if (created?.id || created?._id) {
        setSelectedQuizId(created.id || created._id);
      }
      setQuestionIndex(0);
      setAnswers({});
      setResult(null);
    } finally {
      setGenerating(false);
    }
  };

  const submit = async () => {
    if (!activeQuiz || submitting || answeredCount !== questions.length) return;
    setSubmitting(true);
    try {
      const response = await onSubmitQuiz?.(
        activeQuiz.id,
        questions.map((question) => ({
          questionId: question.id,
          selectedOptionIndex: answers[question.id],
        })),
      );
      setResult(response);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteQuiz = async () => {
    if (!activeQuiz || deleting) return;
    if (!window.confirm("Delete this stored quiz and its attempt history?")) {
      return;
    }
    setDeleting(true);
    try {
      await onDeleteQuiz?.(activeQuiz.id);
      setSelectedQuizId("");
      setAnswers({});
      setResult(null);
    } finally {
      setDeleting(false);
    }
  };

  const resetAttempt = () => {
    setQuestionIndex(0);
    setAnswers({});
    setResult(null);
  };

  if (!materials.length) {
    return (
      <section className={`${panelClass} grid min-h-96 place-items-center p-6`}>
        <EmptyState
          title={`No materials in ${category?.name || "this category"}`}
          message="Add a material before asking AI to generate a quiz."
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

  const reviewItem = result?.review?.find(
    (item) => String(item.questionId) === String(current?.id),
  );
  const selectedOption = current ? answers[current.id] : undefined;

  return (
    <div className="space-y-4">
      <section className={`${panelClass} p-4`}>
        <div className="grid gap-3 xl:grid-cols-[minmax(230px,1fr)_minmax(230px,1fr)_auto] xl:items-end">
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
            Saved quiz
            <select
              className={selectClass}
              value={selectedQuizId}
              onChange={(event) => setSelectedQuizId(event.target.value)}
              disabled={!materialQuizSets.length}
            >
              {!materialQuizSets.length && (
                <option value="">No quiz generated yet</option>
              )}
              {materialQuizSets.map((set, index) => (
                <option key={set.id} value={set.id}>
                  {set.title} · {set.questions.length} questions
                  {index === 0 ? " · Latest" : ""}
                </option>
              ))}
            </select>
          </label>

          <button
            className={primaryButtonClass}
            onClick={generate}
            disabled={generating}
          >
            <Sparkles size={17} />
            {generating ? "Generating..." : "Generate new quiz"}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          AI automatically creates 5–15 questions according to the amount of
          usable information extracted from the selected material.
        </p>
      </section>

      {!activeQuiz ? (
        <section className={`${panelClass} grid min-h-[430px] place-items-center p-6`}>
          <EmptyState
            title="No stored quiz for this material"
            message="Generate a grounded multiple-choice quiz. Questions and completed scores are stored in MongoDB."
            action={
              <button className={primaryButtonClass} onClick={generate}>
                <Sparkles size={17} /> Generate quiz
              </button>
            }
          />
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <article className={`${panelClass} p-4 sm:p-6`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400">
                  Question {questionIndex + 1} of {questions.length}
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                  {activeQuiz.title}
                </h2>
              </div>
              <button
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 px-3 text-xs font-semibold text-rose-600 dark:border-rose-900/60 dark:text-rose-300"
                onClick={deleteQuiz}
                disabled={deleting}
              >
                <Trash2 size={15} /> {deleting ? "Deleting..." : "Delete quiz"}
              </button>
            </div>

            <div className="mt-5">
              <ProgressBar
                value={questions.length ? (answeredCount / questions.length) * 100 : 0}
              />
            </div>

            {result ? (
              <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-center dark:border-indigo-900/60 dark:bg-indigo-500/10">
                <Trophy className="mx-auto text-indigo-600 dark:text-indigo-300" size={34} />
                <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  {result.score}/{result.total}
                </p>
                <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                  {result.percentage}% score saved
                </p>
              </div>
            ) : null}

            <div className="mt-5 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
              <h3 className="text-base font-bold leading-7 text-slate-950 dark:text-white">
                {current?.question}
              </h3>

              <div className="mt-4 grid gap-2.5">
                {current?.options.map((option, optionIndex) => {
                  const chosen = selectedOption === optionIndex;
                  const correctAfterSubmit =
                    result && reviewItem?.correctOptionIndex === optionIndex;
                  const wrongAfterSubmit = result && chosen && !correctAfterSubmit;

                  return (
                    <button
                      key={`${current.id}-${optionIndex}`}
                      type="button"
                      disabled={Boolean(result)}
                      onClick={() =>
                        setAnswers((value) => ({
                          ...value,
                          [current.id]: optionIndex,
                        }))
                      }
                      className={`flex items-start gap-3 rounded-xl border p-3 text-left text-sm transition ${
                        correctAfterSubmit
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200"
                          : wrongAfterSubmit
                            ? "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-500/10 dark:text-rose-200"
                            : chosen
                              ? "border-indigo-400 bg-indigo-50 text-indigo-800 dark:border-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200"
                              : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      }`}
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current text-xs font-bold">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span className="pt-0.5">{option}</span>
                    </button>
                  );
                })}
              </div>

              {result && reviewItem?.explanation && (
                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  <strong>Explanation:</strong> {reviewItem.explanation}
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <button
                className={secondaryButtonClass}
                onClick={() => setQuestionIndex((value) => Math.max(0, value - 1))}
                disabled={questionIndex === 0}
              >
                <ArrowLeft size={17} /> Previous
              </button>

              {result ? (
                <button className={secondaryButtonClass} onClick={resetAttempt}>
                  <RotateCcw size={17} /> Retake quiz
                </button>
              ) : questionIndex === questions.length - 1 ? (
                <button
                  className={primaryButtonClass}
                  onClick={submit}
                  disabled={answeredCount !== questions.length || submitting}
                >
                  <CheckCircle2 size={17} />
                  {submitting ? "Saving..." : "Submit and save"}
                </button>
              ) : (
                <button
                  className={primaryButtonClass}
                  onClick={() =>
                    setQuestionIndex((value) =>
                      Math.min(questions.length - 1, value + 1),
                    )
                  }
                >
                  Next <ArrowRight size={17} />
                </button>
              )}
            </div>
          </article>

          <aside className={`${panelClass} p-4`}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Quiz status
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                <span className="text-slate-500">Questions</span>
                <strong>{questions.length}</strong>
              </div>
              <div className="flex justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                <span className="text-slate-500">Answered</span>
                <strong>{answeredCount}</strong>
              </div>
              <div className="flex justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                <span className="text-slate-500">Saved attempts</span>
                <strong>{activeQuiz.attempts?.length || 0}</strong>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              Correct answers remain hidden until submission. Your final score
              and answer results are stored with this quiz.
            </p>
          </aside>
        </section>
      )}
    </div>
  );
}
