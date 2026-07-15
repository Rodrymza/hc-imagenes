import { wrapper } from "axios-cookiejar-support";
import axios, { type AxiosInstance } from "axios";

const BASE_URL = "https://hsi.mendoza.gov.ar";

export interface HsiSession {
  axios: AxiosInstance;
  expiresAt: number;
  username: string;
}

const sesiones = new Map<string, HsiSession>();

export function getSesion(userId: string): HsiSession | undefined {
  return sesiones.get(userId);
}

export function setSesion(
  userId: string,
  accessToken: string,
  refreshToken: string,
  hsiUsername: string,
): HsiSession {
  removeSesion(userId);

  const axiosInstance = wrapper(
    axios.create({
      baseURL: BASE_URL,
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${accessToken}; refreshToken=${refreshToken}`,
      },
    }) as any,
  ) as unknown as AxiosInstance;

  const decoded = decodeJwtPayload(accessToken);
  const expiresAt = decoded?.exp ? decoded.exp * 1000 : Date.now() + 30 * 60 * 1000;

  const session: HsiSession = { axios: axiosInstance, expiresAt, username: hsiUsername };
  sesiones.set(userId, session);

  console.log(`✅ Sesión HSI creada para usuario "${userId}" (expira: ${new Date(expiresAt).toLocaleString()})`);
  return session;
}

export function removeSesion(userId: string): boolean {
  const existed = sesiones.delete(userId);
  if (existed) console.log(`🚪 Sesión HSI eliminada para usuario "${userId}"`);
  return existed;
}

export function hasSesion(userId: string): boolean {
  return sesiones.has(userId);
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const base64 = token.split(".")[1];
    const json = Buffer.from(base64, "base64url").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}
