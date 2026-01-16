import { Router } from "express";
import { internacionController } from "./internacion.controller";

const internacionRoutes = Router();

internacionRoutes.get("/", internacionController.obtenerPedidosInternacion);
internacionRoutes.post("/comentario", internacionController.guardarComentario);

export default internacionRoutes;
