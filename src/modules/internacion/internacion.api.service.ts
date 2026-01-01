import { internacionApi } from "./internacion.api";
import { getInternacionToken } from "./internacion.auth";
import { mapearPedidoInternacion } from "./internacion.mapper";
import { InternacionService } from "./internacion.service";

export const apiInternacionService: InternacionService = {
  async obtenerPedidos(fecha?: string) {
    const token = await getInternacionToken();

    const res = await internacionApi.get("/hclinica/movimientos/tipo", {
      params: {
        fecha_desde: fecha,
        fecha_hasta: fecha,
        tipo: "ficha_solicitud_estudios_dimagenes",
      },
      headers: {
        Cookie: `token=${token}`,
      },
    });

    return res.data.map(mapearPedidoInternacion);
  },
};
