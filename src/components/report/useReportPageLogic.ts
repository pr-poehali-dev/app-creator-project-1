import { useState, useEffect } from "react";
import type { ReportData, Customer, Contractor, License, Contract } from "@/types/geo";
import { TABS, DEFAULT_LABEL, DEFAULT_TITLE_PAGE, DEFAULT_ABSTRACT } from "@/components/report/reportTypes";
import type { TabId, LabelData, TitlePageData, AbstractData } from "@/components/report/reportTypes";
import { collectPdfData, exportToPdf, renderPdfBlob, pdfFileName } from "@/components/report/exportPdf";
import { collectAttachments } from "@/components/report/collectAttachments";
import { mergeReportPdf, type MergeResult } from "@/components/report/mergePdfApi";
import { useReportBlock } from "@/lib/useReportBlock";
import { hasUnsaved, saveAllDrafts } from "@/lib/draftRegistry";
import { useDirtyTabs } from "@/lib/useDirtyTabs";

// Управление разделом: то, что берёт от useReportBlock панель сохранения
// и плашка восстановления несохранённых правок.
export interface BlockCtl<T> {
  recovery: { data: T; savedAt: number } | null;
  restoreBackup: () => void;
  dismissBackup: () => void;
  dirty: boolean;
  saving: boolean;
  save: () => Promise<boolean>;
  revert: () => void;
}

interface UseReportPageLogicArgs {
  report: ReportData;
  customers: Customer[];
  contractors: Contractor[];
  licenses: License[];
  contracts: Contract[];
  onBack: () => void;
}

// Состояние и обработчики страницы отчёта: навигация с защитой от потери
// правок, экспорт PDF, сборка печатного комплекта и блоки ручного сохранения.
export function useReportPageLogic({
  report, customers, contractors, licenses, contracts, onBack,
}: UseReportPageLogicArgs) {
  const [activeTabState, setActiveTabState] = useState<TabId>("label");
  const [pdfExporting, setPdfExporting] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [kitBuilding, setKitBuilding] = useState(false);
  const [kitResult, setKitResult] = useState<MergeResult | null>(null);
  // Отложенный переход: ждём решения пользователя по несохранённым правкам
  const [pendingNav, setPendingNav] = useState<null | (() => void)>(null);
  const activeTab = activeTabState;
  // Вкладки с несохранёнными правками — помечаем точкой
  const dirty = useDirtyTabs();
  const [savingAll, setSavingAll] = useState(false);
  const [savedAll, setSavedAll] = useState(false);
  const [saveAllFailed, setSaveAllFailed] = useState(false);

  // Записать в базу все разделы с изменениями разом
  const handleSaveAll = async () => {
    setSavingAll(true);
    setSaveAllFailed(false);
    let ok = false;
    try { ok = await saveAllDrafts(); } catch { ok = false; }
    setSavingAll(false);
    if (ok) {
      setSavedAll(true);
      setTimeout(() => setSavedAll(false), 2500);
    } else {
      setSaveAllFailed(true);
      setTimeout(() => setSaveAllFailed(false), 4000);
    }
  };

  // Любой переход проверяет несохранённые правки текущего раздела
  const guardNav = (go: () => void) => {
    if (hasUnsaved()) setPendingNav(() => go);
    else go();
  };
  const setActiveTab = (tab: TabId) => guardNav(() => setActiveTabState(tab));
  const handleBack = () => guardNav(onBack);

  // Предупреждение при закрытии вкладки браузера
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsaved()) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const handleExportPdf = async () => {
    setPdfExporting(true);
    setPdfError(null);
    try {
      // PDF собирается из базы, поэтому несохранённые правки сначала записываем —
      // иначе в документ попадёт устаревшая версия разделов
      if (hasUnsaved()) {
        const ok = await saveAllDrafts();
        if (!ok) {
          setPdfError("Не удалось сохранить правки. Экспорт отменён, данные не потеряны.");
          return;
        }
      }
      const data = await collectPdfData(report, customers, contractors, licenses, contracts);
      await exportToPdf(data);
    } catch {
      setPdfError("Не удалось сформировать PDF. Попробуйте ещё раз.");
    } finally {
      setPdfExporting(false);
    }
  };

  // Печатный комплект: отчёт + все приложения (ТЗ, карты, схемы, заключения)
  // подшиваются в один файл на сервере
  const handleBuildPrintKit = async () => {
    setKitBuilding(true);
    setPdfError(null);
    setKitResult(null);
    try {
      if (hasUnsaved()) {
        const ok = await saveAllDrafts();
        if (!ok) {
          setPdfError("Не удалось сохранить правки. Сборка отменена, данные не потеряны.");
          return;
        }
      }
      const data = await collectPdfData(report, customers, contractors, licenses, contracts);
      const attachments = collectAttachments(data);
      const blob = await renderPdfBlob(data);
      const result = await mergeReportPdf(blob, attachments, pdfFileName(data));
      setKitResult(result);
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : "Не удалось собрать комплект.");
    } finally {
      setKitBuilding(false);
    }
  };

  // Блоки хранятся в общей БД. Правки копятся в черновике и уходят в базу
  // только по кнопке «Сохранить» (manual).
  const labelBlock = useReportBlock<LabelData>(
    "label", report.id, DEFAULT_LABEL, `geo_label_${report.id}`, { manual: true },
  );
  const titleBlock = useReportBlock<TitlePageData>(
    "title_page", report.id, DEFAULT_TITLE_PAGE, `geo_title_${report.id}`, { manual: true },
  );
  const abstractBlock = useReportBlock<AbstractData>(
    "abstract", report.id, DEFAULT_ABSTRACT, `geo_abstract_${report.id}`, { manual: true },
  );
  const { value: labelData, setValue: setLabelData } = labelBlock;
  const { value: titleData, setValue: setTitleData } = titleBlock;
  const { value: abstractData, setValue: setAbstractData } = abstractBlock;

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

  return {
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
  };
}
