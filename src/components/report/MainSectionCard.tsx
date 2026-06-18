import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { MainSection, MainBlock, AppendixRef } from "./reportTypes";
import { makeTable } from "./TableBlockEditor";
import { newId, BlockNumberMap, AddBlockMenu, AppendixRefPicker, BlockActions } from "./MainSectionHelpers";
import { TextBlockEl, ImageBlockEl, TableBlockEl, AppendixRefEl } from "./MainSectionBlocks";

// ─── SectionCard ──────────────────────────────────────────────────────────────

export function SectionCard({ section, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast, reportId, sectionNum, blockNumbers }: {
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
