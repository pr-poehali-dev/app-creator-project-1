import Icon from "@/components/ui/icon";
import type { Section } from "./initData";
import { NAV_ITEMS, SOON_ITEMS } from "./initData";

interface AppSidebarProps {
  section: Section;
  counts: Record<Section, number>;
  onSectionChange: (s: Section) => void;
  onResetRequest: () => void;
}

export function AppSidebar({ section, counts, onSectionChange, onResetRequest }: AppSidebarProps) {
  return (
    <aside className="w-52 border-r border-border bg-card/50 flex-shrink-0 hidden md:flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Справочники</p>
      </div>
      <nav className="flex flex-col p-2 gap-0.5 flex-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 text-left transition-all group border-l-2 ${
              section === item.id
                ? "bg-geo-amber/10 text-geo-amber border-geo-amber"
                : "text-muted-foreground hover:text-foreground hover:bg-muted border-transparent"
            }`}
          >
            <Icon name={item.icon} fallback="Circle" size={14} />
            <span className="text-xs font-display tracking-wider uppercase flex-1">{item.label}</span>
            <span className={`font-mono text-xs tabular-nums ${section === item.id ? "text-geo-amber" : "text-muted-foreground/50"}`}>
              {String(counts[item.id]).padStart(2, "0")}
            </span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-1">
        <p className="font-mono text-xs text-muted-foreground/50 uppercase tracking-widest mb-2">Скоро</p>
        {SOON_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground/30 px-1 py-1 cursor-not-allowed select-none">
            <Icon name={item.icon} fallback="Circle" size={12} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <button
          onClick={onResetRequest}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/30 transition-all"
        >
          <Icon name="RotateCcw" size={12} />
          Сбросить данные
        </button>
      </div>
    </aside>
  );
}

interface MobileTabsProps {
  section: Section;
  onSectionChange: (s: Section) => void;
}

export function MobileTabs({ section, onSectionChange }: MobileTabsProps) {
  return (
    <div className="md:hidden absolute top-14 left-0 right-0 z-30 border-b border-border bg-card/90 backdrop-blur-sm flex overflow-x-auto">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onSectionChange(item.id)}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-xs font-display tracking-wider uppercase transition-colors border-b-2 ${
            section === item.id ? "text-geo-amber border-geo-amber" : "text-muted-foreground border-transparent"
          }`}
        >
          <Icon name={item.icon} fallback="Circle" size={12} />
          {item.label}
        </button>
      ))}
    </div>
  );
}

interface ResetConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ResetConfirmModal({ onConfirm, onCancel }: ResetConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm bg-card border border-border mx-4 animate-scale-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Icon name="TriangleAlert" size={16} className="text-destructive" />
            <h3 className="font-display text-base tracking-wider uppercase text-foreground">Сброс данных</h3>
          </div>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Все данные (отчёты, справочники, заполненные разделы) будут удалены и заменены тестовыми данными. Действие необратимо.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 flex items-center justify-center gap-2 bg-destructive text-destructive-foreground py-2 text-sm font-display tracking-wider uppercase hover:opacity-90 transition-opacity"
            >
              <Icon name="RotateCcw" size={14} />
              Сбросить
            </button>
            <button
              onClick={onCancel}
              className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
