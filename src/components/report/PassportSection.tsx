import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import type { Customer, Contractor, License, ReportData } from "@/types/geo";
import {
  MASSIFS, massifLabel, passportSchema, autofillFromReport, guessMassif,
  type PassportData, type PassportField,
} from "@/lib/gkmPassport";
import { fetchPassport, savePassport } from "@/lib/referencesApi";

// ─── Паспорт ГКМ — универсальная форма (все массивы) ────────────────────────────

interface PassportSectionProps {
  report: ReportData;
  customer?: Customer;
  contractor?: Contractor;
  license?: License;
}

export function PassportSection({ report, customer, contractor, license }: PassportSectionProps) {
  const [massif, setMassif] = useState<string>("");
  const [data, setData] = useState<PassportData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchPassport(report.id)
      .then((p) => {
        if (!alive) return;
        if (p) {
          setMassif(p.massif || guessMassif(report));
          setData(p.data || {});
        } else {
          setMassif(guessMassif(report));
          setData(autofillFromReport(report, { customer, contractor, license }));
          setDirty(true);
        }
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.id]);

  const schema = useMemo(() => passportSchema(massif), [massif]);

  const set = (key: string, value: string) => {
    setData((d) => ({ ...d, [key]: value }));
    setDirty(true);
  };

  const doAutofill = () => {
    const auto = autofillFromReport(report, { customer, contractor, license });
    // Заполняем только пустые поля, не затирая ручные правки
    setData((d) => {
      const next = { ...d };
      for (const [k, v] of Object.entries(auto)) {
        if (v && !next[k]) next[k] = v;
      }
      return next;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePassport({ reportId: report.id, massif, data });
      setDirty(false);
      setSavedAt(new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }));
    } finally {
      setSaving(false);
    }
  };

  const filledCount = schema.reduce(
    (acc, s) => acc + s.fields.filter((f) => (data[f.key] || "").trim()).length,
    0,
  );
  const totalCount = schema.reduce((acc, s) => acc + s.fields.length, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="FileText" size={20} className="text-geo-amber" />
        <div>
          <h1 className="font-display text-xl tracking-wider uppercase text-foreground">Паспорт ГКМ</h1>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">
            Государственный кадастр месторождений · {massifLabel(massif)}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono">
          <Icon name="Loader2" size={14} className="animate-spin" /> Загрузка паспорта…
        </div>
      ) : (
        <>
          {/* Панель управления */}
          <div className="flex flex-wrap items-end gap-3 border border-border bg-card/50 p-3 mb-5">
            <label className="flex flex-col gap-1 flex-1 min-w-[240px]">
              <span className="font-mono text-xs text-muted-foreground/70 uppercase tracking-widest">Массив ГКМ (вид ПИ)</span>
              <select
                value={massif}
                onChange={(e) => { setMassif(e.target.value); setDirty(true); }}
                className="bg-background border border-border px-2 py-2 text-sm text-foreground focus:border-geo-amber outline-none"
              >
                {MASSIFS.map((m) => (
                  <option key={m.code} value={m.code}>{m.label}</option>
                ))}
              </select>
            </label>
            <button
              onClick={doAutofill}
              className="flex items-center gap-1.5 border border-border text-muted-foreground px-3 py-2 text-xs font-display tracking-wider uppercase hover:border-geo-amber hover:text-geo-amber transition-colors h-[38px]"
            >
              <Icon name="Wand2" fallback="Sparkles" size={14} /> Автозаполнить из отчёта
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="flex items-center gap-1.5 bg-geo-amber text-primary-foreground px-4 py-2 text-xs font-display tracking-wider uppercase hover:bg-geo-amber-hover transition-colors disabled:opacity-40 h-[38px]"
            >
              <Icon name={saving ? "Loader2" : "Save"} size={14} className={saving ? "animate-spin" : ""} />
              Сохранить
            </button>
          </div>

          <div className="flex items-center gap-4 mb-5 font-mono text-xs text-muted-foreground/70">
            <span>Заполнено полей: <span className="text-foreground">{filledCount}</span> / {totalCount}</span>
            {savedAt && !dirty && <span className="text-geo-green">Сохранено в {savedAt}</span>}
            {dirty && <span className="text-geo-amber">Есть несохранённые изменения</span>}
          </div>

          {/* Разделы */}
          <div className="space-y-6">
            {schema.map((section) => (
              <div key={section.id} className="border border-border bg-card/30">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card/50">
                  <Icon name={section.icon} fallback="Circle" size={15} className="text-geo-amber" />
                  <h2 className="font-display text-sm tracking-wider uppercase text-foreground">{section.title}</h2>
                </div>
                <div className="p-4 grid gap-3 sm:grid-cols-2">
                  {section.fields.map((f) => (
                    <PassportFieldInput
                      key={f.key}
                      field={f}
                      value={data[f.key] || ""}
                      onChange={(v) => set(f.key, v)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PassportFieldInput({ field, value, onChange }: {
  field: PassportField;
  value: string;
  onChange: (v: string) => void;
}) {
  const cls = "w-full bg-background border border-border px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-geo-amber outline-none transition-colors";
  return (
    <div className={`flex flex-col gap-1 ${field.full ? "sm:col-span-2" : ""}`}>
      <label className="font-mono text-xs text-muted-foreground/70 uppercase tracking-widest">{field.label}</label>
      {field.type === "textarea" ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} rows={2} className={cls} />
      ) : field.type === "select" ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={cls}>
          <option value="">— выберите —</option>
          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type={field.type === "number" ? "text" : field.type || "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={cls}
        />
      )}
      {field.hint && <span className="font-mono text-xs text-muted-foreground/40">{field.hint}</span>}
    </div>
  );
}

export default PassportSection;
