import type { PdfData } from "./PdfPrimitives";

export interface Attachment {
  url: string;
  title: string;
  filename?: string;
}

function push(list: Attachment[], url: string | undefined, title: string, filename?: string) {
  if (url) list.push({ url, title, filename });
}

/**
 * Собирает приложенные документы в порядке ГОСТ — в этой очерёдности
 * они будут подшиты к основному отчёту при сборке печатного комплекта.
 */
export function collectAttachments(d: PdfData): Attachment[] {
  const list: Attachment[] = [];

  // Копия задания идёт сразу после реферата
  push(list, d.taskFile?.url, "Копия геологического (технического) задания", d.taskFile?.filename);

  // Текстовые приложения по номерам
  [...(d.textAppendices ?? [])]
    .sort((a, b) => a.number - b.number)
    .forEach((a) => push(list, a.fileUrl, `Текстовое приложение ${a.number}. ${a.title}`, a.filename));

  // Графические приложения: карты, схемы, разрезы
  [...(d.graphicAppendices ?? [])]
    .sort((a, b) => a.number - b.number)
    .forEach((a) => push(list, a.fileUrl, `Графическое приложение ${a.number}. ${a.title}`, a.filename));

  // Заключения и сопроводительные документы
  const metro = d.metrological;
  if (metro?.type === "certificate") {
    push(list, metro.certificateFile?.url, "Свидетельство о метрологической аттестации", metro.certificateFile?.filename);
  } else {
    (metro?.conclusions ?? []).forEach((c) =>
      push(list, c.file?.url, c.label || "Заключение о метрологической экспертизе", c.file?.filename),
    );
  }

  push(list, d.patent?.url, "Заключение о патентных исследованиях", d.patent?.filename);
  (d.reviews ?? []).forEach((r) => push(list, r.url, r.label || "Рецензия", r.filename));
  push(list, d.protocol?.url, "Протокол рассмотрения отчёта", d.protocol?.filename);
  push(list, d.cost?.url, "Справка о стоимости работ", d.cost?.filename);
  (d.transferActs ?? []).forEach((a) => push(list, a.url, a.label || "Акт передачи", a.filename));

  return list;
}
