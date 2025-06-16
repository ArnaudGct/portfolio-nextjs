import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ mobile = false }) {
  const [isDark, setIsDark] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Synchroniser l'état avec le DOM au montage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      const currentTheme = root.classList.contains("dark");
      setIsDark(currentTheme);
      setIsInitialized(true);
    }
  }, []);

  // Fonction pour changer le thème
  const toggleTheme = (value) => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;

      if (value) {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }

      setIsDark(value);
    }
  };

  // Écouter les changements de thème depuis d'autres onglets
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "theme" && e.newValue) {
        const newTheme = e.newValue === "dark";
        setIsDark(newTheme);

        if (typeof window !== "undefined") {
          const root = window.document.documentElement;
          if (newTheme) {
            root.classList.add("dark");
          } else {
            root.classList.remove("dark");
          }
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, []);

  // Ne pas rendre le bouton tant qu'il n'est pas initialisé
  if (!isInitialized) {
    return (
      <div className="relative flex items-center justify-between bg-blue-50 rounded-lg transition-colors duration-300 h-[40px] w-18 px-[4px] dark:border dark:border-blue-200 opacity-50">
        <div className="absolute left-1 top-1 bottom-1 rounded-lg bg-blue-200 w-8" />
        <div className="flex items-center justify-center w-8 h-full p-2">
          <Sun size={16} className="text-blue-600" />
        </div>
        <div className="flex items-center justify-center w-8 h-full p-2">
          <Moon size={16} className="text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-between bg-blue-50 rounded-lg transition-colors duration-300 h-[40px] w-18 px-[4px] dark:border dark:border-blue-200">
      {/* Switch indicator */}
      <span
        className={`absolute left-1 top-1 bottom-1 rounded-lg bg-blue-200 transition-transform duration-300 w-8 ${
          isDark ? "translate-x-8 dark:translate-x-[31px]" : "translate-x-0"
        }`}
      />

      {/* Boutons avec zone de clic étendue */}
      <button
        onClick={() => toggleTheme(false)}
        className="flex items-center justify-center w-8 h-full p-2 z-10 cursor-pointer"
        aria-label="Mode clair"
      >
        <Sun size={16} className="text-blue-600" />
      </button>

      <button
        onClick={() => toggleTheme(true)}
        className="flex items-center justify-center w-8 h-full p-2 z-10 cursor-pointer"
        aria-label="Mode sombre"
      >
        <Moon size={16} className="text-blue-600" />
      </button>
    </div>
  );
}
