import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { TableEntry } from "./reportTypes";
import { UPLOAD_URL } from "./reportTypes";
import { SectionMeta } from "./SectionMeta";
import { usePdfPreview } from "./PdfPreviewModal";
import type { Secrecy, Contractor } from "@/types/geo";

const FILE_ICON: Record<string, string> = {
  xlsx: "FileSpreadsheet",
  pdf: "FileText",
  other: "File",
};

const FILE_COLOR: Record<string, string> = {
  xlsx: "text-green-400 border-green-400/30 bg-green-400/5",
  pdf:  "text-destructive/70 border-destructive/30 bg-destructive/5",
  other: "text-muted-foreground border-border bg-muted/20",
};

function detectFileType(name: string, mime: string): TableEntry["fileType"] {
  if (mime.includes("spreadsheet") || mime.includes("excel") || name.match(/\.(xlsx?|ods)$/i)) return "xlsx";
  if (mime.includes("pdf") || name.match(/\.pdf$/i)) return "pdf";
  return "other";
}

export function TablesSection({ reportId, secrecy, responsible, contractor, contractors }: {
  reportId: string;
  secrecy: Secrecy;
  responsible: string;
  contractor?: Contractor;
  contractors?: Contractor[];
}) {
  const storageKey = `geo_tables_${reportId}`;

  const load = (): TableEntry[] => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  };
  const persist = (items: TableEntry[]) => localStorage.setItem(storageKey, JSON.stringify(items));

  const [items, setItems] = useState<TableEntry[]>(load);
  const [modal, setModal] = useState<null | "add" | TableEntry>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState({ title: "", textPage: "", fileUrl: "", filename: "", fileType: "" as TableEntry["fileType"] | "", uploadedAt: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { openPreview, modal: pdfModal } = usePdfPreview();

  const nextNumber = items.length > 0 ? Math.max(...items.map((i) => i.number)) + 1 : 1;

  const openAdd = () => {
    setForm({ title: "", textPage: "", fileUrl: "", filename: "", fileType: "", uploadedAt: "" });
    setError(null);
    setModal("add");
  };

  const openEdit = (item: TableEntry) => {
    setForm({ title: item.title, textPage: item.textPage, fileUrl: item.fileUrl || "", filename: item.filename || "", fileType: item.fileType || "", uploadedAt: item.uploadedAt || "" });
    setError(null);
    setModal(item);
  };

  const uploadFile = async (file: File) => {
    const allowed = ["application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.oasis.opendocument.spreadsheet"];
    const extOk = /\.(pdf|xlsx?|ods)$/i.test(file.name);
    if (!allowed.includes(file.type) && !extOk) {
      setError("Допускаются файлы PDF, Excel (XLS, XLSX), ODS");
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
        body: JSON.stringify({ file: b64, filename: file.name, contentType: file.type || "application/octet-stream", folder: "geo-tables" }),
      });
      const data = await res.json();
      if (data.url) {
        setForm((f) => ({ ...f, fileUrl: data.url, filename: file.name, fileType: detectFileType(file.name, file.type), uploadedAt: new Date().toISOString() }));
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
    if (!form.title.trim()) { setError("Укажите наименование таблицы"); return; }
    let next: TableEntry[];
    if (modal === "add") {
      next = [...items, {
        id: Date.now().toString(), number: nextNumber,
        title: form.title.trim(), textPage: form.textPage,
        ...(form.fileUrl ? { fileUrl: form.fileUrl, filename: form.filename, fileType: form.fileType || "other", uploadedAt: form.uploadedAt } : {}),
      }];
    } else {
      next = items.map((item) =>
        item.id === (modal as TableEntry).id
          ? { ...item, title: form.title.trim(), textPage: form.textPage,
              ...(form.fileUrl ? { fileUrl: form.fileUrl, filename: form.filename, fileType: form.fileType || "other", uploadedAt: form.uploadedAt } : { fileUrl: undefined, filename: undefined, fileType: undefined, uploadedAt: undefined }) }
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
      {pdfModal}
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="Table" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Список таблиц</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 8 · при наличии · текстовая часть</p>
      </div>

      <SectionMeta
        reportId={reportId}
        tabId="tables"
        secrecy={secrecy}
        responsible={responsible}
        contractor={contractor}
        contractors={contractors}
      />

      <div className="border border-geo-amber/30 bg-geo-amber/5 px-4 py-3 flex items-center gap-3">
        <Icon name="Info" size={14} className="text-geo-amber" />
        <span className="font-mono text-xs text-geo-amber/80">Нумерация присваивается автоматически · файл (PDF/Excel) необязателен · страница будет связана с текстом позже</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Таблиц: <span className="text-geo-amber">{String(items.length).padStart(2, "0")}</span>
        </span>
        <button onClick={openAdd} className="flex items-center gap-2 bg-geo-amber text-primary-foreground px-4 py-2 text-xs font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">
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
                      <button onClick={() => openPreview(item.fileUrl!, item.filename || item.title)}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-mono border transition-colors hover:opacity-80 ${FILE_COLOR[item.fileType || "other"]}`}>
                        <Icon name={FILE_ICON[item.fileType || "other"]} fallback="File" size={12} />
                        {(item.fileType || "").toUpperCase() || "—"}
                      </button>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.textPage
                      ? <span className="font-mono text-xs text-foreground">{item.textPage}</span>
                      : <span className="font-mono text-xs text-muted-foreground/30 italic">—</span>
                    }
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
          <div className="bg-card border border-border w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm tracking-wider uppercase">
                {modal === "add" ? `Таблица № ${nextNumber}` : `Таблица № ${(modal as TableEntry).number}`}
              </h4>
              <button onClick={() => setModal(null)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={16} />
              </button>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Наименование таблицы</label>
              <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Сводная ведомость запасов полезного ископаемого..."
                className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors"
                autoFocus />
            </div>

            {/* File upload — optional */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Файл таблицы
                <span className="ml-2 normal-case text-muted-foreground/40 font-mono">необязательно · PDF, Excel (XLS/XLSX)</span>
              </label>

              {!form.fileUrl ? (
                <label
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`flex items-center justify-center gap-3 border-2 border-dashed px-6 py-6 cursor-pointer transition-colors ${dragOver ? "border-geo-amber bg-geo-amber/5" : "border-border hover:border-geo-amber/50 hover:bg-muted/30"}`}
                >
                  <input type="file" accept=".pdf,.xls,.xlsx,.ods,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
                  {uploading ? (
                    <>
                      <Icon name="Loader" size={20} className="text-geo-amber animate-spin flex-shrink-0" />
                      <span className="font-mono text-sm text-muted-foreground">Загрузка...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="FileUp" size={20} className="text-muted-foreground/30 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-foreground">Перетащите или нажмите для выбора</p>
                        <p className="text-xs text-muted-foreground/50 font-mono mt-0.5">PDF, XLS, XLSX, ODS</p>
                      </div>
                    </>
                  )}
                </label>
              ) : (
                <div className={`flex items-center gap-3 px-4 py-3 border ${FILE_COLOR[form.fileType || "other"]}`}>
                  <Icon name={FILE_ICON[form.fileType || "other"]} fallback="File" size={20} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{form.filename}</p>
                    <p className="text-xs font-mono text-muted-foreground/50 mt-0.5">
                      {(form.fileType || "").toUpperCase()} · загружен {form.uploadedAt ? new Date(form.uploadedAt).toLocaleDateString("ru-RU") : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <label className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-geo-amber cursor-pointer transition-colors">
                      <input type="file" accept=".pdf,.xls,.xlsx,.ods" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
                      <Icon name="RefreshCw" size={12} /> Заменить
                    </label>
                    <button onClick={() => setForm((f) => ({ ...f, fileUrl: "", filename: "", fileType: "", uploadedAt: "" }))}
                      className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-destructive transition-colors">
                      <Icon name="X" size={12} /> Убрать
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Page */}
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