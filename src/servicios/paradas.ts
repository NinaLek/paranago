import { paradasMock } from "../mocks";
import type { Parada } from "../tipos";
import { ErrorApi, leer, responder } from "./api";

export function obtenerParadas(): Promise<Parada[]> {
  return leer(responder(paradasMock));
}

export async function obtenerParada(id: string): Promise<Parada> {
  const paradas = await leer(responder(paradasMock));
  const parada = paradas.find((p) => p.id === id);
  if (!parada) throw new ErrorApi("PARADA_NO_ENCONTRADA", "No existe esa parada.");
  return parada;
}

/** Búsqueda por nombre (sin distinguir mayúsculas ni tildes) */
export async function buscarParadas(texto: string): Promise<Parada[]> {
  const normalizar = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const paradas = await leer(responder(paradasMock));
  const q = normalizar(texto.trim());
  if (!q) return paradas;
  return paradas.filter((p) => normalizar(p.nombre).includes(q));
}
