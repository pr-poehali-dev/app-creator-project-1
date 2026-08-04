import { useCallback, useEffect, useRef, useState } from "react";
import type { ReportData } from "@/types/geo";
import { fetchReports, saveReport, deleteReport } from "./referencesApi";

const MIGRATED_FLAG = "geo_reports_migrated_v1";

// Хук хранения отчётов в общей БД. Возвращает [reports, setReports] с той же
// сигнатурой, что и useState, но синхронизирует изменения с БД (diff → upsert/delete).
// При первом запуске переносит существующие отчёты из localStorage (geo_reports) в БД.
export function useReports(seed: ReportData[]) {
  const [reports, setReportsState] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reportsRef = useRef<ReportData[]>([]);
  reportsRef.current = reports;

  // Первичная загрузка + автомиграция из браузера
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        let dbReports = await fetchReports();

        if (!localStorage.getItem(MIGRATED_FLAG)) {
          // Собираем локальные отчёты: seed + то, что уже введено в браузере
          let local: ReportData[] = [];
          try {
            const stored = localStorage.getItem("geo_reports");
            if (stored) local = JSON.parse(stored) as ReportData[];
          } catch { /* ignore */ }
          const byId = new Map<string, ReportData>();
          for (const r of seed) byId.set(r.id, r);
          for (const r of local) byId.set(r.id, r);
          const dbIds = new Set(dbReports.map((r) => r.id));
          const toUpload = [...byId.values()].filter((r) => !dbIds.has(r.id));
          for (const r of toUpload) {
            const saved = await saveReport(r);
            dbReports.push(saved);
          }
          localStorage.setItem(MIGRATED_FLAG, "1");
        }

        if (alive) setReportsState(dbReports);
      } catch (e) {
        if (alive) setError(String((e as Error)?.message || e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // setReports с той же сигнатурой useState + синхронизация diff в БД
  const setReports = useCallback((update: React.SetStateAction<ReportData[]>) => {
    setReportsState((prev) => {
      const next = typeof update === "function"
        ? (update as (p: ReportData[]) => ReportData[])(prev)
        : update;

      const prevById = new Map(prev.map((r) => [r.id, r]));
      const nextById = new Map(next.map((r) => [r.id, r]));

      // upsert новых/изменённых
      for (const r of next) {
        const before = prevById.get(r.id);
        if (!before || JSON.stringify(before) !== JSON.stringify(r)) {
          saveReport(r).catch((e) => setError(String((e as Error)?.message || e)));
        }
      }
      // удаление отсутствующих
      for (const r of prev) {
        if (!nextById.has(r.id)) {
          deleteReport(r.id).catch((e) => setError(String((e as Error)?.message || e)));
        }
      }
      return next;
    });
  }, []);

  return { reports, setReports, loading, error };
}
