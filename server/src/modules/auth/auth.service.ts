import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { AppError } from "../../errors/AppError";
import { IUsuarioDB, IUsuarioResponse, IUserPayload } from "./auth.types";

const SECRET = process.env.JWT_SECRET || "mi_secreto_super_seguro";
const EXPIRES_IN = "4h";
const USERS_FILE_PATH = path.join(process.cwd(), "src/data/users.json");

export const authService = {
  generarToken(user: IUsuarioDB | IUsuarioResponse): string {
    const payload: IUserPayload = {
      id: user._id,
      username: user.username,
      rol: user.rol,
      apellido: user.apellido,
      nombre: user.nombre,
    };
    return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
  },

  async login(
    username: string,
    passwordInput: string,
  ): Promise<{ user: IUsuarioResponse; token: string }> {
    // 1. Leemos tipado como Array de IUsuarioDB
    const data = await fs.readFile(USERS_FILE_PATH, "utf-8");
    const usuarios: IUsuarioDB[] = JSON.parse(data);

    const usuario = usuarios.find((u) => u.username === username);

    if (!usuario || usuario.password !== passwordInput) {
      throw new AppError("Credenciales inválidas", 401);
    }

    // 2. Limpieza de datos (Mapping)
    // Extraemos la password y dejamos el resto en 'userSafe'
    const { password, ...userSafe } = usuario;

    // 3. Generamos token
    const token = this.generarToken(usuario);

    // 4. Retornamos el usuario seguro (TypeScript sabe que userSafe es IUsuarioResponse)
    return { user: userSafe, token };
  },
};
