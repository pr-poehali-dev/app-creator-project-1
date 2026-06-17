export interface Customer {
  id: string;
  name: string;
  director: string;
  inn: string;
  address: string;
}

export interface Executor {
  id: string;
  lastName: string;
  initials: string;
  position: string;
  degree: string;
}

export interface Contractor {
  id: string;
  name: string;
  director: string;
  chiefGeologist: string;
  responsible: string;
  executors: Executor[];
}

export interface License {
  id: string;
  number: string;
  issueDate: string;
  ownerId: string;
  siteName: string;
  useType: "search_eval" | "exploration_mining";
}

export interface Contract {
  id: string;
  number: string;
  date: string;
  name: string;
}

export interface CoContractor {
  contractorId: string;
}

export type Secrecy = "нс" | "КТ" | "С" | "СС" | "ОВ";

export const SECRECY_OPTIONS: { value: Secrecy; label: string; desc: string }[] = [
  { value: "нс", label: "нс", desc: "Не секретно" },
  { value: "КТ", label: "КТ", desc: "Коммерческая тайна" },
  { value: "С", label: "С", desc: "Секретно" },
  { value: "СС", label: "СС", desc: "Совершенно секретно" },
  { value: "ОВ", label: "ОВ", desc: "Особой важности" },
];

export interface ReportData {
  id: string;
  title: string;
  customerId: string;
  contractorId: string;
  licenseId: string;
  contractId: string;
  responsible: string;
  secrecy: Secrecy;
  place: string;
  year: string;
  govRegNumber: string;
  coContractors: CoContractor[];

  // Сведения о лицензии на недропользование
  licenseNumber: string;         // Номер лицензии (ЯРЛ 57970 ВЭ)
  licenseDate: string;           // Дата выдачи лицензии
  licenseExpiry: string;         // Срок действия до
  licensePdfUrl: string;         // URL загруженного PDF лицензии
  licensePdfName: string;        // Имя файла PDF

  // Участок недр
  siteDescription: string;       // Описание участка (адм.-территор. расположение)
  coordLat: string;              // Северная широта (58° 00' 42")
  coordLon: string;              // Восточная долгота (39° 11' 10")
  depthLimit: number | null;     // Ограничение по глубине, м

  // Добыча подземных вод
  extractionVolumeDayCurrent: number | null;  // Объём добычи м³/сут (текущий)
  extractionVolumeYearCurrent: number | null; // Объём добычи тыс.м³/год (текущий)
  extractionVolumeDayPlan: number | null;     // Объём добычи м³/сут (перспектива)
  extractionVolumeYearPlan: number | null;    // Объём добычи тыс.м³/год (перспектива)
  waterUseType: string;          // Цель использования воды

  // Водоносный горизонт
  aquiferName: string;           // Наименование водоносного горизонта
  aquiferDepthTop: number | null;   // Кровля залегания, м
  aquiferStaticLevel: number | null; // Статический уровень, м от поверхности
  aquiferAllowableDrop: number | null; // Допустимое понижение уровня, м
}