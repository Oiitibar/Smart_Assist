import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser, logoutUser } from "../../service/auth";
import { plannerApi } from "../../service/plannerApi";
import DashboardHome from "./DashboardHome";
import StudyPage from "./StudyPage";
import MaterialPage from "./MaterialPage";
import SettingPage from "./SettingPage";
import Sidebar from "./Sidebar";
import TimetablePage from "./TimetablePage";
import Topbar from "./Topbar";

const titles = {
  dashboard: "Dashboard",
  timetable: "Timetable",
  flashcard: "Flashcards",
  material: "Materials",
  setting: "Settings",
};

const dayToShort = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

const shortToDay = Object.fromEntries(
  Object.entries(dayToShort).map(([longDay, shortDay]) => [shortDay, longDay]),
);

const defaultSettings = {
  darkMode: localStorage.getItem("smart-assist-theme") === "dark",
  notifications: true,
  studyReminder: "30 minutes before",
  language: "English",
  timetableView: "Week View",
  flashcardMode: "Review All",
};

const defaultProfile = {
  fullName: "",
  email: "",
  phone: "",
  school: "",
  grade: "",
  subjects: "",
};

const paletteFallback = [
  ["#4f46e5", "#eef2ff", "📘"],
  ["#8b5cf6", "#f5f3ff", "📐"],
  ["#0ea5e9", "#f0f9ff", "⚛️"],
  ["#10b981", "#ecfdf5", "🧬"],
];

function getId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
}

function formatUpdated(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function readableSize(bytes) {
  if (!bytes) return "Unknown size";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeUser(response) {
  const candidate = response?.data?.user || response?.user || response?.data || response;
  if (!candidate || typeof candidate !== "object") return null;
  const name = candidate.name || candidate.fullName || "Student";
  return {
    ...candidate,
    id: getId(candidate),
    name,
    fullName: candidate.fullName || name,
  };
}

function normalizeCategory(category, index = 0) {
  const fallback = paletteFallback[index % paletteFallback.length];
  const color = category.color?.startsWith("#") ? category.color : fallback[0];
  return {
    ...category,
    id: getId(category),
    name: category.name || "Untitled category",
    color,
    soft: category.soft || `${color}18`,
    emoji: category.emoji || fallback[2],
  };
}

function normalizeMaterial(material) {
  const categoryId = getId(material.categoryId);
  const type = material.fileType || material.type || "FILE";
  return {
    ...material,
    id: getId(material),
    categoryId,
    type,
    title: material.title || material.originalName || "Untitled material",
    detail: material.description || `${type} · ${readableSize(material.size)}`,
    updated: formatUpdated(material.updatedAt || material.createdAt),
    filePath: material.fileUrl || material.filePath || "",
  };
}

function normalizeSchedule(item) {
  return {
    ...item,
    id: getId(item),
    title: item.subject || item.title || "Untitled class",
    day: dayToShort[item.day] || item.day,
    start: item.startTime || item.start,
    end: item.endTime || item.end,
    room: item.room || "Room TBA",
    teacher: item.teacher || "Instructor TBA",
    type: item.type || "Lecture",
    color: item.color?.startsWith("#") ? item.color : "#4f46e5",
  };
}

function normalizeTask(task) {
  return {
    ...task,
    id: getId(task),
    title: task.title || "Untitled task",
    detail: task.detail || "Personal task",
  };
}

function normalizeFlashcards(sets) {
  return (sets || []).reduce((grouped, set) => {
    const categoryId = getId(set.categoryId);
    if (!categoryId) return grouped;
    const materialTitle = set.materialId?.title || set.sourceTitle || set.title || "Manual";
    const normalizedCards = (set.cards || []).map((card) => ({
      ...card,
      id: getId(card),
      setId: getId(set),
      source: materialTitle,
      reviewed: Boolean(card.reviewed),
      correct: Boolean(card.correct),
    }));
    grouped[categoryId] = [...(grouped[categoryId] || []), ...normalizedCards];
    return grouped;
  }, {});
}

function profileFromUser(user) {
  return {
    fullName: user?.fullName || user?.name || "",
    email: user?.email || "",
    phone: user?.profile?.phone || "",
    school: user?.profile?.school || "",
    grade: user?.profile?.grade || "",
    subjects: Array.isArray(user?.profile?.subjects)
      ? user.profile.subjects.join(", ")
      : user?.profile?.subjects || "",
  };
}

function settingsFromUser(user) {
  const preferences = user?.preferences || {};
  return {
    ...defaultSettings,
    ...preferences,
    darkMode:
      typeof preferences.darkMode === "boolean"
        ? preferences.darkMode
        : preferences.theme === "dark" || defaultSettings.darkMode,
  };
}

export default function DashboardPage() {
  const pageFromHash = window.location.hash.replace("#/", "");
  const [activePage, setActivePage] = useState(titles[pageFromHash] ? pageFromHash : "dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [flashcards, setFlashcards] = useState({});
  const [schedules, setSchedules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [profile, setProfile] = useState(defaultProfile);
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const showError = useCallback((requestError, fallback) => {
    const message = requestError?.response?.data?.message || requestError?.data?.message || requestError?.message || fallback;
    setError(message);
    setNotice("");
    if (requestError?.response?.status === 401 || requestError?.status === 401) {
      window.location.href = "/Smart_Assist/Login";
    }
  }, []);

  const showNotice = useCallback((message) => {
    setNotice(message);
    setError("");
    window.clearTimeout(window.__smartAssistNoticeTimer);
    window.__smartAssistNoticeTimer = window.setTimeout(() => setNotice(""), 2200);
  }, []);

  const loadWorkspace = useCallback(async () => {
    const [categoryData, materialData, timetableData, flashcardData, taskData] = await Promise.all([
      plannerApi.getCategories(),
      plannerApi.getMaterials(),
      plannerApi.getTimetable(),
      plannerApi.getFlashcards(),
      plannerApi.getTasks(),
    ]);

    setCategories((categoryData || []).map(normalizeCategory));
    setMaterials((materialData || []).map(normalizeMaterial));
    setSchedules((timetableData || []).map(normalizeSchedule));
    setFlashcards(normalizeFlashcards(flashcardData));
    setTasks((taskData || []).map(normalizeTask));
  }, []);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try {
        const userResponse = await getCurrentUser();
        const currentUser = normalizeUser(userResponse);
        if (!currentUser) throw new Error("Could not load your account");
        if (!active) return;
        setUser(currentUser);
        setProfile(profileFromUser(currentUser));
        setSettings(settingsFromUser(currentUser));
        await loadWorkspace();
      } catch (requestError) {
        if (active) showError(requestError, "Could not load your workspace");
      } finally {
        if (active) setLoading(false);
      }
    };

    initialize();
    return () => {
      active = false;
    };
  }, [loadWorkspace, showError]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", Boolean(settings.darkMode));
    localStorage.setItem("smart-assist-theme", settings.darkMode ? "dark" : "light");
  }, [settings.darkMode]);

  useEffect(() => {
    const onHashChange = () => {
      const page = window.location.hash.replace("#/", "");
      if (titles[page]) setActivePage(page);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (page) => {
    setActivePage(page);
    window.location.hash = `/${page}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addCategory = async (category) => {
    try {
      const created = await plannerApi.createCategory(category);
      const normalized = normalizeCategory(created, categories.length);
      setCategories((value) => [normalized, ...value]);
      setFlashcards((value) => ({ ...value, [normalized.id]: value[normalized.id] || [] }));
      showNotice("Category created");
      return normalized;
    } catch (requestError) {
      showError(requestError, "Could not create category");
      throw requestError;
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category? Materials will become uncategorized.")) return;
    try {
      await plannerApi.deleteCategory(id);
      setCategories((value) => value.filter((item) => item.id !== id));
      setMaterials((value) => value.map((item) => item.categoryId === id ? { ...item, categoryId: "" } : item));
      setFlashcards((value) => {
        const next = { ...value };
        delete next[id];
        return next;
      });
      showNotice("Category deleted");
    } catch (requestError) {
      showError(requestError, "Could not delete category");
    }
  };

  const addMaterial = async (payload) => {
    try {
      const created = await plannerApi.uploadMaterial(payload);
      const normalized = normalizeMaterial(created);
      setMaterials((value) => [normalized, ...value]);
      showNotice("Material uploaded");
      return normalized;
    } catch (requestError) {
      showError(requestError, "Could not upload material");
      throw requestError;
    }
  };

  const deleteMaterial = async (id) => {
    if (!window.confirm("Delete this material and its stored file?")) return;
    try {
      await plannerApi.deleteMaterial(id);
      setMaterials((value) => value.filter((item) => item.id !== id));
      await refreshFlashcards();
      showNotice("Material deleted");
    } catch (requestError) {
      showError(requestError, "Could not delete material");
    }
  };

  const addSchedule = async (item) => {
    try {
      const created = await plannerApi.createTimetable({
        subject: item.title,
        day: shortToDay[item.day] || item.day,
        startTime: item.start,
        endTime: item.end,
        room: item.room,
        teacher: item.teacher,
        type: item.type,
        color: item.color,
      });
      const normalized = normalizeSchedule(created);
      setSchedules((value) => [...value, normalized]);
      showNotice("Timetable entry added");
      return normalized;
    } catch (requestError) {
      showError(requestError, "Could not add timetable entry");
      throw requestError;
    }
  };

  const deleteSchedule = async (id) => {
    try {
      await plannerApi.deleteTimetable(id);
      setSchedules((value) => value.filter((item) => item.id !== id));
      showNotice("Timetable entry deleted");
    } catch (requestError) {
      showError(requestError, "Could not delete timetable entry");
    }
  };

  const addTask = async (task) => {
    try {
      const created = await plannerApi.createTask({ title: task.title, detail: task.detail });
      const normalized = normalizeTask(created);
      setTasks((value) => [normalized, ...value]);
      showNotice("Task added");
      return normalized;
    } catch (requestError) {
      showError(requestError, "Could not add task");
      throw requestError;
    }
  };

  const completeTask = async (id) => {
    try {
      await plannerApi.completeTask(id);
      setTasks((value) => value.filter((task) => task.id !== id));
      showNotice("Task completed");
    } catch (requestError) {
      showError(requestError, "Could not complete task");
    }
  };

  const refreshFlashcards = async () => {
    const sets = await plannerApi.getFlashcards();
    setFlashcards(normalizeFlashcards(sets));
  };

  const addFlashcard = async (categoryId, card) => {
    try {
      await plannerApi.createManualFlashcard({
        categoryId,
        question: card.question,
        answer: card.answer,
      });
      await refreshFlashcards();
      showNotice("Manual flashcard created");
    } catch (requestError) {
      showError(requestError, "Could not create flashcard");
      throw requestError;
    }
  };

  const generateFlashcards = async (
  categoryId,
  materialId,
  count
) => {
  try {
    const result =
      await plannerApi.generateFlashcards({
        categoryId,
        materialId,
        cardCount: count,
        language:
          settings?.language ||
          "Same as material",
      });

    await refreshFlashcards();

    showNotice(
      result?.aiProvider
        ? `${count} cards generated with ${result.aiProvider}`
        : `${count} flashcards generated`
    );

    return result;
  } catch (requestError) {
    showError(
      requestError,
      "Could not generate flashcards"
    );

    throw requestError;
  }
};

  const reviewFlashcard = async (card, known) => {
    if (!card?.setId || !card?.id) return;
    try {
      await plannerApi.reviewFlashcard(card.setId, {
        cardId: card.id,
        result: known ? "known" : "unknown",
      });
      setFlashcards((value) => {
        const next = {};
        for (const [categoryId, cards] of Object.entries(value)) {
          next[categoryId] = cards.map((item) => item.id === card.id
            ? { ...item, reviewed: true, correct: known }
            : item);
        }
        return next;
      });
    } catch (requestError) {
      showError(requestError, "Could not save review result");
    }
  };

  const deleteFlashcard = async (card) => {
    if (!card?.setId || !card?.id) return;

    try {
      await plannerApi.deleteFlashcard(card.setId, card.id);

      setFlashcards((value) => {
        const next = {};

        for (const [categoryId, cards] of Object.entries(value)) {
          next[categoryId] = cards.filter(
            (item) => !(item.id === card.id && item.setId === card.setId),
          );
        }

        return next;
      });

      showNotice("Flashcard deleted");
    } catch (requestError) {
      showError(requestError, "Could not delete flashcard");
      throw requestError;
    }
  };

  const uploadAvatar = async (file) => {
    try {
      const response = await plannerApi.uploadAvatar(file);
      const updatedUser = normalizeUser(response);
      if (updatedUser) setUser(updatedUser);
      showNotice("Profile photo updated");
      return updatedUser;
    } catch (requestError) {
      showError(requestError, "Could not upload profile photo");
      throw requestError;
    }
  };

  const saveProfile = async (nextProfile) => {
    try {
      const response = await plannerApi.updateProfile({
        fullName: nextProfile.fullName,
        phone: nextProfile.phone || "",
        school: nextProfile.school || "",
        grade: nextProfile.grade || "",
        subjects: String(nextProfile.subjects || "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      });
      const updatedUser = normalizeUser(response);
      setProfile(profileFromUser(updatedUser || { ...user, ...response?.user }));
      if (updatedUser) setUser(updatedUser);
      showNotice("Profile saved");
    } catch (requestError) {
      showError(requestError, "Could not save profile");
      throw requestError;
    }
  };

  const saveSettings = async (nextSettings, silent = false) => {
    const previous = settings;
    setSettings(nextSettings);
    try {
      const response = await plannerApi.updatePreferences({
        ...nextSettings,
        theme: nextSettings.darkMode ? "dark" : "light",
      });
      const savedPreferences = response?.preferences || response;
      setSettings((value) => ({ ...value, ...savedPreferences }));
      if (!silent) showNotice("Preferences saved");
    } catch (requestError) {
      setSettings(previous);
      showError(requestError, "Could not save preferences");
      throw requestError;
    }
  };

  const toggleTheme = () => {
    const next = { ...settings, darkMode: !settings.darkMode };
    saveSettings(next, true).catch(() => {});
  };

  const handleLogout = async () => {
  try {
    await logoutUser();
  } finally {
    window.location.href = "/Smart_Assist/Login";
  }
};

  const page = useMemo(() => {
    const common = { categories, materials, flashcards, schedules, onNavigate: navigate };
    if (activePage === "timetable") {
      return (
        <TimetablePage
          schedules={schedules}
          onAddSchedule={addSchedule}
          onDeleteSchedule={deleteSchedule}
          defaultView={settings.timetableView}
        />
      );
    }
    if (activePage === "study") {
      return (
        <StudyPage
          {...common}
          materials={materials}
          categories={categories}
          onNavigate={navigate}
          onGenerateFlashcards={generateFlashcards}
        />
      );
    }
    if (activePage === "material") {
      return (
        <MaterialPage
          {...common}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
          onAddMaterial={addMaterial}
          onDeleteMaterial={deleteMaterial}
        />
      );
    }
    if (activePage === "setting") {
      return (
        <SettingPage
          user={user}
          profile={profile}
          settings={settings}
          onSaveProfile={saveProfile}
          onSaveSettings={saveSettings}
          onUploadAvatar={uploadAvatar}
        />
      );
    }
    return (
      <DashboardHome
        {...common}
        user={user}
        tasks={tasks}
        onAddTask={addTask}
        onCompleteTask={completeTask}
      />
    );
  }, [
    activePage,
    categories,
    materials,
    flashcards,
    schedules,
    tasks,
    user,
    profile,
    settings,
  ]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        activePage={activePage}
        onNavigate={navigate}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
      <div className="min-h-screen lg:ml-[236px]">
        <Topbar
          pageTitle={titles[activePage]}
          onMenu={() => setMobileOpen(true)}
          onSearch={setSearch}
          user={user}
          darkMode={settings.darkMode}
          onToggleTheme={toggleTheme}
        />

        {(error || notice) && (
          <div className={`mx-4 mt-3 rounded-xl border px-3 py-2 text-sm sm:mx-6 lg:mx-7 ${
            error
              ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-500/10 dark:text-rose-300"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300"
          }`}>
            {error || notice}
            <button className="float-right font-bold" onClick={() => { setError(""); setNotice(""); }}>×</button>
          </div>
        )}

        {search && (
          <div className="mx-4 mt-3 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-700 sm:mx-6 lg:mx-7 dark:border-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-300">
            Searching your workspace for “{search}”
            <button className="float-right font-bold" onClick={() => setSearch("")}>Clear</button>
          </div>
        )}

        <main>{page}</main>
      </div>
    </div>
  );
}
