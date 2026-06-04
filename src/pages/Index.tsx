import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import ReportPage from "./ReportPage";
import type { Customer, Contractor, License, Contract, ReportData } from "@/types/geo";
import { CustomersSection, ContractorsSection } from "@/components/geo/CustomersSections";
import { LicensesSection, ContractsSection } from "@/components/geo/LicensesContracts";
import { ReportsSection } from "@/components/geo/ReportsSection";

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

type Section = "customers" | "contractors" | "licenses" | "contracts" | "reports";

// ─── Initial Data ─────────────────────────────────────────────────────────────

const INIT_CUSTOMERS: Customer[] = [
  {
    id: "1",
    name: 'ООО "НедраГео"',
    director: "Петров Алексей Николаевич",
    inn: "7712345678",
    address: "г. Москва, ул. Нефтяная, д. 12",
  },
];

const INIT_CONTRACTORS: Contractor[] = [
  {
    id: "1",
    name: 'АО "ГеоПроект"',
    director: "Сидоров Виктор Павлович",
    chiefGeologist: "Кузнецов Дмитрий Иванович",
    responsible: "Иванов Сергей Михайлович",
    executors: [],
  },
];

const INIT_LICENSES: License[] = [
  {
    id: "1",
    number: "МОС 12345 ТП",
    issueDate: "2023-03-15",
    ownerId: "1",
    siteName: "Участок Северный",
    useType: "search_eval",
  },
];

const INIT_CONTRACTS: Contract[] = [
  {
    id: "1",
    number: "ГК-2024/001",
    date: "2024-01-10",
    name: "Государственный контракт на проведение геологоразведочных работ",
  },
];

const INIT_REPORTS: ReportData[] = [];

// ─── Nav Items ────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Section; label: string; icon: string }[] = [
  { id: "reports",     label: "Отчёты",      icon: "BookOpen"  },
  { id: "customers",   label: "Заказчики",    icon: "Building2" },
  { id: "contractors", label: "Исполнители",  icon: "HardHat"   },
  { id: "licenses",    label: "Лицензии",     icon: "FileKey"   },
  { id: "contracts",   label: "Контракты",    icon: "FileText"  },
];

const SOON_ITEMS: { icon: string; label: string }[] = [
  { icon: "FileOutput", label: "Экспорт PDF"   },
  { icon: "Table",      label: "Экспорт Excel" },
  { icon: "Bell",       label: "Уведомления"   },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Index() {
  const [section, setSection] = useState<Section>("reports");
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  const [customers,    setCustomers]    = useLocalStorage<Customer[]>  ("geo_customers",    INIT_CUSTOMERS);
  const [contractors,  setContractors]  = useLocalStorage<Contractor[]>("geo_contractors",  INIT_CONTRACTORS);
  const [licenses,     setLicenses]     = useLocalStorage<License[]>   ("geo_licenses",     INIT_LICENSES);
  const [contracts,    setContracts]    = useLocalStorage<Contract[]>  ("geo_contracts",    INIT_CONTRACTS);
  const [reports,      setReports]      = useLocalStorage<ReportData[]>("geo_reports",      INIT_REPORTS);

  const openReport = reports.find((r) => r.id === openReportId);

  if (openReport) {
    return (
      <ReportPage
        report={openReport}
        customers={customers}
        contractors={contractors}
        licenses={licenses}
        contracts={contracts}
        onBack={() => setOpenReportId(null)}
        onUpdateReport={(r) => setReports((prev) => prev.map((x) => x.id === r.id ? r : x))}
      />
    );
  }

  const counts: Record<Section, number> = {
    reports:     reports.length,
    customers:   customers.length,
    contractors: contractors.length,
    licenses:    licenses.length,
    contracts:   contracts.length,
  };

  return (
    <div className="min-h-screen bg-background geo-grid-bg flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <Icon name="Mountain" size={18} className="text-geo-amber" />
              <span className="font-display text-lg tracking-[0.15em] uppercase text-foreground">ГеоОтчёт</span>
            </div>
            <span className="hidden sm:block font-mono text-xs text-muted-foreground border border-border px-2 py-0.5">
              ГОСТ Р 53579–2009
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-muted-foreground hidden sm:block">
              {new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-geo-green"></span>
              <span className="font-mono text-xs text-muted-foreground">АКТИВНО</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 border-r border-border bg-card/50 flex-shrink-0 hidden md:flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Справочники</p>
          </div>
          <nav className="flex flex-col p-2 gap-0.5 flex-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 text-left transition-all group border-l-2 ${
                  section === item.id
                    ? "bg-geo-amber/10 text-geo-amber border-geo-amber"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted border-transparent"
                }`}
              >
                <Icon name={item.icon} fallback="Circle" size={14} />
                <span className="text-xs font-display tracking-wider uppercase flex-1">{item.label}</span>
                <span className={`font-mono text-xs tabular-nums ${section === item.id ? "text-geo-amber" : "text-muted-foreground/50"}`}>
                  {String(counts[item.id]).padStart(2, "0")}
                </span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-border space-y-1">
            <p className="font-mono text-xs text-muted-foreground/50 uppercase tracking-widest mb-2">Скоро</p>
            {SOON_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground/30 px-1 py-1 cursor-not-allowed select-none">
                <Icon name={item.icon} fallback="Circle" size={12} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden absolute top-14 left-0 right-0 z-30 border-b border-border bg-card/90 backdrop-blur-sm flex overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-xs font-display tracking-wider uppercase transition-colors border-b-2 ${
                section === item.id ? "text-geo-amber border-geo-amber" : "text-muted-foreground border-transparent"
              }`}
            >
              <Icon name={item.icon} fallback="Circle" size={12} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8 pt-20 md:pt-8">
            {section === "reports"     && <ReportsSection     reports={reports}         setReports={setReports}         customers={customers}   contractors={contractors} licenses={licenses} contracts={contracts} onOpen={setOpenReportId} />}
            {section === "customers"   && <CustomersSection   customers={customers}     setCustomers={setCustomers} />}
            {section === "contractors" && <ContractorsSection contractors={contractors} setContractors={setContractors} />}
            {section === "licenses"    && <LicensesSection    licenses={licenses}       setLicenses={setLicenses}       customers={customers} />}
            {section === "contracts"   && <ContractsSection   contracts={contracts}     setContracts={setContracts} />}
          </div>
        </main>
      </div>

      <footer className="border-t border-border px-6 py-2 flex items-center justify-between bg-card/50 flex-shrink-0">
        <span className="font-mono text-xs text-muted-foreground">Система формирования геологических отчётов</span>
        <span className="font-mono text-xs text-muted-foreground/50">v0.1.0</span>
      </footer>
    </div>
  );
}
