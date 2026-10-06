import { Router } from "express";
import { internoController } from "./interno.controller.js";
import { restringirA } from "../auth/auth.middleware.js";

const internoRoutes = Router();

const soloEscritura = restringirA("ADMIN", "USER", "MAMO");

internoRoutes.get("/login", internoController.comprobarLoginInterno);
internoRoutes.get("/paciente", internoController.findPacienteInterno);
internoRoutes.get("/prestaciones", internoController.getPrestaciones);
internoRoutes.get("/estudios-consumo", internoController.getEstudiosConsumo);
internoRoutes.post(
  "/estudios-consumo",
  soloEscritura,
  internoController.marcarEstudiosConsumo,
);
internoRoutes.get(
  "/pacientes-internados",
  internoController.getPacientesInternados,
);
internoRoutes.get(
  "/paciente/:idPaciente/planillaId",
  internoController.getPlanillaDiaria,
);
internoRoutes.get(
  "/paciente/:idPaciente/sistemaId",
  internoController.getSistemaId,
);
internoRoutes.post(
  "/consumo/:consumoId/detalle",
  soloEscritura,
  internoController.crearConsumoDetalle,
);
internoRoutes.post(
  "/consumo/:consumoId/sistema/:sistemaId/confirmar",
  soloEscritura,
  internoController.confirmarConsumo,
);

internoRoutes.post(
  "/paciente/:idPaciente/lote-consumos",
  soloEscritura,
  internoController.crearLote,
);
export default internoRoutes;
