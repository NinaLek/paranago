import { avisosMock } from "../mocks";
import type { Aviso } from "../tipos";
import { leer, responder } from "./api";

export function obtenerAvisos(): Promise<Aviso[]> {
  return leer(responder(avisosMock));
}

export async function obtenerAvisosDeLinea(lineaId: string): Promise<Aviso[]> {
  const avisos = await leer(responder(avisosMock));
  return avisos.filter((a) => a.lineaIds.includes(lineaId));
}
