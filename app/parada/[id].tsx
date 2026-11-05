import Ionicons from "@react-native-vector-icons/ionicons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BannerRed } from "../../src/componentes/BannerRed";
import { EstadoPantalla } from "../../src/componentes/EstadoPantalla";
import { useAsync } from "../../src/hooks/useAsync";
import { FlechaParada } from "../../src/componentes/FlechaParada";
import { useSesion } from "../../src/sesion/SesionContext";
import { obtenerFeriados } from "../../src/servicios/feriados";
import { useFavoritos } from "../../src/servicios/favoritos";
import { confirmarReporte, etiquetaMotivo, obtenerConfirmados, obtenerReportesDeParada } from "../../src/servicios/reportes";
import type { ReporteDeDemora } from "../../src/tipos";
import { haceCuanto } from "../../src/utils/tiempo";
import { obtenerHorariosDeParada } from "../../src/servicios/horarios";
import { obtenerLineas } from "../../src/servicios/lineas";
import { programarRecordatorio, type ResultadoRecordatorio } from "../../src/servicios/notificaciones";
import { obtenerParada } from "../../src/servicios/paradas";
import { useColores } from "../../src/tema";
import { diaSiguiente, proximosHorarios, tipoDeDia } from "../../src/utils/horarios";

const MINUTOS_ANTES = 10;

const textoResultado: Record<ResultadoRecordatorio, string> = {
  ok: `Listo, te avisamos ${MINUTOS_ANTES} minutos antes.`,
  sin_permiso: "Para avisarte necesitamos permiso de notificaciones (activalo en los ajustes del teléfono).",
  ya_paso: `Falta menos de ${MINUTOS_ANTES} minutos: ya no llegamos a avisarte antes.`,
  no_disponible: "Los recordatorios funcionan en el celular, no en la web.",
};

async function cargar(id: string) {
  const ahora = new Date();
  const parada = await obtenerParada(id);
  const lineas = await obtenerLineas();
  const feriados = await obtenerFeriados();
  const hoy = await obtenerHorariosDeParada(id, tipoDeDia(ahora, feriados));
  const manana = await obtenerHorariosDeParada(id, tipoDeDia(diaSiguiente(ahora), feriados));
  return { parada, lineas: lineas.filter((l) => parada.lineaIds.includes(l.id)), hoy, manana, ahora };
}

export default function PantallaParada() {
  const c = useColores();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { estado, recargar } = useAsync(() => cargar(id), [id]);
  const favs = useFavoritos("paradas");
  const { usuario } = useSesion();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [reportes, setReportes] = useState<ReporteDeDemora[]>([]);
  const [confirmados, setConfirmados] = useState<string[]>([]);

  // Cada vez que la pantalla se muestra (por ejemplo al volver de reportar) se releen los reportes
  const cargarReportes = useCallback(async () => {
    try {
      setReportes(await obtenerReportesDeParada(id));
      setConfirmados(await obtenerConfirmados());
    } catch {
      // los reportes necesitan red: si falla, la parada igual se ve
    }
  }, [id]);
  useFocusEffect(
    useCallback(() => {
      cargarReportes();
    }, [cargarReportes])
  );

  async function confirmar(reporteId: string) {
    try {
      await confirmarReporte(reporteId);
      setMensaje(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); // vibración al confirmar
    } catch (e) {
      // la API trae el mensaje listo para mostrar (ej.: "Tenés que ingresar con tu cuenta.")
      setMensaje(e instanceof Error ? e.message : "No pudimos confirmar el reporte.");
    }
    cargarReportes();
  }

  async function recordar(numeroLinea: string, nombreParada: string, hora: string) {
    const r = await programarRecordatorio({
      titulo: `Línea ${numeroLinea} pasa pronto`,
      cuerpo: `${nombreParada}: según la tabla, pasa a las ${hora}.`,
      hora,
      minutosAntes: MINUTOS_ANTES,
    });
    setMensaje(textoResultado[r]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.fondo }}>
      <BannerRed />
      <EstadoPantalla estado={estado} mensajeVacio="No encontramos la parada." onReintentar={recargar}>
        {({ parada, lineas, hoy, manana, ahora }) => (
          <ScrollView contentContainerStyle={estilos.contenido}>
            <View style={estilos.encabezado}>
              <View style={{ flex: 1 }}>
                <Text style={[estilos.titulo, { color: c.texto }]}>{parada.nombre}</Text>
                <Text style={{ color: c.textoSuave }}>
                  Sentido {parada.sentido}
                  {parada.refugio ? " · con refugio" : ""}
                </Text>
              </View>
              <Pressable
                onPress={() => favs.alternar(parada.id)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={favs.esFavorito(parada.id) ? "Quitar de favoritos" : "Marcar como favorita"}
              >
                <Ionicons name={favs.esFavorito(parada.id) ? "star" : "star-outline"} size={30} color={c.primario} />
              </Pressable>
            </View>

            <Pressable
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps/dir/?api=1&destination=${parada.coordenadas.latitud},${parada.coordenadas.longitud}&travelmode=walking`
                )
              }
              style={[estilos.boton, { backgroundColor: c.primario }]}
              accessibilityRole="button"
            >
              <Text style={estilos.botonTexto}>Cómo llegar caminando</Text>
            </Pressable>

            <FlechaParada destino={parada.coordenadas} />

            {lineas.map((l) => {
              const r = proximosHorarios(
                hoy.filter((h) => h.lineaId === l.id),
                manana.filter((h) => h.lineaId === l.id),
                ahora
              );
              return (
                <View key={l.id} style={[estilos.tarjeta, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
                  <View style={estilos.cabecera}>
                    <View style={[estilos.numero, { backgroundColor: l.color }]}>
                      <Text style={estilos.numeroTexto}>{l.numero}</Text>
                    </View>
                    <Text style={{ color: c.texto, fontWeight: "700", flex: 1 }}>{l.nombre}</Text>
                  </View>
                  {r.proximos.map((p) => (
                    <View key={p.hora} style={estilos.horario}>
                      <Text style={{ color: c.texto, fontSize: 16, flex: 1 }}>
                        {p.hora} <Text style={{ color: c.textoSuave }}>(en {p.enMinutos} min, según la tabla)</Text>
                      </Text>
                      <Pressable
                        onPress={() => recordar(l.numero, parada.nombre, p.hora)}
                        style={[estilos.recordar, { borderColor: c.primario }]}
                        accessibilityRole="button"
                        accessibilityLabel={`Avisarme ${MINUTOS_ANTES} minutos antes del de las ${p.hora}`}
                      >
                        <Ionicons name="notifications-outline" size={18} color={c.primario} />
                        <Text style={{ color: c.primario, fontWeight: "600" }}>Avisarme</Text>
                      </Pressable>
                    </View>
                  ))}
                  {r.mensaje && <Text style={{ color: c.alerta }}>{r.mensaje}</Text>}
                </View>
              );
            })}

            <Text style={[estilos.subtitulo, { color: c.texto }]}>Reportes de pasajeros</Text>
            {reportes.length === 0 && (
              <Text style={{ color: c.textoSuave }}>Nadie reportó demoras en esta parada.</Text>
            )}
            {reportes.map((r) => {
              const linea = lineas.find((l) => l.id === r.lineaId);
              const propio = r.id.startsWith("rep-local") || r.usuarioId === usuario?.id;
              return (
                <View key={r.id} style={[estilos.tarjeta, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
                  <Text style={{ color: c.texto, fontWeight: "700" }}>
                    Línea {linea?.numero ?? "?"}: {etiquetaMotivo[r.motivo]}
                  </Text>
                  {r.comentario && <Text style={{ color: c.texto }}>{r.comentario}</Text>}
                  {r.fotoUri && <Image source={{ uri: r.fotoUri }} style={estilos.fotoReporte} />}
                  <Text style={{ color: c.textoSuave }}>
                    {haceCuanto(r.fechaHora)} · {r.confirmaciones}{" "}
                    {r.confirmaciones === 1 ? "confirmación" : "confirmaciones"}
                    {!r.sincronizado ? " · pendiente de enviar" : ""}
                  </Text>
                  {!propio && (
                    <Pressable
                      onPress={() => confirmar(r.id)}
                      disabled={confirmados.includes(r.id)}
                      accessibilityRole="button"
                      style={[estilos.recordar, { borderColor: c.primario, opacity: confirmados.includes(r.id) ? 0.5 : 1 }]}
                    >
                      <Text style={{ color: c.primario, fontWeight: "600" }}>
                        {confirmados.includes(r.id) ? "Ya lo confirmaste" : "Confirmar: a mí también me pasó"}
                      </Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
            <Pressable
              onPress={() => router.push({ pathname: "/reportar/[paradaId]", params: { paradaId: parada.id } })}
              accessibilityRole="button"
              style={[estilos.boton, { backgroundColor: c.alerta }]}
            >
              <Text style={[estilos.botonTexto, { color: "#000" }]}>Reportar una demora</Text>
            </Pressable>

            {mensaje && <Text style={{ color: c.texto }}>{mensaje}</Text>}
            <Text style={{ color: c.textoSuave, fontSize: 12 }}>
              Los horarios son los de la tabla, no la posición real del colectivo.
            </Text>
          </ScrollView>
        )}
      </EstadoPantalla>
    </View>
  );
}

const estilos = StyleSheet.create({
  subtitulo: { fontSize: 16, fontWeight: "700", marginTop: 4 },
  fotoReporte: { width: "100%", height: 160, borderRadius: 8 },
  contenido: { padding: 16, gap: 12 },
  encabezado: { flexDirection: "row", alignItems: "center", gap: 12 },
  titulo: { fontSize: 22, fontWeight: "800" },
  boton: { padding: 14, borderRadius: 10, alignItems: "center", minHeight: 48, justifyContent: "center" },
  botonTexto: { color: "#fff", fontWeight: "700", fontSize: 16 },
  tarjeta: { padding: 12, borderRadius: 12, borderWidth: 1, gap: 8 },
  cabecera: { flexDirection: "row", alignItems: "center", gap: 10 },
  numero: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  numeroTexto: { color: "#fff", fontWeight: "800" },
  horario: { flexDirection: "row", alignItems: "center", gap: 8 },
  recordar: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, minHeight: 40 },
});
