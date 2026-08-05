// Реестр несохранённых правок.
// Разделы регистрируют здесь свой черновик, чтобы страница отчёта могла
// спросить пользователя при уходе и предупредить при закрытии вкладки.

export interface DraftEntry {
  dirty: boolean;
  save: () => Promise<boolean>;
  revert: () => void;
}

const drafts = new Map<string, DraftEntry>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function registerDraft(key: string, entry: DraftEntry) {
  drafts.set(key, entry);
  notify();
}

export function unregisterDraft(key: string) {
  if (drafts.delete(key)) notify();
}

export function hasUnsaved(): boolean {
  return [...drafts.values()].some((d) => d.dirty);
}

/** Ключи разделов с несохранёнными правками. */
export function dirtyKeys(): string[] {
  return [...drafts.entries()].filter(([, d]) => d.dirty).map(([k]) => k);
}

/** Сохраняет все черновики. Возвращает true, если всё записано успешно. */
export async function saveAllDrafts(): Promise<boolean> {
  const dirty = [...drafts.values()].filter((d) => d.dirty);
  const results = await Promise.all(dirty.map((d) => d.save()));
  return results.every(Boolean);
}

/** Откатывает все черновики к последнему сохранённому состоянию. */
export function revertAllDrafts() {
  drafts.forEach((d) => { if (d.dirty) d.revert(); });
}

export function subscribeDrafts(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** Ключи черновиков (id раздела) → вкладка отчёта, где они правятся. */
const DRAFT_TO_TAB: Record<string, string> = {
  label: "label",
  title_page: "title_page",
  abstract: "abstract",
  study: "study",
  intro: "text_part",
  main_text: "text_part",
  conclusion: "text_part",
};

/** Вкладки отчёта, в которых есть несохранённые правки. */
export function dirtyTabs(): Set<string> {
  const tabs = new Set<string>();
  for (const key of dirtyKeys()) {
    tabs.add(DRAFT_TO_TAB[key] ?? key);
  }
  return tabs;
}