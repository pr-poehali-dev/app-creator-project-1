import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { TaskFile } from "./reportTypes";
import { UPLOAD_URL } from "./reportTypes";
import { SectionMeta } from "./SectionMeta";
import { usePdfPreview } from "./PdfPreviewModal";
import type { Secrecy, Contractor } from "@/types/geo";

// Нормализуем хранилище: поддержка старого формата (один объект) и нового (массив)
function loadFiles(key: string): TaskFile[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "null");
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return [raw]; // старый формат — одиночный объект
  } catch {
    return [];
  }
}

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.gif,.tif,.tiff,application/pdf,image/*";

function isImage(filename: string, contentType?: string): boolean {
  if (contentType?.startsWith("image/")) return true;
  return /\.(png|jpe?g|webp|gif|tiff?)$/i.test(filename);
}

function detectContentType(f: File): string {
  if (f.type) return f.type;
  if (f.name.toLowerCase().endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}

export function TaskCopySection({ reportId, secrecy, responsible, contractor, contractors }: {
  reportId: string;
  secrecy: Secrecy;
  responsible: string;
  contractor?: Contractor;
  contractors?: Contractor[];
}) {
  const storageKey = `geo_task_file_${reportId}`;
  const [files, setFiles] = useState<TaskFile[]>(() => loadFiles(storageKey));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const { openPreview, modal: pdfModal } = usePdfPreview();

  const persist = (list: TaskFile[]) => {
    setFiles(list);
    if (list.length) localStorage.setItem(storageKey, JSON.stringify(list));
    else localStorage.removeItem(storageKey);
  };

  const uploadOne = (f: File) => new Promise<TaskFile | null>((resolve) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = (reader.result as string).split(",")[1];
      const contentType = detectContentType(f);
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: b64, filename: f.name, contentType, folder: "geo-tasks" }),
      });
      const data = await res.json();
      if (data.url) {
        resolve({ url: data.url, filename: f.name, uploadedAt: new Date().toISOString() });
      } else {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(f);
  });

  const upload = async (fileList: FileList | File[]) => {
    const arr = Array.from(fileList);
    if (!arr.length) return;
    setUploading(true);
    setError(null);
    const uploaded: TaskFile[] = [];
    for (const f of arr) {
      const result = await uploadOne(f);
      if (result) uploaded.push(result);
      else setError(`Ошибка загрузки файла: ${f.name}`);
    }
    if (uploaded.length) persist([...files, ...uploaded]);
    setUploading(false);
  };

  const removeFile = (idx: number) => {
    persist(files.filter((_, i) => i !== idx));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {pdfModal}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="Copy" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Копия геологического / технического задания</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 5</p>
      </div>

      <SectionMeta
        reportId={reportId}
        tabId="task_copy"
        secrecy={secrecy}
        responsible={responsible}
        contractor={contractor}
        contractors={contractors}
      />

      {/* Список загруженных файлов */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => {
            const img = isImage(file.filename);
            return (
              <div key={idx} className="border border-border bg-card p-4 flex items-start gap-4">
                {img ? (
                  <button onClick={() => openPreview(file.url, file.filename)} className="flex-shrink-0 w-12 h-14 bg-muted/30 border border-border overflow-hidden">
                    <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
                  </button>
                ) : (
                  <div className="flex-shrink-0 w-12 h-14 bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                    <Icon name="FileText" size={20} className="text-destructive/60" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.filename}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    Загружен {new Date(file.uploadedAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                  <button onClick={() => openPreview(file.url, file.filename)} className="inline-flex items-center gap-1.5 text-xs font-mono text-geo-amber hover:text-amber-400 transition-colors mt-2">
                    <Icon name="Eye" size={12} /> Просмотр
                  </button>
                </div>
                <button onClick={() => removeFile(idx)} className="p-2 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0" title="Удалить файл">
                  <Icon name="Trash2" size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Зона загрузки (всегда доступна — можно добавлять ещё) */}
      <label onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed px-8 py-12 cursor-pointer transition-colors ${dragOver ? "border-geo-amber bg-geo-amber/5" : "border-border hover:border-geo-amber/50 hover:bg-muted/30"}`}>
        <input type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => { if (e.target.files) upload(e.target.files); e.target.value = ""; }} />
        {uploading ? (
          <>
            <Icon name="Loader" size={32} className="text-geo-amber animate-spin" />
            <p className="font-mono text-sm text-muted-foreground">Загрузка файлов...</p>
          </>
        ) : (
          <>
            <Icon name="FileUp" size={32} className="text-muted-foreground/40" />
            <div className="text-center">
              <p className="text-sm text-foreground font-medium">
                {files.length > 0 ? "Добавить ещё файлы" : "Перетащите файлы или нажмите для выбора"}
              </p>
              <p className="text-xs text-muted-foreground font-mono mt-1">PDF, PNG, JPG, WEBP, TIFF · можно несколько</p>
            </div>
          </>
        )}
      </label>

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
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-widest w-48">Кол-во файлов</td>
              <td className="px-4 py-3 text-foreground">{files.length || "—"}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground uppercase tracking-widest align-top">Файлы</td>
              <td className="px-4 py-3">
                {files.length ? (
                  <div className="space-y-1">
                    {files.map((file, idx) => (
                      <button key={idx} onClick={() => openPreview(file.url, file.filename)} className="text-xs font-mono text-geo-amber hover:underline truncate block max-w-md text-left">
                        {file.filename}
                      </button>
                    ))}
                  </div>
                ) : "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
