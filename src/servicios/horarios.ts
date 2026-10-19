import { horariosMock } from "../mocks";
import type { Horario, TipoDeDia } from "../tipos";
import { leer, responder } from "./api";

export function obtenerHorariosDeLinea(lineaId: string, tipoDeDia: TipoDeDia): Promise<Horario[]> {
  return leer(
    responder(horariosMock.filter((h) => h.lineaId === lineaId && h.tipoDeDia === tipoDeDia))
  );
}

/** Puede devolver una lista vacía: parada sin servicio (ver mocks, par-103) */
export function obtenerHorariosDeParada(paradaId: string, tipoDeDia: TipoDeDia): Promise<Horario[]> {
  return leer(
    responder(horariosMock.filter((h) => h.paradaId === paradaId && h.tipoDeDia === tipoDeDia))
  );
}
