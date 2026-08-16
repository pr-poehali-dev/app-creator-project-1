import Icon from "@/components/ui/icon";
import type { ReportData } from "@/types/geo";
import type { MergeResult } from "@/components/report/mergePdfApi";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const secrecyColor: Record<string, string> = {
  "нс": "text-muted-foreground",
  "КТ": "text-blue-400",
  "С": "text-geo-amber",
  "СС": "text-orange-400",
  "ОВ": "text-destructive",
};

interface ReportPageHeaderProps {
  report: ReportData;
  dirtySize: number;
  savingAll: boolean;
  savedAll: boolean;
  saveAllFailed: boolean;
  onSaveAll: () => void;
  onBack: () => void;
  pdfExporting: boolean;
  onExportPdf: () => void;
  kitBuilding: boolean;
  onBuildPrintKit: () => void;
  kitResult: MergeResult | null;
  onHideKitResult: () => void;
  pdfError: string | null;
}

// Верхняя панель отчёта: возврат к списку, статус сохранения,
// гриф секретности, экспорт PDF и сборка печатного комплекта.
export function ReportPageHeader({
  report, dirtySize, savingAll, savedAll, saveAllFailed, onSaveAll, onBack,
  pdfExporting, onExportPdf, kitBuilding, onBuildPrintKit,
  kitResult, onHideKitResult, pdfError,
}: ReportPageHeaderProps) {
  return (
    <header className="border-b border-border bg-card/90 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs font-mono"
          >
            <Icon name="ChevronLeft" size={16} />
            Отчёты
          </button>
          <span className="text-border">/</span>
          <div className="flex items-center gap-2">
            <Icon name="Mountain" size={15} className="text-geo-amber" />
            <span className="font-display text-sm tracking-wider uppercase text-foreground truncate max-w-xs">
              {report.title || "Без названия"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {dirtySize > 0 && (
            <button
              onClick={onSaveAll}
              disabled={savingAll}
              title="Записать в базу все разделы с изменениями"
              className="flex items-center gap-1.5 font-mono text-xs text-geo-amber border border-geo-amber/40 px-2.5 py-1 hover:bg-geo-amber/10 transition-colors disabled:opacity-60"
            >
              {savingAll ? (
                <Icon name="Loader2" size={12} className="animate-spin" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-geo-amber animate-pulse" />
              )}
              {savingAll ? "Сохранение…" : `Сохранить всё (${dirtySize})`}
            </button>
          )}
          {savedAll && dirtySize === 0 && (
            <span className="flex items-center gap-1.5 font-mono text-xs text-green-400 border border-green-500/30 px-2.5 py-1">
              <Icon name="CheckCircle2" size={12} />
              Сохранено
            </span>
          )}
          {saveAllFailed && (
            <span className="flex items-center gap-1.5 font-mono text-xs text-destructive border border-destructive/40 px-2.5 py-1">
              <Icon name="TriangleAlert" size={12} />
              Не удалось сохранить
            </span>
          )}
          <span className={`font-mono text-xs font-bold border px-2 py-0.5 border-current ${secrecyColor[report.secrecy]}`}>
            {report.secrecy}
          </span>
          <span className="font-mono text-xs text-muted-foreground hidden sm:block border border-border px-2 py-0.5">
            ГОСТ Р 53579–2009
          </span>
          <ThemeToggle />
          <button
            onClick={onExportPdf}
            disabled={pdfExporting}
            className="flex items-center gap-2 bg-geo-amber text-primary-foreground px-3 py-1.5 text-xs font-display tracking-wider uppercase hover:bg-geo-amber-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Icon name={pdfExporting ? "Loader2" : "FileDown"} size={13} className={pdfExporting ? "animate-spin" : ""} />
            {pdfExporting ? "Генерация..." : "Экспорт PDF"}
          </button>
          <button
            onClick={onBuildPrintKit}
            disabled={kitBuilding || pdfExporting}
            title="Отчёт и все приложения — ТЗ, карты, схемы, заключения — одним файлом для печати"
            className="flex items-center gap-2 border border-geo-amber text-geo-amber px-3 py-1.5 text-xs font-display tracking-wider uppercase hover:bg-geo-amber hover:text-primary-foreground transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Icon name={kitBuilding ? "Loader2" : "Printer"} size={13} className={kitBuilding ? "animate-spin" : ""} />
            {kitBuilding ? "Сборка..." : "Комплект к печати"}
          </button>
        </div>
        {kitResult && (
          <div className="px-4 pb-2 flex flex-wrap items-center gap-3">
            <p className="text-xs text-geo-green flex items-center gap-1.5">
              <Icon name="CircleCheck" size={12} />
              Комплект собран: {kitResult.pages} стр., приложений подшито {Math.max(0, kitResult.merged - 1)}
            </p>
            <a
              href={kitResult.url}
              target="_blank"
              rel="noreferrer"
              download={kitResult.filename}
              className="text-xs font-display tracking-wider uppercase bg-geo-amber text-primary-foreground px-3 py-1 hover:bg-geo-amber-hover transition-colors"
            >
              Скачать
            </a>
            {kitResult.skipped.length > 0 && (
              <span className="text-xs text-destructive">
                Не удалось подшить: {kitResult.skipped.map((s) => s.title).join(", ")}
              </span>
            )}
            <button onClick={onHideKitResult} className="text-xs text-muted-foreground hover:text-foreground">
              Скрыть
            </button>
          </div>
        )}
        {pdfError && (
          <div className="px-4 pb-2">
            <p className="text-xs text-destructive flex items-center gap-1.5">
              <Icon name="TriangleAlert" size={12} />
              {pdfError}
            </p>
          </div>
        )}
      </div>
    </header>
  );
}

export default ReportPageHeader;
