import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const IMAGE_EXTS = /\.(jpg|jpeg|png|webp|gif|svg|bmp|tiff?)(\?.*)?$/i;
const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/bmp"];

function isImage(url: string, mime?: string): boolean {
  if (mime && IMAGE_MIMES.some((m) => mime.startsWith(m))) return true;
  return IMAGE_EXTS.test(url);
}

// ─── Модальное окно ────────────────────────────────────────────────────────────

interface PreviewModalProps {
  url: string;
  filename?: string;
  mime?: string;
  onClose: () => void;
}

export function PdfPreviewModal({ url, filename, mime, onClose }: PreviewModalProps) {
  const image = isImage(url, mime);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (image) {
        if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.25, 4));
        if (e.key === "-") setZoom((z) => Math.max(z - 0.25, 0.25));
        if (e.key === "0") setZoom(1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, image]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background/97 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 h-12 border-b border-border bg-card/90 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Icon
            name={image ? "Image" : "FileText"}
            size={15}
            className="text-geo-amber flex-shrink-0"
          />
          <span className="font-mono text-xs text-foreground/80 truncate max-w-xs sm:max-w-sm">
            {filename || (image ? "Изображение" : "Документ")}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Zoom controls — только для изображений */}
          {image && (
            <div className="flex items-center gap-1 border border-border px-1">
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Уменьшить (−)"
              >
                <Icon name="Minus" size={12} />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="font-mono text-xs text-muted-foreground hover:text-geo-amber transition-colors px-1.5 min-w-[3rem] text-center"
                title="Сбросить (0)"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Увеличить (+)"
              >
                <Icon name="Plus" size={12} />
              </button>
            </div>
          )}

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
            className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 border border-border"
          >
            <Icon name="X" size={13} /> Закрыть
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto flex items-start justify-center">
        {image ? (
          <div
            className="p-6 transition-transform duration-150 origin-top"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
          >
            <img
              src={url}
              alt={filename || "Иллюстрация"}
              className="max-w-full h-auto shadow-2xl border border-border/30"
              style={{ display: "block" }}
            />
            {filename && (
              <p className="text-center text-xs font-mono text-muted-foreground mt-3 max-w-xl mx-auto">
                {filename}
              </p>
            )}
          </div>
        ) : (
          <iframe
            src={url}
            title={filename || "Документ"}
            className="w-full border-0"
            style={{ display: "block", height: "100%", minHeight: "calc(100vh - 48px)" }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Хук ──────────────────────────────────────────────────────────────────────

interface PreviewState {
  url: string;
  filename?: string;
  mime?: string;
}

export function usePdfPreview() {
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const openPreview = (url: string, filename?: string, mime?: string) =>
    setPreview({ url, filename, mime });
  const closePreview = () => setPreview(null);

  const modal = preview ? (
    <PdfPreviewModal
      url={preview.url}
      filename={preview.filename}
      mime={preview.mime}
      onClose={closePreview}
    />
  ) : null;

  return { openPreview, closePreview, modal };
}

// ─── Кнопка-триггер ────────────────────────────────────────────────────────────

interface PdfOpenButtonProps {
  url: string;
  filename?: string;
  mime?: string;
  label?: string;
  className?: string;
  onPreview: (url: string, filename?: string, mime?: string) => void;
}

export function PdfOpenButton({ url, filename, mime, label = "Просмотр", className, onPreview }: PdfOpenButtonProps) {
  return (
    <button
      onClick={() => onPreview(url, filename, mime)}
      className={className ?? "inline-flex items-center gap-1.5 text-xs font-mono text-geo-amber hover:text-amber-400 transition-colors"}
    >
      <Icon name={isImage(url, mime) ? "ZoomIn" : "Eye"} size={12} /> {label}
    </button>
  );
}
