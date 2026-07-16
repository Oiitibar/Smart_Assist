import {
  Brain,
  CalendarDays,
  CheckSquare,
  Clock3,
  FolderOpen,
  GraduationCap,
  Layers3,
  Moon,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";

export const navigationLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "AI flashcards", href: "#ai-flashcards" },
  { label: "About", href: "#about" },
];

export const dashboardSchedule = [
  {
    time: "09:00",
    title: "Database Systems",
    room: "Room 301",
    color: "#4f46e5",
  },
  {
    time: "11:00",
    title: "Operating Systems",
    room: "Lab 2",
    color: "#7c3aed",
  },
  {
    time: "14:00",
    title: "Discrete Mathematics",
    room: "Room 102",
    color: "#0ea5e9",
  },
];

export const dashboardTasks = [
  { title: "Review database normalization", done: true },
  { title: "Complete OS assignment", done: false },
  { title: "Practice flashcards", done: false },
];

export const features = [
  {
    icon: CalendarDays,
    title: "Flexible timetable",
    description:
      "Add, edit and remove weekly classes with subject, time, room and color details.",
    iconClass:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
  },
  {
    icon: CheckSquare,
    title: "Daily task control",
    description:
      "Create personal study tasks and clear them instantly after checking them as completed.",
    iconClass:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  {
    icon: FolderOpen,
    title: "Material organizer",
    description:
      "Upload PDFs, slides, documents and images, then organize everything by your own categories.",
    iconClass:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  },
  {
    icon: Brain,
    title: "AI-ready flashcards",
    description:
      "Select an uploaded material, generate a card set and review it by subject category.",
    iconClass:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  },
  {
    icon: Layers3,
    title: "Manual flashcards",
    description:
      "Create your own questions and answers whenever you want full control over revision content.",
    iconClass:
      "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
  },
  {
    icon: ShieldCheck,
    title: "User-specific data",
    description:
      "JWT authentication and ownership checks keep every user's timetable, files and cards separate.",
    iconClass:
      "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  },
];

export const workflowSteps = [
  {
    icon: GraduationCap,
    number: "01",
    title: "Create a secure account",
    description:
      "Register, log in and enter a protected workspace where every record is linked to your user ID.",
  },
  {
    icon: Upload,
    number: "02",
    title: "Set up your study space",
    description:
      "Add your timetable, categories, materials and personal tasks from simple responsive forms.",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "Plan and review",
    description:
      "Use the dashboard to focus on today's work and create manual or generated flashcards for revision.",
  },
];

export const flashcardHighlights = [
  "Generate from an existing material",
  "Review cards by subject category",
  "Create manual question-and-answer cards",
  "Save review progress to your account",
];

export const aboutItems = [
  {
    icon: ShieldCheck,
    title: "Secure access",
    description: "Protected routes and user ownership checks",
  },
  {
    icon: Clock3,
    title: "Persistent data",
    description: "Timetable, materials, tasks and cards remain after refresh",
  },
  {
    icon: Moon,
    title: "Adaptive theme",
    description: "A consistent light and dark experience across the app",
  },
];
