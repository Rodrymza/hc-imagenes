import { Router } from "express";
import { guardiaControler } from "./guardia.controller";

const guardiaRoutes = Router();

guardiaRoutes.post("/login", guardiaControler.loginGuardia);
guardiaRoutes.get("/", guardiaControler.getPedidosGuardia);
guardiaRoutes.get("/:idPaciente", guardiaControler.getPedidosPaciente);
guardiaRoutes.put(
  "/:idPaciente/estudio/:idEstudio/finalizar",
  guardiaControler.finalizarPedido
);

export default guardiaRoutes;
