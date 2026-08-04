import type { Customer, Contractor, License, Contract, ReportData } from "@/types/geo";

// Общая база справочников (PostgreSQL) через cloud function
const API_URL = "https://functions.poehali.dev/23734698-911f-4d95-b901-0a3218b70480";

export type RefKind = "customers" | "contractors" | "licenses" | "contracts";

export interface ReferencesData {
  customers: Customer[];
  contractors: Contractor[];
  licenses: License[];
  contracts: Contract[];
}

export async function fetchReferences(): Promise<ReferencesData> {
  const res = await fetch(API_URL, { method: "GET" });
  if (!res.ok) throw new Error(`Не удалось загрузить справочники: ${res.status}`);
  const data = await res.json();
  return {
    customers: data.customers || [],
    contractors: data.contractors || [],
    licenses: data.licenses || [],
    contracts: data.contracts || [],
  };
}

export async function upsertReference<T extends { id: string }>(kind: RefKind, item: T): Promise<T> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, item }),
  });
  if (!res.ok) throw new Error(`Не удалось сохранить запись: ${res.status}`);
  const data = await res.json();
  return data.item as T;
}

export async function deleteReference(kind: RefKind, id: string): Promise<void> {
  const res = await fetch(API_URL, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, id }),
  });
  if (!res.ok) throw new Error(`Не удалось удалить запись: ${res.status}`);
}

export function makeRefId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ── Паспорт ГКМ ───────────────────────────────────────────────────────────────

export interface PassportRecord {
  reportId: string;
  massif: string;
  data: Record<string, string>;
}

export async function fetchPassport(reportId: string): Promise<PassportRecord | null> {
  const res = await fetch(`${API_URL}?resource=passport&reportId=${encodeURIComponent(reportId)}`, { method: "GET" });
  if (!res.ok) throw new Error(`Не удалось загрузить паспорт: ${res.status}`);
  const data = await res.json();
  return data.passport || null;
}

export async function savePassport(record: PassportRecord): Promise<PassportRecord> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resource: "passport", ...record }),
  });
  if (!res.ok) throw new Error(`Не удалось сохранить паспорт: ${res.status}`);
  const data = await res.json();
  return data.passport as PassportRecord;
}

// ── Отчёты (комплекты) ────────────────────────────────────────────────────────

export async function fetchReports(): Promise<ReportData[]> {
  const res = await fetch(`${API_URL}?resource=reports`, { method: "GET" });
  if (!res.ok) throw new Error(`Не удалось загрузить отчёты: ${res.status}`);
  const data = await res.json();
  return (data.reports || []) as ReportData[];
}

export async function saveReport(report: ReportData): Promise<ReportData> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resource: "reports", item: report }),
  });
  if (!res.ok) throw new Error(`Не удалось сохранить отчёт: ${res.status}`);
  const data = await res.json();
  return data.report as ReportData;
}

// ── Блоки отчёта ──────────────────────────────────────────────────────────────

export type BlockName =
  | "label" | "title_page" | "abstract" | "task_file" | "intro" | "main_text"
  | "conclusion" | "terms" | "references" | "study" | "illustrations" | "tables"
  | "text_appendices" | "graphic_appendices" | "text_app_files" | "graphic_app_files"
  | "metrological" | "patent" | "review" | "protocol" | "cost" | "transfer_acts"
  | "contents_pages" | "contents_custom";

export async function fetchBlock<T>(block: BlockName, reportId: string): Promise<T | null> {
  const url = `${API_URL}?resource=block&block=${block}&reportId=${encodeURIComponent(reportId)}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Не удалось загрузить блок ${block}: ${res.status}`);
  const json = await res.json();
  return (json.data ?? null) as T | null;
}

export async function saveBlock<T>(block: BlockName, reportId: string, data: T): Promise<void> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resource: "block", block, reportId, data }),
  });
  if (!res.ok) throw new Error(`Не удалось сохранить блок ${block}: ${res.status}`);
}

export const ALL_BLOCKS: BlockName[] = [
  "label", "title_page", "abstract", "task_file", "intro", "main_text", "conclusion",
  "terms", "references", "study", "illustrations", "tables", "text_appendices",
  "graphic_appendices", "text_app_files", "graphic_app_files", "metrological", "patent",
  "review", "protocol", "cost", "transfer_acts", "contents_pages", "contents_custom",
];

/** Удаляет все блоки отчёта и его паспорт из БД. */
export async function deleteAllBlocks(reportId: string): Promise<void> {
  await Promise.all([
    ...ALL_BLOCKS.map((block) =>
      fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resource: "block", block, reportId }),
      }).catch(() => undefined),
    ),
    fetch(API_URL, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resource: "passport", reportId }),
    }).catch(() => undefined),
  ]);
}

// Подписи разделов (по вкладкам)
export async function fetchSectionMeta<T>(reportId: string, tabId: string): Promise<T | null> {
  const url = `${API_URL}?resource=section_meta&reportId=${encodeURIComponent(reportId)}&tabId=${encodeURIComponent(tabId)}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Не удалось загрузить подписи: ${res.status}`);
  const json = await res.json();
  return (json.data ?? null) as T | null;
}

export async function saveSectionMeta<T>(reportId: string, tabId: string, data: T): Promise<void> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resource: "section_meta", reportId, tabId, data }),
  });
  if (!res.ok) throw new Error(`Не удалось сохранить подписи: ${res.status}`);
}

export async function deleteReport(id: string): Promise<void> {
  const res = await fetch(API_URL, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resource: "reports", id }),
  });
  if (!res.ok) throw new Error(`Не удалось удалить отчёт: ${res.status}`);
}