import axios from "axios";

export interface User {
  id: string;
  username: string;
  nombre: string;
  apellido: string;
  rol: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  hsiLogin: boolean;
}

export const AuthService = {
  login: async (credentials: {
    username: string;
    password: string;
    totpCode?: string;
  }) => {
    const res = await axios.post<LoginResponse>("/api/auth/login", credentials);
    return res.data;
  },

  logout: async () => {
    return await axios.post("/api/auth/logout");
  },

  verifyToken: async () => {
    const res = await axios.get("/api/auth/verify");
    return res.data;
  },
};
