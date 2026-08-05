import { useCallback, useEffect, useRef, useState } from "react";
import { fetchBlock, saveBlock, type BlockName } from "./referencesApi";

// Хук хранения блока отчёта в общей БД.
// Если в БД блока ещё нет — переносит данные из localStorage (legacyKey).
//
// Два режима записи:
//  - обычный: правки уходят в БД сами, с задержкой (списки, файлы);
//  - manual: правки копятся в черновике, запись только по save() —
//    для разделов со свободным вводом. dirty показывает наличие
//    несохранённых правок, revert() возвращает последнее сохранённое.
export function useReportBlock<T>(
  block: BlockName,
  reportId: string,
  initial: T,
  legacyKey?: string,
  options?: { manual?: boolean },
) {
  const manual = options?.manual ?? false;

  const [value, setValueState] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ready = useRef(false);
  // Последнее сохранённое состояние — для «Отменить» и сравнения
  const savedRef = useRef<T>(initial);
  const valueRef = useRef<T>(initial);
  valueRef.current = value;

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
          savedRef.current = fromDb;
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
          savedRef.current = start;
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

  // Перечитать блок из БД (например, после внешней синхронизации)
  const reload = useCallback(async () => {
    try {
      const fromDb = await fetchBlock<T>(block, reportId);
      if (fromDb !== null && fromDb !== undefined) setValueState(fromDb);
    } catch { /* ignore */ }
  }, [block, reportId]);

  const setValue = useCallback((update: React.SetStateAction<T>) => {
    setValueState((prev) => {
      const next = typeof update === "function"
        ? (update as (p: T) => T)(prev)
        : update;

      if (ready.current) {
        if (manual) {
          // Правки копятся в черновике — записываем только по кнопке «Сохранить»
          setDirty(JSON.stringify(next) !== JSON.stringify(savedRef.current));
        } else {
          if (timer.current) clearTimeout(timer.current);
          setSaving(true);
          timer.current = setTimeout(() => {
            saveBlock(block, reportId, next)
              .then(() => { savedRef.current = next; })
              .catch(() => { /* ignore */ })
              .finally(() => setSaving(false));
          }, 600);
        }
      }
      return next;
    });
  }, [block, reportId, manual]);

  // Записать черновик в БД
  const save = useCallback(async () => {
    const next = valueRef.current;
    setSaving(true);
    try {
      await saveBlock(block, reportId, next);
      savedRef.current = next;
      setDirty(false);
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }, [block, reportId]);

  // Вернуть последнее сохранённое состояние
  const revert = useCallback(() => {
    setValueState(savedRef.current);
    setDirty(false);
  }, []);

  return { value, setValue, loading, saving, reload, dirty, save, revert };
}