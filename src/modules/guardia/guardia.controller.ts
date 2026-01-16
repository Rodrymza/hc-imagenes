import { NextFunction, Request, Response } from "express";
import { getGuardiaToken } from "./guardia.auth";
import { IloginRequest, ILoginResponse } from "../../types/login.types";
import { IPedidoGuardia } from "./guardia.types";
import { apiGuardiaService } from "./guardia.api.service";
import { AppError } from "../../errors/AppError";

export const guardiaControler = {
  async loginGuardia(
    req: Request<IloginRequest>,
    res: Response<ILoginResponse>,
    next: NextFunction
  ) {
    try {
      //const { username, password } = req.body;
      const username = process.env.GUARDIA_USER!;
      const password = process.env.GUARDIA_PASS!;
      const token = await getGuardiaToken(username, password, false);
      return res.json({
        token: token,
        success: true,
        message: "Token obtenido con éxito",
      });
    } catch (error) {
      next(error);
    }
  },

  async getPedidosGuardia(
    req: Request,
    res: Response<IPedidoGuardia[]>,
    next: NextFunction
  ) {
    try {
      const { fecha } = req.query;

      if (fecha && typeof fecha !== "string") {
        throw new AppError("Formato de fecha inválido", 400);
      }
      const pedidos = await apiGuardiaService.obtenerPedidosGuardia(fecha);
      return res.json(pedidos);
    } catch (error) {
      next(error);
    }
  },

  async getPedidosPaciente(req: Request, res: Response, next: NextFunction) {
    try {
      const { idPaciente } = req.params;

      if (idPaciente && typeof idPaciente !== "string") {
        throw new AppError("Formato de fecha inválido", 400);
      }
      if (!idPaciente) {
        throw new AppError(
          "Falta ID del paciente para obtener los pedidos",
          400
        );
      }
      const pedidosPaciente = await apiGuardiaService.obtenerPedidosPaciente(
        idPaciente
      );

      return res.json(pedidosPaciente);
    } catch (error) {
      next(error);
    }
  },

  async finalizarPedido(req: Request, res: Response, next: NextFunction) {
    try {
      const { idEstudio, idPaciente } = req.params;
      await apiGuardiaService.finalizarPedido(idEstudio, idPaciente);
      return res.json({
        succes: true,
        message: `Estudio ${idEstudio} finalizado correctamente`,
      });
    } catch (error) {
      next(error);
    }
  },
};
