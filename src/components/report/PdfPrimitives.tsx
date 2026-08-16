import type { ReportData, Customer, Contractor, License, Contract } from "@/types/geo";
import type {
  LabelData, TitlePageData, AbstractData,
  ContentsEntry, ReferenceEntry, TermEntry,
  TableEntry, TextAppendix, GraphicAppendix,
  IntroBlock, MainSection, Illustration,
} from "./reportTypes";

// ─── Общий тип PdfData ────────────────────────────────────────────────────────

export interface PdfData {
  report: ReportData;
  customer?: Customer;
  contractor?: Contractor;
  license?: License;
  contract?: Contract;
  labelData: LabelData;
  titleData: TitlePageData;
  abstractData: AbstractData;
  contents: ContentsEntry[];
  references: ReferenceEntry[];
  terms: TermEntry[];
  tables: TableEntry[];
  textAppendices: TextAppendix[];
  graphicAppendices: GraphicAppendix[];
  introBlocks: IntroBlock[];
  mainSections: MainSection[];
  conclusionBlocks: IntroBlock[];
  contentsPages?: Record<string, string>;

  // Разделы-вложения: в PDF выводим опись приложенных документов
  taskFile?: PdfFileRef | null;
  illustrations?: Illustration[];
  metrological?: PdfMetroData;
  patent?: PdfFileRef | null;
  protocol?: PdfFileRef | null;
  cost?: PdfFileRef | null;
  reviews?: PdfLabeledFile[];
  transferActs?: PdfLabeledFile[];
}

export interface PdfFileRef {
  url?: string;
  filename?: string;
  uploadedAt?: string;
}

export interface PdfLabeledFile extends PdfFileRef {
  id: string;
  label?: string;
}

export interface PdfMetroData {
  type?: "conclusion" | "certificate";
  conclusions?: { id: string; label?: string; file?: PdfFileRef }[];
  certificateFile?: PdfFileRef;
}

// ─── Примитивные компоненты ───────────────────────────────────────────────────

export function PdfPage({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`pdf-page ${className}`}>
      {children}
    </div>
  );
}

export function PdfSectionTitle({ number, title }: { number?: string; title: string }) {
  return (
    <div style={{ marginBottom: "12px", marginTop: "20px", borderBottom: "1px solid #ccc", paddingBottom: "4px" }}>
      {number && <span style={{ fontWeight: "bold", marginRight: "8px" }}>{number}</span>}
      <span style={{ fontWeight: "bold", fontSize: "13pt" }}>{title}</span>
    </div>
  );
}