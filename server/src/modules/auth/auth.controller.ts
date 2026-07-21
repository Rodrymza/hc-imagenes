import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password, totpCode } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Faltan credenciales" });
      }

      const { user, token, hsiLogin } = await authService.login(
        username,
        password,
        totpCode,
      );

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json({
        success: true,
        user: user,
        hsiLogin: hsiLogin || false,
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
    res.status(200).json({
      status: "success",
      user: req.user,
    });
  },
};
