export interface IUsuarioDB {
  _id: string;
  username: string;
  password?: string;
  rol: "ADMIN" | "USER"; // Tipado estricto de roles
  nombre: string;
  apellido: string;
  legajo?: string;
}

// Omitimos 'password' para asegurar que TS nos avise si intentamos enviarla
export type IUsuarioResponse = Omit<IUsuarioDB, "password">;

// 3. Lo que guardamos dentro del JWT (Cookie)
export interface IUserPayload {
  id: string;
  username: string;
  rol: string;
  nombre: string;
  // Agrega aquí cualquier otro dato que necesites leer rápido en los controllers
}
