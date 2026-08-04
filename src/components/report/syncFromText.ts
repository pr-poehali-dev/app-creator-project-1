import type { MainSection, TableEntry, Illustration } from "./reportTypes";
import { fetchBlock, saveBlock, type BlockName } from "@/lib/referencesApi";

// ─── Синхронизация таблиц из текста в список таблиц ───────────────────────────
//
// Логика:
// - Проходим по всем блокам type="table" во всех секциях
// - Каждый блок идентифицируется по block.id (он стабилен)
// - В geo_tables_{id} ищем записи с source="text" + sourceBlockId=block.id
//   - Если нашли — обновляем title (caption могло поменяться)
//   - Если не нашли — добавляем новую запись
// - Записи с source="text", которых больше нет в тексте — удаляем
// - Записи без source (добавленные вручную) — не трогаем
// - Перенумеруем: сначала ручные, потом из текста

export interface SyncedTableEntry extends TableEntry {
  source?: "text";
  sourceBlockId?: string;
}

export interface SyncedIllustration extends Illustration {
  source?: "text";
  sourceBlockId?: string;
}

// Списки таблиц и иллюстраций хранятся в общей БД.
// Если блока ещё нет в БД — берём из браузера (перенос старых данных).
async function loadList<T>(block: BlockName, reportId: string, legacyKey: string): Promise<T[]> {
  try {
    const fromDb = await fetchBlock<T[]>(block, reportId);
    if (Array.isArray(fromDb)) return fromDb;
  } catch { /* ignore */ }
  try { return JSON.parse(localStorage.getItem(legacyKey) || "[]"); } catch { return []; }
}

async function saveList(block: BlockName, reportId: string, data: unknown) {
  try { await saveBlock(block, reportId, data); } catch { /* ignore */ }
}

// ─── Таблицы ──────────────────────────────────────────────────────────────────

export async function syncTablesFromText(reportId: string, sections: MainSection[]) {
  const existing = await loadList<SyncedTableEntry>("tables", reportId, `geo_tables_${reportId}`);

  // Собираем все table-блоки из текста (плоский список)
  const textBlocks: { blockId: string; caption: string }[] = [];
  for (const section of sections) {
    for (const block of section.blocks) {
      if (block.type === "table") {
        textBlocks.push({
          blockId: block.id,
          caption: block.tableCaption ?? "",
        });
      }
    }
  }

  const textBlockIds = new Set(textBlocks.map((b) => b.blockId));

  // Оставляем ручные + обновляем/добавляем из текста
  const manual = existing.filter((e) => e.source !== "text");
  const fromText: SyncedTableEntry[] = textBlocks.map((b) => {
    const prev = existing.find((e) => e.source === "text" && e.sourceBlockId === b.blockId);
    return {
      id: prev?.id ?? b.blockId,
      number: 0, // будет переназначен ниже
      title: b.caption || "(без названия)",
      textPage: prev?.textPage ?? "",
      fileUrl: prev?.fileUrl,
      filename: prev?.filename,
      fileType: prev?.fileType,
      uploadedAt: prev?.uploadedAt,
      source: "text",
      sourceBlockId: b.blockId,
    };
  });

  // Удаляем записи из текста, блоков которых больше нет
  // (fromText уже содержит только актуальные)
  void textBlockIds; // используется неявно через filter выше

  // Объединяем и перенумеровываем
  const merged = [...manual, ...fromText].map((e, idx) => ({
    ...e,
    number: idx + 1,
  }));

  await saveList("tables", reportId, merged);
}

// ─── Иллюстрации ──────────────────────────────────────────────────────────────

export async function syncIllustrationsFromText(reportId: string, sections: MainSection[]) {
  const existing = await loadList<SyncedIllustration>("illustrations", reportId, `geo_illustrations_${reportId}`);

  // Собираем все image-блоки с реальным URL
  const textBlocks: { blockId: string; url: string; filename: string; caption: string; uploadedAt: string }[] = [];
  for (const section of sections) {
    for (const block of section.blocks) {
      if (block.type === "image" && block.image?.url) {
        textBlocks.push({
          blockId: block.id,
          url: block.image.url,
          filename: block.image.filename,
          caption: block.image.caption,
          uploadedAt: block.image.uploadedAt,
        });
      }
    }
  }

  const manual = existing.filter((e) => e.source !== "text");
  const fromText: SyncedIllustration[] = textBlocks.map((b) => {
    const prev = existing.find((e) => e.source === "text" && e.sourceBlockId === b.blockId);
    return {
      id: prev?.id ?? b.blockId,
      number: 0,
      title: prev?.title || b.caption || b.filename || "(без названия)",
      url: b.url,
      filename: b.filename,
      textPage: prev?.textPage ?? "",
      uploadedAt: b.uploadedAt,
      source: "text",
      sourceBlockId: b.blockId,
    };
  });

  const merged = [...manual, ...fromText].map((e, idx) => ({
    ...e,
    number: idx + 1,
  }));

  await saveList("illustrations", reportId, merged);
}

// ─── Единая функция синхронизации ─────────────────────────────────────────────

export async function syncAllFromText(reportId: string, sections: MainSection[]) {
  await syncTablesFromText(reportId, sections);
  await syncIllustrationsFromText(reportId, sections);
}