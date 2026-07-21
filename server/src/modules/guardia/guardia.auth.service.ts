import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { AppError } from "../../errors/AppError.js";
import {
  getSesion,
  hasSesion,
  removeSesion,
  setSesion,
} from "./guardia.session.js";

const BASE_URL = "https://hsi.mendoza.gov.ar";

const REFRESH_MARGIN_MS = 5 * 60 * 1000;

function parseTokensFromSetCookie(
  setCookieHeaders: string[],
): { accessToken: string; refreshToken: string } {
  let accessToken = "";
  let refreshToken = "";

  for (const header of setCookieHeaders) {
    const [nameValue] = header.split(";");
    const eqIndex = nameValue.indexOf("=");
    const name = nameValue.substring(0, eqIndex).trim();
    const value = nameValue.substring(eqIndex + 1).trim();
    if (name === "token") accessToken = value;
    if (name === "refreshToken") refreshToken = value;
  }

  return { accessToken, refreshToken };
}

export const loginCon2FA = async (
  userId: string,
  hsiUser: string,
  hsiPass: string,
  totpCode: string,
): Promise<{ success: boolean; username: string }> => {
  try {
    const tempJar = new CookieJar();
    const tempApi = wrapper(
      axios.create({
        baseURL: BASE_URL,
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
        jar: tempJar,
      }) as any,
    ) as any;

    const loginRes = await tempApi.post("/api/auth", {
      username: hsiUser,
      password: hsiPass,
    });

    const loginOk =
      loginRes.data === true ||
      loginRes.data === "true" ||
      loginRes.data?.success === true;

    if (!loginOk) {
      throw new AppError(
        "Credenciales de HSI inválidas",
        401,
        "Usuario o contraseña incorrectos en HSI",
      );
    }

    await tempApi.get("/api/account/permissions");

    const totpRes = await tempApi.post("/api/auth/login-2fa", {
      code: totpCode,
    });

    const setCookieHeaders = (totpRes.headers["set-cookie"] as string[]) || [];
    const { accessToken, refreshToken } = parseTokensFromSetCookie(setCookieHeaders);

    const finalAccessToken = accessToken || totpRes.data?.token || totpRes.data?.accessToken;
    const finalRefreshToken = refreshToken || totpRes.data?.refreshToken;

    if (!finalAccessToken) {
      throw new AppError(
        "Error al autenticar con 2FA",
        401,
        "Código TOTP inválido o expirado",
      );
    }

    if (!finalRefreshToken) {
      throw new AppError(
        "Error en la respuesta de 2FA",
        500,
        "No se recibió refresh token de HSI",
      );
    }

    setSesion(userId, finalAccessToken, finalRefreshToken, hsiUser);

    return { success: true, username: hsiUser };
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "No se pudo iniciar sesión en HSI",
      500,
      error.response?.data?.message || error.message || "Error de login en HSI",
    );
  }
};

export const refreshTokenSiEsNecesario = async (
  userId: string,
): Promise<void> => {
  const session = getSesion(userId);
  if (!session) return;

  const now = Date.now();
  const timeUntilExpiry = session.expiresAt - now;

  if (timeUntilExpiry > REFRESH_MARGIN_MS) return;

  console.log(`🔄 Renovando token HSI para usuario "${userId}"...`);

  try {
    const refreshRes = await session.axios.post("/api/auth/refresh");

    const refreshHeaders = (refreshRes.headers["set-cookie"] as string[]) || [];
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      parseTokensFromSetCookie(refreshHeaders);

    const finalNewAccessToken =
      newAccessToken || refreshRes.data?.token || refreshRes.data?.accessToken;
    const finalNewRefreshToken =
      newRefreshToken || refreshRes.data?.refreshToken;

    if (finalNewAccessToken) {
      setSesion(
        userId,
        finalNewAccessToken,
        finalNewRefreshToken || "",
        session.username,
      );
      console.log(`✅ Token HSI renovado para "${userId}"`);
    } else {
      console.warn(`⚠️ Refresh no devolvió token para "${userId}", sesión puede expirar`);
    }
  } catch (error: any) {
    console.error(`❌ Error al renovar token HSI para "${userId}":`, error.message);
    removeSesion(userId);
    throw new AppError(
      "Sesión HSI expirada",
      401,
      "El refresh token expiró. Inicie sesión nuevamente con 2FA.",
    );
  }
};

export const obtenerSesionHsi = async (
  userId: string,
): Promise<import("./guardia.session.js").HsiSession | null> => {
  if (!hasSesion(userId)) return null;

  await refreshTokenSiEsNecesario(userId);

  return getSesion(userId) || null;
};

export const logoutHsi = (userId: string): boolean => {
  return removeSesion(userId);
};
