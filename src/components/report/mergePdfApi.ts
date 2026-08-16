import type { Attachment } from "./collectAttachments";

const MERGE_URL = "https://functions.poehali.dev/bde12af1-3668-419e-a68e-60481112abb9";

export interface MergeResult {
  url: string;
  filename: string;
  pages: number;
  merged: number;
  skipped: { title: string; reason: string }[];
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Не удалось прочитать файл отчёта"));
    reader.readAsDataURL(blob);
  });
}

/** Подшивает приложения к основному отчёту и возвращает ссылку на готовый файл. */
export async function mergeReportPdf(
  baseBlob: Blob,
  attachments: Attachment[],
  filename: string,
): Promise<MergeResult> {
  const baseFile = await blobToBase64(baseBlob);

  const res = await fetch(MERGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ baseFile, attachments, filename }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Сборка не удалась (${res.status})`);
  }
  return (await res.json()) as MergeResult;
}
