import axios from "axios";

export const internacionApi = axios.create({
  baseURL: process.env.INTERNACION_API_URL,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true,
});
