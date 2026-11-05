import type { Horario, TipoDeDia } from "../tipos";

export function claveFecha(f: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${f.getFullYear()}-${p(f.getMonth() + 1)}-${p(f.getDate())}`;
}

/** Un feriado gana sobre el sábado y el domingo (así lo define la API). */
export function tipoDeDia(fecha: Date, feriados: string[] = []): TipoDeDia {
  if (feriados.includes(claveFecha(fecha))) return "feriado";
  const d = fecha.getDay();
  if (d === 0) return "domingo";
  if (d === 6) return "sabado";
  return "habil";
}

export function diaSiguiente(fecha: Date): Date {
  const f = new Date(fecha);
  f.setDate(f.getDate() + 1);
  return f;
}

const aMinutos = (hora: string) => {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
};

export interface Proximo {
  hora: string;
  enMinutos: number;
}

export interface ResultadoProximos {
  proximos: Proximo[];
  mensaje: string | null; // se muestra cuando no hay próximos
}

/** Próximos horarios de TABLA (no es posición real: no hay GPS en los colectivos). */
export function proximosHorarios(
  hoy: Horario[],
  manana: Horario[],
  ahora: Date,
  cantidad = 3
): ResultadoProximos {
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
  const ordenar = (hs: Horario[]) =>
    hs.map((h) => h.hora).sort((a, b) => aMinutos(a) - aMinutos(b));

  const proximos = ordenar(hoy)
    .filter((h) => aMinutos(h) >= minutosAhora)
    .slice(0, cantidad)
    .map((h) => ({ hora: h, enMinutos: aMinutos(h) - minutosAhora }));
  if (proximos.length > 0) return { proximos, mensaje: null };

  const horasManana = ordenar(manana);
  if (horasManana.length > 0) {
    return { proximos: [], mensaje: `No hay más servicio hasta mañana a las ${horasManana[0]}.` };
  }
  return { proximos: [], mensaje: "No hay servicio programado en esta parada." };
}
