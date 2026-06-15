import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { TextAppendix } from "./reportTypes";
import { UPLOAD_URL } from "./reportTypes";
import { SectionMeta } from "./SectionMeta";
import type { Secrecy, Contractor } from "@/types/geo";

export function TextAppendicesSection({ reportId, secrecy, responsible, contractor, contractors }: {
  reportId: string;
  secrecy: Secrecy;
  responsible: string;
  contractor?: Contractor;
  contractors?: Contractor[];
}) {
  const storageKey = `geo_text_appendices_${reportId}`;

  const load = (): TextAppendix[] => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  };
  const persist = (items: TextAppendix[]) => localStorage.setItem(storageKey, JSON.stringify(items));

  const [items, setItems] = useState<TextAppendix[]>(load);
  const [modal, setModal] = useState<null | "add" | TextAppendix>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState({ title: "", textPage: "", fileUrl: "", filename: "", uploadedAt: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nextNumber = items.length > 0 ? Math.max(...items.map((i) => i.number)) + 1 : 1;

  const openAdd = () => {
    setForm({ title: "", textPage: "", fileUrl: "", filename: "", uploadedAt: "" });
    setError(null);
    setModal("add");
  };

  const openEdit = (item: TextAppendix) => {
    setForm({ title: item.title, textPage: item.textPage, fileUrl: item.fileUrl || "", filename: item.filename || "", uploadedAt: item.uploadedAt || "" });
    setError(null);
    setModal(item);
  };

  const uploadFile = async (file: File) => {
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Допускается только файл PDF");
      return;
    }
    setUploading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = (reader.result as string).split(",")[1];
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: b64, filename: file.name, contentType: "application/pdf", folder: "geo-text-appendices" }),
      });
      const data = await res.json();
      if (data.url) {
        setForm((f) => ({ ...f, fileUrl: data.url, filename: file.name, uploadedAt: new Date().toISOString() }));
      } else {
        setError("Ошибка загрузки файла");
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) uploadFile(f);
  };

  const saveItem = () => {
    if (!form.title.trim()) { setError("Укажите наименование приложения"); return; }
    let next: TextAppendix[];
    if (modal === "add") {
      next = [...items, {
        id: Date.now().toString(), number: nextNumber,
        title: form.title.trim(), textPage: form.textPage,
        ...(form.fileUrl ? { fileUrl: form.fileUrl, filename: form.filename, uploadedAt: form.uploadedAt } : {}),
      }];
    } else {
      next = items.map((item) =>
        item.id === (modal as TextAppendix).id
          ? { ...item, title: form.title.trim(), textPage: form.textPage,
              ...(form.fileUrl
                ? { fileUrl: form.fileUrl, filename: form.filename, uploadedAt: form.uploadedAt }
                : { fileUrl: undefined, filename: undefined, uploadedAt: undefined }) }
          : item
      );
    }
    persist(next);
    setItems(next);
    setModal(null);
  };

  const removeItem = (id: string) => {
    const renumbered = items.filter((i) => i.id !== id).map((item, idx) => ({ ...item, number: idx + 1 }));
    persist(renumbered);
    setItems(renumbered);
    setDeleteId(null);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="FileStack" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Список текстовых приложений</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 9 · при наличии</p>
      </div>

      <SectionMeta
        reportId={reportId}
        tabId="text_appendices"
        secrecy={secrecy}
        responsible={responsible}
        contractor={contractor}
        contractors={contractors}
      />

      <div className="border border-geo-amber/30 bg-geo-amber/5 px-4 py-3 flex items-center gap-3">
        <Icon name="Info" size={14} className="text-geo-amber" />
        <span className="font-mono text-xs text-geo-amber/80">Нумерация автоматическая · файл PDF необязателен · страница будет связана с текстом позже</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Приложений: <span className="text-geo-amber">{String(items.length).padStart(2, "0")}</span>
        </span>
        <button onClick={openAdd} className="flex items-center gap-2 bg-geo-amber text-primary-foreground px-4 py-2 text-xs font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">
          <Icon name="Plus" size={14} /> Добавить приложение
        </button>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center">
          <Icon name="FileStack" size={28} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-mono">Нет приложений — нажмите «Добавить приложение»</p>
        </div>
      ) : (
        <div className="border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest w-14">№</th>
                <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest">Наименование</th>
                <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest w-20">Файл</th>
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
                    {item.fileUrl ? (
                      <a href={item.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-mono border text-destructive/70 border-destructive/30 bg-destructive/5 hover:opacity-80 transition-opacity">
                        <Icon name="FileText" size={12} /> PDF
                      </a>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.textPage
                      ? <span className="font-mono text-xs text-foreground">{item.textPage}</span>
                      : <span className="font-mono text-xs text-muted-foreground/30 italic">—</span>}
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

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm tracking-wider uppercase">
                {modal === "add" ? `Приложение № ${nextNumber}` : `Приложение № ${(modal as TextAppendix).number}`}
              </h4>
              <button onClick={() => setModal(null)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={16} />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Наименование приложения</label>
              <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Таблица запасов полезного ископаемого..."
                className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors"
                autoFocus />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Файл PDF
                <span className="ml-2 normal-case text-muted-foreground/40 font-mono">необязательно</span>
              </label>
              {!form.fileUrl ? (
                <label
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`flex items-center justify-center gap-3 border-2 border-dashed px-6 py-6 cursor-pointer transition-colors ${dragOver ? "border-geo-amber bg-geo-amber/5" : "border-border hover:border-geo-amber/50 hover:bg-muted/30"}`}
                >
                  <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
                  {uploading ? (
                    <><Icon name="Loader" size={20} className="text-geo-amber animate-spin" /><span className="font-mono text-sm text-muted-foreground">Загрузка...</span></>
                  ) : (
                    <><Icon name="FileUp" size={20} className="text-muted-foreground/30 flex-shrink-0" />
                    <div><p className="text-sm text-foreground">Перетащите или нажмите для выбора</p><p className="text-xs text-muted-foreground/50 font-mono mt-0.5">Только .pdf</p></div></>
                  )}
                </label>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 border border-destructive/30 bg-destructive/5 text-destructive/70">
                  <Icon name="FileText" size={18} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{form.filename}</p>
                    <p className="text-xs font-mono text-muted-foreground/50 mt-0.5">загружен {form.uploadedAt ? new Date(form.uploadedAt).toLocaleDateString("ru-RU") : ""}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <label className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-geo-amber cursor-pointer transition-colors">
                      <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
                      <Icon name="RefreshCw" size={12} /> Заменить
                    </label>
                    <button onClick={() => setForm((f) => ({ ...f, fileUrl: "", filename: "", uploadedAt: "" }))} className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-destructive transition-colors">
                      <Icon name="X" size={12} /> Убрать
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Страница в текстовой части
                <span className="ml-2 normal-case text-muted-foreground/40 font-mono">необязательно</span>
              </label>
              <input type="text" value={form.textPage} onChange={(e) => setForm((f) => ({ ...f, textPage: e.target.value }))}
                placeholder="—"
                className="w-32 bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-geo-amber transition-colors" />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs font-mono border border-destructive/30 px-3 py-2">
                <Icon name="AlertCircle" size={12} /> {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={saveItem} disabled={uploading} className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-amber-400 disabled:opacity-40 transition-colors">
                Сохранить
              </button>
              <button onClick={() => setModal(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6 space-y-4">
            <h4 className="font-display text-sm tracking-wider uppercase">Удалить приложение?</h4>
            <p className="text-sm text-muted-foreground">Запись будет удалена, нумерация пересчитается автоматически.</p>
            <div className="flex gap-3">
              <button onClick={() => removeItem(deleteId)} className="flex-1 bg-destructive text-destructive-foreground py-2 text-sm font-display tracking-wider uppercase hover:opacity-90 transition-opacity">Удалить</button>
              <button onClick={() => setDeleteId(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}