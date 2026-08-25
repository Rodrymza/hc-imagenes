export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const BASE_COOKIE_OPTIONS = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: SESSION_TTL_MS,
});

export const jwtCookieOptions = () => ({
  ...BASE_COOKIE_OPTIONS(),
});

export const operatorCookieOptions = () => ({
  ...BASE_COOKIE_OPTIONS(),
  signed: true,
});
