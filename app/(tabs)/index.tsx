import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BannerRed } from "../../src/componentes/BannerRed";
import { EstadoPantalla } from "../../src/componentes/EstadoPantalla";
import { useAsync } from "../../src/hooks/useAsync";
import { obtenerAvisosYNotificar } from "../../src/servicios/avisos";
import { useFavoritos } from "../../src/servicios/favoritos";
import { obtenerLineas } from "../../src/servicios/lineas";
import { obtenerParadas } from "../../src/servicios/paradas";
import { useColores } from "../../src/tema";

export default function Inicio() {
  const c = useColores();
  const avisos = useAsync(obtenerAvisosYNotificar);
  const lineas = useAsync(obtenerLineas);
  const paradas = useAsync(obtenerParadas);
  const favLineas = useFavoritos("lineas");
  const favParadas = useFavoritos("paradas");

  // Al volver a esta pantalla, releer los favoritos
  useFocusEffect(
    useCallback(() => {
      favLineas.recargar();
      favParadas.recargar();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const lineasFav = lineas.estado.tipo === "listo" ? lineas.estado.datos.filter((l) => favLineas.ids.includes(l.id)) : [];
  const paradasFav = paradas.estado.tipo === "listo" ? paradas.estado.datos.filter((p) => favParadas.ids.includes(p.id)) : [];

  return (
    <View style={{ flex: 1, backgroundColor: c.fondo }}>
      <BannerRed />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Text style={[estilos.titulo, { color: c.texto }]}>Tus favoritos</Text>
        {lineasFav.length === 0 && paradasFav.length === 0 && (
          <Text style={{ color: c.textoSuave }}>
            Marcá líneas y paradas con la estrella para verlas acá primero.
          </Text>
        )}
        {lineasFav.map((l) => (
          <Pressable
            key={l.id}
            onPress={() => router.push({ pathname: "/linea/[id]", params: { id: l.id } })}
            style={[estilos.fav, { backgroundColor: c.tarjeta, borderColor: c.borde }]}
            accessibilityRole="button"
          >
            <View style={[estilos.numero, { backgroundColor: l.color }]}>
              <Text style={estilos.numeroTexto}>{l.numero}</Text>
            </View>
            <Text style={{ color: c.texto, flex: 1 }}>{l.nombre}</Text>
          </Pressable>
        ))}
        {paradasFav.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => router.push({ pathname: "/parada/[id]", params: { id: p.id } })}
            style={[estilos.fav, { backgroundColor: c.tarjeta, borderColor: c.borde }]}
            accessibilityRole="button"
          >
            <Text style={{ color: c.texto, flex: 1, fontWeight: "600" }}>📍 {p.nombre}</Text>
          </Pressable>
        ))}

        <Text style={[estilos.titulo, { color: c.texto }]}>Avisos de hoy</Text>
        <View style={{ minHeight: 120 }}>
          <EstadoPantalla estado={avisos.estado} mensajeVacio="No hay avisos vigentes." onReintentar={avisos.recargar}>
            {(lista) =>
              lista.map((a) => (
                <Pressable
                  key={a.id}
                  onPress={() => router.push({ pathname: "/aviso/[id]", params: { id: a.id } })}
                  style={[estilos.aviso, { backgroundColor: c.alertaFondo }]}
                  accessibilityRole="button"
                >
                  <Text style={{ color: c.alerta, fontWeight: "700" }}>{a.titulo}</Text>
                  <Text style={{ color: c.texto }}>{a.detalle}</Text>
                </Pressable>
              ))
            }
          </EstadoPantalla>
        </View>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 16, gap: 12 },
  titulo: { fontSize: 20, fontWeight: "700" },
  fav: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, minHeight: 56 },
  numero: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  numeroTexto: { color: "#fff", fontWeight: "800" },
  aviso: { padding: 12, borderRadius: 10, gap: 4, marginBottom: 8 },
});
