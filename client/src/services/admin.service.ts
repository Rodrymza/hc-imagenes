import axios from "axios";

export interface AdminUser {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  rol: string;
  hsi_username: string;
  pin: string;
}

export interface CreateUserDTO {
  username: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: string;
  hsi_username: string;
  hsi_password: string;
  pin: string;
}

export interface UpdateUserDTO {
  username?: string;
  password?: string;
  nombre?: string;
  apellido?: string;
  rol?: string;
  hsi_username?: string;
  hsi_password?: string;
  pin?: string;
}

export const AdminService = {
  getUsers: async (): Promise<AdminUser[]> => {
    const res = await axios.get("/api/auth/users");
    return res.data;
  },

  createUser: async (data: CreateUserDTO): Promise<AdminUser> => {
    const res = await axios.post("/api/auth/users", data);
    return res.data;
  },

  updateUser: async (id: number, data: UpdateUserDTO): Promise<AdminUser> => {
    const res = await axios.put(`/api/auth/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id: number) => {
    const res = await axios.delete(`/api/auth/users/${id}`);
    return res.data;
  },
};
