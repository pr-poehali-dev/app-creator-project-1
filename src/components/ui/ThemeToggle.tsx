import Icon from "@/components/ui/icon";
import { useTheme } from "@/lib/useTheme";

// Переключатель светлой и тёмной схемы интерфейса
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Светлая тема" : "Тёмная тема"}
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      className={`flex items-center justify-center w-8 h-8 border border-border text-muted-foreground hover:text-geo-amber hover:border-geo-amber/50 transition-colors flex-shrink-0 ${className}`}
    >
      <Icon name={isDark ? "Sun" : "Moon"} size={14} />
    </button>
  );
}

export default ThemeToggle;
