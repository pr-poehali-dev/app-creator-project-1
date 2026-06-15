import { useState } from "react";
import Icon from "@/components/ui/icon";
import { UPLOAD_URL } from "./reportTypes";
import { SectionMeta } from "./SectionMeta";
import type { Secrecy, Contractor } from "@/types/geo";

// ─── types ────────────────────────────────────────────────────────────────────

type MetroType = "conclusion" | "certificate";

interface MetroFile {
  id: string;
  url: string;
  filename: string;
  uploadedAt: string;
}

interface MetroConclusion {
  id: string;
  label: string;
  file?: MetroFile;
}

interface MetroData {
  type: MetroType;
  conclusions: MetroConclusion[];
  certificateFile?: MetroFile;
}

const DEFAULT: MetroData = { type: "conclusion", conclusions: [], certificateFile: undefined };

function newId() { return Date.now().toString() + Math.random().toString(36).slice(2, 6); }

// ─── FileUploadArea ───────────────────────────────────────────────────────────

function FileUploadArea({ file, onUpload, onRemove, folder }: {
  file?: MetroFile;
  onUpload: (f: MetroFile) => void;
  onRemove: () => void;
  folder: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (rawFile: File) => {
    if (!rawFile.type.includes("pdf") && !rawFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Допускается только PDF"); return;
    }
    setUploading(true); setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = (reader.result as string).split(",")[1];
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: b64, filename: rawFile.name, contentType: "application/pdf", folder }),
      });
      const data = await res.json();
      if (data.url) {
        onUpload({ id: newId(), url: data.url, filename: rawFile.name, uploadedAt: new Date().toISOString() });
      } else { setError("Ошибка загрузки"); }
      setUploading(false);
    };
    reader.readAsDataURL(rawFile);
  };

  if (file) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 border border-destructive/30 bg-destructive/5">
        <Icon name="FileText" size={16} className="text-destructive/60 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{file.filename}</p>
          <p className="text-xs font-mono text-muted-foreground/50 mt-0.5">
            загружен {new Date(file.uploadedAt).toLocaleDateString("ru-RU")}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <a href={file.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-geo-amber transition-colors">
            <Icon name="ExternalLink" size={11} /> Открыть
          </a>
          <label className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-geo-amber cursor-pointer transition-colors">
            <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
            <Icon name="RefreshCw" size={11} /> Заменить
          </label>
          <button onClick={onRemove} className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-destructive transition-colors">
            <Icon name="X" size={11} /> Убрать
          </button>
        </div>
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) upload(f); }}
      className={`flex items-center justify-center gap-3 border-2 border-dashed px-6 py-5 cursor-pointer transition-colors ${dragOver ? "border-geo-amber bg-geo-amber/5" : "border-border/60 hover:border-geo-amber/50 hover:bg-muted/20"}`}
    >
      <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
      {uploading
        ? <><Icon name="Loader" size={16} className="text-geo-amber animate-spin" /><span className="font-mono text-sm text-muted-foreground">Загрузка...</span></>
        : <><Icon name="FileUp" size={18} className="text-muted-foreground/30 flex-shrink-0" />
          <div><p className="text-sm text-foreground">Перетащите или нажмите для выбора</p><p className="text-xs text-muted-foreground/50 font-mono">Только .pdf</p></div></>
      }
      {error && <p className="text-xs text-destructive font-mono ml-2">{error}</p>}
    </label>
  );
}

// ─── MetrologicalSection ──────────────────────────────────────────────────────

export function MetrologicalSection({ reportId, secrecy, responsible, contractor, contractors }: {
  reportId: string;
  secrecy: Secrecy;
  responsible: string;
  contractor?: Contractor;
  contractors?: Contractor[];
}) {
  const storageKey = `geo_metrological_${reportId}`;

  const load = (): MetroData => {
    try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(storageKey) || "{}") }; } catch { return DEFAULT; }
  };
  const persist = (d: MetroData) => localStorage.setItem(storageKey, JSON.stringify(d));

  const [data, setData] = useState<MetroData>(load);

  const update = (patch: Partial<MetroData>) => {
    const next = { ...data, ...patch };
    setData(next); persist(next);
  };

  const setType = (type: MetroType) => update({ type, conclusions: type === "conclusion" ? data.conclusions : [], certificateFile: undefined });

  // Conclusions CRUD
  const addConclusion = () => update({ conclusions: [...data.conclusions, { id: newId(), label: "", file: undefined }] });

  const updateConclusion = (id: string, patch: Partial<MetroConclusion>) =>
    update({ conclusions: data.conclusions.map((c) => c.id === id ? { ...c, ...patch } : c) });

  const removeConclusion = (id: string) =>
    update({ conclusions: data.conclusions.filter((c) => c.id !== id) });

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="FlaskConical" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Метрологическая экспертиза</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 14 · при наличии</p>
      </div>

      <SectionMeta
        reportId={reportId}
        tabId="metrological"
        secrecy={secrecy}
        responsible={responsible}
        contractor={contractor}
        contractors={contractors}
      />

      {/* Type selector */}
      <div className="space-y-2">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Вид документа</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {([
            {
              type: "conclusion" as MetroType,
              icon: "ClipboardCheck",
              title: "Заключение метрологической экспертизы",
              desc: "Отчёт прошёл метрологическую экспертизу — одно или несколько заключений",
            },
            {
              type: "certificate" as MetroType,
              icon: "FileCheck",
              title: "Справка об отсутствии объектов",
              desc: "Объекты метрологической экспертизы в отчёте отсутствуют",
            },
          ] as { type: MetroType; icon: string; title: string; desc: string }[]).map((opt) => {
            const active = data.type === opt.type;
            return (
              <button key={opt.type} onClick={() => setType(opt.type)}
                className={`flex items-start gap-3 p-4 border-2 text-left transition-colors ${active ? "border-geo-amber bg-geo-amber/5" : "border-border hover:border-geo-amber/40 hover:bg-muted/20"}`}>
                <div className={`mt-0.5 flex-shrink-0 ${active ? "text-geo-amber" : "text-muted-foreground/40"}`}>
                  <Icon name={opt.icon} fallback="FileText" size={18} />
                </div>
                <div className="space-y-0.5">
                  <p className={`text-sm font-medium leading-snug ${active ? "text-foreground" : "text-muted-foreground"}`}>{opt.title}</p>
                  <p className="text-xs text-muted-foreground/60 font-mono leading-relaxed">{opt.desc}</p>
                </div>
                {active && <Icon name="CheckCircle2" size={16} className="text-geo-amber ml-auto flex-shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content by type */}
      {data.type === "conclusion" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Заключения
              {data.conclusions.length > 0 && (
                <span className="ml-2 text-geo-amber">{data.conclusions.length}</span>
              )}
            </p>
            <button onClick={addConclusion}
              className="flex items-center gap-1.5 bg-geo-amber text-primary-foreground px-3 py-1.5 text-xs font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">
              <Icon name="Plus" size={12} /> Добавить заключение
            </button>
          </div>

          {data.conclusions.length === 0 ? (
            <div className="border border-dashed border-border py-12 text-center">
              <Icon name="ClipboardCheck" size={24} className="text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-mono mb-3">Нет заключений</p>
              <button onClick={addConclusion}
                className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-mono text-muted-foreground hover:border-geo-amber hover:text-geo-amber transition-colors">
                <Icon name="Plus" size={12} /> Добавить первое заключение
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {data.conclusions.map((c, idx) => (
                <div key={c.id} className="border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-geo-amber font-semibold flex-shrink-0">№{idx + 1}</span>
                    <input
                      type="text"
                      value={c.label}
                      onChange={(e) => updateConclusion(c.id, { label: e.target.value })}
                      placeholder="Наименование или описание заключения (необязательно)..."
                      className="flex-1 bg-muted border border-border px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-geo-amber transition-colors"
                    />
                    <button onClick={() => removeConclusion(c.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                  <FileUploadArea
                    file={c.file}
                    folder={`geo-metrological-${reportId}`}
                    onUpload={(f) => updateConclusion(c.id, { file: f })}
                    onRemove={() => updateConclusion(c.id, { file: undefined })}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Файл справки</p>
          <FileUploadArea
            file={data.certificateFile}
            folder={`geo-metrological-${reportId}`}
            onUpload={(f) => update({ certificateFile: f })}
            onRemove={() => update({ certificateFile: undefined })}
          />
          {!data.certificateFile && (
            <p className="text-xs text-muted-foreground/50 font-mono">Прикрепите справку об отсутствии объектов метрологической экспертизы в формате PDF</p>
          )}
        </div>
      )}
    </div>
  );
}