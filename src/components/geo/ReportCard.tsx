import Icon from "@/components/ui/icon";
import type { ReportData, Customer, Contractor, License, Contract, Secrecy } from "@/types/geo";
import { FieldGroup } from "./GeoUi";

const secrecyColor: Record<Secrecy, string> = {
  "нс": "text-muted-foreground border-muted-foreground/30",
  "КТ": "text-geo-blue border-geo-blue/50",
  "С": "text-geo-amber border-geo-amber/50",
  "СС": "text-orange-400 border-orange-400/50",
  "ОВ": "text-destructive border-destructive/50",
};

interface ReportCardProps {
  report: ReportData;
  customers: Customer[];
  contractors: Contractor[];
  licenses: License[];
  contracts: Contract[];
  onOpen: (id: string) => void;
  onEdit: (r: ReportData) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ReportCard({
  report: r,
  customers,
  contractors,
  licenses,
  contracts,
  onOpen,
  onEdit,
  onView,
  onDelete,
}: ReportCardProps) {
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

  return (
    <div className="card-geo p-4 group animate-fade-in">
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
            <FieldGroup label="Лицензия" value={r.licenseId ? licenseName(r.licenseId) : r.licenseNumber || "—"} />
            <FieldGroup label="Контракт" value={r.contractId ? contractName(r.contractId) : "—"} />
            <FieldGroup label="Место / год" value={[r.place, r.year].filter(Boolean).join(", ")} />
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
            onClick={() => onView(r.id)}
            className="flex items-center gap-1.5 border border-border text-muted-foreground px-3 py-1.5 text-xs font-display tracking-wider uppercase hover:border-geo-amber hover:text-geo-amber transition-colors"
          >
            <Icon name="Info" size={12} />
            Сведения
          </button>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(r)} className="p-1.5 text-muted-foreground hover:text-geo-amber transition-colors">
              <Icon name="Pencil" size={14} />
            </button>
            <button onClick={() => onDelete(r.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
              <Icon name="Trash2" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
