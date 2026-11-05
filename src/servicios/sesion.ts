// El TOKEN va en expo-secure-store (nunca en kv-store). El usuario (sin datos sensibles) va en kv-store.
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import Storage from "../datos/kv";
import type { Usuario } from "../tipos";

const CLAVE_TOKEN = "sesion-token";
const CLAVE_USUARIO = "sesion-usuario";

// SecureStore no existe en la web: ahí (solo para desarrollo) se usa kv.
const esWeb = Platform.OS === "web";

export async function guardarSesion(token: string, usuario: Usuario): Promise<void> {
  if (esWeb) await Storage.setItem(CLAVE_TOKEN, token);
  else await SecureStore.setItemAsync(CLAVE_TOKEN, token);
  await Storage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

export async function leerToken(): Promise<string | null> {
  try {
    return esWeb ? await Storage.getItem(CLAVE_TOKEN) : await SecureStore.getItemAsync(CLAVE_TOKEN);
  } catch {
    return null;
  }
}

export async function leerUsuario(): Promise<Usuario | null> {
  try {
    const raw = await Storage.getItem(CLAVE_USUARIO);
    return raw ? (JSON.parse(raw) as Usuario) : null;
  } catch {
    return null;
  }
}

export async function borrarSesion(): Promise<void> {
  try {
    if (esWeb) await Storage.removeItem(CLAVE_TOKEN);
    else await SecureStore.deleteItemAsync(CLAVE_TOKEN);
    await Storage.removeItem(CLAVE_USUARIO);
  } catch {
    // si falla el borrado, igual se cierra la sesión en memoria
  }
}
