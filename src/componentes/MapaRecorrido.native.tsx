import { StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import type { PropsMapa } from "./MapaRecorrido";

export function MapaRecorrido({ color, trazado, paradas, trazadoAlternativo, alTocarParada }: PropsMapa) {
  const puntos = [...trazado, ...(trazadoAlternativo ?? [])];
  const lat = puntos.map((p) => p.latitud);
  const lon = puntos.map((p) => p.longitud);
  const region = {
    latitude: (Math.min(...lat) + Math.max(...lat)) / 2,
    longitude: (Math.min(...lon) + Math.max(...lon)) / 2,
    latitudeDelta: Math.max((Math.max(...lat) - Math.min(...lat)) * 1.6, 0.01),
    longitudeDelta: Math.max((Math.max(...lon) - Math.min(...lon)) * 1.6, 0.01),
  };

  return (
    <MapView style={estilos.mapa} initialRegion={region}>
      <Polyline
        coordinates={trazado.map((p) => ({ latitude: p.latitud, longitude: p.longitud }))}
        strokeColor={color}
        strokeWidth={5}
      />
      {trazadoAlternativo && (
        <Polyline
          coordinates={trazadoAlternativo.map((p) => ({ latitude: p.latitud, longitude: p.longitud }))}
          strokeColor="#E67E22"
          strokeWidth={5}
          lineDashPattern={[10, 8]}
        />
      )}
      {paradas.map((p) => (
        <Marker
          key={p.id}
          coordinate={{ latitude: p.coordenadas.latitud, longitude: p.coordenadas.longitud }}
          title={p.nombre}
          onCalloutPress={() => alTocarParada?.(p.id)}
        />
      ))}
    </MapView>
  );
}

const estilos = StyleSheet.create({
  mapa: { height: 240 },
});
