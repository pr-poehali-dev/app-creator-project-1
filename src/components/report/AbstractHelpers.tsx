import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { WorkMethod } from "./reportTypes";

// ─── TextArea ─────────────────────────────────────────────────────────────────

export function TextArea({ label, value, onChange, placeholder, hint, rows = 3 }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{label}</label>
        {hint && <span className="text-xs text-muted-foreground/40 font-mono">{hint}</span>}
      </div>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors resize-none"
      />
    </div>
  );
}

// ─── MethodsTable ─────────────────────────────────────────────────────────────

const EMPTY_METHOD: Omit<WorkMethod, "id"> = {
  name: "",
  volume: "",
  unit: "",
  coordSystem: "",
  coordFrom: "",
  coordTo: "",
};

const COORD_SYSTEMS = ["ГСК-2011"];

export function MethodsTable({ methods, onChange }: {
  methods: WorkMethod[];
  onChange: (m: WorkMethod[]) => void;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<WorkMethod, "id">>(EMPTY_METHOD);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => { setForm(EMPTY_METHOD); setEditId("new"); };
  const openEdit = (m: WorkMethod) => {
    setForm({ name: m.name, volume: m.volume, unit: m.unit, coordSystem: m.coordSystem, coordFrom: m.coordFrom, coordTo: m.coordTo });
    setEditId(m.id);
  };

  const save = () => {
    if (editId === "new") {
      onChange([...methods, { ...form, id: Date.now().toString() }]);
    } else {
      onChange(methods.map((m) => m.id === editId ? { ...form, id: editId } : m));
    }
    setEditId(null);
  };

  const setF = (field: keyof Omit<WorkMethod, "id">) => (v: string) => setForm((f) => ({ ...f, [field]: v }));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Методы и объёмы работ</span>
          <span className="ml-2 text-xs text-muted-foreground/40 font-mono">способы исследования</span>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 text-xs font-mono text-geo-amber hover:text-amber-400 border border-geo-amber/40 hover:border-amber-400/60 px-3 py-1.5 transition-colors">
          <Icon name="Plus" size={12} /> Добавить метод
        </button>
      </div>

      {methods.length === 0 ? (
        <div className="border border-dashed border-border py-8 text-center text-muted-foreground/50 text-xs font-mono">
          Нет методов — нажмите «Добавить метод»
        </div>
      ) : (
        <div className="border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2 font-mono text-xs text-muted-foreground uppercase tracking-widest">Метод</th>
                <th className="text-left px-3 py-2 font-mono text-xs text-muted-foreground uppercase tracking-widest w-24">Объём</th>
                <th className="text-left px-3 py-2 font-mono text-xs text-muted-foreground uppercase tracking-widest w-20">Ед. изм.</th>
                <th className="text-left px-3 py-2 font-mono text-xs text-muted-foreground uppercase tracking-widest w-20">Сист. коорд.</th>
                <th className="text-left px-3 py-2 font-mono text-xs text-muted-foreground uppercase tracking-widest">Координаты</th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {methods.map((m) => (
                <tr key={m.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors group">
                  <td className="px-3 py-2.5">
                    <p className="text-sm text-foreground font-medium leading-snug">{m.name || "—"}</p>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-sm">{m.volume || "—"}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{m.unit || "—"}</td>
                  <td className="px-3 py-2.5">
                    {m.coordSystem && m.coordSystem !== "—" ? (
                      <span className="font-mono text-xs text-geo-amber border border-geo-amber/30 px-1.5 py-0.5">{m.coordSystem}</span>
                    ) : <span className="text-muted-foreground/30 text-xs">—</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    {m.coordFrom || m.coordTo ? (
                      <span className="font-mono text-xs text-foreground/70">{m.coordFrom}{m.coordTo ? ` — ${m.coordTo}` : ""}</span>
                    ) : <span className="text-muted-foreground/30 text-xs">—</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <button onClick={() => openEdit(m)} className="p-1 text-muted-foreground hover:text-geo-amber transition-colors">
                        <Icon name="Pencil" size={12} />
                      </button>
                      <button onClick={() => setDeleteId(m.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                        <Icon name="Trash2" size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-lg space-y-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm tracking-wider uppercase">{editId === "new" ? "Добавить метод" : "Редактировать метод"}</h4>
              <button onClick={() => setEditId(null)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Наименование метода</label>
              <input type="text" value={form.name} onChange={(e) => setF("name")(e.target.value)} placeholder="Буровые работы, геофизические исследования..." className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Объём</label>
                <input type="text" value={form.volume} onChange={(e) => setF("volume")(e.target.value)} placeholder="108" className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Единица измерения</label>
                <input type="text" value={form.unit} onChange={(e) => setF("unit")(e.target.value)} placeholder="скв., пог. м, км², п.км..." className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors" />
              </div>
            </div>
            <div className="border border-border/50 p-4 space-y-3 bg-muted/20">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Icon name="MapPin" size={12} className="text-geo-amber" /> Координаты
              </p>
              <div className="space-y-1">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Система координат</label>
                <select value={form.coordSystem} onChange={(e) => setF("coordSystem")(e.target.value)} className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-geo-amber transition-colors">
                  {COORD_SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Координаты от</label>
                  <input type="text" value={form.coordFrom} onChange={(e) => setF("coordFrom")(e.target.value)} placeholder="58°12′N 60°45′E" className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Координаты до</label>
                  <input type="text" value={form.coordTo} onChange={(e) => setF("coordTo")(e.target.value)} placeholder="59°00′N 61°30′E" className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={save} className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">Сохранить</button>
              <button onClick={() => setEditId(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6 space-y-4">
            <h4 className="font-display text-sm tracking-wider uppercase">Удалить метод?</h4>
            <p className="text-sm text-muted-foreground">Метод будет удалён из списка.</p>
            <div className="flex gap-3">
              <button onClick={() => { onChange(methods.filter((m) => m.id !== deleteId)); setDeleteId(null); }} className="flex-1 bg-destructive text-destructive-foreground py-2 text-sm font-display tracking-wider uppercase hover:opacity-90 transition-opacity">Удалить</button>
              <button onClick={() => setDeleteId(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
