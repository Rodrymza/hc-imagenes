import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../../errors/AppError.js";
import { IUserPayload } from "./auth.types.js";
import { db } from "../../db/database.js";

const SECRET = process.env.JWT_SECRET;

export const protegerRuta = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.jwt;

  if (!token) {
    return next(
      new AppError("No estás logueado. Por favor inicia sesión.", 401),
    );
  }

  try {
    const decoded = jwt.verify(token, SECRET!) as IUserPayload;
    req.user = decoded as any;
    next();
  } catch (error) {
    return next(new AppError("Token inválido o sesión expirada.", 401));
  }
};

export const restringirA = (...rolesPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUserPayload;
    if (!user || !rolesPermitidos.includes(user.rol)) {
      return next(
        new AppError("No tienes permisos para realizar esta acción", 403),
      );
    }
    next();
  };
};

export function resolveActiveOperatorId(req: Request): number {
  const signedId = req.signedCookies?.activeOperator;
  if (signedId) {
    const id = Number(signedId);
    const exists = db.prepare("SELECT 1 FROM users WHERE id = ?").get(id);
    if (exists) return id;
  }
  return req.user!.id;
}

export const modoAdministrador = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user as IUserPayload;
  if (!user || user.rol !== "ADMIN") {
    return next(new AppError("No tienes permisos de administrador", 403));
  }
  const operatorId = resolveActiveOperatorId(req);
  if (operatorId !== user.id) {
    return next(
      new AppError(
        "Modo administrador requiere que el operador activo sea usted",
        403,
      ),
    );
  }
  next();
};
