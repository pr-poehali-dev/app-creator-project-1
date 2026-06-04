import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import type { ReportData, Customer, Contractor, Executor } from "@/types/geo";
import type { AbstractData, WorkMethod, TaskFile, ContentsEntry, TabId, LabelData, TitlePageData } from "./reportTypes";
import { UPLOAD_URL } from "./reportTypes";
import { InlineInput } from "./ReportSections1";

// ─── TextArea ─────────────────────────────────────────────────────────────────

function TextArea({ label, value, onChange, placeholder, hint, rows = 3 }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{label}</label>
        {hint && <span className="text-xs text-muted-foreground/40 font-mono">{hint}</span>}
      </div>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors resize-none"
      />
    </div>
  );
}

// ─── MethodsTable ─────────────────────────────────────────────────────────────

const EMPTY_METHOD: Omit<WorkMethod, "id"> = {
  name: "",
  volume: "",
  unit: "",
  coordSystem: "",
  coordFrom: "",
  coordTo: "",
};

const COORD_SYSTEMS = ["ГСК-2011"];

function MethodsTable({ methods, onChange }: {
  methods: WorkMethod[];
  onChange: (m: WorkMethod[]) => void;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<WorkMethod, "id">>(EMPTY_METHOD);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => { setForm(EMPTY_METHOD); setEditId("new"); };
  const openEdit = (m: WorkMethod) => {
    setForm({ name: m.name, volume: m.volume, unit: m.unit, coordSystem: m.coordSystem, coordFrom: m.coordFrom, coordTo: m.coordTo });
    setEditId(m.id);
  };

  const save = () => {
    if (editId === "new") {
      onChange([...methods, { ...form, id: Date.now().toString() }]);
    } else {
      onChange(methods.map((m) => m.id === editId ? { ...form, id: editId } : m));
    }
    setEditId(null);
  };

  const setF = (field: keyof Omit<WorkMethod, "id">) => (v: string) => setForm((f) => ({ ...f, [field]: v }));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Методы и объёмы работ</span>
          <span className="ml-2 text-xs text-muted-foreground/40 font-mono">способы исследования</span>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 text-xs font-mono text-geo-amber hover:text-amber-400 border border-geo-amber/40 hover:border-amber-400/60 px-3 py-1.5 transition-colors">
          <Icon name="Plus" size={12} /> Добавить метод
        </button>
      </div>

      {methods.length === 0 ? (
        <div className="border border-dashed border-border py-8 text-center text-muted-foreground/50 text-xs font-mono">
          Нет методов — нажмите «Добавить метод»
        </div>
      ) : (
        <div className="border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2 font-mono text-xs text-muted-foreground uppercase tracking-widest">Метод</th>
                <th className="text-left px-3 py-2 font-mono text-xs text-muted-foreground uppercase tracking-widest w-24">Объём</th>
                <th className="text-left px-3 py-2 font-mono text-xs text-muted-foreground uppercase tracking-widest w-20">Ед. изм.</th>
                <th className="text-left px-3 py-2 font-mono text-xs text-muted-foreground uppercase tracking-widest w-20">Сист. коорд.</th>
                <th className="text-left px-3 py-2 font-mono text-xs text-muted-foreground uppercase tracking-widest">Координаты</th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {methods.map((m) => (
                <tr key={m.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors group">
                  <td className="px-3 py-2.5">
                    <p className="text-sm text-foreground font-medium leading-snug">{m.name || "—"}</p>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-sm">{m.volume || "—"}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{m.unit || "—"}</td>
                  <td className="px-3 py-2.5">
                    {m.coordSystem && m.coordSystem !== "—" ? (
                      <span className="font-mono text-xs text-geo-amber border border-geo-amber/30 px-1.5 py-0.5">{m.coordSystem}</span>
                    ) : <span className="text-muted-foreground/30 text-xs">—</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    {m.coordFrom || m.coordTo ? (
                      <span className="font-mono text-xs text-foreground/70">{m.coordFrom}{m.coordTo ? ` — ${m.coordTo}` : ""}</span>
                    ) : <span className="text-muted-foreground/30 text-xs">—</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <button onClick={() => openEdit(m)} className="p-1 text-muted-foreground hover:text-geo-amber transition-colors">
                        <Icon name="Pencil" size={12} />
                      </button>
                      <button onClick={() => setDeleteId(m.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                        <Icon name="Trash2" size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-lg space-y-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm tracking-wider uppercase">{editId === "new" ? "Добавить метод" : "Редактировать метод"}</h4>
              <button onClick={() => setEditId(null)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Наименование метода</label>
              <input type="text" value={form.name} onChange={(e) => setF("name")(e.target.value)} placeholder="Буровые работы, геофизические исследования..." className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Объём</label>
                <input type="text" value={form.volume} onChange={(e) => setF("volume")(e.target.value)} placeholder="108" className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Единица измерения</label>
                <input type="text" value={form.unit} onChange={(e) => setF("unit")(e.target.value)} placeholder="скв., пог. м, км², п.км..." className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors" />
              </div>
            </div>
            <div className="border border-border/50 p-4 space-y-3 bg-muted/20">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Icon name="MapPin" size={12} className="text-geo-amber" /> Координаты
              </p>
              <div className="space-y-1">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Система координат</label>
                <select value={form.coordSystem} onChange={(e) => setF("coordSystem")(e.target.value)} className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-geo-amber transition-colors">
                  {COORD_SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Координаты от</label>
                  <input type="text" value={form.coordFrom} onChange={(e) => setF("coordFrom")(e.target.value)} placeholder="58°12′N 60°45′E" className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Координаты до</label>
                  <input type="text" value={form.coordTo} onChange={(e) => setF("coordTo")(e.target.value)} placeholder="59°00′N 61°30′E" className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={save} className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">Сохранить</button>
              <button onClick={() => setEditId(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6 space-y-4">
            <h4 className="font-display text-sm tracking-wider uppercase">Удалить метод?</h4>
            <p className="text-sm text-muted-foreground">Метод будет удалён из списка.</p>
            <div className="flex gap-3">
              <button onClick={() => { onChange(methods.filter((m) => m.id !== deleteId)); setDeleteId(null); }} className="flex-1 bg-destructive text-destructive-foreground py-2 text-sm font-display tracking-wider uppercase hover:opacity-90 transition-opacity">Удалить</button>
              <button onClick={() => setDeleteId(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AbstractSection ──────────────────────────────────────────────────────────

export function AbstractSection({
  report,
  contractor,
  contractors,
  abstractData,
  setAbstractData,
}: {
  report: ReportData;
  contractor?: Contractor;
  contractors: Contractor[];
  abstractData: AbstractData;
  setAbstractData: React.Dispatch<React.SetStateAction<AbstractData>>;
}) {
  const allExecutors: { executor: Executor; companyName: string }[] = [];
  if (contractor) {
    if (contractor.responsible) {
      allExecutors.push({
        executor: { id: "resp", lastName: report.responsible || contractor.responsible, initials: "", position: "ответственный исполнитель", degree: "" },
        companyName: contractor.name,
      });
    }
    (contractor.executors || []).forEach((e) => allExecutors.push({ executor: e, companyName: contractor.name }));
  }
  (report.coContractors || []).forEach((cc) => {
    const c = contractors.find((x) => x.id === cc.contractorId);
    if (c) (c.executors || []).forEach((e) => allExecutors.push({ executor: e, companyName: c.name }));
  });

  const selectedExec = allExecutors.find((x) => x.executor.id === abstractData.composerExecutorId);

  const handleComposerSelect = (execId: string) => {
    const found = allExecutors.find((x) => x.executor.id === execId);
    const name = found ? `${found.executor.lastName}${found.executor.initials ? " " + found.executor.initials : ""}` : "";
    setAbstractData((d) => ({ ...d, composerExecutorId: execId, composerName: name }));
  };

  const set = (field: keyof AbstractData) => (v: string) => setAbstractData((d) => ({ ...d, [field]: v }));

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="AlignLeft" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Реферат</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 4</p>
      </div>

      <div className="border border-geo-amber/30 bg-geo-amber/5 px-4 py-3 flex items-center gap-3">
        <Icon name="Info" size={14} className="text-geo-amber" />
        <span className="font-mono text-xs text-geo-amber/80">Реферат / информационная карта отчёта · справочный документ</span>
      </div>

      {/* ── 1. Библиографическое описание ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <span className="font-mono text-xs text-geo-amber font-bold">01</span>
          <span className="font-display text-sm tracking-wider uppercase text-foreground">Библиографическое описание</span>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Авторы
              <span className="ml-2 normal-case text-geo-amber/60 font-mono">← загружается из исполнителей</span>
            </label>
            <div className="bg-muted/30 border border-border/50 px-3 py-2 text-sm text-foreground/70 min-h-[38px]">
              {allExecutors.length > 0
                ? allExecutors.map((x) => `${x.executor.lastName}${x.executor.initials ? " " + x.executor.initials : ""}`).join(", ")
                : <span className="text-muted-foreground/40 italic">Добавьте исполнителей в разделе «Список исполнителей»</span>
              }
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Наименование отчёта
              <span className="ml-2 normal-case text-geo-amber/60 font-mono">← из общих данных</span>
            </label>
            <div className="bg-muted/30 border border-border/50 px-3 py-2 text-sm text-foreground/70">
              {report.title || <span className="text-muted-foreground/40 italic">Не указано</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Год <span className="normal-case text-geo-amber/60">← общие данные</span></label>
              <div className="bg-muted/30 border border-border/50 px-3 py-2 text-sm text-foreground/70">{report.year || "—"}</div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Место <span className="normal-case text-geo-amber/60">← общие данные</span></label>
              <div className="bg-muted/30 border border-border/50 px-3 py-2 text-sm text-foreground/70">{report.place || "—"}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <InlineInput value={abstractData.bibPages} onChange={set("bibPages")} placeholder="112 л." />
            <InlineInput value={abstractData.bibTables} onChange={set("bibTables")} placeholder="14 табл." />
            <InlineInput value={abstractData.bibIllustrations} onChange={set("bibIllustrations")} placeholder="28/174 ил." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Библиография (источников)</label>
              <InlineInput value={abstractData.bibBibliography} onChange={set("bibBibliography")} placeholder="121" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Приложений</label>
              <InlineInput value={abstractData.bibAppendices} onChange={set("bibAppendices")} placeholder="граф. прил. 49/54 л." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Номер экземпляра <span className="normal-case text-geo-amber/60">← из этикетки</span></label>
              <InlineInput value={abstractData.bibCopyNumber} onChange={set("bibCopyNumber")} placeholder="1" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">№ гос. регистрации <span className="normal-case text-geo-amber/60">← общие данные</span></label>
              <div className="bg-muted/30 border border-border/50 px-3 py-2 text-sm text-foreground/70">{report.govRegNumber || "—"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Порядок представления в фонды ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <span className="font-mono text-xs text-geo-amber font-bold">02</span>
          <span className="font-display text-sm tracking-wider uppercase text-foreground">Порядок представления отчёта в фонды</span>
        </div>
        <TextArea label="Текст порядка" value={abstractData.fundDeposit} onChange={set("fundDeposit")} placeholder="Передаётся на хранение в фонды на основании..." rows={3} />
      </div>

      {/* ── 3. Текст реферата ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <span className="font-mono text-xs text-geo-amber font-bold">03</span>
          <span className="font-display text-sm tracking-wider uppercase text-foreground">Текст реферата</span>
        </div>
        <div className="border border-border overflow-hidden">
          <div className="bg-muted/40 border-b border-border px-4 py-2">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">РЕФЕРАТ</span>
          </div>
          <div className="p-5 space-y-5">
            <TextArea label="Предмет исследований" value={abstractData.abstractSubject} onChange={set("abstractSubject")} placeholder="Геологический отчёт о предварительной разведке..." hint="что изучается" rows={4} />
            <TextArea label="Цели проведённых работ" value={abstractData.abstractGoals} onChange={set("abstractGoals")} placeholder="Целью работ является..." hint="задача" rows={3} />
            <MethodsTable methods={abstractData.methods || []} onChange={(m) => setAbstractData((d) => ({ ...d, methods: m }))} />
            <TextArea label="Результаты проведённых работ" value={abstractData.abstractResults} onChange={set("abstractResults")} placeholder="Месторождение разведано сетью скважин..." hint="основные данные" rows={5} />
            <TextArea label="Краткие выводы" value={abstractData.abstractConclusions} onChange={set("abstractConclusions")} placeholder="По результатам проведённых работ установлено..." hint="что выяснено" rows={4} />
            <TextArea label="Оценка эффективности исследований" value={abstractData.abstractEfficiency} onChange={set("abstractEfficiency")} placeholder="Рекомендуется детальная разведка..." hint="практическое значение" rows={3} />
          </div>
        </div>
      </div>

      {/* ── 4. Ключевые слова ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <span className="font-mono text-xs text-geo-amber font-bold">04</span>
          <span className="font-display text-sm tracking-wider uppercase text-foreground">Ключевые слова</span>
        </div>
        <TextArea label="Перечень ключевых слов" value={abstractData.keywords} onChange={set("keywords")} placeholder="Предварительная разведка, железорудное месторождение, магнетит, пирит, вулканогенно-осадочные породы..." rows={3} />
      </div>

      {/* ── 5. Составитель ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <span className="font-mono text-xs text-geo-amber font-bold">05</span>
          <span className="font-display text-sm tracking-wider uppercase text-foreground">Составитель реферата</span>
        </div>
        <div className="border border-border bg-card p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Выбор исполнителя</label>
            <select value={abstractData.composerExecutorId} onChange={(e) => handleComposerSelect(e.target.value)} className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-geo-amber transition-colors">
              <option value="">— выберите из списка исполнителей —</option>
              {allExecutors.map((x) => (
                <option key={x.executor.id} value={x.executor.id}>
                  {x.executor.lastName}{x.executor.initials ? " " + x.executor.initials : ""}
                  {x.executor.position ? ` · ${x.executor.position}` : ""}
                  {" "}({x.companyName})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-[1fr_auto_auto] gap-6 items-end pt-2">
            <div className="text-center space-y-1">
              <div className="h-10 border-b border-foreground/30 flex items-end justify-center pb-1">
                <span className="text-xs text-muted-foreground/40 italic">(подпись)</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-border flex items-center justify-center mb-1">
                <span className="text-xs text-muted-foreground/30 font-mono">М.П.</span>
              </div>
            </div>
            <div className="space-y-1 text-right">
              <div className="border-b border-foreground/30 pb-1">
                {abstractData.composerName ? (
                  <span className="text-sm text-foreground font-medium">{abstractData.composerName}</span>
                ) : (
                  <span className="text-xs text-muted-foreground/40 italic">Н.М. Фамилия</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground/50 font-mono">расшифровка подписи</p>
            </div>
          </div>
          {selectedExec && (
            <div className="bg-geo-amber/5 border border-geo-amber/20 px-4 py-3">
              <p className="font-mono text-xs text-geo-amber/80">
                Составил: <span className="font-bold">{selectedExec.executor.lastName}{selectedExec.executor.initials ? " " + selectedExec.executor.initials : ""}</span>
                {selectedExec.executor.position && <> · {selectedExec.executor.position}</>}
                {selectedExec.executor.degree && <> · {selectedExec.executor.degree}</>}
              </p>
              <p className="font-mono text-xs text-muted-foreground/50 mt-0.5">{selectedExec.companyName}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TaskCopySection ──────────────────────────────────────────────────────────

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

// ─── buildContents ────────────────────────────────────────────────────────────

export function buildContents(
  reportId: string,
  report: ReportData,
  contractor?: Contractor,
  contractors?: Contractor[],
): ContentsEntry[] {
  const load = (key: string) => {
    try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
  };

  const label: LabelData | null       = load(`geo_label_${reportId}`);
  const title: TitlePageData | null   = load(`geo_title_${reportId}`);
  const abstract: AbstractData | null = load(`geo_abstract_${reportId}`);
  const taskFile: TaskFile | null     = load(`geo_task_file_${reportId}`);

  const hasLabel    = !!(label?.bookName || label?.copyNumber);
  const hasTitle    = !!(title?.customerName || title?.customerPosition);
  const hasAbstract = !!(abstract?.abstractSubject || abstract?.keywords);
  const hasTask     = !!taskFile?.filename;

  const mainExecCount = (contractor?.executors?.length || 0) + (report.responsible ? 1 : 0);
  const coCount = (report.coContractors || []).reduce((s, cc) => {
    const c = contractors?.find((x) => x.id === cc.contractorId);
    return s + (c?.executors?.length || 0);
  }, 0);
  const totalExec = mainExecCount + coCount;

  const entries: ContentsEntry[] = [
    { id: "label",     level: 0, title: "Этикетка (обложка)",   page: "—", status: hasLabel ? "filled" : "empty", note: label?.bookName || undefined },
    { id: "title_page",level: 0, title: "Титульный лист",        page: "—", status: hasTitle ? "filled" : "empty" },
    { id: "executors", level: 0, title: "Список исполнителей",   page: "—", status: totalExec > 0 ? "filled" : "empty", note: totalExec > 0 ? `${totalExec} чел.` : undefined },
    { id: "abstract",  level: 0, title: "Реферат",               page: "—", status: hasAbstract ? "filled" : abstract ? "partial" : "empty" },
  ];

  if (abstract) {
    if (abstract.bibPages || abstract.bibTables) {
      entries.push({ id: "abstract_bib",  level: 1, title: "Библиографическое описание", page: "—", status: abstract.bibPages ? "filled" : "partial" });
    }
    entries.push({ id: "abstract_text", level: 1, title: "Текст реферата",    page: "—", status: abstract.abstractSubject ? "filled" : "empty" });
    if (abstract.methods?.length) {
      abstract.methods.forEach((m) => {
        entries.push({ id: `method_${m.id}`, level: 2, title: m.name, page: "—", status: "filled", note: `${m.volume} ${m.unit}`.trim() || undefined });
      });
    }
    entries.push({ id: "abstract_kw", level: 1, title: "Ключевые слова", page: "—", status: abstract.keywords ? "filled" : "empty" });
  }

  entries.push({ id: "task_copy",          level: 0, title: "Копия геологического задания",                page: "—", status: hasTask ? "file" : "empty", note: taskFile?.filename || undefined });
  entries.push({ id: "contents",           level: 0, title: "Содержание",                                   page: "—", status: "filled" });
  entries.push({ id: "illustrations",      level: 0, title: "Список иллюстраций",                           page: "—", status: "empty", note: "при наличии" });
  entries.push({ id: "tables",             level: 0, title: "Список таблиц в текстовой части",              page: "—", status: "empty", note: "при наличии" });
  entries.push({ id: "text_appendices",    level: 0, title: "Список текстовых приложений",                  page: "—", status: "empty", note: "при наличии" });
  entries.push({ id: "graphic_appendices", level: 0, title: "Список графических приложений",                page: "—", status: "empty", note: "при наличии" });
  entries.push({ id: "machine_readable",   level: 0, title: "Содержание машиночитаемой версии отчёта",      page: "—", status: "empty" });
  entries.push({ id: "terms",              level: 0, title: "Перечень терминов, сокращений, символов",      page: "—", status: "empty", note: "при наличии" });
  entries.push({ id: "text_part",          level: 0, title: "Текстовая часть",                              page: "—", status: "empty" });
  entries.push({ id: "text_part_intro",    level: 1, title: "Введение",                                     page: "—", status: "empty" });
  entries.push({ id: "text_part_main",     level: 1, title: "Основная часть",                               page: "—", status: "empty" });
  entries.push({ id: "text_part_conc",     level: 1, title: "Заключение",                                   page: "—", status: "empty" });
  entries.push({ id: "references",         level: 0, title: "Список использованных источников",             page: "—", status: "empty" });
  entries.push({ id: "metrological",       level: 0, title: "Заключение о метрологической экспертизе",      page: "—", status: "empty" });
  entries.push({ id: "patent",             level: 0, title: "Заключение о патентных исследованиях",         page: "—", status: "empty", note: "если проводились" });
  entries.push({ id: "review",             level: 0, title: "Рецензия (рецензии)",                          page: "—", status: "empty" });
  entries.push({ id: "protocol",           level: 0, title: "Протокол рассмотрения (принятия) отчёта",      page: "—", status: "empty" });
  entries.push({ id: "cost",               level: 0, title: "Справка о стоимости работ",                    page: "—", status: "empty" });
  entries.push({ id: "transfer_acts",      level: 0, title: "Копии актов передачи вещественных источников", page: "—", status: "empty" });
  entries.push({ id: "text_app_files",     level: 0, title: "Текстовые приложения",                        page: "—", status: "empty" });
  entries.push({ id: "graphic_app_files",  level: 0, title: "Графические приложения",                      page: "—", status: "empty", note: "если предусмотрены" });

  return entries;
}

// ─── ContentsSection ──────────────────────────────────────────────────────────

export function ContentsSection({
  report,
  contractor,
  contractors,
  onNavigate,
}: {
  report: ReportData;
  contractor?: Contractor;
  contractors: Contractor[];
  onNavigate: (tab: TabId) => void;
}) {
  const [entries, setEntries] = useState<ContentsEntry[]>(() =>
    buildContents(report.id, report, contractor, contractors)
  );
  const [pages, setPages] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(`geo_contents_pages_${report.id}`) || "{}"); } catch { return {}; }
  });

  useEffect(() => {
    setEntries(buildContents(report.id, report, contractor, contractors));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.id]);

  const setPage = (id: string, v: string) => {
    const next = { ...pages, [id]: v };
    setPages(next);
    localStorage.setItem(`geo_contents_pages_${report.id}`, JSON.stringify(next));
  };

  const filledCount = entries.filter((e) => e.status !== "empty" && e.level === 0).length;
  const totalTop    = entries.filter((e) => e.level === 0).length;

  const statusColor: Record<ContentsEntry["status"], string> = {
    filled:  "text-geo-amber",
    partial: "text-blue-400",
    file:    "text-green-400",
    empty:   "text-muted-foreground/30",
  };
  const statusIcon: Record<ContentsEntry["status"], string> = {
    filled:  "CheckCircle2",
    partial: "Circle",
    file:    "FileCheck",
    empty:   "CircleDashed",
  };

  const TAB_MAP: Record<string, TabId> = {
    label: "label", title_page: "title_page", executors: "executors",
    abstract: "abstract", abstract_bib: "abstract", abstract_text: "abstract",
    abstract_kw: "abstract", task_copy: "task_copy", contents: "contents",
    illustrations: "illustrations", tables: "tables", text_appendices: "text_appendices",
    graphic_appendices: "graphic_appendices", machine_readable: "machine_readable",
    terms: "terms", text_part: "text_part", text_part_intro: "text_part",
    text_part_main: "text_part", text_part_conc: "text_part",
    references: "references", metrological: "metrological", patent: "patent",
    review: "review", protocol: "protocol", cost: "cost",
    transfer_acts: "transfer_acts", text_app_files: "text_app_files",
    graphic_app_files: "graphic_app_files",
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="List" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Содержание</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 6</p>
      </div>

      <div className="border border-border bg-card px-5 py-4 flex items-center gap-5">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Заполнено разделов</span>
            <span className="font-mono text-xs text-geo-amber">{filledCount} / {totalTop}</span>
          </div>
          <div className="h-1.5 bg-muted overflow-hidden">
            <div className="h-full bg-geo-amber transition-all duration-500" style={{ width: `${(filledCount / totalTop) * 100}%` }} />
          </div>
        </div>
        <button onClick={() => setEntries(buildContents(report.id, report, contractor, contractors))} className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-geo-amber border border-border hover:border-geo-amber/40 px-3 py-2 transition-colors flex-shrink-0">
          <Icon name="RefreshCw" size={12} /> Обновить
        </button>
      </div>

      <div className="border border-geo-amber/30 bg-geo-amber/5 px-4 py-3 flex items-center gap-3">
        <Icon name="Info" size={14} className="text-geo-amber" />
        <span className="font-mono text-xs text-geo-amber/80">Содержание строится автоматически · номера страниц вводите вручную · нажмите на раздел для перехода</span>
      </div>

      <div className="border border-border overflow-hidden">
        <div className="bg-muted/50 border-b border-border px-4 py-2 grid grid-cols-[auto_1fr_80px] gap-4 items-center">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest w-6">№</span>
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Наименование</span>
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest text-right">Стр.</span>
        </div>
        <div>
          {entries.map((entry, idx) => {
            const topIdx = entries.filter((e, i) => e.level === 0 && i <= idx).length;
            const indent = entry.level === 1 ? "pl-8" : entry.level === 2 ? "pl-14" : "";
            const tabId = TAB_MAP[entry.id] as TabId | undefined;

            return (
              <div key={entry.id} className={`grid grid-cols-[auto_1fr_80px] gap-4 items-center px-4 py-2.5 border-b border-border/40 last:border-0 ${entry.level === 0 ? "hover:bg-muted/20 transition-colors" : "bg-muted/5"}`}>
                <div className="w-6 flex-shrink-0 flex items-center justify-end">
                  {entry.level === 0 ? (
                    <span className="font-mono text-xs text-muted-foreground/40">{String(topIdx).padStart(2, "0")}</span>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground/20">·</span>
                  )}
                </div>
                <div className={`flex items-center gap-2 min-w-0 ${indent}`}>
                  <Icon name={statusIcon[entry.status]} fallback="Circle" size={12} className={`flex-shrink-0 ${statusColor[entry.status]}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {tabId && entry.level === 0 ? (
                        <button onClick={() => onNavigate(tabId)} className="text-sm text-left hover:text-geo-amber transition-colors font-medium text-foreground">
                          {entry.title}
                        </button>
                      ) : (
                        <span className={`text-sm ${entry.level === 0 ? "font-medium text-foreground" : "text-muted-foreground/70"}`}>
                          {entry.title}
                        </span>
                      )}
                      {entry.note && <span className="font-mono text-xs text-muted-foreground/40">{entry.note}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  {entry.level === 0 ? (
                    <input type="text" value={pages[entry.id] || ""} onChange={(e) => setPage(entry.id, e.target.value)} placeholder="—" className="w-16 bg-muted border border-border/50 px-2 py-1 text-xs font-mono text-right text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-geo-amber transition-colors" />
                  ) : (
                    <span className="text-xs font-mono text-muted-foreground/30 pr-1">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-6 px-1">
        {([
          { status: "filled",  label: "Заполнен" },
          { status: "partial", label: "Частично" },
          { status: "file",    label: "Файл загружен" },
          { status: "empty",   label: "Не заполнен" },
        ] as { status: ContentsEntry["status"]; label: string }[]).map((item) => (
          <div key={item.status} className="flex items-center gap-1.5">
            <Icon name={statusIcon[item.status]} fallback="Circle" size={11} className={statusColor[item.status]} />
            <span className="font-mono text-xs text-muted-foreground/60">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
