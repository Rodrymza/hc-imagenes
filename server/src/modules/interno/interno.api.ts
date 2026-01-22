import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

export const cookieJar = new CookieJar();

export const internoApi = wrapper(
  axios.create({
    baseURL: process.env.HOSPITAL_INTERNAL_URL || "http://10.101.0.4",
    withCredentials: true,
    jar: cookieJar,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36",
      "X-Requested-With": "XMLHttpRequest",
      Origin: process.env.HOSPITAL_INTERNAL_URL || "http://10.101.0.4",
      // Truco: Ponemos el referer del login por defecto
      Referer: `${process.env.HOSPITAL_INTERNAL_URL}/Hospital/Login`,
    },
  }),
);
