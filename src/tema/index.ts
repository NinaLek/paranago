import { useColorScheme } from "react-native";

const claro = {
  fondo: "#F4F6F8",
  tarjeta: "#FFFFFF",
  texto: "#14202B",
  textoSuave: "#5B6B7A",
  borde: "#DDE3E9",
  primario: "#1B6CA8",
  alerta: "#B26A00",
  alertaFondo: "#FFF3DC",
  error: "#B3261E",
};

const oscuro: typeof claro = {
  fondo: "#0F1419",
  tarjeta: "#1A222B",
  texto: "#EAF0F5",
  textoSuave: "#9AA8B6",
  borde: "#2B3641",
  primario: "#6DB3E8",
  alerta: "#FFC857",
  alertaFondo: "#3A2E12",
  error: "#FF8A80",
};

// Más adelante, el tema elegido por el usuario ("claro" | "oscuro" | "sistema")
// se va a leer desde kv-store. Por ahora sigue al sistema.
export function useColores() {
  return useColorScheme() === "dark" ? oscuro : claro;
}
