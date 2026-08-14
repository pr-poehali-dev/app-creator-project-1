import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import type { ReportData, Customer, Contractor, License, Contract } from "@/types/geo";
import { StudySection } from "@/components/report/StudySection";
import { PassportSection } from "@/components/report/PassportSection";
import { KitReferences } from "./KitReferences";
import type { RefKind } from "@/lib/referencesApi";
import { hasUnsaved, saveAllDrafts, revertAllDrafts } from "@/lib/draftRegistry";
import { UnsavedChangesModal } from "@/components/report/UnsavedChangesModal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// ─── Комплект геологической информации ────────────────────────────────────────
// Комплект: общие сведения (справочники из общей БД) + 4 элемента.

type KitElementId = "refs" | "report" | "primary" | "study" | "passport";

const KIT_ELEMENTS: {
  id: KitElementId;
  title: string;
  subtitle: string;
  icon: string;
  ready: boolean;
}[] = [
  {
    id: "refs",
    title: "Общие сведения",
    subtitle: "Заказчик, исполнитель, лицензия, контракт — из общей базы",
    icon: "ClipboardList",
    ready: true,
  },
  {
    id: "report",
    title: "Отчёт",
    subtitle: "ГОСТ Р 53579–2009 · титул, реферат, текст, приложения",
    icon: "BookOpen",
    ready: true,
  },
  {
    id: "primary",
    title: "Первичная геологическая информация",
    subtitle: "Связана с методами реферата (виды и объёмы работ)",
    icon: "Database",
    ready: false,
  },
  {
    id: "study",
    title: "Изученность",
    subtitle: "Топооснова с координатами · связана с методами реферата",
    icon: "Search",
    ready: true,
  },
  {
    id: "passport",
    title: "Паспорт ГКМ",
    subtitle: "Государственный кадастр месторождений · все массивы, автозаполнение",
    icon: "FileText",
    ready: true,
  },
];

interface KitPageProps {
  report: ReportData;
  customers: Customer[];
  contractors: Contractor[];
  licenses: License[];
  contracts: Contract[];
  refsLoading: boolean;
  onSaveRef: <T extends { id: string }>(kind: RefKind, item: T) => Promise<void>;
  onDeleteRef: (kind: RefKind, id: string) => Promise<void>;
  onBack: () => void;
  onOpenReport: () => void;
  onUpdateReport: (r: ReportData) => void;
}

export default function KitPage({ report, customers, contractors, licenses, contracts, refsLoading, onSaveRef, onBack, onOpenReport, onUpdateReport }: KitPageProps) {
  const [openElement, setOpenElement] = useState<Exclude<KitElementId, "report"> | null>(null);
  // Отложенный переход: ждём решения по несохранённым правкам (напр. «Изученность»)
  const [pendingNav, setPendingNav] = useState<null | (() => void)>(null);

  const guardNav = (go: () => void) => {
    if (hasUnsaved()) setPendingNav(() => go);
    else go();
  };

  // Предупреждение при закрытии вкладки браузера
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsaved()) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const customer = customers.find((c) => c.id === report.customerId);
  const contractor = contractors.find((c) => c.id === report.contractorId);
  const license = licenses.find((l) => l.id === report.licenseId);
  const contract = contracts.find((c) => c.id === report.contractId);

  const openEl = KIT_ELEMENTS.find((e) => e.id === openElement);

  const handleOpen = (id: KitElementId) => {
    guardNav(() => {
      if (id === "report") { onOpenReport(); return; }
      setOpenElement(id);
    });
  };

  const meta: { label: string; value?: string }[] = [
    { label: "Заказчик", value: customer?.name },
    { label: "Исполнитель", value: contractor?.name },
    { label: "Лицензия", value: license ? `${license.number} · ${license.siteName}` : undefined },
    { label: "Контракт", value: contract ? `№ ${contract.number}` : undefined },
    { label: "Место / год", value: report.place && report.year ? `${report.place}, ${report.year}` : undefined },
  ];

  return (
    <div className="min-h-screen bg-background geo-grid-bg flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => guardNav(openElement ? () => setOpenElement(null) : onBack)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs font-mono"
            >
              <Icon name="ChevronLeft" size={16} />
              {openElement ? "Комплект" : "Комплекты"}
            </button>
            <span className="text-border">/</span>
            <div className="flex items-center gap-2">
              <Icon name="Layers" size={15} className="text-geo-amber" />
              <span className="font-display text-sm tracking-wider uppercase text-foreground truncate max-w-md">
                {report.title || "Без названия"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground hidden sm:block border border-border px-2 py-0.5">
              Комплект геологической информации
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {openEl?.id === "refs" ? (
            <KitReferences
              report={report}
              customers={customers}
              contractors={contractors}
              licenses={licenses}
              contracts={contracts}
              loading={refsLoading}
              onSaveRef={onSaveRef}
              onUpdateReport={onUpdateReport}
            />
          ) : openEl?.id === "study" ? (
            <StudySection reportId={report.id} />
          ) : openEl?.id === "passport" ? (
            <PassportSection report={report} customer={customer} contractor={contractor} license={license} />
          ) : openEl ? (
            /* Пустой раздел-заготовка */
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <Icon name={openEl.icon} fallback="File" size={20} className="text-geo-amber" />
                <div>
                  <h1 className="font-display text-xl tracking-wider uppercase text-foreground">{openEl.title}</h1>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">{openEl.subtitle}</p>
                </div>
              </div>
              <div className="border border-dashed border-border py-20 text-center">
                <Icon name="Construction" fallback="Wrench" size={28} className="text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-mono">Раздел в разработке</p>
                <p className="text-xs text-muted-foreground/50 font-mono mt-1">Скоро здесь появятся данные</p>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h1 className="font-display text-xl tracking-wider uppercase text-foreground">Комплект геологической информации</h1>
                <p className="font-mono text-xs text-muted-foreground mt-1">Общие сведения и 4 элемента комплекта</p>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mb-6 border-b border-border pb-4">
                {meta.map((item) =>
                  item.value ? (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground/60 uppercase tracking-widest">{item.label}:</span>
                      <span className="font-mono text-xs text-foreground/70">{item.value}</span>
                    </div>
                  ) : null
                )}
              </div>

              {/* Элементы комплекта */}
              <div className="grid gap-3 sm:grid-cols-2">
                {KIT_ELEMENTS.map((el, idx) => (
                  <button
                    key={el.id}
                    onClick={() => handleOpen(el.id)}
                    className="group text-left border border-border bg-card/50 hover:bg-card hover:border-geo-amber/50 transition-all p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-muted-foreground/30 w-4">{String(idx + 1).padStart(2, "0")}</span>
                      <Icon name={el.icon} fallback="File" size={16} className="text-geo-amber flex-shrink-0" />
                      <span className="font-display text-sm tracking-wider uppercase text-foreground flex-1 leading-tight">{el.title}</span>
                      <Icon name="ChevronRight" size={14} className="text-muted-foreground/40 group-hover:text-geo-amber transition-colors" />
                    </div>
                    <p className="font-mono text-xs text-muted-foreground/70 leading-relaxed pl-6">{el.subtitle}</p>
                    <span className={`font-mono text-xs pl-6 ${el.ready ? "text-geo-green" : "text-muted-foreground/40"}`}>
                      {el.ready ? "Готово к работе" : "В разработке"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {pendingNav && (
        <UnsavedChangesModal
          onSave={async () => {
            const ok = await saveAllDrafts();
            if (ok) { pendingNav(); setPendingNav(null); }
          }}
          onDiscard={() => { revertAllDrafts(); pendingNav(); setPendingNav(null); }}
          onStay={() => setPendingNav(null)}
        />
      )}
    </div>
  );
}