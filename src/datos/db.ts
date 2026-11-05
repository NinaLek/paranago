// Caché local en SQLite: líneas, paradas y horarios quedan guardados para usar sin datos.
// En la web (donde SQLite no está disponible) cae a una caché en memoria.
import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
const memoria = new Map<string, { json: string; guardadoEn: string }>();

function abrir() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync("paranago.db");
      await db.execAsync(
        "CREATE TABLE IF NOT EXISTS cache (clave TEXT PRIMARY KEY NOT NULL, json TEXT NOT NULL, guardadoEn TEXT NOT NULL);"
      );
      return db;
    })();
  }
  return dbPromise;
}

export async function guardarCache(clave: string, datos: unknown): Promise<void> {
  const json = JSON.stringify(datos);
  const guardadoEn = new Date().toISOString();
  memoria.set(clave, { json, guardadoEn });
  if (Platform.OS === "web") return;
  try {
    const db = await abrir();
    await db.runAsync(
      "INSERT OR REPLACE INTO cache (clave, json, guardadoEn) VALUES (?, ?, ?)",
      clave,
      json,
      guardadoEn
    );
  } catch {
    // si SQLite falla, queda la copia en memoria
  }
}

export async function leerCache<T>(clave: string): Promise<{ datos: T; guardadoEn: string } | null> {
  if (Platform.OS !== "web") {
    try {
      const db = await abrir();
      const fila = await db.getFirstAsync<{ json: string; guardadoEn: string }>(
        "SELECT json, guardadoEn FROM cache WHERE clave = ?",
        clave
      );
      if (fila) return { datos: JSON.parse(fila.json) as T, guardadoEn: fila.guardadoEn };
    } catch {
      // seguimos con la memoria
    }
  }
  const m = memoria.get(clave);
  return m ? { datos: JSON.parse(m.json) as T, guardadoEn: m.guardadoEn } : null;
}
