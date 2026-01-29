import { AppError } from "../../errors/AppError";
import { internacionApi } from "./internacion.api";
import { getInternacionToken } from "./internacion.auth";
import { mapearPedidoInternacion } from "./internacion.mapper";
import { InternacionService } from "./internacion.service";
import { IServiceResponse } from "../../types/common.types";

export const apiInternacionService: InternacionService = {
  async obtenerPedidos(fecha?: string) {
    // let fechaBusqueda = fecha;
    let fechaBusqueda = fecha;
    if (!fechaBusqueda) {
      const now = new Date();
      const anio = now.getFullYear();
      const mes = (now.getMonth() + 1).toString().padStart(2, "0");
      const dia = now.getDate().toString().padStart(2, "0");

      fechaBusqueda = `${anio}-${mes}-${dia}`;
    }
    const ejecutarRequest = async (forzarTokenNuevo: boolean = false) => {
      const token = await getInternacionToken(forzarTokenNuevo);

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
          Cookie: `token=${token}`,
        },
      });

      return res.data.map(mapearPedidoInternacion);
    };

    try {
      return await ejecutarRequest(false);
    } catch (error: any) {
      // 2. Si falla por autenticación (401), reintentamos UNA vez
      if (error.response?.status === 401) {
        console.warn("⚠️ Token Internación inválido (401). Reintentando...");
        try {
          return await ejecutarRequest(true); // Forzamos renovación
        } catch (error) {
          throw new AppError(
            "No se pudo autenticar con el sistema de Internación.",
            502,
          );
        }
      }

      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        throw new AppError(
          "El sistema hospitalario tarda demasiado en responder.",
          504,
        );
      }

      if (error.response?.status === 404) {
        throw new AppError(
          "No se encontraron pedidos de internación para esa fecha.",
          404,
        );
      }

      if (error.response?.status >= 500) {
        throw new AppError(
          "El sistema de Internación está fuera de servicio temporalmente.",
          502,
        );
      }

      throw error;
    }
  },
  async guardarComentario(
    idEstudio: string,
    idMovimiento: string,
    comentario: string,
    nota: string,
  ): Promise<IServiceResponse<any>> {
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

    const ejecutarRequest = async (forzarTokenNuevo: boolean) => {
      const token = await getInternacionToken(forzarTokenNuevo);
      const res = await internacionApi.post("/hclinica_comentarios", data, {
        headers: {
          Origin: "http://10.101.0.52:3305",
          Referer: "http://10.101.0.52:3305/",
          Cookie: `token=${token}`,
        },
      });
      return res.data;
    };

    try {
      // INTENTO 1
      const resultado = await ejecutarRequest(false);

      return {
        success: true,
        message: `Comentario guardado correctamente: ${comentario}`,
        data: resultado,
      };
    } catch (error: any) {
      // MANEJO DE ERROR 401 (REINTENTO)
      if (error.response?.status === 401) {
        console.warn("⚠️ Token Internación inválido (401). Reintentando...");
        try {
          // INTENTO 2 (Forzando token)
          const resultado = await ejecutarRequest(true);

          return {
            success: true,
            message: `Comentario guardado correctamente (tras reintento): ${comentario}`,
            data: resultado,
          };
        } catch (retryError) {
          // Si falla el segundo intento, lanzamos error específico
          throw new AppError(
            "No se pudo autenticar con el sistema de Internación tras reintentar.",
            502,
          );
        }
      }

      console.error("❌ Error guardando comentario:", error);
      throw new AppError(
        "Ocurrió un error al intentar guardar el comentario en el sistema hospitalario.",
        500,
      );
    }
  },
};
