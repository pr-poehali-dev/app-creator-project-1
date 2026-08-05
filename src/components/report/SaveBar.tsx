import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { registerDraft, unregisterDraft } from "@/lib/draftRegistry";

// Панель сохранения раздела. Показывает состояние черновика и даёт
// сохранить или отменить правки. Пока правки не сохранены — они видны
// только в этом разделе и не попадают в общий отчёт.
export function SaveBar({
  id,
  dirty,
  saving,
  onSave,
  onRevert,
}: {
  id: string;
  dirty: boolean;
  saving: boolean;
  onSave: () => Promise<boolean>;
  onRevert: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Регистрируем черновик, чтобы страница отчёта знала о несохранённых правках
  useEffect(() => {
    registerDraft(id, { dirty, save: onSave, revert: onRevert });
    return () => unregisterDraft(id);
  }, [id, dirty, onSave, onRevert]);

  useEffect(() => {
    if (!dirty && justSaved) {
      const t = setTimeout(() => setJustSaved(false), 2500);
      return () => clearTimeout(t);
    }
  }, [dirty, justSaved]);

  const handleSave = async () => {
    const ok = await onSave();
    setFailed(!ok);
    setJustSaved(ok);
  };

  if (!dirty) {
    return justSaved ? (
      <div className="sticky bottom-0 z-30 mt-6 border border-green-500/30 bg-green-500/5 px-4 py-2.5 flex items-center gap-2">
        <Icon name="CheckCircle2" size={14} className="text-green-400" />
        <span className="font-mono text-xs text-green-400">Сохранено в базе</span>
      </div>
    ) : null;
  }

  return (
    <div className="sticky bottom-0 z-30 mt-6 border border-geo-amber/40 bg-card/95 backdrop-blur px-4 py-3 flex flex-wrap items-center gap-3">
      <Icon name="CircleDot" size={14} className="text-geo-amber flex-shrink-0" />
      <span className="font-mono text-xs text-geo-amber/90 flex-1 min-w-[180px]">
        {failed ? "Не удалось сохранить — проверьте связь и повторите" : "Есть несохранённые изменения"}
      </span>
      <button
        onClick={onRevert}
        disabled={saving}
        className="border border-border text-muted-foreground px-3 py-2 text-xs font-display tracking-wider uppercase hover:text-foreground transition-colors disabled:opacity-50"
      >
        Отменить
      </button>
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-geo-amber text-primary-foreground px-5 py-2 text-xs font-display tracking-wider uppercase hover:bg-amber-400 transition-colors disabled:opacity-60 flex items-center gap-2"
      >
        {saving && <Icon name="Loader2" size={12} className="animate-spin" />}
        {saving ? "Сохранение…" : "Сохранить"}
      </button>
    </div>
  );
}
