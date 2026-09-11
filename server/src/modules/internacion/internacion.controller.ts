// internacion.controller.ts
import { Request, Response, NextFunction } from "express";
import { internacionService } from "./utils/internacion.factory.js";
import {
  enviarMensajesPendientes,
  procesarEstudiosBackend,
} from "./internacion.processor.js";
import {
  getConfigNotificaciones,
  updateConfigNotificaciones,
} from "./internacion.notificaciones.config.js";

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

      res.json(pedidosProcesados);
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

  obtenerConfigNotificaciones(_req: Request, res: Response) {
    res.json(getConfigNotificaciones());
  },

  actualizarConfigNotificaciones(req: Request, res: Response) {
    const config = updateConfigNotificaciones(req.body);
    res.json({ ok: true, config });
  },
};
