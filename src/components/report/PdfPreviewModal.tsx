import { useEffect } from "react";
import Icon from "@/components/ui/icon";

interface PdfPreviewModalProps {
  url: string;
  filename?: string;
  onClose: () => void;
}

export function PdfPreviewModal({ url, filename, onClose }: PdfPreviewModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 h-12 border-b border-border bg-card/90 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Icon name="FileText" size={15} className="text-geo-amber flex-shrink-0" />
          <span className="font-mono text-xs text-foreground/80 truncate max-w-sm">
            {filename || "Документ"}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-geo-amber transition-colors px-2 py-1 border border-border hover:border-geo-amber/40"
          >
            <Icon name="ExternalLink" size={12} /> Открыть в новой вкладке
          </a>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 border border-border hover:border-border/80"
          >
            <Icon name="X" size={13} /> Закрыть
          </button>
        </div>
      </div>

      {/* PDF iframe */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={url}
          title={filename || "Документ"}
          className="w-full h-full border-0"
          style={{ display: "block" }}
        />
      </div>
    </div>
  );
}

// ─── Кнопка-триггер для переиспользования ──────────────────────────────────────

interface PdfOpenButtonProps {
  url: string;
  filename?: string;
  label?: string;
  className?: string;
  onPreview: (url: string, filename?: string) => void;
}

export function PdfOpenButton({ url, filename, label = "Открыть", className, onPreview }: PdfOpenButtonProps) {
  return (
    <button
      onClick={() => onPreview(url, filename)}
      className={className ?? "inline-flex items-center gap-1.5 text-xs font-mono text-geo-amber hover:text-amber-400 transition-colors"}
    >
      <Icon name="Eye" size={12} /> {label}
    </button>
  );
}

// ─── Хук для управления состоянием превью ─────────────────────────────────────

import { useState } from "react";

export function usePdfPreview() {
  const [preview, setPreview] = useState<{ url: string; filename?: string } | null>(null);

  const openPreview = (url: string, filename?: string) => setPreview({ url, filename });
  const closePreview = () => setPreview(null);

  const modal = preview ? (
    <PdfPreviewModal url={preview.url} filename={preview.filename} onClose={closePreview} />
  ) : null;

  return { openPreview, closePreview, modal };
}
