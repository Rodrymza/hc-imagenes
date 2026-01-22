import axios from "axios";

export const guardiaApi = axios.create({
  baseURL: process.env.GUARDIA_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
