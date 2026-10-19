import { FlatList, StyleSheet, Text, View } from "react-native";
import { EstadoPantalla } from "../../src/componentes/EstadoPantalla";
import { useAsync } from "../../src/hooks/useAsync";
import { obtenerAvisos } from "../../src/servicios/avisos";
import { useColores } from "../../src/tema";

export default function Avisos() {
  const c = useColores();
  const { estado, recargar } = useAsync(obtenerAvisos);

  return (
    <View style={{ flex: 1, backgroundColor: c.fondo }}>
      <EstadoPantalla estado={estado} mensajeVacio="No hay avisos vigentes." onReintentar={recargar}>
        {(avisos) => (
          <FlatList
            data={avisos}
            keyExtractor={(a) => a.id}
            contentContainerStyle={estilos.lista}
            renderItem={({ item }) => (
              <View style={[estilos.tarjeta, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
                <Text style={{ color: c.texto, fontWeight: "700" }}>{item.titulo}</Text>
                <Text style={{ color: c.textoSuave }}>{item.detalle}</Text>
                <Text style={{ color: c.alerta }}>
                  {item.gravedad.toUpperCase()}
                  {item.videoUrl ? " · con video" : ""}
                </Text>
              </View>
            )}
          />
        )}
      </EstadoPantalla>
    </View>
  );
}

const estilos = StyleSheet.create({
  lista: { padding: 16, gap: 10 },
  tarjeta: { padding: 12, borderRadius: 12, borderWidth: 1, gap: 4 },
});
