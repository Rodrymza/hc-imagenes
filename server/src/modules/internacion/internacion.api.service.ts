import { internacionApi } from "./internacion.api";
import { mapearPedidoInternacion } from "./internacion.mapper";
import { InternacionService } from "./internacion.service";
import { IServiceResponse } from "../../types/common.types";
import { loginInternacion } from "./internacion.auth.service";
import { ejecutarPeticionInterna } from "../commonUtils";

export const apiInternacionService: InternacionService = {
  async obtenerPedidos(fecha?: string) {
    return ejecutarPeticionInterna(
      "Obtener Pedidos de Internacion",
      async (forzar) => {
        await loginInternacion(forzar);
      },
      async () => {
        const fechaBusqueda = fecha || new Date().toISOString().split("T")[0];

        const res = await internacionApi.get("/hclinica/movimientos/tipo", {
          //Falta armar la fecha para solicitud de envio
          params: {
            fecha_desde: fechaBusqueda,
            fecha_hasta: fechaBusqueda,
            tipo: "ficha_solicitud_estudios_dimagenes",
          },
          headers: {
            Origin: "http://10.101.0.52:3305",
            Referer: "http://10.101.0.52:3305/",
          },
        });

        return res.data.map(mapearPedidoInternacion);
      },
    );
  },
  async guardarComentario(
    idEstudio: string,
    idMovimiento: string,
    comentario: string,
    nota: string,
  ): Promise<IServiceResponse<any>> {
    return ejecutarPeticionInterna(
      "Guardar Comentario en Internacion",
      async (forzar) => {
        await loginInternacion(forzar);
      },
      async () => {
        // TU LÓGICA ORIGINAL INTACTA
        let data: any = {
          movimiento_id: idEstudio,
          comentario: {
            dimagenes: comentario,
            enfermeria: nota,
          },
          __v: 0,
        };

        if (idMovimiento && idMovimiento !== "null") {
          data.id = idMovimiento;
          data._id = idMovimiento;
        }

        const res = await internacionApi.post("/hclinica_comentarios", data, {
          headers: {
            Origin: "http://10.101.0.52:3305",
            Referer: "http://10.101.0.52:3305/",
            "Content-Type": "application/json",
          },
        });
        return res.data;
      },
    );
  },
};
