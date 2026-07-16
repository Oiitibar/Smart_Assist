import { useEffect, useState } from "react";

const getInitialTheme = () => {
  if (typeof window === "undefined") return false;

  const savedTheme = window.localStorage.getItem("theme");
  if (savedTheme) return savedTheme === "dark";

  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
};

export default function useTheme() {
  const [darkMode, setDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    window.localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((currentMode) => !currentMode);
  };

  return {
    darkMode,
    setDarkMode,
    toggleTheme,
  };
}
