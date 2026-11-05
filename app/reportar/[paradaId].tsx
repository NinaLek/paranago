import { CameraView, useCameraPermissions } from "expo-camera";
import { Directory, File, Paths } from "expo-file-system";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { EstadoPantalla } from "../../src/componentes/EstadoPantalla";
import { useAsync } from "../../src/hooks/useAsync";
import { obtenerLineas } from "../../src/servicios/lineas";
import { obtenerParada } from "../../src/servicios/paradas";
import { crearReporte, etiquetaMotivo } from "../../src/servicios/reportes";
import { useSesion } from "../../src/sesion/SesionContext";
import { useColores } from "../../src/tema";
import type { MotivoDemora } from "../../src/tipos";

const MOTIVOS = Object.keys(etiquetaMotivo) as MotivoDemora[];

/** Copia la foto a la carpeta de documentos de la app (API nueva de expo-file-system). */
function persistirFoto(uri: string): string {
  try {
    const dir = new Directory(Paths.document, "fotos");
    if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
    const destino = new File(dir, `foto-${Date.now()}.jpg`);
    new File(uri).copy(destino);
    return destino.uri;
  } catch {
    return uri; // si no se puede copiar, usamos la foto original
  }
}

async function cargar(paradaId: string) {
  const parada = await obtenerParada(paradaId);
  const lineas = (await obtenerLineas()).filter((l) => parada.lineaIds.includes(l.id));
  return { parada, lineas };
}

export default function Reportar() {
  const c = useColores();
  const { paradaId } = useLocalSearchParams<{ paradaId: string }>();
  const { usuario } = useSesion();
  const { estado, recargar } = useAsync(() => cargar(paradaId), [paradaId]);

  const [lineaId, setLineaId] = useState<string | null>(null);
  const [motivo, setMotivo] = useState<MotivoDemora | null>(null);
  const [comentario, setComentario] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [camara, setCamara] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permiso, pedirPermiso] = useCameraPermissions();
  const camRef = useRef<CameraView>(null);

  if (!usuario) {
    return (
      <View style={[estilos.centro, { backgroundColor: c.fondo }]}>
        <Text style={{ color: c.texto, fontSize: 16, textAlign: "center" }}>
          Para reportar una demora necesitás ingresar a tu cuenta.
        </Text>
        <Pressable onPress={() => router.replace("/ingresar")} style={[estilos.boton, { backgroundColor: c.primario }]} accessibilityRole="button">
          <Text style={estilos.botonTexto}>Ingresar</Text>
        </Pressable>
        <Pressable onPress={() => router.replace("/registro")} accessibilityRole="button">
          <Text style={{ color: c.primario, padding: 8 }}>Crear cuenta</Text>
        </Pressable>
      </View>
    );
  }

  async function abrirCamara() {
    setError(null);
    if (!permiso?.granted) {
      const p = await pedirPermiso();
      if (!p.granted) {
        setError("Sin permiso de cámara. Podés adjuntar una foto de la galería.");
        return;
      }
    }
    setCamara(true);
  }

  async function tomarFoto() {
    try {
      const f = await camRef.current?.takePictureAsync({ quality: 0.6 });
      if (f) setFotoUri(persistirFoto(f.uri));
    } catch {
      setError("No pudimos sacar la foto.");
    }
    setCamara(false);
  }

  async function elegirGaleria() {
    setError(null);
    try {
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.6 });
      if (!r.canceled && r.assets[0]) setFotoUri(persistirFoto(r.assets[0].uri));
    } catch {
      setError("No pudimos abrir la galería.");
    }
  }

  async function enviar() {
    if (!usuario || !lineaId || !motivo) return;
    setEnviando(true);
    setError(null);
    try {
      await crearReporte({
        lineaId,
        paradaId,
        usuarioId: usuario.id,
        motivo,
        comentario: comentario.trim() || null,
        fotoUri,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); // vibración al confirmar
      router.back();
    } catch {
      setError("No pudimos guardar el reporte. Probá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const listo = !!lineaId && !!motivo;

  return (
    <View style={{ flex: 1, backgroundColor: c.fondo }}>
      <EstadoPantalla estado={estado} mensajeVacio="No encontramos la parada." onReintentar={recargar}>
        {({ parada, lineas }) => (
          <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
            <Text style={[estilos.titulo, { color: c.texto }]}>Reportar una demora</Text>
            <Text style={{ color: c.textoSuave }}>En la parada {parada.nombre}</Text>

            <Text style={[estilos.subtitulo, { color: c.texto }]}>¿Qué línea?</Text>
            <View style={estilos.fila}>
              {lineas.map((l) => (
                <Pressable
                  key={l.id}
                  onPress={() => setLineaId(l.id)}
                  accessibilityRole="button"
                  style={[estilos.chip, { borderColor: l.color, backgroundColor: lineaId === l.id ? l.color : c.tarjeta }]}
                >
                  <Text style={{ color: lineaId === l.id ? "#fff" : c.texto, fontWeight: "700" }}>Línea {l.numero}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[estilos.subtitulo, { color: c.texto }]}>¿Qué pasó?</Text>
            <View style={estilos.fila}>
              {MOTIVOS.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMotivo(m)}
                  accessibilityRole="button"
                  style={[estilos.chip, { borderColor: c.primario, backgroundColor: motivo === m ? c.primario : c.tarjeta }]}
                >
                  <Text style={{ color: motivo === m ? "#fff" : c.texto }}>{etiquetaMotivo[m]}</Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              value={comentario}
              onChangeText={setComentario}
              placeholder="Comentario (opcional)"
              placeholderTextColor={c.textoSuave}
              multiline
              style={[estilos.input, { backgroundColor: c.tarjeta, color: c.texto, borderColor: c.borde }]}
            />

            <Text style={[estilos.subtitulo, { color: c.texto }]}>Foto (opcional)</Text>
            {fotoUri && <Image source={{ uri: fotoUri }} style={estilos.foto} />}
            <View style={estilos.fila}>
              <Pressable onPress={abrirCamara} style={[estilos.botonChico, { borderColor: c.primario }]} accessibilityRole="button">
                <Text style={{ color: c.primario, fontWeight: "600" }}>Sacar foto</Text>
              </Pressable>
              <Pressable onPress={elegirGaleria} style={[estilos.botonChico, { borderColor: c.primario }]} accessibilityRole="button">
                <Text style={{ color: c.primario, fontWeight: "600" }}>Elegir de la galería</Text>
              </Pressable>
              {fotoUri && (
                <Pressable onPress={() => setFotoUri(null)} accessibilityRole="button" style={estilos.botonChico}>
                  <Text style={{ color: c.error }}>Quitar</Text>
                </Pressable>
              )}
            </View>

            {error && <Text style={{ color: c.error }}>{error}</Text>}
            <Text style={{ color: c.textoSuave, fontSize: 12 }}>
              Si no hay conexión, el reporte se guarda en tu teléfono y se envía solo cuando vuelva la red.
            </Text>

            <Pressable
              onPress={enviar}
              disabled={!listo || enviando}
              style={[estilos.boton, { backgroundColor: c.primario, opacity: !listo || enviando ? 0.5 : 1 }]}
              accessibilityRole="button"
            >
              <Text style={estilos.botonTexto}>{enviando ? "Enviando…" : "Enviar reporte"}</Text>
            </Pressable>
          </ScrollView>
        )}
      </EstadoPantalla>

      <Modal visible={camara} animationType="slide" onRequestClose={() => setCamara(false)}>
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <CameraView ref={camRef} style={{ flex: 1 }} facing="back" />
          <View style={estilos.camBotones}>
            <Pressable onPress={() => setCamara(false)} style={estilos.camBoton} accessibilityRole="button">
              <Text style={{ color: "#fff", fontSize: 16 }}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={tomarFoto} style={[estilos.camBoton, { backgroundColor: "#fff" }]} accessibilityRole="button">
              <Text style={{ color: "#000", fontSize: 16, fontWeight: "700" }}>Sacar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 14 },
  contenido: { padding: 16, gap: 12 },
  titulo: { fontSize: 24, fontWeight: "800" },
  subtitulo: { fontSize: 16, fontWeight: "700", marginTop: 4 },
  fila: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, minHeight: 44, justifyContent: "center" },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16, minHeight: 80, textAlignVertical: "top" },
  foto: { width: "100%", height: 200, borderRadius: 10 },
  boton: { padding: 14, borderRadius: 10, alignItems: "center", minHeight: 48, justifyContent: "center" },
  botonTexto: { color: "#fff", fontWeight: "700", fontSize: 16 },
  botonChico: { borderWidth: 1, borderColor: "transparent", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, minHeight: 44, justifyContent: "center" },
  camBotones: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-around", padding: 24, backgroundColor: "rgba(0,0,0,0.5)" },
  camBoton: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 30, minHeight: 48, justifyContent: "center" },
});
