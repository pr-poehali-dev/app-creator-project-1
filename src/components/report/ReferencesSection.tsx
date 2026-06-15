import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import type { ReferenceEntry, ReferenceKind } from "./reportTypes";
import { SectionMeta } from "./SectionMeta";
import type { Secrecy, Contractor } from "@/types/geo";

// ─── helpers ──────────────────────────────────────────────────────────────────

function newId() { return Date.now().toString() + Math.random().toString(36).slice(2, 6); }

const EMPTY_FORM: Omit<ReferenceEntry, "id"> = {
  kind: "published",
  authors: "",
  title: "",
  publishInfo: "",
  organization: "",
  year: "",
  fund: "",
  inventoryNumber: "",
};

/** Короткое библиографическое описание для отображения в списке */
function formatRef(entry: ReferenceEntry): string {
  const parts: string[] = [];
  if (entry.authors) parts.push(entry.authors);
  if (entry.title) parts.push(entry.title);
  if (entry.kind === "published") {
    if (entry.publishInfo) parts.push(entry.publishInfo);
  } else {
    if (entry.organization) parts.push(entry.organization);
    if (entry.year) parts.push(entry.year);
    if (entry.fund) parts.push(entry.fund);
    if (entry.inventoryNumber) parts.push(`№ ${entry.inventoryNumber}`);
  }
  return parts.join(". ");
}

/** Сортировка: по первому автору (или названию) алфавитно */
function sortKey(e: ReferenceEntry): string {
  return (e.authors || e.title || "").toLowerCase();
}

// ─── ReferenceForm ────────────────────────────────────────────────────────────

function ReferenceForm({ initial, onSave, onCancel }: {
  initial: Omit<ReferenceEntry, "id">;
  onSave: (data: Omit<ReferenceEntry, "id">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const save = () => {
    if (!form.authors.trim() && !form.title.trim()) { setError("Укажите автора или наименование работы"); return; }
    if (!form.title.trim()) { setError("Укажите наименование работы"); return; }
    setError(null);
    onSave(form);
  };

  return (
    <div className="space-y-4">
      {/* Kind selector */}
      <div className="grid grid-cols-2 border border-border overflow-hidden">
        {([["published", "Опубликованная"], ["unpublished", "Неопубликованная (фондовая)"]] as [ReferenceKind, string][]).map(([k, label]) => (
          <button key={k} type="button" onClick={() => set({ kind: k })}
            className={`py-2.5 px-4 text-xs font-mono transition-colors border-r last:border-r-0 border-border ${form.kind === k ? "bg-geo-amber/10 text-geo-amber border-b-2 border-b-geo-amber" : "text-muted-foreground hover:bg-muted/30"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Authors */}
      <div className="space-y-1">
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Авторы
          <span className="ml-2 normal-case text-muted-foreground/40">Фамилия И.О., Фамилия И.О.</span>
        </label>
        <input type="text" value={form.authors} onChange={(e) => set({ authors: e.target.value })}
          placeholder="Аристов В.В., Безирганов Б.Г., Шевырев И.А."
          className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-geo-amber transition-colors" />
      </div>

      {/* Title */}
      <div className="space-y-1">
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Наименование работы</label>
        <textarea value={form.title} onChange={(e) => set({ title: e.target.value })}
          placeholder={form.kind === "published"
            ? "О проблеме первоисточников золота в золоторудных месторождениях..."
            : "Отчет о результатах геологического изучения недр..."}
          rows={3}
          className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-geo-amber transition-colors resize-none" />
      </div>

      {form.kind === "published" ? (
        /* Опубликованная: место, издание, год, страницы */
        <div className="space-y-1">
          <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Выходные данные
            <span className="ml-2 normal-case text-muted-foreground/40">место издания, издательство, год, страницы</span>
          </label>
          <input type="text" value={form.publishInfo ?? ""} onChange={(e) => set({ publishInfo: e.target.value })}
            placeholder='М., «Недра», 1975, 264 с.  —  или—  «Известия ВУЗов. Геол. и разв.», 1972, № 12, с. 61–67'
            className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-geo-amber transition-colors" />
        </div>
      ) : (
        /* Неопубликованная: организация, год, фонд, инв. номер */
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1 col-span-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Организация-исполнитель и город</label>
            <input type="text" value={form.organization ?? ""} onChange={(e) => set({ organization: e.target.value })}
              placeholder="Южно-Воронежская ГРП. Воронеж"
              className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-geo-amber transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Год</label>
            <input type="text" value={form.year ?? ""} onChange={(e) => set({ year: e.target.value })}
              placeholder="1979"
              className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-geo-amber transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Инвентарный номер</label>
            <input type="text" value={form.inventoryNumber ?? ""} onChange={(e) => set({ inventoryNumber: e.target.value })}
              placeholder="№ 34015"
              className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-geo-amber transition-colors" />
          </div>
          <div className="space-y-1 col-span-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Фонд геологической информации
              <span className="ml-2 normal-case text-muted-foreground/40">необязательно</span>
            </label>
            <input type="text" value={form.fund ?? ""} onChange={(e) => set({ fund: e.target.value })}
              placeholder="ТФГИ ЦФО"
              className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-geo-amber transition-colors" />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive text-xs font-mono border border-destructive/30 px-3 py-2">
          <Icon name="AlertCircle" size={12} /> {error}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button onClick={save} className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">
          Сохранить
        </button>
        <button onClick={onCancel} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">
          Отмена
        </button>
      </div>
    </div>
  );
}

// ─── ReferenceRow ─────────────────────────────────────────────────────────────

function ReferenceRow({ entry, number, onEdit, onDelete }: {
  entry: ReferenceEntry;
  number: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors border-b border-border/40 last:border-b-0">
      <span className="font-mono text-xs text-geo-amber flex-shrink-0 w-6 text-right pt-0.5">{number}</span>
      <p className="flex-1 text-sm text-foreground/90 leading-relaxed">
        {entry.authors && <span className="font-medium">{entry.authors}. </span>}
        {entry.title}
        {entry.kind === "published" && entry.publishInfo && <span className="text-muted-foreground">. {entry.publishInfo}</span>}
        {entry.kind === "unpublished" && (
          <span className="text-muted-foreground">
            {entry.organization && `. ${entry.organization}`}
            {entry.year && `, ${entry.year}`}
            {entry.fund && `. ${entry.fund}`}
            {entry.inventoryNumber && `, № ${entry.inventoryNumber}`}
          </span>
        )}
      </p>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-0.5">
        <button onClick={onEdit} className="p-1.5 text-muted-foreground hover:text-geo-amber transition-colors">
          <Icon name="Pencil" size={13} />
        </button>
        <button onClick={onDelete} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
          <Icon name="Trash2" size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── ReferencesSection ────────────────────────────────────────────────────────

export function ReferencesSection({ reportId, secrecy, responsible, contractor, contractors }: {
  reportId: string;
  secrecy: Secrecy;
  responsible: string;
  contractor?: Contractor;
  contractors?: Contractor[];
}) {
  const storageKey = `geo_references_${reportId}`;

  const load = (): ReferenceEntry[] => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  };
  const persist = (items: ReferenceEntry[]) => localStorage.setItem(storageKey, JSON.stringify(items));

  const [items, setItems] = useState<ReferenceEntry[]>(load);
  const [modal, setModal] = useState<null | "add" | ReferenceEntry>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [defaultKind, setDefaultKind] = useState<ReferenceKind>("published");
  const [search, setSearch] = useState("");

  const update = (next: ReferenceEntry[]) => { setItems(next); persist(next); };

  const openAdd = (kind: ReferenceKind) => { setDefaultKind(kind); setModal("add"); };
  const openEdit = (entry: ReferenceEntry) => setModal(entry);

  const saveEntry = (data: Omit<ReferenceEntry, "id">) => {
    if (modal === "add") {
      update([...items, { id: newId(), ...data }]);
    } else {
      update(items.map((i) => i.id === (modal as ReferenceEntry).id ? { ...(modal as ReferenceEntry), ...data } : i));
    }
    setModal(null);
  };

  const removeEntry = (id: string) => { update(items.filter((i) => i.id !== id)); setDeleteId(null); };

  // Sorted lists per kind
  const published = useMemo(() =>
    items.filter((i) => i.kind === "published").sort((a, b) => sortKey(a).localeCompare(sortKey(b), "ru")),
    [items]);

  const unpublished = useMemo(() =>
    items.filter((i) => i.kind === "unpublished").sort((a, b) => sortKey(a).localeCompare(sortKey(b), "ru")),
    [items]);

  // Сквозная нумерация: сначала опубликованные, затем фондовые
  const numberMap = useMemo(() => {
    const map = new Map<string, number>();
    let n = 1;
    for (const e of published) map.set(e.id, n++);
    for (const e of unpublished) map.set(e.id, n++);
    return map;
  }, [published, unpublished]);

  const filterEntries = (list: ReferenceEntry[]) =>
    search.trim()
      ? list.filter((e) => formatRef(e).toLowerCase().includes(search.toLowerCase()))
      : list;

  const filteredPub = filterEntries(published);
  const filteredUnpub = filterEntries(unpublished);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="BookMarked" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Список использованных источников</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 13 · ГОСТ 7.1 · сквозная нумерация</p>
      </div>

      <SectionMeta
        reportId={reportId}
        tabId="references"
        secrecy={secrecy}
        responsible={responsible}
        contractor={contractor}
        contractors={contractors}
      />

      <div className="border border-geo-amber/30 bg-geo-amber/5 px-4 py-3 flex items-start gap-3">
        <Icon name="Info" size={14} className="text-geo-amber flex-shrink-0 mt-0.5" />
        <span className="font-mono text-xs text-geo-amber/80 leading-relaxed">
          Сортировка: алфавитная по автору внутри каждого раздела · Сквозная нумерация: сначала опубликованные, затем фондовые
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {items.length > 0 && (
          <div className="flex-1 min-w-48 relative">
            <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по автору или названию..."
              className="w-full bg-muted border border-border pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-geo-amber transition-colors" />
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <span className="font-mono text-xs text-muted-foreground">
            Всего: <span className="text-geo-amber">{items.length}</span>
          </span>
          <button onClick={() => openAdd("published")}
            className="flex items-center gap-1.5 bg-geo-amber text-primary-foreground px-3 py-2 text-xs font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">
            <Icon name="Plus" size={13} /> Опубликованная
          </button>
          <button onClick={() => openAdd("unpublished")}
            className="flex items-center gap-1.5 border border-border text-muted-foreground px-3 py-2 text-xs font-display tracking-wider uppercase hover:border-geo-amber hover:text-geo-amber transition-colors">
            <Icon name="Plus" size={13} /> Фондовая
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center">
          <Icon name="BookMarked" size={28} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-mono mb-4">Нет источников — добавьте первую запись</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => openAdd("published")}
              className="flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-mono text-muted-foreground hover:border-geo-amber hover:text-geo-amber transition-colors">
              <Icon name="BookOpen" size={12} /> Опубликованная работа
            </button>
            <button onClick={() => openAdd("unpublished")}
              className="flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-mono text-muted-foreground hover:border-geo-amber hover:text-geo-amber transition-colors">
              <Icon name="Archive" size={12} /> Фондовая работа
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Опубликованные */}
          {(filteredPub.length > 0 || published.length > 0) && (
            <div className="border border-border overflow-hidden">
              <div className="bg-muted/30 border-b border-border px-4 py-2 flex items-center gap-2">
                <Icon name="BookOpen" size={13} className="text-geo-amber/70" />
                <span className="font-display text-xs tracking-widest uppercase text-muted-foreground">Опубликованная</span>
                <span className="ml-auto font-mono text-xs text-geo-amber">{published.length}</span>
              </div>
              {filteredPub.length === 0 ? (
                <p className="text-xs text-muted-foreground/40 font-mono text-center py-6">Нет результатов по запросу «{search}»</p>
              ) : (
                filteredPub.map((entry) => (
                  <ReferenceRow key={entry.id} entry={entry} number={numberMap.get(entry.id)!}
                    onEdit={() => openEdit(entry)} onDelete={() => setDeleteId(entry.id)} />
                ))
              )}
            </div>
          )}

          {/* Фондовые */}
          {(filteredUnpub.length > 0 || unpublished.length > 0) && (
            <div className="border border-border overflow-hidden">
              <div className="bg-muted/30 border-b border-border px-4 py-2 flex items-center gap-2">
                <Icon name="Archive" size={13} className="text-geo-amber/70" />
                <span className="font-display text-xs tracking-widest uppercase text-muted-foreground">Неопубликованная (фондовая)</span>
                <span className="ml-auto font-mono text-xs text-geo-amber">{unpublished.length}</span>
              </div>
              {filteredUnpub.length === 0 ? (
                <p className="text-xs text-muted-foreground/40 font-mono text-center py-6">Нет результатов по запросу «{search}»</p>
              ) : (
                filteredUnpub.map((entry) => (
                  <ReferenceRow key={entry.id} entry={entry} number={numberMap.get(entry.id)!}
                    onEdit={() => openEdit(entry)} onDelete={() => setDeleteId(entry.id)} />
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm tracking-wider uppercase">
                {modal === "add" ? "Добавить источник" : "Редактировать источник"}
              </h4>
              <button onClick={() => setModal(null)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={16} />
              </button>
            </div>
            <ReferenceForm
              initial={modal === "add" ? { ...EMPTY_FORM, kind: defaultKind } : { ...(modal as ReferenceEntry) }}
              onSave={saveEntry}
              onCancel={() => setModal(null)}
            />
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6 space-y-4">
            <h4 className="font-display text-sm tracking-wider uppercase">Удалить источник?</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              «<span className="text-foreground font-medium line-clamp-2">{items.find((i) => i.id === deleteId)?.title}</span>» будет удалён из списка.
            </p>
            <div className="flex gap-3">
              <button onClick={() => removeEntry(deleteId)} className="flex-1 bg-destructive text-destructive-foreground py-2 text-sm font-display tracking-wider uppercase hover:opacity-90 transition-opacity">Удалить</button>
              <button onClick={() => setDeleteId(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}