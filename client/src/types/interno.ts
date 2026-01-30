export interface IConsumoItem {
  id: string;
  nombre: string;
  descripcion: string;
  tag: string;
}

export interface ICobertura {
  idCobertura: string;
  nombre: string;
  sigla: string;
  numeroCarnet: string;
  tipo: string;
}

export interface IPacienteInterno {
  idPaciente: string;
  dni: string;
  nombreCompleto: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: Date | null;
  fechaNacimientoString: string;
  edad: number;
  sexo: string;
  domicilio: string;
  contacto: {
    telefono: string;
    email: string;
  };
  coberturas: ICobertura[];
}

export interface IResultadoLote {
  prestacion: string;
  exito: boolean;
  error?: string;
}

export interface IResultadoLoteConsumo {
  success: boolean;
  message: string;
  data: { consumoId: string; resultados: IResultadoLote[] };
}
