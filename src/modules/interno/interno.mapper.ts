import {
  IPacienteInterno,
  IPacienteInternoRaw,
  ICoberturaRaw,
} from "./interno.types";

/**
 * Convierte fecha formato "DD-MM-YYYY" a objeto Date JS
 */
const parseFechaArgentina = (fechaStr: string | null): Date | null => {
  if (!fechaStr) return null;
  const partes = fechaStr.split("-"); // [07, 09, 1991]
  if (partes.length !== 3) return null;

  // Mes en JS empieza en 0 (Enero=0), por eso restamos 1
  return new Date(
    parseInt(partes[2]),
    parseInt(partes[1]) - 1,
    parseInt(partes[0]),
  );
};

/**
 * Calcula edad precisa
 */
const calcularEdad = (fechaNac: Date): number => {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const m = hoy.getMonth() - fechaNac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }
  return edad;
};

export const cleanPacienteInterno = (
  raw: IPacienteInternoRaw,
): IPacienteInterno => {
  // 1. Manejo de Nombres
  const apellido = `${raw.apellido1 || ""} ${raw.apellido2 || ""}`.trim();
  const nombre = `${raw.nombre1 || ""} ${raw.nombre2 || ""}`.trim();

  // 2. Manejo de Fecha
  const fechaNac = parseFechaArgentina(raw.fechanacimiento);
  const edad = fechaNac ? calcularEdad(fechaNac) : 0;

  // 3. Manejo de Telefonos (Prioridad: Celular > Fijo > Otros)
  const telCelular = raw.telefonocelular
    ? `${raw.telefonocelularprefijo || ""}-${raw.telefonocelular}`
    : "";
  const telFijo = raw.telefonocasa
    ? `${raw.telefonocasaprefijo || ""}-${raw.telefonocasa}`
    : "";
  const telefonoFinal = telCelular || telFijo || "Sin teléfono";

  // 4. Manejo de Coberturas (Aseguramos que sea array)
  // El parser XML a veces devuelve objeto único si hay solo una, o array si hay varias.
  // Tu parser 'isArray' ya ayuda, pero por seguridad hacemos esto:
  let rawCoberturas: ICoberturaRaw[] = [];
  if (Array.isArray(raw.coberturas)) {
    rawCoberturas = raw.coberturas;
  } else if (raw.coberturas) {
    rawCoberturas = [raw.coberturas];
  }

  const coberturasClean = rawCoberturas.map((c) => ({
    nombre: c.nombre?.trim() || "Obra Social",
    sigla: c.sigla?.trim() || "",
    idCobertura: c.coberturaid || "idCobertura no encontrado",
    numeroCarnet: c.carnetnumero?.trim() || "S/N",
    tipo: c.tipobeneficiarionombre?.trim() || "Afiliado",
  }));

  return {
    idPaciente: raw.pacienteid,
    dni: raw.numerodocumento,
    apellidos: apellido,
    nombres: nombre,
    nombreCompleto: `${apellido}, ${nombre}`,
    fechaNacimiento: fechaNac,
    fechaNacimientoString: raw.fechanacimiento || "Sin datos", // Dejamos el string original para mostrar rápido
    edad: edad,
    sexo: raw.sexoid || "Desconocido",
    domicilio: `${raw.domicilio || ""}, ${raw.localidadnombre || ""}`.trim(),
    contacto: {
      telefono: telefonoFinal,
      email: raw.email || "Sin email",
    },
    coberturas: coberturasClean,
  };
};
