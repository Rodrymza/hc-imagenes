export interface IPacienteGuardia {
  idPatient: number;
  historiaClinica: number;
  dni: string;
  dniString: string;
  apellido: string;
  nombres: string;
  fechaNacimiento: Date | null;
  fechaNacimientoString: string;
  edad: number;
}
