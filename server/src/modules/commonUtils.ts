import { isAxiosError } from "axios";
import { esErrorDeRed } from "./interno/interno.api.js";

export const ejecutarPeticionInterna = async <T>(
  descripcion: string,
  login: (forzarLogueo: boolean) => Promise<void>,
  operacion: () => Promise<T>,
): Promise<T> => {
  try {
    await login(false);
    return await operacion();
  } catch (error: any) {
    const status = error.response?.status;

    // Si es error 400 de la operación (rechazaron los datos), no reintentamos
    if (status === 400) {
      console.error(`❌ El hospital rechazó los datos en "${descripcion}".`);
      throw error;
    }

    // Timeout o error de red: relogueamos con sesión limpia y reintentamos UNA vez
    if (isAxiosError(error) && esErrorDeRed(error.code)) {
      console.warn(
        `🔌 Error de red/timeout en "${descripcion}" (${error.code}). Reintentando con login fresco...`,
      );
      try {
        await login(true);
        return await operacion();
      } catch (loginError: any) {
        console.error(`💥 Falló el reintento de red para ${descripcion}.`);
        throw loginError;
      }
    }

    // SOLO si es 401 (No autorizado) o 403, intentamos renovar sesión
    if (status === 401 || status === 403) {
      console.warn(
        `🔄 Sesión expirada en ${descripcion} (${status}). Forzando nuevo login...`,
      );
      try {
        await login(true);
        return await operacion();
      } catch (loginError: any) {
        console.error(`💥 Falló el reintento de login para ${descripcion}.`);
        throw loginError;
      }
    }

    // Cualquier otro error (500, etc) se lanza directo
    console.error(
      `⚠️ Error en "${descripcion}" (Status: ${status || "Desconocido"})`,
    );
    throw error;
  }
};
