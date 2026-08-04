import type { Customer, Contractor, License, ReportData } from "@/types/geo";

// ─── Модель паспорта ГКМ (государственный кадастр месторождений) ────────────────
// Универсальная модель под все массивы. Значения полей хранятся в плоском
// словаре data: Record<string, string>. Форма строится по декларативной схеме.

export type FieldType = "text" | "textarea" | "number" | "date" | "select";

export interface PassportField {
  key: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  hint?: string;
  full?: boolean; // занимать всю ширину строки
}

export interface PassportSection {
  id: string;
  title: string;
  icon: string;
  fields: PassportField[];
}

export interface PassportData {
  [key: string]: string;
}

export interface GkmPassport {
  reportId: string;
  massif: string;
  data: PassportData;
}

// Массивы ГКМ по видам полезных ископаемых (классификация Роснедр).
export const MASSIFS: { code: string; label: string }[] = [
  { code: "A", label: "«А» — металлические (рудные) ПИ" },
  { code: "B", label: "«Б» — неметаллические ПИ (в т.ч. строительные, песок)" },
  { code: "V", label: "«В» — уголь и горючие сланцы" },
  { code: "G", label: "«Г» — нефть и газ" },
  { code: "D", label: "«Д» — торф" },
  { code: "E", label: "«Е» — сапропель" },
  { code: "Z", label: "«З» — подземные воды" },
  { code: "I", label: "«И» — лечебные грязи" },
];

export const massifLabel = (code: string) =>
  MASSIFS.find((m) => m.code === code)?.label || "— не выбран —";

// ── Общие разделы паспорта (для всех массивов) ────────────────────────────────

const SECTION_REG: PassportSection = {
  id: "reg",
  title: "Регистрационные сведения",
  icon: "Hash",
  fields: [
    { key: "cadastreNumber", label: "Номер объекта в ГКМ", placeholder: "0000000" },
    { key: "passportYear", label: "Год составления паспорта", type: "number", placeholder: "2024" },
    { key: "objectName", label: "Наименование месторождения / участка", full: true },
    { key: "objectType", label: "Тип объекта", type: "select", options: [
      { value: "deposit", label: "Месторождение" },
      { value: "occurrence", label: "Проявление" },
      { value: "site", label: "Участок недр" },
    ] },
    { key: "mineral", label: "Полезное ископаемое", placeholder: "Подземные воды / песок строительный" },
  ],
};

const SECTION_LOCATION: PassportSection = {
  id: "location",
  title: "Географо-административное положение",
  icon: "MapPin",
  fields: [
    { key: "region", label: "Субъект РФ", placeholder: "Ярославская область" },
    { key: "district", label: "Административный район", placeholder: "Рыбинский МР" },
    { key: "nearestSettlement", label: "Ближайший населённый пункт", placeholder: "пос. Шашково" },
    { key: "mapSheet", label: "Номенклатура листа карты", placeholder: "O-37-XII" },
    { key: "coordLat", label: "Координаты — широта", placeholder: "58° 00′ 42″" },
    { key: "coordLon", label: "Координаты — долгота", placeholder: "39° 11′ 10″" },
    { key: "locationDesc", label: "Описание расположения", type: "textarea", full: true },
  ],
};

const SECTION_GEOLOGY: PassportSection = {
  id: "geology",
  title: "Геологическая характеристика",
  icon: "Mountain",
  fields: [
    { key: "geneticType", label: "Генетический / промышленный тип" },
    { key: "hostRocks", label: "Вмещающие породы" },
    { key: "qualityChar", label: "Качественная характеристика сырья", type: "textarea", full: true },
  ],
};

const SECTION_RESERVES: PassportSection = {
  id: "reserves",
  title: "Запасы и их движение",
  icon: "Layers",
  fields: [
    { key: "reservesUnit", label: "Единица измерения запасов", placeholder: "тыс. м³ / м³/сут" },
    { key: "reservesA", label: "Запасы кат. A" },
    { key: "reservesB", label: "Запасы кат. B" },
    { key: "reservesC1", label: "Запасы кат. C1" },
    { key: "reservesC2", label: "Запасы кат. C2" },
    { key: "reservesApproveDoc", label: "Протокол утверждения (ГКЗ/ТКЗ)", placeholder: "№ 000 от 00.00.0000", full: true },
    { key: "extraction", label: "Добыча (за период)" },
    { key: "remainder", label: "Остаток запасов" },
  ],
};

const SECTION_DEVELOP: PassportSection = {
  id: "develop",
  title: "Освоение и недропользование",
  icon: "FileKey",
  fields: [
    { key: "developStage", label: "Степень освоения", type: "select", options: [
      { value: "explored", label: "Разведано" },
      { value: "operated", label: "В эксплуатации" },
      { value: "reserve", label: "Резерв / нераспределённый фонд" },
    ] },
    { key: "licenseNumber", label: "Номер лицензии" },
    { key: "licenseExpiry", label: "Срок действия лицензии" },
    { key: "subsoilUser", label: "Недропользователь", full: true },
  ],
};

const SECTION_SOURCE: PassportSection = {
  id: "source",
  title: "Источник информации",
  icon: "BookOpen",
  fields: [
    { key: "reportRef", label: "Отчёт (авторы, год)", full: true },
    { key: "govRegNumber", label: "Номер госрегистрации отчёта" },
    { key: "compiledBy", label: "Составитель паспорта" },
  ],
};

// ── Специфичные разделы под массивы ───────────────────────────────────────────

const SECTION_WATER: PassportSection = {
  id: "water",
  title: "Гидрогеологические сведения (массив «З»)",
  icon: "Droplet",
  fields: [
    { key: "aquiferName", label: "Водоносный горизонт" },
    { key: "aquiferDepthTop", label: "Кровля залегания, м", type: "number" },
    { key: "staticLevel", label: "Статический уровень, м", type: "number" },
    { key: "allowableDrop", label: "Допустимое понижение, м", type: "number" },
    { key: "waterType", label: "Тип вод", type: "select", options: [
      { value: "potable", label: "Питьевые" },
      { value: "technical", label: "Технические" },
      { value: "mineral", label: "Минеральные" },
    ] },
    { key: "waterUse", label: "Целевое использование" },
    { key: "extractDay", label: "Водоотбор, м³/сут", type: "number" },
    { key: "extractYear", label: "Водоотбор, тыс. м³/год", type: "number" },
  ],
};

const SECTION_SOLID: PassportSection = {
  id: "solid",
  title: "Горнотехнические сведения (твёрдые ПИ)",
  icon: "Pickaxe",
  fields: [
    { key: "oreBodyForm", label: "Форма залежи / рудного тела" },
    { key: "thickness", label: "Мощность полезной толщи, м" },
    { key: "overburden", label: "Мощность вскрыши, м" },
    { key: "miningMethod", label: "Способ отработки", type: "select", options: [
      { value: "open", label: "Открытый (карьер)" },
      { value: "underground", label: "Подземный (шахта)" },
    ] },
  ],
};

const SECTION_HC: PassportSection = {
  id: "hc",
  title: "Сведения по УВ-сырью (массив «Г»)",
  icon: "Flame",
  fields: [
    { key: "reservoirType", label: "Тип коллектора" },
    { key: "depositDepth", label: "Глубина залегания, м", type: "number" },
    { key: "porosity", label: "Пористость, %", type: "number" },
    { key: "recoveryFactor", label: "Коэффициент извлечения" },
  ],
};

// Специфичный раздел по массиву (или null)
export function massifSection(massif: string): PassportSection | null {
  if (massif === "Z" || massif === "I") return SECTION_WATER;
  if (massif === "G") return SECTION_HC;
  if (massif === "A" || massif === "B" || massif === "V" || massif === "D" || massif === "E") return SECTION_SOLID;
  return null;
}

// Полная схема разделов для выбранного массива
export function passportSchema(massif: string): PassportSection[] {
  const spec = massifSection(massif);
  const sections = [SECTION_REG, SECTION_LOCATION, SECTION_GEOLOGY];
  if (spec) sections.push(spec);
  sections.push(SECTION_RESERVES, SECTION_DEVELOP, SECTION_SOURCE);
  return sections;
}

// ── Автозаполнение из отчёта / лицензии / заказчика / исполнителя ──────────────

export function autofillFromReport(
  report: ReportData,
  ctx: { customer?: Customer; contractor?: Contractor; license?: License },
): PassportData {
  const { customer, contractor, license } = ctx;
  const executors = contractor?.executors || [];
  const authors = executors.map((e) => `${e.lastName} ${e.initials}`).join(", ");

  const fill: PassportData = {
    objectName: license?.siteName || report.siteDescription || report.title || "",
    passportYear: report.year || "",
    mineral: report.waterUseType ? "Подземные воды" : "",
    locationDesc: report.siteDescription || "",
    coordLat: report.coordLat || "",
    coordLon: report.coordLon || "",
    licenseNumber: report.licenseNumber || license?.number || "",
    licenseExpiry: report.licenseExpiry || "",
    subsoilUser: customer?.name || "",
    govRegNumber: report.govRegNumber || "",
    reportRef: [authors, report.year].filter(Boolean).join(", "),
    compiledBy: contractor?.responsible || report.responsible || "",
    // Гидрогеология
    aquiferName: report.aquiferName || "",
    aquiferDepthTop: report.aquiferDepthTop != null ? String(report.aquiferDepthTop) : "",
    staticLevel: report.aquiferStaticLevel != null ? String(report.aquiferStaticLevel) : "",
    allowableDrop: report.aquiferAllowableDrop != null ? String(report.aquiferAllowableDrop) : "",
    waterUse: report.waterUseType || "",
    extractDay: report.extractionVolumeDayCurrent != null ? String(report.extractionVolumeDayCurrent) : "",
    extractYear: report.extractionVolumeYearCurrent != null ? String(report.extractionVolumeYearCurrent) : "",
  };

  // Массив предполагаем по данным отчёта: есть водные поля → «З», иначе «Б»
  return fill;
}

export function guessMassif(report: ReportData): string {
  if (report.aquiferName || report.waterUseType || report.extractionVolumeDayCurrent != null) return "Z";
  return "B";
}
