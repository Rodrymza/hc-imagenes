import { IServiceResponse } from "../../types/common.types";
import { IPedidoInternacion } from "./internacion.types";

export interface InternacionService {
  obtenerPedidos(fecha?: string): Promise<IPedidoInternacion[]>;
  guardarComentario(
    idEstudio: string,
    idMovimiento: string,
    comentario: string,
    nota: string
  ): Promise<IServiceResponse<any>>;
}
