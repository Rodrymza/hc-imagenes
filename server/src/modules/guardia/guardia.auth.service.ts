import { Cookie } from "tough-cookie";
import { AppError } from "../../errors/AppError";
import { cookieJarGuardia, guardiaApi } from "./guardia.api";
const BASE_URL = "https://hsi.mendoza.gov.ar";
const username = process.env.GUARDIA_USER;
const password = process.env.GUARDIA_PASS;

export const tieneSesionActiva = async (): Promise<boolean> => {
  const cookies = await cookieJarGuardia.getCookies(BASE_URL);
  return cookies.length > 0;
};

export const loginGuardiaAuth = async (forzarRelogueo: boolean = false) => {
  try {
    if (!forzarRelogueo && (await tieneSesionActiva())) return true;

    if (forzarRelogueo) await cookieJarGuardia.removeAllCookies();

    const response = await guardiaApi.post("api/auth", { username, password });

    const token = response.data.token || response.data.access_token;

    if (token) {
      // Crear la cookie y la guardarla en el Jar manualmente
      const cookie = new Cookie({
        key: "token",
        value: token,
        domain: "hsi.mendoza.gov.ar",
        httpOnly: true,
        secure: true,
      });

      await cookieJarGuardia.setCookie(cookie, "https://hsi.mendoza.gov.ar");
      console.log("✅ Cookie 'token' inyectada en el Jar");
    }

    return true;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "No se pudo iniciar sesion en Guardia",
      500,
      error.message || "Error de login en Guardia",
    );
  }
};
