export interface IUsuarioDB {
  id: number;
  username: string;
  password?: string;
  rol: "ADMIN" | "USER";
  nombre: string;
  apellido: string;
  hsi_username?: string;
  hsi_password?: string;
}

export type IUsuarioResponse = Omit<IUsuarioDB, "password" | "hsi_password">;

export interface IUserPayload {
  id: number;
  username: string;
  rol: string;
  nombre: string;
  apellido: string;
}
