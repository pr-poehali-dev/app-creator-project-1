import Icon from "@/components/ui/icon";
import type { ReportData, Customer, Contractor, License, Contract } from "@/types/geo";
import { FieldGroup, Modal } from "./GeoUi";

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-xs font-mono text-geo-amber uppercase tracking-widest flex-shrink-0">{title}</span>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}

interface ReportViewModalProps {
  report: ReportData;
  customers: Customer[];
  contractors: Contractor[];
  licenses: License[];
  contracts: Contract[];
  onClose: () => void;
  onEdit: (r: ReportData) => void;
}

export function ReportViewModal({
  report: r,
  customers,
  contractors,
  onClose,
  onEdit,
}: ReportViewModalProps) {
  const customerName = (id: string) => customers.find((c) => c.id === id)?.name || "—";
  const contractorName = (id: string) => contractors.find((c) => c.id === id)?.name || "—";

  return (
    <Modal title="Общие сведения об отчёте" onClose={onClose} wide>
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
        <button onClick={() => { onClose(); onEdit(r); }} className="flex items-center gap-2 border border-border text-muted-foreground px-4 py-2 text-xs font-display tracking-wider uppercase hover:border-geo-amber hover:text-geo-amber transition-colors">
          <Icon name="Pencil" size={12} />
          Редактировать
        </button>
        <button onClick={onClose} className="flex-1 bg-geo-amber text-primary-foreground py-2 text-sm font-display tracking-wider uppercase hover:bg-amber-400 transition-colors">
          Закрыть
        </button>
      </div>
    </Modal>
  );
}
