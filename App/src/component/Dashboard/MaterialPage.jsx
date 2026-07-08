import {
  BookOpen,
  Check,
  Edit3,
  Eye,
  FileText,
  Folder,
  Link2,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import {
  CATEGORIES,
  CardTitle,
  Field,
  MATERIALS,
  PageHeader,
  SelectBox,
  toneStyles,
} from "./DashboardShared";

function CategoryCard({ category }) {
  const Icon = category.Icon;
  return (
    <div className={`flex items-center justify-between rounded-2xl border p-3 ${toneStyles[category.tone]}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70">
          <Icon size={18} />
        </span>
        <div>
          <p className="font-semibold text-slate-900">{category.name}</p>
          <p className="text-xs text-slate-500">{category.count} materials</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-slate-400">
        <Edit3 size={15} />
        <Trash2 size={15} />
      </div>
    </div>
  );
}

export default function MaterialPage() {
  return (
    <>
      <PageHeader
        title="Materials"
        subtitle="Manage uploaded study materials and assign them to group categories."
      />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        <div className="space-y-5 xl:col-span-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <CardTitle
              icon={UploadCloud}
              title="Upload Study Materials"
              subtitle="Upload files, then connect them to categories for flashcard generation."
            />
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-6 text-center lg:col-span-2">
                <UploadCloud size={44} className="text-indigo-600" />
                <h3 className="mt-4 font-semibold text-indigo-600">Drag & drop files here</h3>
                <p className="mt-2 text-sm text-slate-500">
                  PDF, DOCX, PPTX, TXT, images • Max 50MB per file
                </p>
                <button className="mt-5 rounded-xl border border-indigo-100 bg-white px-5 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50">
                  Browse Files
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-950">Recent Uploads</h3>
                  <button className="text-xs font-semibold text-rose-500">Clear All</button>
                </div>
                <div className="mt-3 space-y-3">
                  {MATERIALS.slice(0, 4).map((material, index) => (
                    <div key={material.title} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <span className={`rounded-lg px-2 py-1 text-[10px] font-bold ${material.type === "PDF" ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"}`}>
                        {material.type}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{material.title}</p>
                        <p className="text-xs text-slate-500">{index === 0 ? "Uploading..." : "Uploaded"}</p>
                      </div>
                      {index === 0 ? <X size={16} className="text-slate-400" /> : <Check size={16} className="text-emerald-500" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle
                icon={Folder}
                title="Manage Categories"
                subtitle="Create, edit, and organize material group categories."
              />
              <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                <Plus size={16} /> Add Category
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {CATEGORIES.map((category) => (
                <CategoryCard key={category.name} category={category} />
              ))}
              <button className="flex min-h-[76px] items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/30 text-sm font-semibold text-indigo-600">
                <Plus size={17} /> Add New
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle
                icon={FileText}
                title="Material Library"
                subtitle="Browse, filter, and manage uploaded materials."
              />
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500">Search materials...</div>
                <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500">All Categories</div>
                <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500">Sort: Newest</div>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
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
                  {MATERIALS.map((material) => (
                    <tr key={material.title}>
                      <td className="py-4 font-semibold text-slate-900">{material.title}</td>
                      <td>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                          {material.type}
                        </span>
                      </td>
                      <td>
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                          {material.category}
                        </span>
                      </td>
                      <td className="text-slate-500">{material.uploaded}</td>
                      <td className="text-slate-500">{material.size}</td>
                      <td>
                        <div className="flex justify-end gap-2 text-slate-400">
                          <Eye size={16} />
                          <Link2 size={16} />
                          <Edit3 size={16} />
                          <Trash2 size={16} className="text-rose-400" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <CardTitle icon={FileText} title="Material Overview" />
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-3xl font-bold text-slate-950">68</p>
                <p className="text-sm text-slate-500">Total Materials</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-3xl font-bold text-slate-950">8</p>
                <p className="text-sm text-slate-500">Active Categories</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-3xl font-bold text-slate-950">5</p>
                <p className="text-sm text-slate-500">Recently Added</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <CardTitle
              icon={Folder}
              title="Assign Category"
              subtitle="Connect input materials to a group category."
            />
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Data Structures Notes.pdf</p>
              <p className="mt-1 text-xs text-slate-500">2.4 MB • May 23, 2025</p>
            </div>
            <Field label="Assign to Category">
              <SelectBox placeholder="Select a category" options={["ICT", "Physics", "Math", "English", "Science"]} />
            </Field>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {CATEGORIES.slice(0, 4).map((category) => (
                <button key={category.name} className={`rounded-xl border px-3 py-2 text-xs font-semibold ${toneStyles[category.tone]}`}>
                  {category.name}
                </button>
              ))}
            </div>
            <button className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
              Assign Category
            </button>
          </div>
        </aside>
      </section>
    </>
  );
}
