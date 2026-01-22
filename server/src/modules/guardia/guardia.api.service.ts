import { isAxiosError } from "axios";
import { AppError } from "../../errors/AppError";
import { guardiaApi } from "./guardia.api";
import { getGuardiaToken } from "./guardia.auth.service";
import {
  cleanDetallePedidoGuardia,
  cleanPedidoListaHsi,
} from "./guardia.mapper";
import {
  IDetallePedidoGuardia,
  IHsiPagedResponse,
  IHsiRawPedido,
  IHsiSearchResult,
  IPedidoGuardia,
  IRawDetallePedido,
} from "./guardia.types";

const username = process.env.GUARDIA_USER!;
const password = process.env.GUARDIA_PASS!;

export const apiGuardiaService = {
  async obtenerPedidosGuardia(fecha?: string): Promise<IPedidoGuardia[]> {
    const token = await getGuardiaToken(username, password);
    const url = crearUrlPedidosGuardia(fecha);

    const response = await guardiaApi.get<IHsiPagedResponse<IHsiRawPedido>>(
      url,
      {
        headers: {
          Cookie: `token=${token}`,
          Referer: `https://hsi.mendoza.gov.ar/institucion/108/imagenes/lista-trabajos/`,
        },
      },
    );

    const pedidos = response.data.content;
    return pedidos.map((pedido) => cleanPedidoListaHsi(pedido));
  },

  async obtenerPedidosPaciente(
    idPaciente: string,
  ): Promise<IDetallePedidoGuardia[]> {
    const token = await getGuardiaToken(username, password);
    const url = `/api/institutions/108/patient/${idPaciente}/service-requests/studyOrder`;

    const response = await guardiaApi.get<IRawDetallePedido[]>(url, {
      headers: {
        Cookie: `token=${token}`,
      },
    });

    return response.data.map((pedido) => cleanDetallePedidoGuardia(pedido));
  },

  async finalizarPedido(
    idEstudio: string,
    idPatient: string,
  ): Promise<boolean> {
    try {
      const token = await getGuardiaToken(username, password);
      const url = `https://hsi.mendoza.gov.ar/api/institutions/108/patient/${idPatient}/service-requests/${idEstudio}/complete`;
      const body = { observations: "Realizado" };

      const config = {
        headers: {
          Origin: "https://hsi.mendoza.gov.ar",
          Referer: `https://hsi.mendoza.gov.ar/institucion/108/paciente/${idPatient}/estudios`,
          Cookie: `token=${token}`,
        },
      };

      const response = await guardiaApi.put(url, body, config);

      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        const data = error.response.data;

        const hsiMessage =
          Array.isArray(data.errors) && data.errors.length > 0
            ? data.errors[0]
            : "No se puede completar el estudio en este momento.";

        throw new AppError("Error al finalizar el estudio", 400, hsiMessage);
      }

      throw error;
    }
  },

  async buscarDatosPacienteGuardia(dni: string): Promise<IHsiSearchResult> {
    const token = await getGuardiaToken(username, password);
    const filter = {
      identificationNumber: dni,
      identificationTypeId: 1,
    };

    const response = await guardiaApi.get("/api/patient/optionalfilter", {
      params: {
        searchFilterStr: JSON.stringify(filter), // Axios lo codificará automáticamente
        pageSize: 5,
        pageNumber: 0,
      },
      headers: {
        Referer: "https://hsi.mendoza.gov.ar/institucion/108/ambulatoria",
        Cookie: `token=${token}`,
      },
    });

    return response.data.content[0];
  },
};

function crearUrlPedidosGuardia(fecha?: string): string {
  let fechaParaFiltro;

  if (fecha) {
    const [year, month, day] = fecha.split("-").map(Number);
    fechaParaFiltro = new Date(year, month - 1, day);
  } else {
    fechaParaFiltro = new Date();
  }

  const fromDate = new Date(fechaParaFiltro);
  fromDate.setDate(fechaParaFiltro.getDate() - 1);
  fromDate.setHours(18, 0, 0);

  const toDate = new Date(fechaParaFiltro);
  toDate.setHours(23, 59, 59);

  const baseUrl =
    "/api/institutions/108/image-service-request-work-list?pageNumber=0&pageSize=50&filter=";

  const filter = {
    from: {
      date: {
        year: fromDate.getFullYear(),
        month: fromDate.getMonth() + 1,
        day: fromDate.getDate(),
      },
      time: {
        hours: fromDate.getHours(),
        minutes: fromDate.getMinutes(),
        seconds: fromDate.getSeconds(),
      },
    },
    to: {
      date: {
        year: toDate.getFullYear(),
        month: toDate.getMonth() + 1,
        day: toDate.getDate(),
      },
      time: {
        hours: toDate.getHours(),
        minutes: toDate.getMinutes(),
        seconds: toDate.getSeconds(),
      },
    },
    notRequiresTransfer: false,
    requiresTransfer: false,
    sourceTypeIds: [],
    studyTypeIds: [],
    temporaryPatient: false,
    wlStatusIds: [1],
    studyConcept: null,
  };
  return baseUrl + encodeURIComponent(JSON.stringify(filter));
}
