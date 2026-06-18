import type { ReportData, Customer, Contractor, License, Contract } from "@/types/geo";
import type {
  LabelData, TitlePageData, AbstractData,
  ContentsEntry, ReferenceEntry, TermEntry,
  TableEntry, TextAppendix, GraphicAppendix,
  IntroBlock, MainSection,
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
