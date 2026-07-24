import { Request, Response, NextFunction } from "express";
import { operatorService } from "./auth.operator.service.js";
import { resolveActiveOperatorId } from "./auth.middleware.js";
import { AppError } from "../../errors/AppError.js";

const PIN_REGEX = /^\d{4}$/;

const COOKIE_OPTIONS = {
  signed: true,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
};

export const authOperatorController = {
  async changeOperator(req: Request, res: Response, next: NextFunction) {
    try {
      const { pin } = req.body;

      if (!pin || typeof pin !== "string" || !PIN_REGEX.test(pin)) {
        return next(
          new AppError("El PIN debe ser exactamente 4 dígitos", 400),
        );
      }

      const operator = operatorService.cambiarOperador(pin);
      if (!operator) {
        return next(new AppError("PIN inválido", 401));
      }

      res.cookie("activeOperator", operator.id, COOKIE_OPTIONS);

      res.status(200).json({ success: true, operator });
    } catch (error) {
      next(error);
    }
  },

  getActiveOperator(req: Request, res: Response) {
    const operatorId = resolveActiveOperatorId(req);

    if (!req.signedCookies?.activeOperator) {
      res.cookie("activeOperator", operatorId, COOKIE_OPTIONS);
    }

    const operator = operatorService.obtenerPorId(operatorId);

    res.status(200).json({ success: true, operator });
  },
};
