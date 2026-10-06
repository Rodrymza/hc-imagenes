export const OrigenEnum = {
  CE: "Consultorio Externo",
  INTERNADO: "Internado",
} as const;
export type OrigenEnum = (typeof OrigenEnum)[keyof typeof OrigenEnum];

export const TurnoEnum = {
  MANANA: "Mañana",
  TARDE: "Tarde",
} as const;
export type TurnoEnum = (typeof TurnoEnum)[keyof typeof TurnoEnum];

export const TipoEstudioEnum = {
  SCREENING_BILATERAL_TOMOSINTESIS: "Screening Bilateral + Tomosíntesis",
  SCREENING_BILATERAL: "Screening Bilateral",
  MAGNIFICACION: "Magnificación",
  COMPRESION_LOCALIZADA: "Compresión Localizada",
  SCREENING_BILATERAL_TOMOSINTESIS_MAGNIFICACION:
    "Screening Bilateral + Tomosíntesis + Magnificación",
  SCREENING_BILATERAL_TOMOSINTESIS_COMPRESION_LOCALIZADA:
    "Screening Bilateral + Tomosíntesis + Compresión Localizada",
  MAMA_RESTANTE: "Mama Restante",
  EKLUND: "Maniobra de Eklund",
  PIEZA_QUIRURGICA: "Pieza Quirúrgica",
  BILATERAL_MAGNIFICACION: "Bilateral + Magnificación",
  BILATERAL_COMPRESION_LOCALIZADA: "Bilateral + Compresión Localizada",
  SUSPENDIDO_INTERRUMPIDO: "Suspendido / Interrumpido",
  MAMOGRAFIA_MASCULINA: "Mamografía Masculina",
} as const;
export type TipoEstudioEnum = (typeof TipoEstudioEnum)[keyof typeof TipoEstudioEnum];

export const MamaEnum = {
  DERECHA: "Mama Derecha",
  IZQUIERDA: "Mama Izquierda",
} as const;
export type MamaEnum = (typeof MamaEnum)[keyof typeof MamaEnum];

export const CuadranteEnum = {
  SUPEROEXTERNO: "Superoexterno",
  SUPEROINTERNO: "Superointerno",
  INFEROEXTERNO: "Inferoexterno",
  INFEROINTERNO: "Inferointerno",
  RETROAREOLAR_AXILAR: "Retroareolar / Axilar",
} as const;
export type CuadranteEnum = (typeof CuadranteEnum)[keyof typeof CuadranteEnum];

export const TIPOS_ESTUDIO: TipoEstudioEnum[] =
  Object.values(TipoEstudioEnum);

export const MAMAS: MamaEnum[] = Object.values(MamaEnum);

export const CUADRANTES: CuadranteEnum[] = Object.values(CuadranteEnum);

export interface IPacienteMamografia {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string | null;
  telefono: string | null;
  email: string | null;
  domicilio: string | null;
}

export interface IContactoPaciente {
  telefono?: string | null;
  email?: string | null;
  domicilio?: string | null;
}

export interface IAnamnesis {
  motivo_consulta?: string | null;
  menarca?: string | null;
  fecha_ultima_menstruacion?: string | null;
  edad_primer_hijo?: string | null;
  cantidad_hijos?: string | null;
  lactancia?: string | null;
  terapia_reemplazo_hormonal?: string | null;
  anticonceptivos_orales?: string | null;
  antecedentes_quirurgicos_mamarios?: string | null;
  antecedentes_quirurgicos_generales?: string | null;
  antecedentes_oncologicos?: string | null;
  radioterapia?: string | null;
  quimioterapia?: string | null;
  antecedentes_heredofamiliares?: string | null;
}

export interface IEstudioMamografia {
  id: number;
  paciente_id: number;
  fecha_estudio: string;
  numero_estudio: string | null;
  turno: TurnoEnum | null;
  origen: OrigenEnum;
  tipo_estudio: string;
  motivo_consulta: string | null;
  menarca: string | null;
  fecha_ultima_menstruacion: string | null;
  edad_primer_hijo: string | null;
  cantidad_hijos: string | null;
  lactancia: string | null;
  terapia_reemplazo_hormonal: string | null;
  anticonceptivos_orales: string | null;
  antecedentes_quirurgicos_mamarios: string | null;
  antecedentes_quirurgicos_generales: string | null;
  antecedentes_oncologicos: string | null;
  radioterapia: string | null;
  quimioterapia: string | null;
  antecedentes_heredofamiliares: string | null;
  registrado_por: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
}

export interface IHallazgoCuadrante {
  id: number;
  estudio_id: number;
  mama: MamaEnum;
  cuadrante: CuadranteEnum | string;
  tipo_hallazgo: string | null;
  observaciones: string | null;
}

export interface IEstudioConHallazgos extends IEstudioMamografia {
  hallazgos: IHallazgoCuadrante[];
}

export interface IEstudioDetalle extends IEstudioConHallazgos {
  paciente: IPacienteMamografia;
}

export interface IHistorialPaciente {
  paciente: IPacienteMamografia;
  estudios: IEstudioConHallazgos[];
  origen: "local" | "intranet" | "manual" | "error";
}

export interface IHallazgoPayload {
  mama: MamaEnum;
  cuadrante: string;
  tipo_hallazgo?: string | null;
  observaciones?: string | null;
}

export interface IEstudioPayload {
  dni: string;
  fecha_estudio?: string;
  turno?: TurnoEnum | null;
  origen: OrigenEnum;
  tipo_estudio: TipoEstudioEnum;
  anamnesis?: IAnamnesis;
  contacto?: IContactoPaciente;
  hallazgos?: IHallazgoPayload[];
}

export interface IEstadisticaRow {
  tipo_estudio: string;
  ce: number;
  internado: number;
  total: number;
}

export interface IEstadisticaFiltros {
  desde: string;
  hasta: string;
  turno?: TurnoEnum | null;
}

export interface IRegistroEstudioRow {
  id: number;
  fecha_estudio: string;
  numero_estudio: string | null;
  turno: TurnoEnum | null;
  origen: OrigenEnum;
  tipo_estudio: string;
  registrado_por: string | null;
  cantidad_hallazgos: number;
  paciente_id: number;
  dni: string;
  apellido: string;
  nombre: string;
}

export interface IFiltrosRegistros {
  q?: string | null;
  desde?: string | null;
  hasta?: string | null;
  turno?: TurnoEnum | null;
  pagina?: number;
  porPagina?: number;
}

export interface IPaginacionRegistros {
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
  items: IRegistroEstudioRow[];
}