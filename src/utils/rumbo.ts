import type { Coordenadas } from "../tipos";

/** Rumbo (0–360°, 0 = norte, horario) desde `a` hasta `b`. */
export function rumboHacia(a: Coordenadas, b: Coordenadas): number {
  const rad = (g: number) => (g * Math.PI) / 180;
  const f1 = rad(a.latitud);
  const f2 = rad(b.latitud);
  const dl = rad(b.longitud - a.longitud);
  const y = Math.sin(dl) * Math.cos(f2);
  const x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}
