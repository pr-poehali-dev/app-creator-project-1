import { useState, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";
import type { TableCell, TableData } from "./reportTypes";

// ─── helpers ──────────────────────────────────────────────────────────────────

function emptyCell(isHeader = false): TableCell {
  return { content: "", isHeader };
}

function makeTable(rows: number, cols: number): TableData {
  const firstRow = Array.from({ length: cols }, () => emptyCell(true));
  const rest = Array.from({ length: rows - 1 }, () =>
    Array.from({ length: cols }, () => emptyCell(false))
  );
  return { rows: [firstRow, ...rest] };
}

function colsCount(data: TableData): number {
  return Math.max(...data.rows.map((r) => r.length));
}

// ─── Cell ─────────────────────────────────────────────────────────────────────

interface CellProps {
  cell: TableCell;
  rowIdx: number;
  colIdx: number;
  selected: boolean;
  onSelect: (r: number, c: number) => void;
  onChange: (r: number, c: number, cell: TableCell) => void;
}

function Cell({ cell, rowIdx, colIdx, selected, onSelect, onChange }: CellProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(rowIdx, colIdx, { ...cell, content: e.target.value });
    const t = e.target;
    t.style.height = "auto";
    t.style.height = t.scrollHeight + "px";
  }, [cell, rowIdx, colIdx, onChange]);

  const Tag = cell.isHeader ? "th" : "td";

  return (
    <Tag
      onClick={() => onSelect(rowIdx, colIdx)}
      style={{ minWidth: "80px", padding: 0, verticalAlign: "top" }}
      className={`border border-border/60 transition-colors ${
        cell.isHeader ? "bg-muted/60" : "bg-card"
      } ${selected ? "ring-2 ring-inset ring-geo-amber" : "hover:bg-muted/20"}`}
    >
      <textarea
        ref={ref}
        value={cell.content}
        onChange={handleInput}
        onFocus={() => onSelect(rowIdx, colIdx)}
        rows={1}
        className={`w-full px-2 py-1.5 text-xs bg-transparent outline-none resize-none leading-snug overflow-hidden ${
          cell.bold ? "font-bold" : cell.isHeader ? "font-semibold" : ""
        } ${cell.italic ? "italic" : ""} ${
          cell.align === "center" ? "text-center" : cell.align === "right" ? "text-right" : "text-left"
        }`}
        style={{ minHeight: "28px", height: "auto" }}
      />
    </Tag>
  );
}

// ─── TableBlockEditor ─────────────────────────────────────────────────────────

interface Props {
  caption: string;
  data: TableData;
  onCaptionChange: (v: string) => void;
  onDataChange: (d: TableData) => void;
}

export function TableBlockEditor({ caption, data, onCaptionChange, onDataChange }: Props) {
  const [selected, setSelected] = useState<[number, number] | null>(null);

  const rows = data.rows;
  const cols = colsCount(data);

  const update = (newRows: TableCell[][]) => onDataChange({ rows: newRows });

  const changeCell = useCallback((r: number, c: number, cell: TableCell) => {
    const next = rows.map((row, ri) =>
      ri === r ? row.map((cl, ci) => (ci === c ? cell : cl)) : row
    );
    update(next);
  }, [rows]);

  const addRow = () => {
    update([...rows, Array.from({ length: cols }, () => emptyCell(false))]);
  };

  const addCol = () => {
    update(rows.map((row, ri) => [...row, emptyCell(ri === 0)]));
  };

  const removeRow = () => {
    if (rows.length <= 1) return;
    const idx = selected ? selected[0] : rows.length - 1;
    const next = rows.filter((_, i) => i !== idx);
    update(next);
    setSelected(null);
  };

  const removeCol = () => {
    if (cols <= 1) return;
    const idx = selected ? selected[1] : cols - 1;
    update(rows.map((row) => row.filter((_, i) => i !== idx)));
    setSelected(null);
  };

  const toggleHeader = () => {
    if (!selected) return;
    const [r, c] = selected;
    const cell = rows[r][c];
    changeCell(r, c, { ...cell, isHeader: !cell.isHeader });
  };

  const toggleBold = () => {
    if (!selected) return;
    const [r, c] = selected;
    const cell = rows[r][c];
    changeCell(r, c, { ...cell, bold: !cell.bold });
  };

  const toggleItalic = () => {
    if (!selected) return;
    const [r, c] = selected;
    const cell = rows[r][c];
    changeCell(r, c, { ...cell, italic: !cell.italic });
  };

  const setAlign = (align: TableCell["align"]) => {
    if (!selected) return;
    const [r, c] = selected;
    const cell = rows[r][c];
    changeCell(r, c, { ...cell, align: cell.align === align ? undefined : align });
  };

  const toggleRowHeader = () => {
    if (!selected) return;
    const [r] = selected;
    const isAll = rows[r].every((c) => c.isHeader);
    update(rows.map((row, ri) =>
      ri === r ? row.map((c) => ({ ...c, isHeader: !isAll })) : row
    ));
  };

  const selectedCell = selected ? rows[selected[0]]?.[selected[1]] : null;

  return (
    <div className="border border-border bg-card space-y-0 overflow-hidden">

      {/* Caption */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
        <Icon name="Table2" size={13} className="text-geo-amber/70 flex-shrink-0" />
        <input
          type="text"
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Название таблицы..."
          className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/30"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-muted/20 flex-wrap">
        {/* Structure */}
        <button onClick={addRow} title="Добавить строку"
          className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-sm">
          <Icon name="Plus" size={11} /><span className="hidden sm:inline">Строка</span>
        </button>
        <button onClick={addCol} title="Добавить столбец"
          className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-sm">
          <Icon name="Plus" size={11} /><span className="hidden sm:inline">Столбец</span>
        </button>
        <button onClick={removeRow} disabled={rows.length <= 1} title="Удалить строку"
          className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-muted-foreground hover:text-destructive hover:bg-muted disabled:opacity-30 transition-colors rounded-sm">
          <Icon name="Minus" size={11} /><span className="hidden sm:inline">Строку</span>
        </button>
        <button onClick={removeCol} disabled={cols <= 1} title="Удалить столбец"
          className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-muted-foreground hover:text-destructive hover:bg-muted disabled:opacity-30 transition-colors rounded-sm">
          <Icon name="Minus" size={11} /><span className="hidden sm:inline">Столбец</span>
        </button>

        <div className="w-px h-4 bg-border/60 mx-1" />

        {/* Formatting — активны только если ячейка выбрана */}
        <button onClick={toggleBold} disabled={!selected} title="Жирный (Bold)"
          className={`px-2 py-1 text-xs font-bold font-mono transition-colors rounded-sm disabled:opacity-30 ${selectedCell?.bold ? "bg-geo-amber/20 text-geo-amber" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
          B
        </button>
        <button onClick={toggleItalic} disabled={!selected} title="Курсив (Italic)"
          className={`px-2 py-1 text-xs italic font-mono transition-colors rounded-sm disabled:opacity-30 ${selectedCell?.italic ? "bg-geo-amber/20 text-geo-amber" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
          I
        </button>

        <div className="w-px h-4 bg-border/60 mx-1" />

        {/* Align */}
        <button onClick={() => setAlign("left")} disabled={!selected} title="По левому краю"
          className={`p-1 transition-colors rounded-sm disabled:opacity-30 ${selectedCell?.align === "left" || (!selectedCell?.align && !selectedCell?.isHeader) ? "text-geo-amber" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
          <Icon name="AlignLeft" size={12} />
        </button>
        <button onClick={() => setAlign("center")} disabled={!selected} title="По центру"
          className={`p-1 transition-colors rounded-sm disabled:opacity-30 ${selectedCell?.align === "center" ? "text-geo-amber" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
          <Icon name="AlignCenter" size={12} />
        </button>
        <button onClick={() => setAlign("right")} disabled={!selected} title="По правому краю"
          className={`p-1 transition-colors rounded-sm disabled:opacity-30 ${selectedCell?.align === "right" ? "text-geo-amber" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
          <Icon name="AlignRight" size={12} />
        </button>

        <div className="w-px h-4 bg-border/60 mx-1" />

        {/* Header */}
        <button onClick={toggleHeader} disabled={!selected} title="Заголовочная ячейка"
          className={`flex items-center gap-1 px-2 py-1 text-xs font-mono transition-colors rounded-sm disabled:opacity-30 ${selectedCell?.isHeader ? "bg-geo-amber/20 text-geo-amber" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
          <Icon name="Heading" size={11} /><span className="hidden sm:inline">Заголовок</span>
        </button>
        <button onClick={toggleRowHeader} disabled={!selected} title="Строка — заголовок"
          className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors rounded-sm">
          <Icon name="Rows3" size={11} /><span className="hidden sm:inline">Стр. заголовок</span>
        </button>

        {/* Info */}
        <span className="ml-auto font-mono text-xs text-muted-foreground/40">
          {rows.length}×{cols}
          {selected ? ` · [${selected[0] + 1},${selected[1] + 1}]` : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
          <colgroup>
            {Array.from({ length: cols }).map((_, i) => (
              <col key={i} style={{ width: `${100 / cols}%`, minWidth: "80px" }} />
            ))}
          </colgroup>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <Cell
                    key={ci}
                    cell={cell}
                    rowIdx={ri}
                    colIdx={ci}
                    selected={selected?.[0] === ri && selected?.[1] === ci}
                    onSelect={setSelected}
                    onChange={changeCell}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1.5 border-t border-border/40 bg-muted/10 flex items-center gap-2">
        <Icon name="Info" size={11} className="text-muted-foreground/30 flex-shrink-0" />
        <span className="font-mono text-xs text-muted-foreground/30">
          Нажмите на ячейку для выбора · используйте панель инструментов для форматирования
        </span>
      </div>
    </div>
  );
}

// ─── Превью таблицы (read-only) ───────────────────────────────────────────────

interface PreviewProps {
  caption?: string;
  data: TableData;
}

export function TablePreview({ caption, data }: PreviewProps) {
  return (
    <div className="space-y-1.5">
      {caption && (
        <p className="text-xs font-medium text-foreground/80 font-mono">{caption}</p>
      )}
      <div className="overflow-x-auto border border-border">
        <table className="w-full border-collapse text-xs">
          <tbody>
            {data.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => {
                  const Tag = cell.isHeader ? "th" : "td";
                  return (
                    <Tag
                      key={ci}
                      className={`border border-border/50 px-2 py-1 text-left leading-snug ${
                        cell.isHeader ? "bg-muted/60 font-semibold" : "bg-card"
                      } ${cell.bold ? "font-bold" : ""} ${cell.italic ? "italic" : ""} ${
                        cell.align === "center" ? "text-center" : cell.align === "right" ? "text-right" : ""
                      }`}
                    >
                      {cell.content || <span className="text-muted-foreground/20 italic">—</span>}
                    </Tag>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Экспорт утилит ───────────────────────────────────────────────────────────
export { makeTable, emptyCell };
