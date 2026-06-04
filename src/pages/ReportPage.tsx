import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import type { ReportData, Customer, Contractor, Executor, License, Contract } from "@/types/geo";

// ─── Section definitions ──────────────────────────────────────────────────────

type TabId =
  | "label"
  | "title_page"
  | "executors"
  | "abstract"
  | "task_copy"
  | "contents"
  | "illustrations"
  | "tables"
  | "text_appendices"
  | "graphic_appendices"
  | "machine_readable"
  | "terms"
  | "text_part"
  | "references"
  | "metrological"
  | "patent"
  | "review"
  | "protocol"
  | "cost"
  | "transfer_acts"
  | "text_app_files"
  | "graphic_app_files";

interface TabDef {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: string;
  note?: string;
}

const TABS: TabDef[] = [
  { id: "label",             label: "Этикетка (обложка)",                              shortLabel: "Этикетка",      icon: "BookMarked" },
  { id: "title_page",        label: "Титульный лист",                                   shortLabel: "Титул",         icon: "FileText" },
  { id: "executors",         label: "Список исполнителей",                              shortLabel: "Исполнители",   icon: "Users" },
  { id: "abstract",          label: "Реферат",                                          shortLabel: "Реферат",       icon: "AlignLeft" },
  { id: "task_copy",         label: "Копия геол. задания / контракта / договора",       shortLabel: "Задание",       icon: "Copy" },
  { id: "contents",          label: "Содержание",                                       shortLabel: "Содержание",    icon: "List" },
  { id: "illustrations",     label: "Список иллюстраций",                               shortLabel: "Иллюстрации",   icon: "Image",        note: "при наличии" },
  { id: "tables",            label: "Список таблиц (текстовая часть)",                  shortLabel: "Таблицы",       icon: "Table",        note: "при наличии" },
  { id: "text_appendices",   label: "Список текстовых приложений",                      shortLabel: "Прил. текст.",  icon: "FileStack",    note: "при наличии" },
  { id: "graphic_appendices",label: "Список графических приложений",                    shortLabel: "Прил. граф.",   icon: "Map",          note: "при наличии" },
  { id: "machine_readable",  label: "Содержание машиночитаемой версии",                shortLabel: "Маш. версия",   icon: "Database" },
  { id: "terms",             label: "Перечень терминов, сокращений, символов",         shortLabel: "Термины",       icon: "BookOpen",     note: "при наличии" },
  { id: "text_part",         label: "Текстовая часть (введение, осн. часть, заключение)", shortLabel: "Текст. часть", icon: "FileEdit" },
  { id: "references",        label: "Список использованных источников",                shortLabel: "Литература",    icon: "BookCopy" },
  { id: "metrological",      label: "Заключение о метрологической экспертизе",         shortLabel: "Метрология",    icon: "Ruler" },
  { id: "patent",            label: "Заключение о патентных исследованиях",            shortLabel: "Патенты",       icon: "Award",        note: "если проводились" },
  { id: "review",            label: "Рецензия (рецензии)",                             shortLabel: "Рецензии",      icon: "MessageSquare" },
  { id: "protocol",          label: "Протокол рассмотрения (принятия) отчёта",         shortLabel: "Протокол",      icon: "ClipboardCheck" },
  { id: "cost",              label: "Справка о стоимости работ",                       shortLabel: "Стоимость",     icon: "Receipt" },
  { id: "transfer_acts",     label: "Копии актов передачи вещественных источников",    shortLabel: "Акты передачи", icon: "PackageCheck" },
  { id: "text_app_files",    label: "Текстовые приложения",                            shortLabel: "Текст. прил.",  icon: "Files" },
  { id: "graphic_app_files", label: "Графические приложения",                          shortLabel: "Граф. прил.",   icon: "LayoutTemplate", note: "если предусмотрены" },
];

// ─── UI helpers ───────────────────────────────────────────────────────────────

function FieldRow({ label, value, fromSource, children }: {
  label: string;
  value?: string;
  fromSource?: string;
  children?: React.ReactNode;
}) {
  return (
    <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3 align-top w-56">
        <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest leading-tight">{label}</div>
        {fromSource && (
          <div className="font-mono text-xs text-geo-amber/60 mt-0.5">← {fromSource}</div>
        )}
      </td>
      <td className="px-4 py-3 align-top">
        {children ?? <span className="text-sm text-foreground">{value || "—"}</span>}
      </td>
    </tr>
  );
}

function InlineInput({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-muted border border-border px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-geo-amber transition-colors"
    />
  );
}

function InlineNumber({ value, onChange, min, placeholder }: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min ?? 1}
      onChange={(e) => onChange(Number(e.target.value))}
      placeholder={placeholder}
      className="w-24 bg-muted border border-border px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-geo-amber transition-colors"
    />
  );
}

// ─── Label section ────────────────────────────────────────────────────────────

interface LabelData {
  copyNumber: number;
  responsibleOverride: string;
  totalBooks: number;
  totalFolders: number;
  bookNumber: number;
  bookName: string;
}

function LabelSection({
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
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="BookMarked" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Этикетка (обложка)</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 1</p>
      </div>

      {/* Preview badge */}
      <div className="border border-geo-amber/30 bg-geo-amber/5 px-4 py-3 flex items-center gap-3">
        <Icon name="Eye" size={14} className="text-geo-amber" />
        <span className="font-mono text-xs text-geo-amber/80">Поля загружаются из общих данных · серые поля доступны для редактирования</span>
      </div>

      {/* Visual preview — GOST label layout */}
      <div className="border border-border bg-card text-foreground font-body text-sm relative">
        {/* Secrecy — top right */}
        <div className="absolute top-4 right-5 text-right">
          <p className={`font-mono text-base font-bold border px-2 py-0.5 ${secrecyColor[report.secrecy] || "text-foreground border-border"}`}>
            {report.secrecy}
          </p>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            Экз. № <span className="border-b border-foreground/40 pl-1 pr-6">{labelData.copyNumber}</span>
          </p>
        </div>

        <div className="p-8 space-y-4 pr-40">
          {/* Customer */}
          <div className="border-b border-foreground/20 pb-3">
            <p className="text-xs text-muted-foreground font-mono mb-0.5">Министерство; агентство; компания и др.</p>
            <p className="font-semibold uppercase leading-snug">
              {customer?.name || <span className="italic text-muted-foreground">ЗАКАЗЧИК РАБОТ</span>}
            </p>
          </div>

          {/* Contractor */}
          <div className="border-b border-foreground/20 pb-3">
            <p className="text-xs text-muted-foreground font-mono mb-0.5">Министерство; агентство; компания и др.</p>
            <p className="uppercase italic leading-snug">
              {contractor?.name || <span className="text-muted-foreground">ПОДРЯДЧИК–ИСПОЛНИТЕЛЬ РАБОТ</span>}
            </p>
          </div>

          {/* Responsible */}
          <div className="text-right pr-2">
            <p className="text-xs text-muted-foreground">
              Отв. исполнитель:{" "}
              <span className="text-foreground font-medium">
                {labelData.responsibleOverride || contractor?.responsible || report.responsible || "ФАМИЛИЯ И.О."}
              </span>
            </p>
          </div>

          {/* Report title */}
          <div className="text-center py-2">
            <p className="font-bold uppercase text-base leading-snug tracking-wide">
              {report.title || <span className="text-muted-foreground italic">НАИМЕНОВАНИЕ ОТЧЁТА</span>}
            </p>
          </div>

          {/* License / contract */}
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

          {/* Books / folders count */}
          <div className="text-center text-sm text-muted-foreground">
            Общее количество книг и папок в отчёте:{" "}
            <span className="text-foreground font-medium">{labelData.totalBooks}</span> кн. /{" "}
            <span className="text-foreground font-medium">{labelData.totalFolders}</span> папок
          </div>

          {/* Book number and name */}
          <div className="text-center space-y-1">
            <p className="font-semibold text-base">
              Книга (папка) № {labelData.bookNumber}
              {labelData.bookName ? ` — ${labelData.bookName}` : ""}
            </p>
          </div>

          {/* Place + year */}
          <div className="text-center pt-2 border-t border-foreground/10">
            <p className="font-bold text-sm">
              {report.place || "Место выпуска отчёта"}, {report.year || "Год"}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
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
            {/* From common data — read-only */}
            <FieldRow
              label="Гриф секретности"
              fromSource="общие данные"
            >
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

            {/* Editable */}
            <FieldRow label="Номер экземпляра">
              <InlineNumber
                value={labelData.copyNumber}
                onChange={(v) => setLabelData((d) => ({ ...d, copyNumber: v }))}
                min={1}
              />
            </FieldRow>

            <FieldRow
              label="Ответственный исполнитель"
              fromSource="данные исполнителя · редактируемо"
            >
              <InlineInput
                value={labelData.responsibleOverride}
                onChange={(v) => setLabelData((d) => ({ ...d, responsibleOverride: v }))}
                placeholder={contractor?.responsible || report.responsible || "Фамилия И.О."}
              />
            </FieldRow>

            <FieldRow label="Общее количество книг">
              <InlineNumber
                value={labelData.totalBooks}
                onChange={(v) => setLabelData((d) => ({ ...d, totalBooks: v }))}
                min={1}
              />
            </FieldRow>

            <FieldRow label="Общее количество папок">
              <InlineNumber
                value={labelData.totalFolders}
                onChange={(v) => setLabelData((d) => ({ ...d, totalFolders: v }))}
                min={1}
              />
            </FieldRow>

            <FieldRow label="Книга (папка) №">
              <InlineNumber
                value={labelData.bookNumber}
                onChange={(v) => setLabelData((d) => ({ ...d, bookNumber: v }))}
                min={1}
              />
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

// ─── Title Page section ───────────────────────────────────────────────────────

interface TitlePageData {
  approverPosition: string;
  approverName: string;
  approverDate: string;
  customerPosition: string;
  customerName: string;
  customerDate: string;
  responsibleOverride: string;
}

const DEFAULT_TITLE_PAGE: TitlePageData = {
  approverPosition: "",
  approverName: "",
  approverDate: "",
  customerPosition: "",
  customerName: "",
  customerDate: "",
  responsibleOverride: "",
};

function TitlePageSection({
  report,
  customer,
  contractor,
  titleData,
  setTitleData,
}: {
  report: ReportData;
  customer?: Customer;
  contractor?: Contractor;
  titleData: TitlePageData;
  setTitleData: React.Dispatch<React.SetStateAction<TitlePageData>>;
}) {
  const secrecyColor: Record<string, string> = {
    "нс": "text-muted-foreground border-muted-foreground/40",
    "КТ": "text-blue-400 border-blue-400/50",
    "С": "text-geo-amber border-geo-amber/60",
    "СС": "text-orange-400 border-orange-400/60",
    "ОВ": "text-destructive border-destructive/60",
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="FileText" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Титульный лист</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 2 · Приложение А</p>
      </div>

      {/* Preview badge */}
      <div className="border border-geo-amber/30 bg-geo-amber/5 px-4 py-3 flex items-center gap-3">
        <Icon name="Eye" size={14} className="text-geo-amber" />
        <span className="font-mono text-xs text-geo-amber/80">Поля ← загружаются из общих данных · остальные доступны для редактирования</span>
      </div>

      {/* Visual preview — mimics GOST layout */}
      <div className="border border-border p-8 bg-card space-y-5 font-body text-sm">
        {/* Customer */}
        <div className="text-center border-b border-foreground/20 pb-4">
          <p className="text-xs text-muted-foreground font-mono mb-1">Министерство; агентство; компания и др.</p>
          <p className="font-semibold text-foreground uppercase leading-snug">
            {customer?.name || <span className="text-muted-foreground italic">ЗАКАЗЧИК РАБОТ</span>}
          </p>
        </div>

        {/* Contractor */}
        <div className="text-center border-b border-foreground/20 pb-4">
          <p className="text-xs text-muted-foreground font-mono mb-1">Министерство; агентство; компания и др.</p>
          <p className="text-foreground uppercase leading-snug italic">
            {contractor?.name || <span className="text-muted-foreground italic">ПОДРЯДЧИК–ИСПОЛНИТЕЛЬ РАБОТ</span>}
          </p>
        </div>

        {/* Reg number + Secrecy */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-1">№ государственной регистрации работы</p>
            <p className="text-foreground font-mono">{report.govRegNumber || "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-1">Гриф секретности</p>
            <span className={`font-mono text-sm font-bold border px-2 py-0.5 ${secrecyColor[report.secrecy] || "text-foreground border-border"}`}>
              {report.secrecy}
            </span>
          </div>
        </div>

        {/* Agree / Approve columns */}
        <div className="grid grid-cols-2 gap-8 pt-2">
          {/* СОГЛАСОВАНО */}
          <div className="space-y-3">
            <p className="font-semibold text-center">«СОГЛАСОВАНО»</p>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Должность руководителя согласующей организации</p>
              <input
                type="text"
                value={titleData.approverPosition}
                onChange={(e) => setTitleData((d) => ({ ...d, approverPosition: e.target.value }))}
                placeholder="Должность (необязательно)"
                className="w-full bg-muted border border-border px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">И.О. Фамилия</p>
              <input
                type="text"
                value={titleData.approverName}
                onChange={(e) => setTitleData((d) => ({ ...d, approverName: e.target.value }))}
                placeholder="И.О. Фамилия (необязательно)"
                className="w-full bg-muted border border-border px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Дата</p>
              <input
                type="date"
                value={titleData.approverDate}
                onChange={(e) => setTitleData((d) => ({ ...d, approverDate: e.target.value }))}
                className="w-full bg-muted border border-border px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-geo-amber transition-colors"
              />
            </div>
            {(titleData.approverPosition || titleData.approverName) && (
              <p className="text-xs text-muted-foreground/50 font-mono italic">М.П. (подпись) {titleData.approverName}</p>
            )}
          </div>

          {/* УТВЕРЖДАЮ */}
          <div className="space-y-3">
            <p className="font-semibold text-center">«УТВЕРЖДАЮ»</p>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Должность руководителя организации заказчика</p>
              <input
                type="text"
                value={titleData.customerPosition}
                onChange={(e) => setTitleData((d) => ({ ...d, customerPosition: e.target.value }))}
                placeholder="Должность"
                className="w-full bg-muted border border-border px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">И.О. Фамилия</p>
              <input
                type="text"
                value={titleData.customerName}
                onChange={(e) => setTitleData((d) => ({ ...d, customerName: e.target.value }))}
                placeholder="И.О. Фамилия"
                className="w-full bg-muted border border-border px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Дата</p>
              <input
                type="date"
                value={titleData.customerDate}
                onChange={(e) => setTitleData((d) => ({ ...d, customerDate: e.target.value }))}
                className="w-full bg-muted border border-border px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-geo-amber transition-colors"
              />
            </div>
            <p className="text-xs text-muted-foreground/50 font-mono italic">М.П. (подпись) {titleData.customerName || "И.О. Фамилия"}</p>
          </div>
        </div>

        {/* Responsible executor */}
        <div className="border-t border-border/40 pt-4 space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Ответственный исполнитель</p>
            <span className="font-mono text-xs text-geo-amber/60">← из общих данных · редактируемо</span>
          </div>
          <input
            type="text"
            value={titleData.responsibleOverride}
            onChange={(e) => setTitleData((d) => ({ ...d, responsibleOverride: e.target.value }))}
            placeholder={report.responsible || contractor?.responsible || "ФАМИЛИЯ И.О."}
            className="w-full max-w-sm bg-muted border border-border px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors"
          />
        </div>
      </div>

      {/* Attribute table */}
      <div className="border border-border overflow-hidden">
        <div className="bg-muted/50 border-b border-border px-4 py-2">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Сводная таблица атрибутов</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest w-56">Поле</th>
              <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest">Значение</th>
              <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest w-40">Источник</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Заказчик работ",                value: customer?.name,          source: "Общие данные" },
              { label: "Исполнитель работ",             value: contractor?.name,         source: "Общие данные" },
              { label: "№ гос. регистрации работы",     value: report.govRegNumber,      source: "Общие данные" },
              { label: "Гриф секретности",              value: report.secrecy,           source: "Общие данные" },
              { label: "Должн. рук. согл. организации", value: titleData.approverPosition || "—", source: "Редактируемо" },
              { label: "ФИО рук. согл. организации",    value: titleData.approverName || "—",     source: "Редактируемо" },
              { label: "Дата согласования",             value: titleData.approverDate ? new Date(titleData.approverDate).toLocaleDateString("ru-RU") : "—", source: "Редактируемо" },
              { label: "Должн. рук. орг. заказчика",    value: titleData.customerPosition || "—", source: "Редактируемо" },
              { label: "ФИО рук. орг. заказчика",       value: titleData.customerName || "—",     source: "Редактируемо" },
              { label: "Дата утверждения",              value: titleData.customerDate ? new Date(titleData.customerDate).toLocaleDateString("ru-RU") : "—", source: "Редактируемо" },
              { label: "Ответственный исполнитель",     value: titleData.responsibleOverride || report.responsible || "—", source: "Общие данные / ред." },
            ].map((row, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest">{row.label}</td>
                <td className="px-4 py-2.5 text-sm text-foreground">{row.value || "—"}</td>
                <td className="px-4 py-2.5">
                  <span className={`font-mono text-xs px-1.5 py-0.5 ${row.source === "Редактируемо" ? "text-foreground/60 bg-muted" : "text-geo-amber/70 bg-geo-amber/10"}`}>
                    {row.source}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Executors Section ────────────────────────────────────────────────────────

function ExecutorRow({ executor, isResponsible }: { executor: Executor; isResponsible?: boolean }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start py-4 border-b border-border/40 last:border-0">
      {/* Left: name + position */}
      <div>
        <p className="font-semibold text-foreground text-sm leading-snug">
          {executor.lastName.toUpperCase()}{executor.initials ? ` ${executor.initials},` : ""}
        </p>
        {isResponsible && (
          <p className="text-xs text-geo-amber font-mono">ответственный исполнитель</p>
        )}
        {executor.position && <p className="text-xs text-muted-foreground leading-snug">{executor.position}</p>}
        {executor.degree && <p className="text-xs text-muted-foreground leading-snug">{executor.degree}</p>}
      </div>
      {/* Center: signature placeholder */}
      <div className="flex flex-col items-center justify-center pt-4">
        <div className="border-b border-foreground/30 w-24" />
        <p className="text-xs text-muted-foreground/50 italic mt-0.5">(подпись)</p>
      </div>
      {/* Right: sections placeholder */}
      <div className="text-right pt-1">
        <p className="text-xs text-muted-foreground/40 italic">Разделы — будут добавлены позже</p>
      </div>
    </div>
  );
}

function ExecutorsSection({
  report,
  contractor,
  contractors,
  setReport,
}: {
  report: ReportData;
  contractor?: Contractor;
  contractors: Contractor[];
  setReport: (r: ReportData) => void;
}) {
  const [coModal, setCoModal] = useState(false);
  const [selectedCoId, setSelectedCoId] = useState("");

  const coContractors = (report.coContractors || [])
    .map((cc) => contractors.find((c) => c.id === cc.contractorId))
    .filter(Boolean) as Contractor[];

  const availableToAdd = contractors.filter(
    (c) => c.id !== report.contractorId && !(report.coContractors || []).some((cc) => cc.contractorId === c.id)
  );

  const addCoContractor = () => {
    if (!selectedCoId) return;
    setReport({ ...report, coContractors: [...(report.coContractors || []), { contractorId: selectedCoId }] });
    setSelectedCoId("");
    setCoModal(false);
  };

  const removeCoContractor = (id: string) => {
    setReport({ ...report, coContractors: (report.coContractors || []).filter((cc) => cc.contractorId !== id) });
  };

  // Responsible executor — first in list
  const responsible = contractor
    ? ({ id: "resp", lastName: report.responsible || contractor.responsible || "—", initials: "", position: "ответственный исполнитель", degree: "" } as Executor)
    : null;

  const mainExecutors = contractor?.executors || [];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="Users" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Список исполнителей</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 3</p>
      </div>

      <div className="border border-geo-amber/30 bg-geo-amber/5 px-4 py-3 flex items-center gap-3">
        <Icon name="Info" size={14} className="text-geo-amber" />
        <span className="font-mono text-xs text-geo-amber/80">Исполнители загружаются из компании-исполнителя · разделы будут привязаны позже</span>
      </div>

      {/* Main contractor block */}
      <div className="border border-border bg-card">
        <div className="bg-muted/40 border-b border-border px-5 py-2.5 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Исполнитель</span>
            <span className="ml-3 text-sm text-foreground font-medium">{contractor?.name || "—"}</span>
          </div>
          <span className="font-mono text-xs text-geo-amber/60">← из общих данных</span>
        </div>
        <div className="px-5">
          {/* Responsible first */}
          {responsible && (
            <ExecutorRow executor={responsible} isResponsible />
          )}
          {/* Other executors */}
          {mainExecutors.length === 0 && !responsible && (
            <p className="py-6 text-center text-xs text-muted-foreground/50 font-mono italic">Нет исполнителей. Добавьте их в разделе «Исполнители».</p>
          )}
          {mainExecutors.map((e) => (
            <ExecutorRow key={e.id} executor={e} />
          ))}
        </div>
      </div>

      {/* Co-contractors */}
      {coContractors.length > 0 && (
        <div className="space-y-4">
          <div className="text-center">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest border-b border-border pb-0.5">Соисполнители:</span>
          </div>
          {coContractors.map((cc) => (
            <div key={cc.id} className="border border-border bg-card">
              <div className="bg-muted/40 border-b border-border px-5 py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Соисполнитель</span>
                  <span className="ml-3 text-sm text-foreground font-medium">{cc.name}</span>
                </div>
                <button
                  onClick={() => removeCoContractor(cc.id)}
                  className="text-xs font-mono text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                >
                  <Icon name="X" size={12} /> Убрать
                </button>
              </div>
              <div className="px-5">
                {(cc.executors || []).length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground/50 font-mono italic">Нет исполнителей. Добавьте в разделе «Исполнители».</p>
                ) : (
                  (cc.executors || []).map((e) => <ExecutorRow key={e.id} executor={e} />)
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add co-contractor */}
      <div className="flex items-center gap-3">
        {availableToAdd.length > 0 && (
          <button
            onClick={() => setCoModal(true)}
            className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-geo-amber border border-border hover:border-geo-amber/40 px-3 py-2 transition-colors"
          >
            <Icon name="Plus" size={13} /> Добавить соисполнителя
          </button>
        )}
        {coContractors.length > 0 && (
          <span className="font-mono text-xs text-muted-foreground/40">{coContractors.length} соисп. · {coContractors.reduce((s, c) => s + (c.executors?.length || 0), 0)} чел.</span>
        )}
      </div>

      {coModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-sm mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm tracking-wider uppercase">Добавить соисполнителя</h4>
              <button onClick={() => setCoModal(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Компания</label>
              <select
                value={selectedCoId}
                onChange={(e) => setSelectedCoId(e.target.value)}
                className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-geo-amber transition-colors"
              >
                <option value="">— выберите —</option>
                {availableToAdd.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={addCoContractor} disabled={!selectedCoId} className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-amber-400 disabled:opacity-40 transition-colors">Добавить</button>
              <button onClick={() => setCoModal(false)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Placeholder table ────────────────────────────────────────────────────────

function PlaceholderTable({ tab }: { tab: TabDef }) {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Icon name={tab.icon} fallback="File" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">{tab.label}</h3>
          {tab.note && (
            <span className="font-mono text-xs text-muted-foreground border border-border px-2 py-0.5">{tab.note}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент</p>
      </div>

      <div className="border border-border overflow-hidden">
        <div className="bg-muted/50 border-b border-border px-4 py-2 flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Атрибуты</span>
          <span className="font-mono text-xs text-muted-foreground/40">— описание будет добавлено —</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest w-56">Поле</th>
              <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest">Значение</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="px-4 py-3">
                  <div className="h-3 w-36 bg-muted rounded-sm animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-3 w-64 bg-muted rounded-sm animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-border/50 flex items-center gap-2">
          <Icon name="Info" size={13} className="text-muted-foreground/40" />
          <span className="font-mono text-xs text-muted-foreground/40">Атрибуты этого раздела будут описаны на следующем шаге</span>
        </div>
      </div>
    </div>
  );
}

// ─── Abstract Section ────────────────────────────────────────────────────────

interface WorkMethod {
  id: string;
  name: string;
  volume: string;
  unit: string;
  coordSystem: string;
  coordFrom: string;
  coordTo: string;
  note: string;
}

interface AbstractData {
  // Библиографическое описание
  bibAuthors: string;
  bibTitle: string;
  bibYear: string;
  bibPlace: string;
  bibPages: string;
  bibTables: string;
  bibIllustrations: string;
  bibBibliography: string;
  bibAppendices: string;
  bibCopyNumber: string;
  // Порядок представления в фонды
  fundDeposit: string;
  // Текст реферата — структурные элементы
  abstractSubject: string;
  abstractGoals: string;
  methods: WorkMethod[];
  abstractResults: string;
  abstractConclusions: string;
  abstractEfficiency: string;
  // Ключевые слова
  keywords: string;
  // Составитель
  composerExecutorId: string;
  composerName: string;
}

const DEFAULT_ABSTRACT: AbstractData = {
  bibAuthors: "",
  bibTitle: "",
  bibYear: "",
  bibPlace: "",
  bibPages: "",
  bibTables: "",
  bibIllustrations: "",
  bibBibliography: "",
  bibAppendices: "",
  bibCopyNumber: "",
  fundDeposit: "",
  abstractSubject: "",
  abstractGoals: "",
  methods: [],
  abstractResults: "",
  abstractConclusions: "",
  abstractEfficiency: "",
  keywords: "",
  composerExecutorId: "",
  composerName: "",
};

function TextArea({ label, value, onChange, placeholder, hint, rows = 3 }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{label}</label>
        {hint && <span className="text-xs text-muted-foreground/40 font-mono">{hint}</span>}
      </div>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors resize-none"
      />
    </div>
  );
}

const EMPTY_METHOD: Omit<WorkMethod, "id"> = {
  name: "",
  volume: "",
  unit: "",
  coordSystem: "",
  coordFrom: "",
  coordTo: "",
  note: "",
};

const COORD_SYSTEMS = ["ГСК-2011"];

function MethodsTable({ methods, onChange }: {
  methods: WorkMethod[];
  onChange: (m: WorkMethod[]) => void;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<WorkMethod, "id">>(EMPTY_METHOD);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => { setForm(EMPTY_METHOD); setEditId("new"); };
  const openEdit = (m: WorkMethod) => { setForm({ name: m.name, volume: m.volume, unit: m.unit, coordSystem: m.coordSystem, coordFrom: m.coordFrom, coordTo: m.coordTo, note: m.note }); setEditId(m.id); };

  const save = () => {
    if (editId === "new") {
      onChange([...methods, { ...form, id: Date.now().toString() }]);
    } else {
      onChange(methods.map((m) => m.id === editId ? { ...form, id: editId } : m));
    }
    setEditId(null);
  };

  const setF = (field: keyof Omit<WorkMethod, "id">) => (v: string) => setForm((f) => ({ ...f, [field]: v }));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Методы и объёмы работ</span>
          <span className="ml-2 text-xs text-muted-foreground/40 font-mono">способы исследования</span>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 text-xs font-mono text-geo-amber hover:text-amber-400 border border-geo-amber/40 hover:border-amber-400/60 px-3 py-1.5 transition-colors"
        >
          <Icon name="Plus" size={12} /> Добавить метод
        </button>
      </div>

      {methods.length === 0 ? (
        <div className="border border-dashed border-border py-8 text-center text-muted-foreground/50 text-xs font-mono">
          Нет методов — нажмите «Добавить метод»
        </div>
      ) : (
        <div className="border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2 font-mono text-xs text-muted-foreground uppercase tracking-widest">Метод</th>
                <th className="text-left px-3 py-2 font-mono text-xs text-muted-foreground uppercase tracking-widest w-24">Объём</th>
                <th className="text-left px-3 py-2 font-mono text-xs text-muted-foreground uppercase tracking-widest w-20">Ед. изм.</th>
                <th className="text-left px-3 py-2 font-mono text-xs text-muted-foreground uppercase tracking-widest w-20">Сист. коорд.</th>
                <th className="text-left px-3 py-2 font-mono text-xs text-muted-foreground uppercase tracking-widest">Координаты</th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {methods.map((m) => (
                <tr key={m.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors group">
                  <td className="px-3 py-2.5">
                    <p className="text-sm text-foreground font-medium leading-snug">{m.name || "—"}</p>
                    {m.note && <p className="text-xs text-muted-foreground mt-0.5">{m.note}</p>}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-sm">{m.volume || "—"}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{m.unit || "—"}</td>
                  <td className="px-3 py-2.5">
                    {m.coordSystem && m.coordSystem !== "—" ? (
                      <span className="font-mono text-xs text-geo-amber border border-geo-amber/30 px-1.5 py-0.5">{m.coordSystem}</span>
                    ) : <span className="text-muted-foreground/30 text-xs">—</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    {m.coordFrom || m.coordTo ? (
                      <span className="font-mono text-xs text-foreground/70">
                        {m.coordFrom}{m.coordTo ? ` — ${m.coordTo}` : ""}
                      </span>
                    ) : <span className="text-muted-foreground/30 text-xs">—</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <button onClick={() => openEdit(m)} className="p-1 text-muted-foreground hover:text-geo-amber transition-colors">
                        <Icon name="Pencil" size={12} />
                      </button>
                      <button onClick={() => setDeleteId(m.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                        <Icon name="Trash2" size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit modal */}
      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-lg space-y-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm tracking-wider uppercase">{editId === "new" ? "Добавить метод" : "Редактировать метод"}</h4>
              <button onClick={() => setEditId(null)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={16} />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Наименование метода</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setF("name")(e.target.value)}
                placeholder="Буровые работы, геофизические исследования..."
                className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Объём</label>
                <input
                  type="text"
                  value={form.volume}
                  onChange={(e) => setF("volume")(e.target.value)}
                  placeholder="108"
                  className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Единица измерения</label>
                <input
                  type="text"
                  value={form.unit}
                  onChange={(e) => setF("unit")(e.target.value)}
                  placeholder="скв., пог. м, км², п.км..."
                  className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors"
                />
              </div>
            </div>

            <div className="border border-border/50 p-4 space-y-3 bg-muted/20">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Icon name="MapPin" size={12} className="text-geo-amber" /> Координаты
              </p>
              <div className="space-y-1">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Система координат</label>
                <select
                  value={form.coordSystem}
                  onChange={(e) => setF("coordSystem")(e.target.value)}
                  className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-geo-amber transition-colors"
                >
                  {COORD_SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Координаты от</label>
                  <input
                    type="text"
                    value={form.coordFrom}
                    onChange={(e) => setF("coordFrom")(e.target.value)}
                    placeholder="58°12′N 60°45′E"
                    className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Координаты до</label>
                  <input
                    type="text"
                    value={form.coordTo}
                    onChange={(e) => setF("coordTo")(e.target.value)}
                    placeholder="59°00′N 61°30′E"
                    className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Примечание</label>
              <input
                type="text"
                value={form.note}
                onChange={(e) => setF("note")(e.target.value)}
                placeholder="доп. сведения..."
                className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={save} className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">Сохранить</button>
              <button onClick={() => setEditId(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6 space-y-4">
            <h4 className="font-display text-sm tracking-wider uppercase">Удалить метод?</h4>
            <p className="text-sm text-muted-foreground">Метод будет удалён из списка.</p>
            <div className="flex gap-3">
              <button onClick={() => { onChange(methods.filter((m) => m.id !== deleteId)); setDeleteId(null); }} className="flex-1 bg-destructive text-destructive-foreground py-2 text-sm font-display tracking-wider uppercase hover:opacity-90 transition-opacity">Удалить</button>
              <button onClick={() => setDeleteId(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AbstractSection({
  report,
  contractor,
  contractors,
  abstractData,
  setAbstractData,
}: {
  report: ReportData;
  contractor?: Contractor;
  contractors: Contractor[];
  abstractData: AbstractData;
  setAbstractData: React.Dispatch<React.SetStateAction<AbstractData>>;
}) {
  // Collect all executors across main + co-contractors
  const allExecutors: { executor: Executor; companyName: string }[] = [];
  if (contractor) {
    // Responsible first
    if (contractor.responsible) {
      allExecutors.push({
        executor: { id: "resp", lastName: report.responsible || contractor.responsible, initials: "", position: "ответственный исполнитель", degree: "" },
        companyName: contractor.name,
      });
    }
    (contractor.executors || []).forEach((e) => allExecutors.push({ executor: e, companyName: contractor.name }));
  }
  (report.coContractors || []).forEach((cc) => {
    const c = contractors.find((x) => x.id === cc.contractorId);
    if (c) (c.executors || []).forEach((e) => allExecutors.push({ executor: e, companyName: c.name }));
  });

  const selectedExec = allExecutors.find((x) => x.executor.id === abstractData.composerExecutorId);

  const handleComposerSelect = (execId: string) => {
    const found = allExecutors.find((x) => x.executor.id === execId);
    const name = found ? `${found.executor.lastName}${found.executor.initials ? " " + found.executor.initials : ""}` : "";
    setAbstractData((d) => ({ ...d, composerExecutorId: execId, composerName: name }));
  };

  const set = (field: keyof AbstractData) => (v: string) => setAbstractData((d) => ({ ...d, [field]: v }));

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="AlignLeft" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Реферат</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 4</p>
      </div>

      <div className="border border-geo-amber/30 bg-geo-amber/5 px-4 py-3 flex items-center gap-3">
        <Icon name="Info" size={14} className="text-geo-amber" />
        <span className="font-mono text-xs text-geo-amber/80">Реферат / информационная карта отчёта · справочный документ</span>
      </div>

      {/* ── 1. Библиографическое описание ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <span className="font-mono text-xs text-geo-amber font-bold">01</span>
          <span className="font-display text-sm tracking-wider uppercase text-foreground">Библиографическое описание</span>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Авторы
              <span className="ml-2 normal-case text-geo-amber/60 font-mono">← загружается из исполнителей</span>
            </label>
            <div className="bg-muted/30 border border-border/50 px-3 py-2 text-sm text-foreground/70 min-h-[38px]">
              {allExecutors.length > 0
                ? allExecutors.map((x) => `${x.executor.lastName}${x.executor.initials ? " " + x.executor.initials : ""}`).join(", ")
                : <span className="text-muted-foreground/40 italic">Добавьте исполнителей в разделе «Список исполнителей»</span>
              }
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Наименование отчёта
              <span className="ml-2 normal-case text-geo-amber/60 font-mono">← из общих данных</span>
            </label>
            <div className="bg-muted/30 border border-border/50 px-3 py-2 text-sm text-foreground/70">
              {report.title || <span className="text-muted-foreground/40 italic">Не указано</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Год <span className="normal-case text-geo-amber/60">← общие данные</span>
              </label>
              <div className="bg-muted/30 border border-border/50 px-3 py-2 text-sm text-foreground/70">{report.year || "—"}</div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Место <span className="normal-case text-geo-amber/60">← общие данные</span>
              </label>
              <div className="bg-muted/30 border border-border/50 px-3 py-2 text-sm text-foreground/70">{report.place || "—"}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <InlineInput value={abstractData.bibPages} onChange={set("bibPages")} placeholder="112 л." />
            <InlineInput value={abstractData.bibTables} onChange={set("bibTables")} placeholder="14 табл." />
            <InlineInput value={abstractData.bibIllustrations} onChange={set("bibIllustrations")} placeholder="28/174 ил." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Библиография (источников)</label>
              <InlineInput value={abstractData.bibBibliography} onChange={set("bibBibliography")} placeholder="121" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Приложений</label>
              <InlineInput value={abstractData.bibAppendices} onChange={set("bibAppendices")} placeholder="граф. прил. 49/54 л." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Номер экземпляра <span className="normal-case text-geo-amber/60">← из этикетки</span>
              </label>
              <InlineInput value={abstractData.bibCopyNumber} onChange={set("bibCopyNumber")} placeholder="1" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                № гос. регистрации <span className="normal-case text-geo-amber/60">← общие данные</span>
              </label>
              <div className="bg-muted/30 border border-border/50 px-3 py-2 text-sm text-foreground/70">{report.govRegNumber || "—"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Порядок представления в фонды ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <span className="font-mono text-xs text-geo-amber font-bold">02</span>
          <span className="font-display text-sm tracking-wider uppercase text-foreground">Порядок представления отчёта в фонды</span>
        </div>
        <TextArea
          label="Текст порядка"
          value={abstractData.fundDeposit}
          onChange={set("fundDeposit")}
          placeholder="Передаётся на хранение в фонды на основании..."
          rows={3}
        />
      </div>

      {/* ── 3. Текст реферата ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <span className="font-mono text-xs text-geo-amber font-bold">03</span>
          <span className="font-display text-sm tracking-wider uppercase text-foreground">Текст реферата</span>
        </div>

        <div className="border border-border overflow-hidden">
          <div className="bg-muted/40 border-b border-border px-4 py-2">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">РЕФЕРАТ</span>
          </div>
          <div className="p-5 space-y-5">
            <TextArea
              label="Предмет исследований"
              value={abstractData.abstractSubject}
              onChange={set("abstractSubject")}
              placeholder="Геологический отчёт о предварительной разведке..."
              hint="что изучается"
              rows={4}
            />
            <TextArea
              label="Цели проведённых работ"
              value={abstractData.abstractGoals}
              onChange={set("abstractGoals")}
              placeholder="Целью работ является..."
              hint="задача"
              rows={3}
            />
            <MethodsTable
              methods={abstractData.methods || []}
              onChange={(m) => setAbstractData((d) => ({ ...d, methods: m }))}
            />
            <TextArea
              label="Результаты проведённых работ"
              value={abstractData.abstractResults}
              onChange={set("abstractResults")}
              placeholder="Месторождение разведано сетью скважин..."
              hint="основные данные"
              rows={5}
            />
            <TextArea
              label="Краткие выводы"
              value={abstractData.abstractConclusions}
              onChange={set("abstractConclusions")}
              placeholder="По результатам проведённых работ установлено..."
              hint="что выяснено"
              rows={4}
            />
            <TextArea
              label="Оценка эффективности исследований"
              value={abstractData.abstractEfficiency}
              onChange={set("abstractEfficiency")}
              placeholder="Рекомендуется детальная разведка..."
              hint="практическое значение"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* ── 4. Ключевые слова ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <span className="font-mono text-xs text-geo-amber font-bold">04</span>
          <span className="font-display text-sm tracking-wider uppercase text-foreground">Ключевые слова</span>
        </div>
        <TextArea
          label="Перечень ключевых слов"
          value={abstractData.keywords}
          onChange={set("keywords")}
          placeholder="Предварительная разведка, железорудное месторождение, магнетит, пирит, вулканогенно-осадочные породы..."
          rows={3}
        />
      </div>

      {/* ── 5. Составитель ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <span className="font-mono text-xs text-geo-amber font-bold">05</span>
          <span className="font-display text-sm tracking-wider uppercase text-foreground">Составитель реферата</span>
        </div>
        <div className="border border-border bg-card p-6 space-y-5">
          {/* Composer selector */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Выбор исполнителя</label>
            <select
              value={abstractData.composerExecutorId}
              onChange={(e) => handleComposerSelect(e.target.value)}
              className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-geo-amber transition-colors"
            >
              <option value="">— выберите из списка исполнителей —</option>
              {allExecutors.map((x) => (
                <option key={x.executor.id} value={x.executor.id}>
                  {x.executor.lastName}{x.executor.initials ? " " + x.executor.initials : ""}
                  {x.executor.position ? ` · ${x.executor.position}` : ""}
                  {" "}({x.companyName})
                </option>
              ))}
            </select>
          </div>

          {/* Composer preview — GOST layout */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-6 items-end pt-2">
            <div className="text-center space-y-1">
              <div className="h-10 border-b border-foreground/30 flex items-end justify-center pb-1">
                <span className="text-xs text-muted-foreground/40 italic">(подпись)</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-border flex items-center justify-center mb-1">
                <span className="text-xs text-muted-foreground/30 font-mono">М.П.</span>
              </div>
            </div>
            <div className="space-y-1 text-right">
              <div className="border-b border-foreground/30 pb-1">
                {abstractData.composerName ? (
                  <span className="text-sm text-foreground font-medium">{abstractData.composerName}</span>
                ) : (
                  <span className="text-xs text-muted-foreground/40 italic">Н.М. Фамилия</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground/50 font-mono">расшифровка подписи</p>
            </div>
          </div>

          {selectedExec && (
            <div className="bg-geo-amber/5 border border-geo-amber/20 px-4 py-3">
              <p className="font-mono text-xs text-geo-amber/80">
                Составил: <span className="font-bold">{selectedExec.executor.lastName}{selectedExec.executor.initials ? " " + selectedExec.executor.initials : ""}</span>
                {selectedExec.executor.position && <> · {selectedExec.executor.position}</>}
                {selectedExec.executor.degree && <> · {selectedExec.executor.degree}</>}
              </p>
              <p className="font-mono text-xs text-muted-foreground/50 mt-0.5">{selectedExec.companyName}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ReportPage component ─────────────────────────────────────────────────────

interface ReportPageProps {
  report: ReportData;
  customers: Customer[];
  contractors: Contractor[];
  licenses: License[];
  contracts: Contract[];
  onBack: () => void;
  onUpdateReport: (r: ReportData) => void;
}

const DEFAULT_LABEL: LabelData = {
  copyNumber: 1,
  responsibleOverride: "",
  totalBooks: 1,
  totalFolders: 1,
  bookNumber: 1,
  bookName: "",
};

export default function ReportPage({ report, customers, contractors, licenses, contracts, onBack, onUpdateReport }: ReportPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>("label");

  const [labelData, setLabelData] = useState<LabelData>(() => {
    try {
      const stored = localStorage.getItem(`geo_label_${report.id}`);
      return stored ? JSON.parse(stored) : DEFAULT_LABEL;
    } catch { return DEFAULT_LABEL; }
  });
  useEffect(() => {
    localStorage.setItem(`geo_label_${report.id}`, JSON.stringify(labelData));
  }, [labelData, report.id]);

  const [titleData, setTitleData] = useState<TitlePageData>(() => {
    try {
      const stored = localStorage.getItem(`geo_title_${report.id}`);
      return stored ? JSON.parse(stored) : DEFAULT_TITLE_PAGE;
    } catch { return DEFAULT_TITLE_PAGE; }
  });
  useEffect(() => {
    localStorage.setItem(`geo_title_${report.id}`, JSON.stringify(titleData));
  }, [titleData, report.id]);

  const [abstractData, setAbstractData] = useState<AbstractData>(() => {
    try {
      const stored = localStorage.getItem(`geo_abstract_${report.id}`);
      return stored ? JSON.parse(stored) : DEFAULT_ABSTRACT;
    } catch { return DEFAULT_ABSTRACT; }
  });
  useEffect(() => {
    localStorage.setItem(`geo_abstract_${report.id}`, JSON.stringify(abstractData));
  }, [abstractData, report.id]);

  const customer   = customers.find((c) => c.id === report.customerId);
  const contractor = contractors.find((c) => c.id === report.contractorId);
  const license    = licenses.find((l) => l.id === report.licenseId);
  const contract   = contracts.find((c) => c.id === report.contractId);

  // Init responsible from contractor on first open
  useEffect(() => {
    if (!labelData.responsibleOverride && contractor?.responsible) {
      setLabelData((d) => ({ ...d, responsibleOverride: contractor.responsible }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractor?.responsible]);

  const activeTabDef = TABS.find((t) => t.id === activeTab)!;
  const activeIdx    = TABS.findIndex((t) => t.id === activeTab);

  const secrecyColor: Record<string, string> = {
    "нс": "text-muted-foreground",
    "КТ": "text-blue-400",
    "С": "text-geo-amber",
    "СС": "text-orange-400",
    "ОВ": "text-destructive",
  };

  return (
    <div className="min-h-screen bg-background geo-grid-bg flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs font-mono"
            >
              <Icon name="ChevronLeft" size={16} />
              Отчёты
            </button>
            <span className="text-border">/</span>
            <div className="flex items-center gap-2">
              <Icon name="Mountain" size={15} className="text-geo-amber" />
              <span className="font-display text-sm tracking-wider uppercase text-foreground truncate max-w-xs">
                {report.title || "Без названия"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`font-mono text-xs font-bold border px-2 py-0.5 border-current ${secrecyColor[report.secrecy]}`}>
              {report.secrecy}
            </span>
            <span className="font-mono text-xs text-muted-foreground hidden sm:block border border-border px-2 py-0.5">
              ГОСТ Р 53579–2009
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 border-r border-border bg-card/50 flex-shrink-0 hidden md:flex flex-col overflow-y-auto">
          <div className="px-4 py-3 border-b border-border flex-shrink-0">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Структура отчёта</p>
            <p className="font-mono text-xs text-muted-foreground/40 mt-0.5">{TABS.length} элементов</p>
          </div>
          <nav className="flex flex-col p-2 gap-0.5">
            {TABS.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2 text-left transition-all border-l-2 group ${
                  activeTab === tab.id
                    ? "bg-geo-amber/10 text-geo-amber border-geo-amber"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted border-transparent"
                }`}
              >
                <span className={`font-mono text-xs flex-shrink-0 w-4 text-right ${activeTab === tab.id ? "text-geo-amber/60" : "text-muted-foreground/30"}`}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <Icon name={tab.icon} fallback="File" size={12} />
                <span className="text-xs leading-tight truncate">{tab.shortLabel}</span>
                {tab.note && <span className="ml-auto text-muted-foreground/30 text-xs">*</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Meta bar */}
          <div className="border-b border-border bg-muted/30 px-6 py-2 flex-shrink-0 hidden md:flex items-center gap-6 overflow-x-auto">
            {([
              { label: "Заказчик",      value: customer?.name },
              { label: "Исполнитель",   value: contractor?.name },
              { label: "Лицензия",      value: license ? `${license.number} · ${license.siteName}` : undefined },
              { label: "Контракт",      value: contract ? `№ ${contract.number}` : undefined },
              { label: "Место / год",   value: report.place && report.year ? `${report.place}, ${report.year}` : undefined },
            ] as { label: string; value?: string }[]).map((item) =>
              item.value ? (
                <div key={item.label} className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono text-xs text-muted-foreground/60 uppercase tracking-widest">{item.label}:</span>
                  <span className="font-mono text-xs text-foreground/70">{item.value}</span>
                </div>
              ) : null
            )}
          </div>

          {/* Mobile tabs */}
          <div className="md:hidden border-b border-border bg-card/90 flex overflow-x-auto flex-shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-xs font-mono transition-colors border-b-2 ${
                  activeTab === tab.id ? "text-geo-amber border-geo-amber" : "text-muted-foreground border-transparent"
                }`}
              >
                {tab.shortLabel}
              </button>
            ))}
          </div>

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">
              {activeTab === "label" ? (
                <LabelSection
                  report={report}
                  customer={customer}
                  contractor={contractor}
                  license={license}
                  contract={contract}
                  labelData={labelData}
                  setLabelData={setLabelData}
                />
              ) : activeTab === "title_page" ? (
                <TitlePageSection
                  report={report}
                  customer={customer}
                  contractor={contractor}
                  titleData={titleData}
                  setTitleData={setTitleData}
                />
              ) : activeTab === "executors" ? (
                <ExecutorsSection
                  report={report}
                  contractor={contractor}
                  contractors={contractors}
                  setReport={onUpdateReport}
                />
              ) : activeTab === "abstract" ? (
                <AbstractSection
                  report={report}
                  contractor={contractor}
                  contractors={contractors}
                  abstractData={abstractData}
                  setAbstractData={setAbstractData}
                />
              ) : (
                <PlaceholderTable tab={activeTabDef} />
              )}
            </div>
          </main>

          {/* Bottom nav */}
          <div className="border-t border-border px-6 py-3 flex items-center justify-between bg-card/50 flex-shrink-0">
            <button
              onClick={() => activeIdx > 0 && setActiveTab(TABS[activeIdx - 1].id)}
              disabled={activeIdx === 0}
              className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="ChevronLeft" size={14} />
              {activeIdx > 0 ? TABS[activeIdx - 1].shortLabel : "—"}
            </button>
            <span className="font-mono text-xs text-muted-foreground">{activeIdx + 1} / {TABS.length}</span>
            <button
              onClick={() => activeIdx < TABS.length - 1 && setActiveTab(TABS[activeIdx + 1].id)}
              disabled={activeIdx === TABS.length - 1}
              className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {activeIdx < TABS.length - 1 ? TABS[activeIdx + 1].shortLabel : "—"}
              <Icon name="ChevronRight" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}