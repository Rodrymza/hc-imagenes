import axios from "axios";

export const internacionApi = axios.create({
  baseURL: process.env.INTERNACION_API_URL || "http://10.101.0.52:3305",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true,
});
