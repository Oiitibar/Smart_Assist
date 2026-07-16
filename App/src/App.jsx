import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import HomePage from "./component/Home/HomePage";
import LoginPage from "./component/LoginPage";
import RegisterPage from "./component/RegisterPage";
import DashboardPage from "./component/Dashboard/DashboardPage";
import { getCurrentUser } from "./service/auth";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        await getCurrentUser();

        if (isMounted) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c1b] flex items-center justify-center text-white/60">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/Smart_Assist/Login" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Smart_Assist/Login" element={<LoginPage />} />
        <Route path="/Smart_Assist/Register" element={<RegisterPage />} />

        <Route
          path="/Smart_Assist/Dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}