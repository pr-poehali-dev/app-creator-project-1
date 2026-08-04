import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Icon from "@/components/ui/icon";

// ─── Изученность: топооснова (Leaflet + OSM) с нанесением координат ─────────────

export interface StudyPoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// Простая маркерная иконка через divIcon (без внешних png-ассетов Leaflet)
const markerIcon = L.divIcon({
  className: "",
  html: '<div style="width:16px;height:16px;border-radius:50% 50% 50% 0;background:#f5a623;border:2px solid #1a1a1a;transform:rotate(-45deg);box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 16],
  popupAnchor: [0, -16],
});

const DEFAULT_CENTER: [number, number] = [61.5, 65.5]; // ХМАО как нейтральный центр
const load = (id: string): StudyPoint[] => {
  try {
    const s = localStorage.getItem(`geo_study_${id}`);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
};

function ClickHandler({ onClick }: { onClick: (lat: number, lon: number) => void }) {
  useMapEvents({ click: (e) => onClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function Recenter({ points }: { points: StudyPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lon] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.length]);
  return null;
}

export function StudySection({ reportId }: { reportId: string }) {
  const [points, setPoints] = useState<StudyPoint[]>(() => load(reportId));
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");

  useEffect(() => {
    localStorage.setItem(`geo_study_${reportId}`, JSON.stringify(points));
  }, [points, reportId]);

  const center: [number, number] = points.length
    ? [points[0].lat, points[0].lon]
    : DEFAULT_CENTER;

  const addPoint = (la: number, lo: number, nm?: string) => {
    setPoints((prev) => [
      ...prev,
      { id: newId(), name: nm?.trim() || `Точка ${prev.length + 1}`, lat: la, lon: lo },
    ]);
  };

  const addManual = () => {
    const la = parseFloat(lat.replace(",", "."));
    const lo = parseFloat(lon.replace(",", "."));
    if (Number.isNaN(la) || Number.isNaN(lo)) return;
    if (la < -90 || la > 90 || lo < -180 || lo > 180) return;
    addPoint(la, lo, name);
    setName(""); setLat(""); setLon("");
  };

  const rename = (id: string, nm: string) =>
    setPoints((prev) => prev.map((p) => (p.id === id ? { ...p, name: nm } : p)));
  const remove = (id: string) =>
    setPoints((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Icon name="Search" size={20} className="text-geo-amber" />
        <div>
          <h1 className="font-display text-xl tracking-wider uppercase text-foreground">Изученность</h1>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">Топооснова OSM · нанесение координат пунктов</p>
        </div>
      </div>

      {/* Ввод координат */}
      <div className="border border-border bg-card/50 p-3 mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto] items-end">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-xs text-muted-foreground/70 uppercase tracking-widest">Название точки</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Скв. 1" className="bg-background border border-border px-2 py-1.5 text-sm text-foreground focus:border-geo-amber outline-none" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-xs text-muted-foreground/70 uppercase tracking-widest">Широта</span>
          <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="61.500" className="w-28 bg-background border border-border px-2 py-1.5 text-sm text-foreground focus:border-geo-amber outline-none font-mono" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-xs text-muted-foreground/70 uppercase tracking-widest">Долгота</span>
          <input value={lon} onChange={(e) => setLon(e.target.value)} placeholder="65.500" className="w-28 bg-background border border-border px-2 py-1.5 text-sm text-foreground focus:border-geo-amber outline-none font-mono" />
        </label>
        <button onClick={addManual} className="flex items-center gap-1.5 bg-geo-amber text-primary-foreground px-3 py-2 text-xs font-display tracking-wider uppercase hover:bg-amber-400 transition-colors h-[34px]">
          <Icon name="Plus" size={13} />
          Добавить
        </button>
      </div>
      <p className="font-mono text-xs text-muted-foreground/50 mb-4">
        Десятичные градусы (широта/долгота). Или кликните по карте — координаты подставятся автоматически.
      </p>

      {/* Карта */}
      <div className="border border-border overflow-hidden" style={{ height: 440 }}>
        <MapContainer center={center} zoom={points.length ? 8 : 5} style={{ height: "100%", width: "100%", background: "#0f0f0f" }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onClick={(la, lo) => addPoint(la, lo)} />
          <Recenter points={points} />
          {points.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lon]} icon={markerIcon}>
              <Popup>
                <div style={{ fontSize: 12 }}>
                  <b>{p.name}</b><br />
                  {p.lat.toFixed(5)}, {p.lon.toFixed(5)}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Список точек */}
      <div className="mt-4">
        <p className="font-mono text-xs text-muted-foreground/60 uppercase tracking-widest mb-2">
          Пункты · {points.length}
        </p>
        {points.length === 0 ? (
          <div className="border border-dashed border-border py-8 text-center text-muted-foreground text-sm font-mono">
            Нет нанесённых точек
          </div>
        ) : (
          <div className="space-y-1.5">
            {points.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2 border border-border bg-card/50 px-3 py-2">
                <span className="font-mono text-xs text-muted-foreground/40 w-5">{String(i + 1).padStart(2, "0")}</span>
                <input
                  value={p.name}
                  onChange={(e) => rename(p.id, e.target.value)}
                  className="flex-1 bg-transparent border-b border-transparent hover:border-border focus:border-geo-amber outline-none text-sm text-foreground py-0.5"
                />
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {p.lat.toFixed(5)}, {p.lon.toFixed(5)}
                </span>
                <button onClick={() => remove(p.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudySection;
