/**
 * Formato del QR de una parada (según el ejemplo del PRD): "PARANA:par-101".
 * Devuelve el id de la parada, o null si el QR no es de ParanaGo (la app no se rompe).
 */
export function parsearQr(texto: string): string | null {
  const m = /^PARANA:(par-[A-Za-z0-9_-]+)$/.exec(texto.trim());
  return m ? m[1] : null;
}
