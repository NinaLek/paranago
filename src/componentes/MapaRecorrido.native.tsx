// Mapa del recorrido con MapLibre (maplibre-react-native) y mapa base de OpenStreetMap.
// No necesita clave de API ni tarjeta: las baldosas son públicas.
import { Camera, GeoJSONSource, Layer, Map } from "@maplibre/maplibre-react-native";
import { StyleSheet, View } from "react-native";
import type { Coordenadas } from "../tipos";
import type { PropsMapa } from "./MapaRecorrido";

// Estilo del mapa: una sola capa raster con las baldosas de OpenStreetMap
const estiloOSM = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      attribution: "© OpenStreetMap",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

// GeoJSON usa [longitud, latitud] (al revés que latitud, longitud)
const aPosicion = (p: Coordenadas): number[] => [p.longitud, p.latitud];

const linea = (puntos: Coordenadas[]) => ({
  type: "Feature",
  properties: {},
  geometry: { type: "LineString", coordinates: puntos.map(aPosicion) },
});

// El tipo exacto de GeoJSON lo valida la librería al dibujar
const comoDatos = (x: object) => x as never;

export function MapaRecorrido({ color, trazado, paradas, trazadoAlternativo }: PropsMapa) {
  const puntos = [...trazado, ...(trazadoAlternativo ?? [])];
  const lons = puntos.map((p) => p.longitud);
  const lats = puntos.map((p) => p.latitud);
  // Encuadre: [oeste, sur, este, norte] con un margen para que no quede pegado al borde
  const bounds: [number, number, number, number] = [
    Math.min(...lons),
    Math.min(...lats),
    Math.max(...lons),
    Math.max(...lats),
  ];

  const paradasGeoJson = {
    type: "FeatureCollection",
    features: paradas.map((p) => ({
      type: "Feature",
      properties: { id: p.id, nombre: p.nombre },
      geometry: { type: "Point", coordinates: aPosicion(p.coordenadas) },
    })),
  };

  return (
    <View style={estilos.mapa}>
      <Map style={estilos.mapa} mapStyle={estiloOSM as never}>
        <Camera initialViewState={{ bounds, padding: { top: 24, right: 24, bottom: 24, left: 24 } }} />

        <GeoJSONSource id="recorrido" data={comoDatos(linea(trazado))} />
        <Layer
          id="recorrido-linea"
          type="line"
          source="recorrido"
          layout={{ "line-cap": "round", "line-join": "round" }}
          paint={{ "line-color": color, "line-width": 5 }}
        />

        {trazadoAlternativo && (
          <>
            <GeoJSONSource id="alternativo" data={comoDatos(linea(trazadoAlternativo))} />
            <Layer
              id="alternativo-linea"
              type="line"
              source="alternativo"
              paint={{ "line-color": "#E67E22", "line-width": 5, "line-dasharray": [2, 1.5] }}
            />
          </>
        )}

        {paradas.length > 0 && (
          <>
            <GeoJSONSource id="paradas" data={comoDatos(paradasGeoJson)} />
            <Layer
              id="paradas-puntos"
              type="circle"
              source="paradas"
              paint={{
                "circle-radius": 6,
                "circle-color": color,
                "circle-stroke-color": "#FFFFFF",
                "circle-stroke-width": 2,
              }}
            />
          </>
        )}
      </Map>
    </View>
  );
}

const estilos = StyleSheet.create({
  mapa: { height: 240, overflow: "hidden" },
});
