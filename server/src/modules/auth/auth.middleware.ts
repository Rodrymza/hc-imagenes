import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../../errors/AppError.js";
import { IUserPayload } from "./auth.types.js";

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
