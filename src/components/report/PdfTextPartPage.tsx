import type { IntroBlock, MainSection } from "./reportTypes";
import type { PdfData } from "./PdfPrimitives";
import { PdfPage, PdfSectionTitle } from "./PdfPrimitives";

// ─── Рендерер блоков введения / заключения ────────────────────────────────────

function renderIntroBlocks(blocks: IntroBlock[], baseNum: number) {
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
}

// ─── Рендерер блоков основной части ──────────────────────────────────────────

function renderMainSection(section: MainSection) {
  return section.blocks.map((b) => {
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
  });
}

// ─── Текстовая часть (Введение + Основная + Заключение) ───────────────────────

export function PdfTextPart({ d }: { d: PdfData }) {
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
          {renderMainSection(section)}
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
