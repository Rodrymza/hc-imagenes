import { Router } from "express";
import { internacionController } from "./internacion.controller.js";

const internacionRoutes = Router();

internacionRoutes.get(
  "/pedidos",
  internacionController.obtenerPedidosInternacion
);
internacionRoutes.post("/comentarios", internacionController.guardarComentario);

export default internacionRoutes;
