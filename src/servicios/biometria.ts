import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

export type ResultadoBiometria = "ok" | "cancelado" | "no_disponible";

/** true si el teléfono tiene sensor y hay una huella/rostro registrado */
export async function biometriaDisponible(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const hardware = await LocalAuthentication.hasHardwareAsync();
    const registrada = await LocalAuthentication.isEnrolledAsync();
    return hardware && registrada;
  } catch {
    return false;
  }
}

/** Pide huella o rostro. Si el dispositivo no tiene, devuelve "no_disponible" (la UI ofrece la contraseña). */
export async function autenticar(): Promise<ResultadoBiometria> {
  if (!(await biometriaDisponible())) return "no_disponible";
  const r = await LocalAuthentication.authenticateAsync({
    promptMessage: "Ingresá a ParanaGo",
    cancelLabel: "Cancelar",
    disableDeviceFallback: false, // permite el PIN/patrón del teléfono si falla la huella
  });
  return r.success ? "ok" : "cancelado";
}
