import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { MainSection } from "./reportTypes";
import { syncAllFromText } from "./syncFromText";
import { newId, buildBlockNumbers } from "./MainSectionHelpers";
import { SectionCard } from "./MainSectionCard";

// ─── MainTextSection ──────────────────────────────────────────────────────────

export function MainTextSection({ reportId }: { reportId: string }) {
  const storageKey = `geo_main_text_${reportId}`;

  const load = (): MainSection[] => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  };
  const persist = (sections: MainSection[]) => localStorage.setItem(storageKey, JSON.stringify(sections));

  const [sections, setSections] = useState<MainSection[]>(load);

  const update = (next: MainSection[]) => {
    setSections(next);
    persist(next);
    syncAllFromText(reportId, next);
  };

  const addSection = (level: 1 | 2) => {
    update([...sections, { id: newId(), level, title: "", blocks: [] }]);
  };

  const changeSection = (id: string, s: MainSection) => update(sections.map((sec) => sec.id === id ? s : sec));
  const deleteSection = (id: string) => update(sections.filter((sec) => sec.id !== id));
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...sections];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    update(next);
  };

  // Номера таблиц и иллюстраций по blockId (пересчитываются при каждом изменении)
  const blockNumbers = buildBlockNumbers(sections);

  // Нумерация: разделы начиная с 2 (Введение = 1), подразделы X.1, X.2...
  const sectionNumbers = (() => {
    let sectionNum = 1; // старт с 2 после Введения
    let subNum = 0;
    return sections.map((s) => {
      if (s.level === 1) {
        sectionNum++;
        subNum = 0;
        return `${sectionNum}`;
      } else {
        subNum++;
        return `${sectionNum}.${subNum}`;
      }
    });
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/60 uppercase tracking-widest">
          <Icon name="FileText" size={13} className="text-geo-amber/60" />
          Основная часть
          {sections.length > 0 && <span className="text-geo-amber">{sections.length} разд.</span>}
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="border border-dashed border-border py-14 flex flex-col items-center gap-4 text-center px-8">
          <Icon name="FileText" size={26} className="text-muted-foreground/20" />
          <div className="space-y-1 max-w-sm">
            <p className="text-sm text-foreground/60 font-medium">Основная часть пустая</p>
            <p className="text-xs text-muted-foreground/50 font-mono leading-relaxed">
              Добавляйте разделы и подразделы, внутри каждого — текст, иллюстрации, таблицы и ссылки на приложения
            </p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <button onClick={() => addSection(1)} className="flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-mono text-muted-foreground hover:border-geo-amber hover:text-geo-amber transition-colors">
              <Icon name="Heading2" size={12} /> Добавить раздел
            </button>
            <button onClick={() => addSection(2)} className="flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-mono text-muted-foreground hover:border-geo-amber hover:text-geo-amber transition-colors">
              <Icon name="Heading3" size={12} /> Добавить подраздел
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, idx) => (
            <SectionCard
              key={section.id}
              section={section}
              onChange={(s) => changeSection(section.id, s)}
              onDelete={() => deleteSection(section.id)}
              onMoveUp={() => move(idx, -1)}
              onMoveDown={() => move(idx, 1)}
              isFirst={idx === 0}
              isLast={idx === sections.length - 1}
              reportId={reportId}
              sectionNum={sectionNumbers[idx]}
              blockNumbers={blockNumbers}
            />
          ))}

          {/* Add section buttons */}
          <div className="flex gap-2 pt-1">
            <button onClick={() => addSection(1)} className="flex items-center gap-1.5 border border-dashed border-border/60 text-muted-foreground/50 hover:border-geo-amber/50 hover:text-geo-amber/70 px-4 py-2 text-xs font-mono flex-1 justify-center transition-colors">
              <Icon name="Plus" size={12} /> Раздел
            </button>
            <button onClick={() => addSection(2)} className="flex items-center gap-1.5 border border-dashed border-border/60 text-muted-foreground/50 hover:border-geo-amber/50 hover:text-geo-amber/70 px-4 py-2 text-xs font-mono flex-1 justify-center transition-colors">
              <Icon name="Plus" size={12} /> Подраздел
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
