// internacion.controller.ts
import { Request, Response, NextFunction } from "express";
import { internacionService } from "./utils/internacion.factory";
import { procesarEstudiosBackend } from "./internacion.processor";

export const internacionController = {
  async obtenerPedidosInternacion(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { fecha } = req.query;

      const pedidos = await internacionService.obtenerPedidos(
        typeof fecha === "string" ? fecha : undefined,
      );
      const pedidosProcesados = await procesarEstudiosBackend(pedidos);

      console.log("Mensajes para enviar:", pedidosProcesados?.mensajesAEnviar);
      res.json(pedidosProcesados?.estudios);
    } catch (error) {
      next(error);
    }
  },

  async guardarComentario(req: Request, res: Response, next: NextFunction) {
    try {
      const { idEstudio, idMovimiento, comentario, nota } = req.body;

      const response = await internacionService.guardarComentario(
        idEstudio,
        idMovimiento,
        comentario,
        nota,
      );
      return res.json(response);
    } catch (error) {
      next(error);
    }
  },
};
