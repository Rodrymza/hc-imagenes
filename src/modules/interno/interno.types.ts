export interface ICoberturaRaw {
  coberturaid: string;
  nombre: string;
  sigla: string;
  carnetnumero: string;
  tipobeneficiarionombre: string;
}

export interface IPacienteInternoRaw {
  pacienteid: string; // "00000207677"
  numerodocumento: string; // "36499229"
  apellido1: string; // "RAMIREZ"
  apellido2: string | null;
  nombre1: string; // "RODRIGO"
  nombre2: string | null; // "EDUARDO"
  fechanacimiento: string; // "07-09-1991"
  sexoid: string; // "M"
  domicilio: string;
  localidadnombre: string;
  telefonocasa: string | null;
  telefonocasaprefijo: string | null;
  telefonocelular: string | null;
  telefonocelularprefijo: string | null;
  email: string | null;
  coberturas: ICoberturaRaw[] | ICoberturaRaw; // Puede ser array u objeto si es uno solo
}

export interface ICoberturaClean {
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
  coberturas: ICoberturaClean[];
}

export const SistemaConsumoInterno = {
  guardia: {
    letraServicio: "G",
    servicioId: "0002",
  },
  internacion: {
    letraServicio: "I",
    servicioId: "0003",
  },
  ambulatorio: {
    letraServicio: "A",
    servicioId: "0001",
  },
};
export type TipoSistemaKey = keyof typeof SistemaConsumoInterno;
export type IConfigSistema = (typeof SistemaConsumoInterno)[TipoSistemaKey];

export interface IEstudioConfig {
  id: string; // El código (ej: EX-1.340213)
  nombre: string; // El nombre EXACTO que pide el sistema legacy
  descripcion: string; // El nombre bonito para mostrar en el Frontend
  tag?: string; // Para buscador (ej: "codo")
  exposiciones?: number; // Cantidad de placas (útil para UI)
  visible?: boolean; // Para ocultar estudios viejos o raros
}

export interface IConsumoItem {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface IResultadoLote {
  prestacion: string;
  exito: boolean;
  error?: string;
}
