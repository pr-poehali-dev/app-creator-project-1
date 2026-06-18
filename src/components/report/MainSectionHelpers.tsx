import { useState } from "react";
import Icon from "@/components/ui/icon";
import type {
  MainSection, MainBlock,
  AppendixRef, AppendixRefKind,
  TableEntry, TextAppendix, GraphicAppendix,
} from "./reportTypes";

// ─── Утилиты ──────────────────────────────────────────────────────────────────

export function newId() { return Date.now().toString() + Math.random().toString(36).slice(2, 6); }

export function loadJson<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}

// ─── Карта blockId → порядковый номер ─────────────────────────────────────────

export type BlockNumberMap = Record<string, number>;

export function buildBlockNumbers(sections: MainSection[]): { tables: BlockNumberMap; images: BlockNumberMap } {
  const tables: BlockNumberMap = {};
  const images: BlockNumberMap = {};
  let tNum = 0;
  let iNum = 0;
  for (const section of sections) {
    for (const block of section.blocks) {
      if (block.type === "table") { tNum++; tables[block.id] = tNum; }
      if (block.type === "image" && block.image?.url) { iNum++; images[block.id] = iNum; }
    }
  }
  return { tables, images };
}

// ─── Метки типов приложений ───────────────────────────────────────────────────

export const KIND_LABEL: Record<AppendixRefKind, string> = {
  table: "Таблица",
  text_appendix: "Текстовое приложение",
  graphic_appendix: "Графическое приложение",
};

// ─── BlockActions ─────────────────────────────────────────────────────────────

export function BlockActions({ isFirst, isLast, onMoveUp, onMoveDown, onDelete }: {
  isFirst: boolean; isLast: boolean;
  onMoveUp: () => void; onMoveDown: () => void; onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-1">
      <button onClick={onMoveUp} disabled={isFirst} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"><Icon name="ChevronUp" size={13} /></button>
      <button onClick={onMoveDown} disabled={isLast} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"><Icon name="ChevronDown" size={13} /></button>
      <button onClick={onDelete} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Icon name="Trash2" size={13} /></button>
    </div>
  );
}

// ─── AddBlockMenu ─────────────────────────────────────────────────────────────

export function AddBlockMenu({ onAdd }: { onAdd: (type: MainBlock["type"]) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 border border-dashed border-border/50 text-muted-foreground/40 hover:border-geo-amber/40 hover:text-geo-amber/70 px-3 py-1.5 text-xs font-mono w-full justify-center transition-colors">
        <Icon name="Plus" size={12} /> добавить блок
      </button>
      {open && (
        <div className="absolute left-0 bottom-full mb-1 bg-card border border-border shadow-lg z-20 py-1 w-56">
          {[
            { type: "text" as const, icon: "AlignLeft", label: "Текст" },
            { type: "image" as const, icon: "Image", label: "Иллюстрация (графика, карта)" },
            { type: "table" as const, icon: "Table2", label: "Таблица (встроенная)" },
            { type: "appendix_ref" as const, icon: "Link", label: "Ссылка на приложение" },
          ].map((item) => (
            <button key={item.type} onClick={() => { onAdd(item.type); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
              <Icon name={item.icon} fallback="Plus" size={13} className="text-geo-amber/70" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AppendixRefPicker ────────────────────────────────────────────────────────

export function AppendixRefPicker({ reportId, onPick, onClose }: {
  reportId: string;
  onPick: (ref: AppendixRef) => void;
  onClose: () => void;
}) {
  const [kind, setKind] = useState<AppendixRefKind>("table");

  const tables = loadJson<TableEntry>(`geo_tables_${reportId}`);
  const textApps = loadJson<TextAppendix>(`geo_text_appendices_${reportId}`);
  const graphApps = loadJson<GraphicAppendix>(`geo_graphic_appendices_${reportId}`);

  const items: { id: string; number: number; label: string }[] =
    kind === "table"
      ? tables.map((t) => ({ id: t.id, number: t.number, label: t.title }))
      : kind === "text_appendix"
      ? textApps.map((t) => ({ id: t.id, number: t.number, label: t.title }))
      : graphApps.map((t) => ({ id: t.id, number: t.number, label: t.title }));

  const pick = (item: { id: string; number: number; label: string }) => {
    const prefix = kind === "table" ? "Таблица" : kind === "text_appendix" ? "Приложение (текст.)" : "Приложение (граф.)";
    onPick({ kind, itemId: item.id, label: `${prefix} ${item.number} — ${item.label}` });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-sm tracking-wider uppercase">Ссылка на приложение</h4>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={16} /></button>
        </div>

        <div className="grid grid-cols-3 border border-border overflow-hidden text-xs">
          {(["table", "text_appendix", "graphic_appendix"] as AppendixRefKind[]).map((k) => (
            <button key={k} onClick={() => setKind(k)}
              className={`py-2 px-2 font-mono transition-colors ${kind === k ? "bg-geo-amber/10 text-geo-amber border-b-2 border-b-geo-amber" : "text-muted-foreground hover:bg-muted/30"}`}>
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground font-mono">
            Нет элементов в разделе «{KIND_LABEL[kind]}»
          </div>
        ) : (
          <div className="divide-y divide-border/50 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <button key={item.id} onClick={() => pick(item)}
                className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-muted/30 transition-colors">
                <span className="font-mono text-xs text-geo-amber flex-shrink-0 pt-0.5">№{item.number}</span>
                <span className="text-sm text-foreground leading-snug">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
