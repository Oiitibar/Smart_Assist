import { useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  FileImage,
  FileText,
  FileType2,
  FolderPlus,
  Plus,
  Presentation,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { EmptyState, Modal, PageHeader } from "./DashboardShared";
import {
  iconButtonClass,
  inputClass,
  labelClass,
  pageClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
  selectClass,
} from "./ui";

const palette = [
  ["#4f46e5", "#eef2ff", "💻"],
  ["#8b5cf6", "#f5f3ff", "📐"],
  ["#0ea5e9", "#f0f9ff", "⚛️"],
  ["#10b981", "#ecfdf5", "🧬"],
  ["#f59e0b", "#fffbeb", "📚"],
  ["#f43f5e", "#fff1f2", "🎨"],
];

const typeIcons = {
  PDF: FileText,
  DOC: FileType2,
  DOCX: FileType2,
  PPT: Presentation,
  PPTX: Presentation,
  PNG: FileImage,
  JPG: FileImage,
  JPEG: FileImage,
  WEBP: FileImage,
  TXT: FileText,
};

function readableSize(bytes) {
  if (!bytes) return "Unknown size";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileExtension(name = "") {
  return name.split(".").pop()?.toUpperCase() || "FILE";
}

export default function MaterialPage({
  categories,
  materials,
  flashcards,
  onAddCategory,
  onDeleteCategory,
  onAddMaterial,
  onDeleteMaterial,
}) {
  const [selectedId, setSelectedId] = useState("all");
  const [showCategory, setShowCategory] = useState(false);
  const [showMaterial, setShowMaterial] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [selectedPalette, setSelectedPalette] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    title: "",
    categoryId: categories[0]?.id || "",
    description: "",
  });

  const filtered = useMemo(
    () => materials.filter((item) => {
      const matchesCategory = selectedId === "all" || item.categoryId === selectedId;
      const matchesSearch = item.title.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesSearch;
    }),
    [materials, selectedId, query],
  );

  const createCategory = async (event) => {
    event.preventDefault();
    if (!categoryName.trim() || creatingCategory) return;
    const [color, soft, emoji] = palette[selectedPalette];
    setCreatingCategory(true);
    try {
      const created = await onAddCategory({ name: categoryName.trim(), color, soft, emoji });
      setCategoryName("");
      setShowCategory(false);
      setForm((value) => ({ ...value, categoryId: created?.id || value.categoryId }));
    } finally {
      setCreatingCategory(false);
    }
  };

  const chooseFile = (file) => {
    if (!file) return;

    setUploadError("");
    setSelectedFile(file);
    setForm((value) => ({
      ...value,
      title: value.title || file.name,
    }));
  };

  const addMaterial = async (event) => {
    event.preventDefault();

    if (uploading) return;

    if (!(selectedFile instanceof File)) {
      setUploadError("Please choose a file before uploading.");
      return;
    }

    if (!form.categoryId) {
      setUploadError("Please select a category.");
      return;
    }

    setUploadError("");
    setUploading(true);

    try {
      await onAddMaterial({
        file: selectedFile,
        categoryId: form.categoryId,
        title: form.title.trim() || selectedFile.name,
        description: form.description.trim(),
      });

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setForm((value) => ({
        ...value,
        title: "",
        description: "",
      }));

      setShowMaterial(false);
    } catch (error) {
      setUploadError(
        error?.response?.data?.message ||
          error?.message ||
          "Could not upload this material.",
      );
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const openUpload = () => {
    setForm((value) => ({
      ...value,
      categoryId: categories[0]?.id || "",
    }));
    setSelectedFile(null);
    setUploadError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setShowMaterial(true);
  };

  return (
    <div className={pageClass}>
      <PageHeader
        eyebrow="Knowledge library"
        title="Materials"
        description="Upload and organize study files. These materials become the source for AI flashcard generation."
        action={
          <div className="flex w-full gap-2 sm:w-auto">
            <button className={`${secondaryButtonClass} flex-1 sm:flex-none`} onClick={() => setShowCategory(true)}>
              <FolderPlus size={17} /> New category
            </button>
            <button className={`${primaryButtonClass} flex-1 sm:flex-none`} onClick={openUpload} disabled={!categories.length}>
              <UploadCloud size={17} /> Upload material
            </button>
          </div>
        }
      />

      <section className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {categories.map((category) => {
          const count = materials.filter((item) => item.categoryId === category.id).length;
          const active = selectedId === category.id;
          return (
            <article
              key={category.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(active ? "all" : category.id)}
              onKeyDown={(event) => event.key === "Enter" && setSelectedId(active ? "all" : category.id)}
              className={`material-category-card relative min-h-[112px] cursor-pointer rounded-2xl border p-3.5 text-left transition hover:-translate-y-0.5 ${
                active ? "shadow-md" : "shadow-sm"
              }`}
              style={{
                background: `linear-gradient(145deg, #ffffff, ${category.soft})`,
                borderColor: active ? category.color : `${category.color}2b`,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-lg shadow-sm">{category.emoji}</span>
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white hover:text-rose-500 dark:hover:bg-slate-900"
                  onClick={(event) => { event.stopPropagation(); onDeleteCategory?.(category.id); }}
                  aria-label={`Delete ${category.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <strong className="mt-3 block text-sm text-slate-900 dark:text-white">{category.name}</strong>
              <small className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">{count} materials · {flashcards[category.id]?.length || 0} cards</small>
            </article>
          );
        })}

        <button
          className="grid min-h-[112px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-3 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700 dark:hover:bg-indigo-500/5"
          onClick={() => setShowCategory(true)}
        >
          <span>
            <span className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"><Plus size={20} /></span>
            <strong className="mt-2 block text-sm text-slate-800 dark:text-slate-100">Add category</strong>
          </span>
        </button>
      </section>

      <section className={`${panelClass} overflow-hidden`}>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white">Study files</h2>
            <p className="mt-0.5 text-xs text-slate-400">{filtered.length} resources</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 sm:w-64 dark:border-slate-700 dark:bg-slate-950">
              <Search size={16} />
              <input className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none dark:text-slate-100" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search materials" />
              {query && <button onClick={() => setQuery("")}><X size={15} /></button>}
            </label>
            <select className={`${selectClass} sm:w-44`} value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              <option value="all">All categories</option>
              {categories.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="grid min-h-72 place-items-center">
            <EmptyState
              title="No materials found"
              message="Upload a PDF, PowerPoint, Word file, text file, or image."
              action={<button className={primaryButtonClass} onClick={openUpload} disabled={!categories.length}>Upload material</button>}
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((material) => {
              const category = categories.find((item) => item.id === material.categoryId);
              const Icon = typeIcons[material.type] || BookOpen;
              return (
                <article key={material.id} className="grid grid-cols-[42px_minmax(0,1fr)_36px] items-center gap-3 px-3 py-3 sm:grid-cols-[42px_minmax(180px,1fr)_auto_80px_90px_36px] sm:px-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ color: category?.color, backgroundColor: category?.soft }}>
                    <Icon size={20} />
                  </span>
                  <div className="min-w-0">
                    <strong className="block truncate text-sm text-slate-900 dark:text-white">{material.title}</strong>
                    <span className="mt-1 block truncate text-[11px] text-slate-400">{material.detail || `${material.type} · ${readableSize(material.size)}`}</span>
                  </div>
                  <span className="hidden rounded-lg px-2 py-1.5 text-[11px] font-semibold sm:inline-flex" style={{ color: category?.color, backgroundColor: category?.soft }}>
                    {category?.emoji} {category?.name}
                  </span>
                  <span className="hidden text-xs font-semibold text-slate-500 sm:block dark:text-slate-400">{material.type}</span>
                  <time className="hidden text-[11px] text-slate-400 sm:block">{material.updated}</time>
                  <button className={iconButtonClass} onClick={() => onDeleteMaterial?.(material.id)} aria-label="Delete material"><Trash2 size={16} /></button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {showCategory && (
        <Modal title="Create category" description="The category will also appear in Flashcards." onClose={() => setShowCategory(false)}>
          <form className="grid gap-4" onSubmit={createCategory}>
            <label className={labelClass}>
              Category name
              <input className={inputClass} value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="e.g. Computer Science" autoFocus />
            </label>
            <label className={labelClass}>
              Color and icon
              <div className="flex flex-wrap gap-2">
                {palette.map(([color, soft, emoji], index) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedPalette(index)}
                    className="relative grid h-11 w-11 place-items-center rounded-xl border-2 text-lg"
                    style={{ backgroundColor: soft, borderColor: selectedPalette === index ? color : "transparent" }}
                  >
                    {emoji}
                    {selectedPalette === index && <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-indigo-600 text-white"><Check size={10} /></span>}
                  </button>
                ))}
              </div>
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" className={secondaryButtonClass} onClick={() => setShowCategory(false)}>Cancel</button>
              <button className={primaryButtonClass} type="submit" disabled={creatingCategory}>{creatingCategory ? "Creating..." : "Create category"}</button>
            </div>
          </form>
        </Modal>
      )}

      {showMaterial && (
        <Modal title="Upload study material" description="The actual file is sent to your backend upload middleware; MongoDB stores its metadata." onClose={() => setShowMaterial(false)}>
          <form className="grid gap-4" onSubmit={addMaterial}>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp"
              onChange={(event) => chooseFile(event.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-4 text-center transition hover:bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-500/5 dark:hover:bg-indigo-500/10"
            >
              <UploadCloud size={28} className="text-indigo-600 dark:text-indigo-300" />
              <strong className="mt-2 text-sm text-slate-800 dark:text-slate-100">{selectedFile ? selectedFile.name : "Choose a file"}</strong>
              <span className="mt-1 text-xs text-slate-400">PDF, DOCX, PPTX, TXT, PNG, JPG, WEBP</span>
              {selectedFile && <span className="mt-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-300">{readableSize(selectedFile.size)}</span>}
            </button>

            <label className={labelClass}>
              Display title
              <input className={inputClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Material title" />
            </label>
            <label className={labelClass}>
              Category
              <select className={selectClass} value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
                {categories.map((item) => <option key={item.id} value={item.id}>{item.emoji} {item.name}</option>)}
              </select>
            </label>
            <label className={labelClass}>
              Description
              <input className={inputClass} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Optional note about this file" />
            </label>

            {uploadError && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                {uploadError}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button type="button" className={secondaryButtonClass} onClick={() => setShowMaterial(false)}>Cancel</button>
              <button className={primaryButtonClass} type="submit" disabled={!selectedFile || uploading}>{uploading ? "Uploading..." : "Upload material"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
