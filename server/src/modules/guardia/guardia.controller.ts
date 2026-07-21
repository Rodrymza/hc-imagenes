import { NextFunction, Request, Response } from "express";
import { IPedidoGuardia } from "./guardia.types.js";
import { AppError } from "../../errors/AppError.js";
import { guardiaService } from "./utils/guardia.factory.js";
import { loginCon2FA, logoutHsi } from "./guardia.auth.service.js";
import { hasSesion } from "./guardia.session.js";
import { resolveActiveOperatorId } from "../auth/auth.middleware.js";
import { operatorService } from "../auth/auth.operator.service.js";

function getOperatorUsername(req: Request): string {
  const operatorId = resolveActiveOperatorId(req);
  const operator = operatorService.obtenerPorId(operatorId);
  if (!operator) {
    throw new AppError("No se pudo identificar al operador activo", 401);
  }
  return operator.username;
}

export const guardiaControler = {
  async loginGuardia(req: Request, res: Response, next: NextFunction) {
    try {
      const operatorUsername = getOperatorUsername(req);
      const { totpCode } = req.body;

      if (!totpCode) {
        throw new AppError(
          "Falta el código TOTP",
          400,
          "Se requiere el código de 6 dígitos del Authenticator",
        );
      }

      const operator = operatorService.obtenerPorUsername(operatorUsername);
      if (!operator || !operator.hsi_username || !operator.hsi_password) {
        throw new AppError(
          "Operador sin credenciales HSI",
          400,
          "El operador activo no tiene credenciales HSI configuradas",
        );
      }

      const result = await loginCon2FA(
        operatorUsername,
        operator.hsi_username,
        operator.hsi_password,
        totpCode,
      );

      return res.json({
        success: true,
        message: `Sesión HSI iniciada para ${result.username}`,
      });
    } catch (error) {
      next(error);
    }
  },

  async logoutGuardia(req: Request, res: Response, next: NextFunction) {
    try {
      const operatorUsername = getOperatorUsername(req);
      logoutHsi(operatorUsername);

      return res.json({
        success: true,
        message: "Sesión HSI cerrada",
      });
    } catch (error) {
      next(error);
    }
  },

  async hsiStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const operatorUsername = getOperatorUsername(req);
      const active = hasSesion(operatorUsername);

      return res.json({
        hasSession: active,
        operator: operatorUsername,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPedidosGuardia(
    req: Request,
    res: Response<IPedidoGuardia[]>,
    next: NextFunction,
  ) {
    try {
      const operatorUsername = getOperatorUsername(req);
      const { fecha } = req.query;

      if (fecha && typeof fecha !== "string") {
        throw new AppError("Formato de fecha inválido", 400);
      }
      const pedidos = await guardiaService.obtenerPedidosGuardia(
        operatorUsername,
        fecha,
      );
      return res.json(pedidos);
    } catch (error) {
      next(error);
    }
  },

  async getPedidosPaciente(req: Request, res: Response, next: NextFunction) {
    try {
      const operatorUsername = getOperatorUsername(req);
      const { idPatient } = req.params;

      if (idPatient && typeof idPatient !== "string") {
        throw new AppError("Formato de fecha inválido", 400);
      }
      if (!idPatient) {
        throw new AppError(
          "Falta ID del paciente para obtener los pedidos",
          400,
        );
      }
      const pedidosPaciente =
        await guardiaService.obtenerPedidosPaciente(operatorUsername, idPatient);

      return res.json(pedidosPaciente);
    } catch (error) {
      next(error);
    }
  },

  async finalizarPedido(req: Request, res: Response, next: NextFunction) {
    try {
      const operatorUsername = getOperatorUsername(req);
      const { idEstudio, idPatient } = req.params;

      await guardiaService.finalizarPedido(
        operatorUsername,
        idEstudio as string,
        idPatient as string,
      );
      return res.json({
        succes: true,
        message: `Estudio ${idEstudio} finalizado correctamente`,
      });
    } catch (error) {
      next(error);
    }
  },

  async transferirPedido(req: Request, res: Response, next: NextFunction) {
    try {
      const operatorUsername = getOperatorUsername(req);
      const { idEstudio } = req.params;

      await guardiaService.transferirPedido(operatorUsername, idEstudio as string);
      return res.json({
        succes: true,
        message: `Estudio ${idEstudio} transferido correctamente`,
      });
    } catch (error) {
      next(error);
    }
  },

  async findPacienteGuardia(req: Request, res: Response, next: NextFunction) {
    try {
      const operatorUsername = getOperatorUsername(req);
      const { dniPaciente } = req.params;

      if (!dniPaciente) {
        throw new AppError("Falta dni para la busqueda", 400);
      }
      if (dniPaciente && typeof dniPaciente !== "string") {
        throw new AppError("Formato de documento inválido", 400);
      }

      const paciente =
        await guardiaService.buscarDatosPacienteGuardia(operatorUsername, dniPaciente);

      if (!paciente) {
        throw new AppError(
          "Paciente no encontrado",
          404,
          "No se encontro paciente con el DNI especificado",
        );
      }

      return res.json(paciente);
    } catch (error) {
      next(error);
    }
  },
};
