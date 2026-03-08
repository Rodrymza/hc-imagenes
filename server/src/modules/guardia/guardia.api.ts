import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

export const cookieJarGuardia = new CookieJar();

export const guardiaApi = wrapper(
  axios.create({
    baseURL: process.env.GUARDIA_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
    jar: cookieJarGuardia,
  }),
);
