const SERVICIOS_CANONICOS: Record<string, string> = {
  "0002": "AISLAMIENTO",
  "0007": "CARDIOLOGIA",
  "0008": "CIRUGIA",
  "0013": "CARDIOLOGIA",
  "0014": "TORAX",
  "0016": "CLINICA MEDICA",
  "0023": "INFORMATICA MEDICA",
  "0028": "GINECOLOGIA",
  "0030": "VASCULAR PERIFERICO",
  "0038": "NEUROCIRUGIA",
  "0039": "SALUD MENTAL (INTERNACION)",
  "0046": "TRAUMATOLOGIA",
  "0047": "SERVICIO O.R.L.",
  "0058": "HOSPITAL DE 1 DIA",
  "0059": "URGENCIA DE CORTA ESTANCIA",
  "0066": "UROLOGIA",
  "0073": "TERAPIA INTENSIVA",
  "0089": "UNIDAD CORONARIA",
  "0098": "SERVICIO NEFROLOGIA",
  "8880": "TRASPLANTE MEDULA OSEA",
  "8887": "DPTO TRASPLANTE HEPATICO",
};

const ALIAS_POR_NOMBRE: Record<string, string> = {
  CARDIOVASCULAR: "CARDIOLOGIA",
};

const quitarTildes = (texto: string): string =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const claveNormalizada = (texto: string): string =>
  quitarTildes(texto).toUpperCase().trim();

/**
 * Normaliza el nombre de un servicio recibido como código ("0016 CLINICA MEDICA",
 * "0016") o como nombre libre ("Terapia intensiva", "CARDIOVASCULAR").
 * Devuelve solo el nombre canónico, sin código.
 */
export function normalizarServicio(valor?: string): string {
  if (!valor || typeof valor !== "string") return "";

  const limpio = valor.trim();
  if (!limpio) return "";

  const coincideCodigo = limpio.match(/^(\d{4})(\s+(.*))?$/);
  if (coincideCodigo) {
    const canonico = SERVICIOS_CANONICOS[coincideCodigo[1]];
    if (canonico) return canonico;
    return coincideCodigo[3]?.trim() || "";
  }

  const clave = claveNormalizada(limpio);
  const alias = ALIAS_POR_NOMBRE[clave];
  if (alias) return alias;

  const porNombre = Object.values(SERVICIOS_CANONICOS).find(
    (nombre) => claveNormalizada(nombre) === clave,
  );
  if (porNombre) return porNombre;

  return limpio;
}
