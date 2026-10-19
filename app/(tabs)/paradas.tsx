import { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { EstadoPantalla } from "../../src/componentes/EstadoPantalla";
import { useAsync } from "../../src/hooks/useAsync";
import { buscarParadas } from "../../src/servicios/paradas";
import { useColores } from "../../src/tema";

export default function Paradas() {
  const c = useColores();
  const [texto, setTexto] = useState("");
  const { estado, recargar } = useAsync(() => buscarParadas(texto), [texto]);

  return (
    <View style={{ flex: 1, backgroundColor: c.fondo }}>
      <TextInput
        value={texto}
        onChangeText={setTexto}
        placeholder="Buscar parada por nombre o calle"
        placeholderTextColor={c.textoSuave}
        style={[estilos.buscador, { backgroundColor: c.tarjeta, color: c.texto, borderColor: c.borde }]}
      />
      <EstadoPantalla estado={estado} mensajeVacio="No encontramos paradas con ese nombre." onReintentar={recargar}>
        {(paradas) => (
          <FlatList
            data={paradas}
            keyExtractor={(p) => p.id}
            contentContainerStyle={estilos.lista}
            renderItem={({ item }) => (
              <View style={[estilos.tarjeta, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
                <Text style={{ color: c.texto, fontWeight: "700" }}>{item.nombre}</Text>
                <Text style={{ color: c.textoSuave }}>
                  Sentido: {item.sentido} · Líneas: {item.lineaIds.length}
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
  buscador: { margin: 16, marginBottom: 0, padding: 12, borderRadius: 10, borderWidth: 1, fontSize: 16 },
  lista: { padding: 16, gap: 10 },
  tarjeta: { padding: 12, borderRadius: 12, borderWidth: 1, gap: 2 },
});
