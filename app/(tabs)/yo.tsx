import { StyleSheet, Text, View } from "react-native";
import { useColores } from "../../src/tema";

// Esqueleto. Después: registro/ingreso, huella, favoritos, tema y notificaciones.
export default function Yo() {
  const c = useColores();
  return (
    <View style={[estilos.centro, { backgroundColor: c.fondo }]}>
      <Text style={{ color: c.texto, fontSize: 18, fontWeight: "700" }}>Mi cuenta</Text>
      <Text style={{ color: c.textoSuave }}>Próximamente: ingreso, favoritos y ajustes.</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
});
