import { ScrollView, StyleSheet, Text, View } from "react-native";
import { EstadoPantalla } from "../../src/componentes/EstadoPantalla";
import { useAsync } from "../../src/hooks/useAsync";
import { obtenerAvisos } from "../../src/servicios/avisos";
import { useColores } from "../../src/tema";

// Pantalla de inicio (esqueleto). Después: favoritos, paradas cercanas y mapa.
export default function Inicio() {
  const c = useColores();
  const { estado, recargar } = useAsync(obtenerAvisos);

  return (
    <ScrollView style={{ backgroundColor: c.fondo }} contentContainerStyle={estilos.contenido}>
      <Text style={[estilos.titulo, { color: c.texto }]}>Avisos de hoy</Text>
      <View style={{ minHeight: 120 }}>
        <EstadoPantalla estado={estado} mensajeVacio="No hay avisos vigentes." onReintentar={recargar}>
          {(avisos) =>
            avisos.map((a) => (
              <View key={a.id} style={[estilos.aviso, { backgroundColor: c.alertaFondo }]}>
                <Text style={{ color: c.alerta, fontWeight: "700" }}>{a.titulo}</Text>
                <Text style={{ color: c.texto }}>{a.detalle}</Text>
              </View>
            ))
          }
        </EstadoPantalla>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 16, gap: 12 },
  titulo: { fontSize: 20, fontWeight: "700" },
  aviso: { padding: 12, borderRadius: 10, gap: 4, marginBottom: 8 },
});
