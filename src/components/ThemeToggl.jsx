import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  // Déclare un état pour détecter si le code s'exécute dans un navigateur
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Vérifie si nous sommes dans un environnement navigateur
    if (typeof window !== "undefined") {
      // Détecte la préférence de l'utilisateur uniquement dans le navigateur
      const prefersDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDark(prefersDarkMode);

      // Applique le thème actuel à l'élément racine
      const root = window.document.documentElement;
      if (prefersDarkMode) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, []); // Le tableau vide signifie qu'on l'exécute une seule fois au montage

  // Effet pour changer de thème si l'utilisateur modifie l'état
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [isDark]);

  return (
    <div className="relative w-17 h-full flex items-center justify-between px-2.5 bg-blue-50 rounded-lg transition-colors duration-300">
      {/* Switch indicator */}
      <span
        className={`absolute left-1 top-1 bottom-1 w-7 rounded-lg bg-blue-200 transition-transform duration-300 ${
          isDark ? "translate-x-8" : "translate-x-0"
        }`}
      />

      {/* Soleil */}
      <Sun
        size={16}
        onClick={() => setIsDark(false)}
        className="text-blue-600 z-10 cursor-pointer"
      />

      {/* Lune */}
      <Moon
        size={16}
        onClick={() => setIsDark(true)}
        className="text-blue-600 z-10 cursor-pointer"
      />
    </div>
  );
}
