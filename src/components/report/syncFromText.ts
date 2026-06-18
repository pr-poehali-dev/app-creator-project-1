import type { MainSection, TableEntry, Illustration } from "./reportTypes";

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

function loadJson<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}

function saveJson(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Таблицы ──────────────────────────────────────────────────────────────────

export function syncTablesFromText(reportId: string, sections: MainSection[]) {
  const key = `geo_tables_${reportId}`;
  const existing = loadJson<SyncedTableEntry>(key);

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

  saveJson(key, merged);
}

// ─── Иллюстрации ──────────────────────────────────────────────────────────────

export function syncIllustrationsFromText(reportId: string, sections: MainSection[]) {
  const key = `geo_illustrations_${reportId}`;
  const existing = loadJson<SyncedIllustration>(key);

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

  saveJson(key, merged);
}

// ─── Единая функция синхронизации ─────────────────────────────────────────────

export function syncAllFromText(reportId: string, sections: MainSection[]) {
  syncTablesFromText(reportId, sections);
  syncIllustrationsFromText(reportId, sections);
}
