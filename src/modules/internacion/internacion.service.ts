import { IPedidoInternacion } from "./internacion.types";

export interface InternacionService {
  obtenerPedidos(): Promise<IPedidoInternacion[]>;
}
