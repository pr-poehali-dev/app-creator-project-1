import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { Customer, Contractor, Executor } from "@/types/geo";
import { FieldGroup, GeoInput, SectionHeader, Modal } from "./GeoUi";

// ─── ExecutorsList ────────────────────────────────────────────────────────────

export function ExecutorsList({ contractor, setContractors }: {
  contractor: Contractor;
  setContractors: React.Dispatch<React.SetStateAction<Contractor[]>>;
}) {
  const emptyExec: Omit<Executor, "id"> = { lastName: "", initials: "", position: "", degree: "" };
  const [execModal, setExecModal] = useState<null | "add" | Executor>(null);
  const [execForm, setExecForm] = useState<Omit<Executor, "id">>(emptyExec);
  const [deleteExecId, setDeleteExecId] = useState<string | null>(null);

  const patchExecutors = (execs: Executor[]) => {
    setContractors((prev) => prev.map((c) => c.id === contractor.id ? { ...c, executors: execs } : c));
  };

  const openAddExec = () => { setExecForm(emptyExec); setExecModal("add"); };
  const openEditExec = (e: Executor) => { setExecForm({ lastName: e.lastName, initials: e.initials, position: e.position, degree: e.degree }); setExecModal(e); };

  const saveExec = () => {
    if (execModal === "add") {
      patchExecutors([...(contractor.executors || []), { ...execForm, id: Date.now().toString() + Math.random().toString(36).slice(2, 6) }]);
    } else if (execModal && typeof execModal === "object") {
      patchExecutors((contractor.executors || []).map((e) => e.id === (execModal as Executor).id ? { ...(execModal as Executor), ...execForm } : e));
    }
    setExecModal(null);
  };

  const removeExec = (id: string) => {
    patchExecutors((contractor.executors || []).filter((e) => e.id !== id));
    setDeleteExecId(null);
  };

  const executors = contractor.executors || [];

  return (
    <div className="mt-3 border-t border-border/50 pt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Исполнители · {executors.length}</span>
        <button onClick={openAddExec} className="flex items-center gap-1 text-xs font-mono text-geo-amber hover:text-amber-400 transition-colors">
          <Icon name="Plus" size={12} /> Добавить исполнителя
        </button>
      </div>
      {executors.length === 0 ? (
        <p className="text-xs text-muted-foreground/50 font-mono italic">Нет исполнителей</p>
      ) : (
        <div className="space-y-1.5">
          {executors.map((e) => (
            <div key={e.id} className="flex items-center justify-between bg-muted/30 px-3 py-2 group">
              <div className="flex items-start gap-4 flex-1">
                <span className="text-sm font-medium text-foreground min-w-[140px]">
                  {e.lastName}{e.initials ? ` ${e.initials}` : ""}
                </span>
                <span className="text-xs text-muted-foreground">{e.position}{e.degree ? ` · ${e.degree}` : ""}</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditExec(e)} className="p-1 text-muted-foreground hover:text-geo-amber transition-colors">
                  <Icon name="Pencil" size={12} />
                </button>
                <button onClick={() => setDeleteExecId(e.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                  <Icon name="Trash2" size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {execModal && (
        <Modal title={execModal === "add" ? "Новый исполнитель" : "Редактировать исполнителя"} onClose={() => setExecModal(null)}>
          <div className="grid grid-cols-2 gap-3">
            <GeoInput label="Фамилия" value={execForm.lastName} onChange={(v) => setExecForm((f) => ({ ...f, lastName: v }))} placeholder="Яковлев" />
            <GeoInput label="Инициалы" value={execForm.initials} onChange={(v) => setExecForm((f) => ({ ...f, initials: v }))} placeholder="Н.М." />
          </div>
          <GeoInput label="Должность" value={execForm.position} onChange={(v) => setExecForm((f) => ({ ...f, position: v }))} placeholder="ответ. исп., вед. геолог" />
          <GeoInput label="Учёная степень / звание" value={execForm.degree} onChange={(v) => setExecForm((f) => ({ ...f, degree: v }))} placeholder="канд. геол.-мин. наук" />
          <div className="flex gap-3 pt-2">
            <button onClick={saveExec} className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">Сохранить</button>
            <button onClick={() => setExecModal(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
          </div>
        </Modal>
      )}

      {deleteExecId && (
        <Modal title="Удалить исполнителя?" onClose={() => setDeleteExecId(null)}>
          <p className="text-sm text-muted-foreground">Исполнитель будет удалён из списка.</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => removeExec(deleteExecId)} className="flex-1 bg-destructive text-destructive-foreground py-2 text-sm font-display tracking-wider uppercase hover:opacity-90 transition-opacity">Удалить</button>
            <button onClick={() => setDeleteExecId(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">Отмена</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CustomersSection ─────────────────────────────────────────────────────────

export function CustomersSection({
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
      setCustomers((prev) => [...prev, { ...form, id: Date.now().toString() + Math.random().toString(36).slice(2, 6) }]);
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

// ─── ContractorsSection ───────────────────────────────────────────────────────

export function ContractorsSection({
  contractors,
  setContractors,
}: {
  contractors: Contractor[];
  setContractors: React.Dispatch<React.SetStateAction<Contractor[]>>;
}) {
  const [modal, setModal] = useState<null | "add" | Contractor>(null);
  const [form, setForm] = useState<Omit<Contractor, "id">>({ name: "", director: "", chiefGeologist: "", responsible: "", executors: [] });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setForm({ name: "", director: "", chiefGeologist: "", responsible: "", executors: [] });
    setModal("add");
  };

  const openEdit = (c: Contractor) => {
    setForm({ name: c.name, director: c.director, chiefGeologist: c.chiefGeologist, responsible: c.responsible, executors: c.executors || [] });
    setModal(c);
  };

  const save = () => {
    if (modal === "add") {
      setContractors((prev) => [...prev, { ...form, id: Date.now().toString() + Math.random().toString(36).slice(2, 6) }]);
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
            <ExecutorsList contractor={c} setContractors={setContractors} />
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