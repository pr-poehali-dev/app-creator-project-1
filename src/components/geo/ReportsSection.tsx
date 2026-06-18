import { useState } from "react";
import type { ReportData, Customer, Contractor, License, Contract } from "@/types/geo";
import { SectionHeader, Modal } from "./GeoUi";
import { ReportCard } from "./ReportCard";
import { ReportViewModal } from "./ReportViewModal";
import { ReportFormFields } from "./ReportFormFields";

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
          <ReportCard
            key={r.id}
            report={r}
            customers={customers}
            contractors={contractors}
            licenses={licenses}
            contracts={contracts}
            onOpen={onOpen}
            onEdit={openEdit}
            onView={(id) => setViewId(id)}
            onDelete={(id) => setDeleteId(id)}
          />
        ))}
      </div>

      {viewId && (() => {
        const r = reports.find((x) => x.id === viewId)!;
        return (
          <ReportViewModal
            report={r}
            customers={customers}
            contractors={contractors}
            licenses={licenses}
            contracts={contracts}
            onClose={() => setViewId(null)}
            onEdit={(r) => { setViewId(null); openEdit(r); }}
          />
        );
      })()}

      {modal && (
        <ReportFormFields
          modal={modal}
          form={form}
          setForm={setForm}
          customers={customers}
          contractors={contractors}
          licenses={licenses}
          contracts={contracts}
          filteredLicenses={filteredLicenses}
          pdfUploading={pdfUploading}
          setPdfUploading={setPdfUploading}
          onSave={save}
          onClose={() => setModal(null)}
          onCustomerChange={handleCustomerChange}
          onContractorChange={handleContractorChange}
        />
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
