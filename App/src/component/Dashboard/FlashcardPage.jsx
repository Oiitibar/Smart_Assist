import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Brain, FileText, Layers, Sparkles, UploadCloud, X } from "lucide-react";
import { getCategories } from "../../service/categoryApi";
import { generateFlashcards, getFlashcardSets, updateCardReview } from "../../service/flashcardApi";
import { getMaterials, uploadMaterial } from "../../service/materialApi";
import { getErrorMessage } from "../../service/axios";
import {
  asArray,
  CardShell,
  CardTitle,
  EmptyState,
  ErrorNotice,
  Field,
  getItemId,
  LoadingCard,
  MaterialTypeBadge,
  PageHeader,
  SelectBox,
} from "./DashboardShared";

export default function FlashcardPage() {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sets, setSets] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [cardsPerTopic, setCardsPerTopic] = useState("10");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadFlashcardPage = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [materialData, categoryData, setData] = await Promise.all([
        getMaterials(),
        getCategories(),
        getFlashcardSets(),
      ]);
      const materialList = asArray(materialData);
      setMaterials(materialList);
      setCategories(asArray(categoryData));
      setSets(asArray(setData));
      if (!selectedMaterialId && materialList[0]) setSelectedMaterialId(getItemId(materialList[0]));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load flashcard data."));
    } finally {
      setLoading(false);
    }
  }, [selectedMaterialId]);

  useEffect(() => {
    loadFlashcardPage();
  }, [loadFlashcardPage]);

  const selectedMaterial = useMemo(
    () => materials.find((item) => getItemId(item) === selectedMaterialId),
    [materials, selectedMaterialId]
  );

  const selectedSet = sets[0] || null;
  const firstCard = selectedSet?.cards?.[0] || selectedSet?.flashcards?.[0] || null;

  const materialOptions = materials.map((item) => ({
    value: getItemId(item),
    label: item.title || item.name || item.originalName || "Untitled material",
  }));

  const categoryOptions = categories.map((item) => ({
    value: getItemId(item),
    label: item.name,
  }));

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setBusy(true);
      setError("");
      setSuccess("");
      const uploaded = await uploadMaterial(file, selectedCategoryId);
      const id = getItemId(uploaded);
      setSuccess("Material uploaded successfully.");
      await loadFlashcardPage();
      if (id) setSelectedMaterialId(id);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to upload material."));
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!selectedMaterialId) {
      setError("Please select or upload a material first.");
      return;
    }

    try {
      setBusy(true);
      setError("");
      setSuccess("");
      await generateFlashcards({
        materialId: selectedMaterialId,
        categoryId: selectedCategoryId,
        difficulty,
        cardsPerTopic: Number(cardsPerTopic),
      });
      setSuccess("Flashcards generated successfully.");
      await loadFlashcardPage();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to generate flashcards."));
    } finally {
      setBusy(false);
    }
  };

  const handleReview = async (result) => {
    const setId = getItemId(selectedSet);
    const cardId = getItemId(firstCard);
    if (!setId || !cardId) return;

    try {
      await updateCardReview(setId, cardId, result);
      await loadFlashcardPage();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save review result."));
    }
  };

  if (loading) return <LoadingCard message="Loading flashcards and materials..." />;

  return (
    <>
      <PageHeader
        title="AI Flashcards"
        subtitle="Input materials, group them by category, and generate review cards from database data."
      />

      <ErrorNotice message={error} onRetry={loadFlashcardPage} />
      {success && <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        <div className="space-y-5 xl:col-span-3">
          <CardShell>
            <CardTitle icon={UploadCloud} title="Add Source Material" subtitle="Upload or choose material to generate flashcards." />

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
              <label className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-6 text-center transition hover:bg-indigo-50 lg:col-span-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
                  <UploadCloud size={28} />
                </div>
                <h3 className="mt-4 font-semibold text-slate-950">Drag & drop files here</h3>
                <p className="mt-1 text-sm text-indigo-600">or click to browse</p>
                <p className="mt-3 text-xs text-slate-500">Supports PDF, PPT, DOCX, TXT and notes up to 50MB</p>
                <input type="file" onChange={handleUpload} className="hidden" accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.png,.jpg,.jpeg" />
              </label>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected Material</p>
                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                  <Field label="Choose material">
                    <SelectBox
                      value={selectedMaterialId}
                      onChange={(event) => setSelectedMaterialId(event.target.value)}
                      placeholder="Select material"
                      options={materialOptions}
                    />
                  </Field>
                  {selectedMaterial && (
                    <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                        <FileText size={19} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-950">{selectedMaterial.title || selectedMaterial.name}</p>
                        <p className="text-xs text-slate-500">{selectedMaterial.type || selectedMaterial.fileType || "FILE"} • {selectedMaterial.size || selectedMaterial.sizeLabel || "--"}</p>
                      </div>
                      <button onClick={() => setSelectedMaterialId("")} className="text-slate-400 hover:text-rose-500"><X size={16} /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardShell>

          <CardShell>
            <CardTitle icon={Layers} title="Group Category Section" subtitle="Choose a material category before generating flashcards." />
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
              {categories.length ? (
                categories.map((category) => (
                  <button
                    key={getItemId(category)}
                    onClick={() => setSelectedCategoryId(getItemId(category))}
                    className={`rounded-2xl border px-4 py-3 text-left transition hover:shadow-sm ${selectedCategoryId === getItemId(category) ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-700"}`}
                  >
                    <span className="block font-semibold text-slate-900">{category.name}</span>
                    <span className="text-xs text-slate-500">{category.materialCount ?? category.count ?? 0} materials</span>
                  </button>
                ))
              ) : (
                <div className="md:col-span-4">
                  <EmptyState title="No categories yet" text="Create categories in the Material page first." />
                </div>
              )}
            </div>
          </CardShell>

          <CardShell>
            <CardTitle icon={Sparkles} title="Generate Flashcards" subtitle="Generate cards from the selected material and category." />
            <div className="mt-5 grid grid-cols-1 items-end gap-4 md:grid-cols-4">
              <button
                onClick={handleGenerate}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles size={17} /> {busy ? "Working..." : "Generate Flashcards"}
              </button>
              <Field label="Difficulty Level">
                <SelectBox value={difficulty} onChange={(event) => setDifficulty(event.target.value)} placeholder="Medium" options={["Easy", "Medium", "Hard"]} />
              </Field>
              <Field label="Cards Per Topic">
                <SelectBox value={cardsPerTopic} onChange={(event) => setCardsPerTopic(event.target.value)} placeholder="10" options={["5", "10", "15", "20"]} />
              </Field>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-white px-5 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50">
                <BookOpen size={17} /> Review Set
              </button>
            </div>
          </CardShell>

          <CardShell>
            <CardTitle icon={BookOpen} title="Flashcard Preview & Review" subtitle="Review cards generated for this user account." />
            {firstCard ? (
              <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[190px_1fr_1fr]">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">Overall Progress</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-200"><div className="h-full w-[62%] rounded-full bg-indigo-600" /></div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Total Cards</span><b>{selectedSet?.cards?.length || selectedSet?.totalCards || 0}</b></div>
                    <div className="flex justify-between"><span className="text-slate-500">Reviewed</span><b>{selectedSet?.reviewedCount || 0}</b></div>
                    <div className="flex justify-between"><span className="text-slate-500">Accuracy</span><b>{selectedSet?.accuracy || 0}%</b></div>
                  </div>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
                  <p className="text-xs font-semibold text-indigo-600">Question</p>
                  <p className="mt-4 text-base font-semibold leading-relaxed text-slate-900">{firstCard.question}</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                  <p className="text-xs font-semibold text-emerald-600">Answer</p>
                  <p className="mt-4 text-base font-semibold leading-relaxed text-slate-900">{firstCard.answer}</p>
                  <div className="mt-5 flex gap-3">
                    <button onClick={() => handleReview("known")} className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">I knew this</button>
                    <button onClick={() => handleReview("unknown")} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">I didn't know this</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5"><EmptyState title="No flashcards yet" text="Upload material and click Generate Flashcards to create a set." /></div>
            )}
          </CardShell>
        </div>

        <aside className="space-y-5">
          <CardShell>
            <CardTitle icon={Brain} title="AI Recommendation" subtitle="Suggested sets from generated data." iconClass="bg-violet-50 text-violet-600" />
            <div className="mt-5 space-y-3">
              {sets.length ? (
                sets.slice(0, 5).map((set) => (
                  <button key={getItemId(set)} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50/50">
                    <span className="text-sm font-semibold text-slate-900">{set.title || set.name}</span>
                    <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-600">{set.totalCards || set.cards?.length || 0} cards</span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500">No generated sets yet.</p>
              )}
            </div>
          </CardShell>

          <CardShell>
            <h2 className="text-lg font-semibold text-indigo-600">Set Summary</h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-3"><span className="text-slate-500">Source Material</span><b>{selectedMaterial?.title || selectedMaterial?.name || "None"}</b></div>
              <div className="flex justify-between gap-3"><span className="text-slate-500">Total Sets</span><b>{sets.length}</b></div>
              <div className="flex justify-between gap-3"><span className="text-slate-500">Selected Category</span><b>{categories.find((cat) => getItemId(cat) === selectedCategoryId)?.name || "All"}</b></div>
            </div>
          </CardShell>
        </aside>
      </section>
    </>
  );
}
