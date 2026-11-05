// Versión WEB de la caché: solo en memoria (SQLite se usa en el celular).
const memoria = new Map<string, { json: string; guardadoEn: string }>();

export async function guardarCache(clave: string, datos: unknown): Promise<void> {
  memoria.set(clave, { json: JSON.stringify(datos), guardadoEn: new Date().toISOString() });
}

export async function leerCache<T>(clave: string): Promise<{ datos: T; guardadoEn: string } | null> {
  const m = memoria.get(clave);
  return m ? { datos: JSON.parse(m.json) as T, guardadoEn: m.guardadoEn } : null;
}
