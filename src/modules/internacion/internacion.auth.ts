import { internacionApi } from "./internacion.api";

let cachedToken: string | null = null;
let tokenTimestamp: number | null = null;

const TOKEN_TTL = 1000 * 60 * 30; // 30 min

export async function getInternacionToken(): Promise<string> {
  if (
    cachedToken &&
    tokenTimestamp &&
    Date.now() - tokenTimestamp < TOKEN_TTL
  ) {
    return cachedToken;
  }

  const payload = new URLSearchParams({
    usuario: process.env.INTERNACION_USER!,
    password: process.env.INTERNACION_PASS!,
  });

  const res = await internacionApi.post("/sesiones/login", payload);

  if (!res.data?._id) {
    throw new Error("No se pudo obtener el token de internación");
  }

  cachedToken = res.data._id as string;
  tokenTimestamp = Date.now();

  return cachedToken;
}
