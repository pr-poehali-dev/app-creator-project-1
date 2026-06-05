import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import type { ReportData, Contractor } from "@/types/geo";
import type { AbstractData, TaskFile, ContentsEntry, TabId, LabelData, TitlePageData } from "./reportTypes";

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
