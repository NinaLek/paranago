import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { autenticar } from "../servicios/biometria";
import { useSesion } from "../sesion/SesionContext";
import { useColores } from "../tema";

/** Reingreso: huella/rostro; si el dispositivo no tiene, o el usuario prefiere, contraseña. */
export function PantallaBloqueo() {
  const c = useColores();
  const { usuario, desbloquear, desbloquearConPassword, salir } = useSesion();
  const [usarPassword, setUsarPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function pedirBiometria() {
    const r = await autenticar();
    if (r === "ok") desbloquear();
    else if (r === "no_disponible") setUsarPassword(true); // alternativa para el dispositivo sin huella
  }

  useEffect(() => {
    pedirBiometria();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function conPassword() {
    setError(null);
    try {
      await desbloquearConPassword(password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos verificar la contraseña.");
    }
  }

  return (
    <View style={[estilos.pantalla, { backgroundColor: c.fondo }]}>
      <Text style={[estilos.titulo, { color: c.texto }]}>ParanaGo</Text>
      <Text style={{ color: c.textoSuave, textAlign: "center" }}>
        Hola {usuario?.nombre}. Confirmá que sos vos para continuar.
      </Text>

      <Pressable onPress={pedirBiometria} style={[estilos.boton, { backgroundColor: c.primario }]} accessibilityRole="button">
        <Text style={estilos.botonTexto}>Usar huella o rostro</Text>
      </Pressable>

      {!usarPassword && (
        <Pressable onPress={() => setUsarPassword(true)} accessibilityRole="button">
          <Text style={{ color: c.primario, padding: 8 }}>Usar mi contraseña</Text>
        </Pressable>
      )}

      {usarPassword && (
        <View style={{ width: "100%", gap: 8 }}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            placeholderTextColor={c.textoSuave}
            secureTextEntry
            style={[estilos.input, { backgroundColor: c.tarjeta, color: c.texto, borderColor: c.borde }]}
          />
          {error && <Text style={{ color: c.error }}>{error}</Text>}
          <Pressable onPress={conPassword} style={[estilos.boton, { backgroundColor: c.primario }]} accessibilityRole="button">
            <Text style={estilos.botonTexto}>Entrar</Text>
          </Pressable>
        </View>
      )}

      <Pressable onPress={salir} accessibilityRole="button">
        <Text style={{ color: c.textoSuave, padding: 8 }}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 14 },
  titulo: { fontSize: 32, fontWeight: "800" },
  boton: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 10, minHeight: 48, justifyContent: "center", alignSelf: "stretch", alignItems: "center" },
  botonTexto: { color: "#fff", fontWeight: "700", fontSize: 16 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 },
});
