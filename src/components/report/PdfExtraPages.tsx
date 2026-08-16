import type { PdfData } from "./PdfPrimitives";
import { PdfPage, PdfSectionTitle } from "./PdfPrimitives";

// Разделы-вложения: сам файл лежит отдельно, в отчёт выводим опись —
// что приложено, под каким именем и когда загружено.

const th: React.CSSProperties = { padding: "6px 8px", textAlign: "left" };
const td: React.CSSProperties = { padding: "5px 8px" };
const mono: React.CSSProperties = { fontFamily: "monospace" };
const headRow: React.CSSProperties = { backgroundColor: "#f5f5f5", borderBottom: "2px solid #ccc" };
const bodyRow: React.CSSProperties = { borderBottom: "1px solid #eee" };
const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: "10pt" };

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("ru-RU");
}

function NoteLine({ text }: { text: string }) {
  return (
    <p style={{ fontSize: "10pt", color: "#555", marginTop: "10px", lineHeight: 1.5 }}>{text}</p>
  );
}

// ─── Список исполнителей ──────────────────────────────────────────────────────

export function PdfExecutors({ d }: { d: PdfData }) {
  const list = d.contractor?.executors ?? [];
  if (!list.length) return null;
  return (
    <PdfPage>
      <PdfSectionTitle title="Список исполнителей" />
      {d.contractor?.name && (
        <p style={{ fontSize: "10pt", marginBottom: "10px" }}>
          Организация-исполнитель: <strong>{d.contractor.name}</strong>
        </p>
      )}
      <table style={tableStyle}>
        <thead>
          <tr style={headRow}>
            <th style={{ ...th, width: "40px" }}>№</th>
            <th style={th}>Фамилия, инициалы</th>
            <th style={th}>Должность</th>
            <th style={{ ...th, width: "120px" }}>Уч. степень</th>
          </tr>
        </thead>
        <tbody>
          {list.map((e, i) => (
            <tr key={e.id || i} style={bodyRow}>
              <td style={{ ...td, ...mono }}>{String(i + 1).padStart(2, "0")}</td>
              <td style={td}>{[e.lastName, e.initials].filter(Boolean).join(" ") || "—"}</td>
              <td style={td}>{e.position || "—"}</td>
              <td style={td}>{e.degree || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {d.contractor?.chiefGeologist && (
        <NoteLine text={`Главный геолог: ${d.contractor.chiefGeologist}`} />
      )}
    </PdfPage>
  );
}

// ─── Список иллюстраций ───────────────────────────────────────────────────────

export function PdfIllustrations({ d }: { d: PdfData }) {
  if (!d.illustrations?.length) return null;
  return (
    <PdfPage>
      <PdfSectionTitle title="Список иллюстраций" />
      <table style={tableStyle}>
        <thead>
          <tr style={headRow}>
            <th style={{ ...th, width: "40px" }}>№</th>
            <th style={th}>Наименование</th>
            <th style={{ ...th, textAlign: "center", width: "80px" }}>Страница</th>
          </tr>
        </thead>
        <tbody>
          {d.illustrations.map((il) => (
            <tr key={il.id} style={bodyRow}>
              <td style={{ ...td, ...mono }}>{String(il.number).padStart(2, "0")}</td>
              <td style={td}>{il.title || "—"}</td>
              <td style={{ ...td, ...mono, textAlign: "center" }}>{il.textPage || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PdfPage>
  );
}

// ─── Метрологическая экспертиза ───────────────────────────────────────────────

export function PdfMetrological({ d }: { d: PdfData }) {
  const m = d.metrological;
  const conclusions = m?.conclusions ?? [];
  const hasCert = Boolean(m?.certificateFile);
  if (!conclusions.length && !hasCert) return null;

  return (
    <PdfPage>
      <PdfSectionTitle title="Заключение о метрологической экспертизе" />
      {m?.type === "certificate" ? (
        <>
          <p style={{ fontSize: "10pt", marginBottom: "8px" }}>
            Представлено свидетельство о метрологической аттестации.
          </p>
          {m.certificateFile && (
            <table style={tableStyle}>
              <tbody>
                <tr style={bodyRow}>
                  <td style={{ ...td, width: "160px", fontWeight: "bold" }}>Файл</td>
                  <td style={td}>{m.certificateFile.filename || "—"}</td>
                </tr>
                <tr style={bodyRow}>
                  <td style={{ ...td, fontWeight: "bold" }}>Загружен</td>
                  <td style={{ ...td, ...mono }}>{fmtDate(m.certificateFile.uploadedAt)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr style={headRow}>
              <th style={{ ...th, width: "40px" }}>№</th>
              <th style={th}>Наименование заключения</th>
              <th style={{ ...th, width: "150px" }}>Файл</th>
            </tr>
          </thead>
          <tbody>
            {conclusions.map((c, i) => (
              <tr key={c.id || i} style={bodyRow}>
                <td style={{ ...td, ...mono }}>{String(i + 1).padStart(2, "0")}</td>
                <td style={td}>{c.label || "—"}</td>
                <td style={{ ...td, fontSize: "9pt" }}>{c.file?.filename || "не приложен"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </PdfPage>
  );
}

// ─── Одиночное вложение: патенты, протокол, справка о стоимости ───────────────

function SingleFilePage({ title, file, note }: {
  title: string;
  file?: { filename?: string; uploadedAt?: string } | null;
  note: string;
}) {
  if (!file) return null;
  return (
    <PdfPage>
      <PdfSectionTitle title={title} />
      <table style={tableStyle}>
        <tbody>
          <tr style={bodyRow}>
            <td style={{ ...td, width: "160px", fontWeight: "bold" }}>Документ</td>
            <td style={td}>{file.filename || "—"}</td>
          </tr>
          <tr style={bodyRow}>
            <td style={{ ...td, fontWeight: "bold" }}>Дата приобщения</td>
            <td style={{ ...td, ...mono }}>{fmtDate(file.uploadedAt)}</td>
          </tr>
        </tbody>
      </table>
      <NoteLine text={note} />
    </PdfPage>
  );
}

export function PdfTaskCopy({ d }: { d: PdfData }) {
  return (
    <SingleFilePage
      title="Копия геологического (технического) задания"
      file={d.taskFile}
      note="Задание (контракт, договор) приобщено к отчёту отдельным файлом."
    />
  );
}

export function PdfPatent({ d }: { d: PdfData }) {
  return (
    <SingleFilePage
      title="Заключение о патентных исследованиях"
      file={d.patent}
      note="Документ приобщён к отчёту отдельным файлом."
    />
  );
}

export function PdfProtocol({ d }: { d: PdfData }) {
  return (
    <SingleFilePage
      title="Протокол рассмотрения (принятия) отчёта"
      file={d.protocol}
      note="Документ приобщён к отчёту отдельным файлом."
    />
  );
}

export function PdfCost({ d }: { d: PdfData }) {
  return (
    <SingleFilePage
      title="Справка о стоимости работ"
      file={d.cost}
      note="Документ приобщён к отчёту отдельным файлом."
    />
  );
}

// ─── Списки вложений: рецензии и акты передачи ────────────────────────────────

function FileListPage({ title, items, labelHead, note }: {
  title: string;
  items?: { id: string; label?: string; filename?: string; uploadedAt?: string }[];
  labelHead: string;
  note: string;
}) {
  if (!items?.length) return null;
  return (
    <PdfPage>
      <PdfSectionTitle title={title} />
      <table style={tableStyle}>
        <thead>
          <tr style={headRow}>
            <th style={{ ...th, width: "40px" }}>№</th>
            <th style={th}>{labelHead}</th>
            <th style={{ ...th, width: "150px" }}>Файл</th>
            <th style={{ ...th, width: "90px" }}>Дата</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={it.id || i} style={bodyRow}>
              <td style={{ ...td, ...mono }}>{String(i + 1).padStart(2, "0")}</td>
              <td style={td}>{it.label || "—"}</td>
              <td style={{ ...td, fontSize: "9pt" }}>{it.filename || "—"}</td>
              <td style={{ ...td, ...mono, fontSize: "9pt" }}>{fmtDate(it.uploadedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <NoteLine text={note} />
    </PdfPage>
  );
}

export function PdfReviews({ d }: { d: PdfData }) {
  return (
    <FileListPage
      title="Рецензия (рецензии)"
      items={d.reviews}
      labelHead="Рецензент / наименование"
      note="Рецензии приобщены к отчёту отдельными файлами."
    />
  );
}

export function PdfTransferActs({ d }: { d: PdfData }) {
  return (
    <FileListPage
      title="Копии актов передачи вещественных источников"
      items={d.transferActs}
      labelHead="Наименование акта"
      note="Акты приобщены к отчёту отдельными файлами."
    />
  );
}