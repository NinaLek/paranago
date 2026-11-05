import Ionicons from "@react-native-vector-icons/ionicons";
import { Magnetometer } from "expo-sensors";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useUbicacion } from "../hooks/useUbicacion";
import { useColores } from "../tema";
import type { Coordenadas } from "../tipos";
import { distanciaMetros, textoDistancia } from "../utils/geo";
import { rumboHacia } from "../utils/rumbo";

/** Flecha que apunta hacia la parada usando el magnetómetro (brújula) y la ubicación. */
export function FlechaParada({ destino }: { destino: Coordenadas }) {
  const c = useColores();
  const { estado, coords } = useUbicacion();
  const [orientacion, setOrientacion] = useState<number | null>(null); // hacia dónde apunta el teléfono
  const [hayBrujula, setHayBrujula] = useState(true);

  useEffect(() => {
    let activo = true;
    let suscripcion: { remove: () => void } | null = null;
    (async () => {
      try {
        if (!(await Magnetometer.isAvailableAsync())) {
          if (activo) setHayBrujula(false);
          return;
        }
        Magnetometer.setUpdateInterval(250);
        suscripcion = Magnetometer.addListener(({ x, y }) => {
          // Con el teléfono horizontal, el ángulo del campo magnético da el rumbo del borde superior
          let grados = (Math.atan2(y, x) * 180) / Math.PI - 90;
          if (grados < 0) grados += 360;
          if (activo) setOrientacion(grados);
        });
      } catch {
        if (activo) setHayBrujula(false);
      }
    })();
    return () => {
      activo = false;
      suscripcion?.remove();
    };
  }, []);

  let contenido: React.ReactNode;
  if (!hayBrujula) {
    contenido = <Text style={{ color: c.textoSuave }}>Tu teléfono no tiene brújula.</Text>;
  } else if (estado === "denegada") {
    contenido = (
      <Text style={{ color: c.textoSuave }}>Activá la ubicación para ver hacia dónde queda la parada.</Text>
    );
  } else if (!coords || orientacion === null) {
    contenido = <Text style={{ color: c.textoSuave }}>Buscando tu ubicación y la brújula…</Text>;
  } else {
    const giro = (rumboHacia(coords, destino) - orientacion + 360) % 360;
    contenido = (
      <>
        <View style={{ transform: [{ rotate: `${giro}deg` }] }}>
          <Ionicons name="arrow-up-circle" size={64} color={c.primario} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.texto, fontWeight: "700" }}>
            La parada queda {textoDistancia(distanciaMetros(coords, destino))}
          </Text>
          <Text style={{ color: c.textoSuave }}>Seguí la flecha con el teléfono en horizontal.</Text>
        </View>
      </>
    );
  }

  return <View style={[estilos.caja, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>{contenido}</View>;
}

const estilos = StyleSheet.create({
  caja: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, minHeight: 80 },
});
