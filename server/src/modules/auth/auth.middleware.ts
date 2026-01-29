import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppError } from "../../errors/AppError";

const SECRET = process.env.JWT_SECRET || "mi_secreto_super_seguro";

interface IUsuarioPayload {
  _id: string;
  username: string;
  nombre: string;
  rol: "ADMIN" | "USER";
  apellido: string;
}

// Extendemos Request para que TS no llore por 'req.user'
export interface AuthRequest extends Request {
  user?: IUsuarioPayload;
}

export const protegerRuta = (
  req: AuthRequest, // Usamos nuestra interfaz extendida
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.jwt; // Requiere 'cookie-parser' instalado

  if (!token) {
    return next(
      new AppError("No estás logueado. Por favor inicia sesión.", 401),
    );
  }

  try {
    const decoded = jwt.verify(token, SECRET!) as IUsuarioPayload;

    // Guardamos los datos para el siguiente paso
    req.user = decoded;

    next();
  } catch (error) {
    return next(new AppError("Token inválido o sesión expirada.", 401));
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
