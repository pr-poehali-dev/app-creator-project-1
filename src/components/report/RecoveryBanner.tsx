import Icon from "@/components/ui/icon";
import { formatBackupTime } from "@/lib/draftBackup";

// Предложение восстановить несохранённые правки после сбоя
export function RecoveryBanner({ savedAt, onRestore, onDismiss }: {
  savedAt: number;
  onRestore: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="border border-geo-amber/40 bg-geo-amber/5 p-3 flex flex-wrap items-center gap-3 animate-fade-in">
      <Icon name="History" size={16} className="text-geo-amber flex-shrink-0" />
      <div className="flex-1 min-w-[200px]">
        <p className="text-sm text-foreground">
          Найдены несохранённые правки от <span className="font-mono text-geo-amber">{formatBackupTime(savedAt)}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Похоже, вкладка закрылась до сохранения. Восстановить этот текст?
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={onDismiss}
          className="border border-border text-muted-foreground px-3 py-1.5 text-xs font-display tracking-wider uppercase hover:text-foreground transition-colors"
        >
          Удалить
        </button>
        <button
          onClick={onRestore}
          className="bg-geo-amber text-primary-foreground px-4 py-1.5 text-xs font-display tracking-wider uppercase hover:bg-geo-amber-hover transition-colors"
        >
          Восстановить
        </button>
      </div>
    </div>
  );
}

export default RecoveryBanner;
