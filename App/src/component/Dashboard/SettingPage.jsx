import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Camera,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit3,
  Globe2,
  HelpCircle,
  Layers,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Palette,
  Shield,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { getMe, logoutUser } from "../../service/authApi";
import { updatePreferences, updateProfile } from "../../service/settingApi";
import { getErrorMessage } from "../../service/axios";
import {
  CardShell,
  CardTitle,
  ErrorNotice,
  Field,
  LoadingCard,
  PageHeader,
  SelectBox,
  TextInput,
} from "./DashboardShared";

const initialProfile = {
  name: "",
  email: "",
};

const initialPreferences = {
  theme: "light",
  notifications: true,
  studyReminder: "30 minutes before",
  language: "English",
  timetableView: "Week View",
  flashcardMode: "Review All",
};

export default function SettingPage() {
  const [profile, setProfile] = useState(initialProfile);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const user = await getMe();
      const userData = user?.user || user;
      setProfile({
        name: userData?.name || userData?.fullName || "",
        email: userData?.email || "",
      });
      setPreferences({
        ...initialPreferences,
        ...(userData?.preferences || {}),
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load settings."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences((current) => ({ ...current, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await updateProfile(profile);
      setSuccess("Profile updated successfully.");
      await loadSettings();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update profile."));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await updatePreferences(preferences);
      setSuccess("Preferences saved successfully.");
      await loadSettings();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save preferences."));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;

    try {
      setLoggingOut(true);
      await logoutUser();
    } catch (err) {
      console.error("Backend logout failed:", err);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      const loginPath = import.meta.env.VITE_LOGIN_PATH || "/Smart_Assist/Login";
      window.location.assign(loginPath);
    }
  };

  if (loading) return <LoadingCard message="Loading profile and preferences..." />;

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your profile, preferences, help options, and account session." />
      <ErrorNotice message={error} onRetry={loadSettings} />
      {success && <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <CardShell>
          <CardTitle icon={User} title="Profile" subtitle="Manage your personal information and account." />
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[150px_1fr]">
            <div className="text-center">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-slate-200 text-3xl font-bold text-indigo-600">
                {(profile.name || profile.email || "S").slice(0, 2).toUpperCase()}
              </div>
              <button className="mt-4 inline-flex items-center gap-2 rounded-xl border border-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50">
                <Camera size={16} /> Change Photo
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Full Name">
                <TextInput name="name" value={profile.name} onChange={handleProfileChange} placeholder="Student name" />
              </Field>
              <Field label="Email Address">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm">
                  <input value={profile.email} readOnly className="w-full bg-transparent outline-none" />
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">Verified</span>
                </div>
              </Field>
              <button onClick={handleSaveProfile} disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>

          <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200">
            <SettingsNavItem icon={Lock} title="Password & Security" text="Update password and manage security." />
            <SettingsNavItem icon={Shield} title="Account Details" text="View account type and membership details." />
          </div>
        </CardShell>

        <CardShell>
          <CardTitle icon={SlidersHorizontal} title="Preferences" subtitle="Customize your app experience." />
          <div className="mt-6 space-y-5">
            <SettingRow icon={Palette} title="Theme" subtitle="Choose your preferred app appearance.">
              <SelectBox value={preferences.theme} onChange={(e) => handlePreferenceChange("theme", e.target.value)} placeholder="Theme" options={["light", "dark"]} />
            </SettingRow>
            <SettingToggle
              icon={Bell}
              title="Notifications"
              subtitle="Receive important updates and alerts."
              checked={Boolean(preferences.notifications)}
              onToggle={() => handlePreferenceChange("notifications", !preferences.notifications)}
            />
            <SettingRow icon={Clock} title="Study Reminders" subtitle="Get reminded about your study sessions.">
              <SelectBox value={preferences.studyReminder} onChange={(e) => handlePreferenceChange("studyReminder", e.target.value)} placeholder="Reminder" options={["10 minutes before", "30 minutes before", "1 hour before"]} />
            </SettingRow>
            <SettingRow icon={Globe2} title="Language" subtitle="Select your preferred language.">
              <SelectBox value={preferences.language} onChange={(e) => handlePreferenceChange("language", e.target.value)} placeholder="Language" options={["English", "Myanmar"]} />
            </SettingRow>
            <SettingRow icon={Calendar} title="Timetable Preferences" subtitle="Default view and scheduling preferences.">
              <SelectBox value={preferences.timetableView} onChange={(e) => handlePreferenceChange("timetableView", e.target.value)} placeholder="Timetable View" options={["Day View", "Week View", "Month View"]} />
            </SettingRow>
            <SettingRow icon={Layers} title="Flashcard Preferences" subtitle="Default review mode and card order.">
              <SelectBox value={preferences.flashcardMode} onChange={(e) => handlePreferenceChange("flashcardMode", e.target.value)} placeholder="Flashcard Mode" options={["Review All", "Easy First", "Hard First", "Mixed"]} />
            </SettingRow>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleSavePreferences} disabled={saving} className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </CardShell>
      </section>

      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <CardTitle icon={HelpCircle} title="Help & Support" subtitle="Get help, view FAQs, or share feedback." />
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <HelpCard icon={MessageSquare} title="FAQs" text="Find answers to common questions and learn how to use Smart Student Planner." />
          <HelpCard icon={Mail} title="Contact Support" text="Reach out to our support team for personalized assistance." />
          <HelpCard icon={Edit3} title="Send Feedback" text="Share your feedback or request a new feature." />
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <LogOut size={21} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Log out account</h2>
              <p className="mt-1 text-sm text-slate-500">This will clear the current session and return you to the login page.</p>
            </div>
          </div>
          <button onClick={handleLogout} disabled={loggingOut} className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </section>
    </>
  );
}

function SettingsNavItem({ icon: Icon, title, text }) {
  return (
    <button className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50">
      <span className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon size={18} /></span>
        <span><b className="block text-slate-900">{title}</b><span className="text-sm text-slate-500">{text}</span></span>
      </span>
      <ChevronRight size={18} className="text-slate-400" />
    </button>
  );
}

function SettingRow({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl p-1 md:grid-cols-[1fr_220px] md:items-center">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon size={19} /></span>
        <span><b className="block text-slate-900">{title}</b><span className="text-sm text-slate-500">{subtitle}</span></span>
      </div>
      {children}
    </div>
  );
}

function SettingToggle({ icon: Icon, title, subtitle, checked, onToggle }) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl p-1 md:grid-cols-[1fr_80px] md:items-center">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon size={19} /></span>
        <span><b className="block text-slate-900">{title}</b><span className="text-sm text-slate-500">{subtitle}</span></span>
      </div>
      <button onClick={onToggle} className={`flex h-8 w-14 items-center rounded-full p-1 transition ${checked ? "bg-indigo-600" : "bg-slate-300"}`}>
        <span className={`h-6 w-6 rounded-full bg-white shadow-sm transition ${checked ? "ml-auto" : ""}`} />
      </button>
    </div>
  );
}

function HelpCard({ icon: Icon, title, text }) {
  return (
    <button className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40">
      <span className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><Icon size={21} /></span>
        <span><b className="block text-slate-900">{title}</b><span className="text-sm text-slate-500">{text}</span></span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-slate-400" />
    </button>
  );
}
