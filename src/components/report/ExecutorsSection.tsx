import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { ReportData, Contractor, Executor } from "@/types/geo";

// ─── ExecutorRow ──────────────────────────────────────────────────────────────

function ExecutorRow({ executor, isResponsible }: { executor: Executor; isResponsible?: boolean }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start py-4 border-b border-border/40 last:border-0">
      <div>
        <p className="font-semibold text-foreground text-sm leading-snug">
          {executor.lastName.toUpperCase()}{executor.initials ? ` ${executor.initials},` : ""}
        </p>
        {isResponsible && (
          <p className="text-xs text-geo-amber font-mono">ответственный исполнитель</p>
        )}
        {executor.position && <p className="text-xs text-muted-foreground leading-snug">{executor.position}</p>}
        {executor.degree && <p className="text-xs text-muted-foreground leading-snug">{executor.degree}</p>}
      </div>
      <div className="flex flex-col items-center justify-center pt-4">
        <div className="border-b border-foreground/30 w-24" />
        <p className="text-xs text-muted-foreground/50 italic mt-0.5">(подпись)</p>
      </div>
      <div className="text-right pt-1">
        <p className="text-xs text-muted-foreground/40 italic">Разделы — будут добавлены позже</p>
      </div>
    </div>
  );
}

// ─── ExecutorsSection ─────────────────────────────────────────────────────────

export function ExecutorsSection({
  report,
  contractor,
  contractors,
  setReport,
}: {
  report: ReportData;
  contractor?: Contractor;
  contractors: Contractor[];
  setReport: (r: ReportData) => void;
}) {
  const [coModal, setCoModal] = useState(false);
  const [selectedCoId, setSelectedCoId] = useState("");

  const coContractors = (report.coContractors || [])
    .map((cc) => contractors.find((c) => c.id === cc.contractorId))
    .filter(Boolean) as Contractor[];

  const availableToAdd = contractors.filter(
    (c) => c.id !== report.contractorId && !(report.coContractors || []).some((cc) => cc.contractorId === c.id)
  );

  const addCoContractor = () => {
    if (!selectedCoId) return;
    setReport({ ...report, coContractors: [...(report.coContractors || []), { contractorId: selectedCoId }] });
    setSelectedCoId("");
    setCoModal(false);
  };

  const removeCoContractor = (id: string) => {
    setReport({ ...report, coContractors: (report.coContractors || []).filter((cc) => cc.contractorId !== id) });
  };

  const responsible = contractor
    ? ({ id: "resp", lastName: report.responsible || contractor.responsible || "—", initials: "", position: "ответственный исполнитель", degree: "" } as Executor)
    : null;

  const mainExecutors = contractor?.executors || [];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="Users" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Список исполнителей</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 3</p>
      </div>

      <div className="border border-geo-amber/30 bg-geo-amber/5 px-4 py-3 flex items-center gap-3">
        <Icon name="Info" size={14} className="text-geo-amber" />
        <span className="font-mono text-xs text-geo-amber/80">Исполнители загружаются из компании-исполнителя · разделы будут привязаны позже</span>
      </div>

      <div className="border border-border bg-card">
        <div className="bg-muted/40 border-b border-border px-5 py-2.5 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Исполнитель</span>
            <span className="ml-3 text-sm text-foreground font-medium">{contractor?.name || "—"}</span>
          </div>
          <span className="font-mono text-xs text-geo-amber/60">← из общих данных</span>
        </div>
        <div className="px-5">
          {responsible && <ExecutorRow executor={responsible} isResponsible />}
          {mainExecutors.length === 0 && !responsible && (
            <p className="py-6 text-center text-xs text-muted-foreground/50 font-mono italic">Нет исполнителей. Добавьте их в разделе «Исполнители».</p>
          )}
          {mainExecutors.map((e) => <ExecutorRow key={e.id} executor={e} />)}
        </div>
      </div>

      {coContractors.length > 0 && (
        <div className="space-y-4">
          <div className="text-center">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest border-b border-border pb-0.5">Соисполнители:</span>
          </div>
          {coContractors.map((cc) => (
            <div key={cc.id} className="border border-border bg-card">
              <div className="bg-muted/40 border-b border-border px-5 py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Соисполнитель</span>
                  <span className="ml-3 text-sm text-foreground font-medium">{cc.name}</span>
                </div>
                <button onClick={() => removeCoContractor(cc.id)} className="text-xs font-mono text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                  <Icon name="X" size={12} /> Убрать
                </button>
              </div>
              <div className="px-5">
                {(cc.executors || []).length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground/50 font-mono italic">Нет исполнителей. Добавьте в разделе «Исполнители».</p>
                ) : (
                  (cc.executors || []).map((e) => <ExecutorRow key={e.id} executor={e} />)
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        {availableToAdd.length > 0 && (
          <button onClick={() => setCoModal(true)} className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-geo-amber border border-border hover:border-geo-amber/40 px-3 py-2 transition-colors">
            <Icon name="Plus" size={13} /> Добавить соисполнителя
          </button>
        )}
        {coContractors.length > 0 && (
          <span className="font-mono text-xs text-muted-foreground/40">{coContractors.length} соисп. · {coContractors.reduce((s, c) => s + (c.executors?.length || 0), 0)} чел.</span>
        )}
      </div>

      {coModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-sm mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm tracking-wider uppercase">Добавить соисполнителя</h4>
              <button onClick={() => setCoModal(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Компания</label>
              <select value={selectedCoId} onChange={(e) => setSelectedCoId(e.target.value)} className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-geo-amber transition-colors">
                <option value="">— выберите —</option>
                {availableToAdd.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={addCoContractor} disabled={!selectedCoId} className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-amber-400 disabled:opacity-40 transition-colors">Добавить</button>
              <button onClick={() => setCoModal(false)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
