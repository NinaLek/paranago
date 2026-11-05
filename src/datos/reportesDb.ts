// Reportes guardados en el teléfono con expo-sqlite. Los que tienen sincronizado = 0 esperan red.
import * as SQLite from "expo-sqlite";
import type { ReporteDeDemora } from "../tipos";

type Fila = Omit<ReporteDeDemora, "sincronizado"> & { sincronizado: number };

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function abrir() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync("paranago-reportes.db");
      await db.execAsync(`CREATE TABLE IF NOT EXISTS reportes (
        id TEXT PRIMARY KEY NOT NULL,
        lineaId TEXT NOT NULL,
        paradaId TEXT NOT NULL,
        usuarioId TEXT NOT NULL,
        motivo TEXT NOT NULL,
        comentario TEXT,
        fotoUri TEXT,
        confirmaciones INTEGER NOT NULL DEFAULT 0,
        fechaHora TEXT NOT NULL,
        sincronizado INTEGER NOT NULL DEFAULT 0
      );`);
      return db;
    })();
  }
  return dbPromise;
}

const aReporte = (f: Fila): ReporteDeDemora => ({ ...f, sincronizado: f.sincronizado === 1 });

export async function guardarLocal(r: ReporteDeDemora): Promise<void> {
  const db = await abrir();
  await db.runAsync(
    "INSERT OR REPLACE INTO reportes (id, lineaId, paradaId, usuarioId, motivo, comentario, fotoUri, confirmaciones, fechaHora, sincronizado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    r.id,
    r.lineaId,
    r.paradaId,
    r.usuarioId,
    r.motivo,
    r.comentario,
    r.fotoUri,
    r.confirmaciones,
    r.fechaHora,
    r.sincronizado ? 1 : 0
  );
}

export async function listarLocales(): Promise<ReporteDeDemora[]> {
  const db = await abrir();
  const filas = await db.getAllAsync<Fila>("SELECT * FROM reportes ORDER BY fechaHora DESC");
  return filas.map(aReporte);
}

export async function pendientes(): Promise<ReporteDeDemora[]> {
  const db = await abrir();
  const filas = await db.getAllAsync<Fila>("SELECT * FROM reportes WHERE sincronizado = 0 ORDER BY fechaHora ASC");
  return filas.map(aReporte);
}

export async function marcarSincronizado(id: string): Promise<void> {
  const db = await abrir();
  await db.runAsync("UPDATE reportes SET sincronizado = 1 WHERE id = ?", id);
}
