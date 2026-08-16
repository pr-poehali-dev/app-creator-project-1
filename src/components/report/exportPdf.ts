import type { ReportData, Customer, Contractor, License, Contract } from "@/types/geo";
import type { LabelData, TitlePageData, AbstractData, IntroBlock, MainSection, ReferenceEntry, TermEntry, TableEntry, TextAppendix, GraphicAppendix } from "./reportTypes";
import { DEFAULT_LABEL, DEFAULT_TITLE_PAGE, DEFAULT_ABSTRACT } from "./reportTypes";
import { buildContentsAsync } from "./ContentsSection";
import { fetchBlock, type BlockName } from "@/lib/referencesApi";
import type { PdfData } from "./ReportPdfView";

// Данные для PDF берём из общей БД, при недоступности — из браузера
async function loadJson<T>(block: BlockName, id: string, legacyKey: string, fallback: T): Promise<T> {
  try {
    const v = await fetchBlock<T>(block, id);
    if (v !== null && v !== undefined) return v;
  } catch { /* ignore */ }
  try {
    const v = localStorage.getItem(`${legacyKey}_${id}`);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export async function collectPdfData(
  report: ReportData,
  customers: Customer[],
  contractors: Contractor[],
  licenses: License[],
  contracts: Contract[],
): Promise<PdfData> {
  const id = report.id;
  const customer   = customers.find((c) => c.id === report.customerId);
  const contractor = contractors.find((c) => c.id === report.contractorId);
  const license    = licenses.find((l) => l.id === report.licenseId);
  const contract   = contracts.find((c) => c.id === report.contractId);

  const [
    labelData, titleData, abstractData,
    references, terms, tables, textAppendices, graphicAppendices,
    introBlocks, mainSections, conclusionBlocks,
  ] = await Promise.all([
    loadJson<LabelData>("label", id, "geo_label", DEFAULT_LABEL),
    loadJson<TitlePageData>("title_page", id, "geo_title", DEFAULT_TITLE_PAGE),
    loadJson<AbstractData>("abstract", id, "geo_abstract", DEFAULT_ABSTRACT),
    loadJson<ReferenceEntry[]>("references", id, "geo_references", []),
    loadJson<TermEntry[]>("terms", id, "geo_terms", []),
    loadJson<TableEntry[]>("tables", id, "geo_tables", []),
    loadJson<TextAppendix[]>("text_appendices", id, "geo_text_appendices", []),
    loadJson<GraphicAppendix[]>("graphic_appendices", id, "geo_graphic_appendices", []),
    loadJson<IntroBlock[]>("intro", id, "geo_intro", []),
    loadJson<MainSection[]>("main_text", id, "geo_main_text", []),
    loadJson<IntroBlock[]>("conclusion", id, "geo_conclusion", []),
  ]);

  const contentsPages = await loadJson<Record<string, string>>(
    "contents_pages", id, "geo_contents_pages", {},
  );

  const contents = await buildContentsAsync(id, report, contractor, contractors);

  return {
    report, customer, contractor, license, contract,
    labelData, titleData, abstractData,
    contents, references, terms, tables,
    textAppendices, graphicAppendices,
    introBlocks, mainSections, conclusionBlocks,
    contentsPages,
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

  // Обрезаем название, а не имя целиком — иначе у длинных заголовков
  // отсекается расширение и файл сохраняется без .pdf
  const base = `${data.report.title || "отчёт"}_${data.report.year || ""}`
    .replace(/[^\wА-яЁё\s\-.]/gi, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 110);
  const filename = `${base || "отчёт"}.pdf`;

  const opt = {
    margin: [15, 15, 15, 20] as [number, number, number, number], // top, right, bottom, left (мм)
    filename,
    image: { type: "jpeg" as const, quality: 0.95 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
    },
    jsPDF: {
      unit: "mm" as const,
      format: "a4",
      orientation: "portrait" as const,
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"], before: ".pdf-page" },
  };

  try {
    await html2pdf().set(opt).from(container).save();
  } finally {
    // Убираем временный блок в любом случае: иначе после сбоя он остаётся
    // висеть в странице и тянет память при повторных попытках
    root.unmount();
    container.remove();
  }
}