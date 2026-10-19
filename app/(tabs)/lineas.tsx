import { FlatList, StyleSheet, Text, View } from "react-native";
import { EstadoPantalla } from "../../src/componentes/EstadoPantalla";
import { useAsync } from "../../src/hooks/useAsync";
import { obtenerLineas } from "../../src/servicios/lineas";
import { useColores } from "../../src/tema";

export default function Lineas() {
  const c = useColores();
  const { estado, recargar } = useAsync(obtenerLineas);

  return (
    <View style={{ flex: 1, backgroundColor: c.fondo }}>
      <EstadoPantalla estado={estado} mensajeVacio="No hay líneas para mostrar." onReintentar={recargar}>
        {(lineas) => (
          <FlatList
            data={lineas}
            keyExtractor={(l) => l.id}
            contentContainerStyle={estilos.lista}
            renderItem={({ item }) => (
              <View style={[estilos.tarjeta, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
                <View style={[estilos.numero, { backgroundColor: item.color }]}>
                  <Text style={estilos.numeroTexto}>{item.numero}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.texto, fontWeight: "700" }}>{item.nombre}</Text>
                  <Text style={{ color: c.textoSuave }}>{item.empresa}</Text>
                </View>
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
  tarjeta: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  numero: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  numeroTexto: { color: "#fff", fontWeight: "800", fontSize: 18 },
});
