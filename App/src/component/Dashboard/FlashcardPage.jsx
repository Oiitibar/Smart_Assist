import {
  BookOpen,
  Brain,
  FileText,
  Layers,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import {
  CardTitle,
  Field,
  FLASHCARD_TOPICS,
  PageHeader,
  SelectBox,
  SUGGESTED_SETS,
  toneStyles,
} from "./DashboardShared";

function TopicCard({ item }) {
  const Icon = item.Icon;
  return (
    <button className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition hover:shadow-sm ${toneStyles[item.tone]}`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70">
        <Icon size={19} />
      </span>
      <span>
        <span className="block font-semibold text-slate-900">{item.name}</span>
        <span className="text-xs text-slate-500">{item.cards} cards</span>
      </span>
    </button>
  );
}

export default function FlashcardPage() {
  return (
    <>
      <PageHeader
        title="AI Flashcards"
        subtitle="Input materials, detect topic groups, and generate review flashcards."
      />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        <div className="space-y-5 xl:col-span-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <CardTitle
              icon={UploadCloud}
              title="Add Source Material"
              subtitle="Upload or choose material to generate flashcards."
            />

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-6 text-center lg:col-span-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
                  <UploadCloud size={28} />
                </div>
                <h3 className="mt-4 font-semibold text-slate-950">Drag & drop files here</h3>
                <p className="mt-1 text-sm text-indigo-600">or click to browse</p>
                <p className="mt-3 text-xs text-slate-500">
                  Supports PDF, PPT, DOCX, TXT and notes up to 50MB
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Selected Material
                </p>
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <FileText size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      Data Structures Notes.pdf
                    </p>
                    <p className="text-xs text-slate-500">PDF • 1.2 MB</p>
                  </div>
                  <button className="text-slate-400 hover:text-rose-500">
                    <X size={16} />
                  </button>
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Added on
                </p>
                <p className="mt-1 text-sm text-slate-600">May 19, 2025, 09:30 AM</p>
                <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-white px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50">
                  <UploadCloud size={16} /> Change Material
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <CardTitle
              icon={Layers}
              title="Topics / Categories Detected"
              subtitle="AI extracts the main topic groups from the uploaded material."
            />
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
              {FLASHCARD_TOPICS.map((item) => (
                <TopicCard key={item.name} item={item} />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <CardTitle
              icon={Sparkles}
              title="Generate Flashcards"
              subtitle="Choose category, difficulty, and number of cards per topic."
            />
            <div className="mt-5 grid grid-cols-1 items-end gap-4 md:grid-cols-4">
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
                <Sparkles size={17} /> Generate Flashcards
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-white px-5 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50">
                <BookOpen size={17} /> Review Set
              </button>
              <Field label="Difficulty Level">
                <SelectBox placeholder="Medium" options={["Easy", "Medium", "Hard"]} />
              </Field>
              <Field label="Cards Per Topic">
                <SelectBox placeholder="10" options={["5", "10", "15", "20"]} />
              </Field>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <CardTitle
              icon={BookOpen}
              title="Flashcard Preview & Review"
              subtitle="Review sample cards from the generated set."
            />
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[190px_1fr_1fr]">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">Overall Progress</p>
                <div className="mt-3 h-2 rounded-full bg-slate-200">
                  <div className="h-full w-[62%] rounded-full bg-indigo-600" />
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Total Cards</span><b>120</b></div>
                  <div className="flex justify-between"><span className="text-slate-500">Reviewed</span><b>75</b></div>
                  <div className="flex justify-between"><span className="text-slate-500">Remaining</span><b>45</b></div>
                  <div className="flex justify-between"><span className="text-slate-500">Accuracy</span><b>78%</b></div>
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
                <div className="flex items-center justify-between text-xs text-indigo-600">
                  <span className="font-semibold">Question</span>
                  <span>1 / 120</span>
                </div>
                <p className="mt-4 text-base font-semibold leading-relaxed text-slate-900">
                  What is the time complexity of searching an element in a balanced binary search tree?
                </p>
                <button className="mt-5 rounded-xl border border-indigo-100 bg-white px-4 py-2 text-sm font-semibold text-indigo-600">
                  Show Answer
                </button>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                <p className="text-xs font-semibold text-emerald-600">Answer</p>
                <p className="mt-4 text-base font-semibold leading-relaxed text-slate-900">
                  The time complexity is O(log n), because each search step eliminates half of the remaining elements.
                </p>
                <div className="mt-5 flex gap-3">
                  <button className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                    I knew this
                  </button>
                  <button className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
                    I didn&apos;t know this
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <CardTitle
              icon={Brain}
              title="AI Recommendation"
              subtitle="Suggested sets based on the selected material."
              iconClass="bg-violet-50 text-violet-600"
            />
            <div className="mt-5 space-y-3">
              {SUGGESTED_SETS.map((set, index) => (
                <button
                  key={set.title}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50/50 ${
                    index === 0 ? "border-indigo-200 bg-indigo-50/70" : "border-slate-200 bg-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Sparkles size={17} />
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{set.title}</span>
                  </span>
                  <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-600">
                    {set.cards} cards
                  </span>
                </button>
              ))}
            </div>
            <button className="mt-4 w-full rounded-xl border border-indigo-100 bg-white px-4 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50">
              Generate All Sets
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-indigo-600">Set Summary</h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-3"><span className="text-slate-500">Source Material</span><b>Data Structures Notes.pdf</b></div>
              <div className="flex justify-between gap-3"><span className="text-slate-500">Total Cards</span><b>120</b></div>
              <div className="flex justify-between gap-3"><span className="text-slate-500">Estimated Study Time</span><b>2h 30m</b></div>
              <div className="flex justify-between gap-3"><span className="text-slate-500">Last Generated</span><b>May 19, 2025</b></div>
            </div>
            <button className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
              View Full Set
            </button>
          </div>
        </aside>
      </section>
    </>
  );
}
