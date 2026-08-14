import { useCallback, useEffect, useRef, useState } from "react";
import { fetchBlock, saveBlock, type BlockName } from "./referencesApi";
import { backupDraft, clearDraftBackup, readDraftBackup } from "./draftBackup";

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
  // Найденная копия несохранённых правок (предлагаем восстановить)
  const [recovery, setRecovery] = useState<{ data: T; savedAt: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ready = useRef(false);
  // Последнее сохранённое состояние — для «Отменить» и сравнения
  const savedRef = useRef<T>(initial);
  const valueRef = useRef<T>(initial);
  valueRef.current = value;
  // Правка, ожидающая записи по таймеру (для дозаписи при уходе с раздела)
  const pendingSave = useRef<{ block: BlockName; reportId: string; data: T } | null>(null);
  // Пользователь правил раздел до окончания загрузки
  const touched = useRef(false);

  useEffect(() => {
    let alive = true;
    ready.current = false;
    touched.current = false;
    setDirty(false);
    setLoading(true);

    (async () => {
      try {
        const fromDb = await fetchBlock<T>(block, reportId);
        if (!alive) return;

        if (fromDb !== null && fromDb !== undefined) {
          savedRef.current = fromDb;
          // Если пользователь успел что-то изменить, пока данные грузились,
          // не затираем его правку — помечаем её как несохранённую
          if (touched.current) {
            setDirty(JSON.stringify(valueRef.current) !== JSON.stringify(fromDb));
          } else {
            setValueState(fromDb);
          }
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
          savedRef.current = start;
          if (touched.current) {
            setDirty(JSON.stringify(valueRef.current) !== JSON.stringify(start));
          } else {
            setValueState(start);
          }
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
          // Осталась копия несохранённых правок от прошлой сессии?
          if (manual) {
            const backup = readDraftBackup<T>(block, reportId);
            if (backup && JSON.stringify(backup.data) !== JSON.stringify(savedRef.current)) {
              setRecovery({ data: backup.data, savedAt: backup.savedAt });
            } else if (backup) {
              clearDraftBackup(block, reportId);
            }
          }
          setLoading(false);
          ready.current = true;
        }
      }
    })();

    return () => {
      alive = false;
      // Если осталась незаписанная правка (debounce не успел сработать) —
      // дописываем её, иначе последнее изменение потерялось бы молча
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
        if (pendingSave.current) {
          const { block: b, reportId: r, data } = pendingSave.current;
          pendingSave.current = null;
          void saveBlock(b, r, data).catch(() => { /* ignore */ });
        }
      }
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

      touched.current = true;

      if (ready.current) {
        if (manual) {
          // Правки копятся в черновике — записываем только по кнопке «Сохранить»
          const isDirty = JSON.stringify(next) !== JSON.stringify(savedRef.current);
          setDirty(isDirty);
          // Страховка в браузере на случай внезапного закрытия вкладки
          if (isDirty) backupDraft(block, reportId, next);
          else clearDraftBackup(block, reportId);
        } else {
          if (timer.current) clearTimeout(timer.current);
          setSaving(true);
          pendingSave.current = { block, reportId, data: next };
          timer.current = setTimeout(() => {
            pendingSave.current = null;
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
    // Снимаем отложенную автозапись — сейчас сохраним актуальное значение
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    pendingSave.current = null;
    setSaving(true);
    try {
      await saveBlock(block, reportId, next);
      savedRef.current = next;
      setDirty(false);
      // Данные в базе — страховочная копия больше не нужна
      clearDraftBackup(block, reportId);
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
    clearDraftBackup(block, reportId);
  }, [block, reportId]);

  const restoreBackup = useCallback(() => {
    if (!recovery) return;
    setValueState(recovery.data);
    setDirty(JSON.stringify(recovery.data) !== JSON.stringify(savedRef.current));
    setRecovery(null);
  }, [recovery]);

  const dismissBackup = useCallback(() => {
    clearDraftBackup(block, reportId);
    setRecovery(null);
  }, [block, reportId]);

  return {
    value, setValue, loading, saving, reload, dirty, save, revert,
    recovery, restoreBackup, dismissBackup,
  };
}