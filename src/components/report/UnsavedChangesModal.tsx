import { useState } from "react";
import Icon from "@/components/ui/icon";

// Вопрос при уходе из раздела с несохранёнными правками
export function UnsavedChangesModal({ onSave, onDiscard, onStay }: {
  onSave: () => Promise<void>;
  onDiscard: () => void;
  onStay: () => void;
}) {
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-geo-amber/40 w-full max-w-md p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Icon name="TriangleAlert" size={18} className="text-geo-amber flex-shrink-0" />
          <h4 className="font-display text-sm tracking-wider uppercase text-foreground">Несохранённые изменения</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          В этом разделе есть правки, которые ещё не записаны в базу. Сохранить их перед переходом?
        </p>
        <div className="flex flex-wrap gap-2 justify-end pt-1">
          <button
            onClick={onStay}
            disabled={saving}
            className="border border-border text-muted-foreground px-3 py-2 text-xs font-display tracking-wider uppercase hover:text-foreground transition-colors disabled:opacity-50"
          >
            Остаться
          </button>
          <button
            onClick={onDiscard}
            disabled={saving}
            className="border border-destructive/50 text-destructive px-3 py-2 text-xs font-display tracking-wider uppercase hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            Не сохранять
          </button>
          <button
            onClick={async () => {
              setSaving(true);
              try { await onSave(); } catch { /* ignore */ } finally { setSaving(false); }
            }}
            disabled={saving}
            className="bg-geo-amber text-primary-foreground px-5 py-2 text-xs font-display tracking-wider uppercase hover:bg-amber-400 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Icon name="Loader2" size={12} className="animate-spin" />}
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UnsavedChangesModal;