import {
  IConfigSistema,
  IConsumoItem,
  IEstudioConfig,
  IPacienteInternado,
  IPacienteInterno,
  IResultadoLote,
} from "./interno.types";

export interface InternoService {
  obtenerPrestaciones(): Promise<IEstudioConfig[]>;

  crearLoteConsumos(
    idPaciente: string,
    idCobertura: string,
    items: IConsumoItem[],
    sistema: IConfigSistema,
  ): Promise<{ consumoId: string; resultados: IResultadoLote[] }>;

  buscarPacienteInterno(
    numeroId: string,
    esHc: boolean,
  ): Promise<IPacienteInterno | null>;

  getPacientesInternados(): Promise<IPacienteInternado[]>;
}
