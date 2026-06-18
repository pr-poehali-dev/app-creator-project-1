import { useState, useEffect } from "react";
import ReportPage from "./ReportPage";
import type { Customer, Contractor, License, Contract, ReportData } from "@/types/geo";
import { CustomersSection, ContractorsSection } from "@/components/geo/CustomersSections";
import { LicensesSection, ContractsSection } from "@/components/geo/LicensesContracts";
import { ReportsSection } from "@/components/geo/ReportsSection";
import { AppHeader, AppFooter } from "./AppHeader";
import { AppSidebar, MobileTabs, ResetConfirmModal } from "./AppSidebar";
import {
  type Section,
  INIT_CUSTOMERS, INIT_CONTRACTORS, INIT_LICENSES, INIT_CONTRACTS, INIT_REPORTS,
  seedReport2, seedReport3, mergeSeedReports,
} from "./initData";

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

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Index() {
  // Заполняем данные тестовых отчётов один раз при первом запуске
  seedReport2();
  seedReport3();
  // Добавляем недостающие seed-отчёты в сохранённый список (для уже опубликованных версий)
  mergeSeedReports();

  const [section, setSection] = useState<Section>("reports");
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [customers,    setCustomers]    = useLocalStorage<Customer[]>  ("geo_customers",    INIT_CUSTOMERS);
  const [contractors,  setContractors]  = useLocalStorage<Contractor[]>("geo_contractors",  INIT_CONTRACTORS);
  const [licenses,     setLicenses]     = useLocalStorage<License[]>   ("geo_licenses",     INIT_LICENSES);
  const [contracts,    setContracts]    = useLocalStorage<Contract[]>  ("geo_contracts",    INIT_CONTRACTS);
  const [reports,      setReports]      = useLocalStorage<ReportData[]>("geo_reports",      INIT_REPORTS);

  const handleReset = () => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("geo_"))
      .forEach((k) => localStorage.removeItem(k));
    localStorage.setItem("geo_customers",   JSON.stringify(INIT_CUSTOMERS));
    localStorage.setItem("geo_contractors", JSON.stringify(INIT_CONTRACTORS));
    localStorage.setItem("geo_licenses",    JSON.stringify(INIT_LICENSES));
    localStorage.setItem("geo_contracts",   JSON.stringify(INIT_CONTRACTS));
    localStorage.setItem("geo_reports",     JSON.stringify(INIT_REPORTS));
    seedReport2();
    seedReport3();
    window.location.reload();
  };

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
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          section={section}
          counts={counts}
          onSectionChange={setSection}
          onResetRequest={() => setResetConfirm(true)}
        />

        <MobileTabs section={section} onSectionChange={setSection} />

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

      <AppFooter />

      {resetConfirm && (
        <ResetConfirmModal
          onConfirm={handleReset}
          onCancel={() => setResetConfirm(false)}
        />
      )}
    </div>
  );
}