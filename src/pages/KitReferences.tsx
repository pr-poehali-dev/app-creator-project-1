import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { Customer, Contractor, License, Contract, ReportData } from "@/types/geo";
import { GeoInput, GeoSelect, Modal } from "@/components/geo/GeoUi";
import type { RefKind } from "@/lib/referencesApi";
import { makeRefId } from "@/lib/referencesApi";

// ─── Общие сведения комплекта: справочники из общей БД с автозаполнением ────────

interface KitReferencesProps {
  report: ReportData;
  customers: Customer[];
  contractors: Contractor[];
  licenses: License[];
  contracts: Contract[];
  loading: boolean;
  onSaveRef: <T extends { id: string }>(kind: RefKind, item: T) => Promise<void>;
  onUpdateReport: (r: ReportData) => void;
}

type EditKind = null | { kind: RefKind; mode: "add" | "edit"; id?: string };

export function KitReferences({ report, customers, contractors, licenses, contracts, loading, onSaveRef, onUpdateReport }: KitReferencesProps) {
  const [edit, setEdit] = useState<EditKind>(null);

  const customer = customers.find((c) => c.id === report.customerId);
  const contractor = contractors.find((c) => c.id === report.contractorId);
  const license = licenses.find((l) => l.id === report.licenseId);
  const contract = contracts.find((c) => c.id === report.contractId);

  // Выбор лицензии автоматически подтягивает заказчика-владельца (автозаполнение из базы)
  const selectLicense = (id: string) => {
    const lic = licenses.find((l) => l.id === id);
    const patch: Partial<ReportData> = { licenseId: id };
    if (lic) {
      patch.licenseNumber = lic.number;
      patch.licenseDate = lic.issueDate;
      patch.siteDescription = lic.siteName || report.siteDescription;
      if (lic.ownerId && customers.some((c) => c.id === lic.ownerId)) {
        patch.customerId = lic.ownerId;
      }
    }
    onUpdateReport({ ...report, ...patch });
  };

  const selectContractor = (id: string) => {
    const c = contractors.find((x) => x.id === id);
    onUpdateReport({ ...report, contractorId: id, responsible: c?.responsible || report.responsible });
  };

  const rows = [
    {
      kind: "customers" as RefKind, icon: "Building2", label: "Заказчик",
      value: report.customerId,
      options: customers.map((c) => ({ value: c.id, label: c.name })),
      onSelect: (id: string) => onUpdateReport({ ...report, customerId: id }),
      preview: customer ? [customer.director, customer.inn, customer.address].filter(Boolean).join(" · ") : "",
      current: customer,
    },
    {
      kind: "contractors" as RefKind, icon: "HardHat", label: "Исполнитель",
      value: report.contractorId,
      options: contractors.map((c) => ({ value: c.id, label: c.name })),
      onSelect: selectContractor,
      preview: contractor ? [contractor.director, contractor.chiefGeologist].filter(Boolean).join(" · ") : "",
      current: contractor,
    },
    {
      kind: "licenses" as RefKind, icon: "FileKey", label: "Лицензия",
      value: report.licenseId,
      options: licenses.map((l) => ({ value: l.id, label: `${l.number} · ${l.siteName}` })),
      onSelect: selectLicense,
      preview: license ? [license.number, license.siteName].filter(Boolean).join(" · ") : "",
      current: license,
    },
    {
      kind: "contracts" as RefKind, icon: "FileText", label: "Контракт",
      value: report.contractId,
      options: contracts.map((c) => ({ value: c.id, label: `${c.number} · ${c.name}` })),
      onSelect: (id: string) => onUpdateReport({ ...report, contractId: id }),
      preview: contract ? [contract.number, contract.date].filter(Boolean).join(" · ") : "",
      current: contract,
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Icon name="ClipboardList" fallback="FileText" size={20} className="text-geo-amber" />
        <div>
          <h1 className="font-display text-xl tracking-wider uppercase text-foreground">Общие сведения</h1>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">Заказчик · Исполнитель · Лицензия · Контракт — из общей базы</p>
        </div>
      </div>
      <p className="font-mono text-xs text-muted-foreground/60 mb-5">
        Выберите запись из базы — сведения подставятся автоматически. Если такой лицензии/заказчика ещё нет — создайте новую.
      </p>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono mb-4">
          <Icon name="Loader2" size={14} className="animate-spin" /> Загрузка базы…
        </div>
      )}

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.kind} className="border border-border bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name={row.icon} fallback="Circle" size={15} className="text-geo-amber" />
              <span className="font-display text-sm tracking-wider uppercase text-foreground">{row.label}</span>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <GeoSelect label="Выбрать из базы" value={row.value} onChange={row.onSelect} options={row.options} />
              </div>
              <button
                onClick={() => setEdit({ kind: row.kind, mode: "add" })}
                className="flex items-center gap-1.5 border border-border text-muted-foreground px-3 py-2 text-xs font-display tracking-wider uppercase hover:border-geo-amber hover:text-geo-amber transition-colors h-[38px]"
              >
                <Icon name="Plus" size={13} /> Новая
              </button>
              {row.current && (
                <button
                  onClick={() => setEdit({ kind: row.kind, mode: "edit", id: row.current!.id })}
                  className="flex items-center gap-1.5 border border-border text-muted-foreground px-3 py-2 text-xs font-display tracking-wider uppercase hover:border-geo-amber hover:text-geo-amber transition-colors h-[38px]"
                >
                  <Icon name="Pencil" size={13} /> Изменить
                </button>
              )}
            </div>
            {row.preview && (
              <p className="font-mono text-xs text-muted-foreground/70 mt-2">{row.preview}</p>
            )}
          </div>
        ))}
      </div>

      {edit && (
        <RefEditModal
          state={edit}
          customers={customers}
          contractors={contractors}
          licenses={licenses}
          contracts={contracts}
          onClose={() => setEdit(null)}
          onSave={async (kind, item, isNew) => {
            await onSaveRef(kind, item);
            // Привязываем к отчёту созданную/выбранную запись
            if (isNew) {
              if (kind === "customers") onUpdateReport({ ...report, customerId: item.id });
              else if (kind === "contractors") selectContractor(item.id);
              else if (kind === "licenses") selectLicense(item.id);
              else if (kind === "contracts") onUpdateReport({ ...report, contractId: item.id });
            }
            setEdit(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Модалка создания/редактирования записи справочника ─────────────────────────

type AnyRef = Customer | Contractor | License | Contract;

function RefEditModal({ state, customers, contractors, licenses, contracts, onClose, onSave }: {
  state: { kind: RefKind; mode: "add" | "edit"; id?: string };
  customers: Customer[];
  contractors: Contractor[];
  licenses: License[];
  contracts: Contract[];
  onClose: () => void;
  onSave: (kind: RefKind, item: AnyRef & { id: string }, isNew: boolean) => void;
}) {
  const isNew = state.mode === "add";
  const findExisting = (): AnyRef | undefined => {
    if (state.kind === "customers") return customers.find((x) => x.id === state.id);
    if (state.kind === "contractors") return contractors.find((x) => x.id === state.id);
    if (state.kind === "licenses") return licenses.find((x) => x.id === state.id);
    return contracts.find((x) => x.id === state.id);
  };

  const [data, setData] = useState<Record<string, string>>(() => {
    const ex = findExisting() as Record<string, unknown> | undefined;
    const get = (k: string) => (ex && ex[k] != null ? String(ex[k]) : "");
    if (state.kind === "customers") return { name: get("name"), director: get("director"), inn: get("inn"), address: get("address") };
    if (state.kind === "contractors") return { name: get("name"), director: get("director"), chiefGeologist: get("chiefGeologist"), responsible: get("responsible") };
    if (state.kind === "licenses") return { number: get("number"), issueDate: get("issueDate"), siteName: get("siteName"), useType: get("useType") || "search_eval", ownerId: get("ownerId") };
    return { number: get("number"), date: get("date"), name: get("name") };
  });
  const set = (k: string, v: string) => setData((d) => ({ ...d, [k]: v }));

  const titles: Record<RefKind, string> = {
    customers: isNew ? "Новый заказчик" : "Редактировать заказчика",
    contractors: isNew ? "Новый исполнитель" : "Редактировать исполнителя",
    licenses: isNew ? "Новая лицензия" : "Редактировать лицензию",
    contracts: isNew ? "Новый контракт" : "Редактировать контракт",
  };

  const submit = () => {
    const id = isNew ? makeRefId() : (state.id as string);
    let item: AnyRef & { id: string };
    if (state.kind === "customers") {
      item = { id, name: data.name, director: data.director, inn: data.inn, address: data.address };
    } else if (state.kind === "contractors") {
      const ex = findExisting() as Contractor | undefined;
      item = { id, name: data.name, director: data.director, chiefGeologist: data.chiefGeologist, responsible: data.responsible, executors: ex?.executors || [] };
    } else if (state.kind === "licenses") {
      item = { id, number: data.number, issueDate: data.issueDate, ownerId: data.ownerId, siteName: data.siteName, useType: (data.useType === "exploration_mining" ? "exploration_mining" : "search_eval") };
    } else {
      item = { id, number: data.number, date: data.date, name: data.name };
    }
    onSave(state.kind, item, isNew);
  };

  return (
    <Modal title={titles[state.kind]} onClose={onClose}>
      {state.kind === "customers" && (
        <>
          <GeoInput label="Наименование организации" value={data.name} onChange={(v) => set("name", v)} placeholder='ООО "НедраГео"' />
          <GeoInput label="Генеральный директор" value={data.director} onChange={(v) => set("director", v)} />
          <GeoInput label="ИНН" value={data.inn} onChange={(v) => set("inn", v)} />
          <GeoInput label="Адрес" value={data.address} onChange={(v) => set("address", v)} />
        </>
      )}
      {state.kind === "contractors" && (
        <>
          <GeoInput label="Наименование организации" value={data.name} onChange={(v) => set("name", v)} />
          <GeoInput label="Генеральный директор" value={data.director} onChange={(v) => set("director", v)} />
          <GeoInput label="Главный геолог" value={data.chiefGeologist} onChange={(v) => set("chiefGeologist", v)} />
          <GeoInput label="Ответственный исполнитель" value={data.responsible} onChange={(v) => set("responsible", v)} />
        </>
      )}
      {state.kind === "licenses" && (
        <>
          <GeoInput label="Номер лицензии" value={data.number} onChange={(v) => set("number", v)} placeholder="ЯРЛ 57970 ВЭ" />
          <GeoInput label="Дата выдачи" value={data.issueDate} onChange={(v) => set("issueDate", v)} placeholder="2013-01-29" />
          <GeoInput label="Наименование участка" value={data.siteName} onChange={(v) => set("siteName", v)} />
          <GeoSelect label="Владелец (заказчик)" value={data.ownerId} onChange={(v) => set("ownerId", v)} options={customers.map((c) => ({ value: c.id, label: c.name }))} />
          <GeoSelect label="Вид пользования недрами" value={data.useType} onChange={(v) => set("useType", v)} options={[{ value: "search_eval", label: "Поиск и оценка" }, { value: "exploration_mining", label: "Разведка и добыча" }]} />
        </>
      )}
      {state.kind === "contracts" && (
        <>
          <GeoInput label="Номер контракта" value={data.number} onChange={(v) => set("number", v)} placeholder="ГК-2024/001" />
          <GeoInput label="Дата" value={data.date} onChange={(v) => set("date", v)} placeholder="2024-01-10" />
          <GeoInput label="Наименование" value={data.name} onChange={(v) => set("name", v)} />
        </>
      )}
      <div className="flex gap-3 pt-2">
        <button onClick={submit} className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-geo-amber-hover transition-colors">
          Сохранить в базу
        </button>
        <button onClick={onClose} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
      </div>
    </Modal>
  );
}

export default KitReferences;
