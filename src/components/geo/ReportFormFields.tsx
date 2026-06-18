import { useRef } from "react";
import Icon from "@/components/ui/icon";
import type { ReportData, Customer, Contractor, License, Contract } from "@/types/geo";
import { SECRECY_OPTIONS } from "@/types/geo";
import { GeoInput, GeoSelect, Modal } from "./GeoUi";

const UPLOAD_URL = "https://functions.poehali.dev/99a0258c-48d9-44f9-889c-adeaad6c8527";

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

interface ReportFormFieldsProps {
  modal: "add" | ReportData;
  form: Omit<ReportData, "id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<ReportData, "id">>>;
  customers: Customer[];
  contractors: Contractor[];
  licenses: License[];
  contracts: Contract[];
  filteredLicenses: License[];
  pdfUploading: boolean;
  setPdfUploading: (v: boolean) => void;
  onSave: () => void;
  onClose: () => void;
  onCustomerChange: (id: string) => void;
  onContractorChange: (id: string) => void;
}

export function ReportFormFields({
  modal,
  form,
  setForm,
  customers,
  contractors,
  licenses,
  contracts,
  filteredLicenses,
  pdfUploading,
  setPdfUploading,
  onSave,
  onClose,
  onCustomerChange,
  onContractorChange,
}: ReportFormFieldsProps) {
  const pdfInputRef = useRef<HTMLInputElement>(null);

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

  // licenses and contracts are passed but filteredLicenses is used for the license selector
  void licenses;
  void contracts;

  return (
    <Modal title={modal === "add" ? "Новый отчёт" : "Редактировать отчёт"} onClose={onClose} wide>
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
          onChange={onCustomerChange}
          options={customers.map((c) => ({ value: c.id, label: c.name }))}
        />
        <GeoSelect
          label="Исполнитель"
          value={form.contractorId}
          onChange={onContractorChange}
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
        <button onClick={onSave} className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">
          Сохранить
        </button>
        <button onClick={onClose} className="px-4 border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">
          Отмена
        </button>
      </div>
    </Modal>
  );
}
