import { internacionApi } from "./internacion.api";

let cachedToken: string | null = null;
let tokenTimestamp: number | null = null;

const TOKEN_TTL = 1000 * 60 * 30; // 30 min

// 1. Agregamos el parámetro opcional, por defecto false
export async function getInternacionToken(
  forceRefresh: boolean = false,
): Promise<string> {
  if (
    !forceRefresh &&
    cachedToken &&
    tokenTimestamp &&
    Date.now() - tokenTimestamp < TOKEN_TTL
  ) {
    return cachedToken;
  }

  const payload = new URLSearchParams({
    usuario: process.env.INTERNACION_USER || "rodrigo.ramirez",
    password: process.env.INTERNACION_PASS || "123456",
  });

  const res = await internacionApi.post("/sesiones/login", payload);

  if (!res.data?._id) {
    throw new Error("No se pudo obtener el token de internación");
  }

  cachedToken = res.data._id as string;
  tokenTimestamp = Date.now();

  return cachedToken;
}
