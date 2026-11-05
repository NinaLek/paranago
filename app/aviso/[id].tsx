import { useLocalSearchParams } from "expo-router";
import { Directory, File, Paths } from "expo-file-system";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BannerRed } from "../../src/componentes/BannerRed";
import { EstadoPantalla } from "../../src/componentes/EstadoPantalla";
import { MapaRecorrido } from "../../src/componentes/MapaRecorrido";
import { useAsync } from "../../src/hooks/useAsync";
import { obtenerAviso } from "../../src/servicios/avisos";
import { useColores } from "../../src/tema";

const carpetaVideos = () => new Directory(Paths.document, "videos");
const archivoVideo = (id: string) => new File(carpetaVideos(), `${id}.mp4`);

function VideoAviso({ id, url }: { id: string; url: string }) {
  const c = useColores();
  const [uriLocal, setUriLocal] = useState<string | null>(null);
  const [bajando, setBajando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Si el video ya está guardado en el teléfono, se reproduce desde ahí (sin datos)
  useEffect(() => {
    if (Platform.OS === "web") return;
    try {
      const f = archivoVideo(id);
      if (f.exists) setUriLocal(f.uri);
    } catch {
      // sin archivo guardado
    }
  }, [id]);

  const player = useVideoPlayer(uriLocal ?? url, (p) => {
    p.loop = false;
  });

  async function guardar() {
    setBajando(true);
    setMensaje(null);
    try {
      const dir = carpetaVideos();
      if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
      const destino = archivoVideo(id);
      if (destino.exists) destino.delete();
      const f = await File.downloadFileAsync(url, destino);
      setUriLocal(f.uri);
      setMensaje("Video guardado: ya podés verlo sin conexión.");
    } catch {
      setMensaje("No pudimos descargar el video. Revisá tu conexión.");
    } finally {
      setBajando(false);
    }
  }

  return (
    <View style={{ gap: 8 }}>
      <VideoView player={player} style={estilos.video} nativeControls allowsFullscreen />
      {Platform.OS !== "web" &&
        (uriLocal ? (
          <Text style={{ color: c.textoSuave }}>▶ Reproduciendo la copia guardada en tu teléfono.</Text>
        ) : (
          <Pressable
            onPress={guardar}
            disabled={bajando}
            style={[estilos.boton, { backgroundColor: c.primario, opacity: bajando ? 0.6 : 1 }]}
            accessibilityRole="button"
          >
            <Text style={estilos.botonTexto}>{bajando ? "Guardando…" : "Guardar video para ver sin datos"}</Text>
          </Pressable>
        ))}
      {mensaje && <Text style={{ color: c.textoSuave }}>{mensaje}</Text>}
    </View>
  );
}

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function PantallaAviso() {
  const c = useColores();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { estado, recargar } = useAsync(() => obtenerAviso(id), [id]);

  return (
    <View style={{ flex: 1, backgroundColor: c.fondo }}>
      <BannerRed />
      <EstadoPantalla estado={estado} mensajeVacio="No encontramos el aviso." onReintentar={recargar}>
        {(a) => (
          <ScrollView contentContainerStyle={estilos.contenido}>
            <Text style={{ color: c.alerta, fontWeight: "700" }}>{a.gravedad.toUpperCase()}</Text>
            <Text style={[estilos.titulo, { color: c.texto }]}>{a.titulo}</Text>
            <Text style={{ color: c.texto, fontSize: 16 }}>{a.detalle}</Text>
            <Text style={{ color: c.textoSuave }}>
              Desde el {fecha(a.desde)} {a.hasta ? `hasta el ${fecha(a.hasta)}` : "(sin fecha de fin prevista)"}
            </Text>

            {a.videoUrl ? (
              <VideoAviso id={a.id} url={a.videoUrl} />
            ) : (
              <Text style={{ color: c.textoSuave }}>Este aviso no tiene video.</Text>
            )}

            {a.trazadoAlternativo && a.trazadoAlternativo.length > 0 && (
              <>
                <Text style={[estilos.subtitulo, { color: c.texto }]}>Por dónde pasa ahora</Text>
                <MapaRecorrido color="#E67E22" trazado={a.trazadoAlternativo} paradas={[]} trazadoAlternativo={null} />
              </>
            )}
          </ScrollView>
        )}
      </EstadoPantalla>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 16, gap: 12 },
  titulo: { fontSize: 22, fontWeight: "800" },
  subtitulo: { fontSize: 16, fontWeight: "700" },
  video: { width: "100%", height: 220, backgroundColor: "#000", borderRadius: 10 },
  boton: { padding: 14, borderRadius: 10, alignItems: "center", minHeight: 48, justifyContent: "center" },
  botonTexto: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
