import type {
  IConsumoItem,
  IPacienteInterno,
  IResultadoLoteConsumo,
} from "@/types/interno";
import axios from "axios";

export const InternoService = {
  getPrestaciones: async (): Promise<IConsumoItem[]> => {
    const res = await axios.get("/api/interno/prestaciones");
    return res.data;
  },

  buscarPacienteInterno: async (
    dni: string | null,
    hc: string | null,
  ): Promise<IPacienteInterno> => {
    const baseUrl = "/api/interno/paciente";
    const params = new URLSearchParams();

    if (dni) params.append("dni", dni);
    if (hc) params.append("hc", hc);

    const url = `${baseUrl}?${params.toString()}`;

    const res = await axios.get(url);
    return res.data;
  },

  registrarConsumos: async (
    idPaciente: string,
    idCobertura: string,
    sistema: string,
    consumos: IConsumoItem[],
  ): Promise<IResultadoLoteConsumo> => {
    const url = `/api/interno/paciente/${idPaciente}/lote-consumos`;
    const body = {
      idCobertura: idCobertura,
      sistema: sistema,
      consumos: consumos,
    };

    const res = await axios.post(url, body);

    return res.data;
    //sistema responde con message y data(reporte)
  },
};
