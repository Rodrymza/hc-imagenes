import { Router } from "express";
import { internacionController } from "./internacion.controller";

const internacionRoutes = Router();

internacionRoutes.get(
  "/pedidos",
  internacionController.obtenerPedidosInternacion
);
internacionRoutes.post("/comentarios", internacionController.guardarComentario);

export default internacionRoutes;
