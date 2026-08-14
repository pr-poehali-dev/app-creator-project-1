import { useEffect, useState } from "react";

export type ThemeName = "dark" | "light";

const STORAGE_KEY = "geo_theme";

function readTheme(): ThemeName {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch { /* ignore */ }
  return "dark";
}

// Класс на <html> — переменные светлой темы перекрывают тёмные
function applyTheme(theme: ThemeName) {
  const root = document.documentElement;
  root.classList.toggle("theme-light", theme === "light");
  root.style.colorScheme = theme;
}

// Применяем сохранённую тему до первого рендера, чтобы не было вспышки
applyTheme(readTheme());

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>(readTheme);

  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  const toggleTheme = () => setThemeState((t) => (t === "dark" ? "light" : "dark"));

  return { theme, setTheme: setThemeState, toggleTheme };
}
