import { InternoService } from "./interno.service";
import estudiosData from "../../data/prestaciones.json";
import {
  IEstudioConfig,
  IPacienteInterno,
  IResultadoLote,
} from "./interno.types";
import { AppError } from "../../errors/AppError";
import datosPaciente from "../../mocks/pacienteInterno.json" with { type: "json" };

export const mockInternoService: InternoService = {
  async crearLoteConsumos(idPaciente, idCobertura, items, sistema) {
    const idConsumo: string = "9999";
    let resultadoLote: IResultadoLote[] = [];
    if (!items) {
      throw new AppError("Falta enviar consumos");
    }
    let count = 0;
    for (const item of items) {
      count += resultadoLote.push({
        exito: count % 2 == 0 ? true : false,
        prestacion: item.descripcion,
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { consumoId: idConsumo, resultados: resultadoLote };
  },

  async obtenerPrestaciones() {
    return estudiosData.filter((e) => e.visible !== false) as IEstudioConfig[];
  },

  async buscarPacienteInterno(numeroId, esHc) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return datosPaciente as unknown as IPacienteInterno;
  },
};
