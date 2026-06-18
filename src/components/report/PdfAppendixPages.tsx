import type { PdfData } from "./PdfPrimitives";
import { PdfPage, PdfSectionTitle } from "./PdfPrimitives";

// ─── Список таблиц ────────────────────────────────────────────────────────────

export function PdfTables({ d }: { d: PdfData }) {
  if (!d.tables.length) return null;
  return (
    <PdfPage>
      <PdfSectionTitle title="Список таблиц" />
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ccc" }}>
            <th style={{ padding: "6px 8px", textAlign: "left", width: "40px" }}>№</th>
            <th style={{ padding: "6px 8px", textAlign: "left" }}>Наименование</th>
            <th style={{ padding: "6px 8px", textAlign: "center", width: "80px" }}>Страница</th>
          </tr>
        </thead>
        <tbody>
          {d.tables.map((t) => (
            <tr key={t.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "5px 8px", fontFamily: "monospace" }}>{String(t.number).padStart(2, "0")}</td>
              <td style={{ padding: "5px 8px" }}>{t.title}</td>
              <td style={{ padding: "5px 8px", textAlign: "center", fontFamily: "monospace" }}>{t.textPage || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PdfPage>
  );
}

// ─── Список текстовых приложений ──────────────────────────────────────────────

export function PdfTextAppendices({ d }: { d: PdfData }) {
  if (!d.textAppendices.length) return null;
  return (
    <PdfPage>
      <PdfSectionTitle title="Список текстовых приложений" />
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ccc" }}>
            <th style={{ padding: "6px 8px", textAlign: "left", width: "40px" }}>№</th>
            <th style={{ padding: "6px 8px", textAlign: "left" }}>Наименование</th>
            <th style={{ padding: "6px 8px", textAlign: "center", width: "80px" }}>Страница</th>
          </tr>
        </thead>
        <tbody>
          {d.textAppendices.map((a) => (
            <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "5px 8px", fontFamily: "monospace" }}>{String(a.number).padStart(2, "0")}</td>
              <td style={{ padding: "5px 8px" }}>{a.title}</td>
              <td style={{ padding: "5px 8px", textAlign: "center", fontFamily: "monospace" }}>{a.textPage || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PdfPage>
  );
}

// ─── Список графических приложений ────────────────────────────────────────────

export function PdfGraphicAppendices({ d }: { d: PdfData }) {
  if (!d.graphicAppendices.length) return null;
  return (
    <PdfPage>
      <PdfSectionTitle title="Список графических приложений" />
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ccc" }}>
            <th style={{ padding: "6px 8px", textAlign: "left", width: "40px" }}>№</th>
            <th style={{ padding: "6px 8px", textAlign: "left" }}>Наименование</th>
            <th style={{ padding: "6px 8px", textAlign: "center", width: "100px" }}>Масштаб</th>
          </tr>
        </thead>
        <tbody>
          {d.graphicAppendices.map((a) => (
            <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "5px 8px", fontFamily: "monospace" }}>{String(a.number).padStart(2, "0")}</td>
              <td style={{ padding: "5px 8px" }}>{a.title}</td>
              <td style={{ padding: "5px 8px", textAlign: "center", fontFamily: "monospace" }}>{a.scale || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PdfPage>
  );
}

// ─── Перечень терминов ────────────────────────────────────────────────────────

export function PdfTerms({ d }: { d: PdfData }) {
  if (!d.terms.length) return null;
  return (
    <PdfPage>
      <PdfSectionTitle title="Перечень терминов, сокращений и символов" />
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
        <tbody>
          {d.terms.map((t) => (
            <tr key={t.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "5px 8px", fontWeight: "bold", fontFamily: "monospace", width: "160px", verticalAlign: "top" }}>{t.term}</td>
              <td style={{ padding: "5px 8px", lineHeight: "1.5" }}>{t.definition}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PdfPage>
  );
}

// ─── Список использованных источников ─────────────────────────────────────────

export function PdfReferences({ d }: { d: PdfData }) {
  if (!d.references.length) return null;
  return (
    <PdfPage>
      <PdfSectionTitle title="Список использованных источников" />
      <ol style={{ paddingLeft: "20px", fontSize: "10pt" }}>
        {d.references.map((r) => (
          <li key={r.id} style={{ marginBottom: "8px", lineHeight: "1.5" }}>
            {r.authors && <span style={{ fontWeight: "500" }}>{r.authors}. </span>}
            {r.title}
            {r.kind === "published" && r.publishInfo && <span style={{ color: "#555" }}>. {r.publishInfo}</span>}
            {r.kind === "unpublished" && (
              <span style={{ color: "#555" }}>
                {r.organization && `. ${r.organization}`}
                {r.year && `, ${r.year}`}
                {r.fund && `. ${r.fund}`}
                {r.inventoryNumber && `, № ${r.inventoryNumber}`}
              </span>
            )}
          </li>
        ))}
      </ol>
    </PdfPage>
  );
}
