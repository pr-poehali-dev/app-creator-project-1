import Icon from "@/components/ui/icon";
import type { ReportData, Contractor, Executor } from "@/types/geo";
import type { AbstractData } from "./reportTypes";
import { InlineInput } from "./ReportSections1";
import { TextArea, MethodsTable } from "./AbstractHelpers";

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
