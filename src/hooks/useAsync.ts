import { useCallback, useEffect, useState } from "react";

export type Estado<T> =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "vacio" }
  | { tipo: "listo"; datos: T };

/** Ejecuta un servicio asíncrono y devuelve su estado (carga / error / vacío / listo). */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [estado, setEstado] = useState<Estado<T>>({ tipo: "cargando" });

  const cargar = useCallback(async () => {
    setEstado({ tipo: "cargando" });
    try {
      const datos = await fn();
      const vacio = Array.isArray(datos) && datos.length === 0;
      setEstado(vacio ? { tipo: "vacio" } : { tipo: "listo", datos });
    } catch (e) {
      setEstado({
        tipo: "error",
        mensaje: e instanceof Error ? e.message : "Ocurrió un error inesperado.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { estado, recargar: cargar };
}
