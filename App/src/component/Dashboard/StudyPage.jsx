import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  BrainCircuit,
  FileQuestion,
  FileText,
  FolderOpen,
  Languages,
  Layers3,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Search,
  Send,
  WandSparkles,
} from "lucide-react";
import { EmptyState, PageHeader } from "./DashboardShared";
import {
  inputClass,
  pageClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
  textareaClass,
} from "./ui";
import documentAiApi from "../../service/documentAiApi";
import StudyFlashcards from "./StudyFlashcards";
import StudyQuiz from "./StudyQuiz";

const safeId = (value) => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return String(value?.id || value?._id || "");
};

const safeTitle = (material) =>
  material?.title || material?.originalName || "Untitled material";

const getType = (material) => {
  const value = String(
    material?.fileType ||
      material?.mimeType ||
      material?.originalName ||
      material?.title ||
      "",
  ).toLowerCase();
  if (value.includes("pdf")) return "PDF";
  if (value.includes("presentation") || value.includes("ppt")) return "PPTX";
  if (value.includes("word") || value.includes("doc")) return "DOCX";
  if (value.includes("text") || value.endsWith(".txt")) return "TXT";
  return "FILE";
};

const typeClass = {
  PDF: "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/60 dark:bg-rose-500/10 dark:text-rose-300",
  PPTX: "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-900/60 dark:bg-orange-500/10 dark:text-orange-300",
  DOCX: "border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-900/60 dark:bg-sky-500/10 dark:text-sky-300",
  TXT: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-300",
  FILE: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
};

function MaterialBadge({ material }) {
  const type = getType(material);
  return (
    <span
      className={`rounded-lg border px-2 py-1 text-[10px] font-bold ${typeClass[type]}`}
    >
      {type}
    </span>
  );
}

function ChatBubble({ entry }) {
  const isUser = entry.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6 ${
          isUser
            ? "bg-indigo-600 text-white"
            : "border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        }`}
      >
        {!isUser && (
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-300">
            <Bot size={15} /> Smart Assist
          </div>
        )}
        <p className="whitespace-pre-wrap">{entry.content}</p>
        {!isUser && entry.sourceTitle && (
          <p className="mt-3 rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
            Source material: {entry.sourceTitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default function StudyPage({
  materials = [],
  categories = [],
  flashcards = {},
  quizzes = {},
  onNavigate,
  onGenerateFlashcards,
  onReviewFlashcard,
  onDeleteFlashcard,
  onGenerateQuiz,
  onSubmitQuiz,
  onDeleteQuiz,
}) {
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    () => sessionStorage.getItem("smart-assist-study-category") || "",
  );
  const [studySection, setStudySection] = useState(
    () => sessionStorage.getItem("smart-assist-study-section") || "materials",
  );
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState("smart");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [question, setQuestion] = useState("");
  const [exchange, setExchange] = useState([]);
  const [busyAction, setBusyAction] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const viewerRef = useRef(null);

  const selectedMaterial = useMemo(
    () => materials.find((item) => safeId(item) === selectedMaterialId),
    [materials, selectedMaterialId],
  );

  const selectedCategory = useMemo(
    () => categories.find((item) => safeId(item) === selectedCategoryId),
    [categories, selectedCategoryId],
  );

  const categoryMaterials = useMemo(
    () =>
      materials.filter(
        (item) => safeId(item?.categoryId) === selectedCategoryId,
      ),
    [materials, selectedCategoryId],
  );

  const categoryCards = flashcards[selectedCategoryId] || [];
  const categoryQuizzes = quizzes[selectedCategoryId] || [];

  const materialCountByCategory = useMemo(
    () =>
      materials.reduce((counts, material) => {
        const categoryId = safeId(material?.categoryId);
        if (categoryId) {
          counts[categoryId] = (counts[categoryId] || 0) + 1;
        }
        return counts;
      }, {}),
    [materials],
  );

  useEffect(() => {
    const availableCategoryIds = categories.map(safeId).filter(Boolean);
    if (!availableCategoryIds.length) {
      setSelectedCategoryId("");
      return;
    }
    if (!availableCategoryIds.includes(selectedCategoryId)) {
      setSelectedCategoryId(availableCategoryIds[0]);
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    if (selectedCategoryId) {
      sessionStorage.setItem(
        "smart-assist-study-category",
        selectedCategoryId,
      );
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    sessionStorage.setItem("smart-assist-study-section", studySection);
  }, [studySection]);

  const chooseCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setSelectedMaterialId("");
    setSearchTerm("");
    setPageNumber(1);
    setExchange([]);
    setQuestion("");
  };

  const chooseSection = (section) => {
    setStudySection(section);
    setSelectedMaterialId("");
    setSearchTerm("");
    setPageNumber(1);
    setExchange([]);
    setQuestion("");
  };

  const filteredMaterials = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return categoryMaterials.filter(
      (item) => !query || safeTitle(item).toLowerCase().includes(query),
    );
  }, [categoryMaterials, searchTerm]);

  const previewUrl = selectedMaterial
    ? documentAiApi.getViewUrl(selectedMaterialId)
    : "";
  const previewZoom =
    viewMode === "smart" ? (isFullscreen ? "page-fit" : "page-width") : zoom;
  const previewSource = previewUrl
    ? `${previewUrl}#page=${pageNumber}&zoom=${previewZoom}`
    : "";

  useEffect(() => {
    const syncFullscreenState = () => {
      const active = document.fullscreenElement === viewerRef.current;
      setIsFullscreen(active);
      if (active) setViewMode("smart");
    };
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () =>
      document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  const changeZoom = (amount) => {
    setViewMode("custom");
    setZoom((value) => Math.min(200, Math.max(50, value + amount)));
  };

  const toggleFullscreen = async () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    try {
      if (document.fullscreenElement === viewer) {
        await document.exitFullscreen?.();
      } else {
        await viewer.requestFullscreen?.();
      }
    } catch (error) {
      console.error("Could not change fullscreen mode:", error);
    }
  };

  const runAssistant = async ({ action, language = "auto", prompt }) => {
    if (!selectedMaterialId || busyAction) return;

    const userEntry = { role: "user", content: prompt };
    // Each request replaces the previous exchange. Only the latest student
    // request and latest AI answer remain visible.
    setExchange([userEntry]);
    if (action === "question") setQuestion("");
    setBusyAction(`${action}-${language}`);

    try {
      const result = await documentAiApi.ask(selectedMaterialId, {
        action,
        question: action === "question" ? prompt : "",
        language,
      });
      setExchange([
        userEntry,
        {
          role: "assistant",
          content: result.answer,
          sourceTitle: result.sources?.[0]?.title || safeTitle(selectedMaterial),
        },
      ]);
      setQuestion("");
    } catch (error) {
      setExchange([
        userEntry,
        {
          role: "assistant",
          content:
            error?.response?.data?.message ||
            error?.message ||
            "The study assistant could not answer this request.",
          sourceTitle: safeTitle(selectedMaterial),
        },
      ]);
    } finally {
      setBusyAction("");
    }
  };

  if (!categories.length) {
    return (
      <div className={pageClass}>
        <PageHeader
          eyebrow="AI study workspace"
          title="Study"
          description="Study materials, flashcards, and stored AI quizzes by category."
        />
        <section className={`${panelClass} grid min-h-96 place-items-center p-6`}>
          <EmptyState
            title="Create a category first"
            message="Study materials, flashcards, and quizzes are organized by category."
            action={
              <button
                className={primaryButtonClass}
                onClick={() => onNavigate?.("material")}
              >
                Go to materials
              </button>
            }
          />
        </section>
      </div>
    );
  }

  if (selectedMaterial) {
    return (
      <div className={pageClass}>
        <PageHeader
          eyebrow={`${selectedCategory?.name || "Study"} material`}
          title="Smart Viewer"
          description="The AI assistant uses the whole uploaded material, not the current viewer page."
          action={
            <button
              className={secondaryButtonClass}
              onClick={() => {
                setSelectedMaterialId("");
                setExchange([]);
              }}
            >
              <ArrowLeft size={17} /> Category materials
            </button>
          }
        />

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
          <section
            ref={viewerRef}
            className={`${panelClass} min-w-0 overflow-hidden ${
              isFullscreen
                ? "flex h-screen w-screen flex-col !rounded-none !border-0 bg-white dark:bg-slate-950"
                : ""
            }`}
          >
            <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
              <MaterialBadge material={selectedMaterial} />
              <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900 dark:text-white">
                {safeTitle(selectedMaterial)}
              </span>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 dark:border-slate-700"
                onClick={() => changeZoom(-10)}
                aria-label="Zoom out"
              >
                <Minus size={16} />
              </button>
              <span className="w-14 text-center text-xs font-semibold text-slate-500 dark:text-slate-300">
                {viewMode === "smart" ? "Auto" : `${zoom}%`}
              </span>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 dark:border-slate-700"
                onClick={() => changeZoom(10)}
                aria-label="Zoom in"
              >
                <Plus size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("smart")}
                className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition ${
                  viewMode === "smart"
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300"
                    : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                <WandSparkles size={15} />
                <span className="hidden sm:inline">Smart view</span>
              </button>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 dark:border-slate-700"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>

            <div
              className={`relative min-h-0 bg-slate-100 dark:bg-slate-950 ${
                isFullscreen
                  ? "flex-1 overflow-hidden p-0"
                  : "h-[clamp(520px,68vh,860px)] p-3"
              }`}
            >
              {["PDF", "DOCX", "PPTX"].includes(getType(selectedMaterial)) ? (
                <iframe
                  key={`${selectedMaterialId}-${pageNumber}-${previewZoom}-${isFullscreen}`}
                  title={safeTitle(selectedMaterial)}
                  src={previewSource}
                  className={`h-full w-full border-0 bg-white ${
                    isFullscreen ? "rounded-none" : "rounded-xl"
                  }`}
                  allowFullScreen
                />
              ) : (
                <div className="grid h-full min-h-[520px] place-items-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                  <div>
                    <FolderOpen className="mx-auto text-indigo-500" size={40} />
                    <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                      Preview is not available for this file
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                      PDF, DOCX, and PPTX files can be viewed in the secure viewer.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-t border-slate-200 p-3 dark:border-slate-800">
              <button
                className={secondaryButtonClass}
                onClick={() => setPageNumber((value) => Math.max(1, value - 1))}
              >
                <ArrowLeft size={16} /> Previous
              </button>
              <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                Viewer page {pageNumber}
              </span>
              <button
                className={secondaryButtonClass}
                onClick={() => setPageNumber((value) => value + 1)}
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          </section>

          <aside className={`${panelClass} flex min-h-[680px] flex-col overflow-hidden`}>
            <div className="border-b border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                  <BrainCircuit size={19} />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    AI Study Assistant
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Whole material only · latest exchange only
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  disabled={Boolean(busyAction)}
                  onClick={() =>
                    runAssistant({
                      action: "explain_topic",
                      language: "english",
                      prompt: "Explain the topic in English.",
                    })
                  }
                  className={primaryButtonClass}
                >
                  <FileText size={16} />
                  {busyAction === "explain_topic-english"
                    ? "Explaining..."
                    : "Explain topic in English"}
                </button>
                <button
                  type="button"
                  disabled={Boolean(busyAction)}
                  onClick={() =>
                    runAssistant({
                      action: "explain_topic",
                      language: "myanmar",
                      prompt: "အကြောင်းအရာတစ်ခုလုံးကို မြန်မာဘာသာဖြင့် ရှင်းပြပါ။",
                    })
                  }
                  className={secondaryButtonClass}
                >
                  <Languages size={16} />
                  {busyAction === "explain_topic-myanmar"
                    ? "ရှင်းပြနေသည်..."
                    : "မြန်မာဘာသာဖြင့် ရှင်းပြရန်"}
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-auto bg-slate-50/50 p-4 dark:bg-slate-950/30">
              {!exchange.length ? (
                <div className="grid min-h-64 place-items-center text-center">
                  <div>
                    <Bot className="mx-auto text-indigo-400" size={34} />
                    <p className="mt-3 text-sm font-bold text-slate-800 dark:text-white">
                      One focused AI exchange
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Use a language button or ask one question. A new request
                      replaces the previous conversation.
                    </p>
                  </div>
                </div>
              ) : (
                exchange.map((entry, index) => (
                  <ChatBubble key={`${entry.role}-${index}`} entry={entry} />
                ))
              )}
            </div>

            <div className="border-t border-slate-200 p-3 dark:border-slate-800">
              <div className="flex gap-2">
                <textarea
                  className={`${textareaClass} min-h-11 resize-none`}
                  rows="2"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask about the whole material..."
                />
                <button
                  type="button"
                  disabled={!question.trim() || Boolean(busyAction)}
                  onClick={() =>
                    runAssistant({
                      action: "question",
                      language: "auto",
                      prompt: question.trim(),
                    })
                  }
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white disabled:opacity-50"
                  aria-label="Ask question"
                >
                  <Send size={17} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  const sectionTabs = [
    {
      id: "materials",
      label: "Materials",
      icon: FileText,
      count: categoryMaterials.length,
    },
    {
      id: "flashcards",
      label: "Flashcards",
      icon: Layers3,
      count: categoryCards.length,
    },
    {
      id: "quiz",
      label: "Quiz",
      icon: FileQuestion,
      count: categoryQuizzes.length,
    },
  ];

  return (
    <div className={pageClass}>
      <PageHeader
        eyebrow="AI study workspace"
        title="Study"
        description="Choose a category, then switch between its materials, flashcards, and stored AI quizzes."
        action={
          <button
            className={secondaryButtonClass}
            onClick={() => onNavigate?.("material")}
          >
            <Plus size={17} /> Upload material
          </button>
        }
      />

      <div
        className="mb-3 flex gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-slate-900"
        role="tablist"
        aria-label="Study categories"
      >
        {categories.map((item) => {
          const categoryId = safeId(item);
          const active = selectedCategoryId === categoryId;
          return (
            <button
              key={categoryId}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => chooseCategory(categoryId)}
              className={`flex min-w-max items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                  : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <span>{item.emoji || "📚"}</span>
              <span>{item.name}</span>
              <small
                className={`grid h-5 min-w-5 place-items-center rounded-md px-1 text-[10px] ${
                  active
                    ? "bg-white dark:bg-slate-900"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                {materialCountByCategory[categoryId] || 0}
              </small>
            </button>
          );
        })}
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-slate-900">
        {sectionTabs.map(({ id, label, icon: Icon, count }) => {
          const active = studySection === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => chooseSection(id)}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold transition sm:text-sm ${
                active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Icon size={17} />
              <span>{label}</span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                  active
                    ? "bg-white/15"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {studySection === "materials" && (
        <section className={`${panelClass} p-4 sm:p-5`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950 dark:text-white">
                {selectedCategory?.emoji} {selectedCategory?.name} materials
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Search and open only materials assigned to this category.
              </p>
            </div>
            <label className="relative block w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                className={`${inputClass} pl-9`}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={`Search ${selectedCategory?.name || "materials"}...`}
              />
            </label>
          </div>

          {filteredMaterials.length ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {filteredMaterials.map((material) => (
                <button
                  key={safeId(material)}
                  type="button"
                  onClick={() => {
                    setSelectedMaterialId(safeId(material));
                    setPageNumber(1);
                    setExchange([]);
                  }}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700 dark:hover:bg-indigo-500/5"
                >
                  <MaterialBadge material={material} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900 group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-300">
                      {safeTitle(material)}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Open secure viewer and whole-material AI assistant
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-slate-300 transition group-hover:text-indigo-500"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4 grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6 dark:border-slate-700 dark:bg-slate-950/50">
              <EmptyState
                title={
                  searchTerm.trim()
                    ? "No matching materials"
                    : `No materials in ${selectedCategory?.name}`
                }
                message={
                  searchTerm.trim()
                    ? "Try another search word."
                    : "Upload a material and assign it to this category."
                }
                action={
                  <button
                    className={secondaryButtonClass}
                    onClick={() => onNavigate?.("material")}
                  >
                    <Plus size={17} /> Add material
                  </button>
                }
              />
            </div>
          )}
        </section>
      )}

      {studySection === "flashcards" && (
        <StudyFlashcards
          key={`flashcards-${selectedCategoryId}`}
          category={selectedCategory}
          materials={categoryMaterials}
          cards={categoryCards}
          onGenerateFlashcards={onGenerateFlashcards}
          onReviewFlashcard={onReviewFlashcard}
          onDeleteFlashcard={onDeleteFlashcard}
          onNavigate={onNavigate}
        />
      )}

      {studySection === "quiz" && (
        <StudyQuiz
          key={`quiz-${selectedCategoryId}`}
          category={selectedCategory}
          materials={categoryMaterials}
          quizSets={categoryQuizzes}
          onGenerateQuiz={onGenerateQuiz}
          onSubmitQuiz={onSubmitQuiz}
          onDeleteQuiz={onDeleteQuiz}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}
