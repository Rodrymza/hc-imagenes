import axios from "axios";

export interface User {
  id: string;
  username: string;
  nombre: string;
  apellido: string;
  rol: string;
}

export const AuthService = {
  login: async (credentials: { username: string; password: string }) => {
    // Vite proxy redirige /api -> localhost:3000
    const res = await axios.post("/api/auth/login", credentials);
    return res.data;
  },

  logout: async () => {
    return await axios.post("/api/auth/logout");
  },

  verifyToken: async () => {
    // Este endpoint debe devolver el usuario si la cookie/token es válido
    const res = await axios.get("/api/auth/verify");
    return res.data;
  },
};
