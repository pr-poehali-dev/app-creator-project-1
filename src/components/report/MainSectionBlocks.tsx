import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { MainBlock, AppendixRefKind } from "./reportTypes";
import { UPLOAD_URL } from "./reportTypes";
import { TableBlockEditor, TablePreview, makeTable } from "./TableBlockEditor";
import { BlockActions, newId } from "./MainSectionHelpers";

// ─── TextBlockEl ──────────────────────────────────────────────────────────────

export function TextBlockEl({ block, onChange, ...actions }: { block: MainBlock; onChange: (b: MainBlock) => void } & Parameters<typeof BlockActions>[0]) {
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

// ─── ImageBlockEl ─────────────────────────────────────────────────────────────

export function ImageBlockEl({ block, onChange, reportId, imageNum, ...actions }: { block: MainBlock; onChange: (b: MainBlock) => void; reportId: string; imageNum?: number } & Parameters<typeof BlockActions>[0]) {
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
        const newImg = { id: newId(), url: data.url, filename: file.name, caption: img?.caption ?? "", uploadedAt: new Date().toISOString() };
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

// ─── TableBlockEl ─────────────────────────────────────────────────────────────

export function TableBlockEl({ block, onChange, tableNum, ...actions }: { block: MainBlock; onChange: (b: MainBlock) => void; tableNum?: number } & Parameters<typeof BlockActions>[0]) {
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

// ─── AppendixRefEl ────────────────────────────────────────────────────────────

export function AppendixRefEl({ block, onDelete, ...actions }: { block: MainBlock; onDelete: () => void } & Omit<Parameters<typeof BlockActions>[0], "onDelete">) {
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
