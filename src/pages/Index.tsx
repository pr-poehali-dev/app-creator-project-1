import { useState, useEffect } from "react";
import ReportPage from "./ReportPage";
import KitPage from "./KitPage";
import type { ReportData } from "@/types/geo";
import { ReportsSection } from "@/components/geo/ReportsSection";
import { AppHeader, AppFooter } from "./AppHeader";
import { AppSidebar, MobileTabs, ResetConfirmModal } from "./AppSidebar";
import { useReferences } from "@/lib/useReferences";
import Icon from "@/components/ui/icon";
import {
  type Section,
  INIT_REPORTS,
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

// Заполняем тестовые данные один раз при загрузке модуля (до первого рендера),
// чтобы useLocalStorage ниже сразу прочитал актуальные значения.
let seeded = false;
function ensureSeeded() {
  if (seeded) return;
  seeded = true;
  seedReport2();
  seedReport3();
  mergeSeedReports();
}

export default function Index() {
  ensureSeeded();

  const [section, setSection] = useState<Section>("reports");
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  // Внутри открытого комплекта: "kit" — список из 4 элементов, "report" — сам отчёт
  const [kitView, setKitView] = useState<"kit" | "report">("kit");
  const [resetConfirm, setResetConfirm] = useState(false);
  const [reports, setReports] = useLocalStorage<ReportData[]>("geo_reports", INIT_REPORTS);

  // Общая база справочников (PostgreSQL)
  const refs = useReferences();
  const { customers, contractors, licenses, contracts, save, remove, loading } = refs;

  const handleReset = () => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("geo_"))
      .forEach((k) => localStorage.removeItem(k));
    localStorage.setItem("geo_reports", JSON.stringify(INIT_REPORTS));
    seedReport2();
    seedReport3();
    window.location.reload();
  };

  const closeKit = () => { setOpenReportId(null); setKitView("kit"); };
  const openKitById = (id: string) => { setKitView("kit"); setOpenReportId(id); };

  const openReport = reports.find((r) => r.id === openReportId);

  if (openReport) {
    if (kitView === "report") {
      return (
        <ReportPage
          report={openReport}
          customers={customers}
          contractors={contractors}
          licenses={licenses}
          contracts={contracts}
          onBack={() => setKitView("kit")}
          onUpdateReport={(r) => setReports((prev) => prev.map((x) => x.id === r.id ? r : x))}
        />
      );
    }
    return (
      <KitPage
        report={openReport}
        customers={customers}
        contractors={contractors}
        licenses={licenses}
        contracts={contracts}
        refsLoading={loading}
        onSaveRef={save}
        onDeleteRef={remove}
        onBack={closeKit}
        onOpenReport={() => setKitView("report")}
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
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono mb-4">
                <Icon name="Loader2" size={14} className="animate-spin" />
                Загрузка общей базы справочников…
              </div>
            )}
            <ReportsSection
              reports={reports}
              setReports={setReports}
              customers={customers}
              contractors={contractors}
              licenses={licenses}
              contracts={contracts}
              onOpen={openKitById}
            />
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
