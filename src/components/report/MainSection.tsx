import { useState } from "react";
import Icon from "@/components/ui/icon";
import type {
  MainSection, MainBlock, MainImage,
  AppendixRef, AppendixRefKind,
  TableEntry, TextAppendix, GraphicAppendix,
} from "./reportTypes";
import { UPLOAD_URL } from "./reportTypes";
import { TableBlockEditor, TablePreview, makeTable } from "./TableBlockEditor";
import { syncAllFromText } from "./syncFromText";

// ─── Вычисляет карту blockId → порядковый номер (для таблиц и иллюстраций) ──

type BlockNumberMap = Record<string, number>;

function buildBlockNumbers(sections: MainSection[]): { tables: BlockNumberMap; images: BlockNumberMap } {
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

// ─── helpers ──────────────────────────────────────────────────────────────────

function newId() { return Date.now().toString() + Math.random().toString(36).slice(2, 6); }

function loadJson<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}

const KIND_LABEL: Record<AppendixRefKind, string> = {
  table: "Таблица",
  text_appendix: "Текстовое приложение",
  graphic_appendix: "Графическое приложение",
};

// ─── AppendixRefPicker ────────────────────────────────────────────────────────

function AppendixRefPicker({ reportId, onPick, onClose }: {
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

        {/* Kind selector */}
        <div className="grid grid-cols-3 border border-border overflow-hidden text-xs">
          {(["table", "text_appendix", "graphic_appendix"] as AppendixRefKind[]).map((k) => (
            <button key={k} onClick={() => setKind(k)}
              className={`py-2 px-2 font-mono transition-colors ${kind === k ? "bg-geo-amber/10 text-geo-amber border-b-2 border-b-geo-amber" : "text-muted-foreground hover:bg-muted/30"}`}>
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>

        {/* Items */}
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

// ─── AddBlockMenu ─────────────────────────────────────────────────────────────

function AddBlockMenu({ onAdd }: { onAdd: (type: MainBlock["type"]) => void }) {
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

// ─── Block renderers ──────────────────────────────────────────────────────────

function TextBlockEl({ block, onChange, ...actions }: { block: MainBlock; onChange: (b: MainBlock) => void } & Parameters<typeof BlockActions>[0]) {
  return (
    <div className="group flex items-start gap-2">
      <div className="flex-1 relative">
        <div className="absolute left-2 top-2 text-muted-foreground/20"><Icon name="AlignLeft" size={12} /></div>
        <textarea value={block.content ?? ""} onChange={(e) => {
          onChange({ ...block, content: e.target.value });
          const t = e.target; t.style.height = "auto"; t.style.height = t.scrollHeight + "px";
        }}
          placeholder="Текст параграфа..." rows={3}
          className="w-full bg-muted/40 border border-border px-3 pl-7 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-geo-amber transition-colors resize-none leading-relaxed" />
      </div>
      <BlockActions {...actions} />
    </div>
  );
}

function ImageBlockEl({ block, onChange, reportId, imageNum, ...actions }: { block: MainBlock; onChange: (b: MainBlock) => void; reportId: string; imageNum?: number } & Parameters<typeof BlockActions>[0]) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const img = block.image;

  const upload = async (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = (reader.result as string).split(",")[1];
      const res = await fetch(UPLOAD_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ file: b64, filename: file.name, contentType: file.type || "image/jpeg", folder: `geo-main-${reportId}` }) });
      const data = await res.json();
      if (data.url) {
        const newImg: MainImage = { id: newId(), url: data.url, filename: file.name, caption: img?.caption ?? "", uploadedAt: new Date().toISOString() };
        onChange({ ...block, image: newImg });
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="group flex items-start gap-2">
      <div className="flex-1 border border-border bg-muted/20 p-3 space-y-2">
        {!img?.url ? (
          <label onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) upload(f); }}
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed py-6 cursor-pointer transition-colors ${dragOver ? "border-geo-amber bg-geo-amber/5" : "border-border/60 hover:border-geo-amber/50"}`}>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
            {uploading
              ? <><Icon name="Loader" size={16} className="text-geo-amber animate-spin" /><span className="font-mono text-xs text-muted-foreground">Загрузка...</span></>
              : <><Icon name="ImagePlus" size={18} className="text-muted-foreground/30" /><p className="text-xs text-muted-foreground font-mono">JPG, PNG, WEBP, SVG</p></>}
          </label>
        ) : (
          <div className="relative group/img">
            <img src={img.url} alt={img.caption} className="w-full max-h-52 object-contain bg-muted/30" />
            <label className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1 bg-card border border-border px-2 py-1 text-xs font-mono cursor-pointer hover:border-geo-amber transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
              <Icon name="RefreshCw" size={11} /> Заменить
            </label>
          </div>
        )}
        {/* Номер рисунка + подпись */}
        <div className="flex items-center gap-2">
          {imageNum != null && (
            <span className="font-mono text-xs text-geo-amber font-semibold flex-shrink-0 border border-geo-amber/30 bg-geo-amber/5 px-1.5 py-0.5">
              Рис. {imageNum}
            </span>
          )}
          <span className="text-xs font-mono text-muted-foreground/50 flex-shrink-0">Подпись:</span>
          <input type="text" value={img?.caption ?? ""} onChange={(e) => onChange({ ...block, image: { ...(img ?? { id: newId(), url: "", filename: "", uploadedAt: "" }), caption: e.target.value } })}
            placeholder="Название рисунка..." className="flex-1 bg-transparent border-b border-border/50 focus:border-geo-amber outline-none text-xs text-foreground py-0.5 placeholder:text-muted-foreground/30 transition-colors" />
        </div>
      </div>
      <BlockActions {...actions} />
    </div>
  );
}

function TableBlockEl({ block, onChange, tableNum, ...actions }: { block: MainBlock; onChange: (b: MainBlock) => void; tableNum?: number } & Parameters<typeof BlockActions>[0]) {
  const [editing, setEditing] = useState(!block.tableData);

  const data = block.tableData ?? makeTable(3, 3);
  const label = tableNum != null
    ? `Таблица ${tableNum}${block.tableCaption ? ` — ${block.tableCaption}` : ""}`
    : block.tableCaption || null;

  return (
    <div className="group flex items-start gap-2">
      <div className="flex-1 space-y-0 overflow-hidden">
        {/* Номер таблицы */}
        {tableNum != null && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-geo-amber/5 border border-b-0 border-geo-amber/20">
            <Icon name="Hash" size={11} className="text-geo-amber/60 flex-shrink-0" />
            <span className="font-mono text-xs text-geo-amber font-semibold">Таблица {tableNum}</span>
            {block.tableCaption && (
              <span className="text-xs text-muted-foreground/60 truncate">— {block.tableCaption}</span>
            )}
          </div>
        )}
        {editing ? (
          <TableBlockEditor
            caption={block.tableCaption ?? ""}
            data={data}
            onCaptionChange={(v) => onChange({ ...block, tableCaption: v })}
            onDataChange={(d) => onChange({ ...block, tableData: d, tableContent: undefined })}
          />
        ) : (
          <div
            className="border border-border cursor-pointer hover:border-geo-amber/40 transition-colors"
            onClick={() => setEditing(true)}
            title="Нажмите для редактирования"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border">
              <Icon name="Table2" size={13} className="text-geo-amber/60 flex-shrink-0" />
              <span className="text-sm font-medium text-foreground flex-1 truncate">
                {label || <span className="text-muted-foreground/40 italic">Без названия</span>}
              </span>
              <Icon name="Pencil" size={11} className="text-muted-foreground/40 flex-shrink-0" />
            </div>
            <div className="p-2">
              <TablePreview data={data} />
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 px-2 py-1 bg-muted/10 border border-t-0 border-border">
          <button
            onClick={() => setEditing((v) => !v)}
            className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-geo-amber transition-colors"
          >
            <Icon name={editing ? "EyeOff" : "Pencil"} size={11} />
            {editing ? "Свернуть" : "Редактировать"}
          </button>
        </div>
      </div>
      <BlockActions {...actions} />
    </div>
  );
}

function AppendixRefEl({ block, onDelete, ...actions }: { block: MainBlock; onDelete: () => void } & Omit<Parameters<typeof BlockActions>[0], "onDelete">) {
  const ref = block.appendixRef;
  const icons: Record<AppendixRefKind, string> = { table: "Table2", text_appendix: "FileStack", graphic_appendix: "Map" };
  return (
    <div className="group flex items-start gap-2">
      <div className="flex-1 flex items-center gap-3 border border-geo-amber/20 bg-geo-amber/5 px-3 py-2.5">
        <Icon name={ref ? icons[ref.kind] : "Link"} fallback="Link" size={14} className="text-geo-amber/60 flex-shrink-0" />
        <span className="text-sm text-geo-amber/80 font-mono leading-snug">{ref?.label ?? "Ссылка на приложение"}</span>
        <Icon name="ArrowUpRight" size={12} className="text-geo-amber/40 flex-shrink-0 ml-auto" />
      </div>
      <BlockActions {...actions} onDelete={onDelete} />
    </div>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

function SectionCard({ section, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast, reportId, sectionNum, blockNumbers }: {
  section: MainSection;
  onChange: (s: MainSection) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  reportId: string;
  sectionNum: string;
  blockNumbers: { tables: BlockNumberMap; images: BlockNumberMap };
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [pickerBlockId, setPickerBlockId] = useState<string | null>(null);

  const updateBlock = (id: string, b: MainBlock) => onChange({ ...section, blocks: section.blocks.map((bl) => bl.id === id ? b : bl) });
  const deleteBlock = (id: string) => onChange({ ...section, blocks: section.blocks.filter((bl) => bl.id !== id) });
  const moveBlock = (idx: number, dir: -1 | 1) => {
    const next = [...section.blocks];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    onChange({ ...section, blocks: next });
  };

  const addBlock = (type: MainBlock["type"]) => {
    const id = newId();
    const block: MainBlock = {
      id,
      type,
      ...(type === "table" ? { tableData: makeTable(3, 3), tableCaption: "" } : {}),
    };
    if (type === "appendix_ref") { setPickerBlockId(id); }
    onChange({ ...section, blocks: [...section.blocks, block] });
  };

  const applyRef = (ref: AppendixRef) => {
    onChange({ ...section, blocks: section.blocks.map((bl) => bl.id === pickerBlockId ? { ...bl, appendixRef: ref } : bl) });
    setPickerBlockId(null);
  };

  const levelLabel = sectionNum;

  return (
    <div className={`border ${section.level === 1 ? "border-border" : "border-border/50 ml-6"} bg-card`}>
      {/* Section header */}
      <div className={`flex items-center gap-3 px-4 py-3 ${section.level === 1 ? "bg-muted/30 border-l-2 border-l-geo-amber/60" : "bg-muted/10 border-l-2 border-l-geo-amber/20"} border-b border-border/50`}>
        <span className={`font-mono flex-shrink-0 font-semibold ${section.level === 1 ? "text-sm text-geo-amber" : "text-xs text-geo-amber/60"}`}>{levelLabel}</span>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          placeholder={section.level === 1 ? "Название раздела..." : "Название подраздела..."}
          className={`flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40 focus:placeholder:text-muted-foreground/20 transition-colors ${section.level === 1 ? "text-sm font-display tracking-wide font-semibold" : "text-sm"}`}
        />
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button onClick={() => setCollapsed((v) => !v)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <Icon name={collapsed ? "ChevronDown" : "ChevronUp"} size={13} />
          </button>
          <button onClick={onMoveUp} disabled={isFirst} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"><Icon name="ChevronUp" size={13} /></button>
          <button onClick={onMoveDown} disabled={isLast} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"><Icon name="ChevronDown" size={13} /></button>
          <button onClick={onDelete} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Icon name="Trash2" size={13} /></button>
        </div>
      </div>

      {/* Blocks */}
      {!collapsed && (
        <div className="p-4 space-y-3">
          {section.blocks.length === 0 && (
            <p className="text-xs text-muted-foreground/40 font-mono text-center py-2">Раздел пустой — добавьте блоки</p>
          )}
          {section.blocks.map((block, idx) => {
            const blockProps = {
              isFirst: idx === 0,
              isLast: idx === section.blocks.length - 1,
              onMoveUp: () => moveBlock(idx, -1),
              onMoveDown: () => moveBlock(idx, 1),
              onDelete: () => deleteBlock(block.id),
            };
            if (block.type === "text") return <TextBlockEl key={block.id} block={block} onChange={(b) => updateBlock(block.id, b)} {...blockProps} />;
            if (block.type === "image") return <ImageBlockEl key={block.id} block={block} onChange={(b) => updateBlock(block.id, b)} reportId={reportId} imageNum={blockNumbers.images[block.id]} {...blockProps} />;
            if (block.type === "table") return <TableBlockEl key={block.id} block={block} onChange={(b) => updateBlock(block.id, b)} tableNum={blockNumbers.tables[block.id]} {...blockProps} />;
            if (block.type === "appendix_ref") return <AppendixRefEl key={block.id} block={block} {...blockProps} />;
            return null;
          })}
          <AddBlockMenu onAdd={addBlock} />
        </div>
      )}

      {pickerBlockId && (
        <AppendixRefPicker
          reportId={reportId}
          onPick={applyRef}
          onClose={() => {
            onChange({ ...section, blocks: section.blocks.filter((bl) => !(bl.id === pickerBlockId && !bl.appendixRef)) });
            setPickerBlockId(null);
          }}
        />
      )}
    </div>
  );
}

// ─── MainTextSection ──────────────────────────────────────────────────────────

export function MainTextSection({ reportId }: { reportId: string }) {
  const storageKey = `geo_main_text_${reportId}`;

  const load = (): MainSection[] => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  };
  const persist = (sections: MainSection[]) => localStorage.setItem(storageKey, JSON.stringify(sections));

  const [sections, setSections] = useState<MainSection[]>(load);

  const update = (next: MainSection[]) => {
    setSections(next);
    persist(next);
    syncAllFromText(reportId, next);
  };

  const addSection = (level: 1 | 2) => {
    update([...sections, { id: newId(), level, title: "", blocks: [] }]);
  };

  const changeSection = (id: string, s: MainSection) => update(sections.map((sec) => sec.id === id ? s : sec));
  const deleteSection = (id: string) => update(sections.filter((sec) => sec.id !== id));
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...sections];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    update(next);
  };

  // Номера таблиц и иллюстраций по blockId (пересчитываются при каждом изменении)
  const blockNumbers = buildBlockNumbers(sections);

  // Нумерация: разделы начиная с 2 (Введение = 1), подразделы X.1, X.2...
  const sectionNumbers = (() => {
    let sectionNum = 1; // старт с 2 после Введения
    let subNum = 0;
    return sections.map((s) => {
      if (s.level === 1) {
        sectionNum++;
        subNum = 0;
        return `${sectionNum}`;
      } else {
        subNum++;
        return `${sectionNum}.${subNum}`;
      }
    });
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/60 uppercase tracking-widest">
          <Icon name="FileText" size={13} className="text-geo-amber/60" />
          Основная часть
          {sections.length > 0 && <span className="text-geo-amber">{sections.length} разд.</span>}
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="border border-dashed border-border py-14 flex flex-col items-center gap-4 text-center px-8">
          <Icon name="FileText" size={26} className="text-muted-foreground/20" />
          <div className="space-y-1 max-w-sm">
            <p className="text-sm text-foreground/60 font-medium">Основная часть пустая</p>
            <p className="text-xs text-muted-foreground/50 font-mono leading-relaxed">
              Добавляйте разделы и подразделы, внутри каждого — текст, иллюстрации, таблицы и ссылки на приложения
            </p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <button onClick={() => addSection(1)} className="flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-mono text-muted-foreground hover:border-geo-amber hover:text-geo-amber transition-colors">
              <Icon name="Heading2" size={12} /> Добавить раздел
            </button>
            <button onClick={() => addSection(2)} className="flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-mono text-muted-foreground hover:border-geo-amber hover:text-geo-amber transition-colors">
              <Icon name="Heading3" size={12} /> Добавить подраздел
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, idx) => (
            <SectionCard
              key={section.id}
              section={section}
              onChange={(s) => changeSection(section.id, s)}
              onDelete={() => deleteSection(section.id)}
              onMoveUp={() => move(idx, -1)}
              onMoveDown={() => move(idx, 1)}
              isFirst={idx === 0}
              isLast={idx === sections.length - 1}
              reportId={reportId}
              sectionNum={sectionNumbers[idx]}
              blockNumbers={blockNumbers}
            />
          ))}

          {/* Add section buttons */}
          <div className="flex gap-2 pt-1">
            <button onClick={() => addSection(1)} className="flex items-center gap-1.5 border border-dashed border-border/60 text-muted-foreground/50 hover:border-geo-amber/50 hover:text-geo-amber/70 px-4 py-2 text-xs font-mono flex-1 justify-center transition-colors">
              <Icon name="Plus" size={12} /> Раздел
            </button>
            <button onClick={() => addSection(2)} className="flex items-center gap-1.5 border border-dashed border-border/60 text-muted-foreground/50 hover:border-geo-amber/50 hover:text-geo-amber/70 px-4 py-2 text-xs font-mono flex-1 justify-center transition-colors">
              <Icon name="Plus" size={12} /> Подраздел
            </button>
          </div>
        </div>
      )}
    </div>
  );
}