import type { WorkMethod } from "./reportTypes";
import type { PdfData } from "./PdfPrimitives";
import { PdfPage, PdfSectionTitle } from "./PdfPrimitives";

// ─── Страница 1: Этикетка ─────────────────────────────────────────────────────

export function PdfLabel({ d }: { d: PdfData }) {
  const licenseStr = d.license
    ? `Лицензия ${d.license.number}`
    : d.contract
    ? `Гос. контракт № ${d.contract.number}`
    : d.report.licenseNumber || "—";

  return (
    <PdfPage>
      <div style={{ textAlign: "right", marginBottom: "24px" }}>
        <div style={{ display: "inline-block", border: "2px solid #333", padding: "4px 12px", fontWeight: "bold", fontSize: "14pt" }}>
          {d.report.secrecy.toUpperCase()}
        </div>
        <div style={{ fontSize: "10pt", marginTop: "4px" }}>
          Экз. № {d.labelData.copyNumber}
        </div>
      </div>

      <div style={{ borderBottom: "1px solid #999", paddingBottom: "8px", marginBottom: "8px" }}>
        <div style={{ fontSize: "9pt", color: "#666" }}>Заказчик работ</div>
        <div style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "12pt" }}>
          {d.customer?.name || "—"}
        </div>
      </div>

      <div style={{ borderBottom: "1px solid #999", paddingBottom: "8px", marginBottom: "8px" }}>
        <div style={{ fontSize: "9pt", color: "#666" }}>Подрядчик–исполнитель работ</div>
        <div style={{ fontStyle: "italic", textTransform: "uppercase", fontSize: "11pt" }}>
          {d.contractor?.name || "—"}
        </div>
      </div>

      <div style={{ borderBottom: "1px solid #999", paddingBottom: "8px", marginBottom: "8px" }}>
        <div style={{ fontSize: "9pt", color: "#666" }}>Ответственный исполнитель</div>
        <div style={{ fontSize: "11pt" }}>
          {d.labelData.responsibleOverride || d.report.responsible || "—"}
        </div>
      </div>

      <div style={{ textAlign: "center", margin: "32px 0", padding: "16px", border: "1px solid #ccc" }}>
        <div style={{ fontSize: "14pt", fontWeight: "bold", lineHeight: "1.5" }}>
          {d.report.title || "—"}
        </div>
      </div>

      <div style={{ borderBottom: "1px solid #999", paddingBottom: "8px", marginBottom: "8px" }}>
        <div style={{ fontSize: "9pt", color: "#666" }}>Лицензия / Контракт</div>
        <div>{licenseStr}</div>
      </div>

      {d.labelData.bookName && (
        <div style={{ marginBottom: "8px" }}>
          <div style={{ fontSize: "9pt", color: "#666" }}>Книга / Папка</div>
          <div>Книга {d.labelData.bookNumber}: {d.labelData.bookName}</div>
        </div>
      )}

      <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between" }}>
        <div>{d.report.place || "—"}</div>
        <div>{d.report.year || "—"}</div>
      </div>

      <div style={{ marginTop: "8px", fontSize: "9pt", color: "#666", textAlign: "center" }}>
        Всего книг: {d.labelData.totalBooks} / Всего папок: {d.labelData.totalFolders}
      </div>
    </PdfPage>
  );
}

// ─── Страница 2: Титульный лист ───────────────────────────────────────────────

export function PdfTitlePage({ d }: { d: PdfData }) {
  return (
    <PdfPage>
      <div style={{ textAlign: "center", borderBottom: "1px solid #999", paddingBottom: "16px", marginBottom: "16px" }}>
        <div style={{ fontSize: "9pt", color: "#666" }}>Министерство / агентство / организация</div>
        <div style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "13pt" }}>
          {d.customer?.name || "—"}
        </div>
      </div>

      <div style={{ textAlign: "center", borderBottom: "1px solid #999", paddingBottom: "16px", marginBottom: "16px" }}>
        <div style={{ fontSize: "9pt", color: "#666" }}>Подрядчик–исполнитель работ</div>
        <div style={{ fontStyle: "italic", textTransform: "uppercase", fontSize: "12pt" }}>
          {d.contractor?.name || "—"}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "9pt", color: "#666" }}>№ гос. регистрации работы</div>
          <div style={{ fontFamily: "monospace" }}>{d.report.govRegNumber || "—"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "9pt", color: "#666" }}>Гриф секретности</div>
          <div style={{ fontWeight: "bold", border: "1px solid #333", padding: "2px 8px", display: "inline-block" }}>
            {d.report.secrecy}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
        <div style={{ width: "45%" }}>
          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>СОГЛАСОВАНО:</div>
          <div style={{ fontSize: "10pt" }}>{d.titleData.approverPosition || "—"}</div>
          <div style={{ marginTop: "16px", borderBottom: "1px solid #333", paddingBottom: "2px" }}>
            {d.titleData.approverName || "________________"}
          </div>
          <div style={{ fontSize: "9pt", color: "#666" }}>{d.titleData.approverDate || "«___» ________ г."}</div>
        </div>
        <div style={{ width: "45%", textAlign: "right" }}>
          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>УТВЕРЖДАЮ:</div>
          <div style={{ fontSize: "10pt" }}>{d.titleData.customerPosition || "—"}</div>
          <div style={{ marginTop: "16px", borderBottom: "1px solid #333", paddingBottom: "2px" }}>
            {d.titleData.customerName || "________________"}
          </div>
          <div style={{ fontSize: "9pt", color: "#666" }}>{d.titleData.customerDate || "«___» ________ г."}</div>
        </div>
      </div>

      <div style={{ textAlign: "center", margin: "32px 0", padding: "16px", border: "2px solid #333" }}>
        <div style={{ fontSize: "15pt", fontWeight: "bold", lineHeight: "1.6" }}>
          {d.report.title || "—"}
        </div>
      </div>

      <div style={{ marginTop: "24px" }}>
        <div style={{ fontSize: "9pt", color: "#666" }}>Ответственный исполнитель</div>
        <div style={{ borderBottom: "1px solid #333", paddingBottom: "2px", display: "inline-block", minWidth: "200px" }}>
          {d.titleData.responsibleOverride || d.report.responsible || "—"}
        </div>
      </div>

      <div style={{ marginTop: "48px", display: "flex", justifyContent: "space-between" }}>
        <div>{d.report.place || "—"}</div>
        <div>{d.report.year || "—"}</div>
      </div>
    </PdfPage>
  );
}

// ─── Реферат ──────────────────────────────────────────────────────────────────

export function PdfAbstract({ d }: { d: PdfData }) {
  const a = d.abstractData;
  return (
    <PdfPage>
      <PdfSectionTitle title="Реферат" />

      <div style={{ fontSize: "10pt", marginBottom: "16px", lineHeight: "1.5" }}>
        <strong>{a.bibAuthors || "—"}. </strong>
        {a.bibTitle || d.report.title}.
        {a.bibPlace ? ` ${a.bibPlace},` : ""}
        {a.bibYear ? ` ${a.bibYear}.` : ""}
        {a.bibPages ? ` ${a.bibPages}.` : ""}
        {a.bibTables ? ` ${a.bibTables}.` : ""}
        {a.bibIllustrations ? ` ${a.bibIllustrations}.` : ""}
        {a.bibBibliography ? ` Библиогр.: ${a.bibBibliography}.` : ""}
        {a.bibAppendices ? ` Прил.: ${a.bibAppendices}.` : ""}
        {a.bibCopyNumber ? ` Экз. № ${a.bibCopyNumber}.` : ""}
        {d.report.govRegNumber ? ` № ГР ${d.report.govRegNumber}.` : ""}
      </div>

      {a.fundDeposit && (
        <div style={{ marginBottom: "16px", fontStyle: "italic", fontSize: "10pt" }}>{a.fundDeposit}</div>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px", fontSize: "10pt" }}>
        <tbody>
          {[
            ["Предмет исследований", a.abstractSubject],
            ["Цели работ", a.abstractGoals],
            ["Результаты", a.abstractResults],
            ["Выводы", a.abstractConclusions],
            ["Эффективность", a.abstractEfficiency],
          ].filter(([, v]) => v).map(([label, value]) => (
            <tr key={label} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "6px 8px", fontWeight: "bold", verticalAlign: "top", width: "30%", color: "#555" }}>{label}</td>
              <td style={{ padding: "6px 8px", lineHeight: "1.5" }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {a.methods && a.methods.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "10pt" }}>Методы и объёмы работ:</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ border: "1px solid #ddd", padding: "4px 8px", textAlign: "left" }}>Метод</th>
                <th style={{ border: "1px solid #ddd", padding: "4px 8px", textAlign: "center", width: "80px" }}>Объём</th>
                <th style={{ border: "1px solid #ddd", padding: "4px 8px", textAlign: "center", width: "80px" }}>Ед. изм.</th>
              </tr>
            </thead>
            <tbody>
              {a.methods.map((m: WorkMethod) => (
                <tr key={m.id}>
                  <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>{m.name}</td>
                  <td style={{ border: "1px solid #ddd", padding: "4px 8px", textAlign: "center" }}>{m.volume}</td>
                  <td style={{ border: "1px solid #ddd", padding: "4px 8px", textAlign: "center" }}>{m.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {a.keywords && (
        <div style={{ fontSize: "10pt" }}>
          <strong>Ключевые слова:</strong> {a.keywords}
        </div>
      )}

      {a.composerName && (
        <div style={{ marginTop: "24px", fontSize: "10pt", color: "#666" }}>
          Реферат составил: {a.composerName}
        </div>
      )}
    </PdfPage>
  );
}

// ─── Содержание ───────────────────────────────────────────────────────────────

export function PdfContents({ d }: { d: PdfData }) {
  const pages: Record<string, string> = (() => {
    try { return JSON.parse(localStorage.getItem(`geo_contents_pages_${d.report.id}`) || "{}"); } catch { return {}; }
  })();

  return (
    <PdfPage>
      <PdfSectionTitle title="Содержание" />
      <table style={{ width: "100%", fontSize: "10pt" }}>
        <tbody>
          {d.contents.map((entry) => (
            <tr key={entry.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ padding: "4px 0", paddingLeft: `${entry.level * 16}px`, lineHeight: "1.4" }}>
                {entry.title}
                {entry.note && <span style={{ color: "#999", fontSize: "9pt" }}> ({entry.note})</span>}
              </td>
              <td style={{ padding: "4px 0", textAlign: "right", fontFamily: "monospace", width: "60px", color: "#555" }}>
                {pages[entry.id] || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PdfPage>
  );
}
