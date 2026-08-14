// Страховка черновиков: несохранённые правки дублируются в браузер,
// чтобы пережить внезапное закрытие вкладки, разряд батареи или сбой сети.
// Это НЕ хранилище данных — только временная копия до записи в БД.

const PREFIX = "geo_draft_backup:";
// Копия старше этого срока считается протухшей и игнорируется
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface BackupEntry<T = unknown> {
  data: T;
  savedAt: number;
}

function keyOf(block: string, reportId: string): string {
  return `${PREFIX}${reportId}:${block}`;
}

/** Сохранить копию несохранённой правки. */
export function backupDraft<T>(block: string, reportId: string, data: T): void {
  try {
    const entry: BackupEntry<T> = { data, savedAt: Date.now() };
    localStorage.setItem(keyOf(block, reportId), JSON.stringify(entry));
  } catch { /* переполнено или недоступно — не критично */ }
}

/** Удалить копию (после успешной записи в БД или отмены правок). */
export function clearDraftBackup(block: string, reportId: string): void {
  try {
    localStorage.removeItem(keyOf(block, reportId));
  } catch { /* ignore */ }
}

/** Прочитать копию, если она свежая. */
export function readDraftBackup<T>(block: string, reportId: string): BackupEntry<T> | null {
  try {
    const raw = localStorage.getItem(keyOf(block, reportId));
    if (!raw) return null;
    const entry = JSON.parse(raw) as BackupEntry<T>;
    if (!entry || typeof entry.savedAt !== "number") return null;
    if (Date.now() - entry.savedAt > MAX_AGE_MS) {
      clearDraftBackup(block, reportId);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

/** Удалить все копии отчёта (например, при его удалении). */
export function clearReportBackups(reportId: string): void {
  try {
    const prefix = `${PREFIX}${reportId}:`;
    Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => localStorage.removeItem(k));
  } catch { /* ignore */ }
}

/** Человекочитаемое время создания копии. */
export function formatBackupTime(savedAt: number): string {
  const d = new Date(savedAt);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `сегодня в ${time}`;
  return `${d.toLocaleDateString("ru-RU", { day: "2-digit", month: "long" })} в ${time}`;
}
