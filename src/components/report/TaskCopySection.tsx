import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { TaskFile } from "./reportTypes";
import { UPLOAD_URL } from "./reportTypes";

export function TaskCopySection({ reportId }: { reportId: string }) {
  const storageKey = `geo_task_file_${reportId}`;
  const [file, setFile] = useState<TaskFile | null>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "null"); } catch { return null; }
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const persist = (f: TaskFile | null) => {
    setFile(f);
    if (f) localStorage.setItem(storageKey, JSON.stringify(f));
    else localStorage.removeItem(storageKey);
  };

  const upload = async (f: File) => {
    if (!f.type.includes("pdf") && !f.name.toLowerCase().endsWith(".pdf")) {
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
        body: JSON.stringify({ file: b64, filename: f.name, contentType: "application/pdf", folder: "geo-tasks" }),
      });
      const data = await res.json();
      if (data.url) {
        persist({ url: data.url, filename: f.name, uploadedAt: new Date().toISOString() });
      } else {
        setError("Ошибка загрузки файла");
      }
      setUploading(false);
    };
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) upload(f);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="Copy" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Копия геологического задания</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 5</p>
      </div>

      {!file ? (
        <label onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed px-8 py-16 cursor-pointer transition-colors ${dragOver ? "border-geo-amber bg-geo-amber/5" : "border-border hover:border-geo-amber/50 hover:bg-muted/30"}`}>
          <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
          {uploading ? (
            <>
              <Icon name="Loader" size={32} className="text-geo-amber animate-spin" />
              <p className="font-mono text-sm text-muted-foreground">Загрузка файла...</p>
            </>
          ) : (
            <>
              <Icon name="FileUp" size={32} className="text-muted-foreground/40" />
              <div className="text-center">
                <p className="text-sm text-foreground font-medium">Перетащите PDF или нажмите для выбора</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">Только файлы .pdf</p>
              </div>
            </>
          )}
        </label>
      ) : (
        <div className="border border-border bg-card p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-14 bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <Icon name="FileText" size={20} className="text-destructive/60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file.filename}</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                Загружен {new Date(file.uploadedAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
              <a href={file.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-mono text-geo-amber hover:text-amber-400 transition-colors mt-2">
                <Icon name="ExternalLink" size={12} /> Открыть PDF
              </a>
            </div>
            <button onClick={() => persist(null)} className="p-2 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0" title="Удалить файл">
              <Icon name="Trash2" size={15} />
            </button>
          </div>
          <div className="border-t border-border/50 pt-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
              <Icon name="RefreshCw" size={13} className="text-muted-foreground group-hover:text-geo-amber transition-colors" />
              <span className="text-xs font-mono text-muted-foreground group-hover:text-geo-amber transition-colors">
                {uploading ? "Загрузка..." : "Заменить файл"}
              </span>
            </label>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive text-xs font-mono border border-destructive/30 px-4 py-2">
          <Icon name="AlertCircle" size={13} />
          {error}
        </div>
      )}

      <div className="border border-border overflow-hidden">
        <div className="bg-muted/50 border-b border-border px-4 py-2">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Атрибуты</span>
        </div>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-border/50">
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-widest w-48">Файл</td>
              <td className="px-4 py-3 text-foreground">{file?.filename || "—"}</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-widest">Дата загрузки</td>
              <td className="px-4 py-3 text-foreground">{file ? new Date(file.uploadedAt).toLocaleDateString("ru-RU") : "—"}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-widest">URL</td>
              <td className="px-4 py-3">
                {file ? (
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-geo-amber hover:underline truncate block max-w-xs">{file.url}</a>
                ) : "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
