import type { ReportData, Customer, Contractor, License, Contract } from "@/types/geo";
import type {
  LabelData, TitlePageData, AbstractData,
  ContentsEntry, ReferenceEntry, TermEntry,
  TableEntry, TextAppendix, GraphicAppendix,
  IntroBlock, MainSection, WorkMethod,
} from "./reportTypes";

// ─── Типы для данных секций ────────────────────────────────────────────────────

interface PdfData {
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

// ─── Вспомогательные компоненты ───────────────────────────────────────────────

function PdfPage({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`pdf-page ${className}`}>
      {children}
    </div>
  );
}

function PdfSectionTitle({ number, title }: { number?: string; title: string }) {
  return (
    <div style={{ marginBottom: "12px", marginTop: "20px", borderBottom: "1px solid #ccc", paddingBottom: "4px" }}>
      {number && <span style={{ fontWeight: "bold", marginRight: "8px" }}>{number}</span>}
      <span style={{ fontWeight: "bold", fontSize: "13pt" }}>{title}</span>
    </div>
  );
}

// ─── Страница 1: Этикетка ─────────────────────────────────────────────────────

function PdfLabel({ d }: { d: PdfData }) {
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

function PdfTitlePage({ d }: { d: PdfData }) {
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

function PdfAbstract({ d }: { d: PdfData }) {
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

function PdfContents({ d }: { d: PdfData }) {
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

// ─── Текстовая часть ──────────────────────────────────────────────────────────

function PdfTextPart({ d }: { d: PdfData }) {
  const renderIntroBlocks = (blocks: IntroBlock[], baseNum: number) => {
    let subNum = 0;
    return blocks.map((b) => {
      if (b.type === "section") {
        subNum++;
        return (
          <div key={b.id} style={{ margin: "16px 0 8px", fontWeight: "bold", fontSize: "11pt", borderLeft: "3px solid #999", paddingLeft: "8px" }}>
            {baseNum}.{subNum}. {b.sectionTitle}
          </div>
        );
      }
      if (b.type === "text") {
        return (
          <p key={b.id} style={{ margin: "0 0 8px", lineHeight: "1.6", textIndent: "24px", fontSize: "11pt" }}>
            {b.content}
          </p>
        );
      }
      if (b.type === "image" && b.image) {
        return (
          <div key={b.id} style={{ margin: "16px 0", textAlign: "center" }}>
            <img src={b.image.url} alt={b.image.caption} style={{ maxWidth: "100%", maxHeight: "300px" }} />
            {b.image.caption && <div style={{ fontSize: "9pt", color: "#666", marginTop: "4px" }}>{b.image.caption}</div>}
          </div>
        );
      }
      return null;
    });
  };

  const mainSectionCount = d.mainSections.length;
  const conclusionNum = 1 + mainSectionCount + 1;

  return (
    <PdfPage>
      <PdfSectionTitle number="1." title="Введение" />
      {d.introBlocks.length > 0
        ? renderIntroBlocks(d.introBlocks, 1)
        : <p style={{ color: "#999", fontStyle: "italic" }}>Введение не заполнено</p>
      }

      {d.mainSections.map((section, si) => (
        <div key={section.id}>
          <PdfSectionTitle number={`${si + 2}.`} title={section.title} />
          {section.blocks.map((b) => {
            if (b.type === "text") return (
              <p key={b.id} style={{ margin: "0 0 8px", lineHeight: "1.6", textIndent: "24px", fontSize: "11pt" }}>{b.content}</p>
            );
            if (b.type === "image" && b.image) return (
              <div key={b.id} style={{ margin: "16px 0", textAlign: "center" }}>
                <img src={b.image.url} alt={b.image.caption} style={{ maxWidth: "100%", maxHeight: "280px" }} />
                {b.image.caption && <div style={{ fontSize: "9pt", color: "#666", marginTop: "4px" }}>{b.image.caption}</div>}
              </div>
            );
            if (b.type === "table") return (
              <div key={b.id} style={{ margin: "16px 0" }}>
                {b.tableCaption && (
                  <div style={{ fontWeight: "bold", marginBottom: "6px", fontSize: "10pt" }}>
                    {b.tableCaption}
                  </div>
                )}
                {b.tableData ? (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
                    <tbody>
                      {b.tableData.rows.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => {
                            const Tag = cell.isHeader ? "th" : "td";
                            return (
                              <Tag key={ci} style={{
                                border: "1px solid #ccc",
                                padding: "4px 8px",
                                backgroundColor: cell.isHeader ? "#f0f0f0" : "#fff",
                                fontWeight: cell.bold || cell.isHeader ? "bold" : "normal",
                                fontStyle: cell.italic ? "italic" : "normal",
                                textAlign: cell.align ?? (cell.isHeader ? "center" : "left"),
                                verticalAlign: "top",
                              }}>
                                {cell.content || ""}
                              </Tag>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : b.tableContent ? (
                  <div style={{ fontSize: "10pt", whiteSpace: "pre-wrap", border: "1px solid #ddd", padding: "8px" }}>
                    {b.tableContent}
                  </div>
                ) : null}
              </div>
            );
            return null;
          })}
        </div>
      ))}

      <PdfSectionTitle number={`${conclusionNum}.`} title="Заключение" />
      {d.conclusionBlocks.length > 0
        ? renderIntroBlocks(d.conclusionBlocks, conclusionNum)
        : <p style={{ color: "#999", fontStyle: "italic" }}>Заключение не заполнено</p>
      }
    </PdfPage>
  );
}

// ─── Список источников ────────────────────────────────────────────────────────

function PdfReferences({ d }: { d: PdfData }) {
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

// ─── Термины ──────────────────────────────────────────────────────────────────

function PdfTerms({ d }: { d: PdfData }) {
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

// ─── Таблицы ──────────────────────────────────────────────────────────────────

function PdfTables({ d }: { d: PdfData }) {
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

// ─── Текстовые приложения ─────────────────────────────────────────────────────

function PdfTextAppendices({ d }: { d: PdfData }) {
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

// ─── Графические приложения ───────────────────────────────────────────────────

function PdfGraphicAppendices({ d }: { d: PdfData }) {
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

export type { PdfData };