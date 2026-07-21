import estudios from "../../mocks/internacion.api.json";
import { mapearPedidoInternacion } from "./internacion.mapper.js";
import { InternacionService } from "./internacion.service.js";

export const mockInternacionService: InternacionService = {
  async obtenerPedidos(fecha?: string) {
    return estudios.map(mapearPedidoInternacion);
  },
  async guardarComentario(
    idEstudio,
    idMovimiento,
    comentario,
    nota,
  ): Promise<any> {
    return {
      success: true,
      message: "Comentario guardado correctamente (modo mock): ",
      comentario,
      data: { Comentario: comentario, Nota: nota },
    };
  },
};
