// Datos falsos, tipados con los tipos del PRD.
// NINGUNA pantalla importa este archivo: solo lo usan los servicios.
import type { Aviso, Horario, Linea, Parada } from "../tipos";

export const lineasMock: Linea[] = [
  {
    id: "lin-05",
    numero: "5",
    nombre: "Puerto Viejo — San Agustín",
    color: "#1B6CA8",
    empresa: "Transporte Mariano Moreno",
    activa: true,
    recorridos: [
      {
        sentido: "ida",
        destino: "hacia Puerto Viejo",
        trazado: [
          { latitud: -31.7333, longitud: -60.5241 },
          { latitud: -31.7345, longitud: -60.5230 },
          { latitud: -31.7390, longitud: -60.5190 },
        ],
        paradaIds: ["par-101", "par-102", "par-103"],
      },
      {
        // La vuelta NO pasa por las mismas paradas: es otro recorrido
        sentido: "vuelta",
        destino: "hacia San Agustín",
        trazado: [
          { latitud: -31.7392, longitud: -60.5185 },
          { latitud: -31.7350, longitud: -60.5222 },
          { latitud: -31.7330, longitud: -60.5250 },
        ],
        paradaIds: ["par-201", "par-202"],
      },
    ],
  },
  {
    id: "lin-14",
    numero: "14",
    nombre: "Centro — Bajada Grande",
    color: "#C0392B",
    empresa: "Empresa Etacer",
    activa: true,
    recorridos: [
      {
        sentido: "ida",
        destino: "hacia Bajada Grande",
        trazado: [
          { latitud: -31.7333, longitud: -60.5241 },
          { latitud: -31.7420, longitud: -60.5300 },
        ],
        paradaIds: ["par-101", "par-104"],
      },
      {
        sentido: "vuelta",
        destino: "hacia el centro",
        trazado: [
          { latitud: -31.7425, longitud: -60.5295 },
          { latitud: -31.7338, longitud: -60.5236 },
        ],
        paradaIds: ["par-203"],
      },
    ],
  },
  {
    // Línea con desvío (ver aviso avi-088)
    id: "lin-02",
    numero: "2",
    nombre: "Hospital — Parque Urquiza",
    color: "#27AE60",
    empresa: "Transporte Mariano Moreno",
    activa: true,
    recorridos: [
      {
        sentido: "ida",
        destino: "hacia Parque Urquiza",
        trazado: [
          { latitud: -31.7300, longitud: -60.5300 },
          { latitud: -31.7345, longitud: -60.5230 },
        ],
        paradaIds: ["par-105"],
      },
      {
        sentido: "vuelta",
        destino: "hacia Hospital",
        trazado: [
          { latitud: -31.7348, longitud: -60.5228 },
          { latitud: -31.7302, longitud: -60.5298 },
        ],
        paradaIds: [],
      },
    ],
  },
];

export const paradasMock: Parada[] = [
  { id: "par-101", nombre: "Alameda y Urquiza", coordenadas: { latitud: -31.7333, longitud: -60.5241 }, lineaIds: ["lin-05", "lin-14"], sentido: "ida", refugio: true, codigoQr: "PARANA:par-101" },
  { id: "par-102", nombre: "Corrientes y Buenos Aires", coordenadas: { latitud: -31.7345, longitud: -60.5230 }, lineaIds: ["lin-05"], sentido: "ida", refugio: false, codigoQr: null },
  // Parada sin próximos horarios: terminó el servicio (no hay horarios en el mock)
  { id: "par-103", nombre: "Puerto Viejo", coordenadas: { latitud: -31.7390, longitud: -60.5190 }, lineaIds: ["lin-05"], sentido: "ida", refugio: false, codigoQr: "PARANA:par-103" },
  { id: "par-104", nombre: "Bajada Grande", coordenadas: { latitud: -31.7420, longitud: -60.5300 }, lineaIds: ["lin-14"], sentido: "ida", refugio: true, codigoQr: null },
  { id: "par-105", nombre: "Hospital San Martín", coordenadas: { latitud: -31.7300, longitud: -60.5300 }, lineaIds: ["lin-02"], sentido: "ida", refugio: false, codigoQr: null },
  { id: "par-201", nombre: "Puerto Viejo (vuelta)", coordenadas: { latitud: -31.7392, longitud: -60.5185 }, lineaIds: ["lin-05"], sentido: "vuelta", refugio: false, codigoQr: null },
  { id: "par-202", nombre: "Alameda y Urquiza (vuelta)", coordenadas: { latitud: -31.7330, longitud: -60.5250 }, lineaIds: ["lin-05"], sentido: "vuelta", refugio: false, codigoQr: null },
  { id: "par-203", nombre: "Centro (vuelta)", coordenadas: { latitud: -31.7338, longitud: -60.5236 }, lineaIds: ["lin-14"], sentido: "vuelta", refugio: false, codigoQr: null },
];

function crearHorarios(
  prefijo: string,
  lineaId: string,
  paradaId: string,
  sentido: "ida" | "vuelta",
  horas: string[],
  tipoDeDia: Horario["tipoDeDia"] = "habil"
): Horario[] {
  return horas.map((hora, i) => ({
    id: `${prefijo}-${i}`,
    lineaId,
    paradaId,
    sentido,
    tipoDeDia,
    hora,
  }));
}

export const horariosMock: Horario[] = [
  ...crearHorarios("h1", "lin-05", "par-101", "ida", ["05:20", "10:42", "11:02", "11:22", "23:40"]),
  ...crearHorarios("h2", "lin-05", "par-101", "ida", ["06:30", "11:00", "23:00"], "sabado"),
  ...crearHorarios("h3", "lin-14", "par-101", "ida", ["10:51", "11:21", "11:51"]),
  ...crearHorarios("h4", "lin-05", "par-102", "ida", ["05:30", "10:50", "11:10"]),
  // par-103: SIN horarios a propósito (caso "terminó el servicio")
];

export const avisosMock: Aviso[] = [
  {
    id: "avi-088",
    titulo: "Desvío por obra en calle Corrientes",
    detalle: "Desde el lunes 14 las líneas 2, 7 y 9 desvían por Santa Fe.",
    lineaIds: ["lin-02"],
    desde: "2026-09-14T00:00:00-03:00",
    hasta: "2026-10-31T23:59:00-03:00",
    gravedad: "desvio",
    trazadoAlternativo: [
      { latitud: -31.7345, longitud: -60.5230 },
      { latitud: -31.7360, longitud: -60.5215 },
    ],
    videoUrl: "https://api.parana.gob.ar/v/desvio-corrientes.mp4",
  },
  {
    // Aviso SIN video, SIN trazado alternativo y SIN fecha de fin
    id: "avi-090",
    titulo: "Cambio de horarios en la línea 14",
    detalle: "Desde la semana próxima se agrega un servicio nocturno.",
    lineaIds: ["lin-14"],
    desde: "2026-10-09T00:00:00-03:00",
    hasta: null,
    gravedad: "informativo",
    trazadoAlternativo: null,
    videoUrl: null,
  },
];
