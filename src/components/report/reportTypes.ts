// ─── Tab definitions ──────────────────────────────────────────────────────────

export type TabId =
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

export interface TabDef {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: string;
  note?: string;
}

export const TABS: TabDef[] = [
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

// ─── Section data interfaces ──────────────────────────────────────────────────

export interface LabelData {
  copyNumber: number;
  responsibleOverride: string;
  totalBooks: number;
  totalFolders: number;
  bookNumber: number;
  bookName: string;
}

export const DEFAULT_LABEL: LabelData = {
  copyNumber: 1,
  responsibleOverride: "",
  totalBooks: 1,
  totalFolders: 1,
  bookNumber: 1,
  bookName: "",
};

export interface TitlePageData {
  approverPosition: string;
  approverName: string;
  approverDate: string;
  customerPosition: string;
  customerName: string;
  customerDate: string;
  responsibleOverride: string;
}

export const DEFAULT_TITLE_PAGE: TitlePageData = {
  approverPosition: "",
  approverName: "",
  approverDate: "",
  customerPosition: "",
  customerName: "",
  customerDate: "",
  responsibleOverride: "",
};

export interface WorkMethod {
  id: string;
  name: string;
  volume: string;
  unit: string;
  coordSystem: string;
  coordFrom: string;
  coordTo: string;
}

export interface AbstractData {
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
  fundDeposit: string;
  abstractSubject: string;
  abstractGoals: string;
  methods: WorkMethod[];
  abstractResults: string;
  abstractConclusions: string;
  abstractEfficiency: string;
  keywords: string;
  composerExecutorId: string;
  composerName: string;
}

export const DEFAULT_ABSTRACT: AbstractData = {
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

export interface TaskFile {
  url: string;
  filename: string;
  uploadedAt: string;
}

export interface ContentsEntry {
  id: string;
  level: 0 | 1 | 2;
  title: string;
  page: string;
  status: "filled" | "empty" | "partial" | "file";
  note?: string;
}

export const UPLOAD_URL = "https://functions.poehali.dev/99a0258c-48d9-44f9-889c-adeaad6c8527";

export interface Illustration {
  id: string;
  number: number;
  title: string;
  url: string;
  filename: string;
  textPage: string;
  uploadedAt: string;
}