import { NextFunction, Request, Response } from "express";
import { IPedidoGuardia } from "./guardia.types";
import { AppError } from "../../errors/AppError";
import { guardiaService } from "./utils/guardia.factory";
import { loginGuardiaAuth } from "./guardia.auth.service";

export const guardiaControler = {
  async loginGuardia(req: Request, res: Response, next: NextFunction) {
    try {
      const login = await loginGuardiaAuth(false);

      if (!login) {
        throw new AppError(
          "Error al iniciar sesión en Guardia",
          500,
          "No se pudo iniciar sesión en el sistema de Guardia",
        );
      }
      return res.json({
        success: true,
        message: "Sesion iniciada correctamente en",
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
      const { fecha } = req.query;

      if (fecha && typeof fecha !== "string") {
        throw new AppError("Formato de fecha inválido", 400);
      }
      const pedidos = await guardiaService.obtenerPedidosGuardia(fecha);
      return res.json(pedidos);
    } catch (error) {
      next(error);
    }
  },

  async getPedidosPaciente(req: Request, res: Response, next: NextFunction) {
    try {
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
        await guardiaService.obtenerPedidosPaciente(idPatient);

      return res.json(pedidosPaciente);
    } catch (error) {
      next(error);
    }
  },

  async finalizarPedido(req: Request, res: Response, next: NextFunction) {
    try {
      const { idEstudio, idPatient } = req.params;

      await guardiaService.finalizarPedido(
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

  async findPacienteGuardia(req: Request, res: Response, next: NextFunction) {
    try {
      const { dniPaciente } = req.params;

      if (!dniPaciente) {
        throw new AppError("Falta dni para la busqueda", 400);
      }
      if (dniPaciente && typeof dniPaciente !== "string") {
        throw new AppError("Formato de documento inválido", 400);
      }

      const paciente =
        await guardiaService.buscarDatosPacienteGuardia(dniPaciente);

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
