import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { fijarAvisosActivos, obtenerAvisosActivos } from "../../src/servicios/preferencias";
import { useSesion } from "../../src/sesion/SesionContext";
import { fijarTema, useColores, useTemaPreferido } from "../../src/tema";
import type { Tema } from "../../src/tipos";

const TEMAS: { valor: Tema; etiqueta: string }[] = [
  { valor: "sistema", etiqueta: "Sistema" },
  { valor: "claro", etiqueta: "Claro" },
  { valor: "oscuro", etiqueta: "Oscuro" },
];

export default function Yo() {
  const c = useColores();
  const { estado, usuario, salir } = useSesion();
  const tema = useTemaPreferido();
  const [avisos, setAvisos] = useState(true);

  useEffect(() => {
    obtenerAvisosActivos().then(setAvisos);
  }, []);

  function cambiarAvisos(v: boolean) {
    setAvisos(v);
    fijarAvisosActivos(v);
  }

  return (
    <ScrollView style={{ backgroundColor: c.fondo }} contentContainerStyle={estilos.contenido}>
      {estado === "activa" && usuario ? (
        <View style={[estilos.tarjeta, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
          <Text style={{ color: c.texto, fontSize: 20, fontWeight: "800" }}>{usuario.nombre}</Text>
          <Text style={{ color: c.textoSuave }}>{usuario.email}</Text>
          <Pressable onPress={salir} accessibilityRole="button" style={[estilos.botonBorde, { borderColor: c.error }]}>
            <Text style={{ color: c.error, fontWeight: "700" }}>Cerrar sesión</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[estilos.tarjeta, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
          <Text style={{ color: c.texto, fontSize: 18, fontWeight: "800" }}>Tu cuenta</Text>
          <Text style={{ color: c.textoSuave }}>
            Ingresá para reportar demoras. Podés ver líneas, paradas y horarios sin cuenta.
          </Text>
          <Pressable onPress={() => router.push("/ingresar")} accessibilityRole="button" style={[estilos.boton, { backgroundColor: c.primario }]}>
            <Text style={estilos.botonTexto}>Ingresar</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/registro")} accessibilityRole="button" style={[estilos.botonBorde, { borderColor: c.primario }]}>
            <Text style={{ color: c.primario, fontWeight: "700" }}>Crear cuenta</Text>
          </Pressable>
        </View>
      )}

      <View style={[estilos.tarjeta, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
        <Text style={{ color: c.texto, fontSize: 18, fontWeight: "800" }}>Apariencia</Text>
        <View style={estilos.fila}>
          {TEMAS.map((t) => (
            <Pressable
              key={t.valor}
              onPress={() => fijarTema(t.valor)}
              accessibilityRole="button"
              style={[estilos.chip, { borderColor: c.primario, backgroundColor: tema === t.valor ? c.primario : c.tarjeta }]}
            >
              <Text style={{ color: tema === t.valor ? "#fff" : c.texto, fontWeight: "600" }}>{t.etiqueta}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[estilos.tarjeta, { backgroundColor: c.tarjeta, borderColor: c.borde }]}>
        <View style={estilos.fila}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.texto, fontSize: 16, fontWeight: "700" }}>Avisos de mis líneas favoritas</Text>
            <Text style={{ color: c.textoSuave }}>Recibir una notificación cuando haya un aviso nuevo.</Text>
          </View>
          <Switch value={avisos} onValueChange={cambiarAvisos} />
        </View>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 16, gap: 12 },
  tarjeta: { padding: 16, borderRadius: 12, borderWidth: 1, gap: 10 },
  fila: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  chip: { borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, minHeight: 44, justifyContent: "center" },
  boton: { padding: 14, borderRadius: 10, alignItems: "center", minHeight: 48, justifyContent: "center" },
  botonTexto: { color: "#fff", fontWeight: "700", fontSize: 16 },
  botonBorde: { padding: 14, borderRadius: 10, borderWidth: 1.5, alignItems: "center", minHeight: 48, justifyContent: "center" },
});
