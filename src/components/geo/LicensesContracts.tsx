import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { License, Contract, Customer } from "@/types/geo";
import { FieldGroup, GeoInput, GeoSelect, SectionHeader, Modal } from "./GeoUi";

const USE_TYPE_LABELS: Record<License["useType"], string> = {
  search_eval: "Поиски и оценка",
  exploration_mining: "Разведка и добыча",
};

// ─── LicensesSection ──────────────────────────────────────────────────────────

export function LicensesSection({
  licenses,
  setLicenses,
  customers,
}: {
  licenses: License[];
  setLicenses: React.Dispatch<React.SetStateAction<License[]>>;
  customers: Customer[];
}) {
  const [modal, setModal] = useState<null | "add" | License>(null);
  const [form, setForm] = useState<Omit<License, "id">>({ number: "", issueDate: "", ownerId: "", siteName: "", useType: "search_eval" });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setForm({ number: "", issueDate: "", ownerId: "", siteName: "", useType: "search_eval" });
    setModal("add");
  };

  const openEdit = (l: License) => {
    setForm({ number: l.number, issueDate: l.issueDate, ownerId: l.ownerId, siteName: l.siteName, useType: l.useType });
    setModal(l);
  };

  const save = () => {
    if (modal === "add") {
      setLicenses((prev) => [...prev, { ...form, id: Date.now().toString() + Math.random().toString(36).slice(2, 6) }]);
    } else if (modal && typeof modal === "object") {
      setLicenses((prev) => prev.map((l) => (l.id === (modal as License).id ? { ...(modal as License), ...form } : l)));
    }
    setModal(null);
  };

  const remove = (id: string) => {
    setLicenses((prev) => prev.filter((l) => l.id !== id));
    setDeleteId(null);
  };

  const ownerName = (id: string) => customers.find((c) => c.id === id)?.name || "—";

  return (
    <div className="animate-fade-in">
      <SectionHeader count={licenses.length} title="Лицензии на пользование недрами" subtitle="GOST 53579-2009 · Раздел 5" onAdd={openAdd} />
      <div className="space-y-2">
        {licenses.length === 0 && (
          <div className="border border-dashed border-border py-10 text-center text-muted-foreground text-sm font-mono">Нет записей</div>
        )}
        {licenses.map((l) => (
          <div key={l.id} className="card-geo p-4 group animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-base text-geo-amber font-medium tracking-widest">{l.number}</span>
                  <span className="text-xs font-mono border border-muted-foreground/30 text-muted-foreground px-2 py-0.5">
                    {USE_TYPE_LABELS[l.useType]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <FieldGroup label="Дата выдачи" value={l.issueDate ? new Date(l.issueDate).toLocaleDateString("ru-RU") : "—"} />
                  <FieldGroup label="Владелец лицензии" value={ownerName(l.ownerId)} />
                  <FieldGroup label="Наименование участка недр" value={l.siteName} />
                </div>
              </div>
              <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(l)} className="p-1.5 text-muted-foreground hover:text-geo-amber transition-colors">
                  <Icon name="Pencil" size={14} />
                </button>
                <button onClick={() => setDeleteId(l.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal === "add" ? "Новая лицензия" : "Редактировать лицензию"} onClose={() => setModal(null)}>
          <GeoInput label="Номер лицензии" value={form.number} onChange={(v) => setForm((f) => ({ ...f, number: v }))} placeholder="МОС 12345 ТП" />
          <GeoInput label="Дата выдачи" type="date" value={form.issueDate} onChange={(v) => setForm((f) => ({ ...f, issueDate: v }))} />
          <GeoSelect
            label="Владелец лицензии (заказчик)"
            value={form.ownerId}
            onChange={(v) => setForm((f) => ({ ...f, ownerId: v }))}
            options={customers.map((c) => ({ value: c.id, label: c.name }))}
          />
          <GeoInput label="Наименование участка недр" value={form.siteName} onChange={(v) => setForm((f) => ({ ...f, siteName: v }))} placeholder="Участок Северный" />
          <GeoSelect
            label="Вид пользования недрами"
            value={form.useType}
            onChange={(v) => setForm((f) => ({ ...f, useType: v as License["useType"] }))}
            options={[
              { value: "search_eval", label: "Поиски и оценка" },
              { value: "exploration_mining", label: "Разведка и добыча" },
            ]}
          />
          <div className="flex gap-3 pt-2">
            <button onClick={save} className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">Сохранить</button>
            <button onClick={() => setModal(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Подтверждение удаления" onClose={() => setDeleteId(null)}>
          <p className="text-sm text-muted-foreground">Вы уверены, что хотите удалить запись?</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => remove(deleteId)} className="flex-1 bg-destructive text-destructive-foreground py-2 text-sm font-display tracking-wider uppercase hover:opacity-90 transition-opacity">Удалить</button>
            <button onClick={() => setDeleteId(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── ContractsSection ─────────────────────────────────────────────────────────

export function ContractsSection({
  contracts,
  setContracts,
}: {
  contracts: Contract[];
  setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
}) {
  const [modal, setModal] = useState<null | "add" | Contract>(null);
  const [form, setForm] = useState<Omit<Contract, "id">>({ number: "", date: "", name: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setForm({ number: "", date: "", name: "" });
    setModal("add");
  };

  const openEdit = (c: Contract) => {
    setForm({ number: c.number, date: c.date, name: c.name });
    setModal(c);
  };

  const save = () => {
    if (modal === "add") {
      setContracts((prev) => [...prev, { ...form, id: Date.now().toString() + Math.random().toString(36).slice(2, 6) }]);
    } else if (modal && typeof modal === "object") {
      setContracts((prev) => prev.map((c) => (c.id === (modal as Contract).id ? { ...(modal as Contract), ...form } : c)));
    }
    setModal(null);
  };

  const remove = (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="animate-fade-in">
      <SectionHeader count={contracts.length} title="Государственные контракты" subtitle="GOST 53579-2009 · Раздел 6" onAdd={openAdd} />
      <div className="space-y-2">
        {contracts.length === 0 && (
          <div className="border border-dashed border-border py-10 text-center text-muted-foreground text-sm font-mono">Нет записей</div>
        )}
        {contracts.map((c) => (
          <div key={c.id} className="card-geo p-4 group animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-base text-geo-amber font-medium tracking-wider">№ {c.number}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    от {c.date ? new Date(c.date).toLocaleDateString("ru-RU") : "—"}
                  </span>
                </div>
                <FieldGroup label="Наименование контракта" value={c.name} />
              </div>
              <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(c)} className="p-1.5 text-muted-foreground hover:text-geo-amber transition-colors">
                  <Icon name="Pencil" size={14} />
                </button>
                <button onClick={() => setDeleteId(c.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal === "add" ? "Новый контракт" : "Редактировать контракт"} onClose={() => setModal(null)}>
          <GeoInput label="Номер контракта" value={form.number} onChange={(v) => setForm((f) => ({ ...f, number: v }))} placeholder="ГК-2024/001" />
          <GeoInput label="Дата заключения" type="date" value={form.date} onChange={(v) => setForm((f) => ({ ...f, date: v }))} />
          <GeoInput label="Наименование контракта" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Государственный контракт на..." />
          <div className="flex gap-3 pt-2">
            <button onClick={save} className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">Сохранить</button>
            <button onClick={() => setModal(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Подтверждение удаления" onClose={() => setDeleteId(null)}>
          <p className="text-sm text-muted-foreground">Вы уверены, что хотите удалить запись?</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => remove(deleteId)} className="flex-1 bg-destructive text-destructive-foreground py-2 text-sm font-display tracking-wider uppercase hover:opacity-90 transition-opacity">Удалить</button>
            <button onClick={() => setDeleteId(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
          </div>
        </Modal>
      )}
    </div>
  );
}