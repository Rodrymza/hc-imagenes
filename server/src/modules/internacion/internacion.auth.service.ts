import { AppError } from "../../errors/AppError";
import { internacionApi } from "./internacion.api";

export const tieneSesionActiva = async (): Promise<boolean> => {
  const cookieHeader = internacionApi.defaults.headers.common["Cookie"];
  return !!cookieHeader && (cookieHeader as string).includes("token=");
};

export const loginInternacion = async (
  forzarRelogueo: boolean = false,
): Promise<boolean> => {
  try {
    if (!forzarRelogueo && (await tieneSesionActiva())) {
      return true;
    }

    if (forzarRelogueo) {
      // Borramos el header para forzar un refresh limpio
      delete internacionApi.defaults.headers.common["Cookie"];
      console.log("🔄 Refrescando sesión expirada...");
    }

    const payload = new URLSearchParams({
      usuario: process.env.INTERNACION_USER!,
      password: process.env.INTERNACION_PASS!,
    });

    const loginRes: any = await internacionApi.post("/sesiones/login", payload);

    const token = loginRes.data._id;

    if (!token) {
      throw new AppError(
        "Login fallido",
        401,
        "No se pudo realizar el login en Internación",
      );
    }

    // 🔥 LA MAGIA: Inyectamos el header Cookie directamente en Axios
    // Esto asegura que TODAS las peticiones futuras de internacionApi lo envíen automáticamente
    internacionApi.defaults.headers.common["Cookie"] = `token=${token}`;

    //console.log("✅ Token inyectado en Axios correctamente");

    if (!(await tieneSesionActiva())) {
      throw new AppError("No se pudo configurar el header de sesión", 401);
    }

    return true;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "No se pudo iniciar sesión en Internación",
      500,
      error.message || "Error de login en Internación",
    );
  }
};
