import { GuardiaService } from "./guardia.service";
import pedidos from "../../mocks/pedidosGuardia.api.json" with { type: "json" };
import paciente from "../../mocks/pacienteGuardia.json" with { type: "json" };
import detallePedidos from "../../mocks/pedidosPacienteGuardia.json" with { type: "json" };
import {
  IDatosPacienteGuardia,
  IDetallePedidoGuardia,
  IPedidoGuardia,
} from "./guardia.types";

export const mockGuardiaService: GuardiaService = {
  async obtenerPedidosGuardia(fecha) {
    // Si el JSON ya tiene el formato IPedidoGuardia, lo devolvemos directo
    const ordenados = pedidos.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );
    return ordenados as unknown as IPedidoGuardia[];
  },
  async buscarDatosPacienteGuardia(dni: string) {
    return paciente as unknown as IDatosPacienteGuardia;
  },

  async finalizarPedido(idEstudio, idPatient) {
    return JSON.stringify({
      success: true,
      message: "Pedido finalizado correctamente",
    });
  },
  async obtenerPedidosPaciente(idPaciente) {
    detallePedidos.sort((a, b) => {
      if (a.realizado !== b.realizado) {
        return a.realizado ? 1 : -1; // false primero
      }

      return parseFecha(b.fecha).getTime() - parseFecha(a.fecha).getTime();
    });
    return detallePedidos as unknown as IDetallePedidoGuardia[];
  },
};

const parseFecha = (fecha: string) => {
  const [fechaParte, horaParte] = fecha.split(" ");
  const [dia, mes, anio] = fechaParte.split("/").map(Number);
  const [hora, minuto] = horaParte.split(":").map(Number);

  return new Date(anio, mes - 1, dia, hora, minuto);
};
