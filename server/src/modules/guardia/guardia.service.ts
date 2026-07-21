import {
  IDatosPacienteGuardia,
  IDetallePedidoGuardia,
  IPedidoGuardia,
} from "./guardia.types.js";

export interface GuardiaService {
  obtenerPedidosGuardia(
    userId: string,
    fecha?: string,
  ): Promise<IPedidoGuardia[]>;
  obtenerPedidosPaciente(
    userId: string,
    idPaciente: string,
  ): Promise<IDetallePedidoGuardia[]>;
  finalizarPedido(
    userId: string,
    idEstudio: string,
    idPatient: string,
  ): Promise<string>;
  transferirPedido(userId: string, idEstudio: string): Promise<string>;
  buscarDatosPacienteGuardia(
    userId: string,
    dni: string,
  ): Promise<IDatosPacienteGuardia>;
}
