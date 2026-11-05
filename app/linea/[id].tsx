import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BannerRed } from "../../src/componentes/BannerRed";
import { EstadoPantalla } from "../../src/componentes/EstadoPantalla";
import { MapaRecorrido } from "../../src/componentes/MapaRecorrido";
import { useAsync } from "../../src/hooks/useAsync";
import { useFavoritos } from "../../src/servicios/favoritos";
import { obtenerAvisosDeLinea } from "../../src/servicios/avisos";
import { obtenerLinea } from "../../src/servicios/lineas";
import { obtenerParadas } from "../../src/servicios/paradas";
import { useColores } from "../../src/tema";
import type { Sentido } from "../../src/tipos";

async function cargar(id: string) {
  const [linea, paradas, avisos] = await Promise.all([
    obtenerLinea(id),
    obtenerParadas(),
    obtenerAvisosDeLinea(id).catch(() => []), // los avisos necesitan red: si fallan, la línea igual se ve
  ]);
  return { linea, paradas, avisos };
}

export default function PantallaLinea() {
  const c = useColores();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sentido, setSentido] = useState<Sentido>("ida");
  const favs = useFavoritos("lineas");
  const { estado, recargar } = useAsync(() => cargar(id), [id]);

  return (
    <View style={{ flex: 1, backgroundColor: c.fondo }}>
      <BannerRed />
      <EstadoPantalla estado={estado} mensajeVacio="No encontramos la línea." onReintentar={recargar}>
        {({ linea, paradas, avisos }) => {
          const recorrido = linea.recorridos.find((r) => r.sentido === sentido);
          const paradasDelRecorrido = (recorrido?.paradaIds ?? [])
            .map((pid) => paradas.find((p) => p.id === pid))
            .filter((p): p is NonNullable<typeof p> => !!p);
          const conTrazado = avisos.find((a) => a.trazadoAlternativo);

          return (
            <ScrollView>
              {/* El aviso se ve arriba, al abrir la línea afectada */}
              {avisos.map((a) => (
                <Pressable
                  key={a.id}
                  onPress={() => router.push({ pathname: "/aviso/[id]", params: { id: a.id } })}
                  style={[estilos.aviso, { backgroundColor: c.alertaFondo }]}
                  accessibilityRole="button"
                >
                  <Text style={{ color: c.alerta, fontWeight: "700" }}>⚠ {a.titulo}</Text>
                  <Text style={{ color: c.texto }}>{a.detalle}</Text>
                  <Text style={{ color: c.alerta }}>Tocá para ver el detalle{a.videoUrl ? " y el video" : ""}</Text>
                </Pressable>
              ))}
              {avisos.length === 0 && (
                <Text style={[estilos.normal, { color: c.textoSuave }]}>Funcionando con normalidad.</Text>
              )}

              <View style={estilos.cabecera}>
                <View style={[estilos.numero, { backgroundColor: linea.color }]}>
                  <Text style={estilos.numeroTexto}>{linea.numero}</Text>
                </View>
                <Text style={{ color: c.texto, fontWeight: "700", flex: 1 }}>{linea.nombre}</Text>
                <Pressable
                  onPress={() => favs.alternar(linea.id)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={favs.esFavorito(linea.id) ? "Quitar de favoritos" : "Marcar como favorita"}
                >
                  <Ionicons name={favs.esFavorito(linea.id) ? "star" : "star-outline"} size={28} color={c.primario} />
                </Pressable>
              </View>

              <View style={estilos.sentidos}>
                {linea.recorridos.map((r) => (
                  <Pressable
                    key={r.sentido}
                    onPress={() => setSentido(r.sentido)}
                    accessibilityRole="button"
                    style={[
                      estilos.sentido,
                      { borderColor: c.primario, backgroundColor: sentido === r.sentido ? c.primario : c.tarjeta },
                    ]}
                  >
                    <Text style={{ color: sentido === r.sentido ? "#fff" : c.texto, fontWeight: "600" }}>
                      {r.destino}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {recorrido && (
                <MapaRecorrido
                  key={sentido}
                  color={linea.color}
                  trazado={recorrido.trazado}
                  paradas={paradasDelRecorrido}
                  trazadoAlternativo={conTrazado?.trazadoAlternativo ?? null}
                  alTocarParada={(pid) => router.push({ pathname: "/parada/[id]", params: { id: pid } })}
                />
              )}

              <Text style={[estilos.subtitulo, { color: c.texto }]}>Paradas ({recorrido?.destino})</Text>
              {paradasDelRecorrido.length === 0 && (
                <Text style={[estilos.normal, { color: c.textoSuave }]}>
                  Este sentido todavía no tiene paradas cargadas.
                </Text>
              )}
              {paradasDelRecorrido.map((p, i) => (
                <Pressable
                  key={p.id}
                  onPress={() => router.push({ pathname: "/parada/[id]", params: { id: p.id } })}
                  style={[estilos.fila, { borderColor: c.borde }]}
                  accessibilityRole="button"
                >
                  <Text style={{ color: c.textoSuave, width: 28 }}>{i + 1}</Text>
                  <Text style={{ color: c.texto, flex: 1 }}>{p.nombre}</Text>
                </Pressable>
              ))}
            </ScrollView>
          );
        }}
      </EstadoPantalla>
    </View>
  );
}

const estilos = StyleSheet.create({
  aviso: { padding: 12, gap: 4 },
  normal: { padding: 16 },
  cabecera: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  numero: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  numeroTexto: { color: "#fff", fontWeight: "800", fontSize: 18 },
  sentidos: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  sentido: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 10, alignItems: "center", minHeight: 44, justifyContent: "center" },
  subtitulo: { fontSize: 16, fontWeight: "700", padding: 16, paddingBottom: 8 },
  fila: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, minHeight: 48 },
});
