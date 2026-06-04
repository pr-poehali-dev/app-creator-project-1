import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { ReportData, Customer, Contractor, License, Contract } from "./Index";

// ─── Section definitions ──────────────────────────────────────────────────────

type TabId =
  | "label"
  | "title_page"
  | "executors"
  | "abstract"
  | "task_copy"
  | "contents"
  | "illustrations"
  | "tables"
  | "text_appendices"
  | "graphic_appendices"
  | "machine_readable"
  | "terms"
  | "text_part"
  | "references"
  | "metrological"
  | "patent"
  | "review"
  | "protocol"
  | "cost"
  | "transfer_acts"
  | "text_app_files"
  | "graphic_app_files";

interface TabDef {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: string;
  note?: string;
}

const TABS: TabDef[] = [
  { id: "label",            label: "Этикетка (обложка)",                             shortLabel: "Этикетка",       icon: "BookMarked" },
  { id: "title_page",       label: "Титульный лист",                                  shortLabel: "Титул",          icon: "FileText" },
  { id: "executors",        label: "Список исполнителей",                             shortLabel: "Исполнители",    icon: "Users" },
  { id: "abstract",         label: "Реферат",                                         shortLabel: "Реферат",        icon: "AlignLeft" },
  { id: "task_copy",        label: "Копия геол. задания / контракта / договора",      shortLabel: "Задание",        icon: "Copy" },
  { id: "contents",         label: "Содержание",                                      shortLabel: "Содержание",     icon: "List" },
  { id: "illustrations",    label: "Список иллюстраций",                              shortLabel: "Иллюстрации",    icon: "Image",    note: "при наличии" },
  { id: "tables",           label: "Список таблиц (текстовая часть)",                 shortLabel: "Таблицы",        icon: "Table",    note: "при наличии" },
  { id: "text_appendices",  label: "Список текстовых приложений",                     shortLabel: "Прил. текст.",   icon: "FileStack", note: "при наличии" },
  { id: "graphic_appendices",label:"Список графических приложений",                   shortLabel: "Прил. граф.",    icon: "Map",      note: "при наличии" },
  { id: "machine_readable", label: "Содержание машиночитаемой версии",               shortLabel: "Маш. версия",    icon: "Database" },
  { id: "terms",            label: "Перечень терминов, сокращений, символов",        shortLabel: "Термины",        icon: "BookOpen", note: "при наличии" },
  { id: "text_part",        label: "Текстовая часть (введение, осн. часть, заключение)", shortLabel: "Текст. часть", icon: "FileEdit" },
  { id: "references",       label: "Список использованных источников",               shortLabel: "Литература",     icon: "BookCopy" },
  { id: "metrological",     label: "Заключение о метрологической экспертизе",        shortLabel: "Метрология",     icon: "Ruler" },
  { id: "patent",           label: "Заключение о патентных исследованиях",           shortLabel: "Патенты",        icon: "Award",    note: "если проводились" },
  { id: "review",           label: "Рецензия (рецензии)",                            shortLabel: "Рецензии",       icon: "MessageSquare" },
  { id: "protocol",         label: "Протокол рассмотрения (принятия) отчёта",        shortLabel: "Протокол",       icon: "ClipboardCheck" },
  { id: "cost",             label: "Справка о стоимости работ",                      shortLabel: "Стоимость",      icon: "Receipt" },
  { id: "transfer_acts",    label: "Копии актов передачи вещественных источников",   shortLabel: "Акты передачи",  icon: "PackageCheck" },
  { id: "text_app_files",   label: "Текстовые приложения",                           shortLabel: "Текст. прил.",   icon: "Files" },
  { id: "graphic_app_files",label: "Графические приложения",                         shortLabel: "Граф. прил.",    icon: "LayoutTemplate", note: "если предусмотрены" },
];

// ─── Placeholder table ────────────────────────────────────────────────────────

function PlaceholderTable({ tab }: { tab: TabDef }) {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Icon name={tab.icon} fallback="File" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">{tab.label}</h3>
          {tab.note && (
            <span className="font-mono text-xs text-muted-foreground border border-border px-2 py-0.5">{tab.note}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент</p>
      </div>

      <div className="border border-border overflow-hidden">
        <div className="bg-muted/50 border-b border-border px-4 py-2 flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Атрибуты</span>
          <span className="font-mono text-xs text-muted-foreground/40">— описание будет добавлено —</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest w-8">#</th>
              <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest">Поле</th>
              <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest">Тип</th>
              <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest">Описание</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground/40">{String(i).padStart(2, "0")}</td>
                <td className="px-4 py-3">
                  <div className="h-3 w-28 bg-muted rounded-sm animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-3 w-16 bg-muted rounded-sm animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-3 w-48 bg-muted rounded-sm animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-border/50 flex items-center gap-2">
          <Icon name="Info" size={13} className="text-muted-foreground/40" />
          <span className="font-mono text-xs text-muted-foreground/40">Атрибуты этого раздела будут описаны на следующем шаге</span>
        </div>
      </div>
    </div>
  );
}

// ─── ReportPage component ─────────────────────────────────────────────────────

interface ReportPageProps {
  report: ReportData;
  customers: Customer[];
  contractors: Contractor[];
  licenses: License[];
  contracts: Contract[];
  onBack: () => void;
}

export default function ReportPage({ report, customers, contractors, licenses, contracts, onBack }: ReportPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>("label");

  const customer = customers.find((c) => c.id === report.customerId);
  const contractor = contractors.find((c) => c.id === report.contractorId);
  const license = licenses.find((l) => l.id === report.licenseId);
  const contract = contracts.find((c) => c.id === report.contractId);

  const activeTabDef = TABS.find((t) => t.id === activeTab)!;
  const activeIdx = TABS.findIndex((t) => t.id === activeTab);

  const secrecyColor: Record<string, string> = {
    "нс": "text-muted-foreground",
    "КТ": "text-blue-400",
    "С": "text-geo-amber",
    "СС": "text-orange-400",
    "ОВ": "text-destructive",
  };

  return (
    <div className="min-h-screen bg-background geo-grid-bg flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs font-mono"
            >
              <Icon name="ChevronLeft" size={16} />
              Отчёты
            </button>
            <span className="text-border">/</span>
            <div className="flex items-center gap-2">
              <Icon name="Mountain" size={15} className="text-geo-amber" />
              <span className="font-display text-sm tracking-wider uppercase text-foreground truncate max-w-xs">{report.title || "Без названия"}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`font-mono text-xs font-bold border px-2 py-0.5 border-current ${secrecyColor[report.secrecy]}`}>
              {report.secrecy}
            </span>
            <span className="font-mono text-xs text-muted-foreground hidden sm:block border border-border px-2 py-0.5">
              ГОСТ Р 53579–2009
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — structural elements */}
        <aside className="w-56 border-r border-border bg-card/50 flex-shrink-0 hidden md:flex flex-col overflow-y-auto">
          <div className="px-4 py-3 border-b border-border flex-shrink-0">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Структура отчёта</p>
            <p className="font-mono text-xs text-muted-foreground/40 mt-0.5">{TABS.length} элементов</p>
          </div>
          <nav className="flex flex-col p-2 gap-0.5">
            {TABS.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2 text-left transition-all border-l-2 group ${
                  activeTab === tab.id
                    ? "bg-geo-amber/10 text-geo-amber border-geo-amber"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted border-transparent"
                }`}
              >
                <span className={`font-mono text-xs flex-shrink-0 w-4 text-right ${activeTab === tab.id ? "text-geo-amber/60" : "text-muted-foreground/30"}`}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <Icon name={tab.icon} fallback="File" size={12} />
                <span className="text-xs leading-tight truncate">{tab.shortLabel}</span>
                {tab.note && (
                  <span className="ml-auto text-muted-foreground/30 text-xs">*</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Report meta bar */}
          <div className="border-b border-border bg-muted/30 px-6 py-2 flex-shrink-0 hidden md:flex items-center gap-6 overflow-x-auto">
            {[
              { label: "Заказчик", value: customer?.name },
              { label: "Исполнитель", value: contractor?.name },
              { label: "Лицензия", value: license ? `${license.number} · ${license.siteName}` : undefined },
              { label: "Контракт", value: contract ? `№ ${contract.number}` : undefined },
              { label: "Ответственный", value: report.responsible },
            ].map((item) => (
              item.value ? (
                <div key={item.label} className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono text-xs text-muted-foreground/60 uppercase tracking-widest">{item.label}:</span>
                  <span className="font-mono text-xs text-foreground/70">{item.value}</span>
                </div>
              ) : null
            ))}
          </div>

          {/* Tab navigation (mobile) */}
          <div className="md:hidden border-b border-border bg-card/90 flex overflow-x-auto flex-shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-xs font-mono transition-colors border-b-2 ${
                  activeTab === tab.id ? "text-geo-amber border-geo-amber" : "text-muted-foreground border-transparent"
                }`}
              >
                {tab.shortLabel}
              </button>
            ))}
          </div>

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <PlaceholderTable tab={activeTabDef} />
            </div>
          </main>

          {/* Bottom navigation */}
          <div className="border-t border-border px-6 py-3 flex items-center justify-between bg-card/50 flex-shrink-0">
            <button
              onClick={() => activeIdx > 0 && setActiveTab(TABS[activeIdx - 1].id)}
              disabled={activeIdx === 0}
              className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="ChevronLeft" size={14} />
              {activeIdx > 0 ? TABS[activeIdx - 1].shortLabel : "—"}
            </button>
            <span className="font-mono text-xs text-muted-foreground">
              {activeIdx + 1} / {TABS.length}
            </span>
            <button
              onClick={() => activeIdx < TABS.length - 1 && setActiveTab(TABS[activeIdx + 1].id)}
              disabled={activeIdx === TABS.length - 1}
              className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {activeIdx < TABS.length - 1 ? TABS[activeIdx + 1].shortLabel : "—"}
              <Icon name="ChevronRight" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
