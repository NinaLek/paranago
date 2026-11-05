export function haceCuanto(iso: string): string {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  return `hace ${Math.floor(min / 60)} h`;
}

/** Fecha ISO 8601 con zona de Paraná (-03:00 todo el año), como pide la API: "2026-11-02T14:05:00-03:00". */
export function fechaConZona(d: Date = new Date()): string {
  const local = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return local.toISOString().slice(0, 19) + "-03:00";
}
