import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import type { ReportData, Customer, Contractor, License, Contract } from "@/types/geo";
import { TABS, DEFAULT_LABEL, DEFAULT_TITLE_PAGE, DEFAULT_ABSTRACT } from "@/components/report/reportTypes";
import type { TabId, LabelData, TitlePageData, AbstractData } from "@/components/report/reportTypes";
import { LabelSection, TitlePageSection, ExecutorsSection, PlaceholderTable } from "@/components/report/ReportSections1";
import { AbstractSection, TaskCopySection, ContentsSection } from "@/components/report/ReportSections2";
import { IllustrationsSection } from "@/components/report/IllustrationsSection";
import { TablesSection } from "@/components/report/TablesSection";
import { TextAppendicesSection } from "@/components/report/TextAppendicesSection";
import { GraphicAppendicesSection } from "@/components/report/GraphicAppendicesSection";
import { TermsSection } from "@/components/report/TermsSection";
import { TextPartSection } from "@/components/report/TextPartSection";
import { ReferencesSection } from "@/components/report/ReferencesSection";
import { MetrologicalSection } from "@/components/report/MetrologicalSection";
import { PatentSection } from "@/components/report/PatentSection";
import { ReviewSection } from "@/components/report/ReviewSection";

// ─── ReportPage component ─────────────────────────────────────────────────────

interface ReportPageProps {
  report: ReportData;
  customers: Customer[];
  contractors: Contractor[];
  licenses: License[];
  contracts: Contract[];
  onBack: () => void;
  onUpdateReport: (r: ReportData) => void;
}

export default function ReportPage({ report, customers, contractors, licenses, contracts, onBack, onUpdateReport }: ReportPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>("label");

  const [labelData, setLabelData] = useState<LabelData>(() => {
    try {
      const stored = localStorage.getItem(`geo_label_${report.id}`);
      return stored ? JSON.parse(stored) : DEFAULT_LABEL;
    } catch { return DEFAULT_LABEL; }
  });
  useEffect(() => {
    localStorage.setItem(`geo_label_${report.id}`, JSON.stringify(labelData));
  }, [labelData, report.id]);

  const [titleData, setTitleData] = useState<TitlePageData>(() => {
    try {
      const stored = localStorage.getItem(`geo_title_${report.id}`);
      return stored ? JSON.parse(stored) : DEFAULT_TITLE_PAGE;
    } catch { return DEFAULT_TITLE_PAGE; }
  });
  useEffect(() => {
    localStorage.setItem(`geo_title_${report.id}`, JSON.stringify(titleData));
  }, [titleData, report.id]);

  const [abstractData, setAbstractData] = useState<AbstractData>(() => {
    try {
      const stored = localStorage.getItem(`geo_abstract_${report.id}`);
      return stored ? JSON.parse(stored) : DEFAULT_ABSTRACT;
    } catch { return DEFAULT_ABSTRACT; }
  });
  useEffect(() => {
    localStorage.setItem(`geo_abstract_${report.id}`, JSON.stringify(abstractData));
  }, [abstractData, report.id]);

  const customer   = customers.find((c) => c.id === report.customerId);
  const contractor = contractors.find((c) => c.id === report.contractorId);
  const license    = licenses.find((l) => l.id === report.licenseId);
  const contract   = contracts.find((c) => c.id === report.contractId);

  // Init responsible from contractor on first open
  useEffect(() => {
    if (!labelData.responsibleOverride && contractor?.responsible) {
      setLabelData((d) => ({ ...d, responsibleOverride: contractor.responsible }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractor?.responsible]);

  const activeTabDef = TABS.find((t) => t.id === activeTab)!;
  const activeIdx    = TABS.findIndex((t) => t.id === activeTab);

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
              <span className="font-display text-sm tracking-wider uppercase text-foreground truncate max-w-xs">
                {report.title || "Без названия"}
              </span>
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
        {/* Sidebar */}
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
                {tab.note && <span className="ml-auto text-muted-foreground/30 text-xs">*</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Meta bar */}
          <div className="border-b border-border bg-muted/30 px-6 py-2 flex-shrink-0 hidden md:flex items-center gap-6 overflow-x-auto">
            {([
              { label: "Заказчик",    value: customer?.name },
              { label: "Исполнитель", value: contractor?.name },
              { label: "Лицензия",    value: license ? `${license.number} · ${license.siteName}` : undefined },
              { label: "Контракт",    value: contract ? `№ ${contract.number}` : undefined },
              { label: "Место / год", value: report.place && report.year ? `${report.place}, ${report.year}` : undefined },
            ] as { label: string; value?: string }[]).map((item) =>
              item.value ? (
                <div key={item.label} className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono text-xs text-muted-foreground/60 uppercase tracking-widest">{item.label}:</span>
                  <span className="font-mono text-xs text-foreground/70">{item.value}</span>
                </div>
              ) : null
            )}
          </div>

          {/* Mobile tabs */}
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
              {activeTab === "label" ? (
                <LabelSection
                  report={report}
                  customer={customer}
                  contractor={contractor}
                  license={license}
                  contract={contract}
                  labelData={labelData}
                  setLabelData={setLabelData}
                />
              ) : activeTab === "title_page" ? (
                <TitlePageSection
                  report={report}
                  customer={customer}
                  contractor={contractor}
                  titleData={titleData}
                  setTitleData={setTitleData}
                />
              ) : activeTab === "executors" ? (
                <ExecutorsSection
                  report={report}
                  contractor={contractor}
                  contractors={contractors}
                  setReport={onUpdateReport}
                />
              ) : activeTab === "abstract" ? (
                <AbstractSection
                  report={report}
                  contractor={contractor}
                  contractors={contractors}
                  abstractData={abstractData}
                  setAbstractData={setAbstractData}
                />
              ) : activeTab === "illustrations" ? (
                <IllustrationsSection reportId={report.id} />
              ) : activeTab === "tables" ? (
                <TablesSection reportId={report.id} />
              ) : activeTab === "text_appendices" ? (
                <TextAppendicesSection reportId={report.id} />
              ) : activeTab === "graphic_appendices" ? (
                <GraphicAppendicesSection reportId={report.id} />
              ) : activeTab === "terms" ? (
                <TermsSection reportId={report.id} />
              ) : activeTab === "text_part" ? (
                <TextPartSection reportId={report.id} />
              ) : activeTab === "references" ? (
                <ReferencesSection reportId={report.id} />
              ) : activeTab === "metrological" ? (
                <MetrologicalSection reportId={report.id} />
              ) : activeTab === "patent" ? (
                <PatentSection reportId={report.id} />
              ) : activeTab === "review" ? (
                <ReviewSection reportId={report.id} />
              ) : activeTab === "task_copy" ? (
                <TaskCopySection reportId={report.id} />
              ) : activeTab === "contents" ? (
                <ContentsSection
                  report={report}
                  contractor={contractor}
                  contractors={contractors}
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              ) : (
                <PlaceholderTable tab={activeTabDef} />
              )}
            </div>
          </main>

          {/* Bottom nav */}
          <div className="border-t border-border px-6 py-3 flex items-center justify-between bg-card/50 flex-shrink-0">
            <button
              onClick={() => activeIdx > 0 && setActiveTab(TABS[activeIdx - 1].id)}
              disabled={activeIdx === 0}
              className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="ChevronLeft" size={14} />
              {activeIdx > 0 ? TABS[activeIdx - 1].shortLabel : "—"}
            </button>
            <span className="font-mono text-xs text-muted-foreground">{activeIdx + 1} / {TABS.length}</span>
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