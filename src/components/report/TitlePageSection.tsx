import Icon from "@/components/ui/icon";
import type { ReportData, Customer, Contractor } from "@/types/geo";
import type { TitlePageData } from "./reportTypes";

export function TitlePageSection({
  report,
  customer,
  contractor,
  titleData,
  setTitleData,
}: {
  report: ReportData;
  customer?: Customer;
  contractor?: Contractor;
  titleData: TitlePageData;
  setTitleData: React.Dispatch<React.SetStateAction<TitlePageData>>;
}) {
  const secrecyColor: Record<string, string> = {
    "нс": "text-muted-foreground border-muted-foreground/40",
    "КТ": "text-blue-400 border-blue-400/50",
    "С": "text-geo-amber border-geo-amber/60",
    "СС": "text-orange-400 border-orange-400/60",
    "ОВ": "text-destructive border-destructive/60",
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Icon name="FileText" size={18} className="text-geo-amber" />
          <h3 className="font-display text-xl tracking-wider uppercase text-foreground">Титульный лист</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono ml-7">ГОСТ Р 53579–2009 · структурный элемент 2 · Приложение А</p>
      </div>

      <div className="border border-geo-amber/30 bg-geo-amber/5 px-4 py-3 flex items-center gap-3">
        <Icon name="Eye" size={14} className="text-geo-amber" />
        <span className="font-mono text-xs text-geo-amber/80">Поля ← загружаются из общих данных · остальные доступны для редактирования</span>
      </div>

      {/* Visual preview — mimics GOST layout */}
      <div className="border border-border p-8 bg-card space-y-5 font-body text-sm">
        <div className="text-center border-b border-foreground/20 pb-4">
          <p className="text-xs text-muted-foreground font-mono mb-1">Министерство; агентство; компания и др.</p>
          <p className="font-semibold text-foreground uppercase leading-snug">
            {customer?.name || <span className="text-muted-foreground italic">ЗАКАЗЧИК РАБОТ</span>}
          </p>
        </div>

        <div className="text-center border-b border-foreground/20 pb-4">
          <p className="text-xs text-muted-foreground font-mono mb-1">Министерство; агентство; компания и др.</p>
          <p className="text-foreground uppercase leading-snug italic">
            {contractor?.name || <span className="text-muted-foreground italic">ПОДРЯДЧИК–ИСПОЛНИТЕЛЬ РАБОТ</span>}
          </p>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-1">№ государственной регистрации работы</p>
            <p className="text-foreground font-mono">{report.govRegNumber || "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-1">Гриф секретности</p>
            <span className={`font-mono text-sm font-bold border px-2 py-0.5 ${secrecyColor[report.secrecy] || "text-foreground border-border"}`}>
              {report.secrecy}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 pt-2">
          {/* СОГЛАСОВАНО */}
          <div className="space-y-3">
            <p className="font-semibold text-center">«СОГЛАСОВАНО»</p>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Должность руководителя согласующей организации</p>
              <input type="text" value={titleData.approverPosition} onChange={(e) => setTitleData((d) => ({ ...d, approverPosition: e.target.value }))} placeholder="Должность" className="w-full bg-muted border border-border px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">И.О. Фамилия</p>
              <input type="text" value={titleData.approverName} onChange={(e) => setTitleData((d) => ({ ...d, approverName: e.target.value }))} placeholder="И.О. Фамилия (необязательно)" className="w-full bg-muted border border-border px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Дата</p>
              <input type="date" value={titleData.approverDate} onChange={(e) => setTitleData((d) => ({ ...d, approverDate: e.target.value }))} className="w-full bg-muted border border-border px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-geo-amber transition-colors" />
            </div>
            {(titleData.approverPosition || titleData.approverName) && (
              <p className="text-xs text-muted-foreground/50 font-mono italic">М.П. (подпись) {titleData.approverName}</p>
            )}
          </div>

          {/* УТВЕРЖДАЮ */}
          <div className="space-y-3">
            <p className="font-semibold text-center">«УТВЕРЖДАЮ»</p>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Должность руководителя организации заказчика</p>
              <input type="text" value={titleData.customerPosition} onChange={(e) => setTitleData((d) => ({ ...d, customerPosition: e.target.value }))} placeholder="Должность" className="w-full bg-muted border border-border px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">И.О. Фамилия</p>
              <input type="text" value={titleData.customerName} onChange={(e) => setTitleData((d) => ({ ...d, customerName: e.target.value }))} placeholder="И.О. Фамилия" className="w-full bg-muted border border-border px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Дата</p>
              <input type="date" value={titleData.customerDate} onChange={(e) => setTitleData((d) => ({ ...d, customerDate: e.target.value }))} className="w-full bg-muted border border-border px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-geo-amber transition-colors" />
            </div>
            <p className="text-xs text-muted-foreground/50 font-mono italic">М.П. (подпись) {titleData.customerName || "И.О. Фамилия"}</p>
          </div>
        </div>

        <div className="border-t border-border/40 pt-4 space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Ответственный исполнитель</p>
            <span className="font-mono text-xs text-geo-amber/60">← из общих данных · редактируемо</span>
          </div>
          <input
            type="text"
            value={titleData.responsibleOverride}
            onChange={(e) => setTitleData((d) => ({ ...d, responsibleOverride: e.target.value }))}
            placeholder={report.responsible || contractor?.responsible || "ФАМИЛИЯ И.О."}
            className="w-full max-w-sm bg-muted border border-border px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-geo-amber transition-colors"
          />
        </div>
      </div>

      {/* Attribute table */}
      <div className="border border-border overflow-hidden">
        <div className="bg-muted/50 border-b border-border px-4 py-2">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Сводная таблица атрибутов</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest w-56">Поле</th>
              <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest">Значение</th>
              <th className="text-left px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest w-40">Источник</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Заказчик работ",                value: customer?.name,          source: "Общие данные" },
              { label: "Исполнитель работ",             value: contractor?.name,         source: "Общие данные" },
              { label: "№ гос. регистрации работы",     value: report.govRegNumber,      source: "Общие данные" },
              { label: "Гриф секретности",              value: report.secrecy,           source: "Общие данные" },
              { label: "Должн. рук. согл. организации", value: titleData.approverPosition || "—", source: "Редактируемо" },
              { label: "ФИО рук. согл. организации",    value: titleData.approverName || "—",     source: "Редактируемо" },
              { label: "Дата согласования",             value: titleData.approverDate ? new Date(titleData.approverDate).toLocaleDateString("ru-RU") : "—", source: "Редактируемо" },
              { label: "Должн. рук. орг. заказчика",    value: titleData.customerPosition || "—", source: "Редактируемо" },
              { label: "ФИО рук. орг. заказчика",       value: titleData.customerName || "—",     source: "Редактируемо" },
              { label: "Дата утверждения",              value: titleData.customerDate ? new Date(titleData.customerDate).toLocaleDateString("ru-RU") : "—", source: "Редактируемо" },
              { label: "Ответственный исполнитель",     value: titleData.responsibleOverride || report.responsible || "—", source: "Общие данные / ред." },
            ].map((row, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest">{row.label}</td>
                <td className="px-4 py-2.5 text-sm text-foreground">{row.value || "—"}</td>
                <td className="px-4 py-2.5">
                  <span className={`font-mono text-xs px-1.5 py-0.5 ${row.source === "Редактируемо" ? "text-foreground/60 bg-muted" : "text-geo-amber/70 bg-geo-amber/10"}`}>
                    {row.source}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
