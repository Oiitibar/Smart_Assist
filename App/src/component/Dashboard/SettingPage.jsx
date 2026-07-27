import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  Camera,
  Check,
  RotateCcw,
  Sparkles,
  Clock3,
  Globe2,
  HelpCircle,
  Layers3,
  Mail,
  MessageSquare,
  Moon,
  Save,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react";
import { PageHeader } from "./DashboardShared";
import {
  inputClass,
  labelClass,
  pageClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
  selectClass,
} from "./ui";
import { resolveAvatarUrl } from "../../utils/avatar";

const FREE_AVATARS = [
  { name: "Nova", url: "https://api.dicebear.com/10.x/lorelei/svg?seed=Nova&backgroundColor=b6e3f4&radius=20" },
  { name: "Milo", url: "https://api.dicebear.com/10.x/lorelei/svg?seed=Milo&backgroundColor=c0aede&radius=20" },
  { name: "Luna", url: "https://api.dicebear.com/10.x/lorelei/svg?seed=Luna&backgroundColor=d1d4f9&radius=20" },
  { name: "Kai", url: "https://api.dicebear.com/10.x/lorelei/svg?seed=Kai&backgroundColor=ffd5dc&radius=20" },
  { name: "Sage", url: "https://api.dicebear.com/10.x/lorelei/svg?seed=Sage&backgroundColor=c1f4c5&radius=20" },
  { name: "Ari", url: "https://api.dicebear.com/10.x/lorelei/svg?seed=Ari&backgroundColor=ffdfbf&radius=20" },
  { name: "Zoe", url: "https://api.dicebear.com/10.x/lorelei/svg?seed=Zoe&backgroundColor=f1f4dc&radius=20" },
  { name: "Theo", url: "https://api.dicebear.com/10.x/lorelei/svg?seed=Theo&backgroundColor=bde7ff&radius=20" },
];

export default function SettingPage({ user, profile, settings, onSaveProfile, onSaveSettings, onUploadAvatar, onSetAvatar }) {
  const [draftProfile, setDraftProfile] = useState(profile);
  const [draftSettings, setDraftSettings] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selectingAvatar, setSelectingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => setDraftProfile(profile), [profile]);
  useEffect(() => setDraftSettings(settings), [settings]);

  const updateSetting = (key, value) => {
    const next = { ...draftSettings, [key]: value };
    setDraftSettings(next);
    if (key === "darkMode") onSaveSettings(next, true).catch(() => {});
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSaveProfile(draftProfile);
      await onSaveSettings(draftSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file) => {
    if (!file || uploadingAvatar || selectingAvatar) return;
    setUploadingAvatar(true);
    try {
      await onUploadAvatar?.(file);
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const chooseAvatar = async (avatarUrl) => {
    if (uploadingAvatar || selectingAvatar) return;
    setSelectingAvatar(true);
    try {
      await onSetAvatar?.(avatarUrl);
    } finally {
      setSelectingAvatar(false);
    }
  };

  const avatarSrc = resolveAvatarUrl(user?.avatarUrl);
  const initials = (draftProfile.fullName || user?.name || user?.fullName || "Student")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={pageClass}>
      <PageHeader
        eyebrow="Personalize your workspace"
        title="Settings"
        description="Manage your profile and study preferences. These values are stored separately for each signed-in user."
        action={
          <button className={primaryButtonClass} onClick={save} disabled={saving}>
            {saved ? <Check size={17} /> : <Save size={17} />} {saving ? "Saving..." : saved ? "Saved" : "Save changes"}
          </button>
        }
      />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className={`${panelClass} p-4 sm:p-5`}>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
              <UserRound size={21} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Profile</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Personal and academic information</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Profile"
                className="h-20 w-20 shrink-0 rounded-2xl object-cover shadow-sm"
              />
            ) : (
              <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-sm">
                {initials}
              </span>
            )}
            <div className="min-w-0">
              <strong className="text-sm text-slate-900 dark:text-white">Profile avatar</strong>
              <p className="mt-1 text-xs leading-5 text-slate-400">Upload your photo, choose a free avatar, or restore the default initials.</p>
              <input
                ref={avatarInputRef}
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => uploadAvatar(event.target.files?.[0])}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={secondaryButtonClass}
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar || selectingAvatar}
                >
                  <Camera size={16} /> {uploadingAvatar ? "Uploading..." : "Upload photo"}
                </button>
                <button
                  type="button"
                  className={secondaryButtonClass}
                  onClick={() => chooseAvatar("")}
                  disabled={uploadingAvatar || selectingAvatar || !user?.avatarUrl}
                >
                  <RotateCcw size={16} /> Use default
                </button>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">Uploaded images: JPG, PNG or WEBP, maximum 2 MB.</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-violet-500" />
              <div>
                <strong className="block text-sm text-slate-900 dark:text-white">Choose a avatar</strong>
                {/* <p className="mt-0.5 text-[11px] text-slate-400">Generated by DiceBear. No API key is required.</p> */}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
              {FREE_AVATARS.map((avatar) => {
                const selected = user?.avatarUrl === avatar.url;
                return (
                  <button
                    key={avatar.url}
                    type="button"
                    onClick={() => chooseAvatar(avatar.url)}
                    disabled={uploadingAvatar || selectingAvatar}
                    className={`relative overflow-hidden rounded-2xl border-2 bg-white p-1 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-950 ${
                      selected
                        ? "border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-500/20"
                        : "border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                    }`}
                    aria-label={`Use ${avatar.name} avatar`}
                    aria-pressed={selected}
                  >
                    <img src={avatar.url} alt="" className="aspect-square w-full rounded-xl object-cover" />
                    {selected && (
                      <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-indigo-600 text-white shadow">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {selectingAvatar && <p className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300">Updating avatar...</p>}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>
              Full name
              <input
                className={inputClass}
                value={draftProfile.fullName || ""}
                onChange={(event) => setDraftProfile({ ...draftProfile, fullName: event.target.value })}
              />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Email address
              <input className={inputClass} type="email" value={draftProfile.email || user?.email || ""} readOnly />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Phone number
              <input
                className={inputClass}
                value={draftProfile.phone || ""}
                onChange={(event) => setDraftProfile({ ...draftProfile, phone: event.target.value })}
                placeholder="Your phone number"
              />
            </label>
            <label className={labelClass}>
              School or institution
              <input
                className={inputClass}
                value={draftProfile.school || ""}
                onChange={(event) => setDraftProfile({ ...draftProfile, school: event.target.value })}
                placeholder="Your school"
              />
            </label>
            <label className={labelClass}>
              Grade or program
              <input
                className={inputClass}
                value={draftProfile.grade || ""}
                onChange={(event) => setDraftProfile({ ...draftProfile, grade: event.target.value })}
                placeholder="e.g. Year 2"
              />
            </label>
            {/* <label className={`${labelClass} sm:col-span-2`}>
              Subjects
              <input
                className={inputClass}
                value={draftProfile.subjects || ""}
                onChange={(event) => setDraftProfile({ ...draftProfile, subjects: event.target.value })}
                placeholder="Mathematics, Physics, English"
              />
            </label> */}
          </div>
        </article>

        <article className={`${panelClass} p-4 sm:p-5`}>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
              <Moon size={21} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Preferences</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Theme, reminders, timetable and flashcard defaults</p>
            </div>
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            <PreferenceRow icon={draftSettings.darkMode ? Moon : Sun} title="Theme" detail="Switch between light and dark mode">
              <button
                type="button"
                onClick={() => updateSetting("darkMode", !draftSettings.darkMode)}
                className={`relative h-7 w-12 rounded-full p-1 transition ${draftSettings.darkMode ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}
                role="switch"
                aria-checked={draftSettings.darkMode}
              >
                <i className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${draftSettings.darkMode ? "translate-x-5" : ""}`} />
              </button>
            </PreferenceRow>

            {/* <PreferenceRow icon={Bell} title="Notifications" detail="Receive class and flashcard reminders">
              <button
                type="button"
                onClick={() => updateSetting("notifications", !draftSettings.notifications)}
                className={`relative h-7 w-12 rounded-full p-1 transition ${draftSettings.notifications ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}
                role="switch"
                aria-checked={draftSettings.notifications}
              >
                <i className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${draftSettings.notifications ? "translate-x-5" : ""}`} />
              </button>
            </PreferenceRow> */}

            {/* <PreferenceRow icon={Clock3} title="Study reminder" detail="When the app should remind you">
              <select className={`${selectClass} w-full sm:w-48`} value={draftSettings.studyReminder} onChange={(event) => updateSetting("studyReminder", event.target.value)}>
                <option>10 minutes before</option>
                <option>15 minutes before</option>
                <option>30 minutes before</option>
                <option>1 hour before</option>
              </select>
            </PreferenceRow> */}

            <PreferenceRow icon={Globe2} title="Language" detail="Default application language">
              <select className={`${selectClass} w-full sm:w-48`} value={draftSettings.language} onChange={(event) => updateSetting("language", event.target.value)}>
                <option>English</option><option>Myanmar</option>
              </select>
            </PreferenceRow>

            <PreferenceRow icon={CalendarDays} title="Timetable view" detail="Default timetable layout">
              <select className={`${selectClass} w-full sm:w-48`} value={draftSettings.timetableView} onChange={(event) => updateSetting("timetableView", event.target.value)}>
                <option>Week View</option><option>List View</option>
              </select>
            </PreferenceRow>

            {/* <PreferenceRow icon={Layers3} title="Flashcard mode" detail="Default review selection">
              <select className={`${selectClass} w-full sm:w-48`} value={draftSettings.flashcardMode} onChange={(event) => updateSetting("flashcardMode", event.target.value)}>
                <option>Review All</option><option>Unknown First</option><option>Random Order</option>
              </select>
            </PreferenceRow> */}
          </div>
        </article>
      </section>

      <section className={`${panelClass} mt-4 p-4 sm:p-5`}>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
            <HelpCircle size={21} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Help and account</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Support, privacy, and data controls</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <HelpCard icon={MessageSquare} title="FAQs" text="Learn how timetable, materials, and flashcards work." />
          <HelpCard icon={Mail} title="Contact support" text="Ask for help with your Smart Assist account." />
          <HelpCard icon={ShieldCheck} title="Privacy and data" text="Your records are filtered by the signed-in user ID." />
        </div>
      </section>
    </div>
  );
}

function PreferenceRow({ icon: Icon, title, detail, children }) {
  return (
    <div className="grid gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Icon size={17} /></span>
        <div>
          <strong className="block text-sm text-slate-900 dark:text-white">{title}</strong>
          <p className="mt-0.5 text-[11px] text-slate-400">{detail}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function HelpCard({ icon: Icon, title, text }) {
  return (
    <button className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3.5 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40 dark:border-slate-800 dark:hover:border-indigo-800 dark:hover:bg-indigo-500/5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"><Icon size={17} /></span>
      <span>
        <strong className="block text-sm text-slate-900 dark:text-white">{title}</strong>
        <span className="mt-1 block text-[11px] leading-5 text-slate-500 dark:text-slate-400">{text}</span>
      </span>
    </button>
  );
}
