import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import DashboardHome from "./DashboardHome";
import TimetablePage from "./TimetablePage";
import FlashcardPage from "./FlashcardPage";
import MaterialPage from "./MaterialPage";
import SettingPage from "./SettingPage";
import { logoutUser } from "../../service/auth";

function PageContent({ activePage, setActivePage, onLogout }) {
  if (activePage === "timetable") {
    return <TimetablePage setActivePage={setActivePage} />;
  }

  if (activePage === "flashcard") {
    return <FlashcardPage />;
  }

  if (activePage === "material") {
    return <MaterialPage />;
  }

  if (activePage === "setting") {
    return <SettingPage onLogout={onLogout} />;
  }

  return <DashboardHome setActivePage={setActivePage} />;
}

export default function DashboardPage() {
  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  
    const handleLogout = async () => {
      // Calls backend logout API first, so the JWT cookie/session is cleared.
      await logoutUser();
  
      // Clear any client-side cached auth/user data too.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("authUser");
      sessionStorage.clear();
  
      // Send the user back to login and prevent browser back button returning to dashboard.
      navigate("/Smart_Assist/Login", { replace: true });
    };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar userName="Student" initials="KL" />

        <main className="flex-1 overflow-y-auto px-6 py-5">
          <PageContent activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} />
        </main>
      </div>
    </div>
  );
}
