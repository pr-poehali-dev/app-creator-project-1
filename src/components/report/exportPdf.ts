import type { ReportData, Customer, Contractor, License, Contract } from "@/types/geo";
import type { LabelData, TitlePageData, AbstractData, IntroBlock, MainSection, ReferenceEntry, TermEntry, TableEntry, TextAppendix, GraphicAppendix } from "./reportTypes";
import { DEFAULT_LABEL, DEFAULT_TITLE_PAGE, DEFAULT_ABSTRACT } from "./reportTypes";
import { buildContents } from "./ContentsSection";
import type { PdfData } from "./ReportPdfView";

function loadJson<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function collectPdfData(
  report: ReportData,
  customers: Customer[],
  contractors: Contractor[],
  licenses: License[],
  contracts: Contract[],
): PdfData {
  const id = report.id;
  const customer   = customers.find((c) => c.id === report.customerId);
  const contractor = contractors.find((c) => c.id === report.contractorId);
  const license    = licenses.find((l) => l.id === report.licenseId);
  const contract   = contracts.find((c) => c.id === report.contractId);

  const labelData    = loadJson<LabelData>(`geo_label_${id}`, DEFAULT_LABEL);
  const titleData    = loadJson<TitlePageData>(`geo_title_${id}`, DEFAULT_TITLE_PAGE);
  const abstractData = loadJson<AbstractData>(`geo_abstract_${id}`, DEFAULT_ABSTRACT);

  const contents        = buildContents(id, report, contractor, contractors);
  const references      = loadJson<ReferenceEntry[]>(`geo_references_${id}`, []);
  const terms           = loadJson<TermEntry[]>(`geo_terms_${id}`, []);
  const tables          = loadJson<TableEntry[]>(`geo_tables_${id}`, []);
  const textAppendices  = loadJson<TextAppendix[]>(`geo_text_appendices_${id}`, []);
  const graphicAppendices = loadJson<GraphicAppendix[]>(`geo_graphic_appendices_${id}`, []);
  const introBlocks     = loadJson<IntroBlock[]>(`geo_intro_${id}`, []);
  const mainSections    = loadJson<MainSection[]>(`geo_main_text_${id}`, []);
  const conclusionBlocks = loadJson<IntroBlock[]>(`geo_conclusion_${id}`, []);

  return {
    report, customer, contractor, license, contract,
    labelData, titleData, abstractData,
    contents, references, terms, tables,
    textAppendices, graphicAppendices,
    introBlocks, mainSections, conclusionBlocks,
  };
}

export async function exportToPdf(data: PdfData): Promise<void> {
  const html2pdf = (await import("html2pdf.js")).default;

  // Создаём временный div вне DOM
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "210mm";
  container.style.backgroundColor = "#fff";
  container.style.fontFamily = "Times New Roman, serif";
  container.style.fontSize = "11pt";
  container.style.color = "#000";
  document.body.appendChild(container);

  // Динамически рендерим через React
  const { createRoot } = await import("react-dom/client");
  const { createElement } = await import("react");
  const { ReportPdfView } = await import("./ReportPdfView");

  const root = createRoot(container);
  root.render(createElement(ReportPdfView, { data }));

  // Небольшая пауза чтобы React успел отрендерить
  await new Promise((r) => setTimeout(r, 400));

  const filename = `${data.report.title || "отчёт"}_${data.report.year || ""}.pdf`
    .replace(/[^\wА-яЁё\s\-.]/gi, "")
    .replace(/\s+/g, "_")
    .slice(0, 120);

  const opt = {
    margin: [15, 15, 15, 20], // top, right, bottom, left (мм)
    filename,
    image: { type: "jpeg", quality: 0.95 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"], before: ".pdf-page" },
  };

  await html2pdf().set(opt).from(container).save();

  root.unmount();
  document.body.removeChild(container);
}