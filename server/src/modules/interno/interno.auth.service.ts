import { internoApi, cookieJar } from "./interno.api";
import { AppError } from "../../errors/AppError";

const BASE_URL = process.env.HOSPITAL_INTERNAL_URL || "http://10.101.0.4";

/**
 * Verifica si ya tenemos la cookie de sesión del hospital.
 */
export const tieneSesionActiva = async (): Promise<boolean> => {
  const cookies = await cookieJar.getCookies(BASE_URL);
  // Ajusta el nombre "hospital_session" si ves que la cookie se llama distinto (ej: .ASPXAUTH, JSESSIONID, etc)
  // Si no sabes el nombre, con que haya cookies suele bastar.
  return cookies.length > 0;
};

export const loginInterno = async (
  forzarRelogueo: boolean = false,
): Promise<boolean> => {
  try {
    // 1. Si ya estamos logueados, no hacemos nada
    if (!forzarRelogueo && (await tieneSesionActiva())) {
      console.log("Sesion recuperada satisfactoriamente");
      return true;
    }
    if (forzarRelogueo) {
      await cookieJar.removeAllCookies();
      console.log("Refrescando sesión expirada...");
    }

    console.log("Iniciando sesión en Sistema Interno...");
    const payload = new URLSearchParams();
    payload.append("username", process.env.HOSPITAL_INTERNAL_USER!);
    payload.append("password", process.env.HOSPITAL_INTERNAL_PASS!);

    // 2. POST de Credenciales
    const loginRes = await internoApi.post("/Hospital/Login", payload, {
      maxRedirects: 0, // Importante para manejar la redirección manual
      validateStatus: (status) => status >= 200 && status < 303,
    });

    // 3. Manejo de Redirección (Donde se suele setear la cookie real)
    if (loginRes.headers.location) {
      // console.log("Redirigiendo a:", loginRes.headers.location);
      await internoApi.get(loginRes.headers.location);
    } else {
      // Si no redirige, puede que el login haya fallado o el sistema sea directo
      if (loginRes.status !== 200) {
        throw new AppError(
          "Login fallido: El sistema no redirigió ni dio OK",
          401,
        );
      }
    }

    // 4. Verificación final
    if (!(await tieneSesionActiva())) {
      throw new AppError("No se pudo obtener la cookie de sesión", 401);
    }

    console.log("✅ Sesión establecida correctamente.");
    return true;
  } catch (error) {
    console.error("❌ Error en Login Interno:", error);
    throw new AppError("Error de autenticación con el sistema interno", 500);
  }
};
