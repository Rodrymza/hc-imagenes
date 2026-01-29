import type { IPacienteGuardia } from "@/types/pacientes";
import type { IDetallePedidoGuardia, IPedidoGuardia } from "@/types/pedidos";
import axios from "axios";

export const GuardiaService = {
  loginGuardia: async () => {
    const res = await axios.post("api/guardia/login");
    return res.data;
  },

  getPedidos: async (fecha?: string): Promise<IPedidoGuardia[]> => {
    //formato fecha: YYYY-MM-DD el valor que da el input
    const url = fecha
      ? `/api/guardia/pedidos?fecha=${fecha}`
      : "/api/guardia/pedidos";
    const res = await axios.get(url);
    return res.data;
  },

  getPedidosPaciente: async (dni: string): Promise<IDetallePedidoGuardia[]> => {
    try {
      const paciente = await GuardiaService.buscarPacienteGuardia(
        dni.toString(),
      );

      if (!paciente || !paciente.idPatient) {
        throw new Error("Paciente no encontrado o sin ID válido");
      }

      const res = await axios.get(
        `/api/guardia/paciente/${paciente.idPatient}/pedidos`,
      );

      return res.data;
    } catch (error) {
      console.error("Error orquestando búsqueda de pedidos:", error);
      throw error;
    }
  },

  finalizarPedidoPorDni: async (
    idEstudio: string,
    dni: string | number,
  ): Promise<any> => {
    try {
      const paciente = await GuardiaService.buscarPacienteGuardia(
        dni.toString(),
      );

      if (!paciente || !paciente.idPatient) {
        throw new Error(
          "No se pudo identificar al paciente para finalizar el estudio.",
        );
      }

      const res = await axios.put(
        `/api/guardia/paciente/${paciente.idPatient}/estudio/${idEstudio}/finalizar`,
      );

      return res.data;
    } catch (error) {
      console.error("Error en servicio finalizarPedidoPorDni:", error);
      throw error;
    }
  },

  buscarPacienteGuardia: async (
    dniPaciente: string,
  ): Promise<IPacienteGuardia> => {
    const res = await axios.get(`/api/guardia/paciente/${dniPaciente}`);
    return res.data;
  },
};
