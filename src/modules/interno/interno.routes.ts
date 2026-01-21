import { Router } from "express";
import { internoController } from "./interno.controller";

const internoRoutes = Router();

internoRoutes.get("/login", internoController.comprobarLoginInterno);
internoRoutes.get("/paciente", internoController.findPacienteInterno);
internoRoutes.get("/prestaciones", internoController.getPrestaciones);
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
  internoController.crearConsumoDetalle,
);
internoRoutes.post(
  "/consumo/:consumoId/sistema/:sistemaId/confirmar",
  internoController.confirmarConsumo,
);

internoRoutes.post(
  "/paciente/:idPaciente/lote-consumos",
  internoController.crearLote,
);
export default internoRoutes;
