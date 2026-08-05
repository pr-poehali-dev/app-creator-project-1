import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { Secrecy, Contractor } from "@/types/geo";
import { IntroSection } from "./IntroSection";
import { MainTextSection } from "./MainSection";
import { ConclusionSection } from "./ConclusionSection";
import { SectionMeta } from "./SectionMeta";
import { useDirtyKeys } from "@/lib/useDirtyTabs";

type SubTab = "intro" | "main" | "conclusion";

const SUB_TABS: { id: SubTab; label: string; shortLabel: string; icon: string; description: string }[] = [
  {
    id: "intro",
    label: "Введение",
    shortLabel: "Введение",
    icon: "BookOpenCheck",
    description: "Основания и цели работ, географическое и административное положение, обзор ранее проведённых работ",
  },
  {
    id: "main",
    label: "Основная часть",
    shortLabel: "Осн. часть",
    icon: "FileText",
    description: "Разделы и подразделы текстового изложения результатов работ по всем видам исследований",
  },
  {
    id: "conclusion",
    label: "Заключение",
    shortLabel: "Заключение",
    icon: "CheckSquare",
    description: "Основные результаты и выводы, рекомендации по дальнейшим работам",
  },
];

interface TextPartSectionProps {
  reportId: string;
  secrecy: Secrecy;
  responsible: string;
  contractor?: Contractor;
  contractors?: Contractor[];
}

// Подвкладка → ключ черновика
const SUB_DRAFT: Record<SubTab, string> = { intro: "intro", main: "main_text", conclusion: "conclusion" };

export function TextPartSection({ reportId, secrecy, responsible, contractor, contractors = [] }: TextPartSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("intro");
  // Подразделы с несохранёнными правками
  const dirtyDrafts = useDirtyKeys();

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="ScrollText" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Текстовая часть отчёта</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 12 · обязательный</p>
      </div>

      {/* Sub-tab navigation */}
      <div className="grid grid-cols-3 border border-border overflow-hidden">
        {SUB_TABS.map((tab, idx) => {
          const isActive = tab.id === activeSubTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex flex-col items-center gap-2 px-4 py-4 text-center transition-colors border-r last:border-r-0 border-border ${
                isActive
                  ? "bg-geo-amber/10 border-b-2 border-b-geo-amber"
                  : "hover:bg-muted/30"
              }`}
            >
              <div className={`flex items-center gap-2 ${isActive ? "text-geo-amber" : "text-muted-foreground"}`}>
                <Icon name={tab.icon} fallback="FileText" size={15} />
                <span className={`font-display text-xs tracking-wider uppercase ${isActive ? "text-geo-amber" : "text-muted-foreground"}`}>
                  {tab.label}
                </span>
                {dirtyDrafts.has(SUB_DRAFT[tab.id]) && (
                  <span
                    title="Есть несохранённые изменения"
                    className="w-1.5 h-1.5 rounded-full bg-geo-amber flex-shrink-0 animate-pulse"
                  />
                )}
              </div>
              <span className="font-mono text-xs text-muted-foreground/50 leading-tight hidden sm:block">{idx + 1} из 3</span>
            </button>
          );
        })}
      </div>

      {/* SectionMeta — per sub-tab */}
      <SectionMeta
        reportId={reportId}
        tabId={
          activeSubTab === "intro"
            ? "text_part_intro"
            : activeSubTab === "main"
            ? "text_part_main"
            : "text_part_conc"
        }
        secrecy={secrecy}
        responsible={responsible}
        contractor={contractor}
        contractors={contractors}
      />

      {/* Подразделы держим смонтированными: переключение между ними
          не должно терять несохранённый черновик */}
      <div>
        <div className={activeSubTab === "intro" ? "" : "hidden"}>
          <IntroSection reportId={reportId} />
        </div>
        <div className={activeSubTab === "main" ? "" : "hidden"}>
          <MainTextSection reportId={reportId} />
        </div>
        <div className={activeSubTab === "conclusion" ? "" : "hidden"}>
          <ConclusionSection reportId={reportId} />
        </div>
      </div>
    </div>
  );
}