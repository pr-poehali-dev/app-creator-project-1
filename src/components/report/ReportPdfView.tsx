import type { PdfData } from "./PdfPrimitives";
import { PdfLabel, PdfTitlePage, PdfAbstract, PdfContents } from "./PdfFrontPages";
import { PdfTextPart } from "./PdfTextPartPage";
import { PdfTables, PdfTextAppendices, PdfGraphicAppendices, PdfTerms, PdfReferences } from "./PdfAppendixPages";

export type { PdfData };

// ─── Главный компонент ────────────────────────────────────────────────────────

export function ReportPdfView({ data }: { data: PdfData }) {
  return (
    <div id="report-pdf-root" style={{
      fontFamily: "Times New Roman, serif",
      fontSize: "11pt",
      color: "#000",
      backgroundColor: "#fff",
      width: "210mm",
      margin: "0 auto",
      padding: "0",
    }}>
      <PdfLabel d={data} />
      <PdfTitlePage d={data} />
      <PdfAbstract d={data} />
      <PdfContents d={data} />
      {(data.tables.length > 0) && <PdfTables d={data} />}
      {(data.textAppendices.length > 0) && <PdfTextAppendices d={data} />}
      {(data.graphicAppendices.length > 0) && <PdfGraphicAppendices d={data} />}
      {(data.terms.length > 0) && <PdfTerms d={data} />}
      <PdfTextPart d={data} />
      {(data.references.length > 0) && <PdfReferences d={data} />}
    </div>
  );
}
