import { useNetworkState } from "expo-network";
import { StyleSheet, Text, View } from "react-native";
import { useDatosViejos } from "../servicios/cache";
import { useColores } from "../tema";

/** Avisa si no hay conexión y desde cuándo son los datos que se están mostrando. */
export function BannerRed() {
  const c = useColores();
  const red = useNetworkState();
  const viejoDesde = useDatosViejos();
  const sinRed = red.isConnected === false || red.isInternetReachable === false;

  if (!sinRed && !viejoDesde) return null;

  const cuando = viejoDesde
    ? new Date(viejoDesde).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <View style={[estilos.banner, { backgroundColor: c.alertaFondo }]} accessibilityRole="alert">
      <Text style={{ color: c.alerta, fontWeight: "700" }}>
        {sinRed ? "Sin conexión" : "Información desactualizada"}
      </Text>
      <Text style={{ color: c.texto }}>
        {cuando ? `Mostrando datos guardados el ${cuando}.` : "Mostrando datos guardados en el teléfono."}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  banner: { padding: 10, paddingHorizontal: 16 },
});
