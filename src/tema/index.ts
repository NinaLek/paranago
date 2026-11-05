import { useEffect, useState } from "react";
import { Appearance, useColorScheme } from "react-native";
import Storage from "../datos/kv";
import type { Tema } from "../tipos";

const paletaClara = {
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

const paletaOscura: typeof paletaClara = {
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

// Preferencia del usuario ("claro" | "oscuro" | "sistema"), guardada en kv-store
let preferencia: Tema = "sistema";
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((o) => o());

export async function cargarTema(): Promise<void> {
  try {
    const t = await Storage.getItem("tema");
    if (t === "claro" || t === "oscuro" || t === "sistema") {
      preferencia = t;
      avisar();
    }
  } catch {
    // queda "sistema"
  }
}

export async function fijarTema(t: Tema): Promise<void> {
  preferencia = t;
  avisar();
  try {
        Appearance.setColorScheme(
          (t === "sistema" ? "unspecified" : t === "oscuro" ? "dark" : "light") as "light" | "dark",);
  } catch {
    // no todas las plataformas lo soportan
  }
  try {
    await Storage.setItem("tema", t);
  } catch {
    // no pasa nada
  }
}

export function useTemaPreferido(): Tema {
  const [t, setT] = useState<Tema>(preferencia);
  useEffect(() => {
    const o = () => setT(preferencia);
    oyentes.add(o);
    return () => {
      oyentes.delete(o);
    };
  }, []);
  return t;
}

export function useEsOscuro(): boolean {
  const sistema = useColorScheme();
  const pref = useTemaPreferido();
  return pref === "oscuro" || (pref === "sistema" && sistema === "dark");
}

export function useColores() {
  return useEsOscuro() ? paletaOscura : paletaClara;
}
