import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import type { ReportData, Customer, Contractor, License, Contract, Secrecy } from "@/types/geo";
import { SECRECY_OPTIONS } from "@/types/geo";
import { FieldGroup, GeoInput, GeoSelect, SectionHeader, Modal } from "./GeoUi";

const UPLOAD_URL = "https://functions.poehali.dev/99a0258c-48d9-44f9-889c-adeaad6c8527";

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
  licenseNumber: "",
  licenseDate: "",
  licenseExpiry: "",
  licensePdfUrl: "",
  licensePdfName: "",
  siteDescription: "",
  coordLat: "",
  coordLon: "",
  depthLimit: null,
  extractionVolumeDayCurrent: null,
  extractionVolumeYearCurrent: null,
  extractionVolumeDayPlan: null,
  extractionVolumeYearPlan: null,
  waterUseType: "",
  aquiferName: "",
  aquiferDepthTop: null,
  aquiferStaticLevel: null,
  aquiferAllowableDrop: null,
};

function NumInput({
  label,
  value,
  onChange,
  placeholder,
  unit,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
  unit?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          placeholder={placeholder}
          className="flex-1 bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-geo-amber transition-colors"
        />
        {unit && <span className="text-xs font-mono text-muted-foreground flex-shrink-0">{unit}</span>}
      </div>
    </div>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-xs font-mono text-geo-amber uppercase tracking-widest flex-shrink-0">{title}</span>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}

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
  const [modal, setModal] = useState<null | "add" | ReportData>(null);
  const [form, setForm] = useState<Omit<ReportData, "id">>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

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
    setForm({
      title: r.title,
      customerId: r.customerId,
      contractorId: r.contractorId,
      licenseId: r.licenseId,
      contractId: r.contractId,
      responsible: r.responsible,
      secrecy: r.secrecy,
      place: r.place || "",
      year: r.year || new Date().getFullYear().toString(),
      govRegNumber: r.govRegNumber || "",
      coContractors: r.coContractors || [],
      licenseNumber: r.licenseNumber || "",
      licenseDate: r.licenseDate || "",
      licenseExpiry: r.licenseExpiry || "",
      licensePdfUrl: r.licensePdfUrl || "",
      licensePdfName: r.licensePdfName || "",
      siteDescription: r.siteDescription || "",
      coordLat: r.coordLat || "",
      coordLon: r.coordLon || "",
      depthLimit: r.depthLimit ?? null,
      extractionVolumeDayCurrent: r.extractionVolumeDayCurrent ?? null,
      extractionVolumeYearCurrent: r.extractionVolumeYearCurrent ?? null,
      extractionVolumeDayPlan: r.extractionVolumeDayPlan ?? null,
      extractionVolumeYearPlan: r.extractionVolumeYearPlan ?? null,
      waterUseType: r.waterUseType || "",
      aquiferName: r.aquiferName || "",
      aquiferDepthTop: r.aquiferDepthTop ?? null,
      aquiferStaticLevel: r.aquiferStaticLevel ?? null,
      aquiferAllowableDrop: r.aquiferAllowableDrop ?? null,
    });
    setModal(r);
  };

  const save = () => {
    if (modal === "add") {
      setReports((prev) => [...prev, { ...form, id: Date.now().toString() }]);
    } else if (modal && typeof modal === "object") {
      setReports((prev) =>
        prev.map((r) => (r.id === (modal as ReportData).id ? { ...(modal as ReportData), ...form } : r))
      );
    }
    setModal(null);
  };

  const remove = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    setDeleteId(null);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch(UPLOAD_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, content_type: file.type, data: base64 }),
        });
        const json = await res.json();
        setForm((f) => ({ ...f, licensePdfUrl: json.url || "", licensePdfName: file.name }));
        setPdfUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setPdfUploading(false);
    }
    e.target.value = "";
  };

  const customerName = (id: string) => customers.find((c) => c.id === id)?.name || "—";
  const contractorName = (id: string) => contractors.find((c) => c.id === id)?.name || "—";
  const licenseName = (id: string) => {
    const l = licenses.find((l) => l.id === id);
    return l ? `${l.number} · ${l.siteName}` : "—";
  };
  const contractName = (id: string) => {
    const c = contracts.find((c) => c.id === id);
    return c ? `№ ${c.number}` : "—";
  };

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
          <div className="border border-dashed border-border py-10 text-center text-muted-foreground text-sm font-mono">
            Нет записей
          </div>
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
                  <FieldGroup label="Лицензия" value={r.licenseNumber || licenseName(r.licenseId)} />
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
                <button
                  onClick={() => setViewId(r.id)}
                  className="flex items-center gap-1.5 border border-border text-muted-foreground px-3 py-1.5 text-xs font-display tracking-wider uppercase hover:border-geo-amber hover:text-geo-amber transition-colors"
                >
                  <Icon name="Info" size={12} />
                  Сведения
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

      {viewId && (() => {
        const r = reports.find((x) => x.id === viewId)!;
        return (
          <Modal title="Общие сведения об отчёте" onClose={() => setViewId(null)} wide>
            <SectionDivider title="Основные данные" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <FieldGroup label="Наименование" value={r.title} />
              <FieldGroup label="Год" value={r.year} />
              <FieldGroup label="Заказчик" value={customerName(r.customerId)} />
              <FieldGroup label="Исполнитель" value={contractorName(r.contractorId)} />
              <FieldGroup label="Ответственный" value={r.responsible} />
              <FieldGroup label="Гос. регистрация" value={r.govRegNumber} />
              <FieldGroup label="Место выпуска" value={r.place} />
              <FieldGroup label="Гриф" value={r.secrecy} />
            </div>

            <SectionDivider title="Лицензия на недропользование" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <FieldGroup label="Номер лицензии" value={r.licenseNumber} />
              <FieldGroup label="Дата выдачи" value={r.licenseDate} />
              <FieldGroup label="Действует до" value={r.licenseExpiry} />
            </div>
            {r.licensePdfUrl && (
              <div className="space-y-0.5">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">PDF лицензии</div>
                <a href={r.licensePdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-geo-amber hover:underline">
                  <Icon name="FileText" size={14} />
                  {r.licensePdfName || "Открыть файл"}
                </a>
              </div>
            )}

            <SectionDivider title="Участок недр" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <FieldGroup label="Описание" value={r.siteDescription} />
              <FieldGroup label="Ограничение по глубине" value={r.depthLimit != null ? `${r.depthLimit} м` : ""} />
              <FieldGroup label="Северная широта" value={r.coordLat} />
              <FieldGroup label="Восточная долгота" value={r.coordLon} />
            </div>

            <SectionDivider title="Добыча подземных вод" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <FieldGroup label="Цель использования" value={r.waterUseType} />
              <div />
              <FieldGroup label="Текущий объём, м³/сут" value={r.extractionVolumeDayCurrent != null ? String(r.extractionVolumeDayCurrent) : ""} />
              <FieldGroup label="Текущий объём, тыс.м³/год" value={r.extractionVolumeYearCurrent != null ? String(r.extractionVolumeYearCurrent) : ""} />
              <FieldGroup label="Перспектива, м³/сут" value={r.extractionVolumeDayPlan != null ? String(r.extractionVolumeDayPlan) : ""} />
              <FieldGroup label="Перспектива, тыс.м³/год" value={r.extractionVolumeYearPlan != null ? String(r.extractionVolumeYearPlan) : ""} />
            </div>

            <SectionDivider title="Водоносный горизонт" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <FieldGroup label="Наименование горизонта" value={r.aquiferName} />
              <div />
              <FieldGroup label="Кровля залегания" value={r.aquiferDepthTop != null ? `${r.aquiferDepthTop} м` : ""} />
              <FieldGroup label="Статический уровень" value={r.aquiferStaticLevel != null ? `${r.aquiferStaticLevel} м` : ""} />
              <FieldGroup label="Доп. понижение уровня" value={r.aquiferAllowableDrop != null ? `${r.aquiferAllowableDrop} м` : ""} />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => { setViewId(null); openEdit(r); }} className="flex items-center gap-2 border border-border text-muted-foreground px-4 py-2 text-xs font-display tracking-wider uppercase hover:border-geo-amber hover:text-geo-amber transition-colors">
                <Icon name="Pencil" size={12} />
                Редактировать
              </button>
              <button onClick={() => setViewId(null)} className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">
                Закрыть
              </button>
            </div>
          </Modal>
        );
      })()}

      {modal && (
        <Modal title={modal === "add" ? "Новый отчёт" : "Редактировать отчёт"} onClose={() => setModal(null)} wide>
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
            label={`Лицензия (справочник)${form.customerId ? "" : " — сначала выберите заказчика"}`}
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
            <GeoInput label="Номер гос. регистрации" value={form.govRegNumber} onChange={(v) => setForm((f) => ({ ...f, govRegNumber: v }))} placeholder="№ ГР ..." />
            <GeoInput label="Год" type="number" value={form.year} onChange={(v) => setForm((f) => ({ ...f, year: v }))} placeholder={new Date().getFullYear().toString()} />
          </div>

          <GeoInput label="Место выпуска отчёта" value={form.place} onChange={(v) => setForm((f) => ({ ...f, place: v }))} placeholder="Москва" />

          {/* ── Лицензия на недропользование ── */}
          <SectionDivider title="Лицензия на недропользование" />

          <div className="grid grid-cols-3 gap-3">
            <GeoInput
              label="Номер лицензии"
              value={form.licenseNumber}
              onChange={(v) => setForm((f) => ({ ...f, licenseNumber: v }))}
              placeholder="ЯРЛ 57970 ВЭ"
            />
            <GeoInput
              label="Дата выдачи"
              value={form.licenseDate}
              onChange={(v) => setForm((f) => ({ ...f, licenseDate: v }))}
              placeholder="29.01.2013"
            />
            <GeoInput
              label="Действует до"
              value={form.licenseExpiry}
              onChange={(v) => setForm((f) => ({ ...f, licenseExpiry: v }))}
              placeholder="01.02.2024"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">PDF лицензии</label>
            {form.licensePdfUrl ? (
              <div className="flex items-center gap-3 bg-muted border border-border px-3 py-2">
                <Icon name="FileText" size={16} className="text-geo-amber flex-shrink-0" />
                <a href={form.licensePdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-geo-amber hover:underline flex-1 truncate">
                  {form.licensePdfName || "Открыть файл"}
                </a>
                <button
                  onClick={() => setForm((f) => ({ ...f, licensePdfUrl: "", licensePdfName: "" }))}
                  className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => pdfInputRef.current?.click()}
                disabled={pdfUploading}
                className="w-full flex items-center justify-center gap-2 bg-muted border border-dashed border-border px-3 py-3 text-xs font-mono text-muted-foreground hover:border-geo-amber hover:text-geo-amber transition-colors disabled:opacity-50"
              >
                <Icon name={pdfUploading ? "Loader2" : "Upload"} size={14} />
                {pdfUploading ? "Загрузка..." : "Загрузить PDF лицензии"}
              </button>
            )}
            <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
          </div>

          {/* ── Участок недр ── */}
          <SectionDivider title="Участок недр" />

          <GeoInput
            label="Описание участка"
            value={form.siteDescription}
            onChange={(v) => setForm((f) => ({ ...f, siteDescription: v }))}
            placeholder="северо-восточная окраина п. Шашково, Рыбинский муниципальный район"
          />

          <div className="grid grid-cols-3 gap-3">
            <GeoInput
              label="Сев. широта"
              value={form.coordLat}
              onChange={(v) => setForm((f) => ({ ...f, coordLat: v }))}
              placeholder="58° 00' 42&quot;"
            />
            <GeoInput
              label="Вост. долгота"
              value={form.coordLon}
              onChange={(v) => setForm((f) => ({ ...f, coordLon: v }))}
              placeholder="39° 11' 10&quot;"
            />
            <NumInput
              label="Огр. по глубине"
              value={form.depthLimit}
              onChange={(v) => setForm((f) => ({ ...f, depthLimit: v }))}
              placeholder="80"
              unit="м"
            />
          </div>

          {/* ── Добыча подземных вод ── */}
          <SectionDivider title="Добыча подземных вод" />

          <GeoInput
            label="Цель использования воды"
            value={form.waterUseType}
            onChange={(v) => setForm((f) => ({ ...f, waterUseType: v }))}
            placeholder="технологическое обеспечение водой предприятия"
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Текущий объём</div>
              <div className="grid grid-cols-2 gap-2">
                <NumInput label="м³/сут" value={form.extractionVolumeDayCurrent} onChange={(v) => setForm((f) => ({ ...f, extractionVolumeDayCurrent: v }))} placeholder="41" />
                <NumInput label="тыс.м³/год" value={form.extractionVolumeYearCurrent} onChange={(v) => setForm((f) => ({ ...f, extractionVolumeYearCurrent: v }))} placeholder="15" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Перспектива</div>
              <div className="grid grid-cols-2 gap-2">
                <NumInput label="м³/сут" value={form.extractionVolumeDayPlan} onChange={(v) => setForm((f) => ({ ...f, extractionVolumeDayPlan: v }))} placeholder="55" />
                <NumInput label="тыс.м³/год" value={form.extractionVolumeYearPlan} onChange={(v) => setForm((f) => ({ ...f, extractionVolumeYearPlan: v }))} placeholder="20" />
              </div>
            </div>
          </div>

          {/* ── Водоносный горизонт ── */}
          <SectionDivider title="Водоносный горизонт" />

          <GeoInput
            label="Наименование горизонта"
            value={form.aquiferName}
            onChange={(v) => setForm((f) => ({ ...f, aquiferName: v }))}
            placeholder="окско-московский водно-ледниковый горизонт (f,lI IIok-ms)"
          />

          <div className="grid grid-cols-3 gap-3">
            <NumInput label="Кровля залегания" value={form.aquiferDepthTop} onChange={(v) => setForm((f) => ({ ...f, aquiferDepthTop: v }))} placeholder="38" unit="м" />
            <NumInput label="Статический уровень" value={form.aquiferStaticLevel} onChange={(v) => setForm((f) => ({ ...f, aquiferStaticLevel: v }))} placeholder="24" unit="м" />
            <NumInput label="Доп. понижение уровня" value={form.aquiferAllowableDrop} onChange={(v) => setForm((f) => ({ ...f, aquiferAllowableDrop: v }))} placeholder="38" unit="м" />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={save} className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">
              Сохранить
            </button>
            <button onClick={() => setModal(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">
              Отмена
            </button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Подтверждение удаления" onClose={() => setDeleteId(null)}>
          <p className="text-sm text-muted-foreground">Вы уверены, что хотите удалить запись?</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => remove(deleteId)} className="flex-1 bg-destructive text-destructive-foreground py-2 text-sm font-display tracking-wider uppercase hover:opacity-90 transition-opacity">
              Удалить
            </button>
            <button onClick={() => setDeleteId(null)} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">
              Отмена
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}