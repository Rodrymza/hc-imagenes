import { Router } from "express";
import { internacionController } from "./internacion.controller";

const internacionRoutes = Router();

internacionRoutes.get("/", internacionController.obtenerPedidosInternacion);
export default internacionRoutes;
