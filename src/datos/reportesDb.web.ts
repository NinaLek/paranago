// Versión WEB: en memoria (SQLite se usa en el celular).
import type { ReporteDeDemora } from "../tipos";

let lista: ReporteDeDemora[] = [];

export async function guardarLocal(r: ReporteDeDemora): Promise<void> {
  lista = [r, ...lista.filter((x) => x.id !== r.id)];
}
export async function listarLocales(): Promise<ReporteDeDemora[]> {
  return [...lista];
}
export async function pendientes(): Promise<ReporteDeDemora[]> {
  return lista.filter((r) => !r.sincronizado);
}
export async function marcarSincronizado(id: string): Promise<void> {
  lista = lista.map((r) => (r.id === id ? { ...r, sincronizado: true } : r));
}
