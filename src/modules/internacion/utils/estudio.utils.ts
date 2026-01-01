export function obtenerTipoEstudio(detalle?: string): string {
  if (!detalle) return "Otro";
  const texto = detalle.toLowerCase();

  if (texto.includes("rx") || texto.includes("radiografia"))
    return "Radiografia";
  if (
    texto.includes("angio") ||
    texto.includes("angiotac") ||
    texto.includes("angiotomo")
  )
    return "Angiotomografia";
  if (texto.includes("tomo") || texto.includes("tac") || texto.includes("tc"))
    return "Tomografia";
  if (texto.includes("eco") || texto.includes("ecografia")) return "Ecografia";

  return "Otro";
}
