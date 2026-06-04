import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { ReportData, Customer, Contractor, License, Contract, Secrecy } from "@/types/geo";
import { SECRECY_OPTIONS } from "@/types/geo";
import { FieldGroup, GeoInput, GeoSelect, SectionHeader, Modal } from "./GeoUi";

export function ReportsSection({
  reports,
  setReports,
  customers,
  contractors,
  licenses,
  contracts,
  onOpen,
}: {
  reports: ReportData[];
  setReports: React.Dispatch<React.SetStateAction<ReportData[]>>;
  customers: Customer[];
  contractors: Contractor[];
  licenses: License[];
  contracts: Contract[];
  onOpen: (id: string) => void;
}) {
  const emptyForm: Omit<ReportData, "id"> = {
    title: "",
    customerId: "",
    contractorId: "",
    licenseId: "",
    contractId: "",
    responsible: "",
    secrecy: "нс",
    place: "",
    year: new Date().getFullYear().toString(),
    govRegNumber: "",
    coContractors: [],
  };

  const [modal, setModal] = useState<null | "add" | ReportData>(null);
  const [form, setForm] = useState<Omit<ReportData, "id">>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredLicenses = licenses.filter(
    (l) => !form.customerId || l.ownerId === form.customerId
  );

  const handleContractorChange = (id: string) => {
    const c = contractors.find((c) => c.id === id);
    setForm((f) => ({ ...f, contractorId: id, responsible: c?.responsible || "" }));
  };

  const handleCustomerChange = (id: string) => {
    setForm((f) => ({ ...f, customerId: id, licenseId: "" }));
  };

  const openAdd = () => {
    setForm(emptyForm);
    setModal("add");
  };

  const openEdit = (r: ReportData) => {
    setForm({ title: r.title, customerId: r.customerId, contractorId: r.contractorId, licenseId: r.licenseId, contractId: r.contractId, responsible: r.responsible, secrecy: r.secrecy, place: r.place || "", year: r.year || new Date().getFullYear().toString(), govRegNumber: r.govRegNumber || "", coContractors: r.coContractors || [] });
    setModal(r);
  };

  const save = () => {
    if (modal === "add") {
      setReports((prev) => [...prev, { ...form, id: Date.now().toString() }]);
    } else if (modal && typeof modal === "object") {
      setReports((prev) => prev.map((r) => (r.id === (modal as ReportData).id ? { ...(modal as ReportData), ...form } : r)));
    }
    setModal(null);
  };

  const remove = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    setDeleteId(null);
  };

  const customerName = (id: string) => customers.find((c) => c.id === id)?.name || "—";
  const contractorName = (id: string) => contractors.find((c) => c.id === id)?.name || "—";
  const licenseName = (id: string) => { const l = licenses.find((l) => l.id === id); return l ? `${l.number} · ${l.siteName}` : "—"; };
  const contractName = (id: string) => { const c = contracts.find((c) => c.id === id); return c ? `№ ${c.number}` : "—"; };

  const secrecyColor: Record<Secrecy, string> = {
    "нс": "text-muted-foreground border-muted-foreground/30",
    "КТ": "text-geo-blue border-geo-blue/50",
    "С": "text-geo-amber border-geo-amber/50",
    "СС": "text-orange-400 border-orange-400/50",
    "ОВ": "text-destructive border-destructive/50",
  };

  return (
    <div className="animate-fade-in">
      <SectionHeader count={reports.length} title="Общие данные отчёта" subtitle="GOST 53579-2009 · Титульный лист" onAdd={openAdd} />
      <div className="space-y-2">
        {reports.length === 0 && (
          <div className="border border-dashed border-border py-10 text-center text-muted-foreground text-sm font-mono">Нет записей</div>
        )}
        {reports.map((r) => (
          <div key={r.id} className="card-geo p-4 group animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-sm font-medium text-foreground leading-tight flex-1">{r.title || "—"}</h3>
                  <span className={`font-mono text-xs font-bold border px-2 py-0.5 flex-shrink-0 ${secrecyColor[r.secrecy]}`}>
                    {r.secrecy}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <FieldGroup label="Заказчик" value={customerName(r.customerId)} />
                  <FieldGroup label="Исполнитель" value={contractorName(r.contractorId)} />
                  <FieldGroup label="Лицензия" value={licenseName(r.licenseId)} />
                  <FieldGroup label="Гос. контракт" value={contractName(r.contractId)} />
                  <FieldGroup label="Ответственный исполнитель" value={r.responsible} />
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={() => onOpen(r.id)}
                  className="flex items-center gap-1.5 bg-geo-amber text-primary-foreground px-3 py-1.5 text-xs font-display tracking-wider uppercase hover:bg-amber-400 transition-colors"
                >
                  <Icon name="FolderOpen" size={12} />
                  Открыть
                </button>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(r)} className="p-1.5 text-muted-foreground hover:text-geo-amber transition-colors">
                    <Icon name="Pencil" size={14} />
                  </button>
                  <button onClick={() => setDeleteId(r.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal === "add" ? "Новый отчёт" : "Редактировать отчёт"} onClose={() => setModal(null)}>
          <GeoInput
            label="Наименование отчёта"
            value={form.title}
            onChange={(v) => setForm((f) => ({ ...f, title: v }))}
            placeholder="Отчёт о результатах геологоразведочных работ..."
          />

          <div className="grid grid-cols-2 gap-3">
            <GeoSelect
              label="Заказчик"
              value={form.customerId}
              onChange={handleCustomerChange}
              options={customers.map((c) => ({ value: c.id, label: c.name }))}
            />
            <GeoSelect
              label="Исполнитель"
              value={form.contractorId}
              onChange={handleContractorChange}
              options={contractors.map((c) => ({ value: c.id, label: c.name }))}
            />
          </div>

          <GeoSelect
            label={`Лицензия на недра${form.customerId ? "" : " (сначала выберите заказчика)"}`}
            value={form.licenseId}
            onChange={(v) => setForm((f) => ({ ...f, licenseId: v }))}
            options={filteredLicenses.map((l) => ({ value: l.id, label: `${l.number} · ${l.siteName}` }))}
          />

          <GeoSelect
            label="Государственный контракт"
            value={form.contractId}
            onChange={(v) => setForm((f) => ({ ...f, contractId: v }))}
            options={contracts.map((c) => ({ value: c.id, label: `№ ${c.number} — ${c.name}` }))}
          />

          <div className="space-y-1">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Ответственный исполнитель
              {form.contractorId && (
                <span className="ml-2 normal-case text-geo-amber/70">← из исполнителя</span>
              )}
            </label>
            <input
              type="text"
              value={form.responsible}
              onChange={(e) => setForm((f) => ({ ...f, responsible: e.target.value }))}
              placeholder="Загружается из компании-исполнителя"
              className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-geo-amber transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Гриф секретности</label>
            <div className="flex gap-2">
              {SECRECY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, secrecy: opt.value }))}
                  title={opt.desc}
                  className={`flex-1 py-2 text-xs font-mono font-bold border transition-colors ${
                    form.secrecy === opt.value
                      ? "bg-geo-amber text-primary-foreground border-geo-amber"
                      : "bg-muted text-muted-foreground border-border hover:border-muted-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {SECRECY_OPTIONS.find((o) => o.value === form.secrecy)?.desc}
            </p>
          </div>

          <GeoInput label="Номер государственной регистрации работы" value={form.govRegNumber} onChange={(v) => setForm((f) => ({ ...f, govRegNumber: v }))} placeholder="№ ГР ..." />

          <div className="grid grid-cols-2 gap-3">
            <GeoInput label="Место выпуска отчёта" value={form.place} onChange={(v) => setForm((f) => ({ ...f, place: v }))} placeholder="Москва" />
            <GeoInput label="Год" type="number" value={form.year} onChange={(v) => setForm((f) => ({ ...f, year: v }))} placeholder={new Date().getFullYear().toString()} />
          </div>

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
