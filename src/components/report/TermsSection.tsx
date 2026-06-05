import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import type { TermEntry } from "./reportTypes";

export function TermsSection({ reportId }: { reportId: string }) {
  const storageKey = `geo_terms_${reportId}`;

  const load = (): TermEntry[] => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  };
  const persist = (items: TermEntry[]) => localStorage.setItem(storageKey, JSON.stringify(items));

  const [items, setItems] = useState<TermEntry[]>(load);
  const [modal, setModal] = useState<null | "add" | TermEntry>(null);
  const [form, setForm] = useState({ term: "", definition: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const termRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (modal) setTimeout(() => termRef.current?.focus(), 50);
  }, [modal]);

  const sorted = [...items].sort((a, b) => a.term.localeCompare(b.term, "ru"));
  const filtered = search.trim()
    ? sorted.filter((i) => i.term.toLowerCase().includes(search.toLowerCase()) || i.definition.toLowerCase().includes(search.toLowerCase()))
    : sorted;

  const openAdd = () => {
    setForm({ term: "", definition: "" });
    setError(null);
    setModal("add");
  };

  const openEdit = (item: TermEntry) => {
    setForm({ term: item.term, definition: item.definition });
    setError(null);
    setModal(item);
  };

  const saveItem = () => {
    if (!form.term.trim()) { setError("Укажите термин"); return; }
    if (!form.definition.trim()) { setError("Укажите расшифровку термина"); return; }

    // Check duplicate (skip self on edit)
    const editId = modal !== "add" ? (modal as TermEntry).id : null;
    const duplicate = items.find((i) => i.term.toLowerCase() === form.term.trim().toLowerCase() && i.id !== editId);
    if (duplicate) { setError("Термин уже добавлен в список"); return; }

    let next: TermEntry[];
    if (modal === "add") {
      next = [...items, { id: Date.now().toString(), term: form.term.trim(), definition: form.definition.trim() }];
    } else {
      next = items.map((item) =>
        item.id === (modal as TermEntry).id
          ? { ...item, term: form.term.trim(), definition: form.definition.trim() }
          : item
      );
    }
    persist(next);
    setItems(next);
    setModal(null);
  };

  const removeItem = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    persist(next);
    setItems(next);
    setDeleteId(null);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="BookOpen" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Перечень терминов</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 11 · при наличии · сортировка по алфавиту</p>
      </div>

      <div className="border border-geo-amber/30 bg-geo-amber/5 px-4 py-3 flex items-center gap-3">
        <Icon name="Info" size={14} className="text-geo-amber" />
        <span className="font-mono text-xs text-geo-amber/80">Термины отображаются в алфавитном порядке · дубликаты не допускаются</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {items.length > 0 && (
          <div className="flex-1 relative">
            <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по термину или расшифровке..."
              className="w-full bg-muted border border-border pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-geo-amber transition-colors"
            />
          </div>
        )}
        <div className="flex items-center gap-3 ml-auto">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Терминов: <span className="text-geo-amber">{String(items.length).padStart(2, "0")}</span>
          </span>
          <button onClick={openAdd} className="flex items-center gap-2 bg-geo-amber text-primary-foreground px-4 py-2 text-xs font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">
            <Icon name="Plus" size={14} /> Добавить термин
          </button>
        </div>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center">
          <Icon name="BookOpen" size={28} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-mono">Нет терминов — нажмите «Добавить термин»</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-border py-10 text-center">
          <p className="text-sm text-muted-foreground font-mono">Ничего не найдено по запросу «{search}»</p>
        </div>
      ) : (
        <div className="border border-border overflow-hidden divide-y divide-border/50">
          {filtered.map((item) => (
            <div key={item.id} className="flex items-start gap-4 px-4 py-3.5 hover:bg-muted/20 transition-colors group">
              {/* Term */}
              <div className="w-48 flex-shrink-0 pt-0.5">
                <span className="font-mono text-sm text-geo-amber font-semibold">{item.term}</span>
              </div>
              {/* Separator */}
              <span className="text-muted-foreground/30 font-mono text-sm pt-0.5 flex-shrink-0">—</span>
              {/* Definition */}
              <p className="flex-1 text-sm text-foreground/90 leading-relaxed">{item.definition}</p>
              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-0.5">
                <button onClick={() => openEdit(item)} className="p-1.5 text-muted-foreground hover:text-geo-amber transition-colors">
                  <Icon name="Pencil" size={13} />
                </button>
                <button onClick={() => setDeleteId(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                  <Icon name="Trash2" size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm tracking-wider uppercase">
                {modal === "add" ? "Новый термин" : "Редактировать термин"}
              </h4>
              <button onClick={() => setModal(null)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={16} />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Термин</label>
              <input
                ref={termRef}
                type="text"
                value={form.term}
                onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))}
                placeholder="ГКЗ, геологический разрез, кровля пласта..."
                className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors"
                onKeyDown={(e) => e.key === "Enter" && document.getElementById("term-def-input")?.focus()}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Расшифровка / определение</label>
              <textarea
                id="term-def-input"
                value={form.definition}
                onChange={(e) => setForm((f) => ({ ...f, definition: e.target.value }))}
                placeholder="Государственная комиссия по запасам полезных ископаемых..."
                rows={4}
                className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs font-mono border border-destructive/30 px-3 py-2">
                <Icon name="AlertCircle" size={12} /> {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={saveItem}
                className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-amber-400 transition-colors"
              >
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
            <h4 className="font-display text-sm tracking-wider uppercase">Удалить термин?</h4>
            <p className="text-sm text-muted-foreground">
              «<span className="text-foreground font-medium">{items.find((i) => i.id === deleteId)?.term}</span>» будет удалён из перечня.
            </p>
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
