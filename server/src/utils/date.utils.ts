export function formatearFecha(
  fecha?: string | Date,
  incluirHora = false
): string {
  if (!fecha) return "Sin fecha";

  const fechaObj = new Date(fecha);
  if (isNaN(fechaObj.getTime())) return "Fecha inválida";

  const dia = fechaObj.getDate().toString().padStart(2, "0");
  const mes = (fechaObj.getMonth() + 1).toString().padStart(2, "0");
  const anio = fechaObj.getFullYear();

  let resultado = `${dia}/${mes}/${anio}`;

  if (incluirHora) {
    const horas = fechaObj.getHours().toString().padStart(2, "0");
    const minutos = fechaObj.getMinutes().toString().padStart(2, "0");
    resultado += ` ${horas}:${minutos}`;
  }

  return resultado;
}
