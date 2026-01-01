export interface IPedidoInternacion {
  idEstudio: string;
  idMovimiento: string | null;

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
  urgente: string; //cambio a boolean proximo
  solicitante: string;
  servicio: string;

  sala: string;
  fechaHoraIngreso: string;

  comentario: string;
  nota: string;
}
