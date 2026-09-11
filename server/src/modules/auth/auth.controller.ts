import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
import { resolveActiveOperatorId } from "./auth.middleware.js";
import { operatorService } from "./auth.operator.service.js";
import {
  jwtCookieOptions,
  operatorCookieOptions,
} from "./auth.cookies.js";

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

      res.cookie("jwt", token, jwtCookieOptions());

      res.cookie("activeOperator", user.id, operatorCookieOptions());

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
    res.clearCookie("jwt", jwtCookieOptions());
    res.clearCookie("activeOperator", operatorCookieOptions());
    res.status(200).json({ status: "success" });
  },

  verifyUser: (req: Request, res: Response) => {
    const operatorId = resolveActiveOperatorId(req);
    const operator = operatorService.obtenerPorId(operatorId);

    if (!req.signedCookies?.activeOperator) {
      res.cookie("activeOperator", operatorId, operatorCookieOptions());
    }

    res.status(200).json({
      status: "success",
      user: req.user,
      activeOperator: operator,
    });
  },
};
