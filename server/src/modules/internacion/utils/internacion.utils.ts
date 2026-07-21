export function obtenerSala(infoInternacion: any): string {
  const salaid = infoInternacion?.salaid || "Sin sala";
  const camaid = infoInternacion?.camaid || "Sin cama";

  if (salaid === "Sin sala" && camaid === "Sin cama") return "Sin internación";
  if (salaid === "Sin sala") return `Cama: ${parseInt(camaid)}`;
  if (camaid === "Sin cama") return `Sala: ${parseInt(salaid)}`;

  return `${parseInt(salaid)}-${parseInt(camaid)}`;
}

export function obtenerFechaHoraIngreso(infoInternacion: any): string {
  const fecha = infoInternacion?.ing_fecha_;
  const hora = infoInternacion?.ing_hora;

  if (!fecha) return "Sin fecha de ingreso";

  return hora ? `${fecha} ${hora.slice(0, 5)}` : fecha;
}
