import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Bot,
  CheckCircle2,
  FileText,
  FolderOpen,
  Highlighter,
  Maximize2,
  MessageSquareText,
  Minus,
  NotebookPen,
  Plus,
  Search,
  Send,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { EmptyState, PageHeader } from "./DashboardShared";
import {
  inputClass,
  pageClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
  selectClass,
  textareaClass,
} from "./ui";
import documentAiApi from "../../service/documentAiApi";

const safeId = (value) => String(value?.id || value?._id || "");
const safeTitle = (material) => material?.title || material?.originalName || "Untitled material";
const getType = (material) => {
  const value = String(material?.fileType || material?.mimeType || material?.originalName || material?.title || "").toLowerCase();
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
  return <span className={`rounded-lg border px-2 py-1 text-[10px] font-bold ${typeClass[type]}`}>{type}</span>;
}

function AnswerCard({ message }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
          <Bot size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">{message.answer}</p>
          {message.sources?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.sources.map((source, index) => (
                <span key={`${source.pageNumber || source.slideNumber || index}-${index}`} className="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                  Source: {source.title || "Material"}{source.pageNumber ? `, page ${source.pageNumber}` : ""}{source.slideNumber ? `, slide ${source.slideNumber}` : ""}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function StudyPage({
  materials = [],
  categories = [],
  onNavigate,
  onGenerateFlashcards,
}) {
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [selectedText, setSelectedText] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [busyAction, setBusyAction] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [note, setNote] = useState("");
  const [cardCount, setCardCount] = useState(5);
  const viewerRef = useRef(null);

  const selectedMaterial = useMemo(
    () => materials.find((item) => safeId(item) === selectedMaterialId),
    [materials, selectedMaterialId],
  );

  const relatedCategoryId = safeId(selectedMaterial?.categoryId);

  useEffect(() => {
    if (selectedMaterial && relatedCategoryId) setSelectedCategoryId(relatedCategoryId);
  }, [selectedMaterialId, relatedCategoryId]);

  const filteredMaterials = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return materials;
    return materials.filter((item) => safeTitle(item).toLowerCase().includes(query));
  }, [materials, searchTerm]);

  const previewUrl = selectedMaterial
    ? documentAiApi.getViewUrl(selectedMaterialId)
    : "";

  const captureSelection = () => {
    const selection = window.getSelection?.();
    const text = selection?.toString().trim();
    if (text && text.length >= 10) setSelectedText(text.slice(0, 12_000));
  };

  const runAiAction = async (action, customQuestion = "") => {
    if (!selectedMaterialId || busyAction) return;
    setBusyAction(action);
    try {
      const result = await documentAiApi.ask(selectedMaterialId, {
        action,
        question: customQuestion,
        selectedText,
        pageNumber,
        scope: selectedText ? "selection" : "document",
      });
      setMessages((items) => [...items, result]);
      setQuestion("");
    } finally {
      setBusyAction("");
    }
  };

  const generateFlashcards = async () => {
    if (!selectedMaterialId || busyAction) return;
    const categoryId = selectedCategoryId || relatedCategoryId;
    if (!categoryId || typeof onGenerateFlashcards !== "function") return;
    setBusyAction("flashcards");
    try {
      await onGenerateFlashcards(categoryId, selectedMaterialId, Number(cardCount));
    } finally {
      setBusyAction("");
    }
  };

  if (!materials.length) {
    return (
      <div className={pageClass}>
        <PageHeader eyebrow="AI study workspace" title="Study" description="Read a material and ask AI without leaving Smart Assist." />
        <section className={`${panelClass} grid min-h-96 place-items-center`}>
          <EmptyState
            title="Upload a study material first"
            message="PDF, DOCX, PPTX and TXT materials will appear here after upload."
            action={<button className={primaryButtonClass} onClick={() => onNavigate?.("material")}>Go to materials</button>}
          />
        </section>
      </div>
    );
  }

  if (!selectedMaterial) {
    return (
      <div className={pageClass}>
        <PageHeader
          eyebrow="AI study workspace"
          title="Study"
          description="Open a material, read it inside Smart Assist, and ask AI about the content."
          action={<button className={secondaryButtonClass} onClick={() => onNavigate?.("material")}><Plus size={17} /> Upload material</button>}
        />

        <section className={`${panelClass} p-4 sm:p-5`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950 dark:text-white">Choose a material to study</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Your uploaded documents are available here.</p>
            </div>
            <label className="relative block w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input className={`${inputClass} pl-9`} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search materials..." />
            </label>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {filteredMaterials.map((material) => (
              <button
                key={safeId(material)}
                type="button"
                onClick={() => setSelectedMaterialId(safeId(material))}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700 dark:hover:bg-indigo-500/5"
              >
                <MaterialBadge material={material} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900 group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-300">{safeTitle(material)}</p>
                  <p className="mt-1 text-xs text-slate-400">Open viewer and AI assistant</p>
                </div>
                <ArrowRight size={18} className="text-slate-300 transition group-hover:text-indigo-500" />
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const actions = [
    ["explain", "Explain this", MessageSquareText],
    ["summarize", "Summarize", FileText],
    ["simplify", "Make simpler", WandSparkles],
    ["example", "Give example", Sparkles],
    ["quiz", "Create quiz", CheckCircle2],
  ];

  return (
    <div className={pageClass}>
      <PageHeader
        eyebrow="AI study workspace"
        title="Study"
        description="Read, select content, ask questions, and create learning activities from one place."
        action={<button className={secondaryButtonClass} onClick={() => setSelectedMaterialId("")}><ArrowLeft size={17} /> All materials</button>}
      />

      <div className="mb-3 grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
        <section className={`${panelClass} min-w-0 overflow-hidden`}>
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
            <MaterialBadge material={selectedMaterial} />
            <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900 dark:text-white">{safeTitle(selectedMaterial)}</span>
            <button type="button" className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 dark:border-slate-700" onClick={() => setZoom((value) => Math.max(70, value - 10))}><Minus size={16} /></button>
            <span className="w-12 text-center text-xs font-semibold text-slate-500">{zoom}%</span>
            <button type="button" className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 dark:border-slate-700" onClick={() => setZoom((value) => Math.min(160, value + 10))}><Plus size={16} /></button>
            <button type="button" className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 dark:border-slate-700" onClick={() => viewerRef.current?.requestFullscreen?.()}><Maximize2 size={16} /></button>
          </div>

          <div ref={viewerRef} onMouseUp={captureSelection} className="relative min-h-[580px] bg-slate-100 p-3 dark:bg-slate-950">
            {["PDF", "DOCX", "PPTX"].includes(getType(selectedMaterial)) ? (
              <iframe
                key={`${selectedMaterialId}-${pageNumber}-${zoom}`}
                title={safeTitle(selectedMaterial)}
                src={`${previewUrl}#page=${pageNumber}&zoom=${zoom}`}
                className="h-[580px] w-full rounded-xl border-0 bg-white"
              />
            ) : (
              <div className="grid min-h-[580px] place-items-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                <div>
                  <FolderOpen className="mx-auto text-indigo-500" size={40} />
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">Preview is not available for this file</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">PDF, DOCX and PPTX files can be viewed here. Convert other file types to one of those formats first.</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 p-3 dark:border-slate-800">
            <button className={secondaryButtonClass} onClick={() => setSelectedText(window.getSelection?.()?.toString().trim() || "")}><Highlighter size={16} /> Capture selection</button>
            <button className={secondaryButtonClass} onClick={() => setBookmarked((value) => !value)}><Bookmark size={16} /> {bookmarked ? "Bookmarked" : "Bookmark"}</button>
            <button className={secondaryButtonClass} onClick={() => setPageNumber((value) => Math.max(1, value - 1))}><ArrowLeft size={16} /> Previous</button>
            <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">Page {pageNumber}</span>
            <button className={secondaryButtonClass} onClick={() => setPageNumber((value) => value + 1)}>Next <ArrowRight size={16} /></button>
          </div>
        </section>

        <aside className={`${panelClass} flex min-h-[680px] flex-col overflow-hidden`}>
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"><Sparkles size={19} /></span>
                <div><h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Study Assistant</h2><p className="text-[11px] text-slate-400">OpenRouter first, Groq fallback</p></div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">AI Ready</span>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Selected content</p>
              <p className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-600 dark:text-slate-300">{selectedText || "Select a paragraph in the viewer, or ask about the whole material."}</p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {actions.map(([action, label, Icon]) => (
                <button key={action} type="button" disabled={Boolean(busyAction)} onClick={() => runAiAction(action)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:text-indigo-300">
                  <Icon size={15} /> {busyAction === action ? "Working..." : label}
                </button>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-[1fr_90px] gap-2">
              <select className={selectClass} value={cardCount} onChange={(event) => setCardCount(Number(event.target.value))}>
                <option value="3">3 flashcards</option><option value="5">5 flashcards</option><option value="10">10 flashcards</option>
              </select>
              <button type="button" disabled={Boolean(busyAction)} onClick={generateFlashcards} className={primaryButtonClass}><Sparkles size={15} /> {busyAction === "flashcards" ? "..." : "Cards"}</button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-auto p-4">
            {messages.length === 0 ? (
              <div className="grid min-h-56 place-items-center text-center">
                <div><Bot className="mx-auto text-indigo-400" size={34} /><p className="mt-3 text-sm font-bold text-slate-800 dark:text-white">Ask about your material</p><p className="mt-1 text-xs leading-5 text-slate-400">AI answers are limited to the uploaded content and include source references when available.</p></div>
              </div>
            ) : messages.map((message, index) => <AnswerCard key={index} message={message} />)}
          </div>

          <div className="border-t border-slate-200 p-3 dark:border-slate-800">
            <div className="flex gap-2">
              <textarea className={`${textareaClass} min-h-11 resize-none`} rows="2" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about this material..." />
              <button type="button" disabled={!question.trim() || Boolean(busyAction)} onClick={() => runAiAction("question", question.trim())} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white disabled:opacity-50"><Send size={17} /></button>
            </div>
          </div>
        </aside>
      </div>

      <section className={`${panelClass} p-4`}>
        <div className="flex items-center gap-3">
          <NotebookPen className="text-indigo-500" size={19} />
          <div><h3 className="text-sm font-bold text-slate-900 dark:text-white">Personal notes</h3><p className="text-[11px] text-slate-400">Keep a note beside the current material.</p></div>
        </div>
        <textarea className={`${textareaClass} mt-3`} rows="3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Write a note about this page or concept..." />
      </section>
    </div>
  );
}
