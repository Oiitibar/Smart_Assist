import { useState } from "react";
import {
  Bell,
  Calendar,
  Camera,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit3,
  Globe2,
  HelpCircle,
  Layers,
  LogOut,
  Lock,
  Mail,
  MessageSquare,
  Palette,
  Shield,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { CardTitle, Field, PageHeader, TextInput } from "./DashboardShared";

function SettingRow({ icon: Icon, title, subtitle, control }) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl p-1 md:grid-cols-[1fr_220px] md:items-center">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={19} />
        </span>
        <span>
          <b className="block text-slate-900">{title}</b>
          <span className="text-sm text-slate-500">{subtitle}</span>
        </span>
      </div>
      <button className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
        {control} <ChevronDown size={16} className="text-slate-400" />
      </button>
    </div>
  );
}

function SettingToggle({ icon: Icon, title, subtitle }) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl p-1 md:grid-cols-[1fr_80px] md:items-center">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={19} />
        </span>
        <span>
          <b className="block text-slate-900">{title}</b>
          <span className="text-sm text-slate-500">{subtitle}</span>
        </span>
      </div>
      <button className="flex h-8 w-14 items-center rounded-full bg-indigo-600 p-1">
        <span className="ml-auto h-6 w-6 rounded-full bg-white shadow-sm" />
      </button>
    </div>
  );
}

function HelpCard({ icon: Icon, title, text }) {
  return (
    <button className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40">
      <span className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Icon size={21} />
        </span>
        <span>
          <b className="block text-slate-900">{title}</b>
          <span className="text-sm text-slate-500">{text}</span>
        </span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-slate-400" />
    </button>
  );
}

export default function SettingPage({ onLogout }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    const shouldLogout = window.confirm("Are you sure you want to log out?");
    if (!shouldLogout) return;

    try {
      setIsLoggingOut(true);
      await onLogout?.();
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please check your backend logout API and try again.");
      setIsLoggingOut(false);
    }
  };
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, preferences, and help options."
      />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <CardTitle icon={User} title="Profile" subtitle="Manage your personal information and account." />
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[150px_1fr]">
            <div className="text-center">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-slate-200 text-3xl font-bold text-indigo-600">
                AJ
              </div>
              <button className="mt-4 inline-flex items-center gap-2 rounded-xl border border-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50">
                <Camera size={16} /> Change Photo
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Full Name">
                <TextInput value="Alex Johnson" />
              </Field>
              <Field label="Email Address">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm">
                  <input value="alex.johnson@student.com" readOnly className="w-full bg-transparent outline-none" />
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">Verified</span>
                </div>
              </Field>
            </div>
          </div>

          <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200">
            <button className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50">
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Lock size={18} /></span>
                <span><b className="block text-slate-900">Password & Security</b><span className="text-sm text-slate-500">Update password and manage security.</span></span>
              </span>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
            <button className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50">
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Shield size={18} /></span>
                <span><b className="block text-slate-900">Account Details</b><span className="text-sm text-slate-500">View account type and membership details.</span></span>
              </span>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <CardTitle icon={SlidersHorizontal} title="Preferences" subtitle="Customize your app experience." />
          <div className="mt-6 space-y-5">
            <SettingRow icon={Palette} title="Theme" subtitle="Choose your preferred app appearance." control="Light" />
            <SettingToggle icon={Bell} title="Notifications" subtitle="Receive important updates and alerts." />
            <SettingRow icon={Clock} title="Study Reminders" subtitle="Get reminded about your study sessions." control="30 minutes before" />
            <SettingRow icon={Globe2} title="Language" subtitle="Select your preferred language." control="English" />
            <SettingRow icon={Calendar} title="Timetable Preferences" subtitle="Default view and scheduling preferences." control="Week View" />
            <SettingRow icon={Layers} title="Flashcard Preferences" subtitle="Default review mode and card order." control="Review All" />
          </div>
          <div className="mt-6 flex justify-end">
            <button className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
              Save Preferences
            </button>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-rose-100 bg-rose-50/60 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
              <LogOut size={22} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Log out account</h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                End your current Smart Assist session. This clears your login session and sends you back to the login page.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={17} />
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <CardTitle icon={HelpCircle} title="Help & Support" subtitle="Get help, view FAQs, or share feedback." />
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <HelpCard icon={MessageSquare} title="FAQs" text="Find answers to common questions and learn how to use Smart Assist." />
          <HelpCard icon={Mail} title="Contact Support" text="Reach out to our support team for personalized assistance." />
          <HelpCard icon={Edit3} title="Send Feedback" text="Share your feedback or request a new feature." />
        </div>
      </section>
    </>
  );
}
