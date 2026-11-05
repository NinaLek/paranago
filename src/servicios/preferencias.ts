import Storage from "../datos/kv";

const CLAVE_AVISOS = "avisos-activos";

export async function obtenerAvisosActivos(): Promise<boolean> {
  try {
    return (await Storage.getItem(CLAVE_AVISOS)) !== "false";
  } catch {
    return true;
  }
}

export async function fijarAvisosActivos(valor: boolean): Promise<void> {
  try {
    await Storage.setItem(CLAVE_AVISOS, String(valor));
  } catch {
    // no pasa nada
  }
}
