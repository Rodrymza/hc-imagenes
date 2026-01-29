import { IHsiDate, IHsiTime } from "./guardia.types";

export function crearFecha(
  date?: IHsiDate,
  time: IHsiTime | null = null,
): Date | null {
  if (!date || !date.year || !date.month || !date.day) return null;

  let { hours, minutes } = time || { hours: 0, minutes: 0 };
  let diaAjustado = date.day;

  if (time !== null) {
    const diferenciaHoraria = 3; // GMT-3 (Mendoza)
    if (hours < diferenciaHoraria) {
      diaAjustado -= 1;
    }
    hours = (hours - diferenciaHoraria + 24) % 24;
  }

  return new Date(date.year, date.month - 1, diaAjustado, hours, minutes, 0);
}

export function definirTipoEstudio(descripcion: string): string {
  const texto = descripcion.toLowerCase();
  if (/tomo|tac|tc/.test(texto)) return "Tomografia";
  if (/rx|radiogra|radio/.test(texto)) return "Radiografia";
  if (/eco|ecogra/.test(texto)) return "Ecografia";
  return "Otros";
}

export function calcularEdad(dia: number, mes: number, anio: number): number {
  const hoy = new Date();
  let edad = hoy.getFullYear() - anio;
  const m = hoy.getMonth() - (mes - 1);
  if (m < 0 || (m === 0 && hoy.getDate() < dia)) {
    edad--;
  }
  return edad;
}
