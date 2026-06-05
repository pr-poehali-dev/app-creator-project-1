import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import type { IntroBlock, IntroImage } from "./reportTypes";
import { UPLOAD_URL } from "./reportTypes";

// ─── helpers ──────────────────────────────────────────────────────────────────

function newId() { return Date.now().toString() + Math.random().toString(36).slice(2, 6); }

/** Вычисляет номер для каждого блока типа "section" внутри Введения (раздел 1).
 *  Возвращает Map<blockId, "1.1"> */
function computeIntroNumbers(blocks: IntroBlock[]): Map<string, string> {
  const map = new Map<string, string>();
  let sub = 0;
  for (const b of blocks) {
    if (b.type !== "section") continue;
    sub++;
    map.set(b.id, `1.${sub}`);
  }
  return map;
}

// ─── sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ block, sectionNum, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
  block: IntroBlock;
  sectionNum: string;
  onChange: (b: IntroBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="group flex items-start gap-2">
      <div className="flex-1 flex items-center gap-2 border-l-2 border-geo-amber/30 pl-3 py-1">
        <span className="font-mono text-sm text-geo-amber font-semibold flex-shrink-0 min-w-[2.5rem]">{sectionNum}</span>
        <input
          type="text"
          value={block.sectionTitle ?? ""}
          onChange={(e) => onChange({ ...block, sectionTitle: e.target.value })}
          placeholder="Название подраздела..."
          className="flex-1 bg-transparent border-b border-border focus:border-geo-amber outline-none py-1 transition-colors placeholder:text-muted-foreground/40 text-foreground font-display tracking-wide text-sm"
        />
      </div>
      <BlockActions isFirst={isFirst} isLast={isLast} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} />
    </div>
  );
}

function TextBlock({ block, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
  block: IntroBlock;
  onChange: (b: IntroBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  };

  return (
    <div className="group flex items-start gap-2">
      <div className="flex-1 relative">
        <div className="absolute left-2 top-2 text-muted-foreground/20">
          <Icon name="AlignLeft" size={12} />
        </div>
        <textarea
          ref={ref}
          value={block.content ?? ""}
          onChange={(e) => { onChange({ ...block, content: e.target.value }); autoResize(); }}
          onInput={autoResize}
          placeholder="Введите текст параграфа..."
          rows={3}
          className="w-full bg-muted/40 border border-border px-3 pl-7 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-geo-amber transition-colors resize-none leading-relaxed"
        />
      </div>
      <BlockActions isFirst={isFirst} isLast={isLast} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} />
    </div>
  );
}

function ImageBlock({ block, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast, reportId }: {
  block: IntroBlock;
  onChange: (b: IntroBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  reportId: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const img = block.image;

  const upload = async (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
      setUploadError("Допускаются только изображения (JPG, PNG, WEBP, GIF, SVG)");
      return;
    }
    setUploading(true);
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = (reader.result as string).split(",")[1];
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: b64, filename: file.name, contentType: file.type || "image/jpeg", folder: `geo-intro-${reportId}` }),
      });
      const data = await res.json();
      if (data.url) {
        const newImg: IntroImage = { id: newId(), url: data.url, filename: file.name, caption: img?.caption ?? "Обзорная карта района работ", uploadedAt: new Date().toISOString() };
        onChange({ ...block, image: newImg });
      } else {
        setUploadError("Ошибка загрузки изображения");
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="group flex items-start gap-2">
      <div className="flex-1 space-y-2 border border-border bg-muted/20 p-3">
        {!img?.url ? (
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) upload(f); }}
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed px-6 py-8 cursor-pointer transition-colors ${dragOver ? "border-geo-amber bg-geo-amber/5" : "border-border/60 hover:border-geo-amber/50 hover:bg-muted/30"}`}
          >
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
            {uploading ? (
              <><Icon name="Loader" size={18} className="text-geo-amber animate-spin" /><span className="font-mono text-xs text-muted-foreground">Загрузка...</span></>
            ) : (
              <><Icon name="ImagePlus" size={20} className="text-muted-foreground/30" />
              <div className="text-center">
                <p className="text-sm text-foreground">Перетащите или нажмите</p>
                <p className="text-xs text-muted-foreground/50 font-mono">JPG, PNG, WEBP, SVG</p>
              </div></>
            )}
          </label>
        ) : (
          <div className="space-y-2">
            <div className="relative group/img">
              <img src={img.url} alt={img.caption} className="w-full max-h-60 object-contain bg-muted/30" />
              <label className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1 bg-card border border-border px-2 py-1 text-xs font-mono cursor-pointer hover:border-geo-amber transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
                <Icon name="RefreshCw" size={11} /> Заменить
              </label>
            </div>
            <p className="text-xs font-mono text-muted-foreground/40 truncate">{img.filename}</p>
          </div>
        )}
        {uploadError && <p className="text-xs text-destructive font-mono">{uploadError}</p>}
        {/* Caption */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground/50 flex-shrink-0">Подпись:</span>
          <input
            type="text"
            value={img?.caption ?? ""}
            onChange={(e) => onChange({ ...block, image: { ...(img ?? { id: newId(), url: "", filename: "", uploadedAt: "" }), caption: e.target.value } })}
            placeholder="Обзорная карта района работ"
            className="flex-1 bg-transparent border-b border-border/50 focus:border-geo-amber outline-none text-xs text-foreground py-0.5 placeholder:text-muted-foreground/30 transition-colors"
          />
        </div>
      </div>
      <BlockActions isFirst={isFirst} isLast={isLast} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} />
    </div>
  );
}

function BlockActions({ isFirst, isLast, onMoveUp, onMoveDown, onDelete }: {
  isFirst: boolean; isLast: boolean;
  onMoveUp: () => void; onMoveDown: () => void; onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-1">
      <button onClick={onMoveUp} disabled={isFirst} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors">
        <Icon name="ChevronUp" size={13} />
      </button>
      <button onClick={onMoveDown} disabled={isLast} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors">
        <Icon name="ChevronDown" size={13} />
      </button>
      <button onClick={onDelete} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
        <Icon name="Trash2" size={13} />
      </button>
    </div>
  );
}

// ─── AddBlockMenu ─────────────────────────────────────────────────────────────

function AddBlockMenu({ onAdd }: { onAdd: (type: "text" | "section" | "image") => void }) {
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
            { type: "image" as const, icon: "Image", label: "Иллюстрация (карта, схема)" },
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

// ─── IntroSection ─────────────────────────────────────────────────────────────

export function IntroSection({ reportId }: { reportId: string }) {
  const storageKey = `geo_intro_${reportId}`;

  const load = (): IntroBlock[] => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  };
  const persist = (blocks: IntroBlock[]) => localStorage.setItem(storageKey, JSON.stringify(blocks));

  const [blocks, setBlocks] = useState<IntroBlock[]>(load);

  const update = (next: IntroBlock[]) => { setBlocks(next); persist(next); };

  const addBlock = (type: "text" | "section" | "image") => {
    const block: IntroBlock = { id: newId(), type, content: "", sectionTitle: "", level: 1 };
    update([...blocks, block]);
  };

  const changeBlock = (id: string, b: IntroBlock) => update(blocks.map((bl) => bl.id === id ? b : bl));
  const deleteBlock = (id: string) => update(blocks.filter((bl) => bl.id !== id));

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...blocks];
    const swap = next[idx + dir];
    next[idx + dir] = next[idx];
    next[idx] = swap;
    update(next);
  };

  // Нумерация: Введение = 1, подразделы = 1.1, 1.2 ...
  const introNum = computeIntroNumbers(blocks);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/60 uppercase tracking-widest">
          <Icon name="BookOpenCheck" size={13} className="text-geo-amber/60" />
          <span className="text-geo-amber font-semibold">1.</span>
          Введение
          {blocks.length > 0 && <span className="text-muted-foreground/40">{String(blocks.filter(b => b.type === "section").length)} подразд.</span>}
        </div>
        {blocks.length === 0 && (
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/40">
            <Icon name="Info" size={12} /> Сплошным текстом или с разбивкой на подразделы
          </div>
        )}
      </div>

      {blocks.length === 0 ? (
        <div className="border border-dashed border-border py-14 flex flex-col items-center gap-4 text-center px-8">
          <Icon name="BookOpenCheck" size={26} className="text-muted-foreground/20" />
          <div className="space-y-1 max-w-sm">
            <p className="text-sm text-foreground/60 font-medium">Введение пустое</p>
            <p className="text-xs text-muted-foreground/50 font-mono leading-relaxed">
              Добавляйте блоки: сплошной текст, разделы / подразделы и иллюстрации (обзорная карта, схема расположения)
            </p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            {[
              { type: "text" as const, icon: "AlignLeft", label: "Добавить текст" },
              { type: "section" as const, icon: "Heading2", label: "Добавить раздел" },
              { type: "image" as const, icon: "Image", label: "Добавить иллюстрацию" },
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
            const props = {
              block,
              onChange: (b: IntroBlock) => changeBlock(block.id, b),
              onDelete: () => deleteBlock(block.id),
              onMoveUp: () => move(idx, -1),
              onMoveDown: () => move(idx, 1),
              isFirst: idx === 0,
              isLast: idx === blocks.length - 1,
            };
            if (block.type === "section") return <SectionHeading key={block.id} {...props} sectionNum={introNum.get(block.id) ?? "1.?"} />;
            if (block.type === "image") return <ImageBlock key={block.id} {...props} reportId={reportId} />;
            return <TextBlock key={block.id} {...props} />;
          })}
          <AddBlockMenu onAdd={addBlock} />
        </div>
      )}
    </div>
  );
}