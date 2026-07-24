import { Router } from "express";
import { guardiaControler } from "./guardia.controller.js";

const guardiaRoutes = Router();

guardiaRoutes.post("/login", guardiaControler.loginGuardia);
guardiaRoutes.post("/logout", guardiaControler.logoutGuardia);
guardiaRoutes.get("/hsi-status", guardiaControler.hsiStatus);
guardiaRoutes.get("/pedidos", guardiaControler.getPedidosGuardia);
guardiaRoutes.get(
  "/paciente/:idPatient/pedidos",
  guardiaControler.getPedidosPaciente,
);
guardiaRoutes.put(
  "/paciente/:idPatient/estudio/:idEstudio/finalizar",
  guardiaControler.finalizarPedido,
);
guardiaRoutes.post(
  "/estudio/:idEstudio/transferir",
  guardiaControler.transferirPedido,
);
guardiaRoutes.get(
  "/paciente/:dniPaciente/",
  guardiaControler.findPacienteGuardia,
);

export default guardiaRoutes;
