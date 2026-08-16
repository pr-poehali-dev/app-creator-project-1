import Icon from "@/components/ui/icon";
import type { ReportData, Customer, Contractor, License, Contract } from "@/types/geo";
import { TABS } from "@/components/report/reportTypes";
import type { TabId } from "@/components/report/reportTypes";

interface TabNavProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  dirty: Set<string>;
}

// Боковая панель со структурой отчёта (desktop)
export function ReportSidebar({ activeTab, setActiveTab, dirty }: TabNavProps) {
  return (
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
            {dirty.has(tab.id) && (
              <span
                title="Есть несохранённые изменения"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-geo-amber flex-shrink-0 animate-pulse"
              />
            )}
            {tab.note && !dirty.has(tab.id) && <span className="ml-auto text-muted-foreground/30 text-xs">*</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}

// Строка реквизитов: заказчик, исполнитель, лицензия, контракт, место и год
export function ReportMetaBar({ report, customer, contractor, license, contract }: {
  report: ReportData;
  customer?: Customer;
  contractor?: Contractor;
  license?: License;
  contract?: Contract;
}) {
  return (
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
  );
}

// Горизонтальная лента вкладок (mobile)
export function ReportMobileTabs({ activeTab, setActiveTab, dirty }: TabNavProps) {
  return (
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
          {dirty.has(tab.id) && (
            <span className="w-1.5 h-1.5 rounded-full bg-geo-amber flex-shrink-0 animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
}

// Переход к предыдущему и следующему разделу
export function ReportBottomNav({ activeIdx, setActiveTab }: {
  activeIdx: number;
  setActiveTab: (tab: TabId) => void;
}) {
  return (
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
  );
}
