import {
  IDatosPacienteGuardia,
  IDetallePedidoGuardia,
  IPedidoGuardia,
} from "./guardia.types";

export interface GuardiaService {
  obtenerPedidosGuardia(fecha?: string): Promise<IPedidoGuardia[]>;
  obtenerPedidosPaciente(idPaciente: string): Promise<IDetallePedidoGuardia[]>;
  finalizarPedido(idEstudio: string, idPatient: string): Promise<string>;
  buscarDatosPacienteGuardia(dni: string): Promise<IDatosPacienteGuardia>;
}
