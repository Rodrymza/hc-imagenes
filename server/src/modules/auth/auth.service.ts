import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { AppError } from "../../errors/AppError.js";
import { IUsuarioDB, IUsuarioResponse, IUserPayload } from "./auth.types.js";
import { loginCon2FA } from "../guardia/guardia.auth.service.js";
import { db } from "../../db/database.js";

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = "4h";

export const authService = {
  generarToken(user: IUsuarioDB | IUsuarioResponse): string {
    const payload: IUserPayload = {
      id: user.id,
      username: user.username,
      rol: user.rol,
      apellido: user.apellido,
      nombre: user.nombre,
    };
    if (!SECRET) {
      throw new AppError(
        "No se encontro la variable SECRET en el archivo .env",
      );
    }
    return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
  },

  async login(
    username: string,
    passwordInput: string,
    totpCode?: string,
  ): Promise<{ user: IUsuarioResponse; token: string; hsiLogin?: boolean }> {
    const usuario = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username) as IUsuarioDB | undefined;

    if (!usuario || !usuario.password) {
      throw new AppError("Credenciales inválidas", 401);
    }

    const passwordValida = bcrypt.compareSync(passwordInput, usuario.password);
    if (!passwordValida) {
      throw new AppError("Credenciales inválidas", 401);
    }

    const { password, hsi_password, ...userSafe } = usuario;

    const token = this.generarToken(usuario);

    let hsiLogin = false;

    if (totpCode && usuario.hsi_username && hsi_password) {
      try {
        await loginCon2FA(
          usuario.username,
          usuario.hsi_username,
          hsi_password,
          totpCode,
        );
        hsiLogin = true;
      } catch (error: any) {
        console.error(`HSI login falló para ${username}:`, error.message);
      }
    }

    return { user: userSafe, token, hsiLogin };
  },
};
