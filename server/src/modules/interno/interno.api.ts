import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

export const cookieJar = new CookieJar();

export const esErrorDeRed = (code?: string | null): boolean =>
  !!code &&
  [
    "ECONNABORTED", // timeout de axios
    "ETIMEDOUT",
    "ECONNREFUSED",
    "ENETUNREACH",
    "EHOSTUNREACH",
    "ENOTFOUND",
    "EAI_AGAIN",
  ].includes(code);

export const internoApi = wrapper(
  axios.create({
    baseURL: process.env.HOSPITAL_INTERNAL_URL || "http://10.101.0.4",
    timeout: 30000,
    withCredentials: true,
    jar: cookieJar,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36",
      "X-Requested-With": "XMLHttpRequest",
      Origin: process.env.HOSPITAL_INTERNAL_URL || "http://10.101.0.4",
      Referer: `${process.env.HOSPITAL_INTERNAL_URL}/Hospital/Login`,
    },
  }) as any,
) as any;
