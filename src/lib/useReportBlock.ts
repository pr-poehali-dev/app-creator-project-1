import { useCallback, useEffect, useRef, useState } from "react";
import { fetchBlock, saveBlock, type BlockName } from "./referencesApi";

// Хук хранения блока отчёта в общей БД.
// Возвращает [value, setValue] с сигнатурой useState + флаг загрузки.
// Если в БД блока ещё нет — переносит данные из localStorage (legacyKey) и сохраняет.
// Сохранение в БД идёт с задержкой (debounce), чтобы не слать запрос на каждый символ.
export function useReportBlock<T>(
  block: BlockName,
  reportId: string,
  initial: T,
  legacyKey?: string,
) {
  const [value, setValueState] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ready = useRef(false);

  useEffect(() => {
    let alive = true;
    ready.current = false;
    setLoading(true);

    (async () => {
      try {
        const fromDb = await fetchBlock<T>(block, reportId);
        if (!alive) return;

        if (fromDb !== null && fromDb !== undefined) {
          setValueState(fromDb);
        } else {
          // Переносим из браузера, если там что-то есть
          let legacy: T | null = null;
          if (legacyKey) {
            try {
              const stored = localStorage.getItem(legacyKey);
              if (stored) legacy = JSON.parse(stored) as T;
            } catch { /* ignore */ }
          }
          const start = legacy ?? initial;
          setValueState(start);
          if (legacy !== null) {
            await saveBlock(block, reportId, legacy);
          }
        }
      } catch {
        // Сеть недоступна — работаем с локальной копией
        if (legacyKey && alive) {
          try {
            const stored = localStorage.getItem(legacyKey);
            if (stored) setValueState(JSON.parse(stored) as T);
          } catch { /* ignore */ }
        }
      } finally {
        if (alive) {
          setLoading(false);
          ready.current = true;
        }
      }
    })();

    return () => {
      alive = false;
      if (timer.current) clearTimeout(timer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block, reportId]);

  const setValue = useCallback((update: React.SetStateAction<T>) => {
    setValueState((prev) => {
      const next = typeof update === "function"
        ? (update as (p: T) => T)(prev)
        : update;

      if (ready.current) {
        if (timer.current) clearTimeout(timer.current);
        setSaving(true);
        timer.current = setTimeout(() => {
          saveBlock(block, reportId, next)
            .catch(() => { /* ignore */ })
            .finally(() => setSaving(false));
        }, 600);
      }
      return next;
    });
  }, [block, reportId]);

  return { value, setValue, loading, saving };
}
