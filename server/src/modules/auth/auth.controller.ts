import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { protegerRuta } from "./auth.middleware";

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
        user: user,
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

  verifyUser: (req: Request, res: Response) => {
    // Si llegamos aquí, el middleware 'protegerRuta' ya hizo su trabajo
    // y puso los datos en req.user
    res.status(200).json({
      status: "success",
      user: req.user, // Devolvemos los datos decodificados al frontend
    });
  },
};
