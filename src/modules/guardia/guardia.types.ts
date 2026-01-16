export interface IDatosPacienteGuardia {
  idPaciente: string;
  dni: string;
  dniString: string;
  apellido: string;
  nombres: string;
  fechaNacimiento: Date;
  fechaNacimientoString: string;
  edad: number | string;
}

export interface IHsiDate {
  year: number;
  month: number;
  day: number;
}

export interface IHsiTime {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface IHsiPagedResponse<T> {
  content: T[];
  totalElementsAmount: number;
}

export interface IHsiRawPedido {
  studyId?: number;
  createdDate?: { date: IHsiDate; time: IHsiTime };
  snomed: { pt: string }[];
  patientDto: {
    id: number;
    lastName: string;
    firstName: string;
    identificationNumber: string;
    gender: { description: string };
    birthDate: IHsiDate;
  };
  patientLocation?: {
    sector: string;
    roomNumber?: string;
    shockroom?: string;
  };
}

export interface IPedidoGuardia {
  idEstudio: number | string;
  fecha: Date | null;
  fechaString: string;
  descripcion: string;
  tipoEstudio: string;
  idPaciente: number | string;
  apellido: string;
  nombre: string;
  dni: number;
  sexo: string;
  fechaNacimiento: Date | null;
  fechaNacimientoString: string;
  edad: number | string;
  ubicacion: string;
}

export interface IRawDetallePedido {
  status: boolean;
  doctor: { id: number; firstName: string; lastName: string };
  creationDate: string; // Formato ISO: "2026-01-16T03:14:26.672Z"
  snomed: string;
  healthCondition: string;
  source: string;
  isAvailableInPACS: boolean;
  serviceRequestId: number;
  diagnosticReportId: number;
  hasActiveAppointment: boolean;
  observationsFromServiceRequest: string;
  isInProgress: boolean;
}

export interface IDetallePedidoGuardia {
  idEstudio: string;
  fecha: string;
  pedido: string;
  diagnostico: string;
  observaciones: string;
  tipoEstudio: string;
  lugar: string;
  doctor: string;
  realizado: boolean;
}
