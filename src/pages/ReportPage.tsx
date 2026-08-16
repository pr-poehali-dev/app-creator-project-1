import type { ReportData, Customer, Contractor, License, Contract } from "@/types/geo";
import { saveAllDrafts, revertAllDrafts } from "@/lib/draftRegistry";
import { UnsavedChangesModal } from "@/components/report/UnsavedChangesModal";
import { useReportPageLogic } from "@/components/report/useReportPageLogic";
import { ReportPageHeader } from "@/components/report/ReportPageHeader";
import { ReportSidebar, ReportMetaBar, ReportMobileTabs, ReportBottomNav } from "@/components/report/ReportPageNav";
import { ReportPageContent } from "@/components/report/ReportPageContent";

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
  const {
    activeTab, setActiveTab, activeTabDef, activeIdx,
    dirty,
    pdfExporting, pdfError, handleExportPdf,
    kitBuilding, kitResult, setKitResult, handleBuildPrintKit,
    savingAll, savedAll, saveAllFailed, handleSaveAll,
    pendingNav, setPendingNav, handleBack,
    labelBlock, titleBlock, abstractBlock,
    labelData, setLabelData,
    titleData, setTitleData,
    abstractData, setAbstractData,
    customer, contractor, license, contract,
  } = useReportPageLogic({ report, customers, contractors, licenses, contracts, onBack });

  return (
    <div className="min-h-screen bg-background geo-grid-bg flex flex-col">
      {/* Top bar */}
      <ReportPageHeader
        report={report}
        dirtySize={dirty.size}
        savingAll={savingAll}
        savedAll={savedAll}
        saveAllFailed={saveAllFailed}
        onSaveAll={handleSaveAll}
        onBack={handleBack}
        pdfExporting={pdfExporting}
        onExportPdf={handleExportPdf}
        kitBuilding={kitBuilding}
        onBuildPrintKit={handleBuildPrintKit}
        kitResult={kitResult}
        onHideKitResult={() => setKitResult(null)}
        pdfError={pdfError}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <ReportSidebar activeTab={activeTab} setActiveTab={setActiveTab} dirty={dirty} />

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Meta bar */}
          <ReportMetaBar
            report={report}
            customer={customer}
            contractor={contractor}
            license={license}
            contract={contract}
          />

          {/* Mobile tabs */}
          <ReportMobileTabs activeTab={activeTab} setActiveTab={setActiveTab} dirty={dirty} />

          {/* Content */}
          <ReportPageContent
            report={report}
            contractors={contractors}
            customer={customer}
            contractor={contractor}
            license={license}
            contract={contract}
            activeTab={activeTab}
            activeTabDef={activeTabDef}
            setActiveTab={setActiveTab}
            onUpdateReport={onUpdateReport}
            labelBlock={labelBlock}
            titleBlock={titleBlock}
            abstractBlock={abstractBlock}
            labelData={labelData}
            setLabelData={setLabelData}
            titleData={titleData}
            setTitleData={setTitleData}
            abstractData={abstractData}
            setAbstractData={setAbstractData}
          />

          {/* Bottom nav */}
          <ReportBottomNav activeIdx={activeIdx} setActiveTab={setActiveTab} />
        </div>
      </div>

      {pendingNav && (
        <UnsavedChangesModal
          onSave={async () => {
            const ok = await saveAllDrafts();
            if (ok) { pendingNav(); setPendingNav(null); }
          }}
          onDiscard={() => { revertAllDrafts(); pendingNav(); setPendingNav(null); }}
          onStay={() => setPendingNav(null)}
        />
      )}
    </div>
  );
}
