import { GuardiaService } from "./guardia.service.js";
import pedidos from "../../mocks/pedidosGuardia.api.json";
import paciente from "../../mocks/pacienteGuardia.json";
import detallePedidos from "../../mocks/pedidosPacienteGuardia.json";
import {
  IDatosPacienteGuardia,
  IDetallePedidoGuardia,
  IPedidoGuardia,
} from "./guardia.types.js";

export const mockGuardiaService: GuardiaService = {
  async obtenerPedidosGuardia(_userId, fecha) {
    const ordenados = pedidos.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );
    return ordenados as unknown as IPedidoGuardia[];
  },
  async buscarDatosPacienteGuardia(_userId, dni: string) {
    return paciente as unknown as IDatosPacienteGuardia;
  },

  async finalizarPedido(_userId, idEstudio, idPatient) {
    return JSON.stringify({
      success: true,
      message: "Pedido finalizado correctamente",
    });
  },
  async obtenerPedidosPaciente(_userId, idPaciente) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    detallePedidos.sort((a, b) => {
      if (a.realizado !== b.realizado) {
        return a.realizado ? 1 : -1;
      }

      return parseFecha(b.fecha).getTime() - parseFecha(a.fecha).getTime();
    });
    return detallePedidos as unknown as IDetallePedidoGuardia[];
  },

  async transferirPedido(_userId, idPedido): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return "Pedido transferido";
  },
};

const parseFecha = (fecha: string) => {
  const [fechaParte, horaParte] = fecha.split(" ");
  const [dia, mes, anio] = fechaParte.split("/").map(Number);
  const [hora, minuto] = horaParte.split(":").map(Number);

  return new Date(anio, mes - 1, dia, hora, minuto);
};
