import { IServiceResponse } from "../../types/common.types.js";
import { IPedidoInternacion } from "./internacion.types.js";

export interface InternacionService {
  obtenerPedidos(fecha?: string): Promise<IPedidoInternacion[]>;
  guardarComentario(
    idEstudio: string,
    idMovimiento: string,
    comentario: string,
    nota: string
  ): Promise<IServiceResponse<any>>;
}
