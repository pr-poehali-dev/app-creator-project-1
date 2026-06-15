import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { Secrecy, Contractor, Executor } from "@/types/geo";
import type { TabId } from "./reportTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SectionAuthor {
  executorId: string;
  name: string;
  position?: string;
  company?: string;
}

export interface SectionMetaData {
  authors: SectionAuthor[];
}

const SECRECY_COLOR: Record<Secrecy, string> = {
  "нс": "text-muted-foreground border-muted-foreground/40 bg-muted/20",
  "КТ": "text-blue-400 border-blue-400/50 bg-blue-400/5",
  "С":  "text-geo-amber border-geo-amber/60 bg-geo-amber/5",
  "СС": "text-orange-400 border-orange-400/60 bg-orange-400/5",
  "ОВ": "text-destructive border-destructive/60 bg-destructive/5",
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function storageKey(reportId: string, tabId: TabId) {
  return `geo_section_meta_${reportId}_${tabId}`;
}

function loadMeta(reportId: string, tabId: TabId): SectionMetaData {
  try { return JSON.parse(localStorage.getItem(storageKey(reportId, tabId)) || "null") ?? { authors: [] }; }
  catch { return { authors: [] }; }
}

function saveMeta(reportId: string, tabId: TabId, data: SectionMetaData) {
  localStorage.setItem(storageKey(reportId, tabId), JSON.stringify(data));
}

// ─── SectionMeta component ────────────────────────────────────────────────────

export function SectionMeta({
  reportId,
  tabId,
  secrecy,
  responsible,
  contractor,
  contractors = [],
}: {
  reportId: string;
  tabId: TabId;
  secrecy: Secrecy;
  responsible: string;
  contractor?: Contractor;
  contractors?: Contractor[];
}) {
  const [meta, setMeta] = useState<SectionMetaData>(() => loadMeta(reportId, tabId));
  const [expanded, setExpanded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const persist = (next: SectionMetaData) => {
    setMeta(next);
    saveMeta(reportId, tabId, next);
  };

  // Collect all available executors across contractor + co-contractors
  const allExecutors: { executor: Executor; companyName: string }[] = [];
  if (contractor) {
    if (contractor.responsible) {
      allExecutors.push({
        executor: { id: "resp_main", lastName: responsible || contractor.responsible, initials: "", position: "ответственный исполнитель", degree: "" },
        companyName: contractor.name,
      });
    }
    (contractor.executors || []).forEach((e) =>
      allExecutors.push({ executor: e, companyName: contractor.name })
    );
  }
  contractors.forEach((c) => {
    if (c.id === contractor?.id) return;
    (c.executors || []).forEach((e) => allExecutors.push({ executor: e, companyName: c.name }));
  });

  const addAuthor = (exec: { executor: Executor; companyName: string }) => {
    if (meta.authors.some((a) => a.executorId === exec.executor.id)) return;
    const next: SectionMetaData = {
      authors: [...meta.authors, {
        executorId: exec.executor.id,
        name: `${exec.executor.lastName}${exec.executor.initials ? " " + exec.executor.initials : ""}`,
        position: exec.executor.position,
        company: exec.companyName,
      }],
    };
    persist(next);
    setPickerOpen(false);
  };

  const removeAuthor = (id: string) => {
    persist({ authors: meta.authors.filter((a) => a.executorId !== id) });
  };

  // Default author = responsible
  const defaultAuthorName = responsible || contractor?.responsible || "—";
  const hasCustomAuthors = meta.authors.length > 0;

  return (
    <div className="border border-border/60 bg-muted/10 overflow-hidden">
      {/* Collapsed bar */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors text-left"
      >
        {/* Secrecy badge */}
        <span className={`font-mono text-xs font-bold border px-2 py-0.5 flex-shrink-0 ${SECRECY_COLOR[secrecy] || "text-foreground border-border"}`}>
          {secrecy}
        </span>

        {/* Authors summary */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Icon name="User" size={11} className="text-muted-foreground/40 flex-shrink-0" />
          <span className="text-xs font-mono text-muted-foreground/60 truncate">
            {hasCustomAuthors
              ? meta.authors.map((a) => a.name).join(", ")
              : defaultAuthorName}
          </span>
          {hasCustomAuthors && (
            <span className="font-mono text-xs text-geo-amber/60 flex-shrink-0">
              · {meta.authors.length} авт.
            </span>
          )}
        </div>

        <Icon
          name={expanded ? "ChevronUp" : "ChevronDown"}
          size={13}
          className="text-muted-foreground/40 flex-shrink-0"
        />
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-border/40 px-4 py-4 space-y-4">
          {/* Secrecy info */}
          <div className="flex items-center gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Гриф секретности</p>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-sm font-bold border px-2 py-0.5 ${SECRECY_COLOR[secrecy] || "text-foreground border-border"}`}>
                  {secrecy}
                </span>
                <span className="text-xs text-muted-foreground/50 font-mono">
                  {{
                    "нс": "Не секретно",
                    "КТ": "Коммерческая тайна",
                    "С":  "Секретно",
                    "СС": "Совершенно секретно",
                    "ОВ": "Особой важности",
                  }[secrecy]}
                </span>
                <span className="text-xs text-muted-foreground/30 font-mono">← из общих данных</span>
              </div>
            </div>
          </div>

          {/* Authors */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Авторы раздела
              </p>
              <button
                onClick={() => setPickerOpen(true)}
                className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-geo-amber border border-border hover:border-geo-amber/40 px-2 py-1 transition-colors"
              >
                <Icon name="UserPlus" size={11} /> Добавить
              </button>
            </div>

            {/* Default / custom authors list */}
            {!hasCustomAuthors ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border border-border/50">
                <Icon name="User" size={13} className="text-muted-foreground/40 flex-shrink-0" />
                <div>
                  <span className="text-sm text-foreground/70">{defaultAuthorName}</span>
                  <span className="ml-2 text-xs font-mono text-muted-foreground/40">ответственный исполнитель · по умолчанию</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                {meta.authors.map((a) => (
                  <div key={a.executorId} className="flex items-center gap-2 px-3 py-2 bg-muted/30 border border-border/50">
                    <Icon name="User" size={13} className="text-geo-amber/60 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-foreground font-medium">{a.name}</span>
                      {a.position && <span className="ml-2 text-xs text-muted-foreground/50">{a.position}</span>}
                      {a.company && <span className="ml-2 text-xs font-mono text-muted-foreground/40">({a.company})</span>}
                    </div>
                    <button
                      onClick={() => removeAuthor(a.executorId)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => persist({ authors: [] })}
                  className="text-xs font-mono text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                >
                  Сбросить к ответственному исполнителю
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Executor picker modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm tracking-wider uppercase">Добавить автора раздела</h4>
              <button onClick={() => setPickerOpen(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={16} />
              </button>
            </div>

            {allExecutors.length === 0 ? (
              <p className="text-sm text-muted-foreground font-mono py-4 text-center">
                Добавьте исполнителей в разделе «Список исполнителей»
              </p>
            ) : (
              <div className="divide-y divide-border/50">
                {allExecutors.map((x) => {
                  const alreadyAdded = meta.authors.some((a) => a.executorId === x.executor.id);
                  return (
                    <button
                      key={x.executor.id}
                      disabled={alreadyAdded}
                      onClick={() => addAuthor(x)}
                      className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-muted/30 transition-colors disabled:opacity-40 disabled:cursor-default"
                    >
                      <Icon name="User" size={14} className="text-geo-amber/60 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground font-medium">
                          {x.executor.lastName}{x.executor.initials ? " " + x.executor.initials : ""}
                        </p>
                        {x.executor.position && (
                          <p className="text-xs text-muted-foreground/60">{x.executor.position}</p>
                        )}
                        <p className="text-xs font-mono text-muted-foreground/40">{x.companyName}</p>
                      </div>
                      {alreadyAdded && (
                        <Icon name="CheckCircle2" size={14} className="text-geo-amber flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
