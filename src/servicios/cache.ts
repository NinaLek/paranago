import { useEffect, useState } from "react";
import { guardarCache, leerCache } from "../datos/db";

// Guarda "desde cuándo" son viejos los datos que se están mostrando (null = datos frescos)
let viejoDesde: string | null = null;
const oyentes = new Set<() => void>();
function fijarViejo(valor: string | null) {
  viejoDesde = valor;
  oyentes.forEach((o) => o());
}

export function useDatosViejos(): string | null {
  const [valor, setValor] = useState(viejoDesde);
  useEffect(() => {
    const o = () => setValor(viejoDesde);
    oyentes.add(o);
    return () => {
      oyentes.delete(o);
    };
  }, []);
  return valor;
}

/** Intenta cargar de la red; si falla, usa lo último guardado en el teléfono. */
export async function conCache<T>(
  clave: string,
  cargar: () => Promise<T>,
  opciones?: { ttlMs?: number }
): Promise<T> {
  // Si lo guardado es reciente (datos que casi no cambian, como los horarios), se usa directo
  if (opciones?.ttlMs) {
    const guardado = await leerCache<T>(clave);
    if (guardado && Date.now() - new Date(guardado.guardadoEn).getTime() < opciones.ttlMs) {
      return guardado.datos;
    }
  }
  try {
    const datos = await cargar();
    await guardarCache(clave, datos);
    fijarViejo(null);
    return datos;
  } catch (e) {
    const guardado = await leerCache<T>(clave);
    if (guardado) {
      fijarViejo(guardado.guardadoEn);
      return guardado.datos;
    }
    throw e;
  }
}
