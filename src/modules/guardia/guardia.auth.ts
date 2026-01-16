// guardia.auth.ts
import { AppError } from "../../errors/AppError";
import { guardiaApi } from "./guardia.api";

interface ITokenCache {
  token: string;
  timestamp: number;
}

// Map indexado por username
const tokenCache = new Map<string, ITokenCache>();
const TOKEN_TTL = 1000 * 60 * 60; // 60 min

export async function getGuardiaToken(
  username: string,
  password: string,
  forceRefresh: boolean = false
): Promise<string> {
  const userCache = tokenCache.get(username);

  if (
    !forceRefresh &&
    userCache &&
    Date.now() - userCache.timestamp < TOKEN_TTL
  ) {
    return userCache.token;
  }

  // 2. Petición a HSI (Usando Generic para evitar errores de TS en .data)
  interface IHsiResponse {
    token?: string;
    access_token?: string;
    authToken?: string;
  }

  const response = await guardiaApi.post<IHsiResponse>(
    "api/auth",
    { username, password },
    {
      headers: {
        Origin: "https://hsi.mendoza.gov.ar",
        Referer: "https://hsi.mendoza.gov.ar/auth/login",
        "Content-Type": "application/json",
      },
    }
  );

  // 3. Manejo de errores
  if (response.status !== 200 && response.status !== 201) {
    throw new AppError(
      "Error en API Guardia",
      response.status,
      response.statusText
    );
  }

  const token =
    response.data.token ||
    response.data.access_token ||
    response.data.authToken;

  if (!token) {
    throw new AppError(
      "Error al obtener el token",
      500,
      "La respuesta de HSI no contiene un token válido"
    );
  }

  // 4. Guardar en caché bajo el nombre de este usuario
  tokenCache.set(username, {
    token,
    timestamp: Date.now(),
  });

  return token;
}
