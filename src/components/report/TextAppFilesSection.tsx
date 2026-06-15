import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { TextAppendix } from "./reportTypes";
import { UPLOAD_URL } from "./reportTypes";

function newId() { return Date.now().toString() + Math.random().toString(36).slice(2, 6); }

function loadApps(reportId: string): TextAppendix[] {
  try { return JSON.parse(localStorage.getItem(`geo_text_appendices_${reportId}`) || "[]"); } catch { return []; }
}

function saveApps(reportId: string, items: TextAppendix[]) {
  localStorage.setItem(`geo_text_appendices_${reportId}`, JSON.stringify(items));
}

export function TextAppFilesSection({ reportId }: { reportId: string }) {
  const [apps, setApps] = useState<TextAppendix[]>(() => loadApps(reportId));
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal for adding new appendix directly here
  const [addModal, setAddModal] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const persist = (next: TextAppendix[]) => {
    const renumbered = next.map((a, idx) => ({ ...a, number: idx + 1 }));
    setApps(renumbered);
    saveApps(reportId, renumbered);
  };

  const upload = async (raw: File, appId: string) => {
    if (!raw.type.includes("pdf") && !raw.name.toLowerCase().endsWith(".pdf")) {
      setError("Допускается только файл PDF");
      return;
    }
    setUploading(appId);
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = (reader.result as string).split(",")[1];
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: b64, filename: raw.name, contentType: "application/pdf", folder: `geo-text-app-files-${reportId}` }),
      });
      const data = await res.json();
      if (data.url) {
        const next = apps.map((a) =>
          a.id === appId ? { ...a, fileUrl: data.url, filename: raw.name, uploadedAt: new Date().toISOString() } : a
        );
        persist(next);
      } else {
        setError("Ошибка загрузки файла");
      }
      setUploading(null);
    };
    reader.readAsDataURL(raw);
  };

  const removeFile = (appId: string) => {
    persist(apps.map((a) => a.id === appId ? { ...a, fileUrl: undefined, filename: undefined, uploadedAt: undefined } : a));
  };

  const updateTitle = (appId: string, title: string) => {
    persist(apps.map((a) => a.id === appId ? { ...a, title } : a));
  };

  const addNew = () => {
    if (!addTitle.trim()) { setAddError("Укажите наименование"); return; }
    const newApp: TextAppendix = { id: newId(), number: apps.length + 1, title: addTitle.trim(), textPage: "" };
    persist([...apps, newApp]);
    setAddTitle("");
    setAddError(null);
    setAddModal(false);
  };

  const removeApp = (id: string) => {
    persist(apps.filter((a) => a.id !== id));
    setDeleteId(null);
  };

  // GOST label: single → "ПРИЛОЖЕНИЕ", multiple → "ПРИЛОЖЕНИЕ 1", "ПРИЛОЖЕНИЕ 2"...
  const gostLabel = (n: number) => apps.length === 1 ? "ПРИЛОЖЕНИЕ" : `ПРИЛОЖЕНИЕ ${n}`;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="Files" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Текстовые приложения</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 20</p>
      </div>

      <div className="border border-geo-amber/30 bg-geo-amber/5 px-4 py-3 flex items-center gap-3">
        <Icon name="Info" size={14} className="text-geo-amber" />
        <span className="font-mono text-xs text-geo-amber/80">
          Список приложений синхронизирован с разделом «Список текстовых приложений» · каждое приложение печатается с новой страницы
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Приложений: <span className="text-geo-amber">{String(apps.length).padStart(2, "0")}</span>
        </span>
        <button onClick={() => { setAddTitle(""); setAddError(null); setAddModal(true); }}
          className="flex items-center gap-2 bg-geo-amber text-primary-foreground px-4 py-2 text-xs font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">
          <Icon name="Plus" size={14} /> Добавить приложение
        </button>
      </div>

      {/* Empty state */}
      {apps.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center space-y-3">
          <Icon name="Files" size={28} className="text-muted-foreground/20 mx-auto" />
          <p className="text-sm text-muted-foreground font-mono">Нет приложений</p>
          <p className="text-xs text-muted-foreground/50 font-mono max-w-xs mx-auto leading-relaxed">
            Добавьте приложения здесь или в разделе «Список текстовых приложений» — они синхронизируются автоматически
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <div key={app.id} className="border border-border bg-card overflow-hidden">
              {/* GOST header strip */}
              <div className="bg-muted/60 border-b border-border px-5 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-geo-amber tracking-widest">{gostLabel(app.number)}</span>
                  {apps.length > 1 && (
                    <span className="font-mono text-xs text-muted-foreground/40">· нумерация арабскими цифрами · точку не ставят</span>
                  )}
                </div>
                <button onClick={() => setDeleteId(app.id)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                  <Icon name="Trash2" size={14} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Наименование приложения</label>
                  <input
                    type="text"
                    value={app.title}
                    onChange={(e) => updateTitle(app.id, e.target.value)}
                    placeholder="Таблица запасов полезного ископаемого..."
                    className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-geo-amber transition-colors"
                  />
                </div>

                {/* GOST note */}
                <div className="flex items-start gap-2 bg-muted/30 px-3 py-2.5">
                  <Icon name="AlignCenter" size={13} className="text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground/60 font-mono leading-relaxed">
                    По ГОСТ наименование располагается вверху симметрично относительно текста · пояснительный текст помещается под приложением
                  </p>
                </div>

                {/* PDF file */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                    Файл PDF
                    <span className="ml-2 normal-case text-muted-foreground/40 font-mono">необязательно</span>
                  </label>

                  {!app.fileUrl ? (
                    <label
                      onDragOver={(e) => { e.preventDefault(); setDragOver(app.id); }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={(e) => { e.preventDefault(); setDragOver(null); const f = e.dataTransfer.files[0]; if (f) upload(f, app.id); }}
                      className={`flex items-center justify-center gap-3 border-2 border-dashed px-6 py-5 cursor-pointer transition-colors ${dragOver === app.id ? "border-geo-amber bg-geo-amber/5" : "border-border hover:border-geo-amber/50 hover:bg-muted/20"}`}
                    >
                      <input type="file" accept=".pdf,application/pdf" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, app.id); }} />
                      {uploading === app.id ? (
                        <><Icon name="Loader" size={18} className="text-geo-amber animate-spin" />
                          <span className="font-mono text-sm text-muted-foreground">Загрузка...</span></>
                      ) : (
                        <><Icon name="FileUp" size={18} className="text-muted-foreground/30 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-foreground">Перетащите или нажмите для выбора</p>
                            <p className="text-xs text-muted-foreground/50 font-mono mt-0.5">Только .pdf</p>
                          </div></>
                      )}
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 border border-destructive/30 bg-destructive/5">
                      <Icon name="FileText" size={16} className="text-destructive/60 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{app.filename}</p>
                        <p className="text-xs font-mono text-muted-foreground/50 mt-0.5">
                          {app.uploadedAt ? new Date(app.uploadedAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" }) : ""}
                        </p>
                      </div>
                      <div className="flex gap-3 flex-shrink-0">
                        <a href={app.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-mono text-geo-amber hover:text-amber-400 transition-colors">
                          <Icon name="ExternalLink" size={11} /> Открыть
                        </a>
                        <label className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-geo-amber cursor-pointer transition-colors">
                          <input type="file" accept=".pdf,application/pdf" className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, app.id); }} />
                          <Icon name="RefreshCw" size={11} />
                          {uploading === app.id ? "Загрузка..." : "Заменить"}
                        </label>
                        <button onClick={() => removeFile(app.id)}
                          className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-destructive transition-colors">
                          <Icon name="X" size={11} /> Убрать
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* textPage reference */}
                {app.textPage && (
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/50">
                    <Icon name="Link" size={11} />
                    Ссылка в тексте: стр. {app.textPage}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive text-xs font-mono border border-destructive/30 px-4 py-2">
          <Icon name="AlertCircle" size={13} /> {error}
        </div>
      )}

      {/* Add modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm tracking-wider uppercase">
                {apps.length === 0 ? "ПРИЛОЖЕНИЕ" : `ПРИЛОЖЕНИЕ ${apps.length + 1}`}
              </h4>
              <button onClick={() => setAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Наименование приложения</label>
              <input
                type="text"
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNew()}
                placeholder="Таблица запасов полезного ископаемого..."
                autoFocus
                className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors"
              />
            </div>
            {addError && (
              <div className="flex items-center gap-2 text-destructive text-xs font-mono border border-destructive/30 px-3 py-2">
                <Icon name="AlertCircle" size={12} /> {addError}
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button onClick={addNew}
                className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">
                Добавить
              </button>
              <button onClick={() => setAddModal(false)}
                className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">
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
            <h4 className="font-display text-sm tracking-wider uppercase">Удалить приложение?</h4>
            <p className="text-sm text-muted-foreground">Запись будет удалена, нумерация пересчитается автоматически.</p>
            <div className="flex gap-3">
              <button onClick={() => removeApp(deleteId)}
                className="flex-1 bg-destructive text-destructive-foreground py-2 text-sm font-display tracking-wider uppercase hover:opacity-90 transition-opacity">
                Удалить
              </button>
              <button onClick={() => setDeleteId(null)}
                className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
