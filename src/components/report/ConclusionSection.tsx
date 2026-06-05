import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { MainSection } from "./reportTypes";

// ─── helpers ──────────────────────────────────────────────────────────────────

function newId() { return Date.now().toString() + Math.random().toString(36).slice(2, 6); }

interface ConclusionBlock {
  id: string;
  type: "text" | "section";
  content?: string;
  sectionTitle?: string;
  level?: 1 | 2;
}

/** Считаем номер Заключения: 1 (Введение) + кол-во разделов уровня 1 в основной части + 1 */
function getConclusionNum(reportId: string): number {
  try {
    const main: MainSection[] = JSON.parse(localStorage.getItem(`geo_main_text_${reportId}`) || "[]");
    const mainTopCount = main.filter((s) => s.level === 1).length;
    return 1 + mainTopCount + 1; // 1=Введение, mainTopCount=разделы осн.части, +1=Заключение
  } catch {
    return 2;
  }
}

/** Нумерация блоков внутри заключения */
function computeNumbers(blocks: ConclusionBlock[], baseNum: number): Map<string, string> {
  const map = new Map<string, string>();
  let sub = 0;
  for (const b of blocks) {
    if (b.type !== "section") continue;
    if (b.level === 1) {
      sub = 0;
      map.set(b.id, `${baseNum}`);
    } else {
      sub++;
      map.set(b.id, `${baseNum}.${sub}`);
    }
  }
  return map;
}

// ─── BlockActions ─────────────────────────────────────────────────────────────

function BlockActions({ isFirst, isLast, onMoveUp, onMoveDown, onDelete }: {
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

// ─── TextBlockEl ──────────────────────────────────────────────────────────────

function TextBlockEl({ block, onChange, ...actions }: {
  block: ConclusionBlock;
  onChange: (b: ConclusionBlock) => void;
} & Parameters<typeof BlockActions>[0]) {
  return (
    <div className="group flex items-start gap-2">
      <div className="flex-1 relative">
        <div className="absolute left-2 top-2 text-muted-foreground/20"><Icon name="AlignLeft" size={12} /></div>
        <textarea
          value={block.content ?? ""}
          onChange={(e) => {
            onChange({ ...block, content: e.target.value });
            const t = e.target; t.style.height = "auto"; t.style.height = t.scrollHeight + "px";
          }}
          placeholder="Текст параграфа..."
          rows={3}
          className="w-full bg-muted/40 border border-border px-3 pl-7 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-geo-amber transition-colors resize-none leading-relaxed"
        />
      </div>
      <BlockActions {...actions} />
    </div>
  );
}

// ─── SectionHeadingEl ─────────────────────────────────────────────────────────

function SectionHeadingEl({ block, sectionNum, onChange, ...actions }: {
  block: ConclusionBlock;
  sectionNum: string;
  onChange: (b: ConclusionBlock) => void;
} & Parameters<typeof BlockActions>[0]) {
  const isTop = block.level === 1;
  return (
    <div className="group flex items-start gap-2">
      <div className={`flex-1 flex items-center gap-2 py-1 ${isTop ? "border-l-2 border-geo-amber/60 pl-3" : "border-l-2 border-geo-amber/20 pl-5"}`}>
        <span className={`font-mono font-semibold flex-shrink-0 ${isTop ? "text-sm text-geo-amber" : "text-xs text-geo-amber/60"}`}>
          {sectionNum}
        </span>
        <div className="flex-1 flex items-center gap-2">
          <select
            value={block.level ?? 2}
            onChange={(e) => onChange({ ...block, level: Number(e.target.value) as 1 | 2 })}
            className="bg-muted border border-border text-xs font-mono text-muted-foreground px-1.5 py-1 focus:outline-none focus:border-geo-amber transition-colors w-28 flex-shrink-0"
          >
            <option value={1}>Раздел</option>
            <option value={2}>Подраздел</option>
          </select>
          <input
            type="text"
            value={block.sectionTitle ?? ""}
            onChange={(e) => onChange({ ...block, sectionTitle: e.target.value })}
            placeholder={isTop ? "Название раздела..." : "Название подраздела..."}
            className={`flex-1 bg-transparent border-b border-border focus:border-geo-amber outline-none py-1 transition-colors placeholder:text-muted-foreground/40 text-foreground font-display tracking-wide ${isTop ? "text-sm font-semibold" : "text-sm"}`}
          />
        </div>
      </div>
      <BlockActions {...actions} />
    </div>
  );
}

// ─── AddBlockMenu ─────────────────────────────────────────────────────────────

function AddBlockMenu({ onAdd }: { onAdd: (type: ConclusionBlock["type"]) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 border border-dashed border-border/60 text-muted-foreground/50 hover:border-geo-amber/50 hover:text-geo-amber px-4 py-2 text-xs font-mono w-full justify-center transition-colors"
      >
        <Icon name="Plus" size={13} /> Добавить блок
      </button>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 bg-card border border-border shadow-lg z-20 py-1 w-52">
          {[
            { type: "text" as const, icon: "AlignLeft", label: "Текст" },
            { type: "section" as const, icon: "Heading2", label: "Раздел / подраздел" },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => { onAdd(item.type); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <Icon name={item.icon} fallback="Plus" size={14} className="text-geo-amber/70" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ConclusionSection ────────────────────────────────────────────────────────

export function ConclusionSection({ reportId }: { reportId: string }) {
  const storageKey = `geo_conclusion_${reportId}`;

  const load = (): ConclusionBlock[] => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  };
  const persist = (blocks: ConclusionBlock[]) => localStorage.setItem(storageKey, JSON.stringify(blocks));

  const [blocks, setBlocks] = useState<ConclusionBlock[]>(load);

  const conclusionNum = getConclusionNum(reportId);
  const numbers = computeNumbers(blocks, conclusionNum);

  const update = (next: ConclusionBlock[]) => { setBlocks(next); persist(next); };

  const addBlock = (type: ConclusionBlock["type"]) => {
    update([...blocks, { id: newId(), type, content: "", sectionTitle: "", level: 2 }]);
  };

  const changeBlock = (id: string, b: ConclusionBlock) => update(blocks.map((bl) => bl.id === id ? b : bl));
  const deleteBlock = (id: string) => update(blocks.filter((bl) => bl.id !== id));
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...blocks];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    update(next);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/60 uppercase tracking-widest">
          <Icon name="CheckSquare" size={13} className="text-geo-amber/60" />
          <span className="text-geo-amber font-semibold">{conclusionNum}.</span>
          Заключение
          {blocks.filter(b => b.type === "section").length > 0 && (
            <span className="text-muted-foreground/40">{blocks.filter(b => b.type === "section").length} подразд.</span>
          )}
        </div>
        {blocks.length === 0 && (
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/40">
            <Icon name="Info" size={12} /> Сплошным текстом или с разбивкой на подразделы
          </div>
        )}
      </div>

      {blocks.length === 0 ? (
        <div className="border border-dashed border-border py-14 flex flex-col items-center gap-4 text-center px-8">
          <Icon name="CheckSquare" size={26} className="text-muted-foreground/20" />
          <div className="space-y-1 max-w-sm">
            <p className="text-sm text-foreground/60 font-medium">Заключение пустое</p>
            <p className="text-xs text-muted-foreground/50 font-mono leading-relaxed">
              Основные результаты, выводы и рекомендации по дальнейшим работам
            </p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            {[
              { type: "text" as const, icon: "AlignLeft", label: "Добавить текст" },
              { type: "section" as const, icon: "Heading2", label: "Добавить раздел" },
            ].map((item) => (
              <button key={item.type} onClick={() => addBlock(item.type)}
                className="flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-mono text-muted-foreground hover:border-geo-amber hover:text-geo-amber transition-colors">
                <Icon name={item.icon} fallback="Plus" size={12} /> {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, idx) => {
            const common = {
              isFirst: idx === 0,
              isLast: idx === blocks.length - 1,
              onMoveUp: () => move(idx, -1),
              onMoveDown: () => move(idx, 1),
              onDelete: () => deleteBlock(block.id),
            };
            if (block.type === "section") {
              return (
                <SectionHeadingEl
                  key={block.id}
                  block={block}
                  sectionNum={numbers.get(block.id) ?? `${conclusionNum}`}
                  onChange={(b) => changeBlock(block.id, b)}
                  {...common}
                />
              );
            }
            return (
              <TextBlockEl
                key={block.id}
                block={block}
                onChange={(b) => changeBlock(block.id, b)}
                {...common}
              />
            );
          })}
          <AddBlockMenu onAdd={addBlock} />
        </div>
      )}
    </div>
  );
}
