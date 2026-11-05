import * as Location from "expo-location";
import { useEffect, useState } from "react";
import type { Coordenadas } from "../tipos";

export type EstadoUbicacion = "pidiendo" | "concedida" | "denegada";

/** Pide permiso de ubicación. Si se niega, la app sigue siendo usable (búsqueda por nombre). */
export function useUbicacion() {
  const [estado, setEstado] = useState<EstadoUbicacion>("pidiendo");
  const [coords, setCoords] = useState<Coordenadas | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!activo) return;
        if (status !== "granted") {
          setEstado("denegada");
          return;
        }
        setEstado("concedida");
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (activo) setCoords({ latitud: pos.coords.latitude, longitud: pos.coords.longitude });
      } catch {
        if (activo) setEstado("denegada");
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  return { estado, coords };
}
