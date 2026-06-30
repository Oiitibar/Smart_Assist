# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# Smart Assist — Dashboard Components

Purple/violet-themed study dashboard matching your existing HomePage, LoginPage, and RegistrationPage.

## File structure

```
src/
└── components/
    └── dashboard/
        ├── index.js               ← barrel export (import everything from here)
        ├── DashboardPage.jsx      ← top-level page, composes all components
        ├── Sidebar.jsx            ← purple sidebar with nav + AI Study Mode card
        ├── Topbar.jsx             ← search bar + notification bell + avatar
        ├── HeroRow.jsx            ← today's plan hero + 4 stat/ring cards
        ├── WeeklyTimetable.jsx    ← Mon–Fri colour-coded timetable grid
        ├── ProgressChart.jsx      ← Chart.js line chart (dynamic import)
        ├── FlashcardGenerator.jsx ← drag-and-drop file upload + generate button
        ├── FlashcardPreview.jsx   ← tap-to-reveal flashcard list
        └── UpcomingSchedule.jsx   ← today's upcoming class schedule
```

## 1. Install dependency

```bash
npm install chart.js
```

Tabler Icons (already in your project or add it):
```bash
npm install @tabler/icons-webfont
```
Then in your `main.jsx` or `index.css`:
```js
import "@tabler/icons-webfont/dist/tabler-icons.css";
```

## 2. Add the route

In your `App.jsx` (or wherever react-router-dom routes live):

```jsx
import { DashboardPage } from "./components/dashboard";

// inside <Routes>:
<Route path="/dashboard" element={<DashboardPage />} />
```

Or if using a protected route pattern you already have:

```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

## 3. Redirect after login

In your login success handler, redirect to `/dashboard` instead of `/home`:

```js
// after JWT is validated and stored in cookie:
navigate("/dashboard");
```

## 4. Colour tokens

All components use Tailwind's `indigo-*` scale as the brand colour to match
your existing pages. The key values:

| Token            | Hex       | Usage                    |
| ---------------- | --------- | ------------------------ |
| `indigo-500`     | `#6366f1` | Primary brand, sidebar   |
| `indigo-50`      | `#eef2ff` | Light fills, upload area |
| `indigo-200`     | `#c7d2fe` | Borders, dashed outlines |
| `indigo-600`     | `#4f46e5` | Hover states             |

## 5. Connecting to your Express backend

Replace the sample data constants in `DashboardPage.jsx` with API calls:

```js
// Example — fetch today's plan
useEffect(() => {
  fetch("/api/dashboard/today", {
    credentials: "include", // sends your JWT cookie
  })
    .then((r) => r.json())
    .then(setPlan);
}, []);
```

Suggested API routes to build next:
- `GET /api/dashboard/today`    → plan, stats
- `GET /api/timetable`          → weekly schedule
- `GET /api/progress?range=week` → chart data
- `POST /api/flashcards/generate` → file upload → returns cards
