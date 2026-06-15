import { useState } from "react";
import Icon from "@/components/ui/icon";
import { UPLOAD_URL } from "./reportTypes";
import { SectionMeta } from "./SectionMeta";
import type { Secrecy, Contractor } from "@/types/geo";

interface TransferAct {
  id: string;
  label: string;
  url: string;
  filename: string;
  uploadedAt: string;
}

function newId() { return Date.now().toString() + Math.random().toString(36).slice(2, 6); }

export function TransferActsSection({ reportId, secrecy, responsible, contractor, contractors }: {
  reportId: string;
  secrecy: Secrecy;
  responsible: string;
  contractor?: Contractor;
  contractors?: Contractor[];
}) {
  const storageKey = `geo_transfer_acts_${reportId}`;

  const load = (): TransferAct[] => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  };

  const [acts, setActs] = useState<TransferAct[]>(load);
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const persist = (next: TransferAct[]) => {
    setActs(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const upload = async (raw: File, slotId: string, label: string) => {
    if (!raw.type.includes("pdf") && !raw.name.toLowerCase().endsWith(".pdf")) {
      setError("Допускается только файл PDF");
      return;
    }
    setUploading(slotId);
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = (reader.result as string).split(",")[1];
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: b64, filename: raw.name, contentType: "application/pdf", folder: `geo-transfer-acts-${reportId}` }),
      });
      const data = await res.json();
      if (data.url) {
        if (slotId === "new") {
          persist([...acts, { id: newId(), label, url: data.url, filename: raw.name, uploadedAt: new Date().toISOString() }]);
        } else {
          persist(acts.map((a) => a.id === slotId ? { ...a, url: data.url, filename: raw.name, uploadedAt: new Date().toISOString() } : a));
        }
      } else {
        setError("Ошибка загрузки файла");
      }
      setUploading(null);
    };
    reader.readAsDataURL(raw);
  };

  const updateLabel = (id: string, label: string) =>
    persist(acts.map((a) => a.id === id ? { ...a, label } : a));

  const remove = (id: string) => persist(acts.filter((a) => a.id !== id));

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="FileCheck2" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Копии актов передачи вещественных источников</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 19</p>
      </div>

      <SectionMeta
        reportId={reportId}
        tabId="transfer_acts"
        secrecy={secrecy}
        responsible={responsible}
        contractor={contractor}
        contractors={contractors}
      />

      <div className="border border-geo-amber/30 bg-geo-amber/5 px-4 py-3 flex items-center gap-3">
        <Icon name="Info" size={14} className="text-geo-amber" />
        <span className="font-mono text-xs text-geo-amber/80">Прикрепите копии актов приёма-передачи вещественных источников · допускается несколько файлов</span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Акты
            {acts.length > 0 && <span className="ml-2 text-geo-amber">{acts.length}</span>}
          </p>
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver("new"); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => { e.preventDefault(); setDragOver(null); const f = e.dataTransfer.files[0]; if (f) upload(f, "new", ""); }}
            className={`flex items-center gap-1.5 bg-geo-amber text-primary-foreground px-3 py-1.5 text-xs font-display tracking-wider uppercase hover:bg-amber-400 transition-colors cursor-pointer ${dragOver === "new" ? "opacity-70" : ""}`}
          >
            <input type="file" accept=".pdf,application/pdf" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, "new", ""); }} />
            {uploading === "new"
              ? <><Icon name="Loader" size={12} className="animate-spin" /> Загрузка...</>
              : <><Icon name="Plus" size={12} /> Добавить акт</>}
          </label>
        </div>

        {acts.length === 0 ? (
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver("empty"); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => { e.preventDefault(); setDragOver(null); const f = e.dataTransfer.files[0]; if (f) upload(f, "new", ""); }}
            className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed px-8 py-16 cursor-pointer transition-colors ${dragOver === "empty" ? "border-geo-amber bg-geo-amber/5" : "border-border hover:border-geo-amber/50 hover:bg-muted/30"}`}
          >
            <input type="file" accept=".pdf,application/pdf" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, "new", ""); }} />
            {uploading === "new" ? (
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
          <div className="space-y-3">
            {acts.map((a, idx) => (
              <div key={a.id} className="border border-border bg-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-geo-amber font-semibold flex-shrink-0">№{idx + 1}</span>
                  <input
                    type="text"
                    value={a.label}
                    onChange={(e) => updateLabel(a.id, e.target.value)}
                    placeholder="Наименование акта (необязательно)..."
                    className="flex-1 bg-muted border border-border px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-geo-amber transition-colors"
                  />
                  <button onClick={() => remove(a.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-4 px-1">
                  <div className="flex-shrink-0 w-10 h-12 bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                    <Icon name="FileText" size={16} className="text-destructive/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.filename}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {new Date(a.uploadedAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                    <a href={a.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-mono text-geo-amber hover:text-amber-400 transition-colors mt-1">
                      <Icon name="ExternalLink" size={11} /> Открыть PDF
                    </a>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer group flex-shrink-0">
                    <input type="file" accept=".pdf,application/pdf" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, a.id, a.label); }} />
                    <Icon name="RefreshCw" size={13} className="text-muted-foreground group-hover:text-geo-amber transition-colors" />
                    <span className="text-xs font-mono text-muted-foreground group-hover:text-geo-amber transition-colors">
                      {uploading === a.id ? "Загрузка..." : "Заменить"}
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-xs font-mono border border-destructive/30 px-4 py-2">
          <Icon name="AlertCircle" size={13} /> {error}
        </div>
      )}
    </div>
  );
}