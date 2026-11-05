// Notificaciones LOCALES. Se disparan por hechos reales de la app:
//  1) el usuario pide un recordatorio de un horario de una parada;
//  2) aparece un aviso nuevo en una línea favorita.
import Storage from "../datos/kv";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Aviso } from "../tipos";
import { obtenerFavoritos } from "./favoritos";
import { obtenerAvisosActivos } from "./preferencias";

let configurado = false;

/** Configura el canal y pide permiso. Devuelve true si se pueden mostrar notificaciones. */
export async function prepararNotificaciones(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  if (!configurado) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Avisos y recordatorios",
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    configurado = true;
  }
  const actual = await Notifications.getPermissionsAsync();
  if (actual.granted) return true;
  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.granted;
}

export type ResultadoRecordatorio = "ok" | "sin_permiso" | "ya_paso" | "no_disponible";

/** Programa un recordatorio `minutosAntes` del horario de tabla `hora` ("HH:MM", de hoy). */
export async function programarRecordatorio(opts: {
  titulo: string;
  cuerpo: string;
  hora: string;
  minutosAntes: number;
}): Promise<ResultadoRecordatorio> {
  if (Platform.OS === "web") return "no_disponible";
  const [h, m] = opts.hora.split(":").map(Number);
  const fecha = new Date();
  fecha.setHours(h, m - opts.minutosAntes, 0, 0);
  if (fecha.getTime() <= Date.now()) return "ya_paso";
  if (!(await prepararNotificaciones())) return "sin_permiso";
  await Notifications.scheduleNotificationAsync({
    content: { title: opts.titulo, body: opts.cuerpo },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fecha },
  });
  return "ok";
}

const CLAVE_VISTOS = "avisos-vistos";

/** Si hay avisos que el usuario no vio y afectan a una línea favorita, lo notifica. */
export async function notificarAvisosNuevos(avisos: Aviso[]): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const raw = await Storage.getItem(CLAVE_VISTOS);
    const vistos: string[] = raw ? JSON.parse(raw) : [];
    const favoritas = await obtenerFavoritos("lineas");
    const nuevos = avisos.filter(
      (a) => !vistos.includes(a.id) && a.lineaIds.some((l) => favoritas.includes(l))
    );
    if (nuevos.length > 0 && (await obtenerAvisosActivos()) && (await prepararNotificaciones())) {
      for (const a of nuevos) {
        await Notifications.scheduleNotificationAsync({
          content: { title: `Aviso nuevo: ${a.titulo}`, body: a.detalle },
          trigger: null, // inmediata
        });
      }
    }
    const todos = Array.from(new Set([...vistos, ...avisos.map((a) => a.id)]));
    await Storage.setItem(CLAVE_VISTOS, JSON.stringify(todos));
  } catch {
    // las notificaciones nunca deben romper la pantalla
  }
}
