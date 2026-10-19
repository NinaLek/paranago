import { lineasMock } from "../mocks";
import type { Linea } from "../tipos";
import { ErrorApi, leer, responder } from "./api";

export function obtenerLineas(): Promise<Linea[]> {
  return leer(responder(lineasMock));
}

export async function obtenerLinea(id: string): Promise<Linea> {
  const lineas = await leer(responder(lineasMock));
  const linea = lineas.find((l) => l.id === id);
  if (!linea) throw new ErrorApi("LINEA_NO_ENCONTRADA", "No existe esa línea.");
  return linea;
}
