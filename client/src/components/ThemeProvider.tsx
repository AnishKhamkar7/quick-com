import { useEffect, useState } from "react";
import { type Theme, ThemeContext } from "@/hooks/use-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lazy initialization - function only runs once on mount
  const [theme, setTheme] = useState<Theme>(() => {
    // This only runs on client-side, never on server
    if (typeof window === "undefined") {
      return "dark"; // Default for SSR
    }

    try {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") {
        return saved;
      }
    } catch (e) {
      // localStorage blocked (incognito, etc.)
      console.warn("localStorage unavailable:", e);
    }

    // Fallback to system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  // Apply theme to DOM whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      // Handle localStorage errors silently in production
      console.warn("Failed to save theme:", e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
