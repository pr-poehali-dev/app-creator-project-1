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
}
