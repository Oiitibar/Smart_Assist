import {
  Brain,
  CalendarDays,
  CheckSquare,
  Clock3,
  FileText,
  FolderOpen,
  GraduationCap,
  Languages,
  Layers3,
  Moon,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";

export const navigationLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Smart study", href: "#smart-study" },
  { label: "About", href: "#about" },
];

export const dashboardSchedule = [
  {
    time: "01:00 PM",
    endTime: "02:40 PM",
    title: "Digital Communication",
    room: "F-14",
    color: "#4f46e5",
  },
  {
    time: "02:40 PM",
    endTime: "04:20 PM",
    title: "Database",
    room: "F-14",
    color: "#7c3aed",
  },
];

export const dashboardTasks = [
  { title: "Review database notes", done: true },
  { title: "Generate an AI quiz", done: false },
  { title: "Prepare tomorrow's class", done: false },
];

export const features = [
  {
    icon: Layers3,
    title: "Today dashboard",
    description:
      "See today's timetable, next class, study totals and personal tasks from one focused command center.",
    iconClass:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
  },
  {
    icon: CalendarDays,
    title: "Conflict-aware timetable",
    description:
      "Build a weekly schedule with class times and rooms while Smart Assist blocks overlapping entries on the same day.",
    iconClass:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  {
    icon: FolderOpen,
    title: "Private material library",
    description:
      "Organize PDF, DOCX and PPTX files by subject category and keep every original document tied to your account.",
    iconClass:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  },
  {
    icon: FileText,
    title: "Smart document viewer",
    description:
      "Open supported materials inside the app with zoom, Smart View and fullscreen reading without switching tools.",
    iconClass:
      "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
  },
  {
    icon: Languages,
    title: "Grounded AI explanations",
    description:
      "Ask questions about the selected material or request an explanation in English or Myanmar using the document itself.",
    iconClass:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  },
  {
    icon: Brain,
    title: "Flashcards and AI quizzes",
    description:
      "Generate review cards and saved quizzes from a material, then track mastered cards, attempts and explanations.",
    iconClass:
      "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  },
];

export const workflowSteps = [
  {
    icon: GraduationCap,
    number: "01",
    title: "Create your workspace",
    description:
      "Register, sign in securely and set up your profile, theme and personal study environment.",
  },
  {
    icon: Upload,
    number: "02",
    title: "Plan and add materials",
    description:
      "Create categories, build your timetable, add tasks and upload the documents you are currently studying.",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "Read, ask and review",
    description:
      "Use the in-app viewer, grounded AI, flashcards and quizzes while your saved progress stays connected to each material.",
  },
];

export const flashcardHighlights = [
  "One category-first workspace for materials, flashcards and quizzes",
  "Secure PDF, DOCX and PPTX viewing with Smart View and fullscreen",
  "English and Myanmar explanations grounded in the selected material",
  "Saved flashcard reviews and AI quiz attempts for later revision",
];

export const aboutItems = [
  {
    icon: ShieldCheck,
    title: "Secure account access",
    description: "Protected routes, role checks and user-owned study data",
  },
  {
    icon: Clock3,
    title: "Reliable cloud storage",
    description: "MongoDB stores app data while original materials remain in private object storage",
  },
  {
    icon: Moon,
    title: "Responsive light and dark UI",
    description: "The same focused workspace works across desktop, tablet and mobile screens",
  },
];
