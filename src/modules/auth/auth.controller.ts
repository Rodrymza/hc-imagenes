import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Faltan credenciales" });
      }

      const { user, token } = await authService.login(username, password);

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        httpOnly: true, // IMPORTANTE: El JS del frontend no puede leerla (seguridad XSS)
        secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
        sameSite: "strict", // Protección CSRF básica
      });

      // Devolvemos datos del usuario (el token va oculto en la cookie)
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response) {
    res.cookie("jwt", "loggedout", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ status: "success" });
  },
};
