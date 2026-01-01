import estudios from "../../mocks/internacion.api.json" with {type: "json"}
import { mapearPedidoInternacion } from "./internacion.mapper";
import { InternacionService } from "./internacion.service";


export const mockInternacionService: InternacionService = {
  async obtenerPedidos(fecha?: string) {
    return estudios.map(mapearPedidoInternacion);
  },
};
