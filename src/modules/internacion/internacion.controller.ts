// internacion.controller.ts
import { Request, Response, NextFunction } from "express";
import { internacionService } from "./utils/internacion.factory";

export const internacionController = {
  async obtenerPedidosInternacion(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { fecha } = req.query;

      const pedidos = await internacionService.obtenerPedidos(
        typeof fecha === "string" ? fecha : undefined
      );

      res.json(pedidos);
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
        nota
      );
      return res.json(response);
    } catch (error) {
      next(error);
    }
  },
};
