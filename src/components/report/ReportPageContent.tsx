import type { ReportData, Customer, Contractor, License, Contract } from "@/types/geo";
import type { TabId, TabDef, LabelData, TitlePageData, AbstractData } from "@/components/report/reportTypes";
import type { BlockCtl } from "@/components/report/useReportPageLogic";
import { SaveBar } from "@/components/report/SaveBar";
import { RecoveryBanner } from "@/components/report/RecoveryBanner";
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
import { ProtocolSection } from "@/components/report/ProtocolSection";
import { CostSection } from "@/components/report/CostSection";
import { TransferActsSection } from "@/components/report/TransferActsSection";
import { TextAppFilesSection } from "@/components/report/TextAppFilesSection";
import { GraphicAppFilesSection } from "@/components/report/GraphicAppFilesSection";

interface ReportPageContentProps {
  report: ReportData;
  contractors: Contractor[];
  customer?: Customer;
  contractor?: Contractor;
  license?: License;
  contract?: Contract;
  activeTab: TabId;
  activeTabDef: TabDef;
  setActiveTab: (tab: TabId) => void;
  onUpdateReport: (r: ReportData) => void;
  labelBlock: BlockCtl<LabelData>;
  titleBlock: BlockCtl<TitlePageData>;
  abstractBlock: BlockCtl<AbstractData>;
  labelData: LabelData;
  setLabelData: React.Dispatch<React.SetStateAction<LabelData>>;
  titleData: TitlePageData;
  setTitleData: React.Dispatch<React.SetStateAction<TitlePageData>>;
  abstractData: AbstractData;
  setAbstractData: React.Dispatch<React.SetStateAction<AbstractData>>;
}

// Содержимое активной вкладки: сам раздел, предложение восстановить
// несохранённые правки и панель сохранения для ручных разделов.
export function ReportPageContent({
  report, contractors, customer, contractor, license, contract,
  activeTab, activeTabDef, setActiveTab, onUpdateReport,
  labelBlock, titleBlock, abstractBlock,
  labelData, setLabelData, titleData, setTitleData, abstractData, setAbstractData,
}: ReportPageContentProps) {
  return (
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
          <IllustrationsSection reportId={report.id} secrecy={report.secrecy} responsible={report.responsible} contractor={contractor} contractors={contractors} />
        ) : activeTab === "tables" ? (
          <TablesSection reportId={report.id} secrecy={report.secrecy} responsible={report.responsible} contractor={contractor} contractors={contractors} />
        ) : activeTab === "text_appendices" ? (
          <TextAppendicesSection reportId={report.id} secrecy={report.secrecy} responsible={report.responsible} contractor={contractor} contractors={contractors} />
        ) : activeTab === "graphic_appendices" ? (
          <GraphicAppendicesSection reportId={report.id} secrecy={report.secrecy} responsible={report.responsible} contractor={contractor} contractors={contractors} />
        ) : activeTab === "terms" ? (
          <TermsSection reportId={report.id} secrecy={report.secrecy} responsible={report.responsible} contractor={contractor} contractors={contractors} />
        ) : activeTab === "text_part" ? (
          <TextPartSection
            reportId={report.id}
            secrecy={report.secrecy}
            responsible={report.responsible}
            contractor={contractor}
            contractors={contractors}
          />
        ) : activeTab === "references" ? (
          <ReferencesSection reportId={report.id} secrecy={report.secrecy} responsible={report.responsible} contractor={contractor} contractors={contractors} />
        ) : activeTab === "metrological" ? (
          <MetrologicalSection reportId={report.id} secrecy={report.secrecy} responsible={report.responsible} contractor={contractor} contractors={contractors} />
        ) : activeTab === "patent" ? (
          <PatentSection reportId={report.id} secrecy={report.secrecy} responsible={report.responsible} contractor={contractor} contractors={contractors} />
        ) : activeTab === "review" ? (
          <ReviewSection reportId={report.id} secrecy={report.secrecy} responsible={report.responsible} contractor={contractor} contractors={contractors} />
        ) : activeTab === "protocol" ? (
          <ProtocolSection reportId={report.id} secrecy={report.secrecy} responsible={report.responsible} contractor={contractor} contractors={contractors} />
        ) : activeTab === "cost" ? (
          <CostSection reportId={report.id} secrecy={report.secrecy} responsible={report.responsible} contractor={contractor} contractors={contractors} />
        ) : activeTab === "transfer_acts" ? (
          <TransferActsSection reportId={report.id} secrecy={report.secrecy} responsible={report.responsible} contractor={contractor} contractors={contractors} />
        ) : activeTab === "text_app_files" ? (
          <TextAppFilesSection reportId={report.id} secrecy={report.secrecy} responsible={report.responsible} contractor={contractor} contractors={contractors} />
        ) : activeTab === "graphic_app_files" ? (
          <GraphicAppFilesSection reportId={report.id} secrecy={report.secrecy} responsible={report.responsible} contractor={contractor} contractors={contractors} />
        ) : activeTab === "task_copy" ? (
          <TaskCopySection reportId={report.id} secrecy={report.secrecy} responsible={report.responsible} contractor={contractor} contractors={contractors} />
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

        {/* Несохранённые правки прошлой сессии — предлагаем восстановить */}
        {activeTab === "label" && labelBlock.recovery && (
          <RecoveryBanner
            savedAt={labelBlock.recovery.savedAt}
            onRestore={labelBlock.restoreBackup}
            onDismiss={labelBlock.dismissBackup}
          />
        )}
        {activeTab === "title_page" && titleBlock.recovery && (
          <RecoveryBanner
            savedAt={titleBlock.recovery.savedAt}
            onRestore={titleBlock.restoreBackup}
            onDismiss={titleBlock.dismissBackup}
          />
        )}
        {activeTab === "abstract" && abstractBlock.recovery && (
          <RecoveryBanner
            savedAt={abstractBlock.recovery.savedAt}
            onRestore={abstractBlock.restoreBackup}
            onDismiss={abstractBlock.dismissBackup}
          />
        )}

        {/* Сохранение раздела: правки уходят в базу только по кнопке */}
        {activeTab === "label" && (
          <SaveBar id="label" dirty={labelBlock.dirty} saving={labelBlock.saving} onSave={labelBlock.save} onRevert={labelBlock.revert} />
        )}
        {activeTab === "title_page" && (
          <SaveBar id="title_page" dirty={titleBlock.dirty} saving={titleBlock.saving} onSave={titleBlock.save} onRevert={titleBlock.revert} />
        )}
        {activeTab === "abstract" && (
          <SaveBar id="abstract" dirty={abstractBlock.dirty} saving={abstractBlock.saving} onSave={abstractBlock.save} onRevert={abstractBlock.revert} />
        )}
      </div>
    </main>
  );
}

export default ReportPageContent;
