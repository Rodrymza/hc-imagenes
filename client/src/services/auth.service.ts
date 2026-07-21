import axios from "axios";

export interface User {
  id: number;
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

export interface VerifyResponse {
  status: string;
  user: User;
  activeOperator: User;
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
    const res = await axios.get<VerifyResponse>("/api/auth/verify");
    return res.data;
  },

  changeOperator: async (pin: string) => {
    const res = await axios.post("/api/auth/change-operator", { pin });
    return res.data;
  },
};
