import { IPedidoInternacion } from "./internacion.types";

export interface InternacionService {
  obtenerPedidos(fecha?: string): Promise<IPedidoInternacion[]>;
}
