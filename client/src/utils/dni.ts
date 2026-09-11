export function dniAString(dni: unknown): string {
  if (dni == null) return "";
  const s = String(dni).trim();
  if (s === "") return "";
  return s;
}

export function formatearDni(dni: unknown): string {
  if (dni == null) return "S/D";
  const s = String(dni).trim();
  if (s === "") return "S/D";
  if (/^\d+$/.test(s)) return Number(s).toLocaleString("es-AR");
  return s;
}