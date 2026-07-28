import { Router } from "express";
import { internacionController } from "./internacion.controller.js";
import { modoAdministrador } from "../auth/auth.middleware.js";

const internacionRoutes = Router();

internacionRoutes.get(
  "/pedidos",
  internacionController.obtenerPedidosInternacion,
);
internacionRoutes.post("/comentarios", internacionController.guardarComentario);

internacionRoutes.get(
  "/notificaciones/config",
  internacionController.obtenerConfigNotificaciones,
);
internacionRoutes.put(
  "/notificaciones/config",
  modoAdministrador,
  internacionController.actualizarConfigNotificaciones,
);

export default internacionRoutes;
