import { NextFunction, Request, Response } from "express";
import { IPedidoGuardia } from "./guardia.types.js";
import { AppError } from "../../errors/AppError.js";
import { guardiaService } from "./utils/guardia.factory.js";
import { loginCon2FA, logoutHsi } from "./guardia.auth.service.js";

export const guardiaControler = {
  async loginGuardia(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any)?.username;
      if (!userId) {
        throw new AppError("No se pudo identificar al usuario", 401);
      }

      const { hsiUser, hsiPass, totpCode } = req.body;

      if (!hsiUser || !hsiPass || !totpCode) {
        throw new AppError(
          "Faltan credenciales de HSI",
          400,
          "Se requiere hsiUser, hsiPass y totpCode",
        );
      }

      const result = await loginCon2FA(userId, hsiUser, hsiPass, totpCode);

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
      const userId = (req.user as any)?.username;
      if (!userId) {
        throw new AppError("No se pudo identificar al usuario", 401);
      }

      logoutHsi(userId);

      return res.json({
        success: true,
        message: "Sesión HSI cerrada",
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
      const userId = (req.user as any)?.username;
      const { fecha } = req.query;

      if (fecha && typeof fecha !== "string") {
        throw new AppError("Formato de fecha inválido", 400);
      }
      const pedidos = await guardiaService.obtenerPedidosGuardia(
        userId,
        fecha,
      );
      return res.json(pedidos);
    } catch (error) {
      next(error);
    }
  },

  async getPedidosPaciente(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any)?.username;
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
        await guardiaService.obtenerPedidosPaciente(userId, idPatient);

      return res.json(pedidosPaciente);
    } catch (error) {
      next(error);
    }
  },

  async finalizarPedido(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any)?.username;
      const { idEstudio, idPatient } = req.params;

      await guardiaService.finalizarPedido(
        userId,
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
      const userId = (req.user as any)?.username;
      const { idEstudio } = req.params;

      await guardiaService.transferirPedido(userId, idEstudio as string);
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
      const userId = (req.user as any)?.username;
      const { dniPaciente } = req.params;

      if (!dniPaciente) {
        throw new AppError("Falta dni para la busqueda", 400);
      }
      if (dniPaciente && typeof dniPaciente !== "string") {
        throw new AppError("Formato de documento inválido", 400);
      }

      const paciente =
        await guardiaService.buscarDatosPacienteGuardia(userId, dniPaciente);

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
