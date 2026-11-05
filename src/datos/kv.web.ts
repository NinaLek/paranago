// Versión WEB: no importa expo-sqlite (en la web requiere un .wasm que Metro no resuelve).
const memoria = new Map<string, string>();
const ls = () => (globalThis as any).localStorage as Storage | undefined;

const kv = {
  async getItem(clave: string): Promise<string | null> {
    try {
      const v = ls()?.getItem(clave);
      if (v !== undefined && v !== null) return v;
    } catch {
      // seguimos con la memoria
    }
    return memoria.get(clave) ?? null;
  },
  async setItem(clave: string, valor: string): Promise<void> {
    memoria.set(clave, valor);
    try {
      ls()?.setItem(clave, valor);
    } catch {
      // queda en memoria
    }
  },
  async removeItem(clave: string): Promise<void> {
    memoria.delete(clave);
    try {
      ls()?.removeItem(clave);
    } catch {
      // nada
    }
  },
};

export default kv;
