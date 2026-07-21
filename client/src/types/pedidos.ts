export interface IPedidoInternacion {
  idEstudio: string;
  idMovimiento: string | null; // Si es null, asumimos que está Pendiente

  apellidos: string;
  nombres: string;
  dni: string;
  dniString: string;
  fechaNacimiento: string;
  edad: string;
  sexo: string;
  hclinica: string;

  fecha: string;
  fechaIso: string;
  diagnostico: string;
  tipoEstudio: string;
  solicitud: string;
  lugar: string;
  urgente: string; // "SI" o "NO" por ahora
  solicitante: string;
  servicio: string;

  sala: string;
  fechaHoraIngreso: string;

  comentario: string;
  nota: string;
}

export interface IEnvioComentario {
  idEstudio: string;
  idMovimiento: string | null;
  comentario: string;
  nota: string;
}

export interface IPedidoGuardia {
  idEstudio: number | string;
  fecha: Date | null;
  fechaString: string;
  solicitud: string;
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
