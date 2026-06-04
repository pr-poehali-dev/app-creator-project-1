import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { TableEntry } from "./reportTypes";

export function TablesSection({ reportId }: { reportId: string }) {
  const storageKey = `geo_tables_${reportId}`;

  const load = (): TableEntry[] => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  };
  const persist = (items: TableEntry[]) => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  };

  const [items, setItems] = useState<TableEntry[]>(load);
  const [modal, setModal] = useState<null | "add" | TableEntry>(null);
  const [form, setForm] = useState({ title: "", textPage: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nextNumber = items.length > 0 ? Math.max(...items.map((i) => i.number)) + 1 : 1;

  const openAdd = () => {
    setForm({ title: "", textPage: "" });
    setError(null);
    setModal("add");
  };

  const openEdit = (item: TableEntry) => {
    setForm({ title: item.title, textPage: item.textPage });
    setError(null);
    setModal(item);
  };

  const saveItem = () => {
    if (!form.title.trim()) { setError("Укажите наименование таблицы"); return; }
    let next: TableEntry[];
    if (modal === "add") {
      next = [...items, { id: Date.now().toString(), number: nextNumber, title: form.title.trim(), textPage: form.textPage }];
    } else {
      next = items.map((item) =>
        item.id === (modal as TableEntry).id
          ? { ...item, title: form.title.trim(), textPage: form.textPage }
          : item
      );
    }
    persist(next);
    setItems(next);
    setModal(null);
  };

  const removeItem = (id: string) => {
    const renumbered = items
      .filter((i) => i.id !== id)
      .map((item, idx) => ({ ...item, number: idx + 1 }));
    persist(renumbered);
    setItems(renumbered);
    setDeleteId(null);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="Table" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Список таблиц</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 8 · при наличии · текстовая часть</p>
      </div>

      <div className="border border-geo-amber/30 bg-geo-amber/5 px-4 py-3 flex items-center gap-3">
        <Icon name="Info" size={14} className="text-geo-amber" />
        <span className="font-mono text-xs text-geo-amber/80">Нумерация присваивается автоматически · страница будет связана с текстовой частью позже</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Таблиц: <span className="text-geo-amber">{String(items.length).padStart(2, "0")}</span>
        </span>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-geo-amber text-primary-foreground px-4 py-2 text-xs font-display tracking-wider uppercase hover:bg-amber-400 transition-colors"
        >
          <Icon name="Plus" size={14} /> Добавить таблицу
        </button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center">
          <Icon name="Table" size={28} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-mono">Нет таблиц — нажмите «Добавить таблицу»</p>
        </div>
      ) : (
        <div className="border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest w-14">№</th>
                <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest">Наименование</th>
                <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest w-28">Страница</th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors group">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-muted-foreground/60">{String(item.number).padStart(2, "0")}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground font-medium leading-snug">{item.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    {item.textPage ? (
                      <span className="font-mono text-xs text-foreground">{item.textPage}</span>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground/30 italic">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-muted-foreground hover:text-geo-amber transition-colors">
                        <Icon name="Pencil" size={13} />
                      </button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                        <Icon name="Trash2" size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm tracking-wider uppercase">
                {modal === "add" ? `Таблица № ${nextNumber}` : `Таблица № ${(modal as TableEntry).number}`}
              </h4>
              <button onClick={() => setModal(null)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={16} />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Наименование таблицы</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Сводная ведомость запасов полезного ископаемого..."
                className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors"
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Страница в текстовой части
                <span className="ml-2 normal-case text-muted-foreground/40 font-mono">необязательно · заполнить позже</span>
              </label>
              <input
                type="text"
                value={form.textPage}
                onChange={(e) => setForm((f) => ({ ...f, textPage: e.target.value }))}
                placeholder="—"
                className="w-32 bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-geo-amber transition-colors"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs font-mono border border-destructive/30 px-3 py-2">
                <Icon name="AlertCircle" size={12} /> {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={saveItem} className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">
                Сохранить
              </button>
              <button onClick={() => setModal(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6 space-y-4">
            <h4 className="font-display text-sm tracking-wider uppercase">Удалить таблицу?</h4>
            <p className="text-sm text-muted-foreground">Запись будет удалена, нумерация пересчитается автоматически.</p>
            <div className="flex gap-3">
              <button onClick={() => removeItem(deleteId)} className="flex-1 bg-destructive text-destructive-foreground py-2 text-sm font-display tracking-wider uppercase hover:opacity-90 transition-opacity">
                Удалить
              </button>
              <button onClick={() => setDeleteId(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
