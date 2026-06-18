import Icon from "@/components/ui/icon";

export function AppHeader() {
  return (
    <header className="border-b border-border bg-card/90 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <Icon name="Mountain" size={18} className="text-geo-amber" />
            <span className="font-display text-lg tracking-[0.15em] uppercase text-foreground">ГеоОтчёт</span>
          </div>
          <span className="hidden sm:block font-mono text-xs text-muted-foreground border border-border px-2 py-0.5">
            ГОСТ Р 53579–2009
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-muted-foreground hidden sm:block">
            {new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-geo-green"></span>
            <span className="font-mono text-xs text-muted-foreground">АКТИВНО</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppFooter() {
  return (
    <footer className="border-t border-border px-6 py-2 flex items-center justify-between bg-card/50 flex-shrink-0">
      <span className="font-mono text-xs text-muted-foreground">Система формирования геологических отчётов</span>
      <span className="font-mono text-xs text-muted-foreground/50">v0.1.0</span>
    </footer>
  );
}
