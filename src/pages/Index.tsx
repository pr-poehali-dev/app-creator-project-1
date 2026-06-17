import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import ReportPage from "./ReportPage";
import type { Customer, Contractor, License, Contract, ReportData } from "@/types/geo";
import { CustomersSection, ContractorsSection } from "@/components/geo/CustomersSections";
import { LicensesSection, ContractsSection } from "@/components/geo/LicensesContracts";
import { ReportsSection } from "@/components/geo/ReportsSection";

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

type Section = "customers" | "contractors" | "licenses" | "contracts" | "reports";

// ─── Initial Data ─────────────────────────────────────────────────────────────

const INIT_CUSTOMERS: Customer[] = [
  {
    id: "1",
    name: 'ООО "НедраГео"',
    director: "Петров Алексей Николаевич",
    inn: "7712345678",
    address: "г. Москва, ул. Нефтяная, д. 12",
  },
  {
    id: "2",
    name: 'СПК "Шашково"',
    director: "Кузьмин Владимир Николаевич",
    inn: "7610043745",
    address: "Ярославская область, Рыбинский р-н, Шашковский сельский округ, пос. Шашково",
  },
];

const INIT_CONTRACTORS: Contractor[] = [
  {
    id: "1",
    name: 'АО "ГеоПроект"',
    director: "Сидоров Виктор Павлович",
    chiefGeologist: "Кузнецов Дмитрий Иванович",
    responsible: "Иванов Сергей Михайлович",
    executors: [],
  },
  {
    id: "2",
    name: 'ООО "ЯрГеоЭксперт"',
    director: "Смирнов Андрей Васильевич",
    chiefGeologist: "Орлова Татьяна Юрьевна",
    responsible: "Орлова Т.Ю.",
    executors: [
      { id: "e1", lastName: "Орлова", initials: "Т.Ю.", position: "Гидрогеолог", degree: "" },
      { id: "e2", lastName: "Фёдоров", initials: "П.С.", position: "Буровой мастер", degree: "" },
    ],
  },
];

const INIT_LICENSES: License[] = [
  {
    id: "1",
    number: "МОС 12345 ТП",
    issueDate: "2023-03-15",
    ownerId: "1",
    siteName: "Участок Северный",
    useType: "search_eval",
  },
  {
    id: "2",
    number: "ЯРЛ 57970 ВЭ",
    issueDate: "2009-02-29",
    ownerId: "2",
    siteName: "Участок скважины № 1914а, пос. Шашково",
    useType: "exploration_mining",
  },
];

const INIT_CONTRACTS: Contract[] = [
  {
    id: "1",
    number: "ГК-2024/001",
    date: "2024-01-10",
    name: "Государственный контракт на проведение геологоразведочных работ",
  },
];

const REPORT2_ID = "2";

const INIT_REPORTS: ReportData[] = [
  {
    id: REPORT2_ID,
    title: 'Оценка эксплуатационных запасов подземных вод скважины № 1914а для водоснабжения СПК "Шашково" Рыбинского района Ярославской области',
    customerId: "2",
    contractorId: "2",
    licenseId: "2",
    contractId: "",
    responsible: "Орлова Т.Ю.",
    secrecy: "нс",
    place: "Ярославль",
    year: "2013",
    govRegNumber: "",
    coContractors: [],
    licenseNumber: "ЯРЛ 57970 ВЭ",
    licenseDate: "29.01.2013",
    licenseExpiry: "01.02.2024",
    licensePdfUrl: "",
    licensePdfName: "",
    siteDescription: "северо-восточная окраина пос. Шашково, Рыбинский муниципальный район Ярославской области",
    coordLat: "58° 00' 42\"",
    coordLon: "39° 11' 10\"",
    depthLimit: 80,
    extractionVolumeDayCurrent: 41,
    extractionVolumeYearCurrent: 15,
    extractionVolumeDayPlan: null,
    extractionVolumeYearPlan: null,
    waterUseType: "технологическое обеспечение водой предприятия",
    aquiferName: "окско-московский водно-ледниковый горизонт (f,lI IIok-ms)",
    aquiferDepthTop: 38,
    aquiferStaticLevel: 24,
    aquiferAllowableDrop: 38,
  },
];

// ─── Seed: заполняем секции Отчёта 2 при первом запуске ───────────────────────
function seedReport2() {
  const labelKey = `geo_label_${REPORT2_ID}`;
  if (localStorage.getItem(labelKey)) return; // уже засеяно

  // Этикетка
  localStorage.setItem(labelKey, JSON.stringify({
    copyNumber: 1,
    responsibleOverride: "Орлова Т.Ю.",
    totalBooks: 1,
    totalFolders: 1,
    bookNumber: 1,
    bookName: "",
  }));

  // Титульный лист
  localStorage.setItem(`geo_title_${REPORT2_ID}`, JSON.stringify({
    approverPosition: "Начальник отдела геологии и лицензирования по Ярославской области",
    approverName: "",
    approverDate: "",
    customerPosition: "Председатель СПК",
    customerName: "В.Н. Кузьмин",
    customerDate: "2013",
    responsibleOverride: "Орлова Т.Ю.",
  }));

  // Реферат
  localStorage.setItem(`geo_abstract_${REPORT2_ID}`, JSON.stringify({
    bibAuthors: "Орлова Т.Ю.",
    bibTitle: 'Оценка эксплуатационных запасов подземных вод скважины № 1914а для водоснабжения СПК "Шашково" Рыбинского района Ярославской области',
    bibYear: "2013",
    bibPlace: "Ярославль",
    bibPages: "",
    bibTables: "",
    bibIllustrations: "",
    bibBibliography: "",
    bibAppendices: "",
    bibCopyNumber: "1",
    fundDeposit: "Отчёт представляется в Территориальный фонд геологической информации по Центральному федеральному округу",
    abstractSubject: "Оценка эксплуатационных запасов подземных вод скважины № 1914а на участке пос. Шашково Рыбинского района Ярославской области",
    abstractGoals: 'Оценка эксплуатационных запасов подземных вод в соответствии с условиями лицензионного соглашения ЯРЛ 57970 ВЭ для технологического водоснабжения СПК "Шашково"',
    methods: [
      {
        id: "m1",
        name: "Гидрогеологическая съёмка и рекогносцировка",
        volume: "1",
        unit: "участок",
        coordSystem: "",
        coordFrom: "",
        coordTo: "",
      },
      {
        id: "m2",
        name: "Откачки опытные (одиночные)",
        volume: "1",
        unit: "скв.",
        coordSystem: "",
        coordFrom: "",
        coordTo: "",
      },
      {
        id: "m3",
        name: "Химический анализ воды",
        volume: "1",
        unit: "проба",
        coordSystem: "",
        coordFrom: "",
        coordTo: "",
      },
    ],
    abstractResults: 'Произведена оценка эксплуатационных запасов подземных вод скважины № 1914а. Водовмещающими породами являются флювиогляциальные отложения окско-московского горизонта. Статический уровень воды установился на глубине 24 м от поверхности земли. Эксплуатационный дебит скважины составляет 41 м³/сут (15 тыс.м³/год) при допустимом понижении уровня 38 м.',
    abstractConclusions: 'Эксплуатационные запасы подземных вод скважины № 1914а достаточны для обеспечения технологического водоснабжения СПК "Шашково" в объёме 41 м³/сут. Рекомендуется представить отчёт с подсчётом запасов на рассмотрение в Территориальную комиссию по запасам.',
    abstractEfficiency: 'Обеспечение СПК "Шашково" водой для технологических нужд предприятия в объёме 41 м³/сут (15 тыс.м³/год).',
    keywords: "подземные воды, эксплуатационные запасы, скважина, водоснабжение, гидрогеология, окско-московский горизонт, Рыбинский район",
    composerExecutorId: "e1",
    composerName: "Орлова Т.Ю.",
  }));

  // Введение
  localStorage.setItem(`geo_intro_${REPORT2_ID}`, JSON.stringify([
    {
      id: "i1",
      type: "text",
      content: 'Настоящий отчёт составлен по результатам работ, выполненных ООО "ЯрГеоЭксперт" в соответствии с условиями лицензионного соглашения ЯРЛ 57970 ВЭ к лицензии на право пользования недрами с целью добычи подземных вод.',
    },
    {
      id: "i2",
      type: "section",
      sectionTitle: "Местоположение участка работ",
      level: 1,
    },
    {
      id: "i3",
      type: "text",
      content: 'Участок работ расположен на северо-восточной окраине пос. Шашково Шашковского сельского округа Рыбинского муниципального района Ярославской области. Координаты устья скважины № 1914а: северная широта — 58° 00\' 42", восточная долгота — 39° 11\' 10".',
    },
    {
      id: "i4",
      type: "section",
      sectionTitle: "Цель и задачи работ",
      level: 1,
    },
    {
      id: "i5",
      type: "text",
      content: 'Целью работ является оценка эксплуатационных запасов подземных вод и представление отчёта с подсчётом запасов на рассмотрение в Территориальную комиссию по запасам в установленном порядке. Требуемый водоотбор составляет 41 м³/сут (15 тыс.м³/год) для технологического обеспечения водой предприятия.',
    },
    {
      id: "i6",
      type: "section",
      sectionTitle: "Краткая история изученности района",
      level: 1,
    },
    {
      id: "i7",
      type: "text",
      content: "На территории Рыбинского района ранее проводились региональные гидрогеологические съёмки. Скважина № 1914а пробурена в ранее изученный водоносный горизонт. Скважина № 1926 затампонирована в соответствии с условиями лицензионного соглашения.",
    },
  ]));

  // Основная часть
  localStorage.setItem(`geo_main_text_${REPORT2_ID}`, JSON.stringify([
    {
      id: "s1",
      level: 1,
      title: "Геолого-гидрогеологические условия района работ",
      blocks: [
        {
          id: "b1",
          type: "text",
          content: "В геологическом строении района участвуют четвертичные, верхнемеловые и каменноугольные отложения. Четвертичные образования представлены флювиогляциальными, ледниковыми и аллювиальными отложениями суммарной мощностью до 80 м.",
        },
        {
          id: "b2",
          type: "text",
          content: "Водовмещающими породами для скважины № 1914а являются флювиогляциальные отложения окско-московского горизонта (f,lI IIok-ms). Кровля горизонта залегает на глубине 38 м от поверхности земли. Статический уровень установился на глубине 24 м.",
        },
      ],
    },
    {
      id: "s2",
      level: 1,
      title: "Характеристика водозаборной скважины",
      blocks: [
        {
          id: "b3",
          type: "text",
          content: "Скважина № 1914а расположена на северо-восточной окраине пос. Шашково. Глубина скважины — 62 м. Статический уровень воды — 24 м от поверхности. Дебит скважины при откачке составил 41 м³/сут при понижении уровня 38 м.",
        },
        {
          id: "b4",
          type: "text",
          content: "Качество подземных вод соответствует требованиям СанПиН 2.1.4.1074-01 «Питьевая вода. Гигиенические требования к качеству воды централизованных систем питьевого водоснабжения. Контроль качества». Контроль качества воды осуществляется ежеквартально.",
        },
      ],
    },
    {
      id: "s3",
      level: 1,
      title: "Подсчёт эксплуатационных запасов",
      blocks: [
        {
          id: "b5",
          type: "text",
          content: "Оценка эксплуатационных запасов выполнена гидродинамическим методом по результатам опытной откачки. Расчётный дебит скважины составляет 41 м³/сут при допустимом понижении динамического уровня 38 м от статического положения.",
        },
        {
          id: "b6",
          type: "text",
          content: "Эксплуатационные запасы подземных вод рекомендуется утвердить в объёме 41 м³/сут (15 тыс.м³/год) по категории B для технологического водоснабжения предприятия.",
        },
      ],
    },
    {
      id: "s4",
      level: 1,
      title: "Мониторинг подземных вод",
      blocks: [
        {
          id: "b7",
          type: "text",
          content: "В соответствии с условиями лицензионного соглашения ЯРЛ 57970 ВЭ (п. 3.3) ведётся мониторинг подземных вод на объектном уровне: замеры уровня подземных вод в скважинах (ежемесячно), учёт отбора и использования воды по показаниям водомера в журнале водоотбора, контроль за качеством подземных вод (ежеквартально).",
        },
      ],
    },
  ]));

  // Заключение
  localStorage.setItem(`geo_conclusion_${REPORT2_ID}`, JSON.stringify([
    {
      id: "c1",
      type: "text",
      content: 'По результатам выполненных работ произведена оценка эксплуатационных запасов подземных вод скважины № 1914а в пос. Шашково Рыбинского района Ярославской области для технологического водоснабжения СПК "Шашково".',
    },
    {
      id: "c2",
      type: "text",
      content: "Водовмещающий горизонт — флювиогляциальные отложения окско-московского горизонта. Глубина кровли — 38 м. Статический уровень — 24 м. Эксплуатационный дебит — 41 м³/сут при понижении 38 м.",
    },
    {
      id: "c3",
      type: "text",
      content: "Качество воды соответствует нормативным требованиям. Рекомендуется утвердить запасы в объёме 41 м³/сут (15 тыс.м³/год) по категории B.",
    },
    {
      id: "c4",
      type: "text",
      content: "Результаты мониторинга подземных вод ежеквартально направляются в Территориальный центр по ведению мониторинга подземных вод в соответствии с п. 3.4 лицензионного соглашения ЯРЛ 57970 ВЭ.",
    },
  ]));
}

// ─── Nav Items ────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Section; label: string; icon: string }[] = [
  { id: "reports",     label: "Отчёты",      icon: "BookOpen"  },
  { id: "customers",   label: "Заказчики",    icon: "Building2" },
  { id: "contractors", label: "Исполнители",  icon: "HardHat"   },
  { id: "licenses",    label: "Лицензии",     icon: "FileKey"   },
  { id: "contracts",   label: "Контракты",    icon: "FileText"  },
];

const SOON_ITEMS: { icon: string; label: string }[] = [
  { icon: "FileOutput", label: "Экспорт PDF"   },
  { icon: "Table",      label: "Экспорт Excel" },
  { icon: "Bell",       label: "Уведомления"   },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Index() {
  // Заполняем данные тестового отчёта 2 один раз при первом запуске
  seedReport2();

  const [section, setSection] = useState<Section>("reports");
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [customers,    setCustomers]    = useLocalStorage<Customer[]>  ("geo_customers",    INIT_CUSTOMERS);
  const [contractors,  setContractors]  = useLocalStorage<Contractor[]>("geo_contractors",  INIT_CONTRACTORS);
  const [licenses,     setLicenses]     = useLocalStorage<License[]>   ("geo_licenses",     INIT_LICENSES);
  const [contracts,    setContracts]    = useLocalStorage<Contract[]>  ("geo_contracts",    INIT_CONTRACTS);
  const [reports,      setReports]      = useLocalStorage<ReportData[]>("geo_reports",      INIT_REPORTS);

  const handleReset = () => {
    // Удаляем все geo_* ключи из localStorage
    Object.keys(localStorage)
      .filter((k) => k.startsWith("geo_"))
      .forEach((k) => localStorage.removeItem(k));
    // Записываем начальные справочники
    localStorage.setItem("geo_customers",   JSON.stringify(INIT_CUSTOMERS));
    localStorage.setItem("geo_contractors", JSON.stringify(INIT_CONTRACTORS));
    localStorage.setItem("geo_licenses",    JSON.stringify(INIT_LICENSES));
    localStorage.setItem("geo_contracts",   JSON.stringify(INIT_CONTRACTS));
    localStorage.setItem("geo_reports",     JSON.stringify(INIT_REPORTS));
    // Пересеваем данные отчёта 2
    seedReport2();
    window.location.reload();
  };

  const openReport = reports.find((r) => r.id === openReportId);

  if (openReport) {
    return (
      <ReportPage
        report={openReport}
        customers={customers}
        contractors={contractors}
        licenses={licenses}
        contracts={contracts}
        onBack={() => setOpenReportId(null)}
        onUpdateReport={(r) => setReports((prev) => prev.map((x) => x.id === r.id ? r : x))}
      />
    );
  }

  const counts: Record<Section, number> = {
    reports:     reports.length,
    customers:   customers.length,
    contractors: contractors.length,
    licenses:    licenses.length,
    contracts:   contracts.length,
  };

  return (
    <div className="min-h-screen bg-background geo-grid-bg flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <Icon name="Mountain" size={18} className="text-geo-amber" />
              <span className="font-display text-lg tracking-[0.15em] uppercase text-foreground">ГеоОтчёт</span>
            </div>
            <span className="hidden sm:block font-mono text-xs text-muted-foreground border border-border px-2 py-0.5">
              ГОСТ Р 53579–2009
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-muted-foreground hidden sm:block">
              {new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-geo-green"></span>
              <span className="font-mono text-xs text-muted-foreground">АКТИВНО</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 border-r border-border bg-card/50 flex-shrink-0 hidden md:flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Справочники</p>
          </div>
          <nav className="flex flex-col p-2 gap-0.5 flex-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 text-left transition-all group border-l-2 ${
                  section === item.id
                    ? "bg-geo-amber/10 text-geo-amber border-geo-amber"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted border-transparent"
                }`}
              >
                <Icon name={item.icon} fallback="Circle" size={14} />
                <span className="text-xs font-display tracking-wider uppercase flex-1">{item.label}</span>
                <span className={`font-mono text-xs tabular-nums ${section === item.id ? "text-geo-amber" : "text-muted-foreground/50"}`}>
                  {String(counts[item.id]).padStart(2, "0")}
                </span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-border space-y-1">
            <p className="font-mono text-xs text-muted-foreground/50 uppercase tracking-widest mb-2">Скоро</p>
            {SOON_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground/30 px-1 py-1 cursor-not-allowed select-none">
                <Icon name={item.icon} fallback="Circle" size={12} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <button
              onClick={() => setResetConfirm(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/30 transition-all"
            >
              <Icon name="RotateCcw" size={12} />
              Сбросить данные
            </button>
          </div>
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden absolute top-14 left-0 right-0 z-30 border-b border-border bg-card/90 backdrop-blur-sm flex overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-xs font-display tracking-wider uppercase transition-colors border-b-2 ${
                section === item.id ? "text-geo-amber border-geo-amber" : "text-muted-foreground border-transparent"
              }`}
            >
              <Icon name={item.icon} fallback="Circle" size={12} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8 pt-20 md:pt-8">
            {section === "reports"     && <ReportsSection     reports={reports}         setReports={setReports}         customers={customers}   contractors={contractors} licenses={licenses} contracts={contracts} onOpen={setOpenReportId} />}
            {section === "customers"   && <CustomersSection   customers={customers}     setCustomers={setCustomers} />}
            {section === "contractors" && <ContractorsSection contractors={contractors} setContractors={setContractors} />}
            {section === "licenses"    && <LicensesSection    licenses={licenses}       setLicenses={setLicenses}       customers={customers} />}
            {section === "contracts"   && <ContractsSection   contracts={contracts}     setContracts={setContracts} />}
          </div>
        </main>
      </div>

      <footer className="border-t border-border px-6 py-2 flex items-center justify-between bg-card/50 flex-shrink-0">
        <span className="font-mono text-xs text-muted-foreground">Система формирования геологических отчётов</span>
        <span className="font-mono text-xs text-muted-foreground/50">v0.1.0</span>
      </footer>

      {resetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setResetConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm bg-card border border-border mx-4 animate-scale-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Icon name="TriangleAlert" size={16} className="text-destructive" />
                <h3 className="font-display text-base tracking-wider uppercase text-foreground">Сброс данных</h3>
              </div>
              <button onClick={() => setResetConfirm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Все данные (отчёты, справочники, заполненные разделы) будут удалены и заменены тестовыми данными. Действие необратимо.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 bg-destructive text-destructive-foreground py-2 text-sm font-display tracking-wider uppercase hover:opacity-90 transition-opacity"
                >
                  <Icon name="RotateCcw" size={14} />
                  Сбросить
                </button>
                <button
                  onClick={() => setResetConfirm(false)}
                  className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}