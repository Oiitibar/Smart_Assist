import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Edit3, Eye, FileText, Folder, Link2, Plus, Trash2, UploadCloud, X } from "lucide-react";
import { createCategory, deleteCategory, getCategories } from "../../service/categoryApi";
import { assignMaterialCategory, deleteMaterial, getMaterials, uploadMaterial } from "../../service/materialApi";
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
  TextInput,
} from "./DashboardShared";

export default function MaterialPage() {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadMaterialPage = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [materialData, categoryData] = await Promise.all([getMaterials(), getCategories()]);
      const materialList = asArray(materialData);
      setMaterials(materialList);
      setCategories(asArray(categoryData));
      if (!selectedMaterialId && materialList[0]) setSelectedMaterialId(getItemId(materialList[0]));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load materials."));
    } finally {
      setLoading(false);
    }
  }, [selectedMaterialId]);

  useEffect(() => {
    loadMaterialPage();
  }, [loadMaterialPage]);

  const selectedMaterial = useMemo(
    () => materials.find((material) => getItemId(material) === selectedMaterialId),
    [materials, selectedMaterialId]
  );

  const materialOptions = materials.map((material) => ({
    value: getItemId(material),
    label: material.title || material.name || material.originalName || "Untitled material",
  }));

  const categoryOptions = categories.map((category) => ({
    value: getItemId(category),
    label: category.name,
  }));

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setBusy(true);
      setError("");
      setSuccess("");
      const uploaded = await uploadMaterial(file, selectedCategoryId);
      setSuccess("Material uploaded successfully.");
      await loadMaterialPage();
      if (getItemId(uploaded)) setSelectedMaterialId(getItemId(uploaded));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to upload material."));
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      setError("Please enter category name.");
      return;
    }

    try {
      setBusy(true);
      setError("");
      setSuccess("");
      await createCategory({ name: categoryName.trim() });
      setCategoryName("");
      setSuccess("Category created successfully.");
      await loadMaterialPage();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create category."));
    } finally {
      setBusy(false);
    }
  };

  const handleAssignCategory = async () => {
    if (!selectedMaterialId || !selectedCategoryId) {
      setError("Please select material and category.");
      return;
    }

    try {
      setBusy(true);
      setError("");
      setSuccess("");
      await assignMaterialCategory(selectedMaterialId, selectedCategoryId);
      setSuccess("Category assigned successfully.");
      await loadMaterialPage();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to assign category."));
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    try {
      setError("");
      await deleteMaterial(id);
      await loadMaterialPage();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete material."));
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      setError("");
      await deleteCategory(id);
      await loadMaterialPage();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete category."));
    }
  };

  if (loading) return <LoadingCard message="Loading materials and categories..." />;

  return (
    <>
      <PageHeader
        title="Materials"
        subtitle="Manage uploaded study materials and assign them to group categories."
      />

      <ErrorNotice message={error} onRetry={loadMaterialPage} />
      {success && <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        <div className="space-y-5 xl:col-span-3">
          <CardShell>
            <CardTitle icon={UploadCloud} title="Upload Study Materials" subtitle="Upload files, then connect them to categories for flashcard generation." />
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
              <label className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-6 text-center transition hover:bg-indigo-50 lg:col-span-2">
                <UploadCloud size={44} className="text-indigo-600" />
                <h3 className="mt-4 font-semibold text-indigo-600">Drag & drop files here</h3>
                <p className="mt-2 text-sm text-slate-500">PDF, DOCX, PPTX, TXT, images • Max 50MB per file</p>
                <span className="mt-5 rounded-xl border border-indigo-100 bg-white px-5 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50">
                  {busy ? "Uploading..." : "Browse Files"}
                </span>
                <input type="file" onChange={handleUpload} className="hidden" accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.png,.jpg,.jpeg" />
              </label>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-950">Recent Uploads</h3>
                  <button onClick={loadMaterialPage} className="text-xs font-semibold text-indigo-600">Refresh</button>
                </div>
                <div className="mt-3 space-y-3">
                  {materials.slice(0, 4).map((material) => (
                    <div key={getItemId(material)} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <MaterialTypeBadge type={material.type || material.fileType} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{material.title || material.name}</p>
                        <p className="text-xs text-slate-500">Uploaded</p>
                      </div>
                      <Check size={16} className="text-emerald-500" />
                    </div>
                  ))}
                  {!materials.length && <p className="text-sm text-slate-500">No recent uploads yet.</p>}
                </div>
              </div>
            </div>
          </CardShell>

          <CardShell>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle icon={Folder} title="Manage Categories" subtitle="Create, edit, and organize material group categories." />
              <div className="flex gap-2">
                <TextInput value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="New category" />
                <button onClick={handleCreateCategory} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
              {categories.length ? (
                categories.map((category) => (
                  <div key={getItemId(category)} className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3">
                    <div>
                      <p className="font-semibold text-slate-900">{category.name}</p>
                      <p className="text-xs text-slate-500">{category.materialCount ?? category.count ?? 0} materials</p>
                    </div>
                    <button onClick={() => handleDeleteCategory(getItemId(category))} className="text-rose-400 hover:text-rose-600"><Trash2 size={16} /></button>
                  </div>
                ))
              ) : (
                <div className="md:col-span-3 xl:col-span-5"><EmptyState title="No categories" text="Create your first category to organize materials." /></div>
              )}
            </div>
          </CardShell>

          <CardShell>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle icon={FileText} title="Material Library" subtitle="Browse, filter, and manage uploaded materials." />
              <span className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500">{materials.length} materials</span>
            </div>

            <div className="mt-5 overflow-x-auto">
              {materials.length ? (
                <table className="w-full min-w-[780px] text-left text-sm">
                  <thead className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="py-3">File Name</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Uploaded On</th>
                      <th>Size</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {materials.map((material) => (
                      <tr key={getItemId(material)}>
                        <td className="py-4 font-semibold text-slate-900">{material.title || material.name}</td>
                        <td><MaterialTypeBadge type={material.type || material.fileType} /></td>
                        <td><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">{material.category?.name || material.categoryName || "Unassigned"}</span></td>
                        <td className="text-slate-500">{material.uploadedAt ? new Date(material.uploadedAt).toLocaleString() : "--"}</td>
                        <td className="text-slate-500">{material.size || material.sizeLabel || "--"}</td>
                        <td>
                          <div className="flex justify-end gap-2 text-slate-400">
                            <Eye size={16} />
                            <Link2 size={16} />
                            <Edit3 size={16} />
                            <button onClick={() => handleDeleteMaterial(getItemId(material))}><Trash2 size={16} className="text-rose-400" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState title="No materials yet" text="Upload PDFs, PowerPoints, DOCX, TXT, or notes to start." />
              )}
            </div>
          </CardShell>
        </div>

        <aside className="space-y-5">
          <CardShell>
            <CardTitle icon={FileText} title="Material Overview" />
            <div className="mt-5 space-y-3">
              <StatBox value={materials.length} label="Total Materials" />
              <StatBox value={categories.length} label="Categories" />
              <StatBox value={materials.slice(0, 7).length} label="Recently Added" />
            </div>
          </CardShell>

          <CardShell>
            <CardTitle icon={Folder} title="Assign Category" subtitle="Connect input materials to a group category." />
            <div className="mt-5 space-y-4">
              <Field label="Selected Material">
                <SelectBox value={selectedMaterialId} onChange={(event) => setSelectedMaterialId(event.target.value)} placeholder="Select material" options={materialOptions} />
              </Field>
              <Field label="Assign to Category">
                <SelectBox value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)} placeholder="Select category" options={categoryOptions} />
              </Field>
              {selectedMaterial && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{selectedMaterial.title || selectedMaterial.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{selectedMaterial.size || "--"}</p>
                </div>
              )}
              <button onClick={handleAssignCategory} disabled={busy} className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                Assign Category
              </button>
            </div>
          </CardShell>
        </aside>
      </section>
    </>
  );
}

function StatBox({ value, label }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-3xl font-bold text-slate-950">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
