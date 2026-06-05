import Icon from "@/components/ui/icon";
import type { ReportData, Customer, Contractor, License, Contract } from "@/types/geo";
import type { LabelData } from "./reportTypes";
import { FieldRow, InlineInput, InlineNumber } from "./SharedUI";

export function LabelSection({
  report,
  customer,
  contractor,
  license,
  contract,
  labelData,
  setLabelData,
}: {
  report: ReportData;
  customer?: Customer;
  contractor?: Contractor;
  license?: License;
  contract?: Contract;
  labelData: LabelData;
  setLabelData: React.Dispatch<React.SetStateAction<LabelData>>;
}) {
  const secrecyColor: Record<string, string> = {
    "нс": "text-muted-foreground border-muted-foreground/40",
    "КТ": "text-blue-400 border-blue-400/50",
    "С": "text-geo-amber border-geo-amber/60",
    "СС": "text-orange-400 border-orange-400/60",
    "ОВ": "text-destructive border-destructive/60",
  };

  const licenseOrContract = license
    ? `Лицензия ${license.number}`
    : contract
    ? `Гос. контракт № ${contract.number}`
    : "—";

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="BookMarked" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Этикетка (обложка)</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 1</p>
      </div>

      <div className="border border-geo-amber/30 bg-geo-amber/5 px-4 py-3 flex items-center gap-3">
        <Icon name="Eye" size={14} className="text-geo-amber" />
        <span className="font-mono text-xs text-geo-amber/80">Поля загружаются из общих данных · серые поля доступны для редактирования</span>
      </div>

      {/* Visual preview — GOST label layout */}
      <div className="border border-border bg-card text-foreground font-body text-sm relative">
        <div className="absolute top-4 right-5 text-right">
          <p className={`font-mono text-base font-bold border px-2 py-0.5 ${secrecyColor[report.secrecy] || "text-foreground border-border"}`}>
            {report.secrecy}
          </p>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            Экз. № <span className="border-b border-foreground/40 pl-1 pr-6">{labelData.copyNumber}</span>
          </p>
        </div>

        <div className="p-8 space-y-4 pr-40">
          <div className="border-b border-foreground/20 pb-3">
            <p className="text-xs text-muted-foreground font-mono mb-0.5">Министерство; агентство; компания и др.</p>
            <p className="font-semibold uppercase leading-snug">
              {customer?.name || <span className="italic text-muted-foreground">ЗАКАЗЧИК РАБОТ</span>}
            </p>
          </div>

          <div className="border-b border-foreground/20 pb-3">
            <p className="text-xs text-muted-foreground font-mono mb-0.5">Министерство; агентство; компания и др.</p>
            <p className="uppercase italic leading-snug">
              {contractor?.name || <span className="text-muted-foreground">ПОДРЯДЧИК–ИСПОЛНИТЕЛЬ РАБОТ</span>}
            </p>
          </div>

          <div className="text-right pr-2">
            <p className="text-xs text-muted-foreground">
              Отв. исполнитель:{" "}
              <span className="text-foreground font-medium">
                {labelData.responsibleOverride || contractor?.responsible || report.responsible || "ФАМИЛИЯ И.О."}
              </span>
            </p>
          </div>

          <div className="text-center py-2">
            <p className="font-bold uppercase text-base leading-snug tracking-wide">
              {report.title || <span className="text-muted-foreground italic">НАИМЕНОВАНИЕ ОТЧЁТА</span>}
            </p>
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm">
              {license
                ? <>Номер лицензии на пользование недрами: <span className="font-semibold">{license.number}</span></>
                : contract
                ? <>Гос. контракт № <span className="font-semibold">{contract.number}</span></>
                : <span className="text-muted-foreground italic">Номер лицензии / гос. контракта</span>
              }
            </p>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Общее количество книг и папок в отчёте:{" "}
            <span className="text-foreground font-medium">{labelData.totalBooks}</span> кн. /{" "}
            <span className="text-foreground font-medium">{labelData.totalFolders}</span> папок
          </div>

          <div className="text-center space-y-1">
            <p className="font-semibold text-base">
              Книга (папка) № {labelData.bookNumber}
              {labelData.bookName ? ` — ${labelData.bookName}` : ""}
            </p>
          </div>

          <div className="text-center pt-2 border-t border-foreground/10">
            <p className="font-bold text-sm">
              {report.place || "Место выпуска отчёта"}, {report.year || "Год"}
            </p>
          </div>
        </div>
      </div>

      {/* Attribute table */}
      <div className="border border-border overflow-hidden">
        <div className="bg-muted/50 border-b border-border px-4 py-2 flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Атрибуты этикетки</span>
          <span className="font-mono text-xs text-geo-amber border border-geo-amber/40 px-2 py-0.5">
            {Object.keys(labelData).length + 8} полей
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest w-56">Поле</th>
              <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest">Значение</th>
            </tr>
          </thead>
          <tbody>
            <FieldRow label="Гриф секретности" fromSource="общие данные">
              <span className={`font-mono text-sm font-bold border px-2 py-0.5 ${secrecyColor[report.secrecy] || "text-foreground border-border"}`}>
                {report.secrecy}
              </span>
            </FieldRow>
            <FieldRow label="Заказчик" value={customer?.name} fromSource="общие данные" />
            <FieldRow label="Исполнитель" value={contractor?.name} fromSource="общие данных" />
            <FieldRow label="Наименование отчёта" value={report.title} fromSource="общие данные" />
            <FieldRow label="Лицензия / Гос. контракт" value={licenseOrContract} fromSource="общие данные" />
            <FieldRow label="Место выпуска" value={report.place || "—"} fromSource="общие данные" />
            <FieldRow label="Год" value={report.year || "—"} fromSource="общие данные" />
            <FieldRow label="Номер экземпляра">
              <InlineNumber value={labelData.copyNumber} onChange={(v) => setLabelData((d) => ({ ...d, copyNumber: v }))} min={1} />
            </FieldRow>
            <FieldRow label="Ответственный исполнитель" fromSource="данные исполнителя · редактируемо">
              <InlineInput
                value={labelData.responsibleOverride}
                onChange={(v) => setLabelData((d) => ({ ...d, responsibleOverride: v }))}
                placeholder={contractor?.responsible || report.responsible || "Фамилия И.О."}
              />
            </FieldRow>
            <FieldRow label="Общее количество книг">
              <InlineNumber value={labelData.totalBooks} onChange={(v) => setLabelData((d) => ({ ...d, totalBooks: v }))} min={1} />
            </FieldRow>
            <FieldRow label="Общее количество папок">
              <InlineNumber value={labelData.totalFolders} onChange={(v) => setLabelData((d) => ({ ...d, totalFolders: v }))} min={1} />
            </FieldRow>
            <FieldRow label="Книга (папка) №">
              <InlineNumber value={labelData.bookNumber} onChange={(v) => setLabelData((d) => ({ ...d, bookNumber: v }))} min={1} />
            </FieldRow>
            <FieldRow label="Наименование книги (папки)">
              <InlineInput
                value={labelData.bookName}
                onChange={(v) => setLabelData((d) => ({ ...d, bookName: v }))}
                placeholder="Текстовая часть / Графические приложения..."
              />
            </FieldRow>
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-border/50 flex items-center gap-2">
          <Icon name="Info" size={13} className="text-muted-foreground/40" />
          <span className="font-mono text-xs text-muted-foreground/40">Количество книг и папок будет пересчитываться автоматически после описания всех разделов</span>
        </div>
      </div>
    </div>
  );
}
