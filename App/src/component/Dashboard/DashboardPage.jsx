import { useEffect, useMemo, useState } from "react";
import { getCurrentUser, logoutUser } from "../../service/auth";
import DashboardHome from "./DashboardHome";
import FlashcardPage from "./FlashcardPage";
import MaterialPage from "./MaterialPage";
import SettingPage from "./SettingPage";
import Sidebar from "./Sidebar";
import TimetablePage from "./TimetablePage";
import Topbar from "./Topbar";

const demoUser = { id: "demo-user", name: "Alex Morgan", fullName: "Alex Morgan", email: "alex@student.edu" };

const initialCategories = [
  { id: "ict", name: "ICT", color: "#4f46e5", soft: "#eef2ff", emoji: "💻" },
  { id: "mathematics", name: "Mathematics", color: "#8b5cf6", soft: "#f5f3ff", emoji: "📐" },
  { id: "physics", name: "Physics", color: "#0ea5e9", soft: "#f0f9ff", emoji: "⚛️" },
  { id: "biology", name: "Biology", color: "#10b981", soft: "#ecfdf5", emoji: "🧬" },
];

const initialMaterials = [
  { id: "m1", title: "Data Structures Notes.pdf", originalName: "Data Structures Notes.pdf", categoryId: "ict", type: "PDF", detail: "PDF · 2.4 MB", size: 2516582, updated: "Today", filePath: "uploads/data-structures-notes.pdf" },
  { id: "m2", title: "Calculus Integration.pptx", originalName: "Calculus Integration.pptx", categoryId: "mathematics", type: "PPTX", detail: "PPTX · 4.1 MB", size: 4299161, updated: "Yesterday", filePath: "uploads/calculus-integration.pptx" },
  { id: "m3", title: "Physics Formula Sheet.pdf", originalName: "Physics Formula Sheet.pdf", categoryId: "physics", type: "PDF", detail: "PDF · 1.2 MB", size: 1258291, updated: "Jul 10", filePath: "uploads/physics-formulas.pdf" },
  { id: "m4", title: "Cell Structure Diagram.png", originalName: "Cell Structure Diagram.png", categoryId: "biology", type: "PNG", detail: "PNG · 860 KB", size: 880640, updated: "Jul 9", filePath: "uploads/cell-structure.png" },
];

const initialFlashcards = {
  ict: [
    { id: "f1", question: "What is a data structure?", answer: "A data structure is a way of organizing and storing data so it can be accessed and modified efficiently.", source: "Data Structures Notes.pdf" },
    { id: "f2", question: "What is the main difference between an array and a linked list?", answer: "Arrays use contiguous memory and indexed access, while linked lists use connected nodes and sequential access.", source: "Data Structures Notes.pdf" },
  ],
  mathematics: [
    { id: "f3", question: "What is integration by parts?", answer: "It is the rule ∫u dv = uv − ∫v du.", source: "Calculus Integration.pptx" },
  ],
  physics: [
    { id: "f4", question: "State Newton’s second law.", answer: "The resultant force equals mass multiplied by acceleration: F = ma.", source: "Physics Formula Sheet.pdf" },
  ],
  biology: [],
};

const initialSchedules = [
  { id: "s1", title: "ICT", day: "Mon", start: "10:30 AM", end: "11:30 AM", room: "Computer Lab", teacher: "Mr. Davis", type: "Lecture", color: "#4f46e5" },
  { id: "s2", title: "Mathematics", day: "Mon", start: "12:00 PM", end: "01:00 PM", room: "Room 203", teacher: "Ms. Brown", type: "Lecture", color: "#8b5cf6" },
  { id: "s3", title: "Physics", day: "Mon", start: "02:00 PM", end: "03:00 PM", room: "Lab 1", teacher: "Dr. Chen", type: "Lab", color: "#0ea5e9" },
  { id: "s4", title: "Biology", day: "Tue", start: "09:00 AM", end: "10:30 AM", room: "Bio Lab", teacher: "Dr. Patel", type: "Lab", color: "#10b981" },
  { id: "s5", title: "Data Structures", day: "Wed", start: "10:00 AM", end: "11:30 AM", room: "Room 201", teacher: "Mr. Davis", type: "Lecture", color: "#4f46e5" },
  { id: "s6", title: "Calculus", day: "Thu", start: "01:00 PM", end: "02:30 PM", room: "Room 204", teacher: "Ms. Brown", type: "Lecture", color: "#8b5cf6" },
  { id: "s7", title: "Physics Review", day: "Fri", start: "11:00 AM", end: "12:00 PM", room: "Library", teacher: "Study group", type: "Study", color: "#0ea5e9" },
];

const initialTasks = [
  { id: "t1", title: "Review ICT flashcards", detail: "Before the next class" },
  { id: "t2", title: "Upload biology notes", detail: "Personal task" },
  { id: "t3", title: "Finish mathematics exercises", detail: "Due today" },
];

const initialProfile = {
  fullName: "Alex Morgan",
  email: "alex@student.edu",
  school: "City University",
  grade: "Computer Science · Year 2",
  subjects: "ICT, Mathematics, Physics, Biology",
};

const initialSettings = {
  darkMode: localStorage.getItem("theme") === "dark",
  notifications: true,
  studyReminder: "30 minutes before",
  language: "English",
  timetableView: "Week View",
  flashcardMode: "Review All",
};

const titles = {
  dashboard: "Dashboard",
  timetable: "Timetable",
  flashcard: "Flashcards",
  material: "Materials",
  setting: "Settings",
};

function readStorage(key, initialValue) {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? initialValue : JSON.parse(stored);
  } catch {
    return initialValue;
  }
}

function useUserStoredState(scope, key, initialValue) {
  const storageKey = `smart-assist:${scope}:${key}`;
  const [state, setState] = useState(() => ({ key: storageKey, value: readStorage(storageKey, initialValue) }));

  useEffect(() => {
    if (state.key !== storageKey) {
      setState({ key: storageKey, value: readStorage(storageKey, initialValue) });
    }
  }, [storageKey]);

  useEffect(() => {
    if (state.key === storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(state.value));
    }
  }, [state, storageKey]);

  const currentValue = state.key === storageKey ? state.value : readStorage(storageKey, initialValue);
  const setValue = (nextValue) => {
    setState((previous) => {
      const base = previous.key === storageKey ? previous.value : readStorage(storageKey, initialValue);
      return {
        key: storageKey,
        value: typeof nextValue === "function" ? nextValue(base) : nextValue,
      };
    });
  };

  return [currentValue, setValue];
}

function normalizeUser(response) {
  const candidate = response?.data?.user || response?.user || response?.data || response;
  if (!candidate || typeof candidate !== "object") return demoUser;
  const name = candidate.name || candidate.fullName || "Student";
  return { ...candidate, name, fullName: candidate.fullName || name };
}

export default function DashboardPage() {
  const pageFromHash = window.location.hash.replace("#/", "");
  const [activePage, setActivePage] = useState(titles[pageFromHash] ? pageFromHash : "dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(demoUser);
  const scope = user?._id || user?.id || "demo-user";

  const [categories, setCategories] = useUserStoredState(scope, "categories", initialCategories);
  const [materials, setMaterials] = useUserStoredState(scope, "materials", initialMaterials);
  const [flashcards, setFlashcards] = useUserStoredState(scope, "flashcards", initialFlashcards);
  const [schedules, setSchedules] = useUserStoredState(scope, "schedules", initialSchedules);
  const [tasks, setTasks] = useUserStoredState(scope, "tasks", initialTasks);
  const [profile, setProfile] = useUserStoredState(scope, "profile", initialProfile);
  const [settings, setSettings] = useUserStoredState(scope, "settings", initialSettings);

  useEffect(() => {
    getCurrentUser().then((response) => {
      const nextUser = normalizeUser(response);
      setUser(nextUser);
      setProfile((current) => ({
        ...current,
        fullName: nextUser.fullName || nextUser.name || current.fullName,
        email: nextUser.email || current.email,
        school: nextUser.profile?.school || current.school,
        grade: nextUser.profile?.grade || current.grade,
        subjects: Array.isArray(nextUser.profile?.subjects) ? nextUser.profile.subjects.join(", ") : current.subjects,
      }));
      setSettings((current) => ({ ...current, ...(nextUser.preferences || {}) }));
    }).catch(() => setUser(demoUser));
  }, []);

  useEffect(() => {
  const isDark = Boolean(settings.darkMode);

  document.documentElement.classList.toggle("dark", isDark);

  localStorage.setItem(
    "theme",
    isDark ? "dark" : "light"
  );
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

  const addCategory = (category) => {
    setCategories((value) => [...value, category]);
    setFlashcards((value) => ({ ...value, [category.id]: [] }));
  };

  const addMaterial = (material) => setMaterials((value) => [material, ...value]);
  const deleteMaterial = (id) => setMaterials((value) => value.filter((item) => item.id !== id));
  const addSchedule = (item) => setSchedules((value) => [...value, item]);
  const deleteSchedule = (id) => setSchedules((value) => value.filter((item) => item.id !== id));
  const addTask = (task) => setTasks((value) => [task, ...value]);
  const completeTask = (id) => {
    setTimeout(() => setTasks((value) => value.filter((task) => task.id !== id)), 220);
  };

  const addFlashcard = (categoryId, card) => {
    setFlashcards((value) => ({ ...value, [categoryId]: [...(value[categoryId] || []), card] }));
  };

  const generateFlashcards = (categoryId, materialId, count) => {
    const material = materials.find((item) => item.id === materialId);
    const category = categories.find((item) => item.id === categoryId);
    if (!material || !category) return;

    const templates = [
      [
        `What is the main topic of ${material.title}?`,
        `${material.title} covers important ideas in ${category.name}. Review the source material for its key definition and examples.`,
      ],
      [
        `Name one key concept to remember from ${material.title}.`,
        `Identify the central ${category.name} concept, then connect it to the example provided in the material.`,
      ],
      [
        `How would you summarize ${material.title} in one sentence?`,
        `Summarize the main idea, the supporting detail, and why it matters in ${category.name}.`,
      ],
      [
        `What question should you ask when reviewing ${material.title}?`,
        `Ask what the concept means, how it works, and when it should be applied.`,
      ],
      [
        `What is a practical use of the ideas in ${material.title}?`,
        `Apply the main concept to a problem, example, diagram, or real situation from ${category.name}.`,
      ],
    ];

    const generated = Array.from({ length: count }, (_, index) => {
      const [question, answer] = templates[index % templates.length];
      return {
        id: crypto.randomUUID(),
        question: count > templates.length ? `${question} (${index + 1})` : question,
        answer,
        source: material.title,
        materialId,
        generatedBy: "AI",
        createdAt: new Date().toISOString(),
      };
    });

    setFlashcards((value) => ({ ...value, [categoryId]: [...(value[categoryId] || []), ...generated] }));
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // The local preview can still return to login when the backend is offline.
    }
    window.location.href = "/login";
  };

  const page = useMemo(() => {
    const common = { categories, materials, flashcards, schedules, onNavigate: navigate };
    if (activePage === "timetable") {
      return <TimetablePage schedules={schedules} onAddSchedule={addSchedule} onDeleteSchedule={deleteSchedule} />;
    }
    if (activePage === "flashcard") {
      return (
        <FlashcardPage
          {...common}
          onAddFlashcard={addFlashcard}
          onGenerateFlashcards={generateFlashcards}
        />
      );
    }
    if (activePage === "material") {
      return (
        <MaterialPage
          {...common}
          onAddCategory={addCategory}
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
          onSaveProfile={setProfile}
          onSaveSettings={setSettings}
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
  }, [activePage, categories, materials, flashcards, schedules, tasks, user, profile, settings]);

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
          onToggleTheme={() => setSettings((value) => ({ ...value, darkMode: !value.darkMode }))}
        />
        {search && (
          <div className="mx-5 mt-3 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-700 sm:mx-6 lg:mx-7 dark:border-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-300">
            Searching your workspace for “{search}”
            <button className="float-right font-bold" onClick={() => setSearch("")}>Clear</button>
          </div>
        )}
        <main>{page}</main>
      </div>
    </div>
  );
}
