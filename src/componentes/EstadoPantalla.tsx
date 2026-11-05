import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { Estado } from "../hooks/useAsync";
import { useColores } from "../tema";

interface Props<T> {
  estado: Estado<T>;
  mensajeVacio: string;
  onReintentar: () => void;
  children: (datos: T) => React.ReactNode;
}

/** Muestra carga / error / vacío y, si todo está bien, el contenido. */
export function EstadoPantalla<T>({ estado, mensajeVacio, onReintentar, children }: Props<T>) {
  const c = useColores();
  const [lento, setLento] = useState(false);

  // Si tarda, avisamos: el servidor gratis puede estar "durmiendo" y tarda hasta ~1 minuto en despertar
  useEffect(() => {
    if (estado.tipo !== "cargando") {
      setLento(false);
      return;
    }
    const t = setTimeout(() => setLento(true), 8000);
    return () => clearTimeout(t);
  }, [estado.tipo]);

  if (estado.tipo === "cargando") {
    return (
      <View style={estilos.centro} accessibilityLabel="Cargando">
        <ActivityIndicator size="large" color={c.primario} />
        <Text style={[estilos.texto, { color: c.textoSuave }]}>Cargando…</Text>
        {lento && (
          <Text style={[estilos.texto, { color: c.textoSuave }]}>
            Está tardando más de lo normal. El servidor puede estar despertando: puede demorar hasta un minuto.
          </Text>
        )}
      </View>
    );
  }

  if (estado.tipo === "error") {
    return (
      <View style={estilos.centro}>
        <Text style={[estilos.titulo, { color: c.error }]}>No pudimos cargar</Text>
        <Text style={[estilos.texto, { color: c.textoSuave }]}>{estado.mensaje}</Text>
        <Pressable
          onPress={onReintentar}
          style={[estilos.boton, { backgroundColor: c.primario }]}
          accessibilityRole="button"
        >
          <Text style={estilos.botonTexto}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  if (estado.tipo === "vacio") {
    return (
      <View style={estilos.centro}>
        <Text style={[estilos.texto, { color: c.textoSuave }]}>{mensajeVacio}</Text>
      </View>
    );
  }

  return <>{children(estado.datos)}</>;
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  titulo: { fontSize: 18, fontWeight: "700" },
  texto: { fontSize: 15, textAlign: "center" },
  boton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, minHeight: 44 },
  botonTexto: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
