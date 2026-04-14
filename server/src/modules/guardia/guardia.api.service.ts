import { isAxiosError } from "axios";
import { AppError } from "../../errors/AppError";
import { guardiaApi } from "./guardia.api";
import {
  cleanDetallePedidoGuardia,
  cleanPacienteGuardia,
  cleanPedidoListaHsi,
} from "./guardia.mapper";
import {
  IDetallePedidoGuardia,
  IHsiPagedResponse,
  IHsiRawPedido,
  IPedidoGuardia,
  IRawDetallePedido,
} from "./guardia.types";
import { GuardiaService } from "./guardia.service";
import { ejecutarPeticionInterna } from "../commonUtils";
import { loginGuardiaAuth } from "./guardia.auth.service";

export const apiGuardiaService: GuardiaService = {
  async obtenerPedidosGuardia(fecha?: string): Promise<IPedidoGuardia[]> {
    return ejecutarPeticionInterna(
      "Obtener Pedidos de Guardia",
      async (forzar) => {
        await loginGuardiaAuth(forzar);
      },
      async () => {
        const url = crearUrlPedidosGuardia(fecha);

        const response = await guardiaApi.get<IHsiPagedResponse<IHsiRawPedido>>(
          url,
          {
            headers: {
              Referer: `https://hsi.mendoza.gov.ar/institucion/108/imagenes/lista-trabajos/`,
            },
          },
        );

        const pedidos = response.data.content;
        const pedidosLimpios: IPedidoGuardia[] = pedidos.map((pedido) =>
          cleanPedidoListaHsi(pedido),
        );

        return [
          ...pedidosLimpios.sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
          ),
        ];
      },
    );
  },

  async obtenerPedidosPaciente(
    idPaciente: string,
  ): Promise<IDetallePedidoGuardia[]> {
    return ejecutarPeticionInterna(
      `Obtener Pedidos de Guardia de paciente ${idPaciente}`,
      async (forzar) => {
        await loginGuardiaAuth(forzar);
      },
      async () => {
        const url = `/api/institutions/108/patient/${idPaciente}/service-requests/studyOrder`;

        const response = await guardiaApi.get<IRawDetallePedido[]>(url);

        const pedidosLimpios = response.data.map((pedido) =>
          cleanDetallePedidoGuardia(pedido),
        );

        pedidosLimpios.sort((a, b) => {
          if (a.realizado !== b.realizado) {
            return a.realizado ? 1 : -1; // false primero
          }

          return parseFecha(b.fecha).getTime() - parseFecha(a.fecha).getTime();
        });
        return pedidosLimpios;
      },
    );
  },

  async finalizarPedido(idEstudio: string, idPatient: string): Promise<string> {
    return ejecutarPeticionInterna(
      `Finalizando pedido de Guardia ${idEstudio}, Paciente ${idPatient}`,
      async (forzar) => {
        await loginGuardiaAuth(forzar);
      },
      async () => {
        try {
          const url = `https://hsi.mendoza.gov.ar/api/institutions/108/patient/${idPatient}/service-requests/${idEstudio}/complete`;
          const body = { observations: "Realizado" };

          const config = {
            headers: {
              Origin: "https://hsi.mendoza.gov.ar",
              Referer: `https://hsi.mendoza.gov.ar/institucion/108/paciente/${idPatient}/estudios`,
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

            throw new AppError(
              "Error al finalizar el estudio",
              400,
              hsiMessage,
            );
          }

          throw error;
        }
      },
    );
  },

  async transferirPedido(idEstudio: string): Promise<string> {
    return ejecutarPeticionInterna(
      `Transfiriendo pedido de Guardia ${idEstudio}}`,
      async (forzar) => {
        await loginGuardiaAuth(forzar);
      },
      async () => {
        try {
          const url = `https://hsi.mendoza.gov.ar/api/institutions/108/image-service-request-work-list/${idEstudio}/change-state?diagnosticReportId=${idEstudio}&requestOrderStateId=2`;

          const config = {
            headers: {
              Origin: "https://hsi.mendoza.gov.ar",
              Referer: `https://hsi.mendoza.gov.ar/institucion/108/imagenes/lista-trabajos`,
            },
          };

          const response = await guardiaApi.put(url, config);

          return response.data;
        } catch (error) {
          if (isAxiosError(error) && error.response) {
            const data = error.response.data;

            const hsiMessage =
              Array.isArray(data.errors) && data.errors.length > 0
                ? data.errors[0]
                : "No se puede transferir el estudio en este momento.";

            throw new AppError(
              "Error al finalizar el estudio",
              400,
              hsiMessage,
            );
          }

          throw error;
        }
      },
    );
  },

  async buscarDatosPacienteGuardia(dni: string) {
    return ejecutarPeticionInterna(
      `Buscando datos en Guardia para Paciente DNI: ${dni}`,
      async (forzar) => {
        await loginGuardiaAuth(forzar);
      },
      async () => {
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
          },
        });

        const rawPatient = response.data.content[0];
        return cleanPacienteGuardia(rawPatient);
      },
    );
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
    wlStatusIds: [],
    studyConcept: null,
    lastname: "oros",
  };
  return baseUrl + encodeURIComponent(JSON.stringify(filter));
}

const parseFecha = (fecha: string) => {
  const [fechaParte, horaParte] = fecha.split(" ");
  const [dia, mes, anio] = fechaParte.split("/").map(Number);
  const [hora, minuto] = horaParte.split(":").map(Number);

  return new Date(anio, mes - 1, dia, hora, minuto);
};
