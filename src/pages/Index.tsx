import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import ReportPage from "./ReportPage";

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

// ─── Types ───────────────────────────────────────────────────────────────────

interface Customer {
  id: string;
  name: string;
  director: string;
  inn: string;
  address: string;
}

interface Contractor {
  id: string;
  name: string;
  director: string;
  chiefGeologist: string;
  responsible: string;
}

interface License {
  id: string;
  number: string;
  issueDate: string;
  ownerId: string;
  siteName: string;
  useType: "search_eval" | "exploration_mining";
}

interface Contract {
  id: string;
  number: string;
  date: string;
  name: string;
}

type Section = "customers" | "contractors" | "licenses" | "contracts" | "reports";

type Secrecy = "нс" | "КТ" | "С" | "СС" | "ОВ";

const SECRECY_OPTIONS: { value: Secrecy; label: string; desc: string }[] = [
  { value: "нс", label: "нс", desc: "Не секретно" },
  { value: "КТ", label: "КТ", desc: "Коммерческая тайна" },
  { value: "С", label: "С", desc: "Секретно" },
  { value: "СС", label: "СС", desc: "Совершенно секретно" },
  { value: "ОВ", label: "ОВ", desc: "Особой важности" },
];

interface ReportData {
  id: string;
  title: string;
  customerId: string;
  contractorId: string;
  licenseId: string;
  contractId: string;
  responsible: string;
  secrecy: Secrecy;
  place: string;
  year: string;
}

export type { ReportData, Customer, Contractor, License, Contract, Secrecy };
export { SECRECY_OPTIONS };

const USE_TYPE_LABELS: Record<License["useType"], string> = {
  search_eval: "Поиски и оценка",
  exploration_mining: "Разведка и добыча",
};

// ─── Initial Data ─────────────────────────────────────────────────────────────

const INIT_CUSTOMERS: Customer[] = [
  {
    id: "1",
    name: 'ООО "НедраГео"',
    director: "Петров Алексей Николаевич",
    inn: "7712345678",
    address: "г. Москва, ул. Нефтяная, д. 12",
  },
];

const INIT_CONTRACTORS: Contractor[] = [
  {
    id: "1",
    name: 'АО "ГеоПроект"',
    director: "Сидоров Виктор Павлович",
    chiefGeologist: "Кузнецов Дмитрий Иванович",
    responsible: "Иванов Сергей Михайлович",
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
];

const INIT_CONTRACTS: Contract[] = [
  {
    id: "1",
    number: "ГК-2024/001",
    date: "2024-01-10",
    name: "Государственный контракт на проведение геологоразведочных работ",
  },
];

const INIT_REPORTS: ReportData[] = [];

// ─── UI Primitives ────────────────────────────────────────────────────────────

function FieldGroup({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{label}</div>
      <div className="text-sm text-foreground leading-tight">{value || "—"}</div>
    </div>
  );
}

function GeoInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-geo-amber focus:ring-0 transition-colors"
      />
    </div>
  );
}

function GeoSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-geo-amber transition-colors appearance-none cursor-pointer"
      >
        <option value="">— выберите —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SectionHeader({
  count,
  title,
  subtitle,
  onAdd,
}: {
  count: number;
  title: string;
  subtitle: string;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl text-foreground tracking-wider uppercase">{title}</h2>
          <span className="font-mono text-xs text-geo-amber border border-geo-amber px-2 py-0.5">
            {String(count).padStart(2, "0")}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-mono">{subtitle}</p>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-geo-amber text-primary-foreground px-4 py-2 text-xs font-display tracking-wider uppercase hover:bg-amber-400 transition-colors"
      >
        <Icon name="Plus" size={14} />
        Добавить
      </button>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-card border border-border animate-scale-in mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-display text-lg tracking-wider uppercase text-foreground">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ─── Customers Section ────────────────────────────────────────────────────────

function CustomersSection({
  customers,
  setCustomers,
}: {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}) {
  const [modal, setModal] = useState<null | "add" | Customer>(null);
  const [form, setForm] = useState<Omit<Customer, "id">>({ name: "", director: "", inn: "", address: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setForm({ name: "", director: "", inn: "", address: "" });
    setModal("add");
  };

  const openEdit = (c: Customer) => {
    setForm({ name: c.name, director: c.director, inn: c.inn, address: c.address });
    setModal(c);
  };

  const save = () => {
    if (modal === "add") {
      setCustomers((prev) => [...prev, { ...form, id: Date.now().toString() }]);
    } else if (modal && typeof modal === "object") {
      setCustomers((prev) => prev.map((c) => (c.id === (modal as Customer).id ? { ...(modal as Customer), ...form } : c)));
    }
    setModal(null);
  };

  const remove = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="animate-fade-in">
      <SectionHeader count={customers.length} title="Компании-заказчики" subtitle="GOST 53579-2009 · Раздел 4.1" onAdd={openAdd} />
      <div className="space-y-2">
        {customers.length === 0 && (
          <div className="border border-dashed border-border py-10 text-center text-muted-foreground text-sm font-mono">Нет записей</div>
        )}
        {customers.map((c) => (
          <div key={c.id} className="card-geo p-4 group animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 flex-1">
                <FieldGroup label="Наименование" value={c.name} />
                <FieldGroup label="Генеральный директор" value={c.director} />
                <FieldGroup label="ИНН" value={c.inn} />
                <FieldGroup label="Адрес" value={c.address} />
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
        <Modal title={modal === "add" ? "Новый заказчик" : "Редактировать заказчика"} onClose={() => setModal(null)}>
          <GeoInput label="Наименование организации" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder='ООО "НедраГео"' />
          <GeoInput label="Генеральный директор" value={form.director} onChange={(v) => setForm((f) => ({ ...f, director: v }))} placeholder="Фамилия Имя Отчество" />
          <GeoInput label="ИНН" value={form.inn} onChange={(v) => setForm((f) => ({ ...f, inn: v }))} placeholder="7712345678" />
          <GeoInput label="Юридический адрес" value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} placeholder="г. Москва, ул. ..." />
          <div className="flex gap-3 pt-2">
            <button onClick={save} className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">Сохранить</button>
            <button onClick={() => setModal(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Подтверждение удаления" onClose={() => setDeleteId(null)}>
          <p className="text-sm text-muted-foreground">Вы уверены, что хотите удалить запись? Это действие необратимо.</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => remove(deleteId)} className="flex-1 bg-destructive text-destructive-foreground py-2 text-sm font-display tracking-wider uppercase hover:opacity-90 transition-opacity">Удалить</button>
            <button onClick={() => setDeleteId(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Contractors Section ──────────────────────────────────────────────────────

function ContractorsSection({
  contractors,
  setContractors,
}: {
  contractors: Contractor[];
  setContractors: React.Dispatch<React.SetStateAction<Contractor[]>>;
}) {
  const [modal, setModal] = useState<null | "add" | Contractor>(null);
  const [form, setForm] = useState<Omit<Contractor, "id">>({ name: "", director: "", chiefGeologist: "", responsible: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setForm({ name: "", director: "", chiefGeologist: "", responsible: "" });
    setModal("add");
  };

  const openEdit = (c: Contractor) => {
    setForm({ name: c.name, director: c.director, chiefGeologist: c.chiefGeologist, responsible: c.responsible });
    setModal(c);
  };

  const save = () => {
    if (modal === "add") {
      setContractors((prev) => [...prev, { ...form, id: Date.now().toString() }]);
    } else if (modal && typeof modal === "object") {
      setContractors((prev) => prev.map((c) => (c.id === (modal as Contractor).id ? { ...(modal as Contractor), ...form } : c)));
    }
    setModal(null);
  };

  const remove = (id: string) => {
    setContractors((prev) => prev.filter((c) => c.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="animate-fade-in">
      <SectionHeader count={contractors.length} title="Компании-исполнители" subtitle="GOST 53579-2009 · Раздел 4.2" onAdd={openAdd} />
      <div className="space-y-2">
        {contractors.length === 0 && (
          <div className="border border-dashed border-border py-10 text-center text-muted-foreground text-sm font-mono">Нет записей</div>
        )}
        {contractors.map((c) => (
          <div key={c.id} className="card-geo p-4 group animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 flex-1">
                <FieldGroup label="Наименование" value={c.name} />
                <FieldGroup label="Генеральный директор" value={c.director} />
                <FieldGroup label="Главный геолог" value={c.chiefGeologist} />
                <FieldGroup label="Ответственный исполнитель" value={c.responsible} />
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
        <Modal title={modal === "add" ? "Новый исполнитель" : "Редактировать исполнителя"} onClose={() => setModal(null)}>
          <GeoInput label="Наименование организации" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder='АО "ГеоПроект"' />
          <GeoInput label="Генеральный директор" value={form.director} onChange={(v) => setForm((f) => ({ ...f, director: v }))} placeholder="Фамилия Имя Отчество" />
          <GeoInput label="Главный геолог" value={form.chiefGeologist} onChange={(v) => setForm((f) => ({ ...f, chiefGeologist: v }))} placeholder="Фамилия Имя Отчество" />
          <GeoInput label="Ответственный исполнитель" value={form.responsible} onChange={(v) => setForm((f) => ({ ...f, responsible: v }))} placeholder="Фамилия Имя Отчество" />
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

// ─── Licenses Section ─────────────────────────────────────────────────────────

function LicensesSection({
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
      setLicenses((prev) => [...prev, { ...form, id: Date.now().toString() }]);
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

// ─── Contracts Section ────────────────────────────────────────────────────────

function ContractsSection({
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
      setContracts((prev) => [...prev, { ...form, id: Date.now().toString() }]);
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

// ─── Reports Section ──────────────────────────────────────────────────────────

function ReportsSection({
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
    setForm({ title: r.title, customerId: r.customerId, contractorId: r.contractorId, licenseId: r.licenseId, contractId: r.contractId, responsible: r.responsible, secrecy: r.secrecy });
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

// ─── Nav Items ────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Section; label: string; icon: string; }[] = [
  { id: "reports", label: "Отчёты", icon: "BookOpen" },
  { id: "customers", label: "Заказчики", icon: "Building2" },
  { id: "contractors", label: "Исполнители", icon: "HardHat" },
  { id: "licenses", label: "Лицензии", icon: "FileKey" },
  { id: "contracts", label: "Контракты", icon: "FileText" },
];

const SOON_ITEMS: { icon: string; label: string }[] = [
  { icon: "FileOutput", label: "Экспорт PDF" },
  { icon: "Table", label: "Экспорт Excel" },
  { icon: "Bell", label: "Уведомления" },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Index() {
  const [section, setSection] = useState<Section>("reports");
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  const [customers, setCustomers] = useLocalStorage<Customer[]>("geo_customers", INIT_CUSTOMERS);
  const [contractors, setContractors] = useLocalStorage<Contractor[]>("geo_contractors", INIT_CONTRACTORS);
  const [licenses, setLicenses] = useLocalStorage<License[]>("geo_licenses", INIT_LICENSES);
  const [contracts, setContracts] = useLocalStorage<Contract[]>("geo_contracts", INIT_CONTRACTS);
  const [reports, setReports] = useLocalStorage<ReportData[]>("geo_reports", INIT_REPORTS);

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
      />
    );
  }

  const counts: Record<Section, number> = {
    reports: reports.length,
    customers: customers.length,
    contractors: contractors.length,
    licenses: licenses.length,
    contracts: contracts.length,
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
            {section === "reports" && <ReportsSection reports={reports} setReports={setReports} customers={customers} contractors={contractors} licenses={licenses} contracts={contracts} onOpen={setOpenReportId} />}
            {section === "customers" && <CustomersSection customers={customers} setCustomers={setCustomers} />}
            {section === "contractors" && <ContractorsSection contractors={contractors} setContractors={setContractors} />}
            {section === "licenses" && <LicensesSection licenses={licenses} setLicenses={setLicenses} customers={customers} />}
            {section === "contracts" && <ContractsSection contracts={contracts} setContracts={setContracts} />}
          </div>
        </main>
      </div>

      <footer className="border-t border-border px-6 py-2 flex items-center justify-between bg-card/50 flex-shrink-0">
        <span className="font-mono text-xs text-muted-foreground">Система формирования геологических отчётов</span>
        <span className="font-mono text-xs text-muted-foreground/50">v0.1.0</span>
      </footer>
    </div>
  );
}