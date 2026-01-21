import { Router } from "express";
import { guardiaControler } from "./guardia.controller";

const guardiaRoutes = Router();

guardiaRoutes.post("/login", guardiaControler.loginGuardia);
guardiaRoutes.get("/pedidos", guardiaControler.getPedidosGuardia);
guardiaRoutes.get(
  "/paciente/:idPatient/pedidos",
  guardiaControler.getPedidosPaciente,
);
guardiaRoutes.put(
  "/paciente/:idPatient/estudio/:idEstudio/finalizar",
  guardiaControler.finalizarPedido,
);
guardiaRoutes.get(
  "/paciente/:dniPaciente/",
  guardiaControler.findPacienteGuardia,
);

export default guardiaRoutes;
