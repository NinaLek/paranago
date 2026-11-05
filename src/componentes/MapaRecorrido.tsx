// Versión para WEB (react-native-maps solo funciona en Android/iOS).
import { StyleSheet, Text, View } from "react-native";
import type { Coordenadas, Parada } from "../tipos";
import { useColores } from "../tema";

export interface PropsMapa {
  color: string;
  trazado: Coordenadas[];
  paradas: Parada[];
  trazadoAlternativo?: Coordenadas[] | null;
  alTocarParada?: (id: string) => void;
}

export function MapaRecorrido(_: PropsMapa) {
  const c = useColores();
  return (
    <View style={[estilos.caja, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
      <Text style={{ color: c.textoSuave, textAlign: "center" }}>
        El mapa se ve en el celular (Android / iPhone).
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { height: 240, alignItems: "center", justifyContent: "center", padding: 16, borderWidth: 1 },
});
