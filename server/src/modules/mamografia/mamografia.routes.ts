import { Router } from "express";
import { mamografiaController } from "./mamografia.controller.js";
import {
  restringirA,
  puedeEliminarEstudio,
} from "../auth/auth.middleware.js";

const mamografiaRoutes = Router();

const soloCarga = restringirA("ADMIN", "MAMO");

mamografiaRoutes.get(
  "/paciente",
  mamografiaController.getPacienteConHistorial,
);
mamografiaRoutes.post("/paciente", soloCarga, mamografiaController.crearPacienteManual);
mamografiaRoutes.get(
  "/paciente/:id/historial",
  mamografiaController.getHistorial,
);
mamografiaRoutes.put(
  "/paciente/:id",
  soloCarga,
  mamografiaController.actualizarPaciente,
);
mamografiaRoutes.get("/estudios/:id", mamografiaController.getEstudio);
mamografiaRoutes.post("/estudios", soloCarga, mamografiaController.crearEstudio);
mamografiaRoutes.delete(
  "/estudios/:id",
  puedeEliminarEstudio,
  mamografiaController.eliminarEstudio,
);
mamografiaRoutes.get("/registros", mamografiaController.getRegistros);
mamografiaRoutes.get("/estadisticas", mamografiaController.getEstadisticas);

export default mamografiaRoutes;