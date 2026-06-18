import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { Illustration } from "./reportTypes";
import { UPLOAD_URL } from "./reportTypes";
import { SectionMeta } from "./SectionMeta";
import { usePdfPreview } from "./PdfPreviewModal";
import type { SyncedIllustration } from "./syncFromText";
import type { Secrecy, Contractor } from "@/types/geo";

// ─── IllustrationsSection ─────────────────────────────────────────────────────

interface IllustrationsSectionProps {
  reportId: string;
  secrecy: Secrecy;
  responsible: string;
  contractor?: Contractor;
  contractors?: Contractor[];
}

export function IllustrationsSection({ reportId, secrecy, responsible, contractor, contractors }: IllustrationsSectionProps) {
  const storageKey = `geo_illustrations_${reportId}`;

  const load = (): SyncedIllustration[] => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  };
  const save = (items: SyncedIllustration[]) => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  };

  const [items, setItems] = useState<SyncedIllustration[]>(load);
  const refresh = () => setItems(load());
  const [modal, setModal] = useState<null | "add" | SyncedIllustration>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Form state
  const emptyForm = { title: "", textPage: "", url: "", filename: "", uploadedAt: "" };
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { openPreview, modal: previewModal } = usePdfPreview();

  const nextNumber = items.length > 0 ? Math.max(...items.map((i) => i.number)) + 1 : 1;

  const openAdd = () => {
    setForm(emptyForm);
    setUploadError(null);
    setModal("add");
  };

  const openEdit = (item: Illustration) => {
    setForm({ title: item.title, textPage: item.textPage, url: item.url, filename: item.filename, uploadedAt: item.uploadedAt });
    setUploadError(null);
    setModal(item);
  };

  const uploadFile = async (file: File) => {
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
        body: JSON.stringify({ file: b64, filename: file.name, contentType: file.type || "image/jpeg", folder: "geo-illustrations" }),
      });
      const data = await res.json();
      if (data.url) {
        setForm((f) => ({ ...f, url: data.url, filename: file.name, uploadedAt: new Date().toISOString() }));
      } else {
        setUploadError("Ошибка загрузки изображения");
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
    if (!form.url) { setUploadError("Загрузите изображение"); return; }
    if (!form.title.trim()) { setUploadError("Укажите наименование иллюстрации"); return; }

    let next: Illustration[];
    if (modal === "add") {
      next = [...items, {
        id: Date.now().toString(),
        number: nextNumber,
        title: form.title.trim(),
        url: form.url,
        filename: form.filename,
        textPage: form.textPage,
        uploadedAt: form.uploadedAt,
      }];
    } else {
      next = items.map((item) =>
        item.id === (modal as Illustration).id
          ? { ...item, title: form.title.trim(), url: form.url, filename: form.filename, textPage: form.textPage, uploadedAt: form.uploadedAt }
          : item
      );
    }
    save(next);
    setItems(next);
    setModal(null);
  };

  const removeItem = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    // Renumber
    const renumbered = next.map((item, idx) => ({ ...item, number: idx + 1 }));
    save(renumbered);
    setItems(renumbered);
    setDeleteId(null);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {previewModal}
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="Image" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Список иллюстраций</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 7 · при наличии</p>
      </div>

      <SectionMeta
        reportId={reportId}
        tabId="illustrations"
        secrecy={secrecy}
        responsible={responsible}
        contractor={contractor}
        contractors={contractors}
      />

      <div className="border border-geo-amber/30 bg-geo-amber/5 px-4 py-3 flex items-center gap-3">
        <Icon name="Info" size={14} className="text-geo-amber" />
        <span className="font-mono text-xs text-geo-amber/80">Нумерация присваивается автоматически · страница будет связана с текстовой частью позже</span>
      </div>

      {/* Sync info */}
      {items.some((i) => (i as SyncedIllustration).source === "text") && (
        <div className="border border-geo-amber/20 bg-geo-amber/5 px-4 py-2.5 flex items-center gap-3">
          <Icon name="Link2" size={13} className="text-geo-amber/60 flex-shrink-0" />
          <span className="font-mono text-xs text-geo-amber/70 flex-1">
            Часть иллюстраций синхронизирована из текстовой части · редактируйте там, изменения отразятся здесь автоматически
          </span>
          <button onClick={refresh} className="flex items-center gap-1 text-xs font-mono text-geo-amber/60 hover:text-geo-amber transition-colors flex-shrink-0">
            <Icon name="RefreshCw" size={11} /> Обновить
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Иллюстраций: <span className="text-geo-amber">{String(items.length).padStart(2, "0")}</span>
          {items.filter((i) => (i as SyncedIllustration).source === "text").length > 0 && (
            <span className="ml-2 text-muted-foreground/40">
              ({items.filter((i) => (i as SyncedIllustration).source === "text").length} из текста)
            </span>
          )}
        </span>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-geo-amber text-primary-foreground px-4 py-2 text-xs font-display tracking-wider uppercase hover:bg-amber-400 transition-colors"
        >
          <Icon name="Plus" size={14} /> Добавить иллюстрацию
        </button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center">
          <Icon name="Image" size={28} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-mono">Нет иллюстраций — нажмите «Добавить иллюстрацию»</p>
        </div>
      ) : (
        <div className="border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest w-10">№</th>
                <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest w-20">Рисунок</th>
                <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest">Наименование</th>
                <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest w-24">Страница</th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors group">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground/60">{String(item.number).padStart(2, "0")}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openPreview(item.url, item.filename)}
                      className="group/thumb relative block"
                      title="Нажмите для просмотра"
                    >
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-14 h-10 object-cover border border-border group-hover/thumb:border-geo-amber transition-colors"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/40 transition-colors flex items-center justify-center">
                        <Icon name="ZoomIn" size={14} className="text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground font-medium leading-snug">{item.title}</p>
                    <p className="text-xs text-muted-foreground/50 font-mono mt-0.5 truncate max-w-xs">{item.filename}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <button
                        onClick={() => openPreview(item.url, item.filename)}
                        className="inline-flex items-center gap-1 text-xs font-mono text-geo-amber hover:text-amber-400 transition-colors"
                      >
                        <Icon name="ZoomIn" size={11} /> Просмотр
                      </button>
                      {(item as SyncedIllustration).source === "text" && (
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-geo-amber/60">
                          <Icon name="Link2" size={10} /> из текста
                        </span>
                      )}
                    </div>
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

      {/* Gallery view (if items) */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((item) => (
            <button key={item.id} onClick={() => openPreview(item.url, item.filename)} className="group relative block text-left w-full">
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-28 object-cover border border-border group-hover:border-geo-amber transition-colors"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Icon name="ZoomIn" size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm px-2 py-1">
                <p className="font-mono text-xs text-geo-amber">Рис. {item.number}</p>
                <p className="text-xs text-foreground/80 truncate leading-tight">{item.title}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm tracking-wider uppercase">
                {modal === "add" ? `Иллюстрация № ${nextNumber}` : `Иллюстрация № ${(modal as Illustration).number}`}
              </h4>
              <button onClick={() => setModal(null)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={16} />
              </button>
            </div>

            {/* Image upload zone */}
            {!form.url ? (
              <label
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed px-6 py-10 cursor-pointer transition-colors ${
                  dragOver ? "border-geo-amber bg-geo-amber/5" : "border-border hover:border-geo-amber/50 hover:bg-muted/30"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
                />
                {uploading ? (
                  <>
                    <Icon name="Loader" size={28} className="text-geo-amber animate-spin" />
                    <p className="font-mono text-sm text-muted-foreground">Загрузка...</p>
                  </>
                ) : (
                  <>
                    <Icon name="ImagePlus" size={28} className="text-muted-foreground/30" />
                    <div className="text-center">
                      <p className="text-sm text-foreground font-medium">Перетащите или нажмите для выбора</p>
                      <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">JPG, PNG, WEBP, GIF, SVG</p>
                    </div>
                  </>
                )}
              </label>
            ) : (
              <div className="space-y-3">
                <div className="relative group">
                  <img src={form.url} alt="preview" className="w-full max-h-48 object-contain border border-border bg-muted/20" />
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 text-xs font-mono cursor-pointer hover:border-geo-amber transition-colors">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
                      <Icon name="RefreshCw" size={12} /> Заменить
                    </label>
                    <button onClick={() => setForm((f) => ({ ...f, url: "", filename: "" }))} className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 text-xs font-mono hover:border-destructive hover:text-destructive transition-colors">
                      <Icon name="Trash2" size={12} /> Удалить
                    </button>
                  </div>
                </div>
                <p className="font-mono text-xs text-muted-foreground/50 truncate">{form.filename}</p>
              </div>
            )}

            {uploadError && (
              <div className="flex items-center gap-2 text-destructive text-xs font-mono border border-destructive/30 px-3 py-2">
                <Icon name="AlertCircle" size={12} /> {uploadError}
              </div>
            )}

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Наименование иллюстрации</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Геологический разрез по профилю I–I..."
                className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors"
              />
            </div>

            {/* Page in text */}
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

            <div className="flex gap-3 pt-1">
              <button
                onClick={saveItem}
                disabled={uploading}
                className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-amber-400 disabled:opacity-40 transition-colors"
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
            <h4 className="font-display text-sm tracking-wider uppercase">Удалить иллюстрацию?</h4>
            <p className="text-sm text-muted-foreground">Иллюстрация будет удалена, нумерация пересчитается автоматически.</p>
            <div className="flex gap-3">
              <button
                onClick={() => removeItem(deleteId)}
                className="flex-1 bg-destructive text-destructive-foreground py-2 text-sm font-display tracking-wider uppercase hover:opacity-90 transition-opacity"
              >
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