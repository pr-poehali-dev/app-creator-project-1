import Icon from "@/components/ui/icon";
import type { TabDef } from "./reportTypes";

// ─── FieldRow ─────────────────────────────────────────────────────────────────

export function FieldRow({ label, value, fromSource, children }: {
  label: string;
  value?: string;
  fromSource?: string;
  children?: React.ReactNode;
}) {
  return (
    <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3 align-top w-56">
        <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest leading-tight">{label}</div>
        {fromSource && (
          <div className="font-mono text-xs text-geo-amber/60 mt-0.5">← {fromSource}</div>
        )}
      </td>
      <td className="px-4 py-3 align-top">
        {children ?? <span className="text-sm text-foreground">{value || "—"}</span>}
      </td>
    </tr>
  );
}

// ─── InlineInput ──────────────────────────────────────────────────────────────

export function InlineInput({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-muted border border-border px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-geo-amber transition-colors"
    />
  );
}

// ─── InlineNumber ─────────────────────────────────────────────────────────────

export function InlineNumber({ value, onChange, min, placeholder }: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min ?? 1}
      onChange={(e) => onChange(Number(e.target.value))}
      placeholder={placeholder}
      className="w-24 bg-muted border border-border px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-geo-amber transition-colors"
    />
  );
}

// ─── PlaceholderTable ─────────────────────────────────────────────────────────

export function PlaceholderTable({ tab }: { tab: TabDef }) {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Icon name={tab.icon} fallback="File" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">{tab.label}</h3>
          {tab.note && (
            <span className="font-mono text-xs text-muted-foreground border border-border px-2 py-0.5">{tab.note}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент</p>
      </div>

      <div className="border border-border overflow-hidden">
        <div className="bg-muted/50 border-b border-border px-4 py-2 flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Атрибуты</span>
          <span className="font-mono text-xs text-muted-foreground/40">— описание будет добавлено —</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest w-56">Поле</th>
              <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest">Значение</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="px-4 py-3">
                  <div className="h-3 w-36 bg-muted rounded-sm animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-3 w-64 bg-muted rounded-sm animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-border/50 flex items-center gap-2">
          <Icon name="Info" size={13} className="text-muted-foreground/40" />
          <span className="font-mono text-xs text-muted-foreground/40">Атрибуты этого раздела будут описаны на следующем шаге</span>
        </div>
      </div>
    </div>
  );
}
