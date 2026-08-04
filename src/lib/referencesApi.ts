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

export async function deleteReport(id: string): Promise<void> {
  const res = await fetch(API_URL, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resource: "reports", id }),
  });
  if (!res.ok) throw new Error(`Не удалось удалить отчёт: ${res.status}`);
}