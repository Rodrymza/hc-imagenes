export function obtenerDatosPacienteInternacion(paciente: any) {
  const apellidos = paciente?.apellidos?.trim() || "Sin apellido";
  const nombres = paciente?.nombres?.trim() || "Sin nombre";

  const dni = paciente?.dni || "";
  const dniString = dni ? dni.toString() : "Sin DNI";

  const hclinica = paciente?.numero?.toString() || "Sin HC";

  const sexo = paciente?.sexo || "No especificado";
  const edad = paciente?.edad?.toString() || "Sin edad";

  return {
    apellidos,
    nombres,
    dni,
    dniString,
    edad,
    sexo,
    hclinica,
  };
}
