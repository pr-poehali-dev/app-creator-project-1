import Icon from "@/components/ui/icon";

export function FieldGroup({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{label}</div>
      <div className="text-sm text-foreground leading-tight">{value || "—"}</div>
    </div>
  );
}

export function GeoInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-geo-amber focus:ring-0 transition-colors"
      />
    </div>
  );
}

export function GeoSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-muted border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-geo-amber transition-colors appearance-none cursor-pointer"
      >
        <option value="">— выберите —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SectionHeader({
  count,
  title,
  subtitle,
  onAdd,
}: {
  count: number;
  title: string;
  subtitle: string;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl text-foreground tracking-wider uppercase">{title}</h2>
          <span className="font-mono text-xs text-geo-amber border border-geo-amber px-2 py-0.5">
            {String(count).padStart(2, "0")}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-mono">{subtitle}</p>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-geo-amber text-primary-foreground px-4 py-2 text-xs font-display tracking-wider uppercase hover:bg-amber-400 transition-colors"
      >
        <Icon name="Plus" size={14} />
        Добавить
      </button>
    </div>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full bg-card border border-border animate-scale-in mx-4 ${wide ? "max-w-2xl" : "max-w-lg"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-display text-lg tracking-wider uppercase text-foreground">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}