import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppError } from "../../errors/AppError";
import { IUsuarioResponse } from "./auth.types";

const SECRET = process.env.JWT_SECRET || "mi_secreto_super_seguro";

export const protegerRuta = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 1. Leer cookie
  const token = req.cookies.jwt;

  if (!token) {
    return next(
      new AppError("No estás autenticado. Por favor inicia sesión.", 401),
    );
  }

  try {
    // 2. Verificar token
    const decoded = jwt.verify(token, SECRET) as IUsuarioResponse;

    // 3. Guardar en req.user para que el controlador lo use
    req.user = decoded;

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return next(
        new AppError("Tu sesión ha expirado. Inicia sesión nuevamente.", 401),
      );
    }
    return next(new AppError("Token inválido o corrupto.", 401));
  }
};

// Middleware opcional para roles, implementar luego para diferentes roles
export const restringirA = (...rolesPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    if (!rolesPermitidos.includes(user.rol)) {
      return next(
        new AppError("No tienes permisos para realizar esta acción", 403),
      );
    }
    next();
  };
};
