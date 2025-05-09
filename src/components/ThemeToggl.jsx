import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  // État initial à undefined pour éviter un rendu incorrect
  const [isDark, setIsDark] = useState(undefined);

  // Synchroniser l'état avec le localStorage au montage du composant
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Récupérer la préférence du localStorage
      const savedTheme = localStorage.getItem("theme");

      if (savedTheme) {
        setIsDark(savedTheme === "dark");
      } else {
        // Détecter la préférence système si aucun thème n'est sauvegardé
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setIsDark(prefersDark);
        localStorage.setItem("theme", prefersDark ? "dark" : "light");
      }
    }
  }, []);

  // Appliquer le thème quand l'état change
  useEffect(() => {
    if (isDark !== undefined && typeof window !== "undefined") {
      const root = window.document.documentElement;

      if (isDark) {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }
  }, [isDark]);

  // Fonction pour changer le thème
  const toggleTheme = (value) => {
    setIsDark(value);
  };

  // Écouter les changements de thème depuis d'autres onglets
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "theme") {
        setIsDark(e.newValue === "dark");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Ne pas rendre le bouton tant que isDark n'est pas défini
  if (isDark === undefined) return null;

  return (
    <div className="relative w-17 h-full flex items-center justify-between px-[2px] bg-blue-50 rounded-lg transition-colors duration-300">
      {/* Switch indicator */}
      <span
        className={`absolute left-1 top-1 bottom-1 w-7 rounded-lg bg-blue-200 transition-transform duration-300 ${
          isDark ? "translate-x-8" : "translate-x-0"
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
